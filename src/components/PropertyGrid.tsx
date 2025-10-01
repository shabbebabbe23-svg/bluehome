import { useState } from "react";
import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
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

  const properties = [
    {
      id: 1,
      title: "Modern lägenhet i city",
      price: "3.2M SEK",
      location: "Södermalm, Stockholm",
      bedrooms: 2,
      bathrooms: 1,
      area: 75,
      image: property1,
      type: "Lägenhet",
      isNew: true,
    },
    {
      id: 2,
      title: "Charmig svensk villa",
      price: "4.8M SEK",
      location: "Djursholm, Stockholm",
      bedrooms: 4,
      bathrooms: 2,
      area: 150,
      image: property2,
      type: "Villa",
      isNew: false,
    },
    {
      id: 3,
      title: "Modernt radhus",
      price: "2.9M SEK",
      location: "Vasastan, Stockholm",
      bedrooms: 3,
      bathrooms: 2,
      area: 110,
      image: property3,
      type: "Radhus",
      isNew: true,
    },
    {
      id: 4,
      title: "Lyxig takvåning",
      price: "8.5M SEK",
      location: "Östermalm, Stockholm",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      image: property4,
      type: "Lägenhet",
      isNew: false,
    },
    {
      id: 5,
      title: "Familjehus",
      price: "5.2M SEK",
      location: "Lidingö, Stockholm",
      bedrooms: 5,
      bathrooms: 3,
      area: 180,
      image: property5,
      type: "Villa",
      isNew: false,
    },
    {
      id: 6,
      title: "Studioappartement",
      price: "1.8M SEK",
      location: "Norrmalm, Stockholm",
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      image: property6,
      type: "Lägenhet",
      isNew: true,
    },
    {
      id: 7,
      title: "Elegant stadslägeneht",
      price: "4.1M SEK",
      location: "Gamla Stan, Stockholm",
      bedrooms: 2,
      bathrooms: 1,
      area: 85,
      image: property7,
      type: "Lägenhet",
      isNew: false,
    },
    {
      id: 8,
      title: "Klassiskt radhus",
      price: "6.3M SEK",
      location: "Bromma, Stockholm",
      bedrooms: 4,
      bathrooms: 3,
      area: 140,
      image: property8,
      type: "Radhus",
      isNew: true,
    },
    {
      id: 9,
      title: "Exklusiv skogsvilla",
      price: "9.2M SEK",
      location: "Nacka, Stockholm",
      bedrooms: 5,
      bathrooms: 4,
      area: 220,
      image: property9,
      type: "Villa",
      isNew: false,
    },
    {
      id: 10,
      title: "Sjönära lägenhet",
      price: "7.8M SEK",
      location: "Strandvägen, Stockholm",
      bedrooms: 3,
      bathrooms: 2,
      area: 130,
      image: property10,
      type: "Lägenhet",
      isNew: true,
    },
  ];

  const displayedProperties = showAll ? properties : properties.slice(0, 6);

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
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Utvalda fastigheter
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upptäck vårt handplockade urval av premiumfastigheter över hela Sverige
          </p>
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