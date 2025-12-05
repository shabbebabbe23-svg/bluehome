import React, { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PropertyGrid from "@/components/PropertyGrid";
import AgentGrid from "@/components/AgentGrid";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import LazyMap from "@/components/LazyMap";
import InlineAdBanner from "@/components/InlineAdBanner";
import PropertyCard from "@/components/PropertyCard";
import { Property } from "@/components/PropertyGrid";
import { supabase } from "@/integrations/supabase/client";
import soffaBanner from "@/assets/soffa-banner.png";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import logo1 from "@/assets/logo-1.svg";
import bathroomAd from "@/assets/bathroom-ad.jpg";
import kitchenAd from "@/assets/kitchen-ad.jpg";
import { Clock } from "lucide-react";

const Index = () => {
  const [showFinalPrices, setShowFinalPrices] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000000]);
  const [areaRange, setAreaRange] = useState<[number, number]>([0, 200]);
  const [roomRange, setRoomRange] = useState<[number, number]>([0, 7]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [searchMode, setSearchMode] = useState<'property' | 'agent'>('property');
  const [newConstructionFilter, setNewConstructionFilter] = useState<'include' | 'only' | 'exclude'>('include');
  const [elevatorFilter, setElevatorFilter] = useState(false);
  const [balconyFilter, setBalconyFilter] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // First get properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (propertiesError) throw propertiesError;

        if (propertiesData) {
          // Get unique user IDs
          const userIds = [...new Set(propertiesData.map(p => p.user_id))];

          // Fetch profiles for these users
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, phone, email, agency')
            .in('id', userIds);

          // Create a map of user_id to profile
          const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

          const formattedProperties: Property[] = propertiesData.map((prop: any) => {
            const profile = profilesMap.get(prop.user_id);
            return {
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
              agent_name: profile?.full_name,
              agent_avatar: profile?.avatar_url,
              agent_phone: profile?.phone,
              agent_email: profile?.email,
              agent_agency: profile?.agency,
              agent_id: profile?.id,
            };
          });
          setAllProperties(formattedProperties);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, []);

  // Get the 5 most recent properties
  const recentProperties = allProperties
    .filter(p => !p.isSold)
    .slice(0, 5);

  return (
    <div className="min-h-screen" style={{ background: 'var(--main-gradient)' }}>
      <Header />
      <div className="flex flex-col lg:flex-row items-start justify-center gap-4 md:gap-6 px-3 sm:px-4 lg:px-8">
        <AdBanner
          imageSrc={soffaBanner}
          alt={"Soffa annons"}
          title={"Soffor — Fynda din nya soffa"}
          description={"Letar du efter en ny soffa? Upptäck kvalitetssoffor till bra priser."}
          bullets={["✓ Fri hemleverans", "✓ 0% delbetalning", "✓ Många tyger och färger"]}
          buttonText={"Se erbjudanden"}
          note={<><strong className="font-semibold">Spara 5 000 kr</strong>{" - Erbjudande: fri frakt denna månad"}</>}
          className="lg:order-1 order-3 ml-10 transform scale-90"
        />
        <main className="order-1 lg:order-2 flex-1 w-full">
          <Hero
            onFinalPricesChange={setShowFinalPrices}
            onPropertyTypeChange={setPropertyType}
            onSearchAddressChange={setSearchAddress}
            onSearchModeChange={setSearchMode}
            onSearchSubmit={scrollToResults}
            onPriceRangeChange={setPriceRange}
            onAreaRangeChange={setAreaRange}
            onRoomRangeChange={setRoomRange}
            onNewConstructionFilterChange={setNewConstructionFilter}
            onElevatorFilterChange={setElevatorFilter}
            onBalconyFilterChange={setBalconyFilter}
          />
          <div ref={resultsRef}>
            {/* Recent uploads section */}
            {recentProperties.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                    Senast uppladdade objekt
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {recentProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      id={property.id}
                      title={property.title}
                      price={property.price}
                      location={property.location}
                      address={property.address}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      area={property.area}
                      fee={property.fee}
                      image={property.image}
                      hoverImage={property.hoverImage}
                      type={property.type}
                      viewingDate={property.viewingDate}
                      vendorLogo={property.vendorLogo}
                      hasVR={property.hasVR}
                      agent_name={property.agent_name}
                      agent_avatar={property.agent_avatar}
                      agent_phone={property.agent_phone}
                      agent_agency={property.agent_agency}
                      agent_id={property.agent_id}
                      autoSlideImages={true}
                    />
                  ))}
                </div>
              </section>
            )}
            {searchMode === 'property' ? (
              <PropertyGrid
                showFinalPrices={showFinalPrices}
                propertyType={propertyType}
                searchAddress={searchAddress}
                priceRange={priceRange}
                areaRange={areaRange}
                roomRange={roomRange}
                newConstructionFilter={newConstructionFilter}
                elevatorFilter={elevatorFilter}
                balconyFilter={balconyFilter}
              />
            ) : (
              <AgentGrid searchQuery={searchAddress} />
            )}
          </div>
        </main>
        <AdBanner
          note={<><strong className="font-semibold">Specialerbjudande: 15% rabatt i april</strong></>}
          className="lg:order-3 order-2 mr-10 transform scale-90"
        />
      </div>
      <div className="w-full px-3 sm:px-4 lg:px-8 mt-8">
        <LazyMap properties={allProperties} />
      </div>
      {/* Renovation ads under the map */}
      <div className="w-full px-3 sm:px-4 lg:px-8 mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InlineAdBanner
              title="Badrumsrenovering — Komplett service"
              description="Expertteam som tar hand om hela renoveringen från idé till färdigt badrum."
              bullets={["✓ Kostnadsfri uppmätning", "✓ Våtrumsbehöriga installatörer", "✓ 10 års garanti"]}
              imageSrc={bathroomAd}
              buttonText="Begär offert"
              note={<strong className="text-xs">Erbjudande: 10% för nya kunder</strong>}
            />

            <InlineAdBanner
              title="Köksrenovering — Design & installation"
              description="Skräddarsydda kök med fokus på funktion och hållbarhet. Vi hjälper med allt."
              bullets={["✓ Måttanpassat skräddarsytt", "✓ Energismarta vitvaror", "✓ Fast pris"]}
              imageSrc={kitchenAd}
              buttonText="Se paketlösningar"
              note={<strong className="text-xs">Finansiering tillgänglig</strong>}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
