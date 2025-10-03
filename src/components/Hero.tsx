import { useState } from "react";
import { Search, MapPin, Home, Filter, Building, Building2, TreePine, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20000000]);
  const [areaRange, setAreaRange] = useState([0, 200]);
  const [roomRange, setRoomRange] = useState([0, 7]);
  const [propertyType, setPropertyType] = useState("");

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} milj kr`;
    }
    return `${(value / 1000).toFixed(0)} tkr`;
  };

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
                  <div className="flex mr-2">
                    <Home className="w-5 h-5 -mr-1" />
                    <Home className="w-5 h-5" />
                  </div>
                  Par/Radhus
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPropertyType("apartment")}
                  className={`h-14 text-base justify-start ${propertyType === "apartment" ? "bg-hero-gradient text-white border-transparent hover:text-black" : ""}`}
                >
                  <Building className="w-5 h-5 mr-2" />
                  Lägenheter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPropertyType("cottage")}
                  className={`h-14 text-base justify-start ${propertyType === "cottage" ? "bg-hero-gradient text-white border-transparent hover:text-black" : ""}`}
                >
                  <TreePine className="w-5 h-5 mr-2" />
                  Fritidshus
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPropertyType("plot")}
                  className={`h-14 text-base justify-start ${propertyType === "plot" ? "bg-hero-gradient text-white border-transparent hover:text-black" : ""}`}
                >
                  <Square className="w-5 h-5 mr-2" />
                  Tomt
                </Button>
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Prisintervall</h3>
                <div className="text-sm text-muted-foreground">
                  {formatPrice(priceRange[0])} - {priceRange[1] >= 20000000 ? '20+ milj kr' : formatPrice(priceRange[1])}
                </div>
              </div>
              <Slider
                min={0}
                max={20000000}
                step={100000}
                value={priceRange}
                onValueChange={setPriceRange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 kr</span>
                <span>20+ milj kr</span>
              </div>
            </div>

            {/* Area Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Yta</h3>
                <div className="text-sm text-muted-foreground">
                  {areaRange[0]} kvm - {areaRange[1] >= 200 ? '200+ kvm' : `${areaRange[1]} kvm`}
                </div>
              </div>
              <Slider
                min={0}
                max={200}
                step={5}
                value={areaRange}
                onValueChange={setAreaRange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 kvm</span>
                <span>200+ kvm</span>
              </div>
            </div>

            {/* Room Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Antal rum</h3>
                <div className="text-sm text-muted-foreground">
                  {roomRange[0]} rum - {roomRange[1] >= 7 ? '7+ rum' : `${roomRange[1]} rum`}
                </div>
              </div>
              <Slider
                min={0}
                max={7}
                step={1}
                value={roomRange}
                onValueChange={setRoomRange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 rum</span>
                <span>7+ rum</span>
              </div>
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