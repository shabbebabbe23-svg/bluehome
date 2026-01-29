import { useState, useEffect } from "react";
import ImageCropper from "./ImageCropper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Upload, Lock, Eye, EyeOff, Instagram } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
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
  instagram_url: z.string().url("Ogiltig URL").max(255).optional().or(z.literal("")),
  tiktok_url: z.string().url("Ogiltig URL").max(255).optional().or(z.literal("")),
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasInstagram, setHasInstagram] = useState(false);
  const [hasTiktok, setHasTiktok] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: "", color: "" };
    
    let score = 0;
    if (password.length >= 6) score += 20;
    if (password.length >= 10) score += 20;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;
    
    if (score <= 20) return { score, label: "Mycket svagt", color: "bg-red-500" };
    if (score <= 40) return { score, label: "Svagt", color: "bg-orange-500" };
    if (score <= 60) return { score, label: "Godkänt", color: "bg-yellow-500" };
    if (score <= 80) return { score, label: "Starkt", color: "bg-green-500" };
    return { score, label: "Mycket starkt", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const bioValue = watch("bio") || "";

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
      setValue("instagram_url", data.instagram_url || "");
      setValue("tiktok_url", data.tiktok_url || "");
      setAvatarUrl(data.avatar_url);
      setHasInstagram(!!data.instagram_url);
      setHasTiktok(!!data.tiktok_url);
      
      // Set agency email from joined agencies table
      if (data.agencies && typeof data.agencies === 'object' && 'email' in data.agencies) {
        setAgencyEmail((data.agencies as { email: string | null }).email);
      }
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawImage(e.target?.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user) return;
    setUploading(true);
    const fileExt = "jpg";
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    try {
      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(filePath, croppedBlob, { contentType: "image/jpeg" });
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
      setShowCropper(false);
      setRawImage(null);
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
          instagram_url: hasInstagram ? (data.instagram_url || null) : null,
          tiktok_url: hasTiktok ? (data.tiktok_url || null) : null,
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
      <CardHeader className="pr-32 md:pr-80">
        <CardTitle>Min profil</CardTitle>
        <CardDescription>
          Uppdatera dina profiluppgifter som visas för kunder på fastighetsannonser
        </CardDescription>
      </CardHeader>
      
      {/* Avatar in top-right corner */}
      <div className="absolute top-6 right-2 md:right-6 flex flex-col items-center gap-2">
        <div className="relative">
          <Avatar className="w-24 h-24 md:w-64 md:h-64">
            <AvatarImage src={avatarUrl || undefined} className="object-contain p-2" />
            <AvatarFallback className="bg-muted">
              <User className="w-12 h-12 md:w-32 md:h-32 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <Label htmlFor="avatar-upload" className="cursor-pointer absolute bottom-0 right-0">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-full transition-colors flex items-center justify-center shadow-lg hover:bg-primary/90 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary">
              <Upload className="w-5 h-5 md:w-8 md:h-8" />
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
        {showCropper && rawImage && (
          <ImageCropper
            image={rawImage}
            onCropComplete={handleCropComplete}
            onCancel={() => { setShowCropper(false); setRawImage(null); }}
          />
        )}
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
                Din presentation visas på din publika mäklarprofil. <span className={bioValue.length > 1000 ? "text-destructive font-medium" : ""}>{bioValue.length}/1000 tecken</span>
              </p>
            </div>
          </div>

          <Separator />

          {/* Social Media Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Instagram className="w-5 h-5" />
              Sociala medier
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Kryssa i vilka sociala medier du har och lägg till länkarna. Dessa visas på din publika profil.
            </p>
            <div className="grid gap-4 max-w-2xl">
              {/* Instagram */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="has_instagram" 
                    checked={hasInstagram}
                    onCheckedChange={(checked) => setHasInstagram(checked === true)}
                  />
                  <Label htmlFor="has_instagram" className="cursor-pointer">
                    Jag har Instagram
                  </Label>
                </div>
                {hasInstagram && (
                  <div className="ml-6">
                    <Input
                      {...register("instagram_url")}
                      placeholder="https://instagram.com/ditt-användarnamn"
                    />
                    {errors.instagram_url && (
                      <p className="text-sm text-destructive mt-1">{errors.instagram_url.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* TikTok */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="has_tiktok" 
                    checked={hasTiktok}
                    onCheckedChange={(checked) => setHasTiktok(checked === true)}
                  />
                  <Label htmlFor="has_tiktok" className="cursor-pointer">
                    Jag har TikTok
                  </Label>
                </div>
                {hasTiktok && (
                  <div className="ml-6">
                    <Input
                      {...register("tiktok_url")}
                      placeholder="https://tiktok.com/@ditt-användarnamn"
                    />
                    {errors.tiktok_url && (
                      <p className="text-sm text-destructive mt-1">{errors.tiktok_url.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg" variant="default">
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
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ange ditt nuvarande lösenord"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nytt lösenord</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minst 6 tecken"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Lösenordsstyrka:</span>
                    <span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tips: Använd stora och små bokstäver, siffror och specialtecken
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Bekräfta nytt lösenord</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Upprepa det nya lösenordet"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">Lösenorden matchar inte</p>
              )}
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
