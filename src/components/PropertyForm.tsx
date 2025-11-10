import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Loader2 } from "lucide-react";
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
  fee: z.coerce.number().min(0, "Avgift måste vara minst 0"),
  description: z.string().min(10, "Beskrivning måste vara minst 10 tecken").max(5000, "Beskrivning får max vara 5000 tecken"),
  viewing_date: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export const PropertyForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [hoverImage, setHoverImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [hoverImagePreview, setHoverImagePreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "hover"
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
        } else {
          setHoverImage(file);
          setHoverImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
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
        fee: data.fee,
        description: data.description,
        image_url: mainImageUrl,
        hover_image_url: hoverImageUrl,
        viewing_date: data.viewing_date ? new Date(data.viewing_date).toISOString() : null,
      });

      if (error) throw error;

      toast.success("Fastighet tillagd!");
      reset();
      setMainImage(null);
      setHoverImage(null);
      setMainImagePreview("");
      setHoverImagePreview("");
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
            placeholder="2500000"
          />
          {errors.price && (
            <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
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

        {/* Avgift */}
        <div>
          <Label htmlFor="fee">Månadsavgift (kr) *</Label>
          <Input
            id="fee"
            type="number"
            {...register("fee")}
            placeholder="3500"
          />
          {errors.fee && (
            <p className="text-sm text-destructive mt-1">{errors.fee.message}</p>
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
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Lägger till...
          </>
        ) : (
          "Lägg till fastighet"
        )}
      </Button>
    </form>
  );
};
