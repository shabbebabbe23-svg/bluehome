import React, { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PropertyGrid from "@/components/PropertyGrid";
import AgentGrid from "@/components/AgentGrid";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import LazyMap from "@/components/LazyMap";
import InlineAdBanner from "@/components/InlineAdBanner";
import RecentPropertiesCarousel from "@/components/RecentPropertiesCarousel";
import { Separator } from "@/components/ui/separator";
import { Property } from "@/components/PropertyGrid";
import { supabase } from "@/integrations/supabase/client";
import soffaBanner from "@/assets/soffa-banner.png";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import logo1 from "@/assets/logo-1.svg";
import bathroomAd from "@/assets/bathroom-ad.jpg";
import kitchenAd from "@/assets/kitchen-ad.jpg";

const Index = () => {
  const [showFinalPrices, setShowFinalPrices] = useState(false);
  const [soldWithinMonths, setSoldWithinMonths] = useState<number | null>(null);
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
  const [biddingFilter, setBiddingFilter] = useState(false);
  const [feeRange, setFeeRange] = useState<[number, number]>([0, 15000]);
  const [daysOnSiteFilter, setDaysOnSiteFilter] = useState<number | null>(null);
  const [floorRange, setFloorRange] = useState<[number, number]>([0, 10]);
  const [constructionYearRange, setConstructionYearRange] = useState<[number, number]>([1900, 2026]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [lastPropertyChange, setLastPropertyChange] = useState(Date.now());

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const fetchProperties = async () => {
    try {
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      if (propertiesData) {
        const userIds = [...new Set(propertiesData.map(p => p.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, phone, email, agency, agency_id')
          .in('id', userIds);
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        // Fetch agency logos for properties without vendor_logo_url
        const agencyIds = [...new Set(profilesData?.filter(p => p.agency_id).map(p => p.agency_id) || [])] as string[];
        let agencyLogosMap: Record<string, string> = {};

        if (agencyIds.length > 0) {
          const { data: agenciesData } = await supabase
            .from('agencies')
            .select('id, logo_url')
            .in('id', agencyIds);

          if (agenciesData) {
            agenciesData.forEach(agency => {
              if (agency.logo_url) {
                agencyLogosMap[agency.id] = agency.logo_url;
              }
            });
          }
        }

        // Fetch bidding status for all properties
        const propertyIds = propertiesData.map(p => p.id);
        const { data: bidsData } = await supabase
          .from('property_bids')
          .select('property_id')
          .in('property_id', propertyIds);

        const bidsMap: Record<string, boolean> = {};
        if (bidsData) {
          propertyIds.forEach(id => {
            bidsMap[id] = bidsData.some(bid => bid.property_id === id);
          });
        }

        const formattedProperties: Property[] = propertiesData.map((prop: any) => {
          const profile = profilesMap.get(prop.user_id);
          const agencyLogo = profile?.agency_id ? agencyLogosMap[profile.agency_id] : undefined;
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
            vendorLogo: prop.vendor_logo_url || agencyLogo || logo1,
            isSold: prop.is_sold || false,
            soldDate: prop.sold_date ? new Date(prop.sold_date) : undefined,
            hasVR: prop.has_vr || false,
            agent_name: profile?.full_name,
            agent_avatar: profile?.avatar_url,
            agent_phone: profile?.phone,
            agent_email: profile?.email,
            agent_agency: profile?.agency,
            agent_id: profile?.id,
            additional_images: prop.additional_images || [],
            hasActiveBidding: bidsMap[prop.id] || false,
          };
        });
        setAllProperties(formattedProperties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [lastPropertyChange]);

  // Call this after updating a property (e.g. after changing viewing date)
  const triggerPropertyRefetch = () => setLastPropertyChange(Date.now());

  // Get the 5 most recent properties
  const recentProperties = allProperties
    .filter(p => !p.isSold)
    .slice(0, 5);

  return (
    <div className="min-h-screen" style={{ background: 'var(--main-gradient)' }}>
      <Header />
      <div className="flex flex-col lg:flex-row items-start lg:justify-between gap-4 md:gap-6 lg:gap-6 xl:gap-10 px-3 sm:px-4 lg:px-8 max-w-[2250px] mx-auto lg:items-start">
        <AdBanner
          imageSrc={soffaBanner}
          alt={"Soffa annons"}
          title={"Soffor — Fynda din nya soffa"}
          description={"Letar du efter en ny soffa? Upptäck kvalitetssoffor till bra priser."}
          bullets={["✓ Fri hemleverans", "✓ 0% delbetalning", "✓ Många tyger och färger"]}
          buttonText={"Se erbjudanden"}
          note={<><strong className="font-semibold">Spara 5 000 kr</strong>{" - Erbjudande: fri frakt denna månad"}</>}
          className="lg:order-1 order-3 lg:transform lg:scale-95 xl:scale-90 px-2 sm:px-4 lg:px-0"
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
            onBiddingFilterChange={setBiddingFilter}
            onFeeRangeChange={setFeeRange}
            soldWithinMonths={soldWithinMonths}
            onSoldWithinMonthsChange={setSoldWithinMonths}
            daysOnSiteFilter={daysOnSiteFilter}
            onDaysOnSiteFilterChange={setDaysOnSiteFilter}
            onFloorRangeChange={setFloorRange}
            onConstructionYearRangeChange={setConstructionYearRange}
          />
          <div ref={resultsRef}>
            {/* Recent uploads section - only show when NOT viewing final prices */}
            {!showFinalPrices && recentProperties.length > 0 && (
              <section className="mb-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground text-center mt-6 mb-6">
                  Senast uppladdade objekt
                </h2>
                <RecentPropertiesCarousel
                  properties={recentProperties.map(p => ({
                    id: p.id,
                    title: p.title,
                    price: p.price,
                    location: p.location,
                    address: p.address,
                    bedrooms: p.bedrooms,
                    bathrooms: p.bathrooms,
                    area: p.area,
                    fee: p.fee,
                    image: p.image,
                    hoverImage: p.hoverImage,
                    type: p.type,
                    viewingDate: p.viewingDate,
                    vendorLogo: p.vendorLogo,
                    hasVR: p.hasVR,
                    agent_name: p.agent_name,
                    agent_avatar: p.agent_avatar,
                    agent_agency: p.agent_agency,
                    additional_images: (p as any).additional_images,
                    hasActiveBidding: (p as any).hasActiveBidding,
                  }))}
                />
                <Separator className="mt-8 opacity-30" />
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
                biddingFilter={biddingFilter}
                feeRange={feeRange}
                soldWithinMonths={soldWithinMonths}
                daysOnSiteFilter={daysOnSiteFilter}
                floorRange={floorRange}
                constructionYearRange={constructionYearRange}
              />
            ) : (
              <AgentGrid searchQuery={searchAddress} />
            )}
          </div>
        </main>
        <AdBanner
          note={<><strong className="font-semibold">Specialerbjudande: 15% rabatt i april</strong></>}
          className="lg:order-3 order-2 lg:transform lg:scale-95 xl:scale-90 px-2 sm:px-4 lg:px-0"
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
