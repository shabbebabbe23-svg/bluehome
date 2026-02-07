import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

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
        // Use secure function to fetch invitation by token (doesn't expose full table)
        const { data: invitationData, error: invitationError } = await supabase
          .rpc("get_invitation_by_token", { p_token: token });

        if (invitationError || !invitationData || invitationData.length === 0) {
          // Token not found, already used, or expired
          setInvitation(null);
          setLoading(false);
          return;
        }

        const inv = invitationData[0];
        setInvitation({
          email: inv.email,
          agency_id: inv.agency_id,
          role: inv.role,
          agency_name: inv.agency_name || "",
          expires_at: inv.expires_at,
          used_at: null, // Function only returns unused invitations
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
        if (error.message?.includes('already been registered') || 
            error.message?.includes('User already registered') ||
            error.code === 'user_already_exists') {
          toast.error("Detta email är redan registrerat. Om du redan har ett konto, logga in istället på startsidan.");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }
        throw error;
      }

      const { error: updateError } = await supabase
        .from("agency_invitations")
        .update({ used_at: new Date().toISOString() })
        .eq("token", token);

      if (updateError) {
        console.error("Error marking invitation as used:", updateError);
      }

      // Logga ut användaren så att de måste logga in manuellt
      await supabase.auth.signOut();

      // Navigera till bekräftelsesidan
      navigate("/mail-confirmation");
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast.error(error.message || "Ett fel uppstod vid registrering");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 30%))' }}>
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 30%))' }}>
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Inbjudan ogiltig</h1>
              <p className="text-muted-foreground">
                Denna inbjudan är antingen redan använd eller har gått ut.
              </p>
            </div>
            <Button 
              onClick={() => navigate("/")} 
              className="w-full"
              style={{ background: 'linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 30%))' }}
            >
              Till startsidan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 30%))' }}>
      {/* Bakgrundsbild med overlay */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Dekorativa cirklar */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      {/* Huvudkort */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 text-center border-b border-border/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)' }} />
                    <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)' }} />
                  </linearGradient>
                </defs>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="url(#logoGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="9 22 9 12 15 12 15 22" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-2xl font-bold bg-gradient-to-r from-[hsl(30,40%,50%)] to-[hsl(25,50%,40%)] bg-clip-text text-transparent">
                BaraHem
              </span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Välkommen till {invitation.agency_name}!
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Du har blivit inbjuden som {invitation.role === "maklare" ? "mäklare" : "byrå-administratör"}
            </p>
          </div>

          {/* Formulär */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                E-postadress
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={invitation.email}
                  disabled
                  className="bg-muted/50 pl-10"
                />
                <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              </div>
            </div>

            {/* Lösenord */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Välj lösenord
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Minst 6 tecken"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Bekräfta lösenord */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Bekräfta lösenord
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ange lösenordet igen"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Submit-knapp */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              style={{ background: 'linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 30%))' }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Skapar konto...
                </>
              ) : (
                "Skapa mitt konto"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="px-6 pb-6">
            <p className="text-xs text-center text-muted-foreground">
              Genom att skapa ett konto godkänner du våra användarvillkor och integritetspolicy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationAccept;
