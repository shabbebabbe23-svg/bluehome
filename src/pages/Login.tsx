import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Building2, Home } from "lucide-react";
import Header from "@/components/Header";
import loginHero from "@/assets/login-hero.jpg";

type UserRole = "mäklare" | "säljare" | "köpare" | null;

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const roles = [
    {
      id: "mäklare" as const,
      title: "Mäklare",
      description: "För fastighetsmäklare",
      icon: Building2
    },
    {
      id: "säljare" as const,
      title: "Säljare",
      description: "För dig som vill sälja",
      icon: Home
    },
    {
      id: "köpare" as const,
      title: "Köpare",
      description: "För dig som vill köpa",
      icon: UserCheck
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic with Supabase
    console.log("Login attempt:", { role: selectedRole, ...formData });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        <main className="pt-16">
        <div className="container max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-4">
              Logga in på Bluehome
            </h1>
            <p className="text-xl text-white/90 drop-shadow-md">
              Välj din användarroll för att fortsätta
            </p>
          </div>

          {!selectedRole ? (
            <div className="grid md:grid-cols-3 gap-6">
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <Card 
                    key={role.id}
                    className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl border-2 hover:border-primary/50 bg-white/90 backdrop-blur-md"
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
                        <IconComponent className="w-8 h-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">{role.title}</CardTitle>
                      <CardDescription className="text-lg">
                        {role.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button className="w-full bg-hero-gradient hover:scale-105 transition-transform">
                        Välj {role.title}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <Card className="bg-white/90 backdrop-blur-md border-2 shadow-xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl mb-2">
                    Logga in som {selectedRole}
                  </CardTitle>
                  <CardDescription>
                    Ange dina inloggningsuppgifter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Användarnamn</Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Ange ditt användarnamn"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Lösenord</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Ange ditt lösenord"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-hero-gradient hover:scale-105 transition-transform"
                    >
                      Logga in
                    </Button>
                  </form>
                  
                  <div className="text-center mt-6 space-y-2">
                    <p className="text-sm text-foreground/60">
                      Har du inget konto?{" "}
                      <Link to="/registrera" className="text-primary hover:underline font-medium">
                        Skapa konto
                      </Link>
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedRole(null)}
                      className="text-sm"
                    >
                      Välj annan roll
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
};

export default Login;