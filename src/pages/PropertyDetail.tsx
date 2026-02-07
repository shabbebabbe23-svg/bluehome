import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Bed, Bath, Square, Calendar, Share2, Gavel, Home, ChevronLeft, ChevronRight, Download, User, Phone, Mail, Building2, Facebook, Instagram, MessageCircle, Copy, Check, Move3D, Scale, Twitter as XLogo } from "lucide-react";
import bathroomAd from "@/assets/bathroom-ad.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect, useMemo } from "react";
import { downloadICS } from "@/lib/icsGenerator";
import { toast } from "sonner";
import { usePropertyViewTracking } from "@/hooks/usePropertyViewTracking";
import { usePropertyPresence } from "@/hooks/usePropertyPresence";
import { useFavorites } from "@/contexts/FavoritesContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { ViewingRegistrationForm } from "@/components/ViewingRegistrationForm";
import { trackViewContent, trackLead, trackSchedule, trackShare as fbTrackShare } from "@/lib/facebookPixel";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";
import property5 from "@/assets/property-5.jpg";
import property6 from "@/assets/property-6.jpg";
import property7 from "@/assets/property-7.jpg";
import property8 from "@/assets/property-8.jpg";
import property9 from "@/assets/property-9.jpg";
import property10 from "@/assets/property-10.jpg";
import floorplan from "@/assets/floorplan-1.jpg";
import storgatanFloorplan from "@/assets/storgatan-floorplan.jpg";
import storgatan1 from "@/assets/storgatan-1.jpg";
import storgatan2 from "@/assets/storgatan-2.jpg";
import storgatan3 from "@/assets/storgatan-3.jpg";
import storgatan4 from "@/assets/storgatan-4.jpg";
import storgatan5 from "@/assets/storgatan-5.jpg";
import DetailAdBanner from "@/components/DetailAdBanner";
import AdBanner from "@/components/AdBanner";
import PropertyCostBreakdown from "@/components/PropertyCostBreakdown";
import PropertyDetailMap from "@/components/PropertyDetailMap";
import { ExpandableDescription } from "@/components/ExpandableDescription";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite: checkIsFavorite } = useFavorites();
  const { toggleComparison, isInComparison, canAddMore } = useComparison();

  const [loading, setLoading] = useState(true);
  const [dbProperty, setDbProperty] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isFloorplanModalOpen, setIsFloorplanModalOpen] = useState(false);
  const [currentFloorplanIndex, setCurrentFloorplanIndex] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [agencyLogo, setAgencyLogo] = useState<string | null>(null);
  const [agencyWebsite, setAgencyWebsite] = useState<string | null>(null);
  const [isPWA, setIsPWA] = useState(false);
  const [isBidHistoryOpen, setIsBidHistoryOpen] = useState(false);
  const [bidHistory, setBidHistory] = useState<any[]>([]);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const profileName = user?.user_metadata?.full_name;

  const { viewerCount } = usePropertyPresence(id ? String(id) : "");
  usePropertyViewTracking(id ? String(id) : "");


  const hasActiveBidding = (dbProperty?.bidCount ?? 0) > 0;
  const [lastPropertyChange, setLastPropertyChange] = useState(Date.now());

  // SEO: Dynamisk sidtitel och meta description baserat på fastigheten
  useEffect(() => {
    if (dbProperty) {
      const address = dbProperty.address || 'Fastighet';
      const city = dbProperty.city || '';
      const rooms = dbProperty.rooms || '';
      const area = dbProperty.area || '';
      const price = dbProperty.price ? Number(dbProperty.price).toLocaleString('sv-SE') : '';
      const propertyType = dbProperty.type || 'Bostad';
      const propertyImage = dbProperty.images?.[0] || 'https://www.barahem.se/og-image.png';
      const propertyUrl = `https://www.barahem.se/fastighet/${id}`;
      
      // Uppdatera titel
      const fullTitle = `${address}${city ? `, ${city}` : ''} - Till salu | BaraHem`;
      document.title = fullTitle;
      
      // Uppdatera meta description
      const descriptionText = `${propertyType}${rooms ? ` med ${rooms} rum` : ''}${area ? `, ${area} kvm` : ''} på ${address}${city ? ` i ${city}` : ''}.${price ? ` Pris: ${price} kr.` : ''} Se bilder och boka visning på BaraHem.`;
      
      // Helper för att sätta meta-taggar
      const setMeta = (name: string, content: string, property = false) => {
        const attr = property ? 'property' : 'name';
        let tag = document.querySelector(`meta[${attr}="${name}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute(attr, name);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      // Standard meta
      setMeta('description', descriptionText);
      
      // Open Graph (för Facebook)
      setMeta('og:title', fullTitle, true);
      setMeta('og:description', descriptionText, true);
      setMeta('og:image', propertyImage, true);
      setMeta('og:image:width', '1200', true);
      setMeta('og:image:height', '630', true);
      setMeta('og:url', propertyUrl, true);
      setMeta('og:type', 'website', true);
      setMeta('og:site_name', 'BaraHem', true);
      setMeta('og:locale', 'sv_SE', true);
      
      // Twitter Card
      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:title', fullTitle);
      setMeta('twitter:description', descriptionText);
      setMeta('twitter:image', propertyImage);

      // Lägg till JSON-LD RealEstateListing schema
      let schemaScript = document.getElementById('property-schema');
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'property-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": address,
        "description": dbProperty.description || descriptionText,
        "url": `https://www.barahem.se/fastighet/${id}`,
        "datePosted": dbProperty.created_at,
        "offers": {
          "@type": "Offer",
          "price": dbProperty.price || 0,
          "priceCurrency": "SEK",
          "availability": dbProperty.is_sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock"
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": address,
          "addressLocality": city,
          "addressCountry": "SE"
        },
        ...(dbProperty.area && {
          "floorSize": {
            "@type": "QuantitativeValue",
            "value": dbProperty.area,
            "unitCode": "MTK"
          }
        }),
        ...(dbProperty.rooms && {
          "numberOfRooms": dbProperty.rooms
        }),
        ...(dbProperty.bathrooms && {
          "numberOfBathroomsTotal": dbProperty.bathrooms
        }),
        ...(dbProperty.images?.[0] && {
          "image": dbProperty.images[0]
        })
      };
      schemaScript.textContent = JSON.stringify(schemaData);
    } else {
      document.title = 'Fastighet - BaraHem';
    }
    
    return () => {
      document.title = 'BaraHem - Hitta ditt drömhem i Sverige';
      const defaultDescription = 'Sveriges modernaste fastighetsplattform. Utforska tusentals fastigheter till salu över hela Sverige – från storstäder till mindre orter. Hitta ditt nästa hem idag.';
      const defaultImage = 'https://www.barahem.se/og-image.png';
      const defaultUrl = 'https://www.barahem.se';
      
      // Helper för att återställa meta-taggar
      const setMeta = (name: string, content: string, property = false) => {
        const attr = property ? 'property' : 'name';
        const tag = document.querySelector(`meta[${attr}="${name}"]`);
        if (tag) tag.setAttribute('content', content);
      };

      // Återställ standard meta
      setMeta('description', defaultDescription);
      
      // Återställ Open Graph
      setMeta('og:title', 'BaraHem - Hitta ditt drömhem i Sverige', true);
      setMeta('og:description', defaultDescription, true);
      setMeta('og:image', defaultImage, true);
      setMeta('og:url', defaultUrl, true);
      
      // Återställ Twitter
      setMeta('twitter:title', 'BaraHem - Hitta ditt drömhem i Sverige');
      setMeta('twitter:description', defaultDescription);
      setMeta('twitter:image', defaultImage);
      
      // Ta bort property schema
      const schema = document.getElementById('property-schema');
      if (schema) schema.remove();
    };
  }, [dbProperty, id]);

  useEffect(() => {
    setIsPWA(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (!id) return;
        setLoading(true);
        setLoadError(null);

        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          if (error.code === 'PGRST116') {
            // No rows returned - property doesn't exist
            setLoadError('Fastigheten kunde inte hittas.');
          } else {
            setLoadError('Ett fel uppstod vid hämtning av fastigheten.');
          }
          setLoading(false);
          return;
        }

        if (data) {
          // Check if property is deleted
          if (data.is_deleted) {
            console.log('Property is deleted');
            setLoadError('Denna fastighet är borttagen.');
            setDbProperty(null);
            setLoading(false);
            return;
          }
          
          setDbProperty(data);

          if (data.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user_id)
              .single();
            if (profile) {
              setAgentProfile(profile);

              // Hämta byråns logga och hemsida
              if (profile.agency_id) {
                const { data: agency } = await supabase
                  .from('agencies')
                  .select('logo_url, website')
                  .eq('id', profile.agency_id)
                  .single();
                if (agency?.logo_url) {
                  setAgencyLogo(agency.logo_url);
                }
                if (agency?.website) {
                  setAgencyWebsite(agency.website);
                }
              }
            }
          }

          const { count, data: bidsData } = await supabase
            .from('property_bids')
            .select('*', { count: 'exact' })
            .eq('property_id', id)
            .order('bid_amount', { ascending: false });

          if (count !== null) {
            setDbProperty(prev => prev ? { ...prev, bidCount: count } : prev);
          }
          if (bidsData) {
            setBidHistory(bidsData);
          }

          // Fetch total view count
          const { count: viewCount } = await supabase
            .from('property_views')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', id);

          if (viewCount !== null) {
            setDbProperty(prev => prev ? { ...prev, viewCount: viewCount } : prev);
          }
        }
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, lastPropertyChange]);

  // Facebook Pixel tracking när fastigheten visas
  useEffect(() => {
    if (dbProperty && !loading) {
      trackViewContent({
        id: String(dbProperty.id),
        title: dbProperty.address || dbProperty.title || 'Fastighet',
        price: dbProperty.price ? Number(dbProperty.price) : undefined,
        type: dbProperty.type,
        city: dbProperty.city,
      });
    }
  }, [dbProperty, loading]);

  // Call this after updating a property (t.ex. efter ändrat visningsdatum)
  const triggerPropertyRefetch = () => setLastPropertyChange(Date.now());

  // Map database image paths to imported images
  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    const imageMap: Record<string, string> = {
      '/src/assets/storgatan-1.jpg': storgatan1,
      '/src/assets/storgatan-2.jpg': storgatan2,
      '/src/assets/storgatan-3.jpg': storgatan3,
      '/src/assets/storgatan-4.jpg': storgatan4,
      '/src/assets/storgatan-5.jpg': storgatan5,
      '/src/assets/storgatan-floorplan.jpg': storgatanFloorplan
    };
    return imageMap[url] || url;
  };
  const properties = [{
    id: 1,
    title: "Modern lägenhet i city",
    price: "3 200 000 kr",
    location: "Södermalm, Stockholm",
    address: "Götgatan 45",
    vendor: "Fastighetsbyrån",
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    images: [property1, property2, property3, property4],
    type: "Lägenhet",
    isNew: true,
    buildYear: 2018,
    floor: 3,
    rooms: 2,
    description: "Välkommen till denna ljusa och moderna lägenhet i hjärtat av Södermalm. Lägenheten erbjuder ett öppet planlösning med stora fönster som ger gott om naturligt ljus. Köket är utrustat med moderna apparater och här finns gott om förvaring.",
    features: ["Balkong", "Hiss", "Tvättstuga", "Förråd", "Fiber"]
  }, {
    id: 2,
    title: "Charmig svensk villa",
    price: "4 800 000 kr",
    location: "Djursholm, Stockholm",
    address: "Vendevägen 12",
    vendor: "Mäklarhuset",
    bedrooms: 4,
    bathrooms: 2,
    area: 150,
    images: [property2, property3, property4, property5],
    type: "Villa",
    isNew: false,
    buildYear: 1985,
    floor: 0,
    rooms: 4,
    description: "En pärla i Djursholm! Denna charmiga villa erbjuder allt en familj kan önska sig. Huset har genomgått en omfattande renovering men behållit sin ursprungliga charm. Stor trädgård med söderläge och plats för lek och odling.",
    features: ["Trädgård", "Garage", "Öppen spis", "Uteplats", "Nyrenoverat kök"]
  }, {
    id: 3,
    title: "Modernt radhus",
    price: "2 900 000 kr",
    location: "Vasastan, Stockholm",
    address: "Odengatan 78",
    vendor: "ERA Mäkleri",
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    images: [property3, property4, property5, property6],
    type: "Radhus",
    isNew: true,
    buildYear: 2020,
    floor: 0,
    rooms: 3,
    description: "Nybyggt radhus i populära Vasastan. Moderna materialval och smart planlösning över två plan. Egen ingång och liten uteplats. Perfekt för små familjer eller par som vill bo centralt med eget hus.",
    features: ["Uteplats", "Parkering", "Vind", "Genomtänkt planlösning", "Energisnålt"]
  }, {
    id: 4,
    title: "Lyxig takvåning",
    price: "8 500 000 kr",
    location: "Östermalm, Stockholm",
    address: "Strandvägen 23",
    vendor: "Länsförsäkringar Fastighetsförmedling",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    images: [property4, property5, property6, property7],
    type: "Lägenhet",
    isNew: false,
    buildYear: 1910,
    floor: 5,
    rooms: 3,
    description: "Exklusiv takvåning med magisk utsikt över Stockholm. Lägenheten har en unik karaktär med original detaljer i kombination med moderna bekvämligheter. Stor takterrass med 360 graders utsikt.",
    features: ["Takterrass", "Hiss", "Kakelugn", "Havsutsikt", "Renoverat badrum"]
  }, {
    id: 5,
    title: "Familjehus",
    price: "5 200 000 kr",
    location: "Lidingö, Stockholm",
    address: "Kyrkviken 8",
    vendor: "Mäklarbyrån Lidingö",
    bedrooms: 5,
    bathrooms: 3,
    area: 180,
    images: [property5, property6, property7, property8],
    type: "Villa",
    isNew: false,
    buildYear: 1992,
    floor: 0,
    rooms: 5,
    description: "Rymlig villa med närhet till havet och naturen. Perfekt för stora familjer med generösa ytor både inne och ute. Stort trädeck och vacker trädgård med mogna träd. Garage med plats för två bilar.",
    features: ["Dubbelgarage", "Pool", "Bastu", "Sjönära", "Stor tomt"]
  }, {
    id: 6,
    title: "Studioappartement",
    price: "1 800 000 kr",
    location: "Norrmalm, Stockholm",
    address: "Drottninggatan 56",
    vendor: "Svensk Fastighetsförmedling",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    images: [property6, property7, property8, property9],
    type: "Lägenhet",
    isNew: true,
    buildYear: 2021,
    floor: 2,
    rooms: 1,
    description: "Smart inredd studioapartment mitt i city. Perfekt för singel eller student. Öppen planlösning med kök och sovdel i samma rum. Fräscht badrum med dusch. Nära till kommunikationer och service.",
    features: ["Hiss", "Tvättstuga", "Fiber", "Nybyggt", "Centralt"]
  }, {
    id: 7,
    title: "Elegant stadslägeneht",
    price: "4 100 000 kr",
    location: "Gamla Stan, Stockholm",
    address: "Prästgatan 21",
    vendor: "Stockholm City Mäkleri",
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    images: [property7, property8, property9, property10],
    type: "Lägenhet",
    isNew: false,
    buildYear: 1650,
    floor: 2,
    rooms: 2,
    description: "Historisk charm i Gamla Stan. Denna lägenhet erbjuder en unik kombination av medeltida arkitektur och moderna bekvämligheter. Bjälktak, öppen spis och original detaljer. En riktig pärla för den som söker något utöver det vanliga.",
    features: ["Kakelugn", "Bjälktak", "Centralt", "Historiskt", "Unik"]
  }, {
    id: 8,
    title: "Klassiskt radhus",
    price: "6 300 000 kr",
    location: "Bromma, Stockholm",
    address: "Åkeshovsvägen 34",
    vendor: "Bromma Mäklaren",
    bedrooms: 4,
    bathrooms: 3,
    area: 140,
    images: [property8, property9, property10, property1],
    type: "Radhus",
    isNew: true,
    buildYear: 2022,
    floor: 0,
    rooms: 4,
    description: "Nybyggt radhus i attraktiva Bromma. Modern arkitektur med högt i tak och stora fönsterpartier. Öppen planlösning med kök i direkt anslutning till vardagsrum. Tre sovrum på övervåningen samt master bedroom med egen badrum.",
    features: ["Uteplats", "Parkering", "Nybyggt", "Walk-in closet", "Tre badrum"]
  }, {
    id: 9,
    title: "Exklusiv skogsvilla",
    price: "9 200 000 kr",
    location: "Nacka, Stockholm",
    address: "Skogsbacken 7",
    vendor: "Skärgårdsmäklaren",
    bedrooms: 5,
    bathrooms: 4,
    area: 220,
    images: [property9, property10, property1, property2],
    type: "Villa",
    isNew: false,
    buildYear: 2010,
    floor: 0,
    rooms: 5,
    description: "Arkitektritad villa i naturskön miljö. Detta unika hus kombinerar modern design med naturens lugn. Stora glaspartier ger fantastisk utsikt över skogen. Pool, bastu och gym i källarplan. Perfekt för den kvalitetsmedvetne köparen.",
    features: ["Pool", "Bastu", "Gym", "Dubbelgarage", "Skogsnära", "Arkitektritad"]
  }, {
    id: 10,
    title: "Sjönära lägenhet",
    price: "7 800 000 kr",
    location: "Strandvägen, Stockholm",
    address: "Strandvägen 89",
    vendor: "Strandvägens Mäklare",
    bedrooms: 3,
    bathrooms: 2,
    area: 130,
    images: [property10, property1, property2, property3],
    type: "Lägenhet",
    isNew: true,
    buildYear: 2019,
    floor: 4,
    rooms: 3,
    description: "Exklusiv lägenhet vid Strandvägen med direktutsikt över vattnet. Högklassig standard med genomtänkta detaljer. Tre sovrum, varav ett är master bedroom med eget badrum. Stor balkong med kvällssol och magisk utsikt.",
    features: ["Balkong", "Sjöutsikt", "Hiss", "Parkering", "Nybyggt", "Lyxigt"]
  }, {
    id: 101,
    title: "Såld villa i Danderyd",
    price: "8 750 000 kr",
    location: "Danderyd, Stockholm",
    address: "Enebyvägen 22",
    vendor: "Täbys Estate",
    bedrooms: 5,
    bathrooms: 3,
    area: 185,
    images: [property1, property2, property3, property4],
    type: "Villa",
    isNew: false,
    isSold: true,
    soldDate: new Date("2024-10-02"),
    sold_price: 9250000,
    buildYear: 2005,
    floor: 0,
    rooms: 5,
    description: "Vacker villa i attraktivt läge som såldes snabbt till ett konkurrenskraftigt pris. Renoverad och i utmärkt skick med modern köksstandard och nyrenoverade badrum. Stor trädgård med söderläge.",
    features: ["Trädgård", "Garage", "Nyrenoverat", "Söderläge", "Öppen spis"]
  }];

  // Use database property if available, otherwise fallback to hardcoded
  let property = dbProperty;
  if (!property) {
    property = properties.find(p => p.id === Number(id));
  }
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Laddar fastighet...</p>
      </div>
    </div>;
  }
  if (loadError || !property) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{loadError || 'Fastighet hittades inte'}</h1>
        <Link to="/">
          <Button className="bg-hero-gradient hover:scale-105 transition-transform text-white">Tillbaka till startsidan</Button>
        </Link>
      </div>
    </div>;
  }

  // Handle images for both database and hardcoded properties
  const images = dbProperty ? [getImageUrl(dbProperty.image_url), getImageUrl(dbProperty.hover_image_url), ...(dbProperty.additional_images || []).map(getImageUrl)].filter(Boolean) : property.images || [property1];

  // Track image views
  const trackImageView = async (imageIndex: number) => {
    if (!id) return;

    try {
      const sessionId = sessionStorage.getItem('session_id') ||
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', sessionId);
      }

      await supabase.from('image_views').insert({
        property_id: id,
        session_id: sessionId,
        image_index: imageIndex,
        image_url: images[imageIndex],
      });
    } catch (error) {
      console.error('Error tracking image view:', error);
    }
  };

  const handlePreviousImage = () => {
    const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
    trackImageView(newIndex);
  };
  const handleNextImage = () => {
    const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
    trackImageView(newIndex);
  };
  const handleDownloadViewing = (date: string, time: string) => {
    // Parse datum och tid för att skapa en riktig Date
    const [day, month] = date.split(' ').slice(1, 3);
    const [startTime] = time.split(' - ');

    // Skapa datum (använder 2025 som år för nu)
    const monthMap: {
      [key: string]: number;
    } = {
      'jan': 0,
      'feb': 1,
      'mar': 2,
      'apr': 3,
      'maj': 4,
      'jun': 5,
      'jul': 6,
      'aug': 7,
      'sep': 8,
      'okt': 9,
      'nov': 10,
      'dec': 11
    };
    const monthNum = monthMap[month.toLowerCase()];
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date(2025, monthNum, parseInt(day), hours, minutes);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 timme

    downloadICS(`Visning: ${property.title}`, `Visning av ${property.type.toLowerCase()} på ${property.address}, ${property.location}`, `${property.address}, ${property.location}`, startDate, endDate, `visning-${property.title.toLowerCase().replace(/\s+/g, '-')}.ics`);
    toast.success('Kalenderaktivitet sparad!');
  };
  // Track share
  const trackShare = async (method: string) => {
    if (!id) return;
    try {
      const sessionId = sessionStorage.getItem('session_id') ||
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', sessionId);
      }
      await supabase.from('property_shares').insert({
        property_id: id,
        session_id: sessionId,
        share_method: method,
      });
      // Track share to Facebook Pixel
      fbTrackShare(method, String(id));
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const handleCopyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    toast.success('URL kopierad!');
    trackShare('copy_link');
    setTimeout(() => setCopiedUrl(false), 2000);
  };
  const handleShareFacebook = () => {
    const url = window.location.href;
    trackShare('facebook');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };
  const handleShareX = () => {
    const url = window.location.href;
    const text = `${property.title} - ${property.price}`;
    trackShare('x');
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };
  const handleShareInstagram = () => {
    // Instagram doesn't have direct sharing URLs, so we copy to clipboard with a message
    const url = window.location.href;
    const text = `${property.title} - ${property.price}\n${url}`;
    navigator.clipboard.writeText(text);
    trackShare('instagram');
    toast.success('Text kopierad! Klistra in i Instagram.');
  };
  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const text = `${property.title} - ${property.price}`;
    trackShare('whatsapp');
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };
  const handleShareEmail = () => {
    const url = window.location.href;
    const subject = `Se denna bostad: ${property.title}`;
    const body = `Hej!\n\nJag hittade denna intressanta bostad:\n\n${property.title}\n${property.price}\n${property.location}\n\n${url}`;
    trackShare('email');
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return <div className="min-h-screen bg-background">
    {/* Header */}
    <header className="backdrop-blur-md border-b border-white/20 sticky top-0 z-50" style={{
      background: 'var(--main-gradient)'
    }}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex items-center justify-between">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => navigate('/')}
          className="sm:w-9 sm:h-9 cursor-pointer hover:-translate-x-2 hover:scale-x-110 transition-all duration-300 ease-out origin-center"
        >
          <defs>
            <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="url(#arrowGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* BaraHem Logo - Center */}
        <Link to="/" className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity absolute left-1/2 -translate-x-1/2">
          <Home className="w-5 h-5 sm:w-8 sm:h-8 text-primary" />
          <span className="text-lg sm:text-3xl md:text-4xl font-bold bg-hero-gradient bg-clip-text text-transparent">
            BaraHem
          </span>
        </Link>

        <div className="flex gap-1 items-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => id && toggleFavorite(String(id))}
            className="sm:w-9 sm:h-9 cursor-pointer hover:scale-110 transition-all duration-300 ease-out"
          >
            <defs>
              <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="url(#heartGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={id && checkIsFavorite(String(id)) ? "url(#heartGradient)" : "none"}
            />
          </svg>

          {/* Profile Avatar with Glow - Shows User or Agent */}
          {(user || agentProfile) && (
            <Link
              to={user ? "/maklare?tab=profile" : `/agent/${dbProperty?.user_id}`}
              className="relative ml-1 sm:ml-2"
              title={user ? "Min profil" : `Mäklare: ${agentProfile?.full_name || 'Okänd'}`}
            >
              <div className="absolute -inset-0.5 sm:-inset-1 rounded-full bg-gradient-to-r from-[hsl(30,40%,50%)] to-[hsl(25,50%,40%)] opacity-75 blur-md animate-[pulse_1.5s_ease-in-out_infinite]"></div>
              <Avatar className="relative w-7 h-7 sm:w-9 sm:h-9" style={{ boxShadow: '0 0 0 2px hsl(200, 98%, 35%), 0 0 0 4px hsl(142, 76%, 30%)' }}>
                <AvatarImage
                  src={(user ? avatarUrl : agentProfile?.avatar_url) || undefined}
                  alt={(user ? profileName : agentProfile?.full_name) || "Profil"}
                />
                <AvatarFallback className="bg-gradient-to-br from-[hsl(30,40%,50%)] to-[hsl(25,50%,40%)] text-white text-xs sm:text-sm font-bold">
                  {(user ? profileName : agentProfile?.full_name)
                    ? (user ? profileName : agentProfile?.full_name).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                    : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </div>
    </header>

    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 py-4 md:py-8 space-y-6 md:space-y-8">
      {/* Intermediate Contained Gallery */}
      <div className="max-w-[1200px] mx-auto w-full">
        <Card className="overflow-hidden">
          <div className="relative h-[250px] sm:h-[400px] md:h-[500px] lg:h-[550px] group" style={{ width: '100%' }}>
            <img src={images[currentImageIndex]} alt={property.title} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity mx-auto" onClick={() => setIsImageModalOpen(true)} />

            {/* Navigation Buttons */}
            <Button variant="secondary" size="icon" className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 text-foreground hover:bg-hero-gradient hover:text-white hover:scale-105 h-8 w-8 sm:h-10 sm:w-10 border border-border" onClick={handlePreviousImage}>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button variant="secondary" size="icon" className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 text-foreground hover:bg-hero-gradient hover:text-white hover:scale-105 h-8 w-8 sm:h-10 sm:w-10 border border-border" onClick={handleNextImage}>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            {/* Image Counter */}
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>

            {/* Compare Button - inside image */}
            {!(property.is_sold || property.isSold) && (
              <Button
                variant="secondary"
                size="icon"
                className={`absolute top-2 sm:top-4 left-2 sm:left-4 h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg transition-all duration-300 ${id && isInComparison(String(id))
                  ? 'bg-primary hover:bg-primary/90'
                  : 'bg-white/90 hover:bg-white'
                  }`}
                onClick={() => {
                  if (!id) return;
                  const comparing = isInComparison(String(id));
                  if (!comparing && !canAddMore) {
                    toast.error('Du kan endast jämföra 2 fastigheter');
                    return;
                  }
                  toggleComparison({
                    id: String(id),
                    title: property.title,
                    price: typeof property.price === 'number' ? `${property.price.toLocaleString('sv-SE')} kr` : property.price,
                    location: property.location,
                    address: property.address,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    area: property.area,
                    fee: property.fee,
                    image: images[0],
                    additionalImages: property.additional_images,
                    type: property.type,
                    soldPrice: property.sold_price ? `${property.sold_price.toLocaleString('sv-SE')} kr` : undefined,
                    newPrice: property.new_price ? `${property.new_price.toLocaleString('sv-SE')} kr` : undefined,
                    isSold: property.is_sold || property.isSold,
                    hasElevator: property.has_elevator,
                    hasBalcony: property.has_balcony,
                    constructionYear: property.construction_year || property.buildYear,
                    operatingCost: property.operating_cost,
                    brfDebtPerSqm: property.brf_debt_per_sqm,
                  });
                }}
                aria-label={id && isInComparison(String(id)) ? 'Ta bort från jämförelse' : 'Lägg till i jämförelse'}
              >
                {id && isInComparison(String(id)) ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                )}
              </Button>
            )}
          </div>

          {/* Thumbnail Gallery */}
          <div className="p-1.5 sm:p-4 bg-muted/30 mx-0">
            <div className="flex gap-1 sm:gap-2 overflow-x-auto py-[2px]">
              {images.map((image, index) => <button key={index} onClick={() => {
                setCurrentImageIndex(index);
                trackImageView(index);
              }} className={`flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index ? "border-primary scale-105" : "border-transparent hover:border-primary/50"}`}>
                <img src={image} alt={`${property.title} - bild ${index + 1}`} className="w-full h-full object-cover" />
              </button>)}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.6fr_4fr_1.4fr] gap-2 md:gap-8">
        {/* Left Ad */}
        <div className="flex justify-center items-start px-2 sm:px-4 lg:px-0 pt-0">
          <AdBanner className="order-1" />
        </div>

        {/* Main Content */}
        <div className="space-y-2 md:space-y-6">

          {/* Property Title and Share Section */}
          <div className="flex flex-col gap-2 md:gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-center">
              {property.title}
            </h1>
            
            {/* Real-time viewer count */}
            {dbProperty?.show_viewer_count && viewerCount > 0 && (
              <div className="p-2 bg-gradient-to-r from-primary/10 to-green-500/10 rounded-lg border-2 border-primary/20 animate-pulse">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-bold text-foreground">
                    Antal live: {viewerCount}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              {/* Dela bostad-knappen flyttad till agentsektionen */}
              {(dbProperty?.has_vr || property.has_vr) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/virtuell-visning/${id}`)}
                  className="bg-gradient-to-r from-primary/5 to-green-500/5 border-primary/20 hover:bg-hero-gradient hover:text-white hover:border-transparent hover:scale-105 transition-all duration-300 gap-2 shadow-sm"
                >
                  <Move3D className="w-4 h-4" />
                  <span>360° Visning</span>
                </Button>
              )}
            </div>
          </div>

          {/* Property Info */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-sm px-4 py-1.5">{property.type}</Badge>
                  {property.isNew && <Badge className="bg-success text-white text-sm px-4 py-1.5">Ny</Badge>}
                  {dbProperty?.is_new_production && <Badge className="bg-blue-600 text-white text-sm px-4 py-1.5 font-semibold">Nyproduktion</Badge>}
                  {property.is_deleted && <Badge className="bg-red-600 text-white text-sm px-4 py-1.5 font-semibold">Borttagen</Badge>}
                  {(property.is_sold || property.isSold) && <Badge className="bg-destructive text-white text-sm px-4 py-1.5">Såld</Badge>}
                  {hasActiveBidding && !(property.is_sold || property.isSold) && !property.is_deleted && (
                    <Button
                      variant="outline"
                      onClick={() => setIsBidHistoryOpen(true)}
                      className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <Gavel className="w-5 h-5 text-orange-600" />
                      <span className="text-orange-700 font-bold">Pågående budgivning</span>
                      {dbProperty?.bidCount && (
                        <Badge variant="outline" className="ml-2 bg-white border-orange-200 text-orange-700">
                          {dbProperty.bidCount} {dbProperty.bidCount === 1 ? 'bud' : 'bud'}
                        </Badge>
                      )}
                    </Button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{property.address}</h1>
                  <div className="flex flex-col items-end">
                    {(property.is_sold || property.isSold) && property.sold_price ? <>
                      <p className="text-lg sm:text-xl text-muted-foreground line-through whitespace-nowrap">
                        {dbProperty ? `${property.price.toLocaleString('sv-SE')} kr` : property.price}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-hero-gradient whitespace-nowrap">
                        {`${property.sold_price.toLocaleString('sv-SE')} kr`}
                      </p>
                    </> : property.new_price ? <>
                      <p className="text-lg sm:text-xl text-muted-foreground line-through whitespace-nowrap">
                        {dbProperty ? `${property.price.toLocaleString('sv-SE')} kr` : property.price}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-[#FF6B2C] whitespace-nowrap">
                        {dbProperty ? `${property.new_price.toLocaleString('sv-SE')} kr` : property.price}
                      </p>
                    </> : <p className="text-2xl sm:text-3xl font-bold text-primary whitespace-nowrap">
                      {dbProperty ? `${property.price.toLocaleString('sv-SE')} kr` : property.price}
                    </p>}
                  </div>
                </div>
                <div className="flex items-center justify-between text-muted-foreground mt-2">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="text-sm sm:text-2xl">{property.location}</span>
                  </div>
                  {dbProperty?.listed_date && (() => {
                    const daysOnMarket = Math.floor((new Date().getTime() - new Date(dbProperty.listed_date).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {daysOnMarket === 0 ? "Ny idag" : `${daysOnMarket} ${daysOnMarket === 1 ? "dag" : "dagar"} på BaraHem`}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Quick Facts */}
              <div className={`grid gap-3 sm:gap-4 mb-4 sm:mb-6 ${dbProperty?.floor ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-sm sm:text-base">Sovrum</p>
                    <p className="font-semibold text-sm sm:text-base">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Bath className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-sm sm:text-base">Badrum</p>
                    <p className="font-semibold text-sm sm:text-base">{property.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Square className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-sm sm:text-base">Boarea</p>
                    <p className="font-semibold text-sm sm:text-base">{property.area} m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-sm sm:text-base">Byggår</p>
                    <p className="font-semibold text-sm sm:text-base">{property.construction_year || property.buildYear || 'Ej angivet'}</p>
                  </div>
                </div>
                {dbProperty?.floor && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-muted-foreground text-sm sm:text-base">Våning</p>
                      <p className="font-semibold text-sm sm:text-base">
                        {dbProperty.floor}{dbProperty.total_floors ? `/${dbProperty.total_floors}` : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Description */}
              <ExpandableDescription description={property.description} />

              <Separator className="my-6" />

              {/* Detailed Information */}
              <div>
                <h2 className="text-xl font-bold mb-4">Fakta om bostaden</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {(property.is_sold || property.isSold) && property.sold_price && <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Slutpris</span>
                    <span className="font-semibold bg-clip-text text-transparent bg-hero-gradient">{`${property.sold_price.toLocaleString('sv-SE')} kr`}</span>
                  </div>}
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Bostadstyp</span>
                    <span className="font-semibold">{property.type || 'Villa'}</span>
                  </div>
                  {property.new_price && property.is_manual_price_change && <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Prisutveckling</span>
                    <span className="font-semibold text-[#FF6B2C]">
                      +{(property.new_price - property.price).toLocaleString('sv-SE')} kr
                      ({((property.new_price - property.price) / property.price * 100).toFixed(1)}%)
                    </span>
                  </div>}
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Upplåtelseform</span>
                    <span className="font-semibold">Äganderätt</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Utgångspris</span>
                    <span className="font-semibold">{dbProperty ? `${property.price.toLocaleString('sv-SE')} kr` : '8 600 000 kr'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Antal rum</span>
                    <span className="font-semibold">{property.bedrooms} rum</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Pris/m²</span>
                    <span className="font-semibold">{Math.round(property.price / property.area).toLocaleString('sv-SE')} kr/m²</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Boarea</span>
                    <span className="font-semibold">{property.area} m²</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Driftkostnad</span>
                    <span className="font-semibold">5 650 kr/år</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Biarea</span>
                    <span className="font-semibold">25 m²</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Byggår</span>
                    <span className="font-semibold">{property.buildYear || '2021'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Tomtarea</span>
                    <span className="font-semibold">850 m²</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Energiklass</span>
                    <span className="font-semibold">B</span>
                  </div>
                  {dbProperty?.housing_association && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Bostadsförening</span>
                      <span className="font-semibold">{dbProperty.housing_association}</span>
                    </div>
                  )}
                  {dbProperty?.brf_debt_per_sqm && dbProperty.brf_debt_per_sqm > 0 && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">BRF-lån /m²</span>
                      <span className="font-semibold">{dbProperty.brf_debt_per_sqm.toLocaleString('sv-SE')} kr</span>
                    </div>
                  )}
                  {dbProperty?.viewCount !== undefined && dbProperty.viewCount > 0 && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-blue-600">Antal besökare</span>
                      <span className="font-semibold text-blue-600">{dbProperty.viewCount.toLocaleString('sv-SE')}</span>
                    </div>
                  )}
                </div>
              </div>

              {(property?.floorplan_images?.length > 0 || property?.floorplan_url) && <>
                <Separator className="my-6" />
                <div>
                  <h2 className="text-xl font-bold mb-3">Planritning</h2>
                  <div className="relative">
                    {property?.floorplan_images?.length > 0 ? (
                      <div className="bg-muted/30 rounded-lg p-4 flex justify-center relative">
                        <img 
                          src={getImageUrl(property.floorplan_images[currentFloorplanIndex]) || property.floorplan_images[currentFloorplanIndex]} 
                          alt={`Planritning ${currentFloorplanIndex + 1}`} 
                          className="w-full max-w-[1200px] h-auto object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={() => setIsFloorplanModalOpen(true)}
                        />
                        
                        {/* Navigation buttons when multiple floorplans */}
                        {property.floorplan_images.length > 1 && (
                          <>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white hover:scale-110 transition-all shadow-md" 
                              onClick={() => setCurrentFloorplanIndex(prev => prev === 0 ? property.floorplan_images.length - 1 : prev - 1)}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white hover:scale-110 transition-all shadow-md" 
                              onClick={() => setCurrentFloorplanIndex(prev => prev === property.floorplan_images.length - 1 ? 0 : prev + 1)}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="bg-muted/30 rounded-lg p-4 flex justify-center">
                        <img 
                          src={getImageUrl(property.floorplan_url) || (property.address?.includes('Storgatan 15') ? storgatanFloorplan : floorplan)} 
                          alt="Planritning" 
                          className="w-full max-w-[1200px] h-auto object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={() => {
                            setCurrentFloorplanIndex(0);
                            setIsFloorplanModalOpen(true);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Floorplan counter and help text */}
                  <div className="flex items-center justify-center gap-4 mt-3">
                    {property?.floorplan_images?.length > 1 && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {currentFloorplanIndex + 1} / {property.floorplan_images.length} ritningar
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">Klicka på bilden för att förstora</p>
                </div>
              </>}

              {/* Documents Section */}
              {dbProperty?.documents && Array.isArray(dbProperty.documents) && dbProperty.documents.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h2 className="text-xl font-bold mb-3">Dokument</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ladda ner årsredovisning, stadgar och andra dokument
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(dbProperty.documents as { url: string; name: string }[]).map((doc, index) => (
                        <a
                          key={index}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={doc.name}
                          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Download className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">Klicka för att ladda ner</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {!dbProperty && <>
                <Separator className="my-6" />

                {/* Floor Plan */}
                <div>
                  <h2 className="text-xl font-bold mb-3">Planritning</h2>
                  <div className="bg-muted/30 rounded-lg p-4 flex justify-center">
                    <img src={floorplan} alt="Planritning" className="w-full max-w-[1200px] h-auto object-contain rounded-lg" />
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Features */}
                <div>
                  <h2 className="text-xl font-bold mb-3">Highlights</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {property.features.map((feature, index) => <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>)}
                  </div>
                </div>
              </>}
            </CardContent>
          </Card>

          {/* Map */}
          <PropertyDetailMap address={property.address} location={property.location} />

          {/* Cost Breakdown */}
          <PropertyCostBreakdown
            price={property.price}
            fee={property.fee || 0}
            area={property.area}
            type={property.type}
            operatingCost={property.operating_cost || 0}
            brfDebtPerSqm={property.brf_debt_per_sqm}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-2">
          {/* Contact Card */}
          <Card className="sticky top-6 md:top-24 z-30">
            <CardContent className="p-6">
              {/* Days on market badge - right side */}
              {dbProperty?.listed_date && (() => {
                const daysOnMarket = Math.floor((new Date().getTime() - new Date(dbProperty.listed_date).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div className="mb-0.5 p-1.5 bg-muted/30 rounded-lg">
                    <p className="text-xs text-center font-semibold text-muted-foreground">
                      {daysOnMarket === 0 ? "Ny idag på BaraHem" : `${daysOnMarket} ${daysOnMarket === 1 ? "dag" : "dagar"} på BaraHem`}
                    </p>
                  </div>
                );
              })()}

              {/* Sold date information for sold properties */}
              {(property.is_sold || property.isSold) && dbProperty?.sold_date && (
                <div className="mb-2 p-2 bg-red-100 rounded-lg border-2 border-red-300">
                  <p className="text-sm text-center font-bold text-red-700">
                    🏠 Såld {new Date(dbProperty.sold_date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}

              {(dbProperty?.viewing_date || dbProperty?.viewing_date_2) && !(property.is_sold || property.isSold) && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Visningar</h4>
                  <div className="space-y-2 mb-3">
                    {dbProperty?.viewing_date && (() => {
                      const viewingDate = new Date(dbProperty.viewing_date);
                      const dayName = viewingDate.toLocaleDateString('sv-SE', { weekday: 'short' });
                      const dayMonth = viewingDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
                      const time = viewingDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
                      const endTime = new Date(viewingDate.getTime() + 60 * 60 * 1000).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
                      const formattedDate = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayMonth}`;
                      const formattedTime = `${time} - ${endTime}`;

                      return (
                        <div key="viewing-1" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <button
                            onClick={() => handleDownloadViewing(formattedDate, formattedTime)}
                            className="flex-1 flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group cursor-pointer min-w-0"
                          >
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                            <div className="flex-1 text-left min-w-0">
                              <p className="text-xs sm:text-sm font-medium group-hover:text-primary transition-colors truncate">{formattedDate}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">{formattedTime}</p>
                            </div>
                            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </button>
                          <ViewingRegistrationForm
                            propertyId={id!}
                            viewingDate={dbProperty.viewing_date}
                            viewingDateFormatted={`${formattedDate} ${formattedTime}`}
                          />
                        </div>
                      );
                    })()}
                    {dbProperty?.viewing_date_2 && (() => {
                      const viewingDate = new Date(dbProperty.viewing_date_2);
                      const dayName = viewingDate.toLocaleDateString('sv-SE', { weekday: 'short' });
                      const dayMonth = viewingDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
                      const time = viewingDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
                      const endTime = new Date(viewingDate.getTime() + 60 * 60 * 1000).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
                      const formattedDate = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayMonth}`;
                      const formattedTime = `${time} - ${endTime}`;

                      return (
                        <div key="viewing-2" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <button
                            onClick={() => handleDownloadViewing(formattedDate, formattedTime)}
                            className="flex-1 flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group cursor-pointer min-w-0"
                          >
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                            <div className="flex-1 text-left min-w-0">
                              <p className="text-xs sm:text-sm font-medium group-hover:text-primary transition-colors truncate">{formattedDate}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">{formattedTime}</p>
                            </div>
                            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </button>
                          <ViewingRegistrationForm
                            propertyId={id!}
                            viewingDate={dbProperty.viewing_date_2}
                            viewingDateFormatted={`${formattedDate} ${formattedTime}`}
                          />
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              <Separator className="mb-2" />

              {agentProfile ?
                // Show real agent profile
                <>
                  <div className="flex flex-col items-center gap-3 mb-3">
                    <Link to={`/agent/${property.user_id}`} className="z-20 hover:scale-105 transition-transform">
                      <Avatar className="w-46 h-46 border-4 border-border cursor-pointer">
                        <AvatarImage src={agentProfile.avatar_url || undefined} className="object-contain p-2" />
                        <AvatarFallback className="bg-primary text-white text-3xl">
                          <User className="w-23 h-23" />
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="text-center">
                      <Link to={`/agent/${property.user_id}`} className="hover:text-primary transition-colors">
                        <p className="text-xl font-semibold">{agentProfile.full_name || 'Mäklare'}</p>
                      </Link>
                      {(agencyLogo || dbProperty?.vendor_logo_url) ? (
                        <Button
                          variant="ghost"
                          className="p-0 h-auto bg-transparent hover:bg-muted/30 rounded focus:ring-2 focus:ring-primary mt-2 mx-auto flex justify-center"
                          style={{ boxShadow: 'none' }}
                          onClick={() => {
                            if (agencyWebsite) {
                              window.open(agencyWebsite.startsWith('http') ? agencyWebsite : `https://${agencyWebsite}`, '_blank');
                            }
                          }}
                          disabled={!agencyWebsite}
                          title={agencyWebsite ? 'Besök byråns hemsida' : 'Ingen hemsida tillgänglig'}
                        >
                          <img
                            src={agencyLogo || dbProperty?.vendor_logo_url}
                            alt="Byrålogo"
                            className="h-[46px] w-auto max-w-[161px] object-contain"
                          />
                        </Button>
                      ) : agentProfile.agency && (
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
                          <Building2 className="w-4 h-4" />
                          {agentProfile.agency}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Agent Info */}
                  <div className="space-y-2 mb-3 bg-muted/30 rounded-lg p-4">
                    {agentProfile.phone && <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{agentProfile.phone}</span>
                    </div>}
                    {agentProfile.email && <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{agentProfile.email}</span>
                    </div>}
                    {agentProfile.office && <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{agentProfile.office}</span>
                    </div>}
                  </div>

                  <div className="space-y-2.5">
                    {agentProfile.phone && <Button
                      className="w-full bg-primary hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105 h-11 text-base"
                      onClick={() => window.open(`tel:${agentProfile.phone}`, '_self')}
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Ring mig
                    </Button>}
                    <Button
                      className="w-full border border-border bg-white text-foreground hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105 h-11 text-base"
                      onClick={() => {
                        const subject = `Intresserad av: ${property.address}`;
                        const body = `Hej ${agentProfile.full_name || 'Mäklare'},\n\nJag är intresserad av fastigheten på ${property.address}.\n\nMed vänliga hälsningar`;
                        window.location.href = `mailto:${agentProfile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      }}
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Skicka meddelande
                    </Button>
                    {!(property.is_sold || property.isSold) && (
                      <Button
                        className="w-full border border-border bg-white text-foreground hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105 h-11 text-base"
                        onClick={() => {
                          const subject = `Boka visning: ${property.address}`;
                          const body = `Hej ${agentProfile.full_name || 'Mäklare'},\n\nJag vill boka en visning för fastigheten på ${property.address}.\n\nMed vänliga hälsningar`;
                          window.location.href = `mailto:${agentProfile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        }}
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        Boka visning
                      </Button>
                    )}
                    <Button
                      className="w-full border border-primary bg-white text-foreground hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105 h-11 text-base mt-2"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsShareDialogOpen(true)}
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Dela bostad</span>
                    </Button>
                  </div>
                </> :
                // Show placeholder for hardcoded properties
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                      SB
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Kontakta mäklaren</p>
                      <p className="text-lg font-semibold">Shahab Barani</p>
                      <p className="text-sm text-muted-foreground">{property.vendor}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Button
                      className="w-full border border-border bg-white text-foreground hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105"
                      size="lg"
                      onClick={() => toast.info('Kontakta mäklaren via email för telefonnummer')}
                    >
                      Visa telefonnummer
                    </Button>
                    <Button
                      className="w-full border border-border bg-white text-foreground hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105"
                      size="lg"
                      onClick={() => {
                        const subject = `Intresserad av: ${property.address}`;
                        const body = `Hej,\n\nJag är intresserad av fastigheten på ${property.address}.\n\nMed vänliga hälsningar`;
                        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      }}
                    >
                      Skicka meddelande
                    </Button>
                    {!(property.is_sold || property.isSold) && (
                      <Button
                        className="w-full border border-border bg-white text-foreground hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105"
                        size="lg"
                        onClick={() => {
                          const subject = `Boka visning: ${property.address}`;
                          const body = `Hej,\n\nJag vill boka en visning för fastigheten på ${property.address}.\n\nMed vänliga hälsningar`;
                          window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        }}
                      >
                        Boka visning
                      </Button>
                    )}
                  </div>
                </>}


            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ad Banners Below */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailAdBanner />
        <aside className="w-full">
          <div className="p-2 sm:p-4">
            <div className="border border-border rounded-lg bg-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <img src={bathroomAd} alt="Badrumrenovering" className="w-full h-32 sm:h-40 md:h-48 object-cover" loading="lazy" />
              <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                  Drömbadrum?
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Vi hjälper dig från idé till verklighet. Kvalitet och stilren design.
                </p>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li>✓ Kostnadsfri hembesök</li>
                  <li>✓ Moderna lösningar</li>
                  <li>✓ 10 års garanti</li>
                  <li>✓ Fast pris</li>
                </ul>
                <Button className="w-full bg-primary hover:bg-hero-gradient hover:text-white transition-colors text-sm sm:text-base">
                  Begär offert
                </Button>
                <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                  Kampanj: 15% rabatt på arbetskostnad i april
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    {/* Share Dialog */}
    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Dela bostad</h3>
            <p className="text-sm text-muted-foreground">Välj hur du vill dela denna bostad</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-6 hover:bg-hero-gradient hover:text-white hover:border-transparent transition-all" onClick={handleShareFacebook}>
              <Facebook className="w-8 h-8" />
              <span className="text-sm">Facebook</span>
            </Button>

            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-6 hover:bg-hero-gradient hover:text-white hover:border-transparent transition-all" onClick={handleShareX}>
              <XLogo className="w-8 h-8" />
              <span className="text-sm">X</span>
            </Button>

            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-6 hover:bg-hero-gradient hover:text-white hover:border-transparent transition-all" onClick={handleShareInstagram}>
              <Instagram className="w-8 h-8" />
              <span className="text-sm">Instagram</span>
            </Button>

            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-6 hover:bg-hero-gradient hover:text-white hover:border-transparent transition-all" onClick={handleShareWhatsApp}>
              <MessageCircle className="w-8 h-8" />
              <span className="text-sm">WhatsApp</span>
            </Button>

            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-6 hover:bg-hero-gradient hover:text-white hover:border-transparent transition-all" onClick={handleShareEmail}>
              <Mail className="w-8 h-8" />
              <span className="text-sm">Email</span>
            </Button>

            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-6 hover:bg-hero-gradient hover:text-white hover:border-transparent transition-all" onClick={handleCopyUrl}>
              {copiedUrl ? <Check className="w-8 h-8" /> : <Copy className="w-8 h-8" />}
              <span className="text-sm">{copiedUrl ? 'Kopierad!' : 'Kopiera URL'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Image Modal */}
    <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center bg-black/90">
          <img src={images[currentImageIndex]} alt={property.title} className="max-w-full max-h-[90vh] object-contain" />

          {/* Navigation Buttons */}
          {images.length > 1 && <>
            <Button variant="secondary" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white hover:scale-110 transition-all" onClick={handlePreviousImage}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white hover:scale-110 transition-all" onClick={handleNextImage}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Bid History Dialog */}
    <Dialog open={isBidHistoryOpen} onOpenChange={setIsBidHistoryOpen}>
      <DialogContent className="sm:max-w-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Gavel className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Budhistorik</h3>
              <p className="text-sm text-muted-foreground">{bidHistory.length} registrerade bud</p>
            </div>
          </div>

          <Separator />

          {bidHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gavel className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Inga bud registrerade ännu</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {bidHistory.map((bid, index) => (
                <div
                  key={bid.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${index === 0 ? 'bg-orange-50 border-orange-200' : 'bg-muted/30 border-border'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className={`font-semibold text-lg ${index === 0 ? 'text-orange-700' : ''}`}>
                        {bid.bid_amount.toLocaleString('sv-SE')} kr
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(bid.created_at).toLocaleDateString('sv-SE', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge className="bg-orange-500 text-white">Högsta bud</Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          <Separator />

          <p className="text-xs text-muted-foreground text-center">
            Budhistoriken uppdateras i realtid. Kontakta mäklaren för att lägga ett bud.
          </p>
        </div>
      </DialogContent>
    </Dialog>

    {/* Floorplan Modal */}
    <Dialog open={isFloorplanModalOpen} onOpenChange={setIsFloorplanModalOpen}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center bg-black/90">
          {property?.floorplan_images?.length > 0 ? (
            <img 
              src={getImageUrl(property.floorplan_images[currentFloorplanIndex]) || property.floorplan_images[currentFloorplanIndex]} 
              alt={`Planritning ${currentFloorplanIndex + 1}`} 
              className="max-w-full max-h-[90vh] object-contain" 
            />
          ) : property?.floorplan_url && (
            <img 
              src={getImageUrl(property.floorplan_url) || (property.address?.includes('Storgatan 15') ? storgatanFloorplan : floorplan)} 
              alt="Planritning" 
              className="max-w-full max-h-[90vh] object-contain" 
            />
          )}

          {/* Navigation Buttons for multiple floorplans */}
          {property?.floorplan_images?.length > 1 && <>
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white hover:scale-110 transition-all" 
              onClick={() => setCurrentFloorplanIndex(prev => prev === 0 ? property.floorplan_images.length - 1 : prev - 1)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white hover:scale-110 transition-all" 
              onClick={() => setCurrentFloorplanIndex(prev => prev === property.floorplan_images.length - 1 ? 0 : prev + 1)}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>}

          {/* Floorplan Counter */}
          {property?.floorplan_images?.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              {currentFloorplanIndex + 1} / {property.floorplan_images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  </div>;
};
export default PropertyDetail;