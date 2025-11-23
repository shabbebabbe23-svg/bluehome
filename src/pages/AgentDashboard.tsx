import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Home, Plus, Archive, LogOut, BarChart3, Calendar, UserCircle, Pencil, Trash2, X, Upload, Image as ImageIcon, Gavel } from "lucide-react";
import confetti from 'canvas-confetti';
import agentDashboardBg from "@/assets/agent-dashboard-bg.jpg";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
const AgentDashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("add");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Image handling states
  const [editMainImage, setEditMainImage] = useState<File | null>(null);
  const [editMainImagePreview, setEditMainImagePreview] = useState<string>("");
  const [editHoverImage, setEditHoverImage] = useState<File | null>(null);
  const [editHoverImagePreview, setEditHoverImagePreview] = useState<string>("");
  const [editFloorplanImages, setEditFloorplanImages] = useState<File[]>([]);
  const [editFloorplanImagePreviews, setEditFloorplanImagePreviews] = useState<string[]>([]);
  const [existingFloorplanImages, setExistingFloorplanImages] = useState<string[]>([]);
  const [editAdditionalImages, setEditAdditionalImages] = useState<File[]>([]);
  const [editAdditionalImagePreviews, setEditAdditionalImagePreviews] = useState<string[]>([]);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<{
    main?: boolean;
    hover?: boolean;
    floorplan: string[];
    additional: string[];
  }>({ floorplan: [], additional: [] });

  // Bidding states
  const [editDialogTab, setEditDialogTab] = useState("property");
  const [newBidAmount, setNewBidAmount] = useState<string>("");
  const [bidderName, setBidderName] = useState("");
  const [bidderEmail, setBidderEmail] = useState("");
  const [bidderPhone, setBidderPhone] = useState("");
  const [bidderLabel, setBidderLabel] = useState("");

  // Generate array of years from 2020 to current year
  const years = Array.from({
    length: new Date().getFullYear() - 2019
  }, (_, i) => (2020 + i).toString()).reverse();
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["add", "existing", "removed", "statistics", "profile"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch agent's active properties
  // Fetch agent's profile
  const { data: profile } = useQuery({
    queryKey: ["agent-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch agent's active properties
  const {
    data: properties,
    isLoading: isLoadingProperties,
    refetch
  } = useQuery({
    queryKey: ["agent-properties", user?.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("properties").select("*").eq("user_id", user?.id).eq("is_deleted", false).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch agent's removed properties
  const {
    data: removedProperties,
    isLoading: isLoadingRemovedProperties,
    refetch: refetchRemoved
  } = useQuery({
    queryKey: ["agent-removed-properties", user?.id, selectedYear],
    queryFn: async () => {
      const startOfYear = `${selectedYear}-01-01T00:00:00`;
      const endOfYear = `${selectedYear}-12-31T23:59:59`;
      
      const {
        data,
        error
      } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_deleted", true)
        .gte("updated_at", startOfYear)
        .lte("updated_at", endOfYear)
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch bids for the currently editing property
  const { data: propertyBids, refetch: refetchBids } = useQuery({
    queryKey: ["property-bids", editingProperty?.id],
    queryFn: async () => {
      if (!editingProperty?.id) return [];
      const { data, error } = await supabase
        .from("property_bids")
        .select("*")
        .eq("property_id", editingProperty.id)
        .order("bid_amount", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!editingProperty?.id
  });
  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const {
        error
      } = await supabase.from("properties").update({
        is_deleted: true
      }).eq("id", propertyId);
      if (error) throw error;
      toast.success("Fastighet borttagen");
      refetch();
      refetchRemoved();
    } catch (error) {
      toast.error("Kunde inte ta bort fastighet");
    }
  };
  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setIsEditDialogOpen(true);
    setEditDialogTab("property");
    
    setEditMainImage(null);
    setEditMainImagePreview(property.image_url || "");
    setEditHoverImage(null);
    setEditHoverImagePreview(property.hover_image_url || "");
    setEditFloorplanImages([]);
    setEditFloorplanImagePreviews([]);
    setExistingFloorplanImages(property.floorplan_images || []);
    setEditAdditionalImages([]);
    setEditAdditionalImagePreviews([]);
    setExistingAdditionalImages(property.additional_images || []);
    setRemovedImages({ floorplan: [], additional: [] });

    setNewBidAmount("");
    setBidderName("");
    setBidderEmail("");
    setBidderPhone("");
    setBidderLabel("");
  };

  const handleAddBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty?.id || !newBidAmount) return;

    try {
      // Insert the new bid
      const { error: bidError } = await supabase
        .from("property_bids")
        .insert({
          property_id: editingProperty.id,
          bid_amount: parseInt(newBidAmount),
          bidder_name: bidderName || null,
          bidder_email: bidderEmail || null,
          bidder_phone: bidderPhone || null,
          bidder_label: bidderLabel || null,
        });

      if (bidError) throw bidError;

      // Update the property's new_price with the new bid amount (from bidding, not manual)
      const { error: updateError } = await supabase
        .from("properties")
        .update({ 
          new_price: parseInt(newBidAmount),
          is_manual_price_change: false
        })
        .eq("id", editingProperty.id);

      if (updateError) throw updateError;

      toast.success("Bud tillagt och pris uppdaterat!");
      setNewBidAmount("");
      setBidderName("");
      setBidderEmail("");
      setBidderPhone("");
      setBidderLabel("");
      refetchBids();
      refetch(); // Refresh the properties list
      
      // Update local editing property to reflect the new price
      setEditingProperty({
        ...editingProperty,
        new_price: parseInt(newBidAmount)
      });
    } catch (error) {
      console.error("Error adding bid:", error);
      toast.error("Kunde inte lägga till bud");
    }
  };

  const handleDeleteBid = async (bidId: string) => {
    try {
      // Delete the bid
      const { error: deleteError } = await supabase
        .from("property_bids")
        .delete()
        .eq("id", bidId);

      if (deleteError) throw deleteError;

      // Get remaining bids for this property to update the price
      const { data: remainingBids, error: fetchError } = await supabase
        .from("property_bids")
        .select("bid_amount")
        .eq("property_id", editingProperty.id)
        .order("bid_amount", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      // Update property price based on remaining bids
      const newPrice = remainingBids && remainingBids.length > 0 
        ? remainingBids[0].bid_amount 
        : null;

      const { error: updateError } = await supabase
        .from("properties")
        .update({ 
          new_price: newPrice,
          is_manual_price_change: false
        })
        .eq("id", editingProperty.id);

      if (updateError) throw updateError;

      toast.success("Bud borttaget och pris uppdaterat");
      refetchBids();
      refetch(); // Refresh the properties list
      
      // Update local editing property
      setEditingProperty({
        ...editingProperty,
        new_price: newPrice
      });
    } catch (error) {
      console.error("Error deleting bid:", error);
      toast.error("Kunde inte ta bort bud");
    }
  };

  // Generate bid amount options with smart increments up to 60 million kr
  const generateBidOptions = () => {
    if (!editingProperty?.price) return [];
    const basePrice = editingProperty.price;
    const maxPrice = 60000000; // 60 miljoner
    const options = [];
    
    let currentPrice = basePrice;
    
    while (currentPrice <= maxPrice) {
      options.push(currentPrice);
      
      // Dynamic increments based on price range
      if (currentPrice < 2000000) {
        currentPrice += 5000;      // 5k steg under 2M
      } else if (currentPrice < 5000000) {
        currentPrice += 10000;     // 10k steg 2-5M
      } else if (currentPrice < 10000000) {
        currentPrice += 25000;     // 25k steg 5-10M
      } else if (currentPrice < 20000000) {
        currentPrice += 50000;     // 50k steg 10-20M
      } else if (currentPrice < 40000000) {
        currentPrice += 100000;    // 100k steg 20-40M
      } else {
        currentPrice += 250000;    // 250k steg 40-60M
      }
    }
    
    return options;
  };

  const handleEditImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'main' | 'hover'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Bilden får inte vara större än 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'main') {
        setEditMainImage(file);
        setEditMainImagePreview(reader.result as string);
        setRemovedImages(prev => ({ ...prev, main: false }));
      } else if (type === 'hover') {
        setEditHoverImage(file);
        setEditHoverImagePreview(reader.result as string);
        setRemovedImages(prev => ({ ...prev, hover: false }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEditImage = (type: 'main' | 'hover') => {
    if (type === 'main') {
      setEditMainImage(null);
      setEditMainImagePreview("");
      setRemovedImages(prev => ({ ...prev, main: true }));
    } else if (type === 'hover') {
      setEditHoverImage(null);
      setEditHoverImagePreview("");
      setRemovedImages(prev => ({ ...prev, hover: true }));
    }
  };

  const handleEditAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} är för stor (max 5MB)`);
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAdditionalImages(prev => [...prev, file]);
        setEditAdditionalImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEditAdditionalImage = (index: number) => {
    setEditAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setEditAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAdditionalImage = (url: string) => {
    setExistingAdditionalImages(prev => prev.filter(img => img !== url));
    setRemovedImages(prev => ({ ...prev, additional: [...prev.additional, url] }));
  };

  const handleEditFloorplanImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} är för stor (max 5MB)`);
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFloorplanImages(prev => [...prev, file]);
        setEditFloorplanImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEditFloorplanImage = (index: number) => {
    setEditFloorplanImages(prev => prev.filter((_, i) => i !== index));
    setEditFloorplanImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFloorplanImage = (url: string) => {
    setExistingFloorplanImages(prev => prev.filter(img => img !== url));
    setRemovedImages(prev => ({ ...prev, floorplan: [...prev.floorplan, url] }));
  };

  const uploadImage = async (file: File, folder: string = 'properties') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };
  const handleUpdateProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      // Upload new images
      let mainImageUrl = editingProperty.image_url;
      let hoverImageUrl = editingProperty.hover_image_url;
      let floorplanImagesUrls = [...existingFloorplanImages];
      let additionalImagesUrls = [...existingAdditionalImages];

      // Handle main image
      if (editMainImage) {
        mainImageUrl = await uploadImage(editMainImage);
      } else if (removedImages.main) {
        mainImageUrl = null;
      }

      // Handle hover image
      if (editHoverImage) {
        hoverImageUrl = await uploadImage(editHoverImage);
      } else if (removedImages.hover) {
        hoverImageUrl = null;
      }

      // Handle floorplan images
      for (const file of editFloorplanImages) {
        const url = await uploadImage(file);
        floorplanImagesUrls.push(url);
      }

      // Handle additional images
      for (const file of editAdditionalImages) {
        const url = await uploadImage(file);
        additionalImagesUrls.push(url);
      }

      const newPriceValue = formData.get("new_price") as string;
      const viewingDateValue = formData.get("viewing_date") as string;
      
      const { error } = await supabase.from("properties").update({
        title: formData.get("title") as string,
        address: formData.get("address") as string,
        location: formData.get("location") as string,
        type: formData.get("type") as string,
        price: Number(formData.get("price")),
        new_price: newPriceValue ? Number(newPriceValue) : null,
        is_manual_price_change: !!newPriceValue,
        bedrooms: Number(formData.get("bedrooms")),
        bathrooms: Number(formData.get("bathrooms")),
        area: Number(formData.get("area")),
        description: formData.get("description") as string,
        fee: Number(formData.get("fee")),
        viewing_date: viewingDateValue || null,
        image_url: mainImageUrl,
        hover_image_url: hoverImageUrl,
        floorplan_images: floorplanImagesUrls,
        additional_images: additionalImagesUrls
      }).eq("id", editingProperty.id);
      
      if (error) throw error;
      toast.success("Fastighet uppdaterad");
      setIsEditDialogOpen(false);
      setEditingProperty(null);
      refetch();
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Kunde inte uppdatera fastighet");
    } finally {
      setIsUpdating(false);
    }
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Utloggad");
    } catch (error) {
      toast.error("Kunde inte logga ut");
    }
  };
  return <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${agentDashboardBg})` }}>
      {/* Header */}
      <header className="border-b" style={{ background: 'var(--main-gradient)' }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Home className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-hero-gradient">Mäklarpanel</h1>
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="bg-white text-foreground hover:bg-hero-gradient hover:text-white border-white font-semibold transition-all">
              Till startsidan
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xl bg-clip-text text-transparent bg-hero-gradient">{profile?.full_name || user?.email}</span>
            <Button variant="destructive" size="sm" onClick={handleSignOut} className="bg-red-600 text-white hover:bg-red-700 font-semibold">
              <LogOut className="w-4 h-4 mr-2" />
              Logga ut
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 bg-background/80 backdrop-blur-sm rounded-lg my-4">
        <Card>
          <CardHeader>
            <CardTitle>Hantera fastigheter</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 p-1 bg-hero-gradient">
                <TabsTrigger value="add" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20 flex-col sm:flex-row py-2 sm:py-auto">
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  {activeTab === "add" && <span className="text-[10px] sm:text-sm truncate">Lägg till ny bostad</span>}
                </TabsTrigger>
                <TabsTrigger value="existing" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20 flex-col sm:flex-row py-2 sm:py-auto">
                  <Home className="w-4 h-4 flex-shrink-0" />
                  {activeTab === "existing" && <span className="text-[10px] sm:text-sm truncate">Befintliga bostäder</span>}
                </TabsTrigger>
                <TabsTrigger value="removed" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20 flex-col sm:flex-row py-2 sm:py-auto">
                  <Archive className="w-4 h-4 flex-shrink-0" />
                  {activeTab === "removed" && <span className="text-[10px] sm:text-sm truncate">Borttagna bostäder</span>}
                </TabsTrigger>
                <TabsTrigger value="statistics" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20 flex-col sm:flex-row py-2 sm:py-auto">
                  <BarChart3 className="w-4 h-4 flex-shrink-0" />
                  {activeTab === "statistics" && <span className="text-[10px] sm:text-sm truncate">Din statistik</span>}
                </TabsTrigger>
                <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20 flex-col sm:flex-row py-2 sm:py-auto">
                  <UserCircle className="w-4 h-4 flex-shrink-0" />
                  {activeTab === "profile" && <span className="text-[10px] sm:text-sm truncate">Min profil</span>}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="mt-6">
                <PropertyForm onSuccess={() => {
                setActiveTab("existing");
                toast.success("Fastighet tillagd!");
              }} />
              </TabsContent>

              <TabsContent value="existing" className="mt-6 max-h-[calc(100vh-400px)] overflow-y-auto">
                {isLoadingProperties ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96" />)}
                  </div> : properties && properties.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map(property => <div key={property.id} className="relative group">
                        <PropertyCard 
                          id={property.id} 
                          title={property.address} 
                          location={property.location} 
                          price={`${property.price.toLocaleString('sv-SE')} kr`} 
                          newPrice={property.new_price ? `${property.new_price.toLocaleString('sv-SE')} kr` : undefined} 
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
                          soldPrice={property.sold_price ? `${property.sold_price.toLocaleString('sv-SE')} kr` : undefined} 
                          vendorLogo={property.vendor_logo_url || undefined} 
                          viewingDate={property.viewing_date ? new Date(property.viewing_date) : undefined} 
                          hideControls={true}
                          buttonText="Redigera fastighet"
                          onButtonClick={() => handleEditProperty(property)}
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="destructive" onClick={() => handleDeleteProperty(property.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>)}
                  </div> : <div className="text-center py-12">
                    <Home className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Inga aktiva fastigheter</h3>
                    <p className="text-muted-foreground mb-6">
                      Du har inga aktiva fastigheter för tillfället
                    </p>
                  </div>}
              </TabsContent>

              <TabsContent value="removed" className="mt-6 max-h-[calc(100vh-400px)] overflow-y-auto">
                <div className="mb-6">
                  {/* Year selector */}
                  <div className="max-w-xs">
                    <Label htmlFor="year-select" className="text-base mb-2 block">
                      Filtrera efter år
                    </Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger id="year-select" className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Välj år" />
                      </SelectTrigger>
                      <SelectContent className="animate-in slide-in-from-top-4 fade-in-0 duration-500 origin-top">
                        {years.map(year => <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isLoadingRemovedProperties ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96" />)}
                  </div>
                ) : removedProperties && removedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {removedProperties.map(property => (
                      <div key={property.id} className="relative">
                        <PropertyCard 
                          id={property.id} 
                          title={property.address} 
                          location={property.location} 
                          price={`${property.price.toLocaleString('sv-SE')} kr`} 
                          newPrice={property.new_price ? `${property.new_price.toLocaleString('sv-SE')} kr` : undefined} 
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
                          soldPrice={property.sold_price ? `${property.sold_price.toLocaleString('sv-SE')} kr` : undefined} 
                          vendorLogo={property.vendor_logo_url || undefined} 
                          viewingDate={property.viewing_date ? new Date(property.viewing_date) : undefined} 
                          hideControls={true}
                          buttonText="Visa detaljer"
                          onButtonClick={() => navigate(`/property/${property.id}`)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Archive className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Inga borttagna fastigheter</h3>
                    <p className="text-muted-foreground">
                      Du har inga borttagna fastigheter för år {selectedYear}
                    </p>
                  </div>
                )}
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
            <Tabs value={editDialogTab} onValueChange={setEditDialogTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 p-1 bg-hero-gradient">
                <TabsTrigger value="property" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20">
                  <Pencil className="w-4 h-4" />
                  Fastighetsinfo
                </TabsTrigger>
                <TabsTrigger value="bidding" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20">
                  <Gavel className="w-4 h-4" />
                  Budgivning
                </TabsTrigger>
              </TabsList>

              <TabsContent value="property">
                <form onSubmit={handleUpdateProperty} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="edit-title">Titel</Label>
                  <Input id="edit-title" name="title" defaultValue={editingProperty.title} required />
                </div>

                <div>
                  <Label htmlFor="edit-address">Adress</Label>
                  <Input id="edit-address" name="address" defaultValue={editingProperty.address} required />
                </div>

                <div>
                  <Label htmlFor="edit-location">Ort</Label>
                  <Input id="edit-location" name="location" defaultValue={editingProperty.location} required />
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
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-price">Pris (kr)</Label>
                  <Input id="edit-price" name="price" type="number" defaultValue={editingProperty.price} required />
                </div>

                <div>
                  <Label htmlFor="edit-bedrooms">Sovrum</Label>
                  <Input id="edit-bedrooms" name="bedrooms" type="number" defaultValue={editingProperty.bedrooms} required />
                </div>

                <div>
                  <Label htmlFor="edit-new-price">Nytt pris (kr)</Label>
                  <Input id="edit-new-price" name="new_price" type="number" defaultValue={editingProperty.new_price || ''} placeholder="Ange nytt pris om priset har ändrats" />
                </div>

                <div>
                  <Label htmlFor="edit-bathrooms">Badrum</Label>
                  <Input id="edit-bathrooms" name="bathrooms" type="number" defaultValue={editingProperty.bathrooms} required />
                </div>

                <div>
                  <Label htmlFor="edit-fee">Månadsavgift (kr)</Label>
                  <Input id="edit-fee" name="fee" type="number" defaultValue={editingProperty.fee} required />
                </div>

                <div>
                  <Label htmlFor="edit-area">Boarea (kvm)</Label>
                  <Input id="edit-area" name="area" type="number" defaultValue={editingProperty.area} required />
                </div>

                <div>
                  <Label htmlFor="edit-viewing-date">Visningsdatum</Label>
                  <Input id="edit-viewing-date" name="viewing_date" type="datetime-local" defaultValue={editingProperty.viewing_date ? new Date(editingProperty.viewing_date).toISOString().slice(0, 16) : ""} />
                </div>

                {/* Mark as sold button */}
                <div className="md:col-span-2">
                  {!editingProperty.is_sold ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        const soldPrice = window.prompt("Ange slutpris för fastigheten (kr):", editingProperty.price.toString());
                        if (soldPrice && !isNaN(Number(soldPrice))) {
                          try {
                            const { error } = await supabase
                              .from('properties')
                              .update({
                                is_sold: true,
                                sold_price: Number(soldPrice),
                                sold_date: new Date().toISOString()
                              })
                              .eq('id', editingProperty.id);

                            if (error) throw error;

                            // Trigger celebration confetti
                            confetti({
                              particleCount: 100,
                              spread: 70,
                              origin: { y: 0.6 },
                              colors: ['#0891b2', '#16a34a', '#22c55e', '#06b6d4']
                            });

                            toast.success("Grattis! Fastigheten har markerats som såld! 🎉");
                            await refetch();
                            setEditingProperty({...editingProperty, is_sold: true, sold_price: Number(soldPrice), sold_date: new Date().toISOString()});
                          } catch (error) {
                            console.error('Error marking property as sold:', error);
                            toast.error("Kunde inte markera fastighet som såld");
                          }
                        }
                      }}
                      className="w-full bg-gradient-to-r from-[hsl(200,98%,35%)] to-[hsl(142,76%,36%)] text-white hover:opacity-90 border-0"
                    >
                      Markera som såld
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          const newSoldPrice = window.prompt("Ange nytt slutpris för fastigheten (kr):", editingProperty.sold_price?.toString() || editingProperty.price.toString());
                          if (newSoldPrice && !isNaN(Number(newSoldPrice))) {
                            try {
                              const { error } = await supabase
                                .from('properties')
                                .update({
                                  sold_price: Number(newSoldPrice)
                                })
                                .eq('id', editingProperty.id);

                              if (error) throw error;

                              toast.success("Slutpriset har uppdaterats");
                              await refetch();
                              setEditingProperty({...editingProperty, sold_price: Number(newSoldPrice)});
                            } catch (error) {
                              console.error('Error updating sold price:', error);
                              toast.error("Kunde inte uppdatera slutpriset");
                            }
                          }
                        }}
                        className="flex-1"
                      >
                        Ändra slutpris
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={async () => {
                          if (window.confirm("Är du säker på att du vill ta bort såld-markeringen?")) {
                            try {
                              const { error } = await supabase
                                .from('properties')
                                .update({
                                  is_sold: false,
                                  sold_price: null,
                                  sold_date: null
                                })
                                .eq('id', editingProperty.id);

                              if (error) throw error;

                              toast.success("Såld-markeringen har tagits bort");
                              await refetch();
                              setEditingProperty({...editingProperty, is_sold: false, sold_price: null, sold_date: null});
                            } catch (error) {
                              console.error('Error removing sold status:', error);
                              toast.error("Kunde inte ta bort såld-markeringen");
                            }
                          }
                        }}
                        className="flex-1"
                      >
                        Ta bort såld
                      </Button>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="edit-description">Beskrivning</Label>
                  <Textarea id="edit-description" name="description" defaultValue={editingProperty.description} rows={6} required />
                </div>

                {/* Main Image */}
                <div>
                  <Label>Huvudbild</Label>
                  {editMainImagePreview && (
                    <div className="relative mt-2 mb-2">
                      <img src={editMainImagePreview} alt="Huvudbild" className="w-full h-48 object-cover rounded" />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveEditImage('main')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleEditImageChange(e, 'main')}
                    className="cursor-pointer"
                  />
                </div>

                {/* Hover Image */}
                <div>
                  <Label>Hover-bild (valfritt)</Label>
                  {editHoverImagePreview && (
                    <div className="relative mt-2 mb-2">
                      <img src={editHoverImagePreview} alt="Hover-bild" className="w-full h-48 object-cover rounded" />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveEditImage('hover')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleEditImageChange(e, 'hover')}
                    className="cursor-pointer"
                  />
                </div>

                {/* Floorplan Images */}
                <div className="md:col-span-2">
                  <Label>Planritningar (valfritt)</Label>
                  
                  {/* Existing floorplan images */}
                  {existingFloorplanImages.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {existingFloorplanImages.map((url, index) => (
                        <div key={`existing-floorplan-${index}`} className="relative">
                          <img src={url} alt={`Planlösning ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeExistingFloorplanImage(url)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New floorplan images */}
                  {editFloorplanImagePreviews.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {editFloorplanImagePreviews.map((preview, index) => (
                        <div key={`new-floorplan-${index}`} className="relative">
                          <img src={preview} alt={`Ny planlösning ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeEditFloorplanImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleEditFloorplanImagesChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Du kan välja flera ritningar samtidigt
                    </p>
                  </div>
                </div>

                {/* Additional Images */}
                <div>
                  <Label>Ytterligare bilder (valfritt)</Label>
                  
                  {/* Existing additional images */}
                  {existingAdditionalImages.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {existingAdditionalImages.map((url, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img src={url} alt={`Bild ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeExistingAdditionalImage(url)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New additional images */}
                  {editAdditionalImagePreviews.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {editAdditionalImagePreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="relative">
                          <img src={preview} alt={`Ny bild ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeEditAdditionalImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add more images button */}
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleEditAdditionalImagesChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Sparar..." : "Spara ändringar"}
                </Button>
              </div>
            </form>
              </TabsContent>

              <TabsContent value="bidding" className="space-y-6">
                {/* Add new bid form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Lägg till nytt bud</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddBid} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="bid-amount">Budbelopp (kr) *</Label>
                          <Select value={newBidAmount} onValueChange={setNewBidAmount} required>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Välj budbelopp" />
                            </SelectTrigger>
                            <SelectContent className="bg-background max-h-[300px]">
                              {generateBidOptions().map((amount) => (
                                <SelectItem key={amount} value={amount.toString()}>
                                  {amount.toLocaleString('sv-SE')} kr
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="bidder-label">Budgivare (ex. Budgivare 1, Budgivare 2) *</Label>
                          <Input
                            id="bidder-label"
                            value={bidderLabel}
                            onChange={(e) => setBidderLabel(e.target.value)}
                            placeholder="Ex. Budgivare 1"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="bidder-name">Budgivarens namn</Label>
                          <Input
                            id="bidder-name"
                            value={bidderName}
                            onChange={(e) => setBidderName(e.target.value)}
                            placeholder="Ex. Anna Andersson"
                          />
                        </div>

                        <div>
                          <Label htmlFor="bidder-email">E-post</Label>
                          <Input
                            id="bidder-email"
                            type="email"
                            value={bidderEmail}
                            onChange={(e) => setBidderEmail(e.target.value)}
                            placeholder="Ex. anna@example.com"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="bidder-phone">Telefonnummer</Label>
                          <Input
                            id="bidder-phone"
                            type="tel"
                            value={bidderPhone}
                            onChange={(e) => setBidderPhone(e.target.value)}
                            placeholder="Ex. 070-123 45 67"
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-hero-gradient hover:opacity-90 text-white shadow-lg transition-opacity">
                        <Gavel className="w-4 h-4 mr-2" />
                        Lägg till bud
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* List of existing bids */}
                <Card>
                  <CardHeader>
                    <CardTitle>Registrerade bud ({propertyBids?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!propertyBids || propertyBids.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Gavel className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Inga bud registrerade ännu</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {propertyBids.map((bid: any) => (
                          <div key={bid.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-1">
                              <div className="font-semibold text-lg">
                                {bid.bid_amount.toLocaleString('sv-SE')} kr
                              </div>
                              {bid.bidder_name && (
                                <div className="text-sm text-muted-foreground">{bid.bidder_name}</div>
                              )}
                              {bid.bidder_email && (
                                <div className="text-xs text-muted-foreground">{bid.bidder_email}</div>
                              )}
                              {bid.bidder_phone && (
                                <div className="text-xs text-muted-foreground">{bid.bidder_phone}</div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(bid.created_at).toLocaleString('sv-SE')}
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleDeleteBid(bid.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>;
};
export default AgentDashboard;