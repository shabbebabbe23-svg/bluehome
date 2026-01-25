import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FavoritesContextType {
  favorites: string[];
  loading: boolean;
  toggleFavorite: (propertyId: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  refetchFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    
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
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (propertyId: string) => {
    console.log("=== toggleFavorite called ===");
    console.log("propertyId:", propertyId);
    console.log("user:", user);
    console.log("user?.id:", user?.id);
    
    if (!user) {
      console.log("No user - showing login error");
      toast.error("Du måste vara inloggad för att spara favoriter");
      return;
    }

    const isFav = favorites.includes(propertyId);
    console.log("isFav:", isFav);

    try {
      if (isFav) {
        console.log("Removing favorite...");
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", propertyId);

        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== propertyId));
        toast.success("Borttagen från favoriter");
      } else {
        console.log("Adding favorite...");
        console.log("Insert data:", { user_id: user.id, property_id: propertyId });
        const { error, data } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, property_id: propertyId })
          .select();

        console.log("Insert result - error:", error, "data:", data);
        
        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }
        setFavorites(prev => [...prev, propertyId]);
        toast.success("Tillagd i favoriter");
        
        // Send notification to agent in background
        notifyAgent(propertyId);
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      // Show more specific error message
      if (error?.code === '23503') {
        toast.error("Denna fastighet finns inte längre");
      } else if (error?.code === '42501') {
        toast.error("Du har inte behörighet att spara favoriter");
      } else {
        toast.error("Något gick fel vid sparande av favorit");
      }
    }
  };

  const notifyAgent = async (propertyId: string) => {
    try {
      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("title, address, user_id")
        .eq("id", propertyId)
        .single();

      if (propError || !property) {
        console.error("Error fetching property:", propError);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", property.user_id)
        .single();

      if (profileError || !profile || !profile.email) {
        console.error("Error fetching agent profile:", profileError);
        return;
      }

      await supabase.functions.invoke("notify-favorite", {
        body: {
          property_id: propertyId,
          property_title: property.title,
          property_address: property.address,
          agent_email: profile.email,
          agent_name: profile.full_name || "Mäklare",
        }
      });

      console.log("Notification sent to agent");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, loading, toggleFavorite, isFavorite, refetchFavorites: fetchFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
