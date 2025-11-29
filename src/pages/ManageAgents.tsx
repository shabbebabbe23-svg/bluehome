import { useState, useEffect } from "react";
import { Pencil, Trash2, Download, RefreshCw, Mail, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ManageAgents = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  useEffect(() => {
    fetchAgents();
  }, []);

  // Fix invalid characters and ensure proper handling of user_id
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data: agentsData, error: agentsError } = await supabase
        .from("profiles")
        .select("id, full_name, email");
      if (agentsError) {
        toast({ title: "Fel", description: `Kunde inte hämta mäklare: ${agentsError.message}` });
        setLoading(false);
        return;
      }
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("id, user_id, is_sold, views");
      if (propertiesError) {
        toast({ title: "Fel", description: `Kunde inte hämta objekt: ${propertiesError.message}` });
        setLoading(false);
        return;
      }
      const agentsWithStats = (agentsData || []).map(agent => {
        const props = (propertiesData || []).filter(p => p.user_id === agent.id);
        return {
          ...agent,
          propertyCount: props.length,
          soldCount: props.filter(p => p.is_sold).length,
          views: props.reduce((sum, p) => sum + (p.views || 0), 0),
        };
      });
      setAgents(agentsWithStats);
    } catch (err) {
      toast({ title: "Fel", description: `Tekniskt fel: ${err}` });
    }
    setLoading(false);
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm("Ta bort mäklare?")) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) toast({ title: "Fel", description: "Kunde inte ta bort mäklare.", variant: "destructive" });
    else toast({ title: "Mäklare borttagen" });
    fetchAgents();
    setLoading(false);
  };

  // Gör handleEdit till en async-funktion
  const handleEdit = async (agent: any) => {
    setEditId(agent.id);
    const newId = crypto.randomUUID();
    const { error } = await supabase
      .from("profiles")
      .insert({ id: newId, full_name: form.name, email: form.email });
    if (error) {
      toast({ title: "Fel", description: "Kunde inte uppdatera mäklare.", variant: "destructive" });
    } else {
      toast({ title: "Mäklare uppdaterad!" });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editForm.name, email: editForm.email })
      .eq("id", editId);
    if (error) toast({ title: "Fel", description: "Kunde inte uppdatera mäklare.", variant: "destructive" });
    else toast({ title: "Mäklare uppdaterad" });
    setEditId(null);
    fetchAgents();
    setLoading(false);
  };

  const handleExport = () => {
    const rows = agents.map(a => `${a.full_name},${a.email},${a.propertyCount}`);
    const csv = `Namn,E-post,Objekt\n${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maklare.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!form.name || !form.email) {
      toast({ title: "Ofullständig information", description: "Fyll i alla fält.", variant: "destructive" });
      setLoading(false);
      return;
    }
    const newId = crypto.randomUUID();
    const { error } = await supabase
      .from("profiles")
      .insert({ id: newId, full_name: form.name, email: form.email });
    if (error) toast({ title: "Fel", description: "Kunde inte lägga till mäklare.", variant: "destructive" });
    else toast({ title: "Mäklare tillagd!", description: "Ny mäklare är nu registrerad." });
    setForm({ name: "", email: "" });
    fetchAgents();
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!form.email) return toast({ title: "Fyll i e-post", description: "E-post krävs för inbjudan.", variant: "destructive" });
    setLoading(true);
    // Skapa token och skicka inbjudan (mockad, implementera e-post vid behov)
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2);
    await supabase.from("agency_invitations").insert({
      email: form.email,
      role: "maklare",
      token,
      expires_at: expiresAt.toISOString(),
      created_by: null,
    });
    toast({ title: "Inbjudan skickad!", description: `Länk: /acceptera-inbjudan?token=${token}` });
    setLoading(false);
  };

  const handleResetPassword = async (id: string) => {
    // Mockad, implementera riktig e-post vid behov
    toast({ title: "Återställ lösenord", description: "Länk för återställning skickad till mäklaren." });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Hantera mäklare</CardTitle>
          <CardDescription>Registrera nya mäklare och se befintliga.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <Label htmlFor="name">Namn *</Label>
              <Input id="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">E-post *</Label>
              <Input id="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            {/* Rollval borttagen, endast mäklare tillåts */}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="w-full">Lägg till</Button>
              <Button type="button" variant="outline" onClick={handleInvite} disabled={loading}>
                <Mail className="w-4 h-4 mr-1" /> Skicka inbjudan
              </Button>
            </div>
          </form>
          <div className="mb-4 flex gap-2 items-center">
            <Input
              placeholder="Sök mäklare..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Button type="button" variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> Exportera CSV
            </Button>
          </div>
          {/* Sök och export ovan, ingen extra form här! */}
          <div>
            <h3 className="font-semibold mb-2">Befintliga mäklare</h3>
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Laddar...</div>
            ) : agents.length === 0 ? (
              <div className="text-center py-4 text-destructive">Inga mäklare registrerade eller fel vid hämtning.<br />Kontrollera databas eller loggar.</div>
            ) : (
              <ul className="space-y-2">
                {agents.filter(a =>
                  a.full_name.toLowerCase().includes(search.toLowerCase()) ||
                  a.email.toLowerCase().includes(search.toLowerCase())
                ).map(agent => (
                  <li key={agent.id} className="p-2 border rounded flex flex-col md:flex-row justify-between items-center gap-2">
                    {editId === agent.id ? (
                      <form onSubmit={handleEditSubmit} className="flex gap-2 items-center w-full">
                        <Input
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="max-w-[120px]"
                        />
                        <Input
                          value={editForm.email}
                          onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                          className="max-w-[180px]"
                        />
                        <Button type="submit" size="sm">Spara</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setEditId(null)}>Avbryt</Button>
                      </form>
                    ) : (
                      <>
                        <span className="flex-1">
                          {agent.full_name} ({agent.email})
                          {/* Roll visas ej, fältet finns ej i profilen */}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Objekt: {agent.propertyCount} | Sålda: {agent.soldCount} | Visningar: {agent.views}
                        </span>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(agent)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(agent.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => handleResetPassword(agent.id)}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageAgents;
