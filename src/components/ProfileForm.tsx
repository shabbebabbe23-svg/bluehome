import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const profileSchema = z.object({
  full_name: z.string().min(2, "Namn måste vara minst 2 tecken").max(100, "Namn får vara max 100 tecken"),
  email: z.string().email("Ogiltig e-postadress").max(255, "E-post får vara max 255 tecken"),
  phone: z.string().max(20, "Telefonnummer får vara max 20 tecken").optional(),
  agency: z.string().max(100, "Mäklarbyrå får vara max 100 tecken").optional(),
  office: z.string().max(100, "Kontor får vara max 100 tecken").optional(),
  area: z.string().max(100, "Område får vara max 100 tecken").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    if (data) {
      setValue("full_name", data.full_name || "");
      setValue("email", data.email || "");
      setValue("phone", data.phone || "");
      setValue("agency", data.agency || "");
      setValue("office", data.office || "");
      setValue("area", data.area || "");
      setAvatarUrl(data.avatar_url);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;

    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    setUploading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("property-images")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Profilbild uppladdad!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Kunde inte ladda upp profilbild");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || null,
          agency: data.agency || null,
          office: data.office || null,
          area: data.area || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profil uppdaterad!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Kunde inte uppdatera profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Min profil</CardTitle>
        <CardDescription>
          Uppdatera dina profiluppgifter som visas för kunder
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Profile Header with Text and Avatar */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* About Text */}
            <div className="flex-1 space-y-4">
              <div className="space-y-3">
                <p className="text-foreground leading-relaxed">
                  Vill du samarbeta med en mäklare som är effektiv, gillar att se resultat, med en rak kommunikation samt har nära till skratt? Då är jag rätt mäklare för dig!
                </p>
                <p className="text-foreground leading-relaxed">
                  Jag gillar att leda mina kunder i viktiga beslut. Att överträffa mina egna samt mina kunders mål är också något som ständigt driver mig framåt.
                </p>
                <p className="text-foreground font-semibold">
                  Kommunikation behöver inte vara krångligt!
                </p>
                <p className="text-foreground leading-relaxed">
                  Med mig som mäklare får du tydlighet, ordning och engagemang genom hela affären.
                </p>
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center lg:items-end gap-4">
              <Avatar className="w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] border-4 border-border">
                <AvatarImage src={avatarUrl || undefined} className="object-contain" />
                <AvatarFallback className="bg-muted">
                  <User className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? "Laddar upp..." : "Ladda upp profilbild"}</span>
                </div>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </Label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-3 max-w-2xl">
            <div className="space-y-1">
              <Label htmlFor="full_name">Fullständigt namn *</Label>
              <Input
                id="full_name"
                {...register("full_name")}
                placeholder="Ditt namn"
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">E-postadress *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="din.email@exempel.se"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Telefonnummer</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="070-123 45 67"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="agency">Mäklarbyrå</Label>
              <Input
                id="agency"
                {...register("agency")}
                placeholder="Din mäklarbyrå"
              />
              {errors.agency && (
                <p className="text-sm text-destructive">{errors.agency.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="office">Kontor</Label>
              <Input
                id="office"
                {...register("office")}
                placeholder="Kontorsort"
              />
              {errors.office && (
                <p className="text-sm text-destructive">{errors.office.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="area">Område</Label>
              <Input
                id="area"
                {...register("area")}
                placeholder="Områden du arbetar i"
              />
              {errors.area && (
                <p className="text-sm text-destructive">{errors.area.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sparar..." : "Spara profil"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
