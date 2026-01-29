import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Mail, MapPin, Phone, User, Home, Globe, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Agent {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  area: string | null;
  avatar_url: string | null;
  bio: string | null;
}

const AgencyProfile = () => {
  const { agencyId } = useParams();
  const navigate = useNavigate();

  // Fetch agency info
  const { data: agency, isLoading: isLoadingAgency } = useQuery({
    queryKey: ["agency-profile", agencyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .eq("id", agencyId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!agencyId,
  });

  // Fetch agents belonging to this agency
  const { data: agents, isLoading: isLoadingAgents } = useQuery({
    queryKey: ["agency-agents", agencyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, area, avatar_url, bio")
        .eq("agency_id", agencyId);

      if (error) throw error;
      return data as Agent[];
    },
    enabled: !!agencyId,
  });

  // Fetch all properties from agents in this agency
  const { data: properties, isLoading: isLoadingProperties } = useQuery({
    queryKey: ["agency-properties", agencyId, agents],
    queryFn: async () => {
      if (!agents || agents.length === 0) return [];
      
      const agentIds = agents.map(a => a.id);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .in("user_id", agentIds)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!agents && agents.length > 0,
  });

  if (isLoadingAgency) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-8">
            <Skeleton className="w-32 h-32 rounded-lg" />
            <Skeleton className="w-64 h-8" />
            <Skeleton className="w-full max-w-4xl h-96" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Mäklarbyrå hittades inte</h1>
          <p className="text-muted-foreground mb-6">
            Kunde inte hitta informationen för denna mäklarbyrå.
          </p>
          <Button onClick={() => navigate("/")} variant="default">
            Tillbaka till startsidan
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 sm:py-16">
        {/* Agency Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              {/* Top row: Logo + Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {agency.logo_url ? (
                    <img
                      src={agency.logo_url}
                      alt={agency.name}
                      className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain border-4 border-border rounded-lg bg-white p-2"
                    />
                  ) : (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 border-4 border-border rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary" />
                    </div>
                  )}
                </div>

                {/* Main info */}
                <div className="flex-1 text-center sm:text-left space-y-4 min-w-0">
                  {/* Name */}
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
                      {agency.name}
                    </h1>

                    {/* Description */}
                    {agency.description && (
                      <p className="text-muted-foreground text-sm sm:text-base mt-2">
                        {agency.description}
                      </p>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-2 max-w-md">
                    {agency.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{agency.address}</span>
                      </div>
                    )}

                    {agency.email && (
                      <div className="flex items-center gap-2 text-sm justify-center sm:justify-start">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <a
                          href={`mailto:${agency.email}`}
                          className="hover:text-primary transition-colors truncate"
                        >
                          {agency.email}
                        </a>
                      </div>
                    )}

                    {agency.phone && (
                      <div className="flex items-center gap-2 text-sm justify-center sm:justify-start">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <a
                          href={`tel:${agency.phone}`}
                          className="hover:text-primary transition-colors"
                        >
                          {agency.phone}
                        </a>
                      </div>
                    )}

                    {agency.website && (
                      <div className="flex items-center gap-2 text-sm justify-center sm:justify-start">
                        <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <a
                          href={agency.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors truncate"
                        >
                          Besök hemsida
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom row: Stats */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-4 border-t border-border">
                {/* Agent count */}
                <div className="text-center">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">
                      {agents?.length || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 justify-center">
                      <Users className="w-4 h-4" />
                      Mäklare
                    </div>
                  </div>
                </div>

                {/* Property count */}
                <div className="text-center">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">
                      {properties?.length || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 justify-center">
                      <Home className="w-4 h-4" />
                      Aktiva fastigheter
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agency's Agents */}
        {agents && agents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Våra mäklare</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {agents.map((agent) => (
                <Card
                  key={agent.id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/agent/${agent.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border border-border">
                      <AvatarImage src={agent.avatar_url || undefined} className="object-cover" />
                      <AvatarFallback className="bg-primary text-white text-lg">
                        {agent.full_name
                          ? agent.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                          : "M"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{agent.full_name || "Mäklare"}</h3>
                      {agent.area && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{agent.area}</span>
                        </p>
                      )}
                      {agent.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{agent.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Agency's Properties */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {properties?.length ? `Fastigheter från ${agency.name}` : "Inga aktiva fastigheter"}
          </h2>

          {isLoadingProperties || isLoadingAgents ? (
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
                  vendorLogo={agency.logo_url || undefined}
                  viewingDate={property.viewing_date ? new Date(property.viewing_date) : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Home className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Denna mäklarbyrå har inga aktiva fastigheter för tillfället.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AgencyProfile;
