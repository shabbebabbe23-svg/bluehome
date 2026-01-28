import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Home, Plus, Archive, LogOut, BarChart3, Calendar, UserCircle, Pencil, Trash2, X, Upload, Image as ImageIcon, Gavel, User, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const [isNewProduction, setIsNewProduction] = useState(false);
  const [showViewerCount, setShowViewerCount] = useState(false);
  const [hasElevator, setHasElevator] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(false);
  const [isExecutiveAuction, setIsExecutiveAuction] = useState(false);

  // Sold price dialog states
  const [isSoldDialogOpen, setIsSoldDialogOpen] = useState(false);
  const [soldPriceInput, setSoldPriceInput] = useState("");
  const [isMarkingSold, setIsMarkingSold] = useState(false);
  
  // Statistics email state
  const [isSendingStatistics, setIsSendingStatistics] = useState(false);

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
        .select("full_name, avatar_url")
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
    setIsNewProduction(property.is_new_production || false);
    setShowViewerCount(property.show_viewer_count || false);
    setHasElevator(property.has_elevator || false);
    setHasBalcony(property.has_balcony || false);
    setIsExecutiveAuction(property.is_executive_auction || false);
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
  };

  // Handle edit query parameter - open edit dialog for specific property
  useEffect(() => {
    const editPropertyId = searchParams.get("edit");
    if (editPropertyId && properties && properties.length > 0) {
      const propertyToEdit = properties.find(p => p.id === editPropertyId);
      if (propertyToEdit) {
        // Switch to existing tab and open edit dialog
        setActiveTab("existing");
        handleEditProperty(propertyToEdit);
        // Clear the query param from URL
        navigate("/maklare", { replace: true });
      }
    }
  }, [searchParams, properties]);

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

  // Function to send statistics to seller
  const handleSendStatistics = async () => {
    if (!editingProperty?.id) return;
    
    // Get the current value from the input field (in case it hasn't been saved yet)
    const sellerEmailInput = document.getElementById('edit-seller-email') as HTMLInputElement;
    const sellerEmail = sellerEmailInput?.value || editingProperty.seller_email;
    
    if (!sellerEmail) {
      toast.error("Ingen säljare e-post är angiven för denna fastighet");
      return;
    }
    
    // Check if email needs to be saved first
    if (sellerEmail !== editingProperty.seller_email) {
      toast.error("Spara ändringarna först innan du skickar statistik");
      return;
    }
    
    setIsSendingStatistics(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Du måste vara inloggad");
        return;
      }

      console.log("Sending statistics for property:", editingProperty.id);
      
      const response = await supabase.functions.invoke('send-property-statistics', {
        body: { property_id: editingProperty.id },
      });

      console.log("Response from edge function:", response);

      if (response.error) {
        console.error("Edge function error:", response.error);
        toast.error(`Fel: ${response.error.message || 'Okänt fel från servern'}`);
        return;
      }
      
      // Check if the response data indicates a failure
      if (response.data && response.data.success === false) {
        console.error("Edge function returned failure:", response.data);
        toast.error(response.data.message || "Kunde inte skicka statistik");
        return;
      }
      
      if (response.data && response.data.error) {
        console.error("Edge function returned error:", response.data);
        toast.error(response.data.error);
        return;
      }

      toast.success(`Statistik skickad till ${sellerEmail}`);
    } catch (error: any) {
      console.error("Error sending statistics:", error);
      toast.error(error.message || "Kunde inte skicka statistik till säljaren");
    } finally {
      setIsSendingStatistics(false);
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
      const viewingDate2Value = formData.get("viewing_date_2") as string;
      const constructionYearValue = formData.get("construction_year") as string;
      const operatingCostValue = formData.get("operating_cost") as string;
      const brfDebtPerSqmValue = formData.get("brf_debt_per_sqm") as string;
      const housingAssociationValue = formData.get("housing_association") as string;
      const floorValue = formData.get("floor") as string;
      const totalFloorsValue = formData.get("total_floors") as string;
      const sellerEmailValue = formData.get("seller_email") as string;

      // Build update object
      const updateData: any = {
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
        construction_year: constructionYearValue ? Number(constructionYearValue) : null,
        operating_cost: operatingCostValue ? Number(operatingCostValue) : 0,
        housing_association: housingAssociationValue || null,
        description: formData.get("description") as string,
        fee: Number(formData.get("fee")),
        viewing_date: viewingDateValue || null,
        viewing_date_2: viewingDate2Value || null,
        image_url: mainImageUrl,
        hover_image_url: hoverImageUrl,
        floorplan_images: floorplanImagesUrls,
        additional_images: additionalImagesUrls,
        is_new_production: isNewProduction,
        show_viewer_count: showViewerCount,
        has_elevator: hasElevator,
        has_balcony: hasBalcony,
        is_executive_auction: isExecutiveAuction,
        floor: floorValue ? Number(floorValue) : null,
        total_floors: totalFloorsValue ? Number(totalFloorsValue) : null,
        seller_email: sellerEmailValue || null,
      };

      // First try to update without brf_debt_per_sqm
      let { error } = await supabase.from("properties").update(updateData).eq("id", editingProperty.id);
      
      // If successful and brf_debt_per_sqm has a value, try to update it separately
      if (!error && brfDebtPerSqmValue) {
        await supabase.from("properties").update({
          brf_debt_per_sqm: Number(brfDebtPerSqmValue)
        }).eq("id", editingProperty.id).then(() => {}).catch(() => {});
      }
      
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
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Back Arrow */}
            <svg 
              width="36" 
              height="36" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => navigate('/')}
              className="cursor-pointer hover:-translate-x-2 hover:scale-x-110 transition-all duration-300 ease-out origin-center flex-shrink-0"
            >
              <defs>
                <linearGradient id="agentArrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="url(#agentArrowGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <Home className="hidden sm:block w-6 h-6 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-hero-gradient">Mäklarpanel</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Profile Avatar with Glow */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[hsl(200,98%,35%)] to-[hsl(142,76%,30%)] opacity-75 blur-md animate-[pulse_1.5s_ease-in-out_infinite]"></div>
              <Avatar className="relative w-8 h-8 xl:w-9 xl:h-9" style={{ boxShadow: '0 0 0 2px hsl(200, 98%, 35%), 0 0 0 4px hsl(142, 76%, 30%)' }}>
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "Profil"} />
                <AvatarFallback className="bg-gradient-to-br from-[hsl(200,98%,35%)] to-[hsl(142,76%,30%)] text-white text-xs sm:text-sm font-bold">
                  {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="hidden md:block text-xl bg-clip-text text-transparent bg-hero-gradient font-bold">{profile?.full_name || user?.email}</span>
            <Button variant="destructive" size="sm" onClick={handleSignOut} className="bg-red-600 text-white hover:bg-red-700 font-semibold px-2 sm:px-4">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logga ut</span>
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
              <TabsList className="flex flex-wrap w-full gap-0.5 p-0.5 h-auto bg-hero-gradient">
                <TabsTrigger value="add" className="flex-1 min-w-[45px] gap-0.5 sm:gap-1 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20 flex-col sm:flex-row py-1.5 px-0.5 sm:px-2 text-[8px] sm:text-xs">
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Ny bostad</span>
                  <span className="sm:hidden truncate">Ny</span>
                </TabsTrigger>
                <TabsTrigger value="existing" className="flex-1 min-w-[45px] gap-0.5 sm:gap-1 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20 flex-col sm:flex-row py-1.5 px-0.5 sm:px-2 text-[8px] sm:text-xs">
                  <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Aktiva</span>
                  <span className="sm:hidden truncate">Aktiva</span>
                </TabsTrigger>
                <TabsTrigger value="removed" className="flex-1 min-w-[45px] gap-0.5 sm:gap-1 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20 flex-col sm:flex-row py-1.5 px-0.5 sm:px-2 text-[8px] sm:text-xs">
                  <Archive className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Borttagna</span>
                  <span className="sm:hidden truncate">Borttagna</span>
                </TabsTrigger>
                <TabsTrigger value="statistics" className="flex-1 min-w-[45px] gap-0.5 sm:gap-1 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20 flex-col sm:flex-row py-1.5 px-0.5 sm:px-2 text-[8px] sm:text-xs">
                  <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Statistik</span>
                  <span className="sm:hidden truncate">Statistik</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex-1 min-w-[45px] gap-0.5 sm:gap-1 data-[state=active]:bg-white data-[state=active]:text-primary text-white hover:bg-white/20 flex-col sm:flex-row py-1.5 px-0.5 sm:px-2 text-[8px] sm:text-xs">
                  <UserCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Profil</span>
                  <span className="sm:hidden truncate">Profil</span>
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
                          floor={property.floor || undefined}
                          totalFloors={property.total_floors || undefined}
                          hideControls={true}
                          buttonText="Redigera fastighet"
                          onButtonClick={() => handleEditProperty(property)}
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ta bort fastighet?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Är du säker på att du vill ta bort "{property.address}"? Fastigheten flyttas till borttagna objekt.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProperty(property.id)}>
                                  Ta bort
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                  <Label htmlFor="edit-title">Titel (max 60 tecken)</Label>
                  <Input id="edit-title" name="title" defaultValue={editingProperty.title} required minLength={5} maxLength={60} />
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


                <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:col-span-2">
                  {/* Badrum */}
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="edit-bathrooms">Badrum</Label>
                    <Input id="edit-bathrooms" name="bathrooms" type="number" defaultValue={editingProperty.bathrooms} required />
                  </div>
                  {/* Boarea (kvm) */}
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="edit-area">Boarea (kvm)</Label>
                    <Input id="edit-area" name="area" type="number" defaultValue={editingProperty.area} required />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:col-span-2">
                  {/* Månadsavgift (kr) */}
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="edit-fee">Månadsavgift (kr)</Label>
                    <Input id="edit-fee" name="fee" type="number" defaultValue={editingProperty.fee} required />
                  </div>
                  {/* Driftkostnad (kr/mån) */}
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="edit-operating-cost">Driftkostnad (kr/mån)</Label>
                    <Input id="edit-operating-cost" name="operating_cost" type="number" defaultValue={editingProperty.operating_cost || 0} placeholder="2 500" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:col-span-2">
                  {/* Visningsdatum 1 (valfritt) */}
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="edit-viewing-date">Visningsdatum 1 (valfritt)</Label>
                    <Input id="edit-viewing-date" name="viewing_date" type="datetime-local" defaultValue={editingProperty.viewing_date ? new Date(editingProperty.viewing_date).toISOString().slice(0, 16) : ""} />
                  </div>
                  {/* Bostadsförening (valfritt) */}
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="edit-housing-association">Bostadsförening (valfritt)</Label>
                    <Input id="edit-housing-association" name="housing_association" type="text" defaultValue={editingProperty.housing_association || ''} placeholder="HSB Brf..." />
                  </div>
                </div>

                {/* BRF skuld/kvm */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:col-span-2">
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="edit-brf-debt-per-sqm">BRF skuld/kvm (kr)</Label>
                    <Input id="edit-brf-debt-per-sqm" name="brf_debt_per_sqm" type="number" defaultValue={(editingProperty as any).brf_debt_per_sqm || ''} placeholder="5 000" />
                  </div>
                  <div className="w-full md:w-1/2"></div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:col-span-2">
                  {/* Visningsdatum 2 (valfritt) */}
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="edit-viewing-date-2">Visningsdatum 2 (valfritt)</Label>
                    <Input
                      id="edit-viewing-date-2"
                      name="viewing_date_2"
                      type="datetime-local"
                      defaultValue={editingProperty.viewing_date_2 ? new Date(editingProperty.viewing_date_2).toISOString().slice(0, 16) : ""}
                    />
                  </div>
                  {/* Byggår */}
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="edit-construction-year">Byggår</Label>
                    <Input id="edit-construction-year" name="construction_year" type="number" defaultValue={editingProperty.construction_year || ''} placeholder="2021" />
                  </div>
                </div>

                {/* Våning och Våning av - endast för lägenheter */}
                {editingProperty.type === "Lägenhet" && (
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:col-span-2">
                    <div className="w-full md:w-1/2">
                      <Label htmlFor="edit-floor">Våning</Label>
                      <Input id="edit-floor" name="floor" type="number" defaultValue={editingProperty.floor || ''} placeholder="3" />
                    </div>
                    <div className="w-full md:w-1/2">
                      <Label htmlFor="edit-total-floors">Våning av</Label>
                      <Input id="edit-total-floors" name="total_floors" type="number" defaultValue={editingProperty.total_floors || ''} placeholder="5" />
                    </div>
                  </div>
                )}


                {/* Snabbval-knappar: Nyproduktion, Hiss, Balkong, Antal live */}
                <div className="md:col-span-2 flex flex-wrap gap-2">
                  <Card className="p-2 px-3 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-is-new-production"
                      checked={isNewProduction}
                      onChange={(e) => setIsNewProduction(e.target.checked)}
                      className="w-4 h-4 rounded border-input cursor-pointer accent-primary"
                    />
                    <Label htmlFor="edit-is-new-production" className="cursor-pointer font-medium text-sm">
                      Nyproduktion
                    </Label>
                  </Card>

                  <Card className="p-2 px-3 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-has-elevator"
                      checked={hasElevator}
                      onChange={(e) => setHasElevator(e.target.checked)}
                      className="w-4 h-4 rounded border-input cursor-pointer accent-primary"
                    />
                    <Label htmlFor="edit-has-elevator" className="cursor-pointer font-medium text-sm">
                      Hiss
                    </Label>
                  </Card>

                  <Card className="p-2 px-3 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-has-balcony"
                      checked={hasBalcony}
                      onChange={(e) => setHasBalcony(e.target.checked)}
                      className="w-4 h-4 rounded border-input cursor-pointer accent-primary"
                    />
                    <Label htmlFor="edit-has-balcony" className="cursor-pointer font-medium text-sm">
                      Balkong
                    </Label>
                  </Card>

                  <Card className="p-2 px-3 flex items-center space-x-2 bg-orange-50 border-orange-200">
                    <input
                      type="checkbox"
                      id="edit-is-executive-auction"
                      checked={isExecutiveAuction}
                      onChange={(e) => setIsExecutiveAuction(e.target.checked)}
                      className="w-4 h-4 rounded border-input cursor-pointer accent-orange-500"
                    />
                    <Label htmlFor="edit-is-executive-auction" className="cursor-pointer font-medium text-sm text-orange-700">
                      Exekutiv auktion
                    </Label>
                  </Card>

                  <Card className="p-2 px-3 flex items-center space-x-2 bg-gradient-to-r from-primary/5 to-green-500/5 border-primary/20">
                    <input
                      type="checkbox"
                      id="edit-show-viewer-count"
                      checked={showViewerCount}
                      onChange={(e) => setShowViewerCount(e.target.checked)}
                      className="w-4 h-4 rounded border-input cursor-pointer accent-primary"
                    />
                    <Label htmlFor="edit-show-viewer-count" className="cursor-pointer font-medium text-sm">
                      Antal live
                    </Label>
                  </Card>
                </div>

                {/* Seller email and statistics */}
                <div className="md:col-span-2">
                  <Label htmlFor="edit-seller-email">Säljarens e-post (för statistik)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="edit-seller-email"
                      name="seller_email"
                      type="email"
                      defaultValue={editingProperty.seller_email || ''}
                      placeholder="saljare@example.com"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendStatistics}
                      disabled={isSendingStatistics || !editingProperty.seller_email}
                      className="gap-2 whitespace-nowrap"
                    >
                      <Mail className="w-4 h-4" />
                      {isSendingStatistics ? "Skickar..." : "Skicka statistik"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ange säljarens e-post och spara innan du skickar statistik
                  </p>
                </div>

                {/* Mark as sold button */}
                <div className="md:col-span-2">
                  {!editingProperty.is_sold ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSoldPriceInput(editingProperty.price.toString());
                        setIsSoldDialogOpen(true);
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

      {/* Sold Price Dialog */}
      <Dialog open={isSoldDialogOpen} onOpenChange={setIsSoldDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Markera som såld</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Grattis till försäljningen! Ange slutpriset för fastigheten.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sold-price" className="text-base font-medium">Slutpris (kr)</Label>
              <Input
                id="sold-price"
                type="text"
                value={soldPriceInput ? Number(soldPriceInput.replace(/\s/g, '')).toLocaleString('sv-SE').replace(/,/g, ' ') : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, '');
                  if (value === '' || !isNaN(Number(value))) {
                    setSoldPriceInput(value);
                  }
                }}
                placeholder="T.ex. 3 500 000"
                className="text-3xl h-16 text-center font-bold tracking-wide"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsSoldDialogOpen(false)}
                className="flex-1"
                disabled={isMarkingSold}
              >
                Avbryt
              </Button>
              <Button
                onClick={async () => {
                  const priceValue = soldPriceInput.replace(/\s/g, '');
                  if (!priceValue || isNaN(Number(priceValue))) {
                    toast.error("Ange ett giltigt pris");
                    return;
                  }
                  setIsMarkingSold(true);
                  try {
                    const { error } = await supabase
                      .from('properties')
                      .update({
                        is_sold: true,
                        sold_price: Number(priceValue),
                        sold_date: new Date().toISOString()
                      })
                      .eq('id', editingProperty.id);

                    if (error) throw error;

                    setIsSoldDialogOpen(false);

                    // Trigger celebration confetti
                    setTimeout(() => {
                      confetti({
                        particleCount: 150,
                        spread: 100,
                        origin: { y: 0.6 },
                        colors: ['#0891b2', '#16a34a', '#22c55e', '#06b6d4', '#fbbf24', '#f97316']
                      });
                    }, 100);

                    toast.success(
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-lg">🎉 Grattis till försäljningen!</span>
                        <span className="text-sm">Fastigheten har markerats som såld för <strong>{Number(priceValue).toLocaleString('sv-SE').replace(/,/g, ' ')} kr</strong></span>
                      </div>,
                      { duration: 5000 }
                    );
                    await refetch();
                    setEditingProperty({...editingProperty, is_sold: true, sold_price: Number(priceValue), sold_date: new Date().toISOString()});
                  } catch (error) {
                    console.error('Error marking property as sold:', error);
                    toast.error("Kunde inte markera fastighet som såld");
                  } finally {
                    setIsMarkingSold(false);
                  }
                }}
                disabled={isMarkingSold}
                className="flex-1 bg-gradient-to-r from-[hsl(200,98%,35%)] to-[hsl(142,76%,36%)] text-white hover:opacity-90"
              >
                {isMarkingSold ? "Sparar..." : "Bekräfta försäljning"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default AgentDashboard;