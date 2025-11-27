import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface InvitationData {
  email: string;
  agency_id: string;
  role: string;
  agency_name: string;
  expires_at: string;
  used_at: string | null;
}

const InvitationAccept = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      toast.error("Ingen inbjudningstoken hittades");
      navigate("/");
      return;
    }

    const fetchInvitation = async () => {
      try {
        const { data, error } = await supabase
          .from("agency_invitations")
          .select(`
            email,
            agency_id,
            role,
            expires_at,
            used_at,
            agencies (
              name
            )
          `)
          .eq("token", token)
          .single();

        if (error || !data) {
          toast.error("Inbjudan hittades inte");
          navigate("/");
          return;
        }

        // Extra: max 48h giltighet
        const createdAt = new Date(data.created_at || data.expires_at);
        const now = new Date();
        const maxAgeMs = 48 * 60 * 60 * 1000;
        const isExpired = new Date(data.expires_at) < now || (now.getTime() - createdAt.getTime()) > maxAgeMs;

        if (data.used_at) {
          setInvitation(null);
          setLoading(false);
          return;
        }
        if (isExpired) {
          setInvitation(null);
          setLoading(false);
          return;
        }

        setInvitation({
          email: data.email,
          agency_id: data.agency_id,
          role: data.role,
          agency_name: (data.agencies as any)?.name || "",
          expires_at: data.expires_at,
          used_at: data.used_at,
        });
      } catch (error) {
        console.error("Error fetching invitation:", error);
        toast.error("Ett fel uppstod");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Lösenorden matchar inte");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Lösenordet måste vara minst 6 tecken");
      return;
    }

    if (!invitation) return;

    setSubmitting(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            invitation_token: token,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast.success("Konto skapat! Du är nu inloggad.");
      navigate("/maklare");
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast.error(error.message || "Ett fel uppstod vid registrering");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-destructive">Inbjudan ogiltig</CardTitle>
            <CardDescription>
              Denna inbjudan är antingen använd eller har gått ut (giltig max 48h).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>Till startsidan</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Välkommen!</CardTitle>
          <CardDescription>
            Du har blivit inbjuden till {invitation.agency_name} som {invitation.role === "maklare" ? "mäklare" : "byrå-admin"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                value={invitation.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Fullständigt namn *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ditt fullständiga namn"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Lösenord *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minst 6 tecken"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bekräfta lösenord *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Bekräfta ditt lösenord"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Skapar konto...
                </>
              ) : (
                "Skapa konto"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationAccept;
