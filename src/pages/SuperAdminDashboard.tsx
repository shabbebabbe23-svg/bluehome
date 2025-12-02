import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Building2, Plus, Users, Home, Activity, Clock, CheckCircle, XCircle, Edit, UserPlus, TrendingUp, Award, Trash2, Pencil, Power, Copy, Link as LinkIcon } from "lucide-react";
import Header from "@/components/Header";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface Agency {
  id: string;
  name: string;
  email_domain: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  admin_email?: string;
  admin_name?: string;
  admin_id?: string;
}

interface AgencyStats {
  agency_id: string;
  agent_count: number;
  property_count: number;
}

interface ActivityLog {
  id: string;
  action_type: string;
  actor_id: string | null;
  target_id: string | null;
  target_type: string | null;
  description: string;
  metadata: any;
  created_at: string;
}

interface AgencySalesStats {
  agency_id: string;
  agency_name: string;
  sales_count: number;
}

interface AgentSalesStats {
  agent_id: string;
  agent_name: string;
  agency_name: string;
  sales_count: number;
}

interface AgencyUser {
  id: string;
  full_name: string;
  email: string;
  user_roles?: { user_type: string }[];
  propertyCount?: number;
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agencyStats, setAgencyStats] = useState<Record<string, AgencyStats>>({});
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [agencySalesStats, setAgencySalesStats] = useState<AgencySalesStats[]>([]);
  const [agentSalesStats, setAgentSalesStats] = useState<AgentSalesStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [agencyUsers, setAgencyUsers] = useState<AgencyUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AgencyUser | null>(null);
  const [createdInvitationLink, setCreatedInvitationLink] = useState<string | null>(null);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [deletingAgency, setDeletingAgency] = useState<Agency | null>(null);
  const [newAgency, setNewAgency] = useState({
    name: "",
    email_domain: "",
    admin_email: "",
    admin_name: "",
  });

  useEffect(() => {
    checkSuperAdminAccess();
  }, []);

  const checkSuperAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/login");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("user_type")
      .eq("user_id", user.id)
      .single();

    if (roleData?.user_type !== "superadmin") {
      toast({
        title: "Åtkomst nekad",
        description: "Du har inte behörighet att komma åt denna sida.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    fetchAgencies();
    fetchActivityLogs();
    fetchSalesStats();
  };

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setActivityLogs(data || []);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  };

  const fetchSalesStats = async () => {
    try {
      // Hämta alla sålda fastigheter med mäklare och byrå-information
      const { data: soldProperties, error } = await supabase
        .from("properties")
        .select(`
          id,
          user_id,
          profiles!inner(
            id,
            full_name,
            agency_id,
            agencies!inner(
              id,
              name
            )
          )
        `)
        .eq("is_sold", true);

      if (error) throw error;

      // Gruppera per byrå
      const agencySales = new Map<string, { name: string; count: number }>();
      // Gruppera per mäklare
      const agentSales = new Map<string, { name: string; agency_name: string; count: number }>();

      soldProperties?.forEach((property: any) => {
        const profile = property.profiles;
        if (profile && profile.agencies) {
          const agencyId = profile.agencies.id;
          const agencyName = profile.agencies.name;
          const agentId = profile.id;
          const agentName = profile.full_name || "Okänd mäklare";

          // Räkna per byrå
          const currentAgency = agencySales.get(agencyId) || { name: agencyName, count: 0 };
          agencySales.set(agencyId, { ...currentAgency, count: currentAgency.count + 1 });

          // Räkna per mäklare
          const currentAgent = agentSales.get(agentId) || { name: agentName, agency_name: agencyName, count: 0 };
          agentSales.set(agentId, { ...currentAgent, count: currentAgent.count + 1 });
        }
      });

      // Konvertera till array och sortera
      const agencyStatsArray: AgencySalesStats[] = Array.from(agencySales.entries()).map(
        ([id, data]) => ({
          agency_id: id,
          agency_name: data.name,
          sales_count: data.count,
        })
      ).sort((a, b) => b.sales_count - a.sales_count);

      const agentStatsArray: AgentSalesStats[] = Array.from(agentSales.entries()).map(
        ([id, data]) => ({
          agent_id: id,
          agent_name: data.name,
          agency_name: data.agency_name,
          sales_count: data.count,
        })
      ).sort((a, b) => b.sales_count - a.sales_count);

      setAgencySalesStats(agencyStatsArray);
      setAgentSalesStats(agentStatsArray);
    } catch (error) {
      console.error("Error fetching sales stats:", error);
    }
  };

  const logActivity = async (
    actionType: string,
    description: string,
    targetId: string | null = null,
    targetType: string | null = null,
    metadata: any = {}
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from("activity_logs").insert({
        action_type: actionType,
        actor_id: user?.id || null,
        target_id: targetId,
        target_type: targetType,
        description,
        metadata,
      });

      fetchActivityLogs();
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case "agency_created":
        return <Plus className="w-5 h-5 text-green-500" />;
      case "agency_status_changed":
        return <Edit className="w-5 h-5 text-blue-500" />;
      case "agency_updated":
        return <Pencil className="w-5 h-5 text-blue-500" />;
      case "agency_deleted":
        return <Trash2 className="w-5 h-5 text-red-500" />;
      case "invitation_sent":
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const { data: agenciesData, error } = await supabase
        .from("agencies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Hämta admin-info för varje byrå
      const agenciesWithAdmin = await Promise.all(
        (agenciesData || []).map(async (agency) => {
          const { data: adminProfile } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .eq("agency_id", agency.id)
            .limit(1)
            .single();

          const { data: adminRole } = await supabase
            .from("user_roles")
            .select("user_type")
            .eq("user_id", adminProfile?.id)
            .eq("user_type", "agency_admin")
            .single();

          if (adminProfile && adminRole) {
            return {
              ...agency,
              admin_email: adminProfile.email,
              admin_name: adminProfile.full_name,
              admin_id: adminProfile.id,
            };
          }
          
          return agency;
        })
      );

      setAgencies(agenciesWithAdmin);

      // Fetch stats för varje byrå
      const statsPromises = (agenciesData || []).map(async (agency) => {
        const [agentResult, propertyResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .eq("agency_id", agency.id),
          supabase
            .from("properties")
            .select("id", { count: "exact" })
            .eq("is_deleted", false)
            .in("user_id", 
              await supabase
                .from("profiles")
                .select("id")
                .eq("agency_id", agency.id)
                .then(r => (r.data || []).map(p => p.id))
            )
        ]);

        return {
          agency_id: agency.id,
          agent_count: agentResult.count || 0,
          property_count: propertyResult.count || 0,
        };
      });

      const stats = await Promise.all(statsPromises);
      const statsMap = stats.reduce((acc, stat) => {
        acc[stat.agency_id] = stat;
        return acc;
      }, {} as Record<string, AgencyStats>);

      setAgencyStats(statsMap);
    } catch (error) {
      console.error("Error fetching agencies:", error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta mäklarbyråer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAgency.name || !newAgency.email_domain || !newAgency.admin_email || !newAgency.admin_name) {
      toast({
        title: "Ofullständig information",
        description: "Fyll i alla fält.",
        variant: "destructive",
      });
      return;
    }

    // Validera email-domän format
    if (!newAgency.email_domain.match(/^[a-z0-9.-]+\.[a-z]{2,}$/)) {
      toast({
        title: "Ogiltigt format",
        description: "Email-domänen måste vara i format: example.se",
        variant: "destructive",
      });
      return;
    }

    try {
      // Skapa byrån
      const { data: agency, error: agencyError } = await supabase
        .from("agencies")
        .insert({
          name: newAgency.name,
          email_domain: newAgency.email_domain,
        })
        .select()
        .single();

      if (agencyError) throw agencyError;

      // Skapa inbjudan för byrå-admin
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 dagars giltighet

      const { error: invitationError } = await supabase
        .from("agency_invitations")
        .insert({
          agency_id: agency.id,
          email: newAgency.admin_email,
          role: "agency_admin",
          token: token,
          expires_at: expiresAt.toISOString(),
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (invitationError) throw invitationError;

      // Skapa inbjudningslänk
      const invitationUrl = `${window.location.origin}/acceptera-inbjudan?token=${token}`;
      setCreatedInvitationLink(invitationUrl);

      await logActivity(
        "agency_created",
        `Byrån "${newAgency.name}" skapades med inbjudan till ${newAgency.admin_email}`,
        agency.id,
        "agency"
      );

      toast({
        title: "Byrå skapad!",
        description: "Kopiera inbjudningslänken nedan och skicka den till byrå-chefen.",
      });

      fetchAgencies();
    } catch (error: any) {
      console.error("Error creating agency:", error);
      toast({
        title: "Fel",
        description: error.message || "Kunde inte skapa byrå.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Kopierat!",
        description: "Länken har kopierats till urklipp.",
      });
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte kopiera länken. Försök igen.",
        variant: "destructive",
      });
    }
  };

  const toggleAgencyStatus = async (agencyId: string, currentStatus: boolean) => {
    try {
      const agency = agencies.find(a => a.id === agencyId);
      const { error } = await supabase
        .from("agencies")
        .update({ is_active: !currentStatus })
        .eq("id", agencyId);

      if (error) throw error;

      toast({
        title: "Status uppdaterad",
        description: `Byrån är nu ${!currentStatus ? "aktiv" : "inaktiv"}.`,
      });

      await logActivity(
        "agency_status_changed",
        `Byrån "${agency?.name}" ${!currentStatus ? "aktiverades" : "inaktiverades"}`,
        agencyId,
        "agency"
      );

      fetchAgencies();
    } catch (error) {
      console.error("Error toggling agency status:", error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera status.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAgency = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingAgency) return;

    try {
      // Uppdatera byrå-info
      const { error: agencyError } = await supabase
        .from("agencies")
        .update({
          name: editingAgency.name,
          email_domain: editingAgency.email_domain,
          logo_url: editingAgency.logo_url,
        })
        .eq("id", editingAgency.id);

      if (agencyError) throw agencyError;

      // Uppdatera admin-profil om admin_id finns
      if (editingAgency.admin_id && (editingAgency.admin_email || editingAgency.admin_name)) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            email: editingAgency.admin_email,
            full_name: editingAgency.admin_name,
          })
          .eq("id", editingAgency.admin_id);

        if (profileError) throw profileError;
      }

      toast({
        title: "Byrå uppdaterad",
        description: `${editingAgency.name} har uppdaterats.`,
      });

      await logActivity(
        "agency_updated",
        `Byrån "${editingAgency.name}" uppdaterades`,
        editingAgency.id,
        "agency"
      );

      setIsEditDialogOpen(false);
      setEditingAgency(null);
      fetchAgencies();
    } catch (error: any) {
      console.error("Error updating agency:", error);
      toast({
        title: "Fel",
        description: error.message || "Kunde inte uppdatera byrå.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAgency = async () => {
    if (!deletingAgency) return;

    try {
      const stats = agencyStats[deletingAgency.id];
      const agentCount = stats?.agent_count || 0;
      const propertyCount = stats?.property_count || 0;

      // 1. Hämta alla användare i byrån
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id")
        .eq("agency_id", deletingAgency.id);

      if (usersError) throw usersError;

      const userIds = users?.map(u => u.id) || [];

      // 2. Radera alla fastigheter från dessa användare (om det finns några)
      if (userIds.length > 0) {
        const { error: propertiesError } = await supabase
          .from("properties")
          .delete()
          .in("user_id", userIds);

        if (propertiesError) throw propertiesError;

        // 3. Radera user_roles
        const { error: rolesError } = await supabase
          .from("user_roles")
          .delete()
          .in("user_id", userIds);

        if (rolesError) throw rolesError;

        // 4. Radera profiles
        const { error: profilesError } = await supabase
          .from("profiles")
          .delete()
          .eq("agency_id", deletingAgency.id);

        if (profilesError) throw profilesError;
      }

      // 5. Radera inbjudningar
      const { error: invitationsError } = await supabase
        .from("agency_invitations")
        .delete()
        .eq("agency_id", deletingAgency.id);

      if (invitationsError) throw invitationsError;

      // 6. Radera byrån
      const { error: agencyError } = await supabase
        .from("agencies")
        .delete()
        .eq("id", deletingAgency.id);

      if (agencyError) throw agencyError;

      toast({
        title: "Byrå permanent raderad",
        description: `${deletingAgency.name} och alla associerade data har raderats permanent.`,
      });

      await logActivity(
        "agency_deleted",
        `Byrån "${deletingAgency.name}" raderades med ${agentCount} mäklare och ${propertyCount} objekt`,
        deletingAgency.id,
        "agency",
        {
          deleted_agents: agentCount,
          deleted_properties: propertyCount,
          user_ids: userIds,
        }
      );

      setIsDeleteDialogOpen(false);
      setDeletingAgency(null);
      fetchAgencies();
    } catch (error: any) {
      console.error("Error deleting agency:", error);
      toast({
        title: "Fel vid radering",
        description: error.message || "Kunde inte radera byrå.",
        variant: "destructive",
      });
    }
  };

  const fetchAgencyUsers = async (agencyId: string) => {
    setLoadingUsers(true);
    try {
      // Hämta profiler
      const { data: usersData, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("agency_id", agencyId);

      if (error) throw error;

      if (usersData) {
        // Hämta roller separat för varje användare
        const usersWithRolesAndCounts = await Promise.all(
          usersData.map(async (user) => {
            // Hämta roll
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("user_type")
              .eq("user_id", user.id)
              .single();
            
            // Hämta antal fastigheter
            const { count } = await supabase
              .from("properties")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)
              .eq("is_deleted", false);
            
            return { 
              ...user, 
              user_roles: roleData ? [{ user_type: roleData.user_type }] : [],
              propertyCount: count || 0 
            };
          })
        );
        setAgencyUsers(usersWithRolesAndCounts as any);
      }
    } catch (error) {
      console.error("Error fetching agency users:", error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta användare.",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleShowUsers = (agency: Agency) => {
    setSelectedAgency(agency);
    setIsUsersDialogOpen(true);
    fetchAgencyUsers(agency.id);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      // Ta bort användarens fastigheter
      const { error: propertiesError } = await supabase
        .from("properties")
        .delete()
        .eq("user_id", deletingUser.id);

      if (propertiesError) throw propertiesError;

      // Ta bort användarens roller
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", deletingUser.id);

      if (rolesError) throw rolesError;

      // Ta bort användarens profil
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deletingUser.id);

      if (profileError) throw profileError;

      toast({
        title: "Användare borttagen",
        description: `${deletingUser.full_name} har tagits bort permanent.`,
      });

      // Uppdatera användarlistan
      if (selectedAgency) {
        fetchAgencyUsers(selectedAgency.id);
      }

      setIsDeleteUserDialogOpen(false);
      setDeletingUser(null);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Fel",
        description: error.message || "Kunde inte ta bort användaren.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-hero-gradient bg-clip-text text-transparent">
              Superadmin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Hantera mäklarbyråer och deras konton
            </p>
          </div>

          <Button
            size="lg"
            className="gap-2 w-full sm:w-auto bg-gradient-to-r from-[hsl(200,98%,35%)] to-[hsl(142,76%,30%)] hover:opacity-90 transition-opacity text-white border-0"
            onClick={() => navigate("/skapa-byra-manuellt")}
          >
            <Plus className="w-4 h-4" />
            Skapa ny byrå manuellt
          </Button>

          {/* Edit Agency Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Redigera mäklarbyrå</DialogTitle>
                <DialogDescription>
                  Uppdatera information om byrån.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateAgency} className="space-y-4">
                <div>
                  <Label htmlFor="edit_name">Byrånamn *</Label>
                  <Input
                    id="edit_name"
                    placeholder="Mäklarringen"
                    value={editingAgency?.name || ""}
                    onChange={(e) => setEditingAgency(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_email_domain">Email-domän *</Label>
                  <Input
                    id="edit_email_domain"
                    placeholder="maklarringen.se"
                    value={editingAgency?.email_domain || ""}
                    onChange={(e) => setEditingAgency(prev => prev ? { ...prev, email_domain: e.target.value } : null)}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Endast domännamn, t.ex. "maklarringen.se" (utan @)
                  </p>
                </div>
                <div>
                  <Label htmlFor="edit_logo_url">Logotyp URL</Label>
                  <Input
                    id="edit_logo_url"
                    placeholder="https://exempel.se/logo.png"
                    value={editingAgency?.logo_url || ""}
                    onChange={(e) => setEditingAgency(prev => prev ? { ...prev, logo_url: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_admin_name">Byrå-chefens namn</Label>
                  <Input
                    id="edit_admin_name"
                    placeholder="Anna Andersson"
                    value={editingAgency?.admin_name || ""}
                    onChange={(e) => setEditingAgency(prev => prev ? { ...prev, admin_name: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_admin_email">Byrå-chefens email</Label>
                  <Input
                    id="edit_admin_email"
                    type="email"
                    placeholder="anna@maklarringen.se"
                    value={editingAgency?.admin_email || ""}
                    onChange={(e) => setEditingAgency(prev => prev ? { ...prev, admin_email: e.target.value } : null)}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Avbryt
                  </Button>
                  <Button type="submit">
                    Spara ändringar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>⚠️ PERMANENT RADERING</AlertDialogTitle>
                <AlertDialogDescription>
                  Är du säker på att du vill <strong className="text-red-600">PERMANENT RADERA</strong> byrån <strong>{deletingAgency?.name}</strong>?
                  
                  {deletingAgency && agencyStats[deletingAgency.id] && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-md space-y-3">
                      <p className="text-red-800 dark:text-red-200 font-bold text-sm">
                        🚨 Detta kommer att PERMANENT radera:
                      </p>
                      <ul className="text-red-700 dark:text-red-300 text-sm space-y-1 ml-4">
                        <li>• Byrån "{deletingAgency.name}"</li>
                        <li>• {agencyStats[deletingAgency.id].agent_count} {agencyStats[deletingAgency.id].agent_count === 1 ? "mäklare" : "mäklare"}</li>
                        <li>• {agencyStats[deletingAgency.id].property_count} {agencyStats[deletingAgency.id].property_count === 1 ? "fastighet" : "fastigheter"}</li>
                        <li>• Alla användarkonton och deras data</li>
                        <li>• Alla inbjudningar</li>
                      </ul>
                      <p className="text-red-900 dark:text-red-100 font-bold text-sm mt-3">
                        ⛔ Denna åtgärd kan INTE ångras!
                      </p>
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAgency}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Radera
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete User Confirmation Dialog */}
          <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  Radera användare permanent?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    Du är på väg att permanent ta bort användaren{" "}
                    <span className="font-semibold">{deletingUser?.full_name}</span> ({deletingUser?.email}).
                  </p>
                  <p className="text-destructive font-medium">
                    ⚠️ Detta kommer att permanent radera:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Användarens profil</li>
                    <li>Alla användarens fastigheter ({deletingUser?.propertyCount || 0} objekt)</li>
                    <li>Användarens roller och behörigheter</li>
                  </ul>
                  <p className="font-semibold">Denna åtgärd kan inte ångras!</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUser}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Radera permanent
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Agency Users Dialog */}
          <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Användare i {selectedAgency?.name}
                </DialogTitle>
                <DialogDescription>
                  Alla mäklare och administratörer som tillhör denna byrå
                </DialogDescription>
              </DialogHeader>
              
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : agencyUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Inga användare hittades i denna byrå.
                </div>
              ) : (
                <div className="space-y-3">
                  {agencyUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{user.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex gap-3 mt-2 text-sm">
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
                              {user.user_roles?.[0]?.user_type === "agency_admin" ? "Byrå-admin" : 
                               user.user_roles?.[0]?.user_type === "maklare" ? "Mäklare" : 
                               user.user_roles?.[0]?.user_type || "Användare"}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Home className="w-4 h-4" />
                              {user.propertyCount || 0} objekt
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeletingUser(user);
                            setIsDeleteUserDialogOpen(true);
                          }}
                          className="gap-2 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Radera</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totalt Byråer</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agencies.length}</div>
              <p className="text-xs text-muted-foreground">
                {agencies.filter(a => a.is_active).length} aktiva
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totalt Mäklare</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(agencyStats).reduce((sum, stat) => sum + stat.agent_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Över alla byråer</p>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totalt Objekt</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(agencyStats).reduce((sum, stat) => sum + stat.property_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Aktiva fastigheter</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Agencies, Statistics and Activity Log */}
        <Tabs defaultValue="agencies" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
            <TabsTrigger value="agencies">Byråer</TabsTrigger>
            <TabsTrigger value="statistics">Statistik</TabsTrigger>
            <TabsTrigger value="activity">Aktivitetslogg</TabsTrigger>
          </TabsList>

          <TabsContent value="agencies">
            <Card>
              <CardHeader>
                <CardTitle>Mäklarbyråer</CardTitle>
                <CardDescription>Hantera och övervaka alla anslutna byråer</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Laddar...</div>
                ) : agencies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Inga byråer har skapats än. Klicka på "Lägg till byrå" för att komma igång.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agencies.map((agency) => (
                      <div
                        key={agency.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base sm:text-lg">{agency.name}</h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                agency.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {agency.is_active ? "Aktiv" : "Inaktiv"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            @{agency.email_domain}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm flex-wrap">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {agencyStats[agency.id]?.agent_count || 0} mäklare
                            </span>
                            <span className="flex items-center gap-1">
                              <Home className="w-4 h-4" />
                              {agencyStats[agency.id]?.property_count || 0} objekt
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowUsers(agency)}
                            className="gap-2 hover:bg-gradient-to-r hover:from-[hsl(200,98%,35%)] hover:to-[hsl(142,76%,30%)] hover:text-white hover:border-transparent transition-all"
                          >
                            <Users className="w-4 h-4" />
                            Visa användare
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingAgency(agency);
                              setIsEditDialogOpen(true);
                            }}
                            className="gap-2 hover:bg-gradient-to-r hover:from-[hsl(200,98%,35%)] hover:to-[hsl(142,76%,30%)] hover:text-white hover:border-transparent transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                            Redigera
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAgencyStatus(agency.id, agency.is_active)}
                            className="gap-2"
                          >
                            <Power className="w-4 h-4" />
                            {agency.is_active ? "Inaktivera" : "Aktivera"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeletingAgency(agency);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Radera
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Agencies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Topplista Byråer
                  </CardTitle>
                  <CardDescription>Byråer med flest sålda fastigheter</CardDescription>
                </CardHeader>
                <CardContent>
                  {agencySalesStats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Ingen försäljningsdata tillgänglig än.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {agencySalesStats.map((agency, index) => (
                        <div
                          key={agency.agency_id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-accent/5 border"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(200,98%,35%)] to-[hsl(142,76%,30%)] text-white font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{agency.agency_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {agency.sales_count} {agency.sales_count === 1 ? "såld fastighet" : "sålda fastigheter"}
                            </p>
                          </div>
                          {index === 0 && (
                            <Award className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Agents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Topplista Mäklare
                  </CardTitle>
                  <CardDescription>Mäklare med flest sålda fastigheter</CardDescription>
                </CardHeader>
                <CardContent>
                  {agentSalesStats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Ingen försäljningsdata tillgänglig än.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {agentSalesStats.map((agent, index) => (
                        <div
                          key={agent.agent_id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-accent/5 border"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(200,98%,35%)] to-[hsl(142,76%,30%)] text-white font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{agent.agent_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{agent.agency_name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {agent.sales_count} {agent.sales_count === 1 ? "såld fastighet" : "sålda fastigheter"}
                            </p>
                          </div>
                          {index === 0 && (
                            <Award className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Aktivitetslogg</CardTitle>
                <CardDescription>Senaste aktiviteterna i systemet</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Inga aktiviteter att visa än.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <div className="mt-1">{getActivityIcon(log.action_type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{log.description}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(new Date(log.created_at), "d MMM yyyy 'kl.' HH:mm", { locale: sv })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
