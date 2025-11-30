import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Upload, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  bio: z.string().max(1000, "Presentation får vara max 1000 tecken").optional(),
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
      setValue("bio", data.bio || "");
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
          bio: data.bio || null,
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
    <Card className="relative">
      <CardHeader>
        <CardTitle>Min profil</CardTitle>
        <CardDescription>
          Uppdatera dina profiluppgifter som visas för kunder på fastighetsannonser
        </CardDescription>
      </CardHeader>
      
      {/* Avatar in top-right corner */}
      <div className="absolute top-6 right-6 flex flex-col items-center gap-2">
        <div className="relative">
          <Avatar className="w-64 h-64 border-4 border-border">
            <AvatarImage src={avatarUrl || undefined} className="object-contain p-2" />
            <AvatarFallback className="bg-muted">
              <User className="w-32 h-32 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <Label htmlFor="avatar-upload" className="cursor-pointer absolute bottom-0 right-0">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center shadow-lg">
              <Upload className="w-8 h-8" />
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

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <Separator />

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Grundläggande information</h3>
            <div className="grid gap-4 max-w-2xl">
              <div className="space-y-1">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  Fullständigt namn
                  <Badge variant="destructive" className="text-xs">Obligatorisk</Badge>
                </Label>
                <Input
                  id="full_name"
                  {...register("full_name")}
                  placeholder="Ditt fullständiga namn"
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Visas på alla dina fastighetsannonser</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="flex items-center gap-2">
                  E-postadress
                  <Badge variant="destructive" className="text-xs">Obligatorisk</Badge>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="din.email@exempel.se"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Kontaktuppgift för intresserade kunder</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  Telefonnummer
                  <Badge variant="secondary" className="text-xs">Rekommenderad</Badge>
                </Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="070-123 45 67"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Visas på fastighetsannonser för direktkontakt</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Business Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Företagsinformation
            </h3>
            <div className="grid gap-4 max-w-2xl">
              <div className="space-y-1">
                <Label htmlFor="agency" className="flex items-center gap-2">
                  Mäklarbyrå
                  <Badge variant="destructive" className="text-xs">Viktigt!</Badge>
                </Label>
                <Input
                  id="agency"
                  {...register("agency")}
                  placeholder="t.ex. Hemnet Mäkleri AB"
                />
                {errors.agency && (
                  <p className="text-sm text-destructive">{errors.agency.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Visas direkt under ditt namn på fastighetsannonser</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="office" className="flex items-center gap-2">
                  Kontor
                  <Badge variant="secondary" className="text-xs">Rekommenderad</Badge>
                </Label>
                <Input
                  id="office"
                  {...register("office")}
                  placeholder="t.ex. Stockholm City"
                />
                {errors.office && (
                  <p className="text-sm text-destructive">{errors.office.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Kontorets plats eller namn</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="area" className="flex items-center gap-2">
                  Område
                  <Badge variant="outline" className="text-xs">Valfri</Badge>
                </Label>
                <Input
                  id="area"
                  {...register("area")}
                  placeholder="t.ex. Stockholm, Södermalm, Vasastan"
                />
                {errors.area && (
                  <p className="text-sm text-destructive">{errors.area.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Områden där du är verksam</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* About Me Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Om mig
            </h3>
            <div className="space-y-1 max-w-2xl">
              <Label htmlFor="bio" className="flex items-center gap-2">
                Presentation
                <Badge variant="secondary" className="text-xs">Rekommenderad</Badge>
              </Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Ett stort engagemang, hög service och kvalité kännetecknar Elisabets arbetssätt som fastighetsmäklare på Wrede. Hon är idag främst verksam på Lidingö där hon bor med sin familj men har även en stark anknytning till Östermalm. Elisabet har en bakgrund som utbildad Civilekonom från Handelshögskolan i Stockholm samt ledande befattningar inom kundservice och marknadsföring, senast på iZettle."
                rows={6}
                className="resize-none"
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Din presentation visas på din publika mäklarprofil. Max 1000 tecken.
              </p>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Sparar..." : "Spara profil"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
