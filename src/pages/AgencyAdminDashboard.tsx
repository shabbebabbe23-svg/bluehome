import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user, userType } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [agencyId, setAgencyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgencyId = async () => {
      if (userType === "agency_admin" && user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("agency_id")
          .eq("id", user.id)
          .single();
        
        if (profile?.agency_id) {
          setAgencyId(profile.agency_id);
          
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
    <div className="max-w-2xl mx-auto p-6">
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
  );
};

export default AgencyAdminDashboard;
