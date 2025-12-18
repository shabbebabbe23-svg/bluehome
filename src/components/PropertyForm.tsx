import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Loader2, FileText, X, Move3D, Waves, ImagePlus, PencilRuler, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const propertySchema = z.object({
  title: z.string().min(5, "Titel måste vara minst 5 tecken").max(200, "Titel får max vara 200 tecken"),
  address: z.string().min(5, "Adress måste vara minst 5 tecken").max(200, "Adress får max vara 200 tecken"),
  location: z.string().min(2, "Ort måste anges").max(100, "Ort får max vara 100 tecken"),
  type: z.string().min(1, "Välj bostadstyp"),
  price: z.coerce.number().min(0, "Pris måste vara minst 0"),
  bedrooms: z.coerce.number().min(1, "Minst 1 sovrum").max(50, "Max 50 sovrum"),
  bathrooms: z.coerce.number().min(1, "Minst 1 badrum").max(20, "Max 20 badrum"),
  area: z.coerce.number().min(1, "Area måste vara minst 1 kvm").max(10000, "Max 10000 kvm"),
  construction_year: z.coerce.number().min(1800, "Byggår måste vara minst 1800").max(2100, "Byggår kan max vara 2100").optional(),
  fee: z.coerce.number().min(0, "Avgift måste vara minst 0").optional(),
  operating_cost: z.coerce.number().min(0, "Driftkostnad måste vara minst 0").optional(),
  description: z.string().min(10, "Beskrivning måste vara minst 10 tecken").max(5000, "Beskrivning får max vara 5000 tecken"),
  viewing_date: z.string().optional(),
  housing_association: z.string().max(200, "Bostadsförening får max vara 200 tecken").optional(),
  seller_email: z.string().email("Ogiltig e-postadress").max(255, "E-post får max vara 255 tecken").optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export const PropertyForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [floorplans, setFloorplans] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [additionalImagesPreviews, setAdditionalImagesPreviews] = useState<string[]>([]);
  const [floorplanPreviews, setFloorplanPreviews] = useState<string[]>([]);
  const [isNewProduction, setIsNewProduction] = useState(false);
  const [agencyLogoUrl, setAgencyLogoUrl] = useState<string | null>(null);
  const [vrImageIndices, setVrImageIndices] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMainImage360, setIsMainImage360] = useState(false);
  const [hasElevator, setHasElevator] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(false);
  const [waterDistance, setWaterDistance] = useState<number | undefined>(undefined);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentNames, setDocumentNames] = useState<string[]>([]);
  const [showViewerCount, setShowViewerCount] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  const watchPrice = watch("price");
  const watchArea = watch("area");
  const watchFee = watch("fee");
  const watchOperatingCost = watch("operating_cost");
  const pricePerSqm = watchPrice && watchArea ? Math.round(watchPrice / watchArea) : null;
  
  // Format number with spaces for thousands
  const formatNumber = (num: number | undefined) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Fetch agency logo when component mounts
  useEffect(() => {
    const fetchAgencyLogo = async () => {
      if (!user) return;

      try {
        // Get user's profile to find their agency_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("agency_id")
          .eq("id", user.id)
          .single();

        if (profile?.agency_id) {
          // Get agency logo
          const { data: agency } = await supabase
            .from("agencies")
            .select("logo_url")
            .eq("id", profile.agency_id)
            .single();

          if (agency?.logo_url) {
            setAgencyLogoUrl(agency.logo_url);
          }
        }
      } catch (error) {
        console.error("Error fetching agency logo:", error);
      }
    };

    fetchAgencyLogo();
  }, [user]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Bilden får max vara 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImage(file);
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFloorplanChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (floorplans.length + files.length > 4) {
      toast.error("Du kan lägga till max 4 ritningar");
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Varje ritning får max vara 5MB");
        return;
      }
    }

    const newPreviews: string[] = [];
    let filesRead = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        filesRead++;
        
        if (filesRead === files.length) {
          setFloorplans([...floorplans, ...files]);
          setFloorplanPreviews([...floorplanPreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFloorplan = (index: number) => {
    setFloorplans(floorplans.filter((_, i) => i !== index));
    setFloorplanPreviews(floorplanPreviews.filter((_, i) => i !== index));
  };

  const handleAdditionalImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Check if adding these files would exceed the limit of 19 additional images
    if (additionalImages.length + files.length > 19) {
      toast.error("Du kan lägga till max 19 extra bilder");
      return;
    }

    // Check file sizes
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Varje bild får max vara 5MB");
        return;
      }
    }

    // Read all files and create previews
    const newPreviews: string[] = [];
    let filesRead = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        filesRead++;
        
        if (filesRead === files.length) {
          setAdditionalImages([...additionalImages, ...files]);
          setAdditionalImagesPreviews([...additionalImagesPreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length === 0) {
      toast.error("Endast bildfiler är tillåtna");
      return;
    }

    // Check if adding these files would exceed the limit
    if (additionalImages.length + files.length > 20) {
      toast.error("Du kan lägga till max 20 extra bilder");
      return;
    }

    // Check file sizes
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Varje bild får max vara 5MB");
        return;
      }
    }

    // Read all files and create previews
    const newPreviews: string[] = [];
    let filesRead = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        filesRead++;
        
        if (filesRead === files.length) {
          setAdditionalImages([...additionalImages, ...files]);
          setAdditionalImagesPreviews([...additionalImagesPreviews, ...newPreviews]);
          toast.success(`${files.length} bild${files.length > 1 ? 'er' : ''} tillagda`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
    setAdditionalImagesPreviews(additionalImagesPreviews.filter((_, i) => i !== index));
    // Update VR indices - remove the index and adjust remaining indices
    setVrImageIndices(vrImageIndices
      .filter(i => i !== index)
      .map(i => i > index ? i - 1 : i)
    );
  };

  const toggleVrImage = (index: number) => {
    if (vrImageIndices.includes(index)) {
      setVrImageIndices(vrImageIndices.filter(i => i !== index));
    } else {
      setVrImageIndices([...vrImageIndices, index]);
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from("property-images")
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("property-images")
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const uploadDocument = async (file: File, path: string): Promise<{ url: string; name: string }> => {
    const { data, error } = await supabase.storage
      .from("property-documents")
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("property-documents")
      .getPublicUrl(data.path);

    return { url: publicUrl, name: file.name };
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (documents.length + files.length > 10) {
      toast.error("Du kan lägga till max 10 dokument");
      return;
    }

    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Varje dokument får max vara 20MB");
        return;
      }
    }

    setDocuments([...documents, ...files]);
    setDocumentNames([...documentNames, ...files.map(f => f.name)]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
    setDocumentNames(documentNames.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!user) {
      toast.error("Du måste vara inloggad");
      return;
    }

    if (!mainImage) {
      toast.error("Du måste ladda upp minst en huvudbild");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images
      const timestamp = Date.now();
      const mainImageUrl = await uploadImage(
        mainImage,
        `${user.id}/${timestamp}-main-${mainImage.name}`
      );

      // Upload additional images
      const additionalImageUrls: string[] = [];
      for (let i = 0; i < additionalImages.length; i++) {
        const file = additionalImages[i];
        const url = await uploadImage(
          file,
          `${user.id}/${timestamp}-additional-${i}-${file.name}`
        );
        additionalImageUrls.push(url);
      }

      // Upload floorplans (up to 4)
      const floorplanUrls: string[] = [];
      for (let i = 0; i < floorplans.length; i++) {
        const file = floorplans[i];
        const url = await uploadImage(
          file,
          `${user.id}/${timestamp}-floorplan-${i}-${file.name}`
        );
        floorplanUrls.push(url);
      }

      // Upload documents
      const uploadedDocuments: { url: string; name: string }[] = [];
      for (let i = 0; i < documents.length; i++) {
        const file = documents[i];
        const doc = await uploadDocument(
          file,
          `${user.id}/${timestamp}-doc-${i}-${file.name}`
        );
        uploadedDocuments.push(doc);
      }

      // Insert property
      const { error } = await supabase.from("properties").insert({
        user_id: user.id,
        title: data.title,
        address: data.address,
        location: data.location,
        type: data.type,
        price: data.price,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        construction_year: data.construction_year || null,
        fee: data.fee || 0,
        operating_cost: data.operating_cost || 0,
        description: data.description,
        image_url: mainImageUrl,
        hover_image_url: null,
        additional_images: additionalImageUrls,
        floorplan_url: floorplanUrls[0] || null,
        floorplan_images: floorplanUrls,
        viewing_date: data.viewing_date || null,
        is_new_production: isNewProduction,
        housing_association: data.housing_association || null,
        seller_email: data.seller_email || null,
        vendor_logo_url: agencyLogoUrl,
        vr_image_indices: isMainImage360 ? [-1, ...vrImageIndices] : vrImageIndices,
        has_vr: isMainImage360 || vrImageIndices.length > 0,
        has_elevator: hasElevator,
        has_balcony: hasBalcony,
        water_distance: waterDistance || null,
        documents: uploadedDocuments,
        show_viewer_count: showViewerCount,
      });

      if (error) throw error;

      toast.success("Fastighet tillagd!");
      reset();
      setMainImage(null);
      setAdditionalImages([]);
      setFloorplans([]);
      setMainImagePreview("");
      setAdditionalImagesPreviews([]);
      setFloorplanPreviews([]);
      setIsNewProduction(false);
      setVrImageIndices([]);
      setIsMainImage360(false);
      setHasElevator(false);
      setHasBalcony(false);
      setWaterDistance(undefined);
      setDocuments([]);
      setDocumentNames([]);
      setShowViewerCount(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating property:", error);
      const errorMessage = error?.message || error?.error_description || JSON.stringify(error);
      toast.error(`Kunde inte lägga till fastighet: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Titel */}
        <div className="md:col-span-2">
          <Label htmlFor="title">Titel *</Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="T.ex. Rymlig trea i centrala stan"
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Adress */}
        <div>
          <Label htmlFor="address">Adress *</Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="Storgatan 1"
          />
          {errors.address && (
            <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Ort */}
        <div>
          <Label htmlFor="location">Ort *</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="Stockholm"
          />
          {errors.location && (
            <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
          )}
        </div>

        {/* Typ */}
        <div>
          <Label htmlFor="type">Bostadstyp *</Label>
          <Select onValueChange={(value) => setValue("type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Välj typ" />
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
          {errors.type && (
            <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Pris */}
        <div>
          <Label htmlFor="price">Pris (kr) *</Label>
          <Input
            id="price"
            type="number"
            {...register("price")}
            placeholder="2 500 000"
          />
          {errors.price && (
            <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
          )}
          {pricePerSqm && (
            <p className="text-sm text-muted-foreground mt-1">
              Pris/m²: {formatNumber(pricePerSqm)} kr/m²
            </p>
          )}
          {watchPrice && (
            <p className="text-sm text-muted-foreground mt-1">
              {formatNumber(watchPrice)} kr
            </p>
          )}
        </div>

        {/* Sovrum */}
        <div>
          <Label htmlFor="bedrooms">Antal sovrum *</Label>
          <Input
            id="bedrooms"
            type="number"
            {...register("bedrooms")}
            placeholder="3"
          />
          {errors.bedrooms && (
            <p className="text-sm text-destructive mt-1">{errors.bedrooms.message}</p>
          )}
        </div>

        {/* Badrum */}
        <div>
          <Label htmlFor="bathrooms">Antal badrum *</Label>
          <Input
            id="bathrooms"
            type="number"
            {...register("bathrooms")}
            placeholder="1"
          />
          {errors.bathrooms && (
            <p className="text-sm text-destructive mt-1">{errors.bathrooms.message}</p>
          )}
        </div>

        {/* Area */}
        <div>
          <Label htmlFor="area">Boarea (kvm) *</Label>
          <Input
            id="area"
            type="number"
            {...register("area")}
            placeholder="85"
          />
          {errors.area && (
            <p className="text-sm text-destructive mt-1">{errors.area.message}</p>
          )}
        </div>

        {/* Byggår */}
        <div>
          <Label htmlFor="construction_year">Byggår</Label>
          <Input
            id="construction_year"
            type="number"
            {...register("construction_year")}
            placeholder="2010"
          />
          {errors.construction_year && (
            <p className="text-sm text-destructive mt-1">{errors.construction_year.message}</p>
          )}
        </div>

        {/* Avgift */}
        <div>
          <Label htmlFor="fee">Månadsavgift (kr)</Label>
          <Input
            id="fee"
            type="number"
            {...register("fee")}
            placeholder="3 500"
          />
          {errors.fee && (
            <p className="text-sm text-destructive mt-1">{errors.fee.message}</p>
          )}
          {watchFee && watchFee > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {formatNumber(watchFee)} kr/mån
            </p>
          )}
        </div>

        {/* Visningsdatum */}
        <div>
          <Label htmlFor="viewing_date">Visningsdatum (valfritt)</Label>
          <Input
            id="viewing_date"
            type="datetime-local"
            {...register("viewing_date")}
          />
          {errors.viewing_date && (
            <p className="text-sm text-destructive mt-1">{errors.viewing_date.message}</p>
          )}
        </div>

        {/* Driftkostnad */}
        <div>
          <Label htmlFor="operating_cost">Driftkostnad (kr/mån)</Label>
          <Input
            id="operating_cost"
            type="number"
            {...register("operating_cost")}
            placeholder="2 500"
          />
          {errors.operating_cost && (
            <p className="text-sm text-destructive mt-1">{errors.operating_cost.message}</p>
          )}
          {watchOperatingCost && watchOperatingCost > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {formatNumber(watchOperatingCost)} kr/mån
            </p>
          )}
        </div>

        {/* Bostadsförening */}
        <div>
          <Label htmlFor="housing_association">Bostadsförening (valfritt)</Label>
          <Input
            id="housing_association"
            type="text"
            {...register("housing_association")}
            placeholder="HSB Brf..."
          />
        </div>

        {/* Säljarens e-post */}
        <div>
          <Label htmlFor="seller_email">Säljarens e-post (valfritt)</Label>
          <Input
            id="seller_email"
            type="email"
            {...register("seller_email")}
            placeholder="säljare@exempel.se"
          />
          {errors.seller_email && (
            <p className="text-sm text-destructive mt-1">{errors.seller_email.message}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            Säljaren får statistik om annonsen skickad till denna e-post
          </p>
        </div>

        {/* Beskrivning */}
        <div className="md:col-span-2">
          <Label htmlFor="description">Beskrivning *</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Beskriv bostaden..."
            rows={6}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Nyproduktion */}
        <div className="md:col-span-2">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_new_production"
                checked={isNewProduction}
                onChange={(e) => setIsNewProduction(e.target.checked)}
                className="w-5 h-5 rounded border-input cursor-pointer accent-primary"
              />
              <Label htmlFor="is_new_production" className="cursor-pointer font-semibold text-base">
                Nyproduktion
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2 ml-8">
              Markera om detta är en nyproducerad fastighet
            </p>
          </Card>
        </div>

        {/* Hiss och Balkong */}
        <div>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="has_elevator"
                checked={hasElevator}
                onChange={(e) => setHasElevator(e.target.checked)}
                className="w-5 h-5 rounded border-input cursor-pointer accent-primary"
              />
              <Label htmlFor="has_elevator" className="cursor-pointer font-semibold text-base">
                Hiss
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2 ml-8">
              Byggnaden har hiss
            </p>
          </Card>
        </div>

        <div>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="has_balcony"
                checked={hasBalcony}
                onChange={(e) => setHasBalcony(e.target.checked)}
                className="w-5 h-5 rounded border-input cursor-pointer accent-primary"
              />
              <Label htmlFor="has_balcony" className="cursor-pointer font-semibold text-base">
                Balkong
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2 ml-8">
              Bostaden har balkong
            </p>
          </Card>
        </div>

        {/* Avstånd till vatten */}
        <div>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-primary" />
              <Label htmlFor="water_distance" className="font-semibold text-base">
                Avstånd till vatten
              </Label>
            </div>
            <Select
              value={waterDistance?.toString() || ''}
              onValueChange={(value) => setWaterDistance(value ? parseInt(value) : undefined)}
            >
              <SelectTrigger className="mt-2">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Välj avstånd till vatten" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 meter</SelectItem>
                <SelectItem value="100">100 meter</SelectItem>
                <SelectItem value="200">200 meter</SelectItem>
                <SelectItem value="300">300 meter</SelectItem>
                <SelectItem value="500">500 meter</SelectItem>
                <SelectItem value="750">750 meter</SelectItem>
                <SelectItem value="1000">1 km</SelectItem>
                <SelectItem value="1500">1,5 km</SelectItem>
                <SelectItem value="2000">2 km</SelectItem>
                <SelectItem value="3000">3 km</SelectItem>
                <SelectItem value="5000">5 km</SelectItem>
                <SelectItem value="7500">7,5 km</SelectItem>
                <SelectItem value="10000">10 km+</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              Ange avståndet till närmaste vatten (sjö, hav, å)
            </p>
          </Card>
        </div>

        {/* Visa antal som tittar just nu */}
        <div className="md:col-span-2">
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-green-500/5 border-primary/20">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="show_viewer_count"
                checked={showViewerCount}
                onChange={(e) => setShowViewerCount(e.target.checked)}
                className="w-5 h-5 rounded border-input cursor-pointer accent-primary"
              />
              <Label htmlFor="show_viewer_count" className="cursor-pointer font-semibold text-base">
                Visa "X personer tittar just nu"
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2 ml-8">
              Visar besökare hur många som tittar på objektet i realtid. Detta kan skapa intresse och känsla av efterfrågan.
            </p>
          </Card>
        </div>

        {/* Huvudbild */}
        <div className="md:col-span-2">
          <Label>Huvudbild *</Label>
          <Card className="p-4">
            <div className="flex flex-col items-center gap-4">
              {mainImagePreview ? (
                <div className="relative w-full">
                  <img
                    src={mainImagePreview}
                    alt="Preview"
                    className={`w-full h-40 sm:h-44 md:h-48 object-contain rounded-lg bg-muted ${isMainImage360 ? 'ring-2 ring-primary' : ''}`}
                  />
                  {isMainImage360 && (
                    <Badge className="absolute top-2 left-2 bg-gradient-to-r from-primary to-green-500">
                      <Move3D className="w-3 h-3 mr-1" />
                      360°
                    </Badge>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setPreviewImage(mainImagePreview)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={isMainImage360 ? "default" : "outline"}
                    size="sm"
                    className={`absolute bottom-2 left-2 gap-1 ${isMainImage360 ? 'bg-gradient-to-r from-primary to-green-500' : ''}`}
                    onClick={() => setIsMainImage360(!isMainImage360)}
                  >
                    <Move3D className="w-4 h-4" />
                    {isMainImage360 ? '360° aktiv' : 'Markera som 360°'}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg border-muted-foreground/25 hover:border-muted-foreground/50 transition-all">
                  <div className="p-4 rounded-full bg-muted">
                    <ImagePlus className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">Välj huvudbild</p>
                  <p className="text-sm text-muted-foreground">Max 5MB</p>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer w-full max-w-[280px] sm:max-w-sm border-2 border-primary/30 rounded-lg sm:rounded-xl py-0.5 sm:py-1 px-1.5 sm:px-2 file:mr-2 sm:file:mr-3 file:py-1 sm:file:py-1.5 file:px-2 sm:file:px-3 file:rounded-md sm:file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#0276B1] file:to-[#12873D] file:text-white file:cursor-pointer hover:file:opacity-90 file:transition-all file:shadow-md hover:file:shadow-lg text-xs sm:text-sm text-muted-foreground"
              />
            </div>
          </Card>
        </div>

        {/* Fler bilder */}
        <div className="md:col-span-2">
          <Label>Fler bilder</Label>
          <Card className="p-4">
            <div className="space-y-4">
              {additionalImagesPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {additionalImagesPreviews.map((preview, index) => (
                    <div key={index} className={`relative rounded-lg overflow-hidden bg-muted ${vrImageIndices.includes(index) ? 'ring-2 ring-primary' : ''}`}>
                      <img
                        src={preview}
                        alt={`Additional ${index + 1}`}
                        className="w-full h-24 sm:h-28 md:h-32 object-contain"
                      />
                      {vrImageIndices.includes(index) && (
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-primary to-green-500 text-xs">
                          <Move3D className="w-3 h-3 mr-1" />
                          360°
                        </Badge>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setPreviewImage(preview)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeAdditionalImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant={vrImageIndices.includes(index) ? "default" : "outline"}
                        size="sm"
                        className={`absolute bottom-2 left-2 h-7 text-xs gap-1 ${vrImageIndices.includes(index) ? 'bg-gradient-to-r from-primary to-green-500' : 'bg-white/90 hover:bg-white'}`}
                        onClick={() => toggleVrImage(index)}
                      >
                        <Move3D className="w-3 h-3" />
                        360°
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div 
                className={`flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg transition-all ${
                  isDragging 
                    ? 'border-primary bg-primary/5 scale-[1.02]' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                } ${additionalImages.length >= 19 ? 'opacity-50 pointer-events-none' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
                    <ImagePlus className={`w-10 h-10 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {isDragging ? 'Släpp bilderna här' : 'Dra och släpp bilder här'}
                    </p>
                    <p className="text-sm text-muted-foreground">eller klicka för att välja filer</p>
                  </div>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesChange}
                  className="cursor-pointer w-full max-w-[280px] sm:max-w-sm border-2 border-primary/30 rounded-lg sm:rounded-xl py-0.5 sm:py-1 px-1.5 sm:px-2 file:mr-2 sm:file:mr-3 file:py-1 sm:file:py-1.5 file:px-2 sm:file:px-3 file:rounded-md sm:file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#0276B1] file:to-[#12873D] file:text-white file:cursor-pointer hover:file:opacity-90 file:transition-all file:shadow-md hover:file:shadow-lg text-xs sm:text-sm text-muted-foreground"
                  disabled={additionalImages.length >= 19}
                />
                <p className="text-sm text-muted-foreground text-center">
                  {additionalImages.length}/19 bilder uppladdade • Max 5MB per bild
                  {vrImageIndices.length > 0 && ` • ${vrImageIndices.length} markerade som 360°`}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Ritning */}
        <div className="md:col-span-2">
          <Label>Ritningar/Planlösningar (valfritt, max 4 st)</Label>
          <Card className="p-4">
            <div className="space-y-4">
              {floorplanPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {floorplanPreviews.map((preview, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden bg-muted">
                      <img
                        src={preview}
                        alt={`Ritning ${index + 1}`}
                        className="w-full h-24 sm:h-28 md:h-32 object-contain"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setPreviewImage(preview)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFloorplan(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className={`flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg transition-all border-muted-foreground/25 hover:border-muted-foreground/50 ${floorplans.length >= 4 ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="p-4 rounded-full bg-muted">
                    <PencilRuler className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">Välj ritningar</p>
                  <p className="text-sm text-muted-foreground">Max 5MB per fil</p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFloorplanChange}
                  className="cursor-pointer w-full max-w-[280px] sm:max-w-sm border-2 border-primary/30 rounded-lg sm:rounded-xl py-0.5 sm:py-1 px-1.5 sm:px-2 file:mr-2 sm:file:mr-3 file:py-1 sm:file:py-1.5 file:px-2 sm:file:px-3 file:rounded-md sm:file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#0276B1] file:to-[#12873D] file:text-white file:cursor-pointer hover:file:opacity-90 file:transition-all file:shadow-md hover:file:shadow-lg text-xs sm:text-sm text-muted-foreground"
                  disabled={floorplans.length >= 4}
                />
                <p className="text-sm text-muted-foreground text-center">
                  {floorplans.length}/4 ritningar uppladdade
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Dokument */}
        <div className="md:col-span-2">
          <Label>Dokument (valfritt, max 10 st)</Label>
          <Card className="p-4">
            <div className="space-y-4">
              {documentNames.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {documentNames.map((name, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden bg-muted p-3">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                        <span className="text-xs text-center truncate w-full">{name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-5 w-5"
                        onClick={() => removeDocument(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className={`flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg transition-all border-muted-foreground/25 hover:border-muted-foreground/50 ${documents.length >= 10 ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="p-4 rounded-full bg-muted">
                    <FileText className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">Välj dokument</p>
                  <p className="text-sm text-muted-foreground">PDF, Word, Excel • Max 20MB per fil</p>
                </div>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  multiple
                  onChange={handleDocumentChange}
                  className="cursor-pointer w-full max-w-[280px] sm:max-w-sm border-2 border-primary/30 rounded-lg sm:rounded-xl py-0.5 sm:py-1 px-1.5 sm:px-2 file:mr-2 sm:file:mr-3 file:py-1 sm:file:py-1.5 file:px-2 sm:file:px-3 file:rounded-md sm:file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#0276B1] file:to-[#12873D] file:text-white file:cursor-pointer hover:file:opacity-90 file:transition-all file:shadow-md hover:file:shadow-lg text-xs sm:text-sm text-muted-foreground"
                  disabled={documents.length >= 10}
                />
                <p className="text-sm text-muted-foreground text-center">
                  {documents.length}/10 dokument uppladdade
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          type="button"
          variant="outline"
          onClick={async () => {
            const data = watch();
            if (!user?.id) {
              toast.error("Du måste vara inloggad");
              return;
            }

            if (!data.title || !data.address || !data.location || !data.type || !data.price || !data.bedrooms || !data.bathrooms || !data.area || !data.fee || !data.description) {
              toast.error("Vänligen fyll i alla obligatoriska fält");
              return;
            }

            if (!mainImage) {
              toast.error("Vänligen ladda upp en huvudbild");
              return;
            }

            setIsSubmitting(true);
            try {
              // Upload main image
              const mainImageExt = mainImage.name.split('.').pop();
              const mainImagePath = `${user.id}/${Date.now()}_main.${mainImageExt}`;
              const { error: mainImageError } = await supabase.storage
                .from('property-images')
                .upload(mainImagePath, mainImage);

              if (mainImageError) throw mainImageError;

              const { data: { publicUrl: mainImageUrl } } = supabase.storage
                .from('property-images')
                .getPublicUrl(mainImagePath);

              // Upload additional images if exist
              const additionalImageUrls: string[] = [];
              for (const image of additionalImages) {
                const imageExt = image.name.split('.').pop();
                const imagePath = `${user.id}/${Date.now()}_additional_${Math.random()}.${imageExt}`;
                const { error: imageError } = await supabase.storage
                  .from('property-images')
                  .upload(imagePath, image);

                if (imageError) throw imageError;

                const { data: { publicUrl } } = supabase.storage
                  .from('property-images')
                  .getPublicUrl(imagePath);
                additionalImageUrls.push(publicUrl);
              }

              // Upload floorplans if exist
              const floorplanUrls: string[] = [];
              for (const floorplan of floorplans) {
                const floorplanExt = floorplan.name.split('.').pop();
                const floorplanPath = `${user.id}/${Date.now()}_floorplan_${Math.random()}.${floorplanExt}`;
                const { error: floorplanError } = await supabase.storage
                  .from('property-images')
                  .upload(floorplanPath, floorplan);

                if (floorplanError) throw floorplanError;

                const { data: { publicUrl } } = supabase.storage
                  .from('property-images')
                  .getPublicUrl(floorplanPath);
                floorplanUrls.push(publicUrl);
              }

              // Create property with is_coming_soon = true
              const { error } = await supabase.from('properties').insert({
                user_id: user.id,
                title: data.title,
                address: data.address,
                location: data.location,
                type: data.type,
                price: data.price,
                bedrooms: data.bedrooms,
                bathrooms: data.bathrooms,
                area: data.area,
                fee: data.fee,
                description: data.description,
                image_url: mainImageUrl,
                hover_image_url: null,
                additional_images: additionalImageUrls,
                floorplan_url: floorplanUrls[0] || null,
                floorplan_images: floorplanUrls,
                viewing_date: data.viewing_date ? new Date(data.viewing_date).toISOString() : null,
                is_coming_soon: true,
                is_new_production: isNewProduction,
                housing_association: data.housing_association || null,
              });

              if (error) throw error;

              toast.success("Fastighet tillagd som kommande försäljning!");
              reset();
              setMainImage(null);
              setAdditionalImages([]);
              setFloorplans([]);
              setMainImagePreview("");
              setAdditionalImagesPreviews([]);
              setFloorplanPreviews([]);
              setIsNewProduction(false);
              onSuccess?.();
            } catch (error) {
              console.error("Error creating property:", error);
              toast.error("Kunde inte lägga till fastighet");
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Lägger till...
            </>
          ) : (
            "Kommande försäljning"
          )}
        </Button>

        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Lägger till...
            </>
          ) : (
            "Lägg till fastighet"
          )}
        </Button>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95">
          <div className="relative w-full h-[80vh] flex items-center justify-center p-4">
            {previewImage && (
              <img
                src={previewImage}
                alt="Förhandsgranskning"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 h-10 w-10"
              onClick={() => setPreviewImage(null)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
};
