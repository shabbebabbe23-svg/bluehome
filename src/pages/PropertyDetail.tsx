import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Bed, Bath, Square, Calendar, Share2, Printer, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
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

const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const properties = [
    {
      id: 1,
      title: "Modern lägenhet i city",
      price: "3.2M SEK",
      location: "Södermalm, Stockholm",
      address: "Götgatan 45",
      bedrooms: 2,
      bathrooms: 1,
      area: 75,
      images: [property1, property2],
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
      bedrooms: 4,
      bathrooms: 2,
      area: 150,
      images: [property2, property3],
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
      bedrooms: 3,
      bathrooms: 2,
      area: 110,
      images: [property3, property4],
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
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      images: [property4, property5],
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
      bedrooms: 5,
      bathrooms: 3,
      area: 180,
      images: [property5, property6],
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
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      images: [property6, property7],
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
      bedrooms: 2,
      bathrooms: 1,
      area: 85,
      images: [property7, property8],
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
      bedrooms: 4,
      bathrooms: 3,
      area: 140,
      images: [property8, property9],
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
      bedrooms: 5,
      bathrooms: 4,
      area: 220,
      images: [property9, property10],
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
      bedrooms: 3,
      bathrooms: 2,
      area: 130,
      images: [property10, property1],
      type: "Lägenhet",
      isNew: true,
      buildYear: 2019,
      floor: 4,
      rooms: 3,
      description: "Exklusiv lägenhet vid Strandvägen med direktutsikt över vattnet. Högklassig standard med genomtänkta detaljer. Tre sovrum, varav ett är master bedroom med eget badrum. Stor balkong med kvällssol och magisk utsikt.",
      features: ["Balkong", "Sjöutsikt", "Hiss", "Parkering", "Nybyggt", "Lyxigt"],
    },
  ];

  const property = properties.find((p) => p.id === Number(id));

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Fastighet hittades inte</h1>
          <Link to="/">
            <Button>Tillbaka till startsidan</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images || [property1];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tillbaka
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Printer className="w-4 h-4" />
            </Button>
            <Button
              variant={isFavorite ? "default" : "outline"}
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative h-[500px]">
                <img
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentImageIndex === index
                          ? "bg-white w-8"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Card>

            {/* Property Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{property.type}</Badge>
                      {property.isNew && (
                        <Badge className="bg-success text-white">Ny</Badge>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{property.address}, {property.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{property.price}</p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Quick Facts */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                      <p className="font-semibold">{property.buildYear}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Description */}
                <div>
                  <h2 className="text-xl font-bold mb-3">Beskrivning</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Kontakta mäklaren</h3>
                <div className="space-y-4">
                  <Button className="w-full" size="lg">
                    Visa telefonnummer
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    Skicka meddelande
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    Boka visning
                  </Button>
                </div>

                <Separator className="my-6" />

                <div>
                  <h4 className="font-semibold mb-3">Visningar</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Ons 15 okt</p>
                        <p className="text-sm text-muted-foreground">16:00 - 17:00</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Fre 17 okt</p>
                        <p className="text-sm text-muted-foreground">13:00 - 14:00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
