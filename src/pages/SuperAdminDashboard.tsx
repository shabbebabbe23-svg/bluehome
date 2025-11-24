import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Building2, Plus, Users, Home } from "lucide-react";
import Header from "@/components/Header";

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

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agencyStats, setAgencyStats] = useState<Record<string, AgencyStats>>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      
      <div className="container mx-auto px-4 py-8">
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
              <Button size="lg" className="gap-2 w-full sm:w-auto">
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
                    <Button
                      variant="outline"
                      onClick={() => toggleAgencyStatus(agency.id, agency.is_active)}
                      className="w-full sm:w-auto"
                    >
                      {agency.is_active ? "Inaktivera" : "Aktivera"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
