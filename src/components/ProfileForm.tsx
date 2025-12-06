import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Upload, Lock } from "lucide-react";
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
  const [agencyEmail, setAgencyEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

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
      .select("*, agencies(email)")
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
      
      // Set agency email from joined agencies table
      if (data.agencies && typeof data.agencies === 'object' && 'email' in data.agencies) {
        setAgencyEmail((data.agencies as { email: string | null }).email);
      }
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

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      toast.error("Ange ditt nuvarande lösenord");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Fyll i båda lösenordsfälten");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Lösenorden matchar inte");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Lösenordet måste vara minst 6 tecken");
      return;
    }

    setPasswordLoading(true);

    try {
      // First verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Nuvarande lösenord är felaktigt");
        setPasswordLoading(false);
        return;
      }

      // Then update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Lösenord uppdaterat!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Kunde inte uppdatera lösenord");
    } finally {
      setPasswordLoading(false);
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
          <Avatar className="w-64 h-64">
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

        <Separator className="my-6" />

        {/* Password Change Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Byt lösenord
          </h3>
          <div className="grid gap-4 max-w-2xl">
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Nuvarande lösenord</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ange ditt nuvarande lösenord"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">Nytt lösenord</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minst 6 tecken"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Bekräfta nytt lösenord</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Upprepa det nya lösenordet"
              />
            </div>
            <Button 
              type="button" 
              onClick={handlePasswordChange} 
              disabled={passwordLoading}
              variant="outline"
              className="w-full"
            >
              {passwordLoading ? "Uppdaterar..." : "Uppdatera lösenord"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
