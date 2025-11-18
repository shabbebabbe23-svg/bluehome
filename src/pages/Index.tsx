import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PropertyGrid from "@/components/PropertyGrid";
import AgentGrid from "@/components/AgentGrid";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import AllPropertiesMap from "@/components/AllPropertiesMap";
import { Property } from "@/components/PropertyGrid";
import { supabase } from "@/integrations/supabase/client";
import sofaAd from "@/assets/sofa-ad.svg";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import logo1 from "@/assets/logo-1.svg";

const Index = () => {
  const [userSofaSrc, setUserSofaSrc] = useState<string | null>(null);
  const [showFinalPrices, setShowFinalPrices] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [searchMode, setSearchMode] = useState<'property' | 'agent'>('property');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            profiles:user_id (
              id,
              full_name,
              avatar_url,
              phone,
              email,
              agency
            )
          `)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedProperties: Property[] = data.map((prop: any) => ({
            id: prop.id,
            title: prop.title,
            price: `${prop.price.toLocaleString('sv-SE')} kr`,
            priceValue: prop.price,
            location: prop.location,
            address: prop.address,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            area: prop.area,
            fee: prop.fee || 0,
            viewingDate: prop.viewing_date ? new Date(prop.viewing_date) : new Date(),
            image: prop.image_url || property1,
            hoverImage: prop.hover_image_url || prop.image_url || property2,
            type: prop.type,
            isNew: false,
            vendorLogo: prop.vendor_logo_url || logo1,
            isSold: prop.is_sold || false,
            soldDate: prop.sold_date ? new Date(prop.sold_date) : undefined,
            hasVR: prop.has_vr || false,
            agent_name: prop.profiles?.full_name,
            agent_avatar: prop.profiles?.avatar_url,
            agent_phone: prop.profiles?.phone,
            agent_email: prop.profiles?.email,
            agent_agency: prop.profiles?.agency,
            agent_id: prop.profiles?.id,
          }));
          setAllProperties(formattedProperties);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    // Try to load a user-provided PNG at runtime without causing build errors.
    const candidate = "/src/assets/soffa-banner.png";
    const img = new Image();
    img.onload = () => setUserSofaSrc(candidate);
    img.onerror = () => {};
    img.src = candidate;
  }, []);

  return (
    <div className="min-h-screen" style={{background: 'var(--main-gradient)'}}>
      <Header />
      <div className="flex flex-col lg:flex-row items-start justify-center gap-4 md:gap-6 px-3 sm:px-4 lg:px-8">
        <AdBanner
          imageSrc={userSofaSrc ?? sofaAd}
          alt={"Soffa annons"}
          title={"Soffor — Fynda din nya soffa"}
          description={"Letar du efter en ny soffa? Upptäck kvalitetssoffor till bra priser."}
          bullets={["✓ Fri hemleverans", "✓ 0% delbetalning", "✓ Många tyger och färger"]}
          buttonText={"Se erbjudanden"}
          note={<><strong className="font-semibold">Spara 5 000 kr</strong>{" - Erbjudande: fri frakt denna månad"}</>}
          className="lg:order-1 order-3"
        />
        <main className="order-1 lg:order-2 flex-1 w-full">
          <Hero 
            onFinalPricesChange={setShowFinalPrices} 
            onPropertyTypeChange={setPropertyType}
            onSearchAddressChange={setSearchAddress}
            onSearchModeChange={setSearchMode}
          />
          {searchMode === 'property' ? (
            <PropertyGrid 
              showFinalPrices={showFinalPrices} 
              propertyType={propertyType}
              searchAddress={searchAddress}
            />
          ) : (
            <AgentGrid searchQuery={searchAddress} />
          )}
        </main>
  <AdBanner
    note={<><strong className="font-semibold">Specialerbjudande: 15% rabatt i april</strong></>}
    className="lg:order-3 order-2"
  />
      </div>
      <div className="w-full px-3 sm:px-4 lg:px-8 mt-8">
        <AllPropertiesMap properties={allProperties} />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
