import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Mail, MapPin, Phone, User, Home, Instagram } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// TikTok icon component since lucide-react doesn't have one
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const AgentProfile = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();

  // Fetch agent profile
  const { data: agentProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["agent-profile", agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", agentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!agentId,
  });

  // Fetch agent's properties
  const { data: properties, isLoading: isLoadingProperties } = useQuery({
    queryKey: ["agent-properties", agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", agentId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!agentId,
  });

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-8">
            <Skeleton className="w-32 h-32 rounded-full" />
            <Skeleton className="w-64 h-8" />
            <Skeleton className="w-full max-w-4xl h-96" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!agentProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Mäklare hittades inte</h1>
          <p className="text-muted-foreground mb-6">
            Kunde inte hitta informationen för denna mäklare.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Agent Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar - larger size */}
              <div className="flex-shrink-0">
                <Avatar className="w-48 h-48 md:w-64 md:h-64 border-4 border-border">
                  <AvatarImage src={agentProfile.avatar_url || undefined} className="object-contain p-2" />
                  <AvatarFallback className="bg-primary text-white text-4xl">
                    <User className="w-24 h-24 md:w-32 md:h-32" />
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Right side - Bio and info moved up */}
              <div className="flex-1 space-y-6">
                {/* Name and Agency */}
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {agentProfile.full_name || "Mäklare"}
                  </h1>
                  
                  {agentProfile.agency && (
                    <div className="flex items-center gap-2 text-lg text-muted-foreground">
                      <Building2 className="w-5 h-5" />
                      <span>{agentProfile.agency}</span>
                    </div>
                  )}
                </div>

                {/* Bio Section - moved up and to the right */}
                {agentProfile.bio && (
                  <div className="text-foreground leading-relaxed">
                    <p className="text-base">{agentProfile.bio}</p>
                  </div>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agentProfile.area && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{agentProfile.area}</span>
                    </div>
                  )}
                  
                  {agentProfile.office && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>Kontor: {agentProfile.office}</span>
                    </div>
                  )}
                  
                  {agentProfile.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${agentProfile.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        {agentProfile.email}
                      </a>
                    </div>
                  )}

                  {/* Social Media Links */}
                  {agentProfile.instagram_url && (
                    <div className="flex items-center gap-2 text-sm">
                      <Instagram className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={agentProfile.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        Instagram
                      </a>
                    </div>
                  )}
                  
                  {agentProfile.tiktok_url && (
                    <div className="flex items-center gap-2 text-sm">
                      <TikTokIcon className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={agentProfile.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        TikTok
                      </a>
                    </div>
                  )}
                  
                  {agentProfile.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={`tel:${agentProfile.phone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {agentProfile.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="text-4xl font-bold text-primary mb-1">
                    {properties?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    Aktiva fastigheter
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent's Properties */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {properties?.length ? `${agentProfile.full_name || "Mäklarens"} fastigheter` : "Inga aktiva fastigheter"}
          </h2>
          
          {isLoadingProperties ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  title={property.address}
                  location={property.location}
                  price={`${property.price.toLocaleString('sv-SE')} kr`}
                  newPrice={property.new_price ? `${property.new_price.toLocaleString('sv-SE')} kr` : undefined}
                  type={property.type}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  area={property.area}
                  image={property.image_url || ""}
                  hoverImage={property.hover_image_url || undefined}
                  hasVR={property.has_vr || false}
                  listedDate={property.listed_date || undefined}
                  isSold={property.is_sold || false}
                  soldDate={property.sold_date || undefined}
                  soldPrice={property.sold_price ? `${property.sold_price.toLocaleString('sv-SE')} kr` : undefined}
                  vendorLogo={property.vendor_logo_url || undefined}
                  viewingDate={property.viewing_date ? new Date(property.viewing_date) : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Home className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Denna mäklare har inga aktiva fastigheter för tillfället.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AgentProfile;
