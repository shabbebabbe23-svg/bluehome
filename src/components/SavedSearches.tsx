import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Save, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SavedSearch {
  id: string;
  name: string;
  search_criteria: any;
  created_at: string;
}

const SavedSearches = () => {
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    if (user) {
      fetchSavedSearches();
    }
  }, [user]);

  const fetchSavedSearches = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedSearches(data || []);
    } catch (error) {
      console.error("Error fetching saved searches:", error);
    }
  };

  const handleSaveSearch = async () => {
    if (!user || !searchName) return;

    try {
      const { error } = await supabase
        .from("saved_searches")
        .insert({
          user_id: user.id,
          name: searchName,
          search_criteria: {} // Add actual search criteria here
        });

      if (error) throw error;
      toast.success("Sökning sparad!");
      setSearchName("");
      setIsDialogOpen(false);
      fetchSavedSearches();
    } catch (error) {
      console.error("Error saving search:", error);
      toast.error("Kunde inte spara sökning");
    }
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      const { error } = await supabase
        .from("saved_searches")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Sökning raderad");
      fetchSavedSearches();
    } catch (error) {
      console.error("Error deleting search:", error);
      toast.error("Kunde inte radera sökning");
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Sparade sökningar
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Save className="w-4 h-4 mr-2" />
              Spara ny sökning
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Spara sökning</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="search-name">Namn på sökning</Label>
                <Input
                  id="search-name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="T.ex. '3:or i Stockholm under 4 miljoner'"
                />
              </div>
              <Button onClick={handleSaveSearch} className="w-full">
                Spara
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {savedSearches.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Inga sparade sökningar än
          </p>
        ) : (
          <div className="space-y-2">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <span className="font-medium">{search.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSearch(search.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedSearches;
