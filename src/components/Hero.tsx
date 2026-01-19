import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Home, Filter, Building, Building2, TreePine, Square, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import heroImage from "@/assets/hero-image.jpg";
import { filterMunicipalities } from "@/data/swedishMunicipalities";
import { supabase } from "@/integrations/supabase/client";

interface HeroProps {
  onFinalPricesChange?: (value: boolean) => void;
  onPropertyTypeChange?: (value: string) => void;
  onSearchAddressChange?: (value: string) => void;
  onSearchModeChange?: (mode: 'property' | 'agent') => void;
  onSearchSubmit?: () => void;
  onPriceRangeChange?: (value: [number, number]) => void;
  onAreaRangeChange?: (value: [number, number]) => void;
  onRoomRangeChange?: (value: [number, number]) => void;
  onNewConstructionFilterChange?: (value: 'include' | 'only' | 'exclude') => void;
  onElevatorFilterChange?: (value: boolean) => void;
  onBalconyFilterChange?: (value: boolean) => void;
  onBiddingFilterChange?: (value: boolean) => void;
  onFeeRangeChange?: (value: [number, number]) => void;
  soldWithinMonths?: number | null;
  onSoldWithinMonthsChange?: (value: number | null) => void;
  daysOnSiteFilter?: number | null;
  onDaysOnSiteFilterChange?: (value: number | null) => void;
  onFloorRangeChange?: (value: [number, number]) => void;
  onConstructionYearRangeChange?: (value: [number, number]) => void;
}

