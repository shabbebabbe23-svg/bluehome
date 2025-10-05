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
            <SelectTrigger className="w-[280px] bg-card border-border">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sortera efter" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="default">Standard</SelectItem>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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