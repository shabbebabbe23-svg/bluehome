import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  user_roles?: { user_type: string }[];
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
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

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
          
          // Fetch agency name
          const { data: agency } = await supabase
            .from("agencies")
            .select("name")
            .eq("id", profile.agency_id)
            .single();
          
          if (agency?.name) {
            setAgencyName(agency.name);
          }
          
          supabase
            .from("profiles")
            .select("id, full_name, email, user_roles(user_type)")
            .eq("agency_id", profile.agency_id)
            .then(({ data }) => setUsers(data as any ?? []));
            
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

  const sendInvite = async () => {
    if (!inviteEmail || !agencyId) return;
    setLoading(true);
    await supabase
      .from("agency_invitations")
      .insert({
        agency_id: agencyId,
        email: inviteEmail,
        role: "maklare",
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: user?.id,
      });
    setInviteEmail("");
    setLoading(false);
    // Refresh invites
    supabase
      .from("agency_invitations")
      .select("id, email, role, created_at, expires_at, used_at")
      .eq("agency_id", agencyId)
      .is("used_at", null)
      .then(({ data }) => setPendingInvites(data ?? []));
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/20 bg-hero-gradient">
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

            {/* Namn och företag */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border-2 bg-white/10 border-white/30">
              <div className="flex flex-col text-right">
                <span className="text-base font-bold text-white drop-shadow">
                  {userName || user?.user_metadata?.full_name || user?.email}
                </span>
                {agencyName && (
                  <span className="text-sm text-white/80 drop-shadow">
                    {agencyName}
                  </span>
                )}
              </div>
            </div>

            {/* Logga ut-knapp */}
            <Button
              onClick={signOut}
              className="bg-hero-gradient hover:scale-105 transition-transform text-white"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logga ut
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6 pt-24">
        <h2 className="text-2xl font-bold mb-4">Användare i din byrå</h2>
      <table className="w-full mb-6 border rounded">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 text-left">Namn</th>
            <th className="p-2 text-left">E-post</th>
            <th className="p-2 text-left">Roll</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b">
              <td className="p-2">{u.full_name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.user_roles?.[0]?.user_type ?? "-"}</td>
              <td className="p-2 text-right">
                <Button variant="destructive" size="sm" onClick={() => removeUser(u.id)}>
                  Ta bort
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Lägg till användare</Button>
        </DialogTrigger>
        <DialogContent>
          <h3 className="text-lg font-semibold mb-2">Skicka inbjudan</h3>
          <Input
            type="email"
            placeholder="E-postadress"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="mb-3"
          />
          <Button onClick={sendInvite} disabled={loading || !inviteEmail}>
            Skicka inbjudan
          </Button>
        </DialogContent>
      </Dialog>
      <h3 className="text-lg font-semibold mt-8 mb-2">Väntande inbjudningar</h3>
      <ul className="mb-4">
        {pendingInvites.map(inv => (
          <li key={inv.id} className="mb-2 text-sm">
            {inv.email} ({inv.role}) - giltig till {new Date(inv.expires_at).toLocaleDateString()} 
          </li>
        ))}
        {pendingInvites.length === 0 && <li className="text-muted-foreground">Inga väntande inbjudningar</li>}
      </ul>
      </div>
    </div>
  );
};

export default AgencyAdminDashboard;
