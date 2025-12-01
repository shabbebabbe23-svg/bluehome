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

        // Check if expired
        const now = new Date();
        const isExpired = new Date(data.expires_at) < now;

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
      console.log("Starting signup with invitation token:", token);
      
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            invitation_token: token,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error("Signup error:", error);
        // Handle user already exists
        if (error.message?.includes('already been registered') || 
            error.message?.includes('User already registered') ||
            error.code === 'user_already_exists') {
          toast.error("Detta email är redan registrerat. Om du redan har ett konto, logga in istället på startsidan.");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }
        throw error;
      }

      console.log("Signup successful, user created:", signUpData.user?.id);

      // Mark invitation as used
      const { error: updateError } = await supabase
        .from("agency_invitations")
        .update({ used_at: new Date().toISOString() })
        .eq("token", token);

      if (updateError) {
        console.error("Error marking invitation as used:", updateError);
      }

      toast.success("Konto skapat! Du är nu inloggad.");
      
      // Navigate based on role
      if (invitation.role === "agency_admin") {
        navigate("/byra-admin");
      } else {
        navigate("/maklare");
      }
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

              {/* Logo */}
              <div className="flex items-center gap-2">
                <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)' }} />
                      <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)' }} />
                    </linearGradient>
                  </defs>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="url(#homeGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="9 22 9 12 15 12 15 22" stroke="url(#homeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xl md:text-2xl font-bold bg-hero-gradient bg-clip-text text-transparent">
                  BaraHem
                </span>
              </div>

              {/* Spacer för symmetri */}
              <div className="w-9"></div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="pt-24 flex items-center justify-center min-h-screen p-4">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
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

            {/* Logo */}
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)' }} />
                    <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)' }} />
                  </linearGradient>
                </defs>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="url(#homeGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="9 22 9 12 15 12 15 22" stroke="url(#homeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xl md:text-2xl font-bold bg-hero-gradient bg-clip-text text-transparent">
                BaraHem
              </span>
            </div>

            {/* Spacer för symmetri */}
            <div className="w-9"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="pt-24 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Välkommen till {invitation.agency_name}!</CardTitle>
          <CardDescription>
            Du har blivit inbjuden som {invitation.role === "maklare" ? "mäklare" : "byrå-admin"}. Skapa ditt lösenord för att komma igång.
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
              <Label htmlFor="password">Välj lösenord *</Label>
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
                placeholder="Ange lösenordet igen"
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
                "Registrera dig"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default InvitationAccept;
