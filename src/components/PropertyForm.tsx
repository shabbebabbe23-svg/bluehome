import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Loader2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
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
  const [hoverImage, setHoverImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [floorplan, setFloorplan] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [hoverImagePreview, setHoverImagePreview] = useState<string>("");
  const [additionalImagesPreviews, setAdditionalImagesPreviews] = useState<string[]>([]);
  const [floorplanPreview, setFloorplanPreview] = useState<string>("");
  const [isNewProduction, setIsNewProduction] = useState(false);
  const [agencyLogoUrl, setAgencyLogoUrl] = useState<string | null>(null);

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

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "hover" | "floorplan"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Bilden får max vara 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "main") {
          setMainImage(file);
          setMainImagePreview(reader.result as string);
        } else if (type === "hover") {
          setHoverImage(file);
          setHoverImagePreview(reader.result as string);
        } else if (type === "floorplan") {
          setFloorplan(file);
          setFloorplanPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Check if adding these files would exceed the limit of 6 additional images
    if (additionalImages.length + files.length > 6) {
      toast.error("Du kan lägga till max 6 extra bilder");
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

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
    setAdditionalImagesPreviews(additionalImagesPreviews.filter((_, i) => i !== index));
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

      let hoverImageUrl = null;
      if (hoverImage) {
        hoverImageUrl = await uploadImage(
          hoverImage,
          `${user.id}/${timestamp}-hover-${hoverImage.name}`
        );
      }

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

      // Upload floorplan
      let floorplanUrl = null;
      if (floorplan) {
        floorplanUrl = await uploadImage(
          floorplan,
          `${user.id}/${timestamp}-floorplan-${floorplan.name}`
        );
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
        hover_image_url: hoverImageUrl,
        additional_images: additionalImageUrls,
        floorplan_url: floorplanUrl,
        viewing_date: data.viewing_date || null,
        is_new_production: isNewProduction,
        housing_association: data.housing_association || null,
        seller_email: data.seller_email || null,
        vendor_logo_url: agencyLogoUrl,
      });

      if (error) throw error;

      toast.success("Fastighet tillagd!");
      reset();
      setMainImage(null);
      setHoverImage(null);
      setAdditionalImages([]);
      setFloorplan(null);
      setMainImagePreview("");
      setHoverImagePreview("");
      setAdditionalImagesPreviews([]);
      setFloorplanPreview("");
      setIsNewProduction(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error("Kunde inte lägga till fastighet");
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

        {/* Huvudbild */}
        <div className="md:col-span-2">
          <Label>Huvudbild *</Label>
          <Card className="p-4">
            <div className="flex flex-col items-center gap-4">
              {mainImagePreview ? (
                <img
                  src={mainImagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded"
                />
              ) : (
                <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                  <Upload className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "main")}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">Max 5MB</p>
            </div>
          </Card>
        </div>

        {/* Hover-bild */}
        <div className="md:col-span-2">
          <Label>Hover-bild (valfritt)</Label>
          <Card className="p-4">
            <div className="flex flex-col items-center gap-4">
              {hoverImagePreview ? (
                <img
                  src={hoverImagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded"
                />
              ) : (
                <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                  <Upload className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "hover")}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">Max 5MB</p>
            </div>
          </Card>
        </div>

        {/* Fler bilder */}
        <div className="md:col-span-2">
          <Label>Fler bilder (valfritt, max 6 st)</Label>
          <Card className="p-4">
            <div className="space-y-4">
              {additionalImagesPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {additionalImagesPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Additional ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeAdditionalImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col items-center gap-4">
                <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesChange}
                  className="cursor-pointer"
                  disabled={additionalImages.length >= 6}
                />
                <p className="text-sm text-muted-foreground">
                  {additionalImages.length}/6 bilder uppladdade • Max 5MB per bild
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Ritning */}
        <div className="md:col-span-2">
          <Label>Ritning/Planlösning (valfritt)</Label>
          <Card className="p-4">
            <div className="flex flex-col items-center gap-4">
              {floorplanPreview ? (
                <img
                  src={floorplanPreview}
                  alt="Ritning preview"
                  className="w-full h-48 object-contain rounded bg-muted"
                />
              ) : (
                <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                  <FileText className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "floorplan")}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">Max 5MB</p>
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

              // Upload hover image if exists
              let hoverImageUrl = null;
              if (hoverImage) {
                const hoverImageExt = hoverImage.name.split('.').pop();
                const hoverImagePath = `${user.id}/${Date.now()}_hover.${hoverImageExt}`;
                const { error: hoverImageError } = await supabase.storage
                  .from('property-images')
                  .upload(hoverImagePath, hoverImage);

                if (hoverImageError) throw hoverImageError;

                const { data: { publicUrl } } = supabase.storage
                  .from('property-images')
                  .getPublicUrl(hoverImagePath);
                hoverImageUrl = publicUrl;
              }

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

              // Upload floorplan if exists
              let floorplanUrl = null;
              if (floorplan) {
                const floorplanExt = floorplan.name.split('.').pop();
                const floorplanPath = `${user.id}/${Date.now()}_floorplan.${floorplanExt}`;
                const { error: floorplanError } = await supabase.storage
                  .from('property-images')
                  .upload(floorplanPath, floorplan);

                if (floorplanError) throw floorplanError;

                const { data: { publicUrl } } = supabase.storage
                  .from('property-images')
                  .getPublicUrl(floorplanPath);
                floorplanUrl = publicUrl;
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
                hover_image_url: hoverImageUrl,
                additional_images: additionalImageUrls,
                floorplan_url: floorplanUrl,
                viewing_date: data.viewing_date ? new Date(data.viewing_date).toISOString() : null,
                is_coming_soon: true,
                is_new_production: isNewProduction,
                housing_association: data.housing_association || null,
              });

              if (error) throw error;

              toast.success("Fastighet tillagd som kommande försäljning!");
              reset();
              setMainImage(null);
              setHoverImage(null);
              setAdditionalImages([]);
              setFloorplan(null);
              setMainImagePreview("");
              setHoverImagePreview("");
              setAdditionalImagesPreviews([]);
              setFloorplanPreview("");
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
    </form>
  );
};
