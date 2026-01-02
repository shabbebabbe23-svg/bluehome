import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Building2, Users, User, Upload, BarChart3, TrendingUp, Home as HomeIcon, Award, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LogoCropper from "@/components/LogoCropper";

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
  email: string | null;
  address: string | null;
  phone: string | null;
  org_number: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  area: string | null;
  owner: string | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  created_at: string;
  expires_at: string;
  used_at?: string | null;
}

const AgencyAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userType, signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invitation[]>([]);
  const [createdInvitationLink, setCreatedInvitationLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newAgent, setNewAgent] = useState({
    email: "",
    full_name: ""
  });
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [agencyInfo, setAgencyInfo] = useState<AgencyInfo | null>(null);
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    office: "",
    area: "",
    bio: "",
    avatar_url: ""
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoCropperImage, setLogoCropperImage] = useState<string | null>(null);
  const [logoCropperFile, setLogoCropperFile] = useState<File | null>(null);
  const [loadingAgency, setLoadingAgency] = useState(true);
  const [statistics, setStatistics] = useState({
    totalAgents: 0,
    activeProperties: 0,
    soldProperties: 0,
    totalSalesValue: 0,
    topAgent: { name: "", salesCount: 0 }
  });

  useEffect(() => {
    const fetchAgencyId = async () => {
      if (userType === "agency_admin" && user) {
        setLoadingAgency(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setUserName(profile.full_name || "");
          setProfileData({
            full_name: profile.full_name || "",
            phone: profile.phone || "",
            office: profile.office || "",
            area: profile.area || "",
            bio: profile.bio || "",
            avatar_url: profile.avatar_url || ""
          });
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
          
          // Fetch users - separate queries to avoid RLS conflicts with nested selects
          const { data: usersData } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .eq("agency_id", profile.agency_id);
          
          if (usersData && usersData.length > 0) {
            // Fetch property counts and roles for each user separately
            const usersWithDetails = await Promise.all(
              usersData.map(async (userProfile) => {
                // Fetch property count
                const { count } = await supabase
                  .from("properties")
                  .select("*", { count: "exact", head: true })
                  .eq("user_id", userProfile.id)
                  .eq("is_deleted", false);
                
                // Fetch user role separately to avoid RLS conflicts
                const { data: roleData } = await supabase
                  .from("user_roles")
                  .select("user_type")
                  .eq("user_id", userProfile.id)
                  .single();
                
                return { 
                  ...userProfile, 
                  propertyCount: count || 0,
                  user_roles: roleData ? [{ user_type: roleData.user_type }] : []
                };
              })
            );
            setUsers(usersWithDetails as any);
          } else {
            setUsers([]);
          }
            
          supabase
            .from("agency_invitations")
            .select("id, email, role, token, created_at, expires_at, used_at")
            .eq("agency_id", profile.agency_id)
            .is("used_at", null)
            .gt("expires_at", new Date().toISOString())
            .then(({ data }) => setPendingInvites(data ?? []));
          
          // Fetch statistics
          fetchStatistics(profile.agency_id, usersData || []);
        }
        setLoadingAgency(false);
      } else {
        // If not agency_admin, set loading to false to prevent infinite loading
        setLoadingAgency(false);
      }
    };
    fetchAgencyId();
  }, [userType, user]);

  const fetchStatistics = async (agencyId: string, agencyUsers: any[]) => {
    // Get user IDs for all agents in the agency
    const userIds = agencyUsers.map(u => u.id);
    
    // Count active properties
    const { count: activeCount } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .in("user_id", userIds)
      .eq("is_deleted", false)
      .eq("is_sold", false);
    
    // Count sold properties
    const { count: soldCount } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .in("user_id", userIds)
      .eq("is_sold", true);
    
    // Get sold properties with prices
    const { data: soldProperties } = await supabase
      .from("properties")
      .select("sold_price, user_id")
      .in("user_id", userIds)
      .eq("is_sold", true)
      .not("sold_price", "is", null);
    
    // Calculate total sales value
    const totalSales = soldProperties?.reduce((sum, prop) => sum + (prop.sold_price || 0), 0) || 0;
    
    // Find top agent by sales count
    const salesByAgent: Record<string, number> = {};
    soldProperties?.forEach(prop => {
      salesByAgent[prop.user_id] = (salesByAgent[prop.user_id] || 0) + 1;
    });
    
    const topAgentId = Object.keys(salesByAgent).reduce((a, b) => 
      salesByAgent[a] > salesByAgent[b] ? a : b, ""
    );
    
    const topAgent = agencyUsers.find(u => u.id === topAgentId);
    
    setStatistics({
      totalAgents: agencyUsers.length,
      activeProperties: activeCount || 0,
      soldProperties: soldCount || 0,
      totalSalesValue: totalSales,
      topAgent: {
        name: topAgent?.full_name || "-",
        salesCount: salesByAgent[topAgentId] || 0
      }
    });
  };

  const createAgent = async () => {
    if (!newAgent.email.trim() || !newAgent.full_name.trim()) {
      toast.error("Fyll i alla fält");
      return;
    }

    if (!agencyId) {
      toast.error("Ingen byrå hittades");
      return;
    }

    setLoading(true);
    try {
      // Skapa inbjudan för mäklare
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 dagars giltighet

      const { error: invitationError } = await supabase
        .from("agency_invitations")
        .insert({
          agency_id: agencyId,
          email: newAgent.email.trim(),
          role: "maklare",
          token: token,
          expires_at: expiresAt.toISOString(),
          created_by: user?.id,
        });

      if (invitationError) {
        // Check if invitation already exists for this email
        if (invitationError.code === '23505') {
          toast.error("Det finns redan en inbjudan för denna email", {
            duration: 8000,
          });
        } else {
          throw invitationError;
        }
        return;
      }

      // Skapa inbjudningslänk
      const invitationUrl = `${window.location.origin}/acceptera-inbjudan?token=${token}`;
      
      // Skicka email med inbjudningslänken
      try {
        const { error: emailError } = await supabase.functions.invoke('send-agency-invitation', {
          body: {
            email: newAgent.email.trim(),
            name: newAgent.full_name.trim(),
            agency_name: agencyName,
            token: token,
            role: 'maklare'
          }
        });

        if (emailError) {
          console.error("Email sending failed:", emailError);
          toast.warning("Inbjudan skapad men email kunde inte skickas", {
            duration: 8000,
            description: "Kopiera länken nedan och skicka den manuellt till mäklaren.",
          });
        } else {
          toast.success("Inbjudan skickad!", {
            duration: 8000,
            description: `Ett email med inbjudningslänken har skickats till ${newAgent.email}`,
          });
        }
      } catch (emailError: any) {
        console.error("Email error:", emailError);
        toast.warning("Inbjudan skapad men email kunde inte skickas", {
          duration: 8000,
          description: "Kopiera länken nedan och skicka den manuellt till mäklaren.",
        });
      }

      // Show invitation link as backup
      setCreatedInvitationLink(invitationUrl);
      setNewAgent({ email: "", full_name: "" });

      // Refresh pending invitations list
      const { data } = await supabase
        .from("agency_invitations")
        .select("id, email, role, token, created_at, expires_at, used_at")
        .eq("agency_id", agencyId)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString());
        
      setPendingInvites(data ?? []);
    } catch (error: any) {
      console.error("Error creating invitation:", error);
      toast.error(error.message || "Kunde inte skapa inbjudan", { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("agency_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      toast.success("Inbjudan raderad", {
        description: "Inbjudan har tagits bort.",
      });

      // Refresh list
      const { data } = await supabase
        .from("agency_invitations")
        .select("id, email, role, token, created_at, expires_at, used_at")
        .eq("agency_id", agencyId)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString());
        
      setPendingInvites(data ?? []);
    } catch (error) {
      console.error("Error deleting invitation:", error);
      toast.error("Kunde inte radera inbjudan");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Kopierat!", {
        description: "Länken har kopierats till urklipp.",
      });
    } catch (error) {
      toast.error("Kunde inte kopiera länken. Försök igen.");
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

  const updateAgencyInfo = async (updatedInfo?: AgencyInfo) => {
    const info = updatedInfo || agencyInfo;
    if (!agencyId || !info) return;
    setLoading(true);
    const { error } = await supabase
      .from("agencies")
      .update({
        name: info.name,
        email: info.email,
        address: info.address,
        phone: info.phone,
        org_number: info.org_number,
        website: info.website,
        description: info.description,
        logo_url: info.logo_url,
        area: info.area,
        owner: info.owner,
      })
      .eq("id", agencyId);
    
    setLoading(false);
    if (error) {
      toast.error("Kunde inte uppdatera byråinformation");
    } else {
      toast.success("Byråinformation uppdaterad");
      setAgencyName(info.name);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      toast.error("Ingen fil vald");
      return;
    }
    
    if (!user) {
      toast.error("Du måste vara inloggad");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Vänligen välj en bildfil");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Bilden får max vara 5MB");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-avatar-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    setUploadingAvatar(true);
    console.log("Starting avatar upload:", { fileName, filePath, fileSize: file.size });

    try {
      // Upload file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful:", uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("property-images")
        .getPublicUrl(filePath);

      console.log("Public URL:", publicUrl);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }

      // Update local state immediately
      setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
      
      toast.success("Profilbild uppladdad! Bilden syns nu.");
      console.log("Avatar upload complete");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(`Uppladdning misslyckades: ${error.message || 'Okänt fel'}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.full_name,
        phone: profileData.phone || null,
        office: profileData.office || null,
        area: profileData.area || null,
        bio: profileData.bio || null,
      })
      .eq("id", user.id);

    setLoading(false);
    if (error) {
      toast.error("Kunde inte uppdatera profil");
    } else {
      toast.success("Profil uppdaterad");
      setEditingProfile(false);
      setUserName(profileData.full_name);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      toast.error("Ingen fil vald");
      return;
    }
    
    if (!agencyId) {
      toast.error("Ingen byrå hittades");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Vänligen välj en bildfil");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logotypen får max vara 5MB");
      return;
    }

    // Show cropper instead of uploading directly
    const reader = new FileReader();
    reader.onload = () => {
      setLogoCropperImage(reader.result as string);
      setLogoCropperFile(file);
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const handleLogoCropComplete = async (croppedBlob: Blob) => {
    if (!agencyId) return;
    
    const fileName = `${agencyId}-logo-${Date.now()}.png`;
    const filePath = `agencies/${fileName}`;

    setUploadingLogo(true);
    setLogoCropperImage(null);
    setLogoCropperFile(null);
    console.log("Starting cropped logo upload:", { fileName, filePath });

    try {
      // Upload cropped file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(filePath, croppedBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/png'
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful:", uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("property-images")
        .getPublicUrl(filePath);

      console.log("Public URL:", publicUrl);

      // Update agency
      const { error: updateError } = await supabase
        .from("agencies")
        .update({ logo_url: publicUrl })
        .eq("id", agencyId);

      if (updateError) {
        console.error("Agency update error:", updateError);
        throw updateError;
      }

      // Update local state immediately
      setAgencyInfo(prev => prev ? { ...prev, logo_url: publicUrl } : null);
      
      toast.success("Logotyp uppladdad! Logotypen syns nu.");
      console.log("Logo upload complete");
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error(`Uppladdning misslyckades: ${error.message || 'Okänt fel'}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoCropCancel = () => {
    setLogoCropperImage(null);
    setLogoCropperFile(null);
  };

  return (
    <div className="min-h-screen">
      {/* Logo Cropper Modal */}
      {logoCropperImage && (
        <LogoCropper
          image={logoCropperImage}
          onCropComplete={handleLogoCropComplete}
          onCancel={handleLogoCropCancel}
        />
      )}
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
                      <span className="text-sm text-black font-semibold drop-shadow">
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
              className="bg-hero-gradient hover:scale-105 transition-transform text-white px-2 sm:px-4"
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5 sm:mr-2" />
              <span className="hidden sm:inline">Logga ut</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 pt-24">
        <div className="bg-card rounded-lg border p-4 sm:p-6 mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
            Hantera byrå
          </h1>
        </div>
        
        <Tabs defaultValue="byrå" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger 
              value="byrå" 
              className="flex items-center gap-2 data-[state=active]:bg-hero-gradient data-[state=active]:text-white"
            >
              <Building2 className="w-4 h-4" />
              Byråinformation
            </TabsTrigger>
            <TabsTrigger 
              value="mäklare" 
              className="flex items-center gap-2 data-[state=active]:bg-hero-gradient data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              Mäklare
            </TabsTrigger>
            <TabsTrigger 
              value="statistik" 
              className="flex items-center gap-2 data-[state=active]:bg-hero-gradient data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4" />
              Statistik
            </TabsTrigger>
          </TabsList>

          {/* Byråinformation Tab */}
          <TabsContent value="byrå">
            <div className="bg-card rounded-lg border p-6">
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-bold">Byråinformation</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label htmlFor="office_name">Kontorsnamn</Label>
                    <Input
                      id="office_name"
                      value={agencyInfo?.name || ""}
                      onChange={e => setAgencyInfo({ ...(agencyInfo ?? {
                        name: "",
                        email_domain: "",
                        email: "",
                        address: "",
                        phone: "",
                        org_number: "",
                        website: "",
                        description: "",
                        logo_url: "",
                        area: "",
                        owner: ""
                      }), name: e.target.value })}
                      placeholder="Kontorsnamn"
                    />
                    <Label htmlFor="agency-email-domain">E-postdomän</Label>
                    <Input
                      id="agency-email-domain"
                      value={agencyInfo?.email_domain || ""}
                      onChange={e => setAgencyInfo({ ...(agencyInfo ?? {
                        name: "",
                        email_domain: "",
                        email: "",
                        address: "",
                        phone: "",
                        org_number: "",
                        website: "",
                        description: "",
                        logo_url: "",
                        area: "",
                        owner: ""
                      }), email_domain: e.target.value })}
                      placeholder="E-postdomän"
                    />
                    <Label htmlFor="agency-email">E-post till kontoret</Label>
                    <Input
                      id="agency-email"
                      type="email"
                      value={agencyInfo?.email || ""}
                      onChange={e => setAgencyInfo({ ...(agencyInfo ?? {
                        name: "",
                        email_domain: "",
                        email: "",
                        address: "",
                        phone: "",
                        org_number: "",
                        website: "",
                        description: "",
                        logo_url: "",
                        area: "",
                        owner: ""
                      }), email: e.target.value })}
                      placeholder="kontor@foretag.se"
                    />
                    <Label htmlFor="address">Adress</Label>
                    <Input
                      id="address"
                      value={agencyInfo?.address || ""}
                      onChange={e => setAgencyInfo({ ...(agencyInfo ?? {
                        name: "",
                        email_domain: "",
                        email: "",
                        address: "",
                        phone: "",
                        org_number: "",
                        website: "",
                        description: "",
                        logo_url: "",
                        area: "",
                        owner: ""
                      }), address: e.target.value })}
                      placeholder="Gatuadress, Postnummer, Ort"
                    />
                    <Label htmlFor="area">Område</Label>
                    <Input
                      id="area"
                      value={agencyInfo?.area || ""}
                      onChange={e => setAgencyInfo({ ...(agencyInfo ?? {
                        name: "",
                        email_domain: "",
                        email: "",
                        address: "",
                        phone: "",
                        org_number: "",
                        website: "",
                        description: "",
                        logo_url: "",
                        area: "",
                        owner: ""
                      }), area: e.target.value })}
                      placeholder="T.ex. Stockholm, Göteborg, Malmö"
                    />
                    <Label htmlFor="owner">Ägare</Label>
                    <Input
                      id="owner"
                      value={agencyInfo?.owner || ""}
                      onChange={e => setAgencyInfo({ ...(agencyInfo ?? {
                        name: "",
                        email_domain: "",
                        email: "",
                        address: "",
                        phone: "",
                        org_number: "",
                        website: "",
                        description: "",
                        logo_url: "",
                        area: "",
                        owner: ""
                      }), owner: e.target.value })}
                      placeholder="Namn på företagsägare"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={agencyInfo?.phone || ""}
                      onChange={e => setAgencyInfo({ ...(agencyInfo ?? {
                        name: "",
                        email_domain: "",
                        email: "",
                        address: "",
                        phone: "",
                        org_number: "",
                        website: "",
                        description: "",
                        logo_url: "",
                        area: "",
                        owner: ""
                      }), phone: e.target.value })}
                      placeholder="+46 XX XXX XX XX"
                    />
                    <Label htmlFor="org_number">Org.nr</Label>
                    <Input
                      id="org_number"
                      value={agencyInfo?.org_number || ""}
                      onChange={e => setAgencyInfo({ ...(agencyInfo ?? {
                        name: "",
                        email_domain: "",
                        email: "",
                        address: "",
                        phone: "",
                        org_number: "",
                        website: "",
                        description: "",
                        logo_url: "",
                        area: "",
                        owner: ""
                      }), org_number: e.target.value })}
                      placeholder="XXXXXX-XXXX"
                    />
                    <Label htmlFor="website">Länk till egen sida</Label>
                    <Input
                      id="website"
                      value={agencyInfo?.website || ""}
                      onChange={e => setAgencyInfo({ ...(agencyInfo ?? {
                        name: "",
                        email_domain: "",
                        email: "",
                        address: "",
                        phone: "",
                        org_number: "",
                        website: "",
                        description: "",
                        logo_url: "",
                        area: "",
                        owner: ""
                      }), website: e.target.value })}
                      placeholder="https://www.exempel.se"
                    />
                    <Label htmlFor="description">Beskrivning</Label>
                    <Textarea
                      id="description"
                      value={agencyInfo?.description || ""}
                      onChange={e => setAgencyInfo({ ...(agencyInfo ?? {
                        name: "",
                        email_domain: "",
                        email: "",
                        address: "",
                        phone: "",
                        org_number: "",
                        website: "",
                        description: "",
                        logo_url: "",
                        area: "",
                        owner: ""
                      }), description: e.target.value })}
                      placeholder="Beskrivning av byrån"
                    />
                    <Label className="text-sm font-medium mb-2 block">Uppladdning av logga</Label>
                    <div className="space-y-3">
                      {agencyInfo?.logo_url && (
                        <div className="p-4 border-2 rounded-lg bg-muted/20 shadow-md">
                          <img 
                            src={agencyInfo.logo_url} 
                            alt="Byrå logotyp" 
                            key={agencyInfo.logo_url}
                            className="h-40 w-auto object-contain mx-auto"
                            onError={(e) => {
                              console.error("Failed to load logo:", agencyInfo.logo_url);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg hover:bg-muted/50 transition-colors">
                            <Upload className="w-5 h-5" />
                            <span>{uploadingLogo ? "Laddar upp..." : agencyInfo?.logo_url ? "Byt logotyp" : "Välj logotyp"}</span>
                          </div>
                          <Input
                            id="logo-upload"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={handleLogoUpload}
                            disabled={uploadingLogo}
                          />
                        </Label>
                        {agencyInfo?.logo_url && (
                          <p className="text-xs text-muted-foreground text-center">✓ Logotyp uppladdad</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-8">
                  <Button onClick={() => updateAgencyInfo()} disabled={loading}>
                    {loading ? "Sparar..." : "Spara"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Mäklare Tab */}
          <TabsContent value="mäklare">
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Mäklare
                </h2>
                <Dialog onOpenChange={(open) => {
                  if (open) {
                    setCreatedInvitationLink(null);
                    setNewAgent({ email: "", full_name: "" });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-hero-gradient hover:scale-105 transition-transform text-white">
                      <User className="w-4 h-4 mr-2" />
                      Bjud in mäklare
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <h3 className="text-lg font-semibold">
                      Bjud in ny mäklare
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Fyll i namn och e-post för att bjuda in en mäklare till byrån.
                    </p>
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
                      <Button 
                        onClick={createAgent} 
                        disabled={loading || !newAgent.email || !newAgent.full_name || loadingAgency || !agencyId} 
                        className="w-full"
                      >
                        {loading ? "Skapar inbjudan..." : "Skapa inbjudan"}
                      </Button>

                      {/* Show created invitation link */}
                      {createdInvitationLink && (
                        <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                          <Label className="text-sm font-semibold">Inbjudningslänk skapad!</Label>
                          <p className="text-xs text-muted-foreground">
                            Kopiera länken nedan och skicka den till mäklaren:
                          </p>
                          <div className="flex gap-2">
                            <Input
                              readOnly
                              value={createdInvitationLink}
                              className="text-xs bg-background"
                            />
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard(createdInvitationLink)}
                            >
                              Kopiera
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Show pending invitations */}
                      {pendingInvites.length > 0 && (
                        <div className="mt-6 pt-6 border-t">
                          <Label className="text-sm font-semibold mb-3 block">
                            Väntande inbjudningar ({pendingInvites.length})
                          </Label>
                          <div className="space-y-2">
                            {pendingInvites.map((invite) => (
                              <div key={invite.id} className="p-3 bg-muted rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <p className="text-sm font-medium">{invite.email}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Utgår: {new Date(invite.expires_at).toLocaleDateString('sv-SE')}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteInvitation(invite.id)}
                                    className="text-destructive"
                                  >
                                    Radera
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    readOnly
                                    value={`${window.location.origin}/acceptera-inbjudan?token=${invite.token}`}
                                    className="text-xs bg-background"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => copyToClipboard(`${window.location.origin}/acceptera-inbjudan?token=${invite.token}`)}
                                  >
                                    Kopiera
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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

          {/* Statistik Tab */}
          <TabsContent value="statistik">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Antal Mäklare */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Antal Mäklare</CardTitle>
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {statistics.totalAgents}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Aktiva mäklare i byrån
                  </p>
                </CardContent>
              </Card>

              {/* Aktiva Fastigheter */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktiva Fastigheter</CardTitle>
                  <HomeIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {statistics.activeProperties}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Till salu just nu
                  </p>
                </CardContent>
              </Card>

              {/* Sålda Fastigheter */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sålda Fastigheter</CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {statistics.soldProperties}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Totalt antal sålda
                  </p>
                </CardContent>
              </Card>

              {/* Totalt Försäljningsvärde */}
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800 md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Totalt Försäljningsvärde</CardTitle>
                  <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                    {statistics.totalSalesValue.toLocaleString('sv-SE')} kr
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Sammanlagt värde av alla försäljningar
                  </p>
                </CardContent>
              </Card>

              {/* Bästa Mäklare */}
              <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 border-rose-200 dark:border-rose-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bästa Mäklare</CardTitle>
                  <Award className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-rose-700 dark:text-rose-300 truncate">
                    {statistics.topAgent.name}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {statistics.topAgent.salesCount} försäljningar
                  </p>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default AgencyAdminDashboard;
