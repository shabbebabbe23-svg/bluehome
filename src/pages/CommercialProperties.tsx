import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Building, MapPin, Square, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { filterMunicipalities } from "@/data/swedishMunicipalities";
import commercialHero from "@/assets/commercial-hero.jpg";
import commercial1 from "@/assets/commercial-1.jpg";
import commercial2 from "@/assets/commercial-2.jpg";
import commercial3 from "@/assets/commercial-3.jpg";
import commercial4 from "@/assets/commercial-4.jpg";
import commercial5 from "@/assets/commercial-5.jpg";
import commercial6 from "@/assets/commercial-6.jpg";
const commercialProperties = [{
  id: "c1",
  title: "Modern kontorslokal i city",
  location: "Stockholm, Vasastan",
  area: "450 m²",
  price: "45 000 kr/mån",
  image: commercial1,
  type: "Kontor"
}, {
  id: "c2",
  title: "Butikslokal på Drottninggatan",
  location: "Stockholm, Centrum",
  area: "120 m²",
  price: "35 000 kr/mån",
  image: commercial2,
  type: "Butik"
}, {
  id: "c3",
  title: "Lagerhall med lastbrygga",
  location: "Göteborg, Hisingen",
  area: "800 m²",
  price: "55 000 kr/mån",
  image: commercial3,
  type: "Lager"
}, {
  id: "c4",
  title: "Restauranglokal vid Stureplan",
  location: "Stockholm, Östermalm",
  area: "200 m²",
  price: "65 000 kr/mån",
  image: commercial4,
  type: "Restaurang"
}, {
  id: "c5",
  title: "Kontorshotell med flexibla ytor",
  location: "Malmö, Västra Hamnen",
  area: "300 m²",
  price: "28 000 kr/mån",
  image: commercial5,
  type: "Kontor"
}, {
  id: "c6",
  title: "Industrilokal med verkstadsutrustning",
  location: "Uppsala, Fyrislund",
  area: "600 m²",
  price: "42 000 kr/mån",
  image: commercial6,
  type: "Industri"
}, {
  id: "c7",
  title: "Showroom i centrala läget",
  location: "Stockholm, Kungsholmen",
  area: "250 m²",
  price: "38 000 kr/mån",
  image: commercial1,
  type: "Butik"
}, {
  id: "c8",
  title: "Kontorslandskap med havsutsikt",
  location: "Göteborg, Lindholmen",
  area: "650 m²",
  price: "52 000 kr/mån",
  image: commercial2,
  type: "Kontor"
}, {
  id: "c9",
  title: "Lagerlokal nära motorväg",
  location: "Stockholm, Sollentuna",
  area: "1200 m²",
  price: "68 000 kr/mån",
  image: commercial3,
  type: "Lager"
}, {
  id: "c10",
  title: "Café och restaurang",
  location: "Malmö, Möllevången",
  area: "150 m²",
  price: "32 000 kr/mån",
  image: commercial4,
  type: "Restaurang"
}, {
  id: "c11",
  title: "Produktionslokal med overhead crane",
  location: "Linköping, Tornby",
  area: "950 m²",
  price: "58 000 kr/mån",
  image: commercial5,
  type: "Industri"
}, {
  id: "c12",
  title: "Prestigefyllt kontor i skyskrapa",
  location: "Stockholm, City",
  area: "380 m²",
  price: "72 000 kr/mån",
  image: commercial6,
  type: "Kontor"
}];
const CommercialProperties = () => {
  const [selectedType, setSelectedType] = useState<string>("Alla");
  const [searchLocation, setSearchLocation] = useState("");
  const [rentRange, setRentRange] = useState([0, 100000]);
  const [areaRange, setAreaRange] = useState([0, 1000]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; county: string }>>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const propertyTypes = ["Alla", "Kontor", "Butik", "Lager", "Restaurang", "Industri"];
  const filteredProperties = selectedType === "Alla" ? commercialProperties : commercialProperties.filter(p => p.type === selectedType);

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

        {/* Main content with side ads */}
        <div className="flex gap-12 items-start">
          {/* Left Ad Banner */}
          <AdBanner
            imageSrc={commercial1}
            alt="Kontorslösningar"
            title="Kontorslösningar"
            description="Vi hjälper dig hitta den perfekta kontorslokalen för ditt företag."
            bullets={[
              "✓ Flexibla avtal",
              "✓ Professionell service",
              "✓ Centrala lägen",
              "✓ Konkurrenskraftiga priser",
            ]}
            buttonText="Kontakta oss"
            note="Specialerbjudande för nya kunder"
          />

          {/* Property grid */}
          <div className="flex-1 grid grid-cols-1 gap-6 mb-12">
          {filteredProperties.map(property => <Card key={property.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-slate-800/95 border-slate-700 flex flex-row">
              <div className="relative w-96 flex-shrink-0 bg-slate-700">
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
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {property.title}
                  </h3>
                  <div className="space-y-3 text-slate-300 text-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Square className="w-5 h-5 text-primary" />
                      <span>{property.area}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <p className="text-3xl font-bold text-white">
                    {property.price}
                  </p>
                </div>
              </CardContent>
            </Card>)}
          </div>

          {/* Right Ad Banner */}
          <AdBanner
            imageSrc={commercial2}
            alt="Butikslokaler"
            title="Butikslokaler"
            description="Hitta den perfekta butikslokalen för din verksamhet."
            bullets={[
              "✓ Högt trafikerade lägen",
              "✓ Flexibla ytor",
              "✓ Professionellt stöd",
              "✓ Attraktiva villkor",
            ]}
            buttonText="Boka visning"
            note="Nya objekt varje vecka"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default CommercialProperties;