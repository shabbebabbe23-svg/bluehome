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
        <Card className="bg-white/85 backdrop-blur-md border-white/20 p-8 md:p-10 animate-slide-up max-w-5xl mx-auto">
          <div className="space-y-6">
            {/* Område Section */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Område</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6" />
                <Input
                  placeholder="Skriv område eller adress"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-14 h-14 text-lg border-2 border-primary/30 focus:border-primary"
                />
              </div>
            </div>

            {/* Property Type Buttons */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Bostadstyp</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPropertyType("")}
                  className={`h-14 text-base justify-start ${propertyType === "" ? "bg-hero-gradient text-white border-transparent hover:text-black" : ""}`}
                >
                  <Home className="w-5 h-5 mr-2" />
                  Alla typer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPropertyType("house")}
                  className={`h-14 text-base justify-start ${propertyType === "house" ? "bg-hero-gradient text-white border-transparent hover:text-black" : ""}`}
                >
                  <Home className="w-5 h-5 mr-2" />
                  Villor
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPropertyType("villa")}
                  className={`h-14 text-base justify-start ${propertyType === "villa" ? "bg-hero-gradient text-white border-transparent hover:text-black" : ""}`}
                >
                  <Home className="w-5 h-5 mr-2" />
                  Par/Radhus
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPropertyType("apartment")}
                  className={`h-14 text-base justify-start ${propertyType === "apartment" ? "bg-hero-gradient text-white border-transparent hover:text-black" : ""}`}
                >
                  <Home className="w-5 h-5 mr-2" />
                  Lägenheter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPropertyType("cottage")}
                  className={`h-14 text-base justify-start ${propertyType === "cottage" ? "bg-hero-gradient text-white border-transparent hover:text-black" : ""}`}
                >
                  <Home className="w-5 h-5 mr-2" />
                  Fritidshus
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPropertyType("plot")}
                  className={`h-14 text-base justify-start ${propertyType === "plot" ? "bg-hero-gradient text-white border-transparent hover:text-black" : ""}`}
                >
                  <Home className="w-5 h-5 mr-2" />
                  Tomt
                </Button>
              </div>
            </div>

            {/* Price Filter */}
            <div className="relative w-52">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
              <select 
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-md border-2 border-primary/30 bg-white text-foreground h-12 text-base cursor-pointer hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Prisintervall</option>
                <option value="0-2000000">Under 2 miljoner SEK</option>
                <option value="2000000-4000000">2 - 4 miljoner SEK</option>
                <option value="4000000-6000000">4 - 6 miljoner SEK</option>
                <option value="6000000+">Över 6 miljoner SEK</option>
              </select>
            </div>

            {/* Search Button */}
            <Button size="lg" className="w-full h-14 text-lg bg-hero-gradient hover:scale-[1.02] transition-transform">
              Hitta bostäder
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Hero;