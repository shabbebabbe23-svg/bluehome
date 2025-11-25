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

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  agency_id: string;
  created_at: string;
  agency_name?: string;
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agencyStats, setAgencyStats] = useState<Record<string, AgencyStats>>({});
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [agencySalesStats, setAgencySalesStats] = useState<AgencySalesStats[]>([]);
  const [agentSalesStats, setAgentSalesStats] = useState<AgentSalesStats[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
    fetchPendingInvitations();
  };

  const fetchPendingInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from("agency_invitations")
        .select("*, agencies(name)")
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const invitationsWithAgencyName = (data || []).map((inv: any) => ({
        ...inv,
        agency_name: inv.agencies?.name,
      }));

      setPendingInvitations(invitationsWithAgencyName);
    } catch (error) {
      console.error("Error fetching pending invitations:", error);
    }
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
      fetchPendingInvitations();
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

  const deleteInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("agency_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Inbjudan raderad",
        description: "Inbjudan har tagits bort.",
      });

      fetchPendingInvitations();
    } catch (error) {
      console.error("Error deleting invitation:", error);
      toast({
        title: "Fel",
        description: "Kunde inte radera inbjudan.",
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
      
      if (stats && (stats.agent_count > 0 || stats.property_count > 0)) {
        toast({
          title: "Kan inte radera byrå",
          description: `Byrån har ${stats.agent_count} mäklare och ${stats.property_count} objekt. Ta bort dessa först.`,
          variant: "destructive",
        });
        setIsDeleteDialogOpen(false);
        setDeletingAgency(null);
        return;
      }

      const { error } = await supabase
        .from("agencies")
        .delete()
        .eq("id", deletingAgency.id);

      if (error) throw error;

      toast({
        title: "Byrå raderad",
        description: `${deletingAgency.name} har raderats.`,
      });

      await logActivity(
        "agency_deleted",
        `Byrån "${deletingAgency.name}" raderades`,
        deletingAgency.id,
        "agency"
      );

      setIsDeleteDialogOpen(false);
      setDeletingAgency(null);
      fetchAgencies();
    } catch (error: any) {
      console.error("Error deleting agency:", error);
      toast({
        title: "Fel",
        description: error.message || "Kunde inte radera byrå.",
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="gap-2 w-full sm:w-auto bg-gradient-to-r from-[hsl(200,98%,35%)] to-[hsl(142,76%,30%)] hover:opacity-90 transition-opacity text-white border-0"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Lägg till byrå</span>
                <span className="xs:hidden">Ny byrå</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Skapa ny mäklarbyrå</DialogTitle>
                <DialogDescription>
                  Fyll i information om byrån och dess chef. Du får en länk som du kan dela med byrå-chefen.
                </DialogDescription>
              </DialogHeader>
              
              {createdInvitationLink ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-primary" />
                      <p className="font-medium">Inbjudningslänk skapad!</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Kopiera länken nedan och skicka den till byrå-chefen:
                    </p>
                    <div className="flex gap-2">
                      <Input 
                        value={createdInvitationLink} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        onClick={() => copyToClipboard(createdInvitationLink)}
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Kopiera
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    onClick={() => {
                      setCreatedInvitationLink(null);
                      setIsDialogOpen(false);
                      setNewAgency({ name: "", email_domain: "", admin_email: "", admin_name: "" });
                    }}
                    className="w-full"
                  >
                    Stäng
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreateAgency} className="space-y-4">
                <div>
                  <Label htmlFor="name">Byrånamn *</Label>
                  <Input
                    id="name"
                    placeholder="Mäklarringen"
                    value={newAgency.name}
                    onChange={(e) => setNewAgency({ ...newAgency, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email_domain">Email-domän *</Label>
                  <Input
                    id="email_domain"
                    placeholder="maklarringen.se"
                    value={newAgency.email_domain}
                    onChange={(e) => setNewAgency({ ...newAgency, email_domain: e.target.value })}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Endast domännamn, t.ex. "maklarringen.se" (utan @)
                  </p>
                </div>
                <div>
                  <Label htmlFor="admin_name">Byrå-chefens namn *</Label>
                  <Input
                    id="admin_name"
                    placeholder="Anna Andersson"
                    value={newAgency.admin_name}
                    onChange={(e) => setNewAgency({ ...newAgency, admin_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="admin_email">Byrå-chefens email *</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    placeholder="anna@maklarringen.se"
                    value={newAgency.admin_email}
                    onChange={(e) => setNewAgency({ ...newAgency, admin_email: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Avbryt
                  </Button>
                  <Button type="submit">
                    Skapa byrå & generera länk
                  </Button>
                </div>
              </form>
              )}
            </DialogContent>
          </Dialog>

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
                <AlertDialogTitle>Radera mäklarbyrå?</AlertDialogTitle>
                <AlertDialogDescription>
                  Är du säker på att du vill radera <strong>{deletingAgency?.name}</strong>?
                  <br /><br />
                  Detta kommer att ta bort byrån permanent. Denna åtgärd kan inte ångras.
                  {deletingAgency && agencyStats[deletingAgency.id] && (
                    agencyStats[deletingAgency.id].agent_count > 0 || agencyStats[deletingAgency.id].property_count > 0
                  ) && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-800 text-sm font-medium">
                        ⚠️ Byrån har {agencyStats[deletingAgency.id].agent_count} mäklare och {agencyStats[deletingAgency.id].property_count} objekt.
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

        {/* Tabs for Agencies, Statistics, Invitations and Activity Log */}
        <Tabs defaultValue="agencies" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-[800px]">
            <TabsTrigger value="agencies">Byråer</TabsTrigger>
            <TabsTrigger value="invitations">Inbjudningar</TabsTrigger>
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

          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Väntande inbjudningar</CardTitle>
                <CardDescription>Hantera inbjudningar som ännu inte har accepterats</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingInvitations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Inga väntande inbjudningar.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingInvitations.map((invitation) => {
                      const invitationUrl = `${window.location.origin}/acceptera-inbjudan?token=${invitation.token}`;
                      const expiresDate = new Date(invitation.expires_at);
                      
                      return (
                        <div
                          key={invitation.id}
                          className="p-4 border rounded-lg space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{invitation.email}</h3>
                                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                  {invitation.role === "agency_admin" ? "Byrå-admin" : "Mäklare"}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {invitation.agency_name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Går ut: {format(expiresDate, "PPP 'kl.' HH:mm", { locale: sv })}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteInvitation(invitation.id)}
                              className="gap-2 w-full sm:w-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                              Radera
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Input 
                              value={invitationUrl} 
                              readOnly 
                              className="font-mono text-xs sm:text-sm"
                            />
                            <Button
                              onClick={() => copyToClipboard(invitationUrl)}
                              className="gap-2 shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                              <span className="hidden xs:inline">Kopiera</span>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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
