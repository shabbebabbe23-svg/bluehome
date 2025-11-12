import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Home, Plus, Archive, LogOut, BarChart3, Calendar, UserCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PropertyForm } from "@/components/PropertyForm";
import { AgentStatistics } from "@/components/AgentStatistics";
import { ProfileForm } from "@/components/ProfileForm";
import PropertyCard from "@/components/PropertyCard";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("add");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Generate array of years from 2020 to current year
  const years = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => (2020 + i).toString()
  ).reverse();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["add", "existing", "removed", "statistics", "profile"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch agent's active properties
  const { data: properties, isLoading: isLoadingProperties, refetch } = useQuery({
    queryKey: ["agent-properties", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ is_deleted: true })
        .eq("id", propertyId);

      if (error) throw error;
      
      toast.success("Fastighet borttagen");
      refetch();
    } catch (error) {
      toast.error("Kunde inte ta bort fastighet");
    }
  };

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase
        .from("properties")
        .update({
          title: formData.get("title") as string,
          address: formData.get("address") as string,
          location: formData.get("location") as string,
          type: formData.get("type") as string,
          price: Number(formData.get("price")),
          bedrooms: Number(formData.get("bedrooms")),
          bathrooms: Number(formData.get("bathrooms")),
          area: Number(formData.get("area")),
          fee: Number(formData.get("fee")),
          description: formData.get("description") as string,
          viewing_date: formData.get("viewing_date") 
            ? new Date(formData.get("viewing_date") as string).toISOString() 
            : null,
        })
        .eq("id", editingProperty.id);

      if (error) throw error;
      
      toast.success("Fastighet uppdaterad");
      setIsEditDialogOpen(false);
      setEditingProperty(null);
      refetch();
    } catch (error) {
      toast.error("Kunde inte uppdatera fastighet");
    }
  };

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
      <header className="border-b bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 text-white" />
            <h1 className="text-2xl font-bold text-white">Mäklarpanel</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/90">{user?.email}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/")}
              className="bg-white text-primary hover:bg-white/90 border-white font-semibold"
            >
              Till startsidan
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleSignOut}
              className="bg-white text-red-600 hover:bg-white/90 border-white font-semibold"
            >
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
              <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-blue-600 to-green-600 p-1">
                <TabsTrigger 
                  value="add" 
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20"
                >
                  <Plus className="w-4 h-4" />
                  Lägg till ny bostad
                </TabsTrigger>
                <TabsTrigger 
                  value="existing" 
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20"
                >
                  <Home className="w-4 h-4" />
                  Befintliga bostäder
                </TabsTrigger>
                <TabsTrigger 
                  value="removed" 
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20"
                >
                  <Archive className="w-4 h-4" />
                  Borttagna bostäder
                </TabsTrigger>
                <TabsTrigger 
                  value="statistics" 
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20"
                >
                  <BarChart3 className="w-4 h-4" />
                  Din statistik
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20"
                >
                  <UserCircle className="w-4 h-4" />
                  Min profil
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="mt-6">
                <PropertyForm
                  onSuccess={() => {
                    setActiveTab("existing");
                    toast.success("Fastighet tillagd!");
                  }}
                />
              </TabsContent>

              <TabsContent value="existing" className="mt-6">
                {isLoadingProperties ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-96" />
                    ))}
                  </div>
                ) : properties && properties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <div key={property.id} className="relative group">
                        <PropertyCard
                          id={property.id}
                          title={property.address}
                          location={property.location}
                          price={`${property.price.toLocaleString('sv-SE')} kr`}
                          type={property.type}
                          bedrooms={property.bedrooms}
                          bathrooms={property.bathrooms}
                          area={property.area}
                          image={property.image_url || ""}
                          hoverImage={property.hover_image_url || undefined}
                          hasVR={property.has_vr || false}
                          listedDate={property.listed_date || undefined}
                          isSold={property.is_sold || false}
                          soldDate={property.sold_date || undefined}
                          vendorLogo={property.vendor_logo_url || undefined}
                          viewingDate={property.viewing_date ? new Date(property.viewing_date) : undefined}
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => handleEditProperty(property)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeleteProperty(property.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Home className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Inga aktiva fastigheter</h3>
                    <p className="text-muted-foreground mb-6">
                      Du har inga aktiva fastigheter för tillfället
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="removed" className="mt-6">
                <div className="text-center py-12">
                  <Archive className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Borttagna fastigheter</h3>
                  <p className="text-muted-foreground mb-6">
                    Lista över borttagna fastigheter kommer här
                  </p>
                  
                  {/* Year selector */}
                  <div className="max-w-xs mx-auto">
                    <Label htmlFor="year-select" className="text-base mb-2 block">
                      Filtrera efter år
                    </Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger id="year-select" className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Välj år" />
                      </SelectTrigger>
                      <SelectContent className="animate-in slide-in-from-top-4 fade-in-0 duration-500 origin-top">
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="statistics" className="mt-6">
                <AgentStatistics />
              </TabsContent>

              <TabsContent value="profile" className="mt-6">
                <ProfileForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Edit Property Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Redigera fastighet</DialogTitle>
          </DialogHeader>
          {editingProperty && (
            <form onSubmit={handleUpdateProperty} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="edit-title">Titel</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={editingProperty.title}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-address">Adress</Label>
                  <Input
                    id="edit-address"
                    name="address"
                    defaultValue={editingProperty.address}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-location">Ort</Label>
                  <Input
                    id="edit-location"
                    name="location"
                    defaultValue={editingProperty.location}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-type">Typ</Label>
                  <Select name="type" defaultValue={editingProperty.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lägenhet">Lägenhet</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Radhus">Radhus</SelectItem>
                      <SelectItem value="Parhus">Parhus</SelectItem>
                      <SelectItem value="Fritidshus">Fritidshus</SelectItem>
                      <SelectItem value="Tomt">Tomt</SelectItem>
                      <SelectItem value="Bostadsrätt">Bostadsrätt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-price">Pris (kr)</Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    defaultValue={editingProperty.price}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-bedrooms">Sovrum</Label>
                  <Input
                    id="edit-bedrooms"
                    name="bedrooms"
                    type="number"
                    defaultValue={editingProperty.bedrooms}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-bathrooms">Badrum</Label>
                  <Input
                    id="edit-bathrooms"
                    name="bathrooms"
                    type="number"
                    defaultValue={editingProperty.bathrooms}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-area">Boarea (kvm)</Label>
                  <Input
                    id="edit-area"
                    name="area"
                    type="number"
                    defaultValue={editingProperty.area}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-fee">Månadsavgift (kr)</Label>
                  <Input
                    id="edit-fee"
                    name="fee"
                    type="number"
                    defaultValue={editingProperty.fee}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-viewing-date">Visningsdatum</Label>
                  <Input
                    id="edit-viewing-date"
                    name="viewing_date"
                    type="datetime-local"
                    defaultValue={
                      editingProperty.viewing_date
                        ? new Date(editingProperty.viewing_date)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="edit-description">Beskrivning</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={editingProperty.description}
                    rows={6}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Avbryt
                </Button>
                <Button type="submit">Spara ändringar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentDashboard;
