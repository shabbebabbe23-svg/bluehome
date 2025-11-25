import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("property_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites(data.map(f => f.property_id));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    if (!user) {
      toast.error("Du måste vara inloggad för att spara favoriter");
      return;
    }

    const isFavorite = favorites.includes(propertyId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", propertyId);

        if (error) throw error;
        setFavorites(favorites.filter(id => id !== propertyId));
        toast.success("Borttagen från favoriter");
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, property_id: propertyId });

        if (error) throw error;
        setFavorites([...favorites, propertyId]);
        toast.success("Tillagd i favoriter");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Något gick fel");
    }
  };

  return { favorites, loading, toggleFavorite, isFavorite: (id: string) => favorites.includes(id) };
};
