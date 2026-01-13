import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { Card, CardContent } from "@/components/ui/card";
import { Building, MapPin, Square, Search, Filter, Grid3x3, List, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { filterMunicipalities } from "@/data/swedishMunicipalities";
import commercialHero from "@/assets/commercial-hero.jpg";
import { commercialProperties } from "@/data/commercialProperties";
const CommercialProperties = () => {
  const [selectedType, setSelectedType] = useState<string>("Alla");
  const [searchLocation, setSearchLocation] = useState("");
  const [rentRange, setRentRange] = useState([0, 100000]);
  const [areaRange, setAreaRange] = useState([0, 1000]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; county: string }>>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("default");
  const searchRef = useRef<HTMLDivElement>(null);

  const propertyTypes = ["Alla", "Kontor", "Kontorshotell", "Butik", "Lager", "Restaurang", "Industri"];

  const getFilteredProperties = () => {
    let filtered = selectedType === "Alla" ? commercialProperties : commercialProperties.filter(p => p.type === selectedType);

    // Apply sorting
    if (sortBy !== "default") {
      filtered = [...filtered].sort((a, b) => {
        const getPrice = (p: typeof a) => {
          // Extract number from string like "45 000 kr/mån"
          return parseInt(p.price.replace(/\D/g, '')) || 0;
        };
        const getArea = (p: typeof a) => {
          // Extract number from string like "450 m²"
          return parseInt(p.area.replace(/\D/g, '')) || 0;
        };

        switch (sortBy) {
          case "price-high":
            return getPrice(b) - getPrice(a);
          case "price-low":
            return getPrice(a) - getPrice(b);
          case "area-large":
            return getArea(b) - getArea(a);
          case "area-small":
            return getArea(a) - getArea(b);
          case "address-az":
            return a.location.localeCompare(b.location);
          case "address-za":
            return b.location.localeCompare(a.location);
          default:
            return 0;
        }
      });
    }

    return filtered;
  };

  const filteredProperties = getFilteredProperties();

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

  const formatRent = (value: number) => {
    return `${(value / 1000).toFixed(0)} tkr`;
  };
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${commercialHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
      </div>

      <Header />
      <main className="pt-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Building className="w-12 h-12 text-primary" />
            Kommersiella Lokaler
          </h1>
          <p className="text-slate-300 text-xl">Hitta den perfekta lokalen för ert företag</p>
        </div>

        {/* Search Card */}
        <Card className="bg-white/85 backdrop-blur-md border-white/20 p-6 md:p-8 mb-8 max-w-5xl mx-auto">
          <div className="space-y-6">
            {/* Område Section */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Område</h2>
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6 z-10" />
                <Input
                  placeholder="Skriv område eller stad"
                  value={searchLocation}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (searchLocation.trim() && suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="pl-14 h-14 text-lg border-2 border-primary/30 focus:border-primary"
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

            {/* Property Type Buttons */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">Lokaltyp</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {propertyTypes.map(type => (
                  <Button
                    key={type}
                    variant="outline"
                    onClick={() => setSelectedType(type)}
                    className={`h-14 text-lg font-semibold border-2 ${selectedType === type ? "bg-hero-gradient text-white border-transparent" : "hover:border-primary"}`}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* More Filters Button */}
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="w-full h-14 text-lg font-semibold border-2 hover:border-primary"
            >
              <Filter className="w-6 h-6 mr-2" />
              {showAdvancedFilters ? "Mindre filter" : "Mer filter"}
            </Button>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <>
                {/* Rent Filter */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground">Hyra per månad</h3>
                    <div className="text-xl md:text-2xl font-bold text-black">
                      {formatRent(rentRange[0])} - {rentRange[1] >= 100000 ? '100+ tkr' : formatRent(rentRange[1])}
                    </div>
                  </div>
                  <Slider
                    min={0}
                    max={100000}
                    step={5000}
                    value={rentRange}
                    onValueChange={setRentRange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-base text-muted-foreground font-medium">
                    <span>0 kr</span>
                    <span>100+ tkr</span>
                  </div>
                </div>

                {/* Area Filter */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground">Yta</h3>
                    <div className="text-xl md:text-2xl font-bold text-black">
                      {areaRange[0]} kvm - {areaRange[1] >= 1000 ? '1000+ kvm' : `${areaRange[1]} kvm`}
                    </div>
                  </div>
                  <Slider
                    min={0}
                    max={1000}
                    step={50}
                    value={areaRange}
                    onValueChange={setAreaRange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-base text-muted-foreground">
                    <span>0 kvm</span>
                    <span>1000+ kvm</span>
                  </div>
                </div>
              </>
            )}

            {/* Search Button */}
            <Button size="lg" className="w-full h-14 text-xl font-bold bg-primary hover:scale-[1.02] transition-transform">
              Hitta lokaler
            </Button>
          </div>
        </Card>

        {/* Main content */}
        <div className="px-3 sm:px-4 lg:px-8">
          {/* Property grid */}
          <div className="w-full">
            {/* Header with Title and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start gap-4 mb-8">
              <div className="hidden md:block" /> {/* Spacer for centering */}

              <h2 className="text-3xl font-bold text-white text-center md:pt-4">
                Våra senaste objekt
              </h2>

              <div className="flex flex-col gap-2 items-center md:items-end w-full">
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="hidden sm:flex sm:w-auto gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
                >
                  {viewMode === "grid" ? (
                    <>
                      <List className="w-4 h-4" />
                      Listvy
                    </>
                  ) : (
                    <>
                      <Grid3x3 className="w-4 h-4" />
                      Rutnätsvy
                    </>
                  )}
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] sm:w-[180px] h-10 bg-hero-gradient text-white border-transparent">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sortera efter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Sortera efter</SelectItem>
                    <SelectItem value="price-high">Hyra: Högst till lägst</SelectItem>
                    <SelectItem value="price-low">Hyra: Lägst till högst</SelectItem>
                    <SelectItem value="area-large">Yta: Störst till minst</SelectItem>
                    <SelectItem value="area-small">Yta: Minst till störst</SelectItem>
                    <SelectItem value="address-az">Område: A-Ö</SelectItem>
                    <SelectItem value="address-za">Område: Ö-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 mb-12"
              : "flex flex-col gap-2 mb-12"
            }>
              {filteredProperties.map(property => (
                <Link to={`/fastighet/${property.id}`} key={property.id} className="block h-full">
                  <Card className={`overflow-hidden hover:shadow-2xl transition-all duration-300 bg-slate-800/95 border-slate-700 scale-85 ${viewMode === "grid"
                    ? "flex flex-col h-full hover:scale-90"
                    : "flex flex-row h-auto"
                    }`}>
                    <div className={`relative bg-slate-700 ${viewMode === "grid" ? "w-full h-64" : "w-64 h-full"
                      }`}>
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-slate-900 font-semibold text-xs">
                        VR Funktion
                      </div>
                      <div className="absolute top-4 right-4 bg-black px-3 py-1 rounded-full text-white font-semibold text-sm">
                        {property.type}
                      </div>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-xl text-white mb-3">
                          {property.title}
                        </h3>
                        <div className="space-y-3 text-slate-300">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Plats</p>
                              <p className="text-white text-sm font-medium">{property.location}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Square className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Yta</p>
                              <p className="text-white text-sm font-medium">{property.area}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Building className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Månadshyra</p>
                              <p className="text-2xl font-bold text-white">{property.price}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default CommercialProperties;