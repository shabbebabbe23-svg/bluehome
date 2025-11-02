import { useState } from "react";
import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
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
import logo1 from "@/assets/logo-1.svg";
import logo2 from "@/assets/logo-2.svg";
import logo3 from "@/assets/logo-3.svg";
import logo4 from "@/assets/logo-4.svg";
import logo5 from "@/assets/logo-5.svg";
import logo6 from "@/assets/logo-6.svg";
import logo7 from "@/assets/logo-7.svg";
import logo8 from "@/assets/logo-8.svg";
import logo9 from "@/assets/logo-9.svg";
import logo10 from "@/assets/logo-10.svg";
import logo11 from "@/assets/logo-11.svg";
import logo12 from "@/assets/logo-12.svg";
import logo13 from "@/assets/logo-13.svg";
import logo14 from "@/assets/logo-14.svg";
import logo15 from "@/assets/logo-15.svg";
import logo16 from "@/assets/logo-16.svg";
import logo17 from "@/assets/logo-17.svg";
import logo18 from "@/assets/logo-18.svg";

const PropertyGrid = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<string>("default");

  const properties = [
    {
      id: 1,
      title: "Modern lägenhet i city",
      price: "3.2M SEK",
      priceValue: 3200000,
      location: "Södermalm, Stockholm",
      address: "Götgatan 45",
      bedrooms: 2,
      bathrooms: 1,
      area: 75,
      fee: 3500,
      viewingDate: new Date("2024-10-15"),
      image: property1,
      hoverImage: property2,
      type: "Lägenhet",
      isNew: true,
      vendorLogo: logo1,
    },
    {
      id: 2,
      title: "Charmig svensk villa",
      price: "4.8M SEK",
      priceValue: 4800000,
      location: "Djursholm, Stockholm",
      address: "Vendevägen 12",
      bedrooms: 4,
      bathrooms: 2,
      area: 150,
      fee: 0,
      viewingDate: new Date("2024-10-16"),
      image: property2,
      hoverImage: property3,
      type: "Villa",
      isNew: false,
      vendorLogo: logo2,
    },
    {
      id: 3,
      title: "Modernt radhus",
      price: "2.9M SEK",
      priceValue: 2900000,
      location: "Vasastan, Stockholm",
      address: "Odengatan 78",
      bedrooms: 3,
      bathrooms: 2,
      area: 110,
      fee: 2800,
      viewingDate: new Date("2024-10-14"),
      image: property3,
      hoverImage: property4,
      type: "Radhus",
      isNew: true,
      vendorLogo: logo3,
    },
    {
      id: 4,
      title: "Lyxig takvåning",
      price: "8.5M SEK",
      priceValue: 8500000,
      location: "Östermalm, Stockholm",
      address: "Strandvägen 23",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      fee: 5200,
      viewingDate: new Date("2024-10-18"),
      image: property4,
      hoverImage: property5,
      type: "Lägenhet",
      isNew: false,
      vendorLogo: logo4,
    },
    {
      id: 5,
      title: "Familjehus",
      price: "5.2M SEK",
      priceValue: 5200000,
      location: "Lidingö, Stockholm",
      address: "Kyrkviken 8",
      bedrooms: 5,
      bathrooms: 3,
      area: 180,
      fee: 0,
      viewingDate: new Date("2024-10-17"),
      image: property5,
      hoverImage: property6,
      type: "Villa",
      isNew: false,
      vendorLogo: logo5,
    },
    {
      id: 6,
      title: "Studioappartement",
      price: "1.8M SEK",
      priceValue: 1800000,
      location: "Norrmalm, Stockholm",
      address: "Drottninggatan 56",
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      fee: 2100,
      viewingDate: new Date("2024-10-13"),
      image: property6,
      hoverImage: property7,
      type: "Lägenhet",
      isNew: true,
      vendorLogo: logo6,
    },
    {
      id: 7,
      title: "Elegant stadslägeneht",
      price: "4.1M SEK",
      priceValue: 4100000,
      location: "Gamla Stan, Stockholm",
      address: "Prästgatan 21",
      bedrooms: 2,
      bathrooms: 1,
      area: 85,
      fee: 3200,
      viewingDate: new Date("2024-10-19"),
      image: property7,
      hoverImage: property8,
      type: "Lägenhet",
      isNew: false,
      vendorLogo: logo7,
    },
    {
      id: 8,
      title: "Klassiskt radhus",
      price: "6.3M SEK",
      priceValue: 6300000,
      location: "Bromma, Stockholm",
      address: "Åkeshovsvägen 34",
      bedrooms: 4,
      bathrooms: 3,
      area: 140,
      fee: 3900,
      viewingDate: new Date("2024-10-20"),
      image: property8,
      hoverImage: property9,
      type: "Radhus",
      isNew: true,
      vendorLogo: logo8,
    },
    {
      id: 9,
      title: "Exklusiv skogsvilla",
      price: "9.2M SEK",
      priceValue: 9200000,
      location: "Nacka, Stockholm",
      address: "Skogsbacken 7",
      bedrooms: 5,
      bathrooms: 4,
      area: 220,
      fee: 0,
      viewingDate: new Date("2024-10-12"),
      image: property9,
      hoverImage: property10,
      type: "Villa",
      isNew: false,
      vendorLogo: logo9,
    },
    {
      id: 10,
      title: "Sjönära lägenhet",
      price: "7.8M SEK",
      priceValue: 7800000,
      location: "Strandvägen, Stockholm",
      address: "Strandvägen 89",
      bedrooms: 3,
      bathrooms: 2,
      area: 130,
      fee: 4500,
      viewingDate: new Date("2024-10-21"),
      image: property10,
      hoverImage: property1,
      type: "Lägenhet",
      isNew: true,
      vendorLogo: logo10,
    },
    {
      id: 11,
      title: "Penthouse med takterrass",
      price: "12.5M SEK",
      priceValue: 12500000,
      location: "Östermalm, Stockholm",
      address: "Karlavägen 56",
      bedrooms: 4,
      bathrooms: 3,
      area: 165,
      fee: 6800,
      viewingDate: new Date("2024-10-22"),
      image: property3,
      hoverImage: property5,
      type: "Lägenhet",
      isNew: true,
      vendorLogo: logo11,
    },
    {
      id: 12,
      title: "Lantlig gård",
      price: "6.9M SEK",
      priceValue: 6900000,
      location: "Ekerö, Stockholm",
      address: "Lantvägen 3",
      bedrooms: 6,
      bathrooms: 3,
      area: 240,
      fee: 0,
      viewingDate: new Date("2024-10-23"),
      image: property7,
      hoverImage: property9,
      type: "Villa",
      isNew: false,
      vendorLogo: logo12,
    },
    {
      id: 13,
      title: "Moderne bostadsrätt",
      price: "3.6M SEK",
      priceValue: 3600000,
      location: "Kungsholmen, Stockholm",
      address: "Hantverkargatan 82",
      bedrooms: 2,
      bathrooms: 1,
      area: 68,
      fee: 3100,
      viewingDate: new Date("2024-10-24"),
      image: property4,
      hoverImage: property8,
      type: "Lägenhet",
      isNew: true,
      vendorLogo: logo13,
    },
    {
      id: 14,
      title: "Strandnära villa",
      price: "11.2M SEK",
      priceValue: 11200000,
      location: "Saltsjöbaden, Stockholm",
      address: "Strandpromenaden 15",
      bedrooms: 5,
      bathrooms: 4,
      area: 200,
      fee: 0,
      viewingDate: new Date("2024-10-25"),
      image: property6,
      hoverImage: property2,
      type: "Villa",
      isNew: false,
      vendorLogo: logo14,
    },
    {
      id: 15,
      title: "Centralt parhus",
      price: "4.5M SEK",
      priceValue: 4500000,
      location: "Hägersten, Stockholm",
      address: "Fruängsgatan 44",
      bedrooms: 3,
      bathrooms: 2,
      area: 95,
      fee: 2600,
      viewingDate: new Date("2024-10-26"),
      image: property1,
      hoverImage: property6,
      type: "Radhus",
      isNew: true,
      vendorLogo: logo15,
    },
    {
      id: 16,
      title: "Designervilla",
      price: "15.8M SEK",
      priceValue: 15800000,
      location: "Danderyd, Stockholm",
      address: "Mörbyvägen 88",
      bedrooms: 6,
      bathrooms: 5,
      area: 280,
      fee: 0,
      viewingDate: new Date("2024-10-27"),
      image: property8,
      hoverImage: property4,
      type: "Villa",
      isNew: true,
      vendorLogo: logo16,
    },
    {
      id: 17,
      title: "Kompakt ettan",
      price: "2.1M SEK",
      priceValue: 2100000,
      location: "Farsta, Stockholm",
      address: "Farstaplan 7",
      bedrooms: 1,
      bathrooms: 1,
      area: 38,
      fee: 1900,
      viewingDate: new Date("2024-10-28"),
      image: property5,
      hoverImage: property10,
      type: "Lägenhet",
      isNew: false,
      vendorLogo: logo17,
    },
    {
      id: 18,
      title: "Skärgårdshus",
      price: "8.9M SEK",
      priceValue: 8900000,
      location: "Vaxholm, Stockholm",
      address: "Skärgårdsvägen 22",
      bedrooms: 4,
      bathrooms: 3,
      area: 170,
      fee: 0,
      viewingDate: new Date("2024-10-29"),
      image: property9,
      hoverImage: property3,
      type: "Villa",
      isNew: false,
      vendorLogo: logo18,
    },
  ];

  const sortProperties = (props: typeof properties) => {
    const sorted = [...props];
    
    switch (sortBy) {
      case "price-high":
        return sorted.sort((a, b) => b.priceValue - a.priceValue);
      case "price-low":
        return sorted.sort((a, b) => a.priceValue - b.priceValue);
      case "area-small":
        return sorted.sort((a, b) => a.area - b.area);
      case "area-large":
        return sorted.sort((a, b) => b.area - a.area);
      case "fee-low":
        return sorted.sort((a, b) => a.fee - b.fee);
      case "viewing-earliest":
        return sorted.sort((a, b) => a.viewingDate.getTime() - b.viewingDate.getTime());
      case "address-az":
        return sorted.sort((a, b) => a.address.localeCompare(b.address));
      case "address-za":
        return sorted.sort((a, b) => b.address.localeCompare(a.address));
      default:
        return sorted;
    }
  };

  const sortedProperties = sortProperties(properties);
  const displayedProperties = showAll ? sortedProperties : sortedProperties.slice(0, 6);

  const handleFavoriteToggle = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Utvalda fastigheter
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upptäck vårt handplockade urval av premiumfastigheter över hela Sverige
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex justify-end mb-8">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[280px] bg-hero-gradient text-white border-transparent">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sortera efter" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="default">Sortera efter</SelectItem>
              <SelectItem value="price-high">Pris: Högt till lågt</SelectItem>
              <SelectItem value="price-low">Pris: Lågt till högt</SelectItem>
              <SelectItem value="area-small">Kvm: Minst till störst</SelectItem>
              <SelectItem value="area-large">Kvm: Störst till minst</SelectItem>
              <SelectItem value="fee-low">Avgift: Lägst till högst</SelectItem>
              <SelectItem value="viewing-earliest">Visning: Tidigast först</SelectItem>
              <SelectItem value="address-az">Adress: A-Ö</SelectItem>
              <SelectItem value="address-za">Adress: Ö-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {displayedProperties.map((property, index) => (
            <div
              key={property.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PropertyCard
                {...property}
                isFavorite={favorites.includes(property.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="hover:scale-105 transition-transform"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Visa färre fastigheter" : "Visa alla fastigheter"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PropertyGrid;