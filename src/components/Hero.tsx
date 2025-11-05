import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Home, Filter, Building, Building2, TreePine, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import heroImage from "@/assets/hero-image.jpg";
import { filterMunicipalities } from "@/data/swedishMunicipalities";

interface HeroProps {
  onFinalPricesChange?: (value: boolean) => void;
}

const Hero = ({ onFinalPricesChange }: HeroProps) => {
  const [searchLocation, setSearchLocation] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20000000]);
  const [areaRange, setAreaRange] = useState([0, 200]);
  const [roomRange, setRoomRange] = useState([0, 7]);
  const [propertyType, setPropertyType] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; county: string }>>([]);
  const [showFinalPrices, setShowFinalPrices] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [showNewConstruction, setShowNewConstruction] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchLocation(value);
    if (value.trim()) {
      const filteredSuggestions = filterMunicipalities(value);
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (municipality: { name: string; county: string }) => {
    setSearchLocation(municipality.name);
    setShowSuggestions(false);
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} milj kr`;
    }
    return `${(value / 1000).toFixed(0)} tkr`;
  };

  return (
    <section className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-8 md:pt-0 md:pb-0">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-none px-3 sm:px-4 md:px-6 text-center text-white">
        <div className="animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
            Hitta ditt
            <span className="block bg-hero-gradient bg-clip-text text-transparent">
              Drömhem
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-12 text-white/90 max-w-2xl mx-auto px-4">
            Upptäck tusentals fastigheter över hela Sverige med Bluehome
          </p>
        </div>

        {/* Search Card */}
        <Card className="bg-white/85 backdrop-blur-md border-white/20 p-4 sm:p-6 md:p-8 lg:p-10 animate-slide-up max-w-5xl mx-auto">
          <div className="space-y-4 md:space-y-6">
            {/* Område Section */}
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Område</h2>
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 sm:w-6 sm:h-6 z-10" />
                <Input
                  placeholder="Skriv område eller adress"
                  value={searchLocation}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (searchLocation.trim() && suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="pl-11 sm:pl-14 h-12 sm:h-14 text-base sm:text-lg border-2 border-primary/30 focus:border-primary"
                />
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-border max-h-80 overflow-y-auto z-50">
                    {suggestions.map((municipality, index) => (
                      <button
                        key={`${municipality.name}-${index}`}
                        onClick={() => handleSuggestionClick(municipality)}
                        className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-b border-border last:border-b-0"
                      >
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">{municipality.name}</p>
                          <p className="text-sm text-muted-foreground">{municipality.county}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Slutpriser Toggle */}
            <div className="flex items-center justify-end gap-3 px-2 py-1.5">
              <Label htmlFor="final-prices" className="text-sm font-medium text-foreground cursor-pointer">
                Slutpriser
              </Label>
              <Switch
                id="final-prices"
                checked={showFinalPrices}
                onCheckedChange={(value) => {
                  setShowFinalPrices(value);
                  onFinalPricesChange?.(value);
                }}
                className="data-[state=checked]:bg-success"
              />
            </div>

            {/* Property Type Buttons */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 md:mb-4">Bostadstyp</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPropertyType("")}
                  className={`h-11 sm:h-14 text-sm sm:text-base justify-start ${propertyType === "" ? "bg-hero-gradient text-white border-transparent hover:text-black" : ""}`}
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="truncate">Alla typer</span>
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

            {/* More Filters Button */}
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="w-full h-11 sm:h-12 text-sm sm:text-base md:text-lg"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {showAdvancedFilters ? "Mindre filter" : "Mer filter"}
            </Button>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <>
                {/* Price Filter */}
                <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Prisintervall</h3>
                    <div className="text-base sm:text-lg md:text-xl font-bold text-black">
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
                  <div className="flex justify-between text-sm md:text-base text-muted-foreground font-medium">
                    <span>0 kr</span>
                    <span>20+ milj kr</span>
                  </div>
                </div>

                {/* Area Filter */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg md:text-xl font-semibold text-foreground">Yta</h3>
                    <div className="text-lg md:text-xl font-bold text-black">
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
                  <div className="flex justify-between text-sm md:text-base text-muted-foreground">
                    <span>0 kvm</span>
                    <span>200+ kvm</span>
                  </div>
                </div>

                {/* Room Filter */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg md:text-xl font-semibold text-foreground">Antal rum</h3>
                    <div className="text-lg md:text-xl font-bold text-black">
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
                  <div className="flex justify-between text-sm md:text-base text-muted-foreground">
                    <span>0 rum</span>
                    <span>7+ rum</span>
                  </div>
                </div>

                {/* Keywords Filter */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Nyckelord</h3>
                  <Input
                    placeholder="T.ex. balkong, garage, nybyggt..."
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="h-11 sm:h-12 text-base border-2 border-primary/30 focus:border-primary"
                  />
                </div>

                {/* New Construction Filter */}
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewConstruction(!showNewConstruction)}
                    className={`w-full h-11 sm:h-12 text-sm sm:text-base ${
                      showNewConstruction 
                        ? "bg-hero-gradient text-white border-transparent hover:text-black" 
                        : "bg-white"
                    }`}
                  >
                    Endast nyproduktion
                  </Button>
                </div>
              </>
            )}

            {/* Search Button */}
            <Button size="lg" className="w-full h-12 sm:h-14 text-base sm:text-lg bg-hero-gradient hover:scale-[1.02] transition-transform">
              Hitta bostäder
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Hero;