const Hero = ({ onFinalPricesChange, onPropertyTypeChange, onSearchAddressChange, onSearchModeChange, onSearchSubmit, onPriceRangeChange, onAreaRangeChange, onRoomRangeChange, onNewConstructionFilterChange, onElevatorFilterChange, onBalconyFilterChange, onBiddingFilterChange, onFeeRangeChange, soldWithinMonths, onSoldWithinMonthsChange, daysOnSiteFilter, onDaysOnSiteFilterChange, onFloorRangeChange, onConstructionYearRangeChange }: HeroProps) => {
  const [searchMode, setSearchMode] = useState<'property' | 'agent'>('property');
  const [searchLocation, setSearchLocation] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20000000]);
  const [areaRange, setAreaRange] = useState([0, 200]);
  const [roomRange, setRoomRange] = useState([0, 7]);
  const [feeRange, setFeeRange] = useState([0, 15000]);
  const [propertyType, setPropertyType] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; county: string; type: 'municipality' | 'address' | 'area'; price?: number }>>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [agentSuggestions, setAgentSuggestions] = useState<Array<{ id: string; full_name: string; agency: string | null; area: string | null }>>([]);
  const [agentHighlightedIndex, setAgentHighlightedIndex] = useState(-1);
  const [showFinalPrices, setShowFinalPrices] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [newConstructionFilter, setNewConstructionFilter] = useState<'include' | 'only' | 'exclude'>('include');
  const [hasElevator, setHasElevator] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(false);
  const [hasBidding, setHasBidding] = useState(false);
  const [floorRange, setFloorRange] = useState([0, 10]);
  const [constructionYearRange, setConstructionYearRange] = useState([1900, 2026]);
  const searchRef = useRef<HTMLDivElement>(null);

  const clearAllFilters = () => {
    setSearchLocation("");
    setPriceRange([0, 20000000]);
    setAreaRange([0, 200]);
    setRoomRange([0, 7]);
    setFeeRange([0, 15000]);
    setPropertyType("");
    setShowFinalPrices(false);
    setKeywords("");
    setNewConstructionFilter('include');
    setHasElevator(false);
    setHasBalcony(false);
    setHasBidding(false);
    setFloorRange([0, 10]);
    setConstructionYearRange([1900, 2026]);
    onSearchAddressChange?.("");
    onPropertyTypeChange?.("");
    onFinalPricesChange?.(false);
    onPriceRangeChange?.([0, 20000000]);
    onAreaRangeChange?.([0, 200]);
    onRoomRangeChange?.([0, 7]);
    onFeeRangeChange?.([0, 15000]);
    onElevatorFilterChange?.(false);
    onBalconyFilterChange?.(false);
    onBiddingFilterChange?.(false);
    onSoldWithinMonthsChange?.(null);
    onFloorRangeChange?.([0, 10]);
    onConstructionYearRangeChange?.([1900, 2026]);
  };

  // Call callbacks when filter values change
  useEffect(() => {
    onPriceRangeChange?.(priceRange as [number, number]);
  }, [priceRange, onPriceRangeChange]);

  useEffect(() => {
    onAreaRangeChange?.(areaRange as [number, number]);
  }, [areaRange, onAreaRangeChange]);

  useEffect(() => {
    onRoomRangeChange?.(roomRange as [number, number]);
  }, [roomRange, onRoomRangeChange]);

  useEffect(() => {
    onFeeRangeChange?.(feeRange as [number, number]);
  }, [feeRange, onFeeRangeChange]);

  useEffect(() => {
    onFloorRangeChange?.(floorRange as [number, number]);
  }, [floorRange, onFloorRangeChange]);

  useEffect(() => {
    onConstructionYearRangeChange?.(constructionYearRange as [number, number]);
  }, [constructionYearRange, onConstructionYearRangeChange]);

  const hasActiveFilters = searchLocation !== "" ||
    priceRange[0] !== 0 || priceRange[1] !== 20000000 ||
    areaRange[0] !== 0 || areaRange[1] !== 200 ||
    roomRange[0] !== 0 || roomRange[1] !== 7 ||
    feeRange[0] !== 0 || feeRange[1] !== 15000 ||
    floorRange[0] !== 0 || floorRange[1] !== 10 ||
    constructionYearRange[0] !== 1900 || constructionYearRange[1] !== 2026 ||
    propertyType !== "" || showFinalPrices || keywords !== "" || newConstructionFilter !== 'include' ||
    hasElevator || hasBalcony || hasBidding;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    setAgentHighlightedIndex(-1);
  }, [agentSuggestions]);

  const lastSearchRef = useRef<number>(0);

  const handleSearchChange = async (value: string) => {
    setSearchLocation(value);
    onSearchAddressChange?.(value);

    const searchId = Date.now();
    lastSearchRef.current = searchId;

    if (searchMode === 'property') {
      if (value.trim()) {
        const lowerValue = value.toLowerCase();
        const municipalitySuggestions = filterMunicipalities(value).map(m => ({ ...m, type: 'municipality' as const }));

        // Add "Inom tullarna" suggestions if relevant
        const areaSuggestions: Array<{ name: string; county: string; type: 'area' }> = [];

        if ("stockholm".includes(lowerValue) || "inom".includes(lowerValue) || "tull".includes(lowerValue)) {
          areaSuggestions.push({
            name: "Stockholm - Inom tullarna",
            county: "Stockholms län",
            type: 'area'
          });
        }

        if ("göteborg".includes(lowerValue) || "inom".includes(lowerValue) || "tull".includes(lowerValue)) {
          areaSuggestions.push({
            name: "Göteborg - Inom tullarna",
            county: "Västra Götalands län",
            type: 'area'
          });
        }

        // Fetch matching addresses from Supabase
        try {
          const { data: addressData, error } = await supabase
            .from('properties')
            .select('address, location, price')
            .ilike('address', `%${value}%`)
            .not('address', 'is', null)
            .eq('is_deleted', false)
            .limit(5);

          if (error) throw error;

          // Check if this is still the latest search
          if (lastSearchRef.current === searchId) {
            const addressSuggestions = (addressData || [])
              .filter(p => p.address) // Ensure address is not null/empty
              .map(p => ({
                name: p.address,
                county: p.location || 'Sverige', // Fallback for location
                type: 'address' as const,
                price: p.price
              }));

            // Remove duplicates (if any)
            const uniqueAddresses = addressSuggestions.filter((addr, index, self) =>
              index === self.findIndex((t) => t.name === addr.name)
            );

            const combinedSuggestions = [...areaSuggestions, ...municipalitySuggestions, ...uniqueAddresses];
            setSuggestions(combinedSuggestions);
            setShowSuggestions(combinedSuggestions.length > 0);
          }
        } catch (error) {
          console.error('Error fetching address suggestions:', error);
          // Only update if this is the latest search
          if (lastSearchRef.current === searchId) {
            const combinedSuggestions = [...areaSuggestions, ...municipalitySuggestions];
            setSuggestions(combinedSuggestions);
            setShowSuggestions(combinedSuggestions.length > 0);
          }
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      // Agent mode
      if (value.trim()) {
        try {
          // Fetch all agents
          const { data: agentRoles } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('user_type', 'maklare');

          if (agentRoles && agentRoles.length > 0) {
            const agentIds = agentRoles.map(role => role.user_id);

            const { data: agents } = await supabase
              .from('profiles')
              .select('id, full_name, agency, area')
              .in('id', agentIds)
              .or(
                `full_name.ilike.%${value}%,` +
                `agency.ilike.%${value}%,` +
                `area.ilike.%${value}%`
              )
              .limit(5);

            if (lastSearchRef.current === searchId && agents) {
              setAgentSuggestions(agents);
              setShowSuggestions(agents.length > 0);
            }
          }
        } catch (error) {
          console.error('Error fetching agent suggestions:', error);
        }
      } else {
        setAgentSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: { name: string; county: string; type: 'municipality' | 'address' | 'area' }) => {
    setSearchLocation(suggestion.name);
    onSearchAddressChange?.(suggestion.name);
    setShowSuggestions(false);
  };

  const handleAgentSuggestionClick = (agent: { id: string; full_name: string; agency: string | null; area: string | null }) => {
    setSearchLocation(agent.full_name);
    onSearchAddressChange?.(agent.full_name);
    setShowSuggestions(false);
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} milj kr`;
    }
    return `${(value / 1000).toFixed(0)} tkr`;
  };

  return (
    <section className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-24 sm:pt-32 md:pt-36 pb-6 sm:pb-8 md:pb-0">
      {/* Background Image with Overlay */}
      <div
        className="absolute bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})`, left: '-10%', top: 0, bottom: 0, width: '120%', height: '100%', position: 'absolute' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-none px-2 sm:px-4 md:px-6 text-center text-white">
        <div className="animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 md:mb-7 leading-tight mt-2 sm:mt-0">
            Hitta ditt
            <span className="block bg-hero-gradient bg-clip-text text-transparent">
              Drömhem
            </span>
          </h1>
          <p className="text-xs sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 md:mb-8 text-white/90 max-w-2xl mx-auto px-2 sm:px-4">
            Upptäck tusentals fastigheter över hela Sverige med BaraHem
          </p>
        </div>

        {/* Search Card */}
        <Card className="bg-white/85 backdrop-blur-md border-white/20 p-2.5 sm:p-4 md:p-6 lg:p-8 max-w-[980px] mx-auto transition-all duration-300 ease-out origin-top">
          <div className="space-y-2.5 sm:space-y-3 md:space-y-5">
            {/* Search Mode Toggle */}
            <div className="flex gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchMode('property');
                  onSearchModeChange?.('property');
                }}
                className={`flex-1 h-9 sm:h-12 text-xs sm:text-base font-semibold border-2 ${searchMode === 'property'
                  ? 'bg-hero-gradient text-white border-transparent hover:text-black'
                  : 'hover:border-primary'
                  }`}
              >
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Sök</span> bostad
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchMode('agent');
                  onSearchModeChange?.('agent');
                }}
                className={`flex-1 h-9 sm:h-12 text-xs sm:text-base font-semibold border-2 ${searchMode === 'agent'
                  ? 'bg-hero-gradient text-white border-transparent hover:text-black'
                  : 'hover:border-primary'
                  }`}
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Sök</span> mäklare
              </Button>
            </div>

            {/* Område Section */}
            <div>
              <h2 className="text-base sm:text-xl md:text-3xl font-bold text-foreground mb-2 sm:mb-3 md:mb-4">
                {searchMode === 'property' ? 'Område' : 'Sök mäklare'}
              </h2>
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 sm:w-6 sm:h-6 z-10" />
                <Input
                  placeholder={searchMode === 'property' ? 'Skriv område eller adress' : 'Sök på namn, byrå eller område'}
                  value={searchLocation}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (searchLocation.trim() && suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (searchMode === 'property' && showSuggestions && suggestions.length > 0) {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setHighlightedIndex(prev =>
                          prev < suggestions.length - 1 ? prev + 1 : 0
                        );
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setHighlightedIndex(prev =>
                          prev > 0 ? prev - 1 : suggestions.length - 1
                        );
                      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                        e.preventDefault();
                        handleSuggestionClick(suggestions[highlightedIndex]);
                        onSearchSubmit?.();
                      } else if (e.key === 'Enter') {
                        setShowSuggestions(false);
                        onSearchSubmit?.();
                      } else if (e.key === 'Escape') {
                        setShowSuggestions(false);
                        setHighlightedIndex(-1);
                      }
                    } else if (searchMode === 'agent' && showSuggestions && agentSuggestions.length > 0) {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setAgentHighlightedIndex(prev =>
                          prev < agentSuggestions.length - 1 ? prev + 1 : 0
                        );
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setAgentHighlightedIndex(prev =>
                          prev > 0 ? prev - 1 : agentSuggestions.length - 1
                        );
                      } else if (e.key === 'Enter' && agentHighlightedIndex >= 0) {
                        e.preventDefault();
                        handleAgentSuggestionClick(agentSuggestions[agentHighlightedIndex]);
                        onSearchSubmit?.();
                      } else if (e.key === 'Enter') {
                        setShowSuggestions(false);
                        onSearchSubmit?.();
                      } else if (e.key === 'Escape') {
                        setShowSuggestions(false);
                        setAgentHighlightedIndex(-1);
                      }
                    } else if (e.key === 'Enter') {
                      setShowSuggestions(false);
                      onSearchSubmit?.();
                    }
                  }}
                  className="pl-10 sm:pl-12 h-12 sm:h-14 md:h-16 text-base sm:text-lg md:text-xl border-2 border-primary/30 focus:border-primary min-h-[48px]"
                />

                {/* Autocomplete Suggestions */}
                {showSuggestions && searchMode === 'property' && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-border max-h-80 overflow-y-auto z-50">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.name}-${index}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-b border-border last:border-b-0 ${index === highlightedIndex ? 'bg-primary/10' : 'hover:bg-muted'
                          }`}
                      >
                        {suggestion.type === 'address' ? (
                          <Home className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : suggestion.type === 'area' ? (
                          <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{suggestion.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.type === 'address'
                              ? `${suggestion.county}${suggestion.price ? ` • ${suggestion.price.toLocaleString('sv-SE')} kr` : ''}`
                              : suggestion.type === 'area'
                                ? 'Område'
                                : suggestion.county}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Agent Suggestions */}
                {showSuggestions && searchMode === 'agent' && agentSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-border max-h-80 overflow-y-auto z-50">
                    {agentSuggestions.map((agent, index) => (
                      <button
                        key={agent.id}
                        onClick={() => handleAgentSuggestionClick(agent)}
                        onMouseEnter={() => setAgentHighlightedIndex(index)}
                        className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-b border-border last:border-b-0 ${index === agentHighlightedIndex ? 'bg-primary/10' : 'hover:bg-muted'
                          }`}
                      >
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">{agent.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {agent.agency && agent.area
                              ? `${agent.agency} • ${agent.area}`
                              : agent.agency || agent.area || 'Mäklare'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {searchMode === 'property' && (
              <>
                {/* Slutpriser Toggle */}
                <div className="flex items-center justify-end gap-2 px-1 py-1">
                  <Label htmlFor="final-prices" className="text-sm sm:text-base font-semibold text-foreground cursor-pointer">
                    Slutpriser
                  </Label>
                  <Switch
                    id="final-prices"
                    checked={showFinalPrices}
                    onCheckedChange={(value) => {
                      setShowFinalPrices(value);
                      onFinalPricesChange?.(value);
                    }}
                    className="data-[state=checked]:bg-gray-500"
                  />
                </div>

                {/* Property Type Buttons */}
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3">Bostadstyp</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPropertyType("");
                        onPropertyTypeChange?.("");
                      }}
                      className={`h-10 sm:h-12 md:h-14 text-xs sm:text-sm md:text-base font-semibold justify-start border-2 ${propertyType === "" ? "bg-hero-gradient text-white border-transparent hover:text-black" : "hover:border-primary"}`}
                    >
                      <Home className="w-[21px] h-[21px] sm:w-[25px] sm:h-[25px] mr-1 sm:mr-2" />
                      <span className="truncate">Alla typer</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPropertyType("house");
                        onPropertyTypeChange?.("house");
                      }}
                      className={`h-10 sm:h-12 md:h-14 text-xs sm:text-sm md:text-base font-semibold justify-start border-2 ${propertyType === "house" ? "bg-hero-gradient text-white border-transparent hover:text-black" : "hover:border-primary"}`}
                    >
                      <Home className="w-[21px] h-[21px] sm:w-[25px] sm:h-[25px] mr-1 sm:mr-2" />
                      Villor
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPropertyType("villa");
                        onPropertyTypeChange?.("villa");
                      }}
                      className={`h-10 sm:h-12 md:h-14 text-xs sm:text-sm md:text-base font-semibold justify-start border-2 ${propertyType === "villa" ? "bg-hero-gradient text-white border-transparent hover:text-black" : "hover:border-primary"}`}
                    >
                      <div className="flex mr-1 sm:mr-2">
                        <Home className="w-[21px] h-[21px] sm:w-[25px] sm:h-[25px] -mr-1" />
                        <Home className="w-[21px] h-[21px] sm:w-[25px] sm:h-[25px]" />
                      </div>
                      Par/Radhus
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPropertyType("apartment");
                        onPropertyTypeChange?.("apartment");
                      }}
                      className={`h-10 sm:h-12 md:h-14 text-xs sm:text-sm md:text-base font-semibold justify-start border-2 ${propertyType === "apartment" ? "bg-hero-gradient text-white border-transparent hover:text-black" : "hover:border-primary"}`}
                    >
                      <Building className="w-[21px] h-[21px] sm:w-[25px] sm:h-[25px] mr-1 sm:mr-2" />
                      Lägenheter
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPropertyType("cottage");
                        onPropertyTypeChange?.("cottage");
                      }}
                      className={`h-10 sm:h-12 md:h-14 text-xs sm:text-sm md:text-base font-semibold justify-start border-2 ${propertyType === "cottage" ? "bg-hero-gradient text-white border-transparent hover:text-black" : "hover:border-primary"}`}
                    >
                      <TreePine className="w-[21px] h-[21px] sm:w-[25px] sm:h-[25px] mr-1 sm:mr-2" />
                      Fritidshus
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPropertyType("plot");
                        onPropertyTypeChange?.("plot");
                      }}
                      className={`h-10 sm:h-12 md:h-14 text-xs sm:text-sm md:text-base font-semibold justify-start border-2 ${propertyType === "plot" ? "bg-hero-gradient text-white border-transparent hover:text-black" : "hover:border-primary"}`}
                    >
                      <Square className="w-[21px] h-[21px] sm:w-[25px] sm:h-[25px] mr-1 sm:mr-2" />
                      Tomt
                    </Button>
                  </div>
                </div>

                {/* Filter Buttons Row */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex-1 h-10 sm:h-12 md:h-14 text-sm sm:text-base font-semibold border-2 hover:border-primary"
                  >
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    {showAdvancedFilters ? "Mindre filter" : "Mer filter"}
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      className="h-10 sm:h-12 md:h-14 text-sm sm:text-base font-semibold border-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                      Rensa
                    </Button>
                  )}
                </div>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <>
                    {/* Price Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-foreground whitespace-nowrap">Pris</h3>
                        <div className="flex items-center gap-1">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={priceRange[0] === 0 ? '' : priceRange[0].toLocaleString('sv-SE')}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '')) || 0;
                              const clampedValue = Math.min(value, priceRange[1]);
                              setPriceRange([clampedValue, priceRange[1]]);
                            }}
                            placeholder="Min"
                            className="w-28 sm:w-32 h-7 text-xs font-semibold border border-primary/30 focus:border-primary text-center"
                          />
                          <span className="text-muted-foreground text-xs">-</span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={priceRange[1] >= 20000000 ? '' : priceRange[1].toLocaleString('sv-SE')}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '')) || 20000000;
                              const clampedValue = Math.max(value, priceRange[0]);
                              setPriceRange([priceRange[0], Math.min(clampedValue, 20000000)]);
                            }}
                            placeholder="Max"
                            className="w-28 sm:w-32 h-7 text-xs border border-primary/30 focus:border-primary text-center"
                          />
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
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-semibold">0 kr</span>
                        <span className="text-primary font-semibold">20+ milj</span>
                      </div>
                    </div>

                    {/* Area Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-foreground whitespace-nowrap">Yta</h3>
                        <div className="flex items-center gap-1">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={areaRange[0] === 0 ? '' : areaRange[0].toString()}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                              const clampedValue = Math.min(value, areaRange[1]);
                              setAreaRange([clampedValue, areaRange[1]]);
                            }}
                            placeholder="Min"
                            className="w-28 sm:w-32 h-7 text-xs border border-primary/30 focus:border-primary text-center"
                          />
                          <span className="text-muted-foreground text-xs">-</span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={areaRange[1] >= 200 ? '' : areaRange[1].toString()}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 200;
                              const clampedValue = Math.max(value, areaRange[0]);
                              setAreaRange([areaRange[0], Math.min(clampedValue, 200)]);
                            }}
                            placeholder="Max"
                            className="w-28 sm:w-32 h-7 text-xs border border-primary/30 focus:border-primary text-center"
                          />
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
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-semibold">0 m²</span>
                        <span className="text-primary font-semibold">200+ m²</span>
                      </div>
                    </div>

                    {/* Room Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-foreground whitespace-nowrap">Rum</h3>
                        <div className="flex items-center gap-1">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={roomRange[0] === 0 ? '' : roomRange[0].toString()}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                              const clampedValue = Math.min(value, roomRange[1]);
                              setRoomRange([clampedValue, roomRange[1]]);
                            }}
                            placeholder="Min"
                            className="w-28 sm:w-32 h-7 text-xs border border-primary/30 focus:border-primary text-center"
                          />
                          <span className="text-muted-foreground text-xs">-</span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={roomRange[1] >= 7 ? '' : roomRange[1].toString()}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 7;
                              const clampedValue = Math.max(value, roomRange[0]);
                              setRoomRange([roomRange[0], Math.min(clampedValue, 7)]);
                            }}
                            placeholder="Max"
                            className="w-28 sm:w-32 h-7 text-xs border border-primary/30 focus:border-primary text-center"
                          />
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
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-semibold">0 rum</span>
                        <span className="text-primary font-semibold">7+ rum</span>
                      </div>
                    </div>

                    {/* Elevator & Balcony Filters */}
                    <div className="space-y-3 md:space-y-4">
                      <h3 className="text-sm sm:text-base font-bold text-foreground">Objekt med</h3>
                      <div className="flex flex-wrap gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setHasElevator(!hasElevator);
                            onElevatorFilterChange?.(!hasElevator);
                          }}
                          className={`h-9 px-4 text-sm sm:text-base font-semibold border-2 rounded-full ${hasElevator ? "bg-hero-gradient text-white border-transparent hover:text-black" : "hover:border-primary"}`}
                        >
                          Hiss
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setHasBalcony(!hasBalcony);
                            onBalconyFilterChange?.(!hasBalcony);
                          }}
                          className={`h-9 px-4 text-sm sm:text-base font-semibold border-2 rounded-full ${hasBalcony ? "bg-hero-gradient text-white border-transparent hover:text-black" : "hover:border-primary"}`}
                        >
                          Balkong
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setHasBidding(!hasBidding);
                            onBiddingFilterChange?.(!hasBidding);
                          }}
                          className={`h-9 px-4 text-sm sm:text-base font-semibold border-2 rounded-full ${hasBidding ? "bg-hero-gradient text-white border-transparent hover:text-black" : "hover:border-primary"}`}
                        >
                          Pågående budgivning
                        </Button>
                      </div>
                    </div>

                    {/* Sold within time period - only shown when showFinalPrices is ON */}
                    {showFinalPrices && (
                      <div className="space-y-3">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground">Såld inom</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {[
                            { label: "1 mån", value: 1 },
                            { label: "3 mån", value: 3 },
                            { label: "6 mån", value: 6 },
                            { label: "12 mån", value: 12 },
                            { label: "Alla", value: null },
                          ].map((period) => (
                            <Button
                              key={period.label}
                              variant={soldWithinMonths === period.value ? "default" : "outline"}
                              size="sm"
                              onClick={() => onSoldWithinMonthsChange?.(period.value)}
                              className={`rounded-full px-4 h-9 text-sm sm:text-base font-semibold transition-all ${soldWithinMonths === period.value
                                ? "bg-hero-gradient text-white border-transparent shadow-md"
                                : "hover:bg-muted border-2"
                                }`}
                            >
                              {period.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fee Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-foreground whitespace-nowrap">Avgift</h3>
                        <div className="flex items-center gap-1">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={feeRange[0] === 0 ? '' : feeRange[0].toLocaleString('sv-SE')}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '')) || 0;
                              const clampedValue = Math.min(value, feeRange[1]);
                              setFeeRange([clampedValue, feeRange[1]]);
                            }}
                            placeholder="Min"
                            className="w-28 sm:w-32 h-7 text-xs border border-primary/30 focus:border-primary text-center"
                          />
                          <span className="text-muted-foreground text-xs">-</span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={feeRange[1] >= 15000 ? '' : feeRange[1].toLocaleString('sv-SE')}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '')) || 15000;
                              const clampedValue = Math.max(value, feeRange[0]);
                              setFeeRange([feeRange[0], Math.min(clampedValue, 15000)]);
                            }}
                            placeholder="Max"
                            className="w-28 sm:w-32 h-7 text-xs border border-primary/30 focus:border-primary text-center"
                          />
                        </div>
                      </div>
                      <Slider
                        min={0}
                        max={15000}
                        step={500}
                        value={feeRange}
                        onValueChange={setFeeRange}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-semibold">0 kr</span>
                        <span className="text-primary font-semibold">15k+/mån</span>
                      </div>
                    </div>

                    {/* Days on Site Filter */}
                    <div className="space-y-3">
                      <h3 className="text-sm sm:text-base font-bold text-foreground">Antal dagar på Barahem</h3>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          { label: "1 dag", value: 1 },
                          { label: "1 vecka", value: 7 },
                          { label: "1 månad", value: 30 },
                          { label: "Alla", value: null },
                        ].map((period) => (
                          <Button
                            key={period.label}
                            variant={daysOnSiteFilter === period.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => onDaysOnSiteFilterChange?.(period.value)}
                            className={`rounded-full px-4 h-9 text-sm sm:text-base font-semibold transition-all ${daysOnSiteFilter === period.value
                              ? "bg-hero-gradient text-white border-transparent shadow-md"
                              : "hover:bg-muted border-2"
                              }`}
                          >
                            {period.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* New Construction Filter */}
                    <div className="space-y-3 md:space-y-4">
                      <h3 className="text-sm sm:text-base font-bold text-foreground">Nyproduktion</h3>
                      <ToggleGroup
                        type="single"
                        value={newConstructionFilter}
                        onValueChange={(value) => {
                          if (value) {
                            setNewConstructionFilter(value as 'include' | 'only' | 'exclude');
                            onNewConstructionFilterChange?.(value as 'include' | 'only' | 'exclude');
                          }
                        }}
                        className="border border-primary/30 rounded-sm p-px bg-muted/30 inline-flex"
                      >
                        <ToggleGroupItem
                          value="include"
                          className="h-9 px-4 text-sm sm:text-base font-semibold data-[state=on]:bg-hero-gradient data-[state=on]:text-white rounded-full"
                        >
                          Inkluderar
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="only"
                          className="h-9 px-4 text-sm sm:text-base font-semibold data-[state=on]:bg-hero-gradient data-[state=on]:text-white rounded-full"
                        >
                          Endast
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="exclude"
                          className="h-9 px-4 text-sm sm:text-base font-semibold data-[state=on]:bg-hero-gradient data-[state=on]:text-white rounded-full"
                        >
                          Exkluderar
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    {/* Floor Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-foreground whitespace-nowrap">Våning</h3>
                        <div className="flex items-center gap-1">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={floorRange[0] === 0 ? '' : floorRange[0].toString()}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                              const clampedValue = Math.min(value, floorRange[1]);
                              setFloorRange([clampedValue, floorRange[1]]);
                            }}
                            placeholder="Min"
                            className="w-28 sm:w-32 h-7 text-xs border border-primary/30 focus:border-primary text-center"
                          />
                          <span className="text-muted-foreground text-xs">-</span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={floorRange[1] >= 10 ? '' : floorRange[1].toString()}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 10;
                              const clampedValue = Math.max(value, floorRange[0]);
                              setFloorRange([floorRange[0], Math.min(clampedValue, 10)]);
                            }}
                            placeholder="Max"
                            className="w-28 sm:w-32 h-7 text-xs border border-primary/30 focus:border-primary text-center"
                          />
                        </div>
                      </div>
                      <Slider
                        min={0}
                        max={10}
                        step={1}
                        value={floorRange}
                        onValueChange={setFloorRange}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-semibold">BV</span>
                        <span className="text-primary font-semibold">10+</span>
                      </div>
                    </div>

                    {/* Construction Year Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-foreground whitespace-nowrap">Byggår</h3>
                        <div className="flex items-center gap-1">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={constructionYearRange[0] === 1900 ? '' : constructionYearRange[0].toString()}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 1900;
                              const clampedValue = Math.min(Math.max(value, 1900), constructionYearRange[1]);
                              setConstructionYearRange([clampedValue, constructionYearRange[1]]);
                            }}
                            placeholder="Från"
                            className="w-28 sm:w-32 h-7 text-xs border border-primary/30 focus:border-primary text-center"
                          />
                          <span className="text-muted-foreground text-xs">-</span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={constructionYearRange[1] >= 2026 ? '' : constructionYearRange[1].toString()}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 2026;
                              const clampedValue = Math.max(value, constructionYearRange[0]);
                              setConstructionYearRange([constructionYearRange[0], Math.min(clampedValue, 2026)]);
                            }}
                            placeholder="Till"
                            className="w-28 sm:w-32 h-7 text-xs border border-primary/30 focus:border-primary text-center"
                          />
                        </div>
                      </div>
                      <Slider
                        min={1900}
                        max={2026}
                        step={1}
                        value={constructionYearRange}
                        onValueChange={setConstructionYearRange}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-semibold">1900</span>
                        <span className="text-primary font-semibold">2026</span>
                      </div>
                    </div>

                    {/* Keywords Filter */}
                    <div className="space-y-3 md:space-y-4">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground">Nyckelord</h3>
                      <Input
                        placeholder="T.ex. garage, nybyggt..."
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        className="h-12 sm:h-14 text-base sm:text-lg border-2 border-primary/30 focus:border-primary"
                      />
                    </div>


                  </>
                )}
              </>
            )}

            {/* Search Button */}
            <Button
              size="lg"
              onClick={() => onSearchSubmit?.()}
              className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold bg-hero-gradient hover:scale-[1.02] transition-transform"
            >
              {searchMode === 'property' ? 'Hitta bostäder' : 'Hitta mäklare'}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Hero;