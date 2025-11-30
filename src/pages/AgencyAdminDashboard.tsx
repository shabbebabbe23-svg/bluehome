import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Building2, Users, Mail } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  user_roles?: { user_type: string }[];
  propertyCount?: number;
}

interface AgencyInfo {
  name: string;
  email_domain: string;
  address: string | null;
  phone: string | null;
  org_number: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  used_at?: string;
}

const AgencyAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userType, signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAgent, setNewAgent] = useState({
    email: "",
    full_name: "",
    office: "",
    password: ""
  });
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [agencyInfo, setAgencyInfo] = useState<AgencyInfo | null>(null);
  const [editingAgency, setEditingAgency] = useState(false);

  useEffect(() => {
    const fetchAgencyId = async () => {
      if (userType === "agency_admin" && user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("agency_id, full_name")
          .eq("id", user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name);
        }
        
        if (profile?.agency_id) {
          setAgencyId(profile.agency_id);
          
          // Fetch full agency info
          const { data: agency } = await supabase
            .from("agencies")
            .select("*")
            .eq("id", profile.agency_id)
            .single();
          
          if (agency) {
            setAgencyName(agency.name);
            setAgencyInfo(agency);
          }
          
          // Fetch users with property counts
          const { data: usersData } = await supabase
            .from("profiles")
            .select("id, full_name, email, user_roles(user_type)")
            .eq("agency_id", profile.agency_id);
          
          if (usersData) {
            // Fetch property counts for each user
            const usersWithCounts = await Promise.all(
              usersData.map(async (user) => {
                const { count } = await supabase
                  .from("properties")
                  .select("*", { count: "exact", head: true })
                  .eq("user_id", user.id)
                  .eq("is_deleted", false);
                return { ...user, propertyCount: count || 0 };
              })
            );
            setUsers(usersWithCounts as any);
          }
            
          supabase
            .from("agency_invitations")
            .select("id, email, role, created_at, expires_at, used_at")
            .eq("agency_id", profile.agency_id)
            .is("used_at", null)
            .then(({ data }) => setPendingInvites(data ?? []));
        }
      }
    };
    fetchAgencyId();
  }, [userType, user]);

  const createAgent = async () => {
    if (!newAgent.email || !newAgent.full_name || !newAgent.password || !agencyId) {
      toast.error("Fyll i alla obligatoriska fält");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-agent', {
        body: {
          email: newAgent.email,
          full_name: newAgent.full_name,
          office: newAgent.office,
          agency_id: agencyId,
          temporary_password: newAgent.password,
        }
      });

      if (error) throw error;

      toast.success("Mäklare skapad! Tillfälligt lösenord skickat.");
      setNewAgent({ email: "", full_name: "", office: "", password: "" });
      
      // Refresh users list
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, full_name, email, user_roles(user_type)")
        .eq("agency_id", agencyId);
      
      if (usersData) {
        const usersWithCounts = await Promise.all(
          usersData.map(async (user) => {
            const { count } = await supabase
              .from("properties")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)
              .eq("is_deleted", false);
            return { ...user, propertyCount: count || 0 };
          })
        );
        setUsers(usersWithCounts as any);
      }
    } catch (error: any) {
      console.error("Error creating agent:", error);
      toast.error(error.message || "Kunde inte skapa mäklare");
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (userId: string) => {
    if (!window.confirm("Ta bort användare?")) return;
    if (!agencyId) return;
    await supabase
      .from("profiles")
      .delete()
      .eq("id", userId)
      .eq("agency_id", agencyId);
    setUsers(users.filter(u => u.id !== userId));
  };

  const updateAgencyInfo = async () => {
    if (!agencyId || !agencyInfo) return;
    setLoading(true);
    const { error } = await supabase
      .from("agencies")
      .update({
        name: agencyInfo.name,
        address: agencyInfo.address,
        phone: agencyInfo.phone,
        org_number: agencyInfo.org_number,
        website: agencyInfo.website,
        description: agencyInfo.description,
        logo_url: agencyInfo.logo_url,
      })
      .eq("id", agencyId);
    
    setLoading(false);
    if (error) {
      toast.error("Kunde inte uppdatera byråinformation");
    } else {
      toast.success("Byråinformation uppdaterad");
      setEditingAgency(false);
      setAgencyName(agencyInfo.name);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/20" style={{ background: 'var(--main-gradient)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Tillbaka-knapp */}
            <button
              onClick={() => navigate("/")}
              className="hover:scale-110 transition-all duration-300 cursor-pointer"
            >
              <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)' }} />
                    <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)' }} />
                  </linearGradient>
                </defs>
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="url(#arrowGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Logo och företagsinfo */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)' }} />
                      <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)' }} />
                    </linearGradient>
                  </defs>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="url(#homeGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="9 22 9 12 15 12 15 22" stroke="url(#homeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xl md:text-2xl lg:text-3xl font-bold bg-hero-gradient bg-clip-text text-transparent">
                  BaraHem
                </span>
              </div>

              {/* User info */}
              {userName && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border-2 bg-white/10 border-white/30">
                  <div className="flex flex-col text-right">
                    <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent drop-shadow">
                      {userName}
                    </span>
                    {agencyName && (
                      <span className="text-sm text-white/80 drop-shadow">
                        {agencyName}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logga ut-knapp */}
            <Button
              onClick={signOut}
              className="bg-hero-gradient hover:scale-105 transition-transform text-white"
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              Logga ut
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 pt-24">
        <Tabs defaultValue="byrå" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="byrå" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Byråinformation
            </TabsTrigger>
            <TabsTrigger value="mäklare" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Mäklare
            </TabsTrigger>
          </TabsList>

          {/* Byråinformation Tab */}
          <TabsContent value="byrå">
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Byråinformation</h2>
                {!editingAgency && (
                  <Button onClick={() => setEditingAgency(true)}>
                    Redigera
                  </Button>
                )}
              </div>

              {agencyInfo && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Byrånamn *</Label>
                      <Input
                        id="name"
                        value={agencyInfo.name}
                        onChange={(e) => setAgencyInfo({ ...agencyInfo, name: e.target.value })}
                        disabled={!editingAgency}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email_domain">E-postdomän *</Label>
                      <Input
                        id="email_domain"
                        value={agencyInfo.email_domain}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="org_number">Organisationsnummer</Label>
                      <Input
                        id="org_number"
                        value={agencyInfo.org_number || ""}
                        onChange={(e) => setAgencyInfo({ ...agencyInfo, org_number: e.target.value })}
                        disabled={!editingAgency}
                        placeholder="XXXXXX-XXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={agencyInfo.phone || ""}
                        onChange={(e) => setAgencyInfo({ ...agencyInfo, phone: e.target.value })}
                        disabled={!editingAgency}
                        placeholder="+46 XX XXX XX XX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Webbplats</Label>
                      <Input
                        id="website"
                        value={agencyInfo.website || ""}
                        onChange={(e) => setAgencyInfo({ ...agencyInfo, website: e.target.value })}
                        disabled={!editingAgency}
                        placeholder="https://www.exempel.se"
                      />
                    </div>
                    <div>
                      <Label htmlFor="logo_url">Logotyp URL</Label>
                      <Input
                        id="logo_url"
                        value={agencyInfo.logo_url || ""}
                        onChange={(e) => setAgencyInfo({ ...agencyInfo, logo_url: e.target.value })}
                        disabled={!editingAgency}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Adress</Label>
                    <Input
                      id="address"
                      value={agencyInfo.address || ""}
                      onChange={(e) => setAgencyInfo({ ...agencyInfo, address: e.target.value })}
                      disabled={!editingAgency}
                      placeholder="Gatuadress, Postnummer, Ort"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Beskrivning</Label>
                    <Textarea
                      id="description"
                      value={agencyInfo.description || ""}
                      onChange={(e) => setAgencyInfo({ ...agencyInfo, description: e.target.value })}
                      disabled={!editingAgency}
                      placeholder="Beskriv er byrå..."
                      rows={4}
                    />
                  </div>

                  {editingAgency && (
                    <div className="flex gap-2">
                      <Button onClick={updateAgencyInfo} disabled={loading}>
                        Spara ändringar
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setEditingAgency(false);
                        // Reset to original values
                        if (agencyId) {
                          supabase
                            .from("agencies")
                            .select("*")
                            .eq("id", agencyId)
                            .single()
                            .then(({ data }) => data && setAgencyInfo(data));
                        }
                      }}>
                        Avbryt
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Mäklare Tab */}
          <TabsContent value="mäklare">
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Mäklare i byrån</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Lägg till mäklare</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <h3 className="text-lg font-semibold mb-4">Lägg till ny mäklare</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="agent-name">Namn *</Label>
                        <Input
                          id="agent-name"
                          value={newAgent.full_name}
                          onChange={(e) => setNewAgent({ ...newAgent, full_name: e.target.value })}
                          placeholder="För- och efternamn"
                        />
                      </div>
                      <div>
                        <Label htmlFor="agent-email">E-post *</Label>
                        <Input
                          id="agent-email"
                          type="email"
                          value={newAgent.email}
                          onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                          placeholder="mäklare@exempel.se"
                        />
                      </div>
                      <div>
                        <Label htmlFor="agent-office">Kontor</Label>
                        <Input
                          id="agent-office"
                          value={newAgent.office}
                          onChange={(e) => setNewAgent({ ...newAgent, office: e.target.value })}
                          placeholder="Stockholm Centrum"
                        />
                      </div>
                      <div>
                        <Label htmlFor="agent-password">Tillfälligt lösenord *</Label>
                        <Input
                          id="agent-password"
                          type="password"
                          value={newAgent.password}
                          onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                          placeholder="Minst 6 tecken"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Mäklaren kan ändra lösenordet efter första inloggningen
                        </p>
                      </div>
                      <Button 
                        onClick={createAgent} 
                        disabled={loading || !newAgent.email || !newAgent.full_name || !newAgent.password} 
                        className="w-full"
                      >
                        {loading ? "Skapar..." : "Skapa mäklare"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                  <div key={user.id} className="border rounded-lg p-4 bg-background">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{user.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeUser(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Ta bort
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Roll:</span>
                        <span className="font-medium capitalize">
                          {user.user_roles?.[0]?.user_type ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Aktiva objekt:</span>
                        <span className="font-bold text-primary">
                          {user.propertyCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {users.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Inga mäklare i byrån än
                </p>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default AgencyAdminDashboard;
