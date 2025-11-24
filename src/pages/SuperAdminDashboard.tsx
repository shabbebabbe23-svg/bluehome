import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Building2, Plus, Users, Home, Search, Filter, Edit, Trash2, Download, Mail, Eye, BarChart3, TrendingUp, Activity } from "lucide-react";
import Header from "@/components/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";

interface Agency {
  id: string;
  name: string;
  email_domain: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface AgencyStats {
  agency_id: string;
  agent_count: number;
  property_count: number;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  agency_id: string | null;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  created_at: string;
}

const COLORS = ['hsl(200, 98%, 35%)', 'hsl(142, 76%, 30%)', 'hsl(280, 70%, 45%)', 'hsl(20, 90%, 50%)'];

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);
  const [agencyStats, setAgencyStats] = useState<Record<string, AgencyStats>>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [agencyToDelete, setAgencyToDelete] = useState<Agency | null>(null);
  const [agencyProfiles, setAgencyProfiles] = useState<Profile[]>([]);
  const [agencyProperties, setAgencyProperties] = useState<Property[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name" | "agents" | "properties" | "date">("date");
  const [newAgency, setNewAgency] = useState({
    name: "",
    email_domain: "",
    admin_email: "",
    admin_name: "",
  });
  const [editAgency, setEditAgency] = useState({
    name: "",
    email_domain: "",
    logo_url: "",
  });

  useEffect(() => {
    checkSuperAdminAccess();
  }, []);

  useEffect(() => {
    filterAndSortAgencies();
  }, [agencies, searchQuery, filterStatus, sortBy]);

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
    fetchInvitations();
  };

  const filterAndSortAgencies = () => {
    let filtered = [...agencies];

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.email_domain.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((a) =>
        filterStatus === "active" ? a.is_active : !a.is_active
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "agents":
          return (agencyStats[b.id]?.agent_count || 0) - (agencyStats[a.id]?.agent_count || 0);
        case "properties":
          return (agencyStats[b.id]?.property_count || 0) - (agencyStats[a.id]?.property_count || 0);
        case "date":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredAgencies(filtered);
  };

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const { data: agenciesData, error } = await supabase
        .from("agencies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAgencies(agenciesData || []);

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

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from("agency_invitations")
        .select("*")
        .is("used_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  const fetchAgencyDetails = async (agencyId: string) => {
    try {
      const [profilesResult, propertiesResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("agency_id", agencyId),
        supabase
          .from("properties")
          .select("*")
          .eq("is_deleted", false)
          .in(
            "user_id",
            await supabase
              .from("profiles")
              .select("id")
              .eq("agency_id", agencyId)
              .then((r) => (r.data || []).map((p) => p.id))
          )
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      setAgencyProfiles(profilesResult.data || []);
      setAgencyProperties(propertiesResult.data || []);
    } catch (error) {
      console.error("Error fetching agency details:", error);
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

      // Skicka inbjudan via edge function
      await supabase.functions.invoke("send-agency-invitation", {
        body: {
          email: newAgency.admin_email,
          name: newAgency.admin_name,
          agency_name: newAgency.name,
          token: token,
        },
      });

      toast({
        title: "Byrå skapad!",
        description: `${newAgency.name} har skapats och inbjudan skickad till ${newAgency.admin_email}`,
      });

      setIsDialogOpen(false);
      setNewAgency({ name: "", email_domain: "", admin_email: "", admin_name: "" });
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

  const handleEditAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgency) return;

    try {
      const { error } = await supabase
        .from("agencies")
        .update({
          name: editAgency.name,
          email_domain: editAgency.email_domain,
          logo_url: editAgency.logo_url || null,
        })
        .eq("id", selectedAgency.id);

      if (error) throw error;

      toast({
        title: "Byrå uppdaterad",
        description: "Byråinformationen har uppdaterats.",
      });

      setIsEditDialogOpen(false);
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
    if (!agencyToDelete) return;

    try {
      const { error } = await supabase
        .from("agencies")
        .delete()
        .eq("id", agencyToDelete.id);

      if (error) throw error;

      toast({
        title: "Byrå borttagen",
        description: `${agencyToDelete.name} har tagits bort.`,
      });

      setIsDeleteDialogOpen(false);
      setAgencyToDelete(null);
      fetchAgencies();
    } catch (error: any) {
      console.error("Error deleting agency:", error);
      toast({
        title: "Fel",
        description: error.message || "Kunde inte ta bort byrå.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Byrå", "Email-domän", "Status", "Mäklare", "Objekt", "Skapat"],
      ...filteredAgencies.map((a) => [
        a.name,
        a.email_domain,
        a.is_active ? "Aktiv" : "Inaktiv",
        agencyStats[a.id]?.agent_count || 0,
        agencyStats[a.id]?.property_count || 0,
        new Date(a.created_at).toLocaleDateString("sv-SE"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `byraer_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "Export klar",
      description: "CSV-filen har laddats ner.",
    });
  };

  const openEditDialog = (agency: Agency) => {
    setSelectedAgency(agency);
    setEditAgency({
      name: agency.name,
      email_domain: agency.email_domain,
      logo_url: agency.logo_url || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDetailDialog = async (agency: Agency) => {
    setSelectedAgency(agency);
    setIsDetailDialogOpen(true);
    await fetchAgencyDetails(agency.id);
  };

  const openDeleteDialog = (agency: Agency) => {
    setAgencyToDelete(agency);
    setIsDeleteDialogOpen(true);
  };

  const chartData = agencies.map((a) => ({
    name: a.name.length > 15 ? a.name.substring(0, 15) + "..." : a.name,
    mäklare: agencyStats[a.id]?.agent_count || 0,
    objekt: agencyStats[a.id]?.property_count || 0,
  }));

  const pieData = [
    { name: "Aktiva", value: agencies.filter((a) => a.is_active).length },
    { name: "Inaktiva", value: agencies.filter((a) => !a.is_active).length },
  ];

  const toggleAgencyStatus = async (agencyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("agencies")
        .update({ is_active: !currentStatus })
        .eq("id", agencyId);

      if (error) throw error;

      toast({
        title: "Status uppdaterad",
        description: `Byrån är nu ${!currentStatus ? "aktiv" : "inaktiv"}.`,
      });

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

          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={handleExportCSV} variant="outline" size="lg" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportera</span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden xs:inline">Lägg till byrå</span>
                  <span className="xs:hidden">Ny byrå</span>
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Skapa ny mäklarbyrå</DialogTitle>
                <DialogDescription>
                  Fyll i information om byrån och dess chef. En inbjudan kommer att skickas via email.
                </DialogDescription>
              </DialogHeader>
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
                    Skapa byrå & skicka inbjudan
                  </Button>
                </div>
              </form>
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

        {/* Agencies List */}
        <Card>
          <CardHeader>
            <CardTitle>Mäklarbyråer</CardTitle>
            <CardDescription>Hantera och övervaka alla anslutna byråer</CardDescription>
          </CardHeader>
          <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Laddar...</div>
                ) : filteredAgencies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery || filterStatus !== "all"
                      ? "Inga byråer matchar dina filter."
                      : "Inga byråer har skapats än. Klicka på 'Lägg till byrå' för att komma igång."}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAgencies.map((agency) => (
                      <div
                        key={agency.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          {agency.logo_url && (
                            <img
                              src={agency.logo_url}
                              alt={agency.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-base sm:text-lg truncate">
                                {agency.name}
                              </h3>
                              <Badge variant={agency.is_active ? "default" : "secondary"}>
                                {agency.is_active ? "Aktiv" : "Inaktiv"}
                              </Badge>
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
                        </div>
                        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailDialog(agency)}
                            className="gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Detaljer</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(agency)}
                            className="gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">Redigera</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAgencyStatus(agency.id, agency.is_active)}
                            className="gap-1"
                          >
                            <Activity className="w-4 h-4" />
                            {agency.is_active ? "Inaktivera" : "Aktivera"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(agency)}
                          >
                            <Trash2 className="w-4 h-4" />
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
            <Card className="bg-card/95 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Aktiva inbjudningar
                </CardTitle>
                <CardDescription>Hantera väntande inbjudningar</CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Inga väntande inbjudningar.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations.map((invitation) => {
                      const agency = agencies.find((a) => a.id === invitation.agency_id);
                      const isExpired = new Date(invitation.expires_at) < new Date();
                      return (
                        <div
                          key={invitation.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{invitation.email}</p>
                              <Badge variant={isExpired ? "destructive" : "secondary"}>
                                {invitation.role}
                              </Badge>
                              {isExpired && <Badge variant="destructive">Utgången</Badge>}
                            </div>
                            {agency && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {agency.name}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Utgår: {new Date(invitation.expires_at).toLocaleDateString("sv-SE")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Redigera byrå</DialogTitle>
              <DialogDescription>Uppdatera byråinformation</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditAgency} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Byrånamn *</Label>
                <Input
                  id="edit-name"
                  value={editAgency.name}
                  onChange={(e) => setEditAgency({ ...editAgency, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email-domain">Email-domän *</Label>
                <Input
                  id="edit-email-domain"
                  value={editAgency.email_domain}
                  onChange={(e) =>
                    setEditAgency({ ...editAgency, email_domain: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-logo">Logotyp URL</Label>
                <Input
                  id="edit-logo"
                  value={editAgency.logo_url}
                  onChange={(e) => setEditAgency({ ...editAgency, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Avbryt
                </Button>
                <Button type="submit">Spara ändringar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAgency?.logo_url && (
                  <img
                    src={selectedAgency.logo_url}
                    alt={selectedAgency.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                {selectedAgency?.name}
              </DialogTitle>
              <DialogDescription>Detaljerad information om byrån</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Mäklare ({agencyProfiles.length})
                </h3>
                {agencyProfiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Inga mäklare ännu.</p>
                ) : (
                  <div className="space-y-2">
                    {agencyProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="p-3 border rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{profile.full_name || "Namn saknas"}</p>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                        </div>
                        {profile.phone && (
                          <p className="text-sm text-muted-foreground">{profile.phone}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Senaste objekt ({agencyProperties.length})
                </h3>
                {agencyProperties.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Inga objekt ännu.</p>
                ) : (
                  <div className="space-y-2">
                    {agencyProperties.map((property) => (
                      <div
                        key={property.id}
                        className="p-3 border rounded-lg flex items-center justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{property.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {property.address}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold">
                            {property.price.toLocaleString("sv-SE")} kr
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(property.created_at).toLocaleDateString("sv-SE")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Är du säker?</AlertDialogTitle>
              <AlertDialogDescription>
                Detta kommer att permanent ta bort byrån "{agencyToDelete?.name}" och alla
                associerade data. Denna åtgärd kan inte ångras.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAgencyToDelete(null)}>
                Avbryt
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAgency}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Ta bort
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
