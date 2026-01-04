import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import LogoCropper from "@/components/LogoCropper";
import { Building2, Upload } from "lucide-react";

const CreateAgencyManual = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email_domain: "",
    admin_name: "",
    admin_email: "",
  });
  const [loading, setLoading] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempLogoImage, setTempLogoImage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempLogoImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const url = URL.createObjectURL(croppedBlob);
    setLogoFile(url);
    setShowCropper(false);
    setTempLogoImage(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempLogoImage(null);
  };

  const uploadLogo = async (agencyId: string): Promise<string | null> => {
    if (!logoFile) return null;
    
    try {
      const response = await fetch(logoFile);
      const blob = await response.blob();
      const fileName = `agencies/${agencyId}-logo-${Date.now()}.png`;
      
      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(fileName, blob, { contentType: "image/png" });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from("property-images")
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error("Logo upload error:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!form.name || !form.email_domain || !form.admin_name || !form.admin_email) {
      toast({ title: "Ofullständig information", description: "Fyll i alla fält.", variant: "destructive" });
      setLoading(false);
      return;
    }
    try {
      // Kontrollera om det redan finns en inbjudan för denna email som agency_admin
      const { data: existingInvitation } = await supabase
        .from("agency_invitations")
        .select("id, email")
        .eq("email", form.admin_email)
        .eq("role", "agency_admin")
        .maybeSingle();
      
      if (existingInvitation) {
        toast({ 
          title: "Mäklarchef finns redan", 
          description: "Denna email är redan registrerad som mäklarchef för en byrå.", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      const { data: agency, error: agencyError } = await supabase
        .from("agencies")
        .insert({ name: form.name, email_domain: form.email_domain })
        .select()
        .single();
      if (agencyError) throw agencyError;

      // Ladda upp logotyp om en valts
      const uploadedLogoUrl = await uploadLogo(agency.id);
      if (uploadedLogoUrl) {
        await supabase
          .from("agencies")
          .update({ logo_url: uploadedLogoUrl })
          .eq("id", agency.id);
        setLogoUrl(uploadedLogoUrl);
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 2); // 48h giltighet
      const { error: invitationError } = await supabase
        .from("agency_invitations")
        .insert({
          agency_id: agency.id,
          email: form.admin_email,
          role: "agency_admin",
          token,
          expires_at: expiresAt.toISOString(),
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });
      if (invitationError) throw invitationError;
      setInvitationLink(`${window.location.origin}/acceptera-inbjudan?token=${token}`);
      toast({ title: "Byrå skapad!", description: "Kopiera inbjudningslänken och skicka till byrå-chefen." });
    } catch (error: any) {
      toast({ title: "Fel", description: error.message || "Kunde inte skapa byrå.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Skapa ny mäklarbyrå manuellt</CardTitle>
          <CardDescription>Fyll i information om byrån och dess chef. En inbjudningslänk genereras.</CardDescription>
        </CardHeader>
        <CardContent>
          {showCropper && tempLogoImage && (
            <LogoCropper
              image={tempLogoImage}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
            />
          )}
          {invitationLink ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                {logoUrl && (
                  <div className="flex justify-center mb-4">
                    <img src={logoUrl} alt="Byrå logotyp" className="h-16 object-contain" />
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Byrå:</span> {form.name}</p>
                  <p><span className="font-medium">Email-domän:</span> {form.email_domain}</p>
                  <p><span className="font-medium">Chefens namn:</span> {form.admin_name}</p>
                  <p><span className="font-medium">Chefens email:</span> {form.admin_email}</p>
                </div>
                <hr className="my-3" />
                <p className="font-medium">Inbjudningslänk:</p>
                <Input value={invitationLink} readOnly className="font-mono text-sm" />
                <Button type="button" onClick={() => navigator.clipboard.writeText(invitationLink)}>
                  Kopiera länk
                </Button>
              </div>
              <Button type="button" onClick={() => { setInvitationLink(null); setLogoUrl(null); setLogoFile(null); setForm({ name: "", email_domain: "", admin_name: "", admin_email: "" }); }}>
                Skapa ny byrå
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Logotyp (valfritt)</Label>
                <div className="flex items-center gap-4 mt-2">
                  {logoFile ? (
                    <img src={logoFile} alt="Vald logotyp" className="h-12 object-contain border rounded p-1" />
                  ) : (
                    <div className="h-12 w-24 border rounded flex items-center justify-center bg-muted">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      className="hidden"
                    />
                    <span className="inline-flex items-center gap-2 px-3 py-2 border rounded hover:bg-muted text-sm">
                      <Upload className="h-4 w-4" />
                      {logoFile ? "Byt bild" : "Välj bild"}
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="name">Byrånamn *</Label>
                <Input id="name" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="email_domain">Email-domän *</Label>
                <Input id="email_domain" value={form.email_domain} onChange={handleChange} required />
                <p className="text-sm text-muted-foreground mt-1">Endast domännamn, t.ex. "maklarringen.se" (utan @)</p>
              </div>
              <div>
                <Label htmlFor="admin_name">Byrå-chefens namn *</Label>
                <Input id="admin_name" value={form.admin_name} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="admin_email">Byrå-chefens email *</Label>
                <Input id="admin_email" type="email" value={form.admin_email} onChange={handleChange} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full">Skapa byrå & generera länk</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAgencyManual;
