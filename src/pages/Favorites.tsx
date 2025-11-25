import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Property {
  id: string;
  title: string;
  address: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  hoverImage?: string;
  type: string;
  fee?: number;
  isSold: boolean;
  isNew: boolean;
  agent_name?: string;
  agent_avatar?: string;
  agent_phone?: string;
  listedDate?: string;
  soldDate?: string;
  soldPrice?: string;
  hasVR?: boolean;
}

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/logga-in");
      return;
    }

    if (!favoritesLoading && favorites.length > 0) {
      fetchFavoriteProperties();
    } else if (!favoritesLoading) {
      setLoading(false);
    }
  }, [user, favorites, favoritesLoading, navigate]);

  const fetchFavoriteProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            phone
          )
        `)
        .in("id", favorites)
        .eq("is_deleted", false);

      if (error) throw error;

      const formattedData = data.map((property: any) => ({
        id: property.id,
        title: property.title,
        address: property.address,
        location: property.location,
        price: property.price.toString(),
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        image: property.image_url || "",
        hoverImage: property.hover_image_url,
        type: property.type,
        fee: property.fee,
        isSold: property.is_sold,
        isNew: property.is_coming_soon,
        agent_name: property.profiles?.full_name,
        agent_avatar: property.profiles?.avatar_url,
        agent_phone: property.profiles?.phone,
        listedDate: property.listed_date,
        soldDate: property.sold_date,
        soldPrice: property.sold_price?.toString(),
        hasVR: property.has_vr
      }));

      setProperties(formattedData);
    } catch (error) {
      console.error("Error fetching favorite properties:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Mina favoriter</h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-20 h-20 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h2 className="text-2xl font-semibold mb-2">Inga favoriter ännu</h2>
              <p className="text-muted-foreground mb-6">
                Börja spara dina favoritbostäder genom att klicka på hjärtikonen
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  {...property}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
