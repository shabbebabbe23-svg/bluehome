import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Bed, Bath, Square, Calendar, Share2, Printer, Home, ChevronLeft, ChevronRight, Download, User, Phone, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import DetailAdBanner from "@/components/DetailAdBanner";
import AdBanner from "@/components/AdBanner";
import PropertyMap from "@/components/PropertyMap";

const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [dbProperty, setDbProperty] = useState<any>(null);
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Track property view
  usePropertyViewTracking(id || "");

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        // Try to fetch from database first
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (data) {
          setDbProperty(data);
          
          // Fetch agent profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user_id)
            .maybeSingle();
          
          if (profile) {
            setAgentProfile(profile);
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

  const properties = [
    {
      id: 1,
      title: "Modern lägenhet i city",
      price: "3.2M SEK",
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
      features: ["Balkong", "Hiss", "Tvättstuga", "Förråd", "Fiber"],
    },
    {
      id: 2,
      title: "Charmig svensk villa",
      price: "4.8M SEK",
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
      features: ["Trädgård", "Garage", "Öppen spis", "Uteplats", "Nyrenoverat kök"],
    },
    {
      id: 3,
      title: "Modernt radhus",
      price: "2.9M SEK",
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
      features: ["Uteplats", "Parkering", "Vind", "Genomtänkt planlösning", "Energisnålt"],
    },
    {
      id: 4,
      title: "Lyxig takvåning",
      price: "8.5M SEK",
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
      features: ["Takterrass", "Hiss", "Kakelugn", "Havsutsikt", "Renoverat badrum"],
    },
    {
      id: 5,
      title: "Familjehus",
      price: "5.2M SEK",
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
      features: ["Dubbelgarage", "Pool", "Bastu", "Sjönära", "Stor tomt"],
    },
    {
      id: 6,
      title: "Studioappartement",
      price: "1.8M SEK",
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
      features: ["Hiss", "Tvättstuga", "Fiber", "Nybyggt", "Centralt"],
    },
    {
      id: 7,
      title: "Elegant stadslägeneht",
      price: "4.1M SEK",
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
      features: ["Kakelugn", "Bjälktak", "Centralt", "Historiskt", "Unik"],
    },
    {
      id: 8,
      title: "Klassiskt radhus",
      price: "6.3M SEK",
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
      features: ["Uteplats", "Parkering", "Nybyggt", "Walk-in closet", "Tre badrum"],
    },
    {
      id: 9,
      title: "Exklusiv skogsvilla",
      price: "9.2M SEK",
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
      features: ["Pool", "Bastu", "Gym", "Dubbelgarage", "Skogsnära", "Arkitektritad"],
    },
    {
      id: 10,
      title: "Sjönära lägenhet",
      price: "7.8M SEK",
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
      features: ["Balkong", "Sjöutsikt", "Hiss", "Parkering", "Nybyggt", "Lyxigt"],
    },
  ];

  // Use database property if available, otherwise fallback to hardcoded
  let property = dbProperty;
  
  if (!property) {
    property = properties.find((p) => p.id === Number(id));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Laddar fastighet...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Fastighet hittades inte</h1>
          <Link to="/">
            <Button className="bg-hero-gradient hover:scale-105 transition-transform text-white">Tillbaka till startsidan</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Handle images for both database and hardcoded properties
  const images = dbProperty 
    ? [
        dbProperty.image_url,
        dbProperty.hover_image_url,
        ...(dbProperty.additional_images || [])
      ].filter(Boolean)
    : property.images || [property1];

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDownloadViewing = (date: string, time: string) => {
    // Parse datum och tid för att skapa en riktig Date
    const [day, month] = date.split(' ').slice(1, 3);
    const [startTime] = time.split(' - ');
    
    // Skapa datum (använder 2025 som år för nu)
    const monthMap: { [key: string]: number } = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'maj': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11
    };
    
    const monthNum = monthMap[month.toLowerCase()];
    const [hours, minutes] = startTime.split(':').map(Number);
    
    const startDate = new Date(2025, monthNum, parseInt(day), hours, minutes);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 timme
    
    downloadICS(
      `Visning: ${property.title}`,
      `Visning av ${property.type.toLowerCase()} på ${property.address}, ${property.location}`,
      `${property.address}, ${property.location}`,
      startDate,
      endDate,
      `visning-${property.title.toLowerCase().replace(/\s+/g, '-')}.ics`
    );
    
    toast.success('Kalenderaktivitet sparad!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="hover:bg-hero-gradient hover:text-white hover:scale-105 transition-transform text-xs sm:text-sm">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Tillbaka</span>
            </Button>
          </Link>
          <div className="flex gap-1 sm:gap-2">
            <Button variant="outline" size="icon" className="hover:bg-hero-gradient hover:text-white hover:scale-105 transition-transform">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="hover:bg-hero-gradient hover:text-white hover:scale-105 transition-transform">
              <Printer className="w-4 h-4" />
            </Button>
            <Button
              variant={isFavorite ? "default" : "outline"}
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className="hover:bg-hero-gradient hover:text-white hover:scale-105 transition-transform"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? "fill-current" : ""
                }`}
              />
            </Button>
          </div>
        </div>
      </header>

      <div className="w-full max-w-none px-3 sm:px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Left Ad */}
          <div className="hidden lg:block">
            <AdBanner className="order-1" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] group">
                <img
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Buttons */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-hero-gradient hover:text-white hover:scale-105 h-8 w-8 sm:h-10 sm:w-10"
                  onClick={handlePreviousImage}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-hero-gradient hover:text-white hover:scale-105 h-8 w-8 sm:h-10 sm:w-10"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                
                {/* Image Counter */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="p-2 sm:p-4 bg-muted/30">
                <div className="flex gap-1 sm:gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? "border-primary scale-105"
                          : "border-transparent hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${property.title} - bild ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Property Info */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{property.type}</Badge>
                      {property.isNew && (
                        <Badge className="bg-success text-white">Ny</Badge>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{property.address}, {property.location}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      {dbProperty ? `${(property.price / 1000000).toFixed(1)}M SEK` : property.price}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Quick Facts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sovrum</p>
                      <p className="font-semibold">{property.bedrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Badrum</p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Boarea</p>
                      <p className="font-semibold">{property.area} m²</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Byggår</p>
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

                {property.floorplan_url && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h2 className="text-xl font-bold mb-3">Planritning</h2>
                      <div className="bg-muted/30 rounded-lg p-4 flex justify-center">
                        <img
                          src={property.floorplan_url}
                          alt="Planritning"
                          className="w-full max-w-[1200px] h-auto object-contain rounded-lg"
                        />
                      </div>
                    </div>
                  </>
                )}

                {!dbProperty && (
                  <>
                    <Separator className="my-6" />

                    {/* Floor Plan */}
                    <div>
                      <h2 className="text-xl font-bold mb-3">Planritning</h2>
                      <div className="bg-muted/30 rounded-lg p-4 flex justify-center">
                        <img
                          src={floorplan}
                          alt="Planritning"
                          className="w-full max-w-[1200px] h-auto object-contain rounded-lg"
                        />
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Features */}
                    <div>
                      <h2 className="text-xl font-bold mb-3">Highlights</h2>
                      <div className="grid grid-cols-2 gap-2">
                        {property.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Map */}
            <PropertyMap address={property.address} location={property.location} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {agentProfile ? (
                  // Show real agent profile
                  <>
                    <div className="flex flex-col items-center gap-4 mb-6">
                      <Link to={`/maklare`} className="z-20 hover:scale-105 transition-transform">
                        <Avatar className="w-32 h-32 border-4 border-border cursor-pointer">
                          <AvatarImage src={agentProfile.avatar_url || undefined} className="object-contain p-2" />
                          <AvatarFallback className="bg-primary text-white text-2xl">
                            <User className="w-16 h-16" />
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Kontakta mäklaren</p>
                        <Link to={`/maklare`} className="hover:text-primary transition-colors">
                          <p className="text-xl font-semibold">{agentProfile.full_name || 'Mäklare'}</p>
                        </Link>
                        {agentProfile.agency && (
                          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                            <Building2 className="w-3 h-3" />
                            {agentProfile.agency}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Agent Info */}
                    <div className="space-y-3 mb-6 bg-muted/30 rounded-lg p-4">
                      {agentProfile.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{agentProfile.phone}</span>
                        </div>
                      )}
                      {agentProfile.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{agentProfile.email}</span>
                        </div>
                      )}
                      {agentProfile.office && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{agentProfile.office}</span>
                        </div>
                      )}
                      {agentProfile.area && (
                        <div className="flex items-center gap-2 text-sm">
                          <Home className="w-4 h-4 text-muted-foreground" />
                          <span>{agentProfile.area}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {agentProfile.phone && (
                        <Button className="w-full bg-primary hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105" size="lg">
                          <Phone className="w-4 h-4 mr-2" />
                          Ring mig
                        </Button>
                      )}
                      <Button className="w-full border border-border bg-white text-foreground hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105" size="lg">
                        <Mail className="w-4 h-4 mr-2" />
                        Skicka meddelande
                      </Button>
                      <Button className="w-full border border-border bg-white text-foreground hover:bg-hero-gradient hover:text-white transition-transform hover:scale-105" size="lg">
                        <Calendar className="w-4 h-4 mr-2" />
                        Boka visning
                      </Button>
                    </div>
                  </>
                ) : (
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
                  </>
                )}

                <Separator className="my-6" />

                <div>
                  <h4 className="font-semibold mb-3">Visningar</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleDownloadViewing('Ons 15 okt', '16:00 - 17:00')}
                      className="w-full flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group cursor-pointer"
                    >
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 group-hover:text-primary transition-colors" />
                      <div className="flex-1 text-left">
                        <p className="font-medium group-hover:text-primary transition-colors">Ons 15 okt</p>
                <p className="text-sm text-muted-foreground">16:00 - 17:00</p>
                <p className="text-sm text-muted-foreground mt-1">Mäklare: {agentProfile?.full_name || property.vendor}</p>
                      </div>
                      <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                    </button>
                    <button
                      onClick={() => handleDownloadViewing('Fre 17 okt', '13:00 - 14:00')}
                      className="w-full flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group cursor-pointer"
                    >
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

        {/* Ad Banner Below */}
        <div className="mt-8">
          <DetailAdBanner />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
