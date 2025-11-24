import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Bed, Bath, Square, Calendar, Share2, Home, ChevronLeft, ChevronRight, Download, User, Phone, Mail, Building2, Facebook, Instagram, MessageCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { downloadICS } from "@/lib/icsGenerator";
import { toast } from "sonner";
import { usePropertyViewTracking } from "@/hooks/usePropertyViewTracking";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import bathroomAd from "@/assets/bathroom-ad.jpg";
import PropertyDetailMap from "@/components/PropertyDetailMap";
import PropertyCostBreakdown from "@/components/PropertyCostBreakdown";

// X (Twitter) Logo Component
const XLogo = ({
  className
}: {
  className?: string;
}) => <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>;
const PropertyDetail = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [dbProperty, setDbProperty] = useState<any>(null);
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [hasActiveBidding, setHasActiveBidding] = useState(false);

  // Track property view
  usePropertyViewTracking(id || "");
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        // Try to fetch from database first
        const {
          data,
          error
        } = await supabase.from('properties').select('*').eq('id', id).maybeSingle();
        if (data) {
          setDbProperty(data);

          // Fetch agent profile
          const {
            data: profile
          } = await supabase.from('profiles').select('*').eq('id', data.user_id).maybeSingle();
          if (profile) {
            setAgentProfile(profile);
          }

          // Check if property has active bidding and get count
          const {
            data: bids,
            count
          } = await supabase.from('property_bids').select('id', {
            count: 'exact'
          }).eq('property_id', id);
          setHasActiveBidding(bids && bids.length > 0);
          if (count && count > 0) {
            setDbProperty((prev: any) => ({
              ...prev,
              bidCount: count
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

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
  if (!property) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Fastighet hittades inte</h1>
          <Link to="/">
            <Button className="bg-hero-gradient hover:scale-105 transition-transform text-white">Tillbaka till startsidan</Button>
          </Link>
        </div>
      </div>;
  }

  // Handle images for both database and hardcoded properties
  const images = dbProperty ? [getImageUrl(dbProperty.image_url), getImageUrl(dbProperty.hover_image_url), ...(dbProperty.additional_images || []).map(getImageUrl)].filter(Boolean) : property.images || [property1];
  const handlePreviousImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };
  const handleNextImage = () => {
    setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
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
  const handleCopyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    toast.success('URL kopierad!');
    setTimeout(() => setCopiedUrl(false), 2000);
  };
  const handleShareFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };
  const handleShareX = () => {
    const url = window.location.href;
    const text = `${property.title} - ${property.price}`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };
  const handleShareInstagram = () => {
    // Instagram doesn't have direct sharing URLs, so we copy to clipboard with a message
    const url = window.location.href;
    const text = `${property.title} - ${property.price}\n${url}`;
    navigator.clipboard.writeText(text);
    toast.success('Text kopierad! Klistra in i Instagram.');
  };
  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const text = `${property.title} - ${property.price}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };
  const handleShareEmail = () => {
    const url = window.location.href;
    const subject = `Se denna bostad: ${property.title}`;
    const body = `Hej!\n\nJag hittade denna intressanta bostad:\n\n${property.title}\n${property.price}\n${property.location}\n\n${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="backdrop-blur-md border-b border-white/20 sticky top-0 z-50" style={{
      background: 'var(--main-gradient)'
    }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <svg 
            width="36" 
            height="36" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => navigate(-1)}
            className="cursor-pointer hover:-translate-x-2 hover:scale-x-110 transition-all duration-300 ease-out origin-center"
          >
            <defs>
              <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="url(#arrowGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
          {/* BaraHem Logo - Center */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity absolute left-1/2 -translate-x-1/2">
            <Home className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-hero-gradient bg-clip-text text-transparent">
              BaraHem
            </span>
          </Link>
          
          <div className="flex gap-1 sm:gap-2">
            <svg 
              width="36" 
              height="36" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => window.print()}
              className="cursor-pointer hover:scale-110 transition-all duration-300 ease-out"
            >
              <defs>
                <linearGradient id="printerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" stroke="url(#printerGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            
            <svg 
              width="36" 
              height="36" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => setIsFavorite(!isFavorite)}
              className="cursor-pointer hover:scale-110 transition-all duration-300 ease-out"
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
                fill={isFavorite ? "url(#heartGradient)" : "none"}
              />
            </svg>
          </div>
        </div>
      </header>

      <div className="w-full max-w-none px-3 sm:px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Left Ad */}
          <div className="hidden lg:flex lg:justify-center lg:items-start">
            <AdBanner className="order-1" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] group">
                <img src={images[currentImageIndex]} alt={property.title} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setIsImageModalOpen(true)} />
                
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
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="p-2 sm:p-4 bg-muted/30 mx-0">
                <div className="flex gap-1 sm:gap-2 overflow-x-auto py-[2px]">
                  {images.map((image, index) => <button key={index} onClick={() => setCurrentImageIndex(index)} className={`flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index ? "border-primary scale-105" : "border-transparent hover:border-primary/50"}`}>
                      <img src={image} alt={`${property.title} - bild ${index + 1}`} className="w-full h-full object-cover" />
                    </button>)}
                </div>
              </div>
            </Card>

            {/* Property Title and Share Section */}
            <h1 className="text-3xl sm:text-4xl font-bold text-center relative flex items-center justify-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setIsShareDialogOpen(true)} className="hover:bg-hero-gradient hover:text-white hover:scale-105 transition-transform gap-2 absolute left-0">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Dela bostad</span>
              </Button>
              {property.title}
            </h1>

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
                    {hasActiveBidding && !(property.is_sold || property.isSold) && !property.is_deleted && <>
                        <Badge className="bg-orange-500 text-white text-sm px-4 py-1.5">Pågående budgivning</Badge>
                        {dbProperty?.bidCount && <Badge variant="outline" className="text-sm px-4 py-1.5">
                            {dbProperty.bidCount} {dbProperty.bidCount === 1 ? 'budgivare' : 'budgivare'}
                          </Badge>}
                      </>}
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
                  <div className="flex items-center text-muted-foreground mt-2">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="text-sm sm:text-2xl">{property.location}</span>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Quick Facts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xl">Sovrum</p>
                      <p className="font-semibold">{property.bedrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xl">Badrum</p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xl">Boarea</p>
                      <p className="font-semibold">{property.area} m²</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xl">Byggår</p>
                      <p className="font-semibold">{property.buildYear || 'Ej angivet'}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Description */}
                <div>
                  <h2 className="text-xl font-bold mb-3">Beskrivning</h2>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {property.description || 'Ingen beskrivning tillgänglig'}
                  </p>
                </div>

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
                          ({Math.round((property.new_price - property.price) / property.price * 100)}%)
                        </span>
                      </div>}
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Utgångspris</span>
                      <span className="font-semibold">{dbProperty ? `${property.price.toLocaleString('sv-SE')} kr` : '8 600 000 kr'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Upplåtelseform</span>
                      <span className="font-semibold">Äganderätt</span>
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
                  </div>
                </div>

                {(property?.floorplan_images?.length > 0 || property?.floorplan_url) && <>
                    <Separator className="my-6" />
                    <div>
                      <h2 className="text-xl font-bold mb-3">Planritning</h2>
                      <div className="space-y-4">
                        {property?.floorplan_images?.length > 0 ? property.floorplan_images.map((imageUrl: string, index: number) => <div key={index} className="bg-muted/30 rounded-lg p-4 flex justify-center">
                              <img src={getImageUrl(imageUrl) || imageUrl} alt={`Planritning ${index + 1}`} className="w-full max-w-[1200px] h-auto object-contain rounded-lg" />
                            </div>) : <div className="bg-muted/30 rounded-lg p-4 flex justify-center">
                            <img src={getImageUrl(property.floorplan_url) || (property.address?.includes('Storgatan 15') ? storgatanFloorplan : floorplan)} alt="Planritning" className="w-full max-w-[1200px] h-auto object-contain rounded-lg" />
                          </div>}
                      </div>
                    </div>
                  </>}

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
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {agentProfile ?
              // Show real agent profile
              <>
                    <div className="flex flex-col items-center gap-4 mb-6">
                      <Link to={`/agent/${property.user_id}`} className="z-20 hover:scale-105 transition-transform">
                        <Avatar className="w-64 h-64 border-4 border-border cursor-pointer">
                          <AvatarImage src={agentProfile.avatar_url || undefined} className="object-contain p-2" />
                          <AvatarFallback className="bg-primary text-white text-2xl">
                            <User className="w-32 h-32" />
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Kontakta mäklaren</p>
                        <Link to={`/agent/${property.user_id}`} className="hover:text-primary transition-colors">
                          <p className="text-xl font-semibold">{agentProfile.full_name || 'Mäklare'}</p>
                        </Link>
                        {agentProfile.agency && <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                            <Building2 className="w-3 h-3" />
                            {agentProfile.agency}
                          </p>}
                      </div>
                    </div>

                    {/* Agent Info */}
                    <div className="space-y-3 mb-6 bg-muted/30 rounded-lg p-4">
                      {agentProfile.phone && <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{agentProfile.phone}</span>
                        </div>}
                      {agentProfile.email && <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{agentProfile.email}</span>
                        </div>}
                      {agentProfile.office && <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{agentProfile.office}</span>
                        </div>}
                      {agentProfile.area && <div className="flex items-center gap-2 text-sm">
                          <Home className="w-4 h-4 text-muted-foreground" />
                          <span>{agentProfile.area}</span>
                        </div>}
                    </div>

                    <div className="space-y-3">
                      {agentProfile.phone && <Button className="w-full bg-primary hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105" size="lg">
                          <Phone className="w-4 h-4 mr-2" />
                          Ring mig
                        </Button>}
                      <Button className="w-full border border-border bg-white text-foreground hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105" size="lg">
                        <Mail className="w-4 h-4 mr-2" />
                        Skicka meddelande
                      </Button>
                      <Button className="w-full border border-border bg-white text-foreground hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105" size="lg">
                        <Calendar className="w-4 h-4 mr-2" />
                        Boka visning
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
                      <Button className="w-full border border-border bg-white text-foreground hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105" size="lg">Visa telefonnummer</Button>
                      <Button className="w-full border border-border bg-white text-foreground hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105" size="lg">Skicka meddelande</Button>
                      <Button className="w-full border border-border bg-white text-foreground hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105" size="lg">Boka visning</Button>
                    </div>
                  </>}

                <Separator className="my-6" />

                <div>
                  <h4 className="font-semibold mb-3">Visningar</h4>
                  <div className="space-y-2">
                    <button onClick={() => handleDownloadViewing('Ons 15 okt', '16:00 - 17:00')} className="w-full flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group cursor-pointer">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 group-hover:text-primary transition-colors" />
                      <div className="flex-1 text-left">
                        <p className="font-medium group-hover:text-primary transition-colors">Ons 15 okt</p>
                <p className="text-sm text-muted-foreground">16:00 - 17:00</p>
                <p className="text-sm text-muted-foreground mt-1">Mäklare: {agentProfile?.full_name || property.vendor}</p>
                      </div>
                      <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                    </button>
                    <button onClick={() => handleDownloadViewing('Fre 17 okt', '13:00 - 14:00')} className="w-full flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group cursor-pointer">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 group-hover:text-primary transition-colors" />
                      <div className="flex-1 text-left">
              <p className="font-medium group-hover:text-primary transition-colors">Fre 17 okt</p>
              <p className="text-sm text-muted-foreground">13:00 - 14:00</p>
              <p className="text-sm text-muted-foreground mt-1">Mäklare: {agentProfile?.full_name || property.vendor}</p>
                      </div>
                      <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                    </button>
                  </div>
                </div>
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
                <img src={bathroomAd} alt="Badrumrenovering" className="w-full h-32 sm:h-40 md:h-48 object-cover" />
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
    </div>;
};
export default PropertyDetail;