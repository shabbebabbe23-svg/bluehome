import { useState } from "react";
import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const PropertyGrid = () => {
  const [favorites, setFavorites] = useState<number[]>([]);

  const properties = [
    {
      id: 1,
      title: "Modern City Apartment",
      price: "3.2M SEK",
      location: "Södermalm, Stockholm",
      bedrooms: 2,
      bathrooms: 1,
      area: 75,
      image: property1,
      type: "Apartment",
      isNew: true,
    },
    {
      id: 2,
      title: "Charming Swedish Villa",
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
      title: "Contemporary Townhouse",
      price: "2.9M SEK",
      location: "Vasastan, Stockholm",
      bedrooms: 3,
      bathrooms: 2,
      area: 110,
      image: property3,
      type: "Townhouse",
      isNew: true,
    },
    {
      id: 4,
      title: "Luxury Penthouse",
      price: "8.5M SEK",
      location: "Östermalm, Stockholm",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      image: property1,
      type: "Apartment",
      isNew: false,
    },
    {
      id: 5,
      title: "Family House",
      price: "5.2M SEK",
      location: "Lidingö, Stockholm",
      bedrooms: 5,
      bathrooms: 3,
      area: 180,
      image: property2,
      type: "House",
      isNew: false,
    },
    {
      id: 6,
      title: "Studio Apartment",
      price: "1.8M SEK",
      location: "Norrmalm, Stockholm",
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      image: property3,
      type: "Apartment",
      isNew: true,
    },
  ];

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
            Featured Properties
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of premium properties across Sweden
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {properties.map((property, index) => (
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
          <Button size="lg" variant="outline" className="hover:scale-105 transition-transform">
            View All Properties
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PropertyGrid;