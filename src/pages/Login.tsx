import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import loginHero from "@/assets/login-hero.jpg";
import { ArrowLeft } from "lucide-react";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Ogiltig e-postadress" }).max(255),
  password: z.string().min(6, { message: "Lösenordet måste vara minst 6 tecken" }).max(100),
  confirmPassword: z.string().optional(),
  fullName: z.string().trim().min(2, { message: "Namn måste vara minst 2 tecken" }).max(100).optional(),
}).refine((data) => {
  // Only validate confirmPassword during signup
  if (data.fullName && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Lösenorden matchar inte",
  path: ["confirmPassword"],
});

type AuthMode = 'login' | 'signup' | 'forgot-password';

const Login = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in and redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailSchema = z.string().trim().email({ message: "Ogiltig e-postadress" }).max(255);
      emailSchema.parse(email);

      const redirectUrl = `${window.location.origin}/aterstall-losenord`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          title: "Något gick fel",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Återställningslänk skickad",
          description: "Kontrollera din e-post för att återställa ditt lösenord.",
        });
        setAuthMode('login');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Valideringsfel",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validationData = authMode === 'login' 
        ? { email, password }
        : { email, password, confirmPassword, fullName };
      
      authSchema.parse(validationData);

      if (authMode === 'login') {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Email not confirmed")) {
            toast({
              title: "E-post ej bekräftad",
              description: "Du måste bekräfta din e-postadress innan du kan logga in. Kontrollera din inkorg.",
              variant: "destructive",
            });
          } else if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Fel e-post eller lösenord",
              description: "Kontrollera dina uppgifter och försök igen.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Inloggningen misslyckades",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          // Check if user is a buyer and should be redirected to preferences
          const { data: userData } = await supabase.auth.getUser();
          const userId = userData?.user?.id;
          
          if (userId) {
            // Check user role
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('user_type')
              .eq('user_id', userId)
              .single();
            
            // Check if buyer has preferences set
            if (roleData?.user_type === 'buyer' || roleData?.user_type === 'user') {
              const { data: prefsData } = await (supabase
                .from('buyer_preferences' as any)
                .select('id')
                .eq('user_id', userId)
                .single() as any);
              
              if (!prefsData) {
                // No preferences yet, redirect to min-bostad
                toast({
                  title: "Välkommen!",
                  description: "Låt oss börja med att ställa in dina bostadspreferenser.",
                });
                navigate("/min-bostad");
                return;
              }
            }
          }
          
          toast({
            title: "Välkommen tillbaka!",
            description: "Du är nu inloggad.",
          });
          navigate("/");
        }
      } else {
        // Signup - automatically set user_type to 'buyer' for all public registrations
        // Redirect to min-bostad after email confirmation so they can set preferences
        const redirectUrl = `${window.location.origin}/min-bostad`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
              user_type: 'buyer',
            },
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Kontot finns redan",
              description: "Ett konto med denna e-post finns redan. Försök logga in istället.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Registreringen misslyckades",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Konto skapat!",
            description: "Kontrollera din e-post för att bekräfta ditt konto.",
          });
          setAuthMode('login');
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Valideringsfel",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case 'login': return "Logga in";
      case 'signup': return "Skapa konto";
      case 'forgot-password': return "Glömt lösenord";
    }
  };

  const getDescription = () => {
    switch (authMode) {
      case 'login': return "Ange dina uppgifter för att logga in";
      case 'signup': return "Fyll i formuläret för att skapa ett konto";
      case 'forgot-password': return "Ange din e-postadress så skickar vi en återställningslänk";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${loginHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-white/85 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {getTitle()}
            </CardTitle>
            <CardDescription className="text-center">
              {getDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authMode === 'forgot-password' ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="namn@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="premium"
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Skickar..." : "Skicka återställningslänk"}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Tillbaka till inloggning
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Fullständigt namn</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Ditt namn"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={authMode === 'signup'}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="namn@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Lösenord</Label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot-password')}
                        className="text-sm text-primary hover:underline"
                      >
                        Glömt lösenord?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Upprepa lösenord</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={authMode === 'signup'}
                    />
                  </div>
                )}
                <Button 
                  type="submit" 
                  variant="premium"
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Laddar..." : (authMode === 'login' ? "Logga in" : "Skapa konto")}
                </Button>
                <div className="text-center text-sm space-y-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-primary hover:underline"
                  >
                    {authMode === 'login' 
                      ? "Har du inget konto? Registrera dig här" 
                      : "Har du redan ett konto? Logga in här"}
                  </button>
                  <div>
                    <Link to="/" className="text-muted-foreground hover:underline">
                      Tillbaka till startsidan
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
