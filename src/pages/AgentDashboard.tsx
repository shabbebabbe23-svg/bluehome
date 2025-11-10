import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Plus, Archive, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("add");

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Utloggad");
      navigate("/login");
    } catch (error) {
      toast.error("Kunde inte logga ut");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Mäklarpanel</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              Till startsidan
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logga ut
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Hantera fastigheter</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="add" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Lägg till ny bostad
                </TabsTrigger>
                <TabsTrigger value="existing" className="gap-2">
                  <Home className="w-4 h-4" />
                  Befintliga bostäder
                </TabsTrigger>
                <TabsTrigger value="removed" className="gap-2">
                  <Archive className="w-4 h-4" />
                  Borttagna bostäder
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="mt-6">
                <div className="text-center py-12">
                  <Plus className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Lägg till ny fastighet</h3>
                  <p className="text-muted-foreground mb-6">
                    Formulär för att lägga till nya fastigheter kommer här
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="existing" className="mt-6">
                <div className="text-center py-12">
                  <Home className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Befintliga fastigheter</h3>
                  <p className="text-muted-foreground mb-6">
                    Lista över dina aktiva fastigheter kommer här
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="removed" className="mt-6">
                <div className="text-center py-12">
                  <Archive className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Borttagna fastigheter</h3>
                  <p className="text-muted-foreground mb-6">
                    Lista över borttagna fastigheter kommer här
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AgentDashboard;
