import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
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
      const { data: agency, error: agencyError } = await supabase
        .from("agencies")
        .insert({ name: form.name, email_domain: form.email_domain })
        .select()
        .single();
      if (agencyError) throw agencyError;
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
          {invitationLink ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <p className="font-medium">Inbjudningslänk:</p>
                <Input value={invitationLink} readOnly className="font-mono text-sm" />
                <Button type="button" onClick={() => navigator.clipboard.writeText(invitationLink)}>
                  Kopiera länk
                </Button>
              </div>
              <Button type="button" onClick={() => { setInvitationLink(null); setForm({ name: "", email_domain: "", admin_name: "", admin_email: "" }); }}>
                Skapa ny byrå
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
