import { useState } from "react";
import { Search, MapPin, Home, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [propertyType, setPropertyType] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Hitta ditt
            <span className="block bg-hero-gradient bg-clip-text text-transparent">
              Drömhem
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto">
            Upptäck tusentals fastigheter över hela Sverige med Bluehome
          </p>
        </div>

        {/* Search Card */}
        <Card className="bg-glass backdrop-blur-md border-white/20 p-6 md:p-8 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Plats"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10 bg-white/90 border-white/30"
              />
            </div>
            
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-white/30 bg-white/90 text-foreground"
              >
                <option value="">Bostadstyp</option>
                <option value="apartment">Lägenhet</option>
                <option value="house">Villa</option>
                <option value="villa">Radhus</option>
                <option value="townhouse">Bostadsrätt</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <select 
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-white/30 bg-white/90 text-foreground"
              >
                <option value="">Prisintervall</option>
                <option value="0-2000000">Under 2 miljoner SEK</option>
                <option value="2000000-4000000">2 - 4 miljoner SEK</option>
                <option value="4000000-6000000">4 - 6 miljoner SEK</option>
                <option value="6000000+">Över 6 miljoner SEK</option>
              </select>
            </div>

            <Button size="lg" className="bg-hero-gradient hover:scale-105 transition-transform">
              <Search className="w-5 h-5 mr-2" />
              Sök
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-sm">
            <span className="text-muted-foreground">Populära sökningar:</span>
            <button className="text-primary hover:text-primary-glow transition-colors">Stockholm</button>
            <span className="text-muted-foreground">•</span>
            <button className="text-primary hover:text-primary-glow transition-colors">Göteborg</button>
            <span className="text-muted-foreground">•</span>
            <button className="text-primary hover:text-primary-glow transition-colors">Malmö</button>
            <span className="text-muted-foreground">•</span>
            <button className="text-primary hover:text-primary-glow transition-colors">Uppsala</button>
            <span className="text-muted-foreground">•</span>
            <button className="text-primary hover:text-primary-glow transition-colors">Spanien</button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Hero;