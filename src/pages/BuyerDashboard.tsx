import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { swedishMunicipalities } from "@/data/swedishMunicipalities";
import { 
  Home, 
  Heart, 
  Settings, 
  MapPin, 
  Baby, 
  GraduationCap, 
  Train, 
  Trees, 
  Waves, 
  Building2, 
  Flame, 
  Car, 
  ParkingCircle, 
  DoorOpen,
  Dog,
  Bell,
  Sparkles,
  Save,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Building,
  Square,
  TreePine,
  Wheat,
  Link,
  Plug,
  Eye,
  Droplets,
  Package,
  WashingMachine,
  Mountain,
  Sun,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import loginHero from "@/assets/login-hero.jpg";

interface Property {
  id: string;
  title: string;
  address: string;
  location: string;
  price: string;
  priceValue: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  hoverImage?: string;
  type: string;
  fee?: number;
  isSold: boolean;
  isNew: boolean;
  agent_name?: string;
  agent_avatar?: string;
  agent_phone?: string;
  listedDate?: string;
  hasVR?: boolean;
  hasBalcony?: boolean;
  hasElevator?: boolean;
  constructionYear?: number;
  distance_to_water?: number;
  is_new_production?: boolean;
}

interface BuyerPreferences {
  id?: string;
  user_id: string;
  preferred_locations: string[];
  max_commute_minutes?: number;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  property_types: string[];
  wants_balcony: boolean;
  wants_elevator: boolean;
  wants_fireplace: boolean;
  wants_garden: boolean;
  wants_parking: boolean;
  wants_garage: boolean;
  wants_near_daycare: boolean;
  wants_near_school: boolean;
  wants_near_centrum: boolean;
  wants_near_public_transport: boolean;
  wants_near_nature: boolean;
  wants_near_water: boolean;
  wants_new_production: boolean;
  wants_quiet_area: boolean;
  wants_pet_friendly: boolean;
  wants_ev_charging: boolean;
  wants_storage: boolean;
  wants_laundry: boolean;
  wants_sauna: boolean;
  wants_sea_view: boolean;
  wants_south_facing: boolean;
  max_monthly_fee?: number;
  min_construction_year?: number;
  max_construction_year?: number;
  email_notifications: boolean;
  notification_frequency: string;
}

const defaultPreferences: Omit<BuyerPreferences, 'user_id'> = {
  preferred_locations: [],
  property_types: [],
  wants_balcony: false,
  wants_elevator: false,
  wants_fireplace: false,
  wants_garden: false,
  wants_parking: false,
  wants_garage: false,
  wants_near_daycare: false,
  wants_near_school: false,
  wants_near_centrum: false,
  wants_near_public_transport: false,
  wants_near_nature: false,
  wants_near_water: false,
  wants_new_production: false,
  wants_quiet_area: false,
  wants_pet_friendly: false,
  wants_ev_charging: false,
  wants_storage: false,
  wants_laundry: false,
  wants_sauna: false,
  wants_sea_view: false,
  wants_south_facing: false,
  email_notifications: true,
  notification_frequency: 'daily',
};

const PROPERTY_TYPES = [
  { value: 'Villa', label: 'Villa', icon: Home, color: 'blue' },
  { value: 'Lägenhet', label: 'Lägenhet', icon: Building, color: 'green' },
  { value: 'Radhus', label: 'Radhus', icon: Home, color: 'purple', double: true },
  { value: 'Kedjehus', label: 'Kedjehus', icon: Link, color: 'teal' },
  { value: 'Fritidshus', label: 'Fritidshus', icon: TreePine, color: 'pink' },
  { value: 'Tomt', label: 'Tomt', icon: Square, color: 'orange' },
  { value: 'Gård', label: 'Gård', icon: Wheat, color: 'amber' },
];

const FEATURE_OPTIONS = [
  // Läge & Närhet
  { key: 'wants_near_centrum', label: 'Nära centrum', icon: Building2, description: 'Centralt läge', info: 'Vi filtrerar bostäder baserat på deras adress och visar objekt som ligger i eller nära stadscentrum.' },
  { key: 'wants_near_school', label: 'Nära skola', icon: GraduationCap, description: 'Skola inom gångavstånd', info: 'Visar bostäder som har grundskolor och gymnasier inom bekvämt gångavstånd (ca 1 km).' },
  { key: 'wants_near_daycare', label: 'Nära dagis', icon: Baby, description: 'Förskola inom gångavstånd', info: 'Filtrerar efter bostäder med förskolor och dagis i närheten - perfekt för småbarnsföräldrar.' },
  { key: 'wants_near_public_transport', label: 'Kollektivtrafik', icon: Train, description: 'Buss/tåg i närheten', info: 'Visar bostäder med buss- eller tågstationer inom kort promenadavstånd (ca 500 meter).' },
  
  // Natur & Utsikt
  { key: 'wants_near_nature', label: 'Nära natur', icon: Trees, description: 'Skog eller park i närheten', info: 'Filtrerar efter bostäder med skog, parker eller grönområden i närområdet.' },
  { key: 'wants_near_water', label: 'Nära vatten', icon: Waves, description: 'Sjö eller hav i närheten', info: 'Visar endast bostäder som ligger nära sjö, hav, å eller annan vattenyta (max 1 km avstånd).' },
  { key: 'wants_sea_view', label: 'Sjöutsikt', icon: Eye, description: 'Utsikt över vatten', info: 'Filtrerar efter bostäder där mäklaren angett att det finns utsikt över vatten.' },
  { key: 'wants_quiet_area', label: 'Lugnt område', icon: Mountain, description: 'Lugnt och fridfullt', info: 'Visar bostäder i områden med lägre bullernivåer, borta från trafik och industri.' },
  
  // Utomhus & Ljus
  { key: 'wants_balcony', label: 'Balkong', icon: DoorOpen, description: 'Balkong eller uteplats', info: 'Filtrerar efter bostäder som har balkong, terrass eller uteplats.' },
  { key: 'wants_garden', label: 'Trädgård', icon: Trees, description: 'Egen trädgård', info: 'Visar bostäder med tillgång till egen trädgård eller tomt.' },
  { key: 'wants_south_facing', label: 'Söderläge', icon: Sun, description: 'Sol på balkong/uteplats', info: 'Filtrerar efter bostäder där balkong eller uteplats vetter mot söder för maximalt solljus.' },
  
  // Inomhus & Komfort
  { key: 'wants_fireplace', label: 'Öppen spis', icon: Flame, description: 'Öppen spis eller kamin', info: 'Visar bostäder som har öppen spis, braskamin eller liknande.' },
  { key: 'wants_sauna', label: 'Bastu', icon: Droplets, description: 'Bastu i bostaden/föreningen', info: 'Filtrerar efter bostäder med egen bastu eller tillgång till gemensam bastu i föreningen.' },
  { key: 'wants_elevator', label: 'Hiss', icon: Building2, description: 'Hiss i byggnaden', info: 'Visar endast lägenheter i byggnader med hiss - viktigt för tillgänglighet.' },
  
  // Parkering & Bil
  { key: 'wants_parking', label: 'Parkering', icon: ParkingCircle, description: 'Parkeringsplats', info: 'Filtrerar efter bostäder med parkeringsplats (egen eller i garage).' },
  { key: 'wants_garage', label: 'Garage', icon: Car, description: 'Garage eller carport', info: 'Visar bostäder som inkluderar garage, carport eller uppvärmt garage.' },
  { key: 'wants_ev_charging', label: 'Laddstolpe', icon: Plug, description: 'Laddning för elbil', info: 'Filtrerar efter bostäder med laddstolpe för elbil eller möjlighet att installera sådan.' },
  
  // Förvaring & Service
  { key: 'wants_storage', label: 'Förråd', icon: Package, description: 'Förrådsutrymme', info: 'Visar bostäder med förråd eller extra förvaringsutrymme.' },
  { key: 'wants_laundry', label: 'Tvättstuga', icon: WashingMachine, description: 'Gemensam tvättstuga', info: 'Filtrerar efter bostäder med tillgång till gemensam tvättstuga i föreningen.' },
  
  // Övrigt
  { key: 'wants_pet_friendly', label: 'Husdjursvänligt', icon: Dog, description: 'Tillåter husdjur', info: 'Visar bostäder där husdjur är tillåtna enligt föreningens regler.' },
  { key: 'wants_new_production', label: 'Nyproduktion', icon: Sparkles, description: 'Nybyggda bostäder', info: 'Filtrerar efter nyproducerade bostäder - helt nybyggda eller under produktion.' },
];

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const [preferences, setPreferences] = useState<BuyerPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matchingProperties, setMatchingProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [activeTab, setActiveTab] = useState("matching");
  const [matchCount, setMatchCount] = useState(0);
  const [locationInput, setLocationInput] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Filter locations based on input
  const filteredLocations = locationInput.length > 0 
    ? swedishMunicipalities
        .filter(loc => 
          loc.name.toLowerCase().includes(locationInput.toLowerCase()) ||
          loc.county.toLowerCase().includes(locationInput.toLowerCase())
        )
        .filter(loc => !preferences?.preferred_locations.includes(loc.name))
        .slice(0, 10)
    : [];

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowLocationSuggestions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const selectLocation = (locationName: string) => {
    if (!preferences) return;
    if (preferences.preferred_locations.includes(locationName)) {
      toast.error('Denna plats finns redan');
      return;
    }
    setPreferences({
      ...preferences,
      preferred_locations: [...preferences.preferred_locations, locationName],
    });
    setLocationInput("");
    setShowLocationSuggestions(false);
  };

  // Format number with spaces as thousand separators (Swedish format)
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Parse formatted number back to integer
  const parseFormattedNumber = (value: string): number | undefined => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned === '') return undefined;
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? undefined : parsed;
  };

  useEffect(() => {
    if (!user) {
      navigate("/logga-in");
      return;
    }
    
    loadPreferences();
  }, [user, navigate]);

  useEffect(() => {
    // Only fetch matching properties if user has saved preferences (has an id from database)
    if (preferences?.id) {
      fetchMatchingProperties();
    }
  }, [preferences]);

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      // Using 'as any' temporarily until migration is run and types are regenerated
      const { data, error } = await (supabase
        .from('buyer_preferences' as any)
        .select('*')
        .eq('user_id', user.id)
        .single() as any);

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        toast.error('Kunde inte ladda dina preferenser');
      }

      if (data) {
        setPreferences(data as BuyerPreferences);
      } else {
        // Create default preferences for new users (no id = not saved yet)
        setPreferences({
          ...defaultPreferences,
          user_id: user.id,
        } as BuyerPreferences);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user || !preferences) return;

    setSaving(true);
    try {
      const prefsToSave = {
        ...preferences,
        user_id: user.id,
      };

      // Using 'as any' temporarily until migration is run and types are regenerated
      const { data, error } = await (supabase
        .from('buyer_preferences' as any)
        .upsert(prefsToSave, { onConflict: 'user_id' })
        .select()
        .single() as any);

      if (error) throw error;

      // Update preferences with the returned data (including id)
      if (data) {
        setPreferences(data as BuyerPreferences);
      }

      toast.success('Dina preferenser har sparats!');
      fetchMatchingProperties();
    } catch (err) {
      console.error('Error saving preferences:', err);
      toast.error('Kunde inte spara preferenser');
    } finally {
      setSaving(false);
    }
  };

  const fetchMatchingProperties = async () => {
    // Only fetch if preferences have been saved (has id)
    if (!preferences?.id) {
      setMatchingProperties([]);
      setMatchCount(0);
      return;
    }
    
    setLoadingProperties(true);
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('is_deleted', false)
        .eq('is_sold', false)
        .order('created_at', { ascending: false });

      // Apply price filters
      if (preferences.min_price) {
        query = query.gte('price', preferences.min_price);
      }
      if (preferences.max_price) {
        query = query.lte('price', preferences.max_price);
      }

      // Apply area filters
      if (preferences.min_area) {
        query = query.gte('area', preferences.min_area);
      }
      if (preferences.max_area) {
        query = query.lte('area', preferences.max_area);
      }

      // Apply bedroom filter
      if (preferences.min_bedrooms) {
        query = query.gte('bedrooms', preferences.min_bedrooms);
      }

      // Apply property type filter
      if (preferences.property_types && preferences.property_types.length > 0) {
        query = query.in('type', preferences.property_types);
      }

      // Apply monthly fee filter
      if (preferences.max_monthly_fee) {
        query = query.lte('fee', preferences.max_monthly_fee);
      }

      // Apply construction year filter
      if (preferences.min_construction_year) {
        query = query.gte('construction_year', preferences.min_construction_year);
      }

      // Apply boolean filters
      if (preferences.wants_balcony) {
        query = query.eq('has_balcony', true);
      }
      if (preferences.wants_elevator) {
        query = query.eq('has_elevator', true);
      }
      if (preferences.wants_new_production) {
        query = query.eq('is_new_production', true);
      }
      if (preferences.wants_near_water) {
        query = query.not('distance_to_water', 'is', null);
      }

      // Apply location filter
      if (preferences.preferred_locations && preferences.preferred_locations.length > 0) {
        // Use OR filter for locations
        const locationFilters = preferences.preferred_locations.map(loc => `location.ilike.%${loc}%`).join(',');
        query = query.or(locationFilters);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      if (data) {
        // Fetch agent profiles
        const userIds = [...new Set(data.map(p => p.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, phone')
          .in('id', userIds);
        
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        const formattedProperties: Property[] = data.map((prop: any) => {
          const profile = profilesMap.get(prop.user_id);
          // Check if property was listed within the last 7 days
          const listedDate = prop.listed_date || prop.created_at;
          const isNew = listedDate ? (Date.now() - new Date(listedDate).getTime()) < 7 * 24 * 60 * 60 * 1000 : false;
          
          return {
            id: prop.id,
            title: prop.title,
            address: prop.address,
            location: prop.location,
            price: `${prop.price.toLocaleString('sv-SE')} kr`,
            priceValue: prop.price,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            area: prop.area,
            image: prop.image_url || '',
            hoverImage: prop.hover_image_url,
            type: prop.type,
            fee: prop.fee,
            isSold: prop.is_sold || false,
            isNew: isNew,
            listedDate: listedDate,
            hasVR: prop.has_vr,
            hasBalcony: prop.has_balcony,
            hasElevator: prop.has_elevator,
            constructionYear: prop.construction_year,
            distance_to_water: prop.distance_to_water,
            is_new_production: prop.is_new_production,
            agent_name: profile?.full_name,
            agent_avatar: profile?.avatar_url,
            agent_phone: profile?.phone,
          };
        });

        // Calculate match score and sort by matchScore first, then by newest
        const scoredProperties = formattedProperties.map(prop => ({
          ...prop,
          matchScore: calculateMatchScore(prop, preferences),
        })).sort((a, b) => {
          // Primary sort: matchScore descending
          if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
          }
          // Secondary sort: newest first (by listedDate)
          const dateA = a.listedDate ? new Date(a.listedDate).getTime() : 0;
          const dateB = b.listedDate ? new Date(b.listedDate).getTime() : 0;
          return dateB - dateA;
        });

        setMatchingProperties(scoredProperties);
        setMatchCount(scoredProperties.length);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      toast.error('Kunde inte hämta matchande bostäder');
    } finally {
      setLoadingProperties(false);
    }
  };

  const calculateMatchScore = (property: Property, prefs: BuyerPreferences): number => {
    let score = 0;
    let maxScore = 0;

    // Location match (high weight)
    if (prefs.preferred_locations && prefs.preferred_locations.length > 0) {
      maxScore += 30;
      if (prefs.preferred_locations.some(loc => 
        property.location.toLowerCase().includes(loc.toLowerCase())
      )) {
        score += 30;
      }
    }

    // Price match
    if (prefs.min_price || prefs.max_price) {
      maxScore += 20;
      const inRange = (!prefs.min_price || property.priceValue >= prefs.min_price) &&
                      (!prefs.max_price || property.priceValue <= prefs.max_price);
      if (inRange) score += 20;
    }

    // Property type match
    if (prefs.property_types && prefs.property_types.length > 0) {
      maxScore += 15;
      if (prefs.property_types.includes(property.type)) {
        score += 15;
      }
    }

    // Feature matches (each worth 5 points)
    if (prefs.wants_balcony) {
      maxScore += 5;
      if (property.hasBalcony) score += 5;
    }
    if (prefs.wants_elevator) {
      maxScore += 5;
      if (property.hasElevator) score += 5;
    }
    if (prefs.wants_near_water) {
      maxScore += 5;
      if (property.distance_to_water && property.distance_to_water <= 1000) score += 5;
    }
    if (prefs.wants_new_production) {
      maxScore += 5;
      if (property.is_new_production) score += 5;
    }

    // Return percentage score
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
  };

  const updatePreference = (key: keyof BuyerPreferences, value: any) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  const toggleFeature = (key: keyof BuyerPreferences) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const addLocation = () => {
    if (!locationInput.trim() || !preferences) return;
    if (preferences.preferred_locations.includes(locationInput.trim())) {
      toast.error('Denna plats finns redan');
      return;
    }
    setPreferences({
      ...preferences,
      preferred_locations: [...preferences.preferred_locations, locationInput.trim()],
    });
    setLocationInput("");
  };

  const removeLocation = (location: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      preferred_locations: preferences.preferred_locations.filter(l => l !== location),
    });
  };

  const togglePropertyType = (type: string) => {
    if (!preferences) return;
    const types = preferences.property_types || [];
    if (types.includes(type)) {
      setPreferences({
        ...preferences,
        property_types: types.filter(t => t !== type),
      });
    } else {
      setPreferences({
        ...preferences,
        property_types: [...types, type],
      });
    }
  };

  const getActivePreferencesCount = (): number => {
    if (!preferences) return 0;
    let count = 0;
    
    if (preferences.preferred_locations.length > 0) count++;
    if (preferences.property_types.length > 0) count++;
    if (preferences.min_price || preferences.max_price) count++;
    if (preferences.min_area || preferences.max_area) count++;
    if (preferences.min_bedrooms) count++;
    
    FEATURE_OPTIONS.forEach(opt => {
      if (preferences[opt.key as keyof BuyerPreferences]) count++;
    });
    
    return count;
  };

  const clearPreferences = () => {
    if (!user) return;
    setPreferences({
      ...defaultPreferences,
      user_id: user.id,
      id: preferences?.id, // Keep the id if it exists
    } as BuyerPreferences);
    toast.success('Alla preferenser har rensats');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative">
        {/* Background Image */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${loginHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
        </div>
        <div className="relative z-10">
          <Header />
          <div className="max-w-7xl mx-auto px-4 py-24">
            <div className="space-y-4">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${loginHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      </div>
      
      <div className="relative z-10">
        <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-20 sm:py-24">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[hsl(30,40%,50%)] to-[hsl(25,50%,50%)] bg-clip-text text-transparent mb-2">
            Mina önskemål
          </h1>
          <p className="text-white/90 text-xl">
            Berätta vad du söker så hittar vi bostäder som matchar dina önskemål
          </p>
        </div>

        {/* Stats Cards - Sticky */}
        <div className="sticky top-16 z-20 py-4 -mx-4 px-4 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Card className="bg-gradient-to-br from-blue-50/95 to-blue-100/95 dark:from-blue-950/95 dark:to-blue-900/95 border-blue-200 dark:border-blue-800 backdrop-blur-sm">
              <CardContent className="p-2 sm:p-4 flex items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-full bg-blue-500/20">
                  <Filter className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Aktiva filter</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">{getActivePreferencesCount()}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50/95 to-green-100/95 dark:from-green-950/95 dark:to-green-900/95 border-green-200 dark:border-green-800 backdrop-blur-sm">
              <CardContent className="p-2 sm:p-4 flex items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-full bg-green-500/20">
                  <Home className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Matchande</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{matchCount}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50/95 to-purple-100/95 dark:from-purple-950/95 dark:to-purple-900/95 border-purple-200 dark:border-purple-800 backdrop-blur-sm">
              <CardContent className="p-2 sm:p-4 flex items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-full bg-purple-500/20">
                  <Bell className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Notiser</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">
                    {preferences?.email_notifications ? 'På' : 'Av'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 sm:p-1.5 bg-white/95 dark:bg-card/95 backdrop-blur-sm">
            <TabsTrigger 
              value="matching" 
              className="flex items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-6 text-xs sm:text-lg font-semibold data-[state=active]:bg-hero-gradient data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Search className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="truncate">Matchande <span className="hidden xs:inline">bostäder </span>({matchCount})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="flex items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-6 text-xs sm:text-lg font-semibold data-[state=active]:bg-hero-gradient data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Settings className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="truncate">Mina önskemål</span>
            </TabsTrigger>
          </TabsList>

          {/* Matching Properties Tab */}
          <TabsContent value="matching" className="space-y-6">
            {loadingProperties ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-80 w-full rounded-xl" />
                ))}
              </div>
            ) : matchingProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchingProperties.map((property) => (
                  <div key={property.id} className="relative">
                    {(property as any).matchScore >= 80 && (
                      <Badge className="absolute -top-2 -right-2 z-10 bg-green-500">
                        {(property as any).matchScore}% match
                      </Badge>
                    )}
                    <PropertyCard
                      id={property.id}
                      title={property.title}
                      price={property.price}
                      location={property.location}
                      address={property.address}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      area={property.area}
                      fee={property.fee}
                      image={property.image}
                      hoverImage={property.hoverImage}
                      type={property.type}
                      isSold={property.isSold}
                      isNew={property.isNew}
                      hasVR={property.hasVR}
                      agent_name={property.agent_name}
                      agent_avatar={property.agent_avatar}
                      hasElevator={property.hasElevator}
                      hasBalcony={property.hasBalcony}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center bg-white/95 dark:bg-card/95 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-muted">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    {!preferences?.id ? "Välkommen!" : "Inga matchande bostäder"}
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    {!preferences?.id 
                      ? "Börja med att ställa in dina önskemål under 'Mina önskemål' och spara dem för att se bostäder som matchar dig."
                      : getActivePreferencesCount() === 0 
                        ? "Ställ in dina önskemål under 'Mina önskemål' för att hitta bostäder som passar dig."
                        : "Inga bostäder matchar dina nuvarande önskemål. Prova att justera dina filter."}
                  </p>
                  <Button onClick={() => setActiveTab("preferences")} className="mt-2">
                    <Settings className="w-4 h-4 mr-2" />
                    {!preferences?.id ? "Kom igång" : "Ställ in önskemål"}
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            {/* Location Preferences */}
            <Card className="bg-white/95 dark:bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Områden
                </CardTitle>
                <CardDescription>
                  Lägg till de områden eller städer där du vill bo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="T.ex. Stockholm, Göteborg, Malmö..."
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (filteredLocations.length > 0) {
                              selectLocation(filteredLocations[0].name);
                            } else if (locationInput.trim()) {
                              addLocation();
                            }
                          }
                          if (e.key === 'Escape') {
                            setLocationInput('');
                          }
                        }}
                        onFocus={() => setShowLocationSuggestions(true)}
                      />
                      {/* Autocomplete dropdown */}
                      {showLocationSuggestions && locationInput.length > 0 && filteredLocations.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredLocations.map((loc) => (
                            <button
                              key={loc.name}
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex justify-between items-center"
                              onClick={() => selectLocation(loc.name)}
                            >
                              <span className="font-medium">{loc.name}</span>
                              <span className="text-xs text-muted-foreground">{loc.county}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button onClick={addLocation} variant="outline">
                      Lägg till
                    </Button>
                  </div>
                </div>
                {preferences && preferences.preferred_locations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {preferences.preferred_locations.map((location) => (
                      <Badge
                        key={location}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => removeLocation(location)}
                      >
                        {location} ✕
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Types */}
            <Card className="bg-white/95 dark:bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-green-500" />
                  Bostadstyp
                </CardTitle>
                <CardDescription>
                  Vilken typ av bostad söker du?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {PROPERTY_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = preferences?.property_types?.includes(type.value);
                    const colorClasses = {
                      blue: { bg: 'bg-blue-500', border: 'border-blue-500', bgLight: 'bg-blue-500/10' },
                      green: { bg: 'bg-green-500', border: 'border-green-500', bgLight: 'bg-green-500/10' },
                      purple: { bg: 'bg-purple-500', border: 'border-purple-500', bgLight: 'bg-purple-500/10' },
                      teal: { bg: 'bg-teal-500', border: 'border-teal-500', bgLight: 'bg-teal-500/10' },
                      pink: { bg: 'bg-pink-500', border: 'border-pink-500', bgLight: 'bg-pink-500/10' },
                      orange: { bg: 'bg-orange-500', border: 'border-orange-500', bgLight: 'bg-orange-500/10' },
                      amber: { bg: 'bg-amber-600', border: 'border-amber-600', bgLight: 'bg-amber-600/10' },
                    };
                    const colors = colorClasses[type.color as keyof typeof colorClasses];
                    
                    return (
                      <button
                        key={type.value}
                        onClick={() => togglePropertyType(type.value)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all cursor-pointer ${
                          isSelected 
                            ? `${colors.border} ${colors.bgLight}` 
                            : 'border-muted opacity-50 hover:opacity-75'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded ${colors.bg} flex items-center justify-center`}>
                          {type.double ? (
                            <div className="flex -ml-0.5">
                              <Icon className="w-2.5 h-2.5 text-white -mr-0.5" />
                              <Icon className="w-2.5 h-2.5 text-white" />
                            </div>
                          ) : (
                            <Icon className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                        <span className="font-medium">{type.label}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Price & Size */}
            <Card className="bg-white/95 dark:bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Pris & storlek</CardTitle>
                <CardDescription>
                  Ange dina budgetramar och storlekspreferenser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Lägsta pris (kr)</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={formatNumber(preferences?.min_price)}
                      onChange={(e) => updatePreference('min_price', parseFormattedNumber(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Högsta pris (kr)</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ingen gräns"
                      value={formatNumber(preferences?.max_price)}
                      onChange={(e) => updatePreference('max_price', parseFormattedNumber(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Minsta yta (m²)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={preferences?.min_area || ''}
                      onChange={(e) => updatePreference('min_area', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Största yta (m²)</Label>
                    <Input
                      type="number"
                      placeholder="Ingen gräns"
                      value={preferences?.max_area || ''}
                      onChange={(e) => updatePreference('max_area', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Minst antal rum</Label>
                    <Select
                      value={preferences?.min_bedrooms?.toString() || ''}
                      onValueChange={(value) => updatePreference('min_bedrooms', value ? parseInt(value) : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Välj antal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 rum</SelectItem>
                        <SelectItem value="2">2 rum</SelectItem>
                        <SelectItem value="3">3 rum</SelectItem>
                        <SelectItem value="4">4 rum</SelectItem>
                        <SelectItem value="5">5+ rum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max månadsavgift (kr)</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ingen gräns"
                      value={formatNumber(preferences?.max_monthly_fee)}
                      onChange={(e) => updatePreference('max_monthly_fee', parseFormattedNumber(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Features */}
            <Card className="bg-white/95 dark:bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Viktiga egenskaper
                </CardTitle>
                <CardDescription>
                  Bocka i de egenskaper som är viktiga för dig. Klicka på <Info className="w-3 h-3 inline" /> för mer information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TooltipProvider delayDuration={200}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FEATURE_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isActive = preferences?.[option.key as keyof BuyerPreferences] as boolean;
                      
                      return (
                        <div
                          key={option.key}
                          className={`
                            flex items-center gap-3 p-4 rounded-lg border-2 transition-all relative
                            ${isActive 
                              ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
                              : 'border-border hover:border-muted-foreground/50 hover:bg-accent'
                            }
                          `}
                        >
                          {/* Info button */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/80 transition-colors z-10"
                              >
                                <Info className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-sm">
                              <p>{option.info}</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {/* Clickable area for toggling */}
                          <div 
                            onClick={() => toggleFeature(option.key as keyof BuyerPreferences)}
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                          >
                            <div className={`p-2 rounded-full ${isActive ? 'bg-green-500/20' : 'bg-muted'}`}>
                              <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="flex-1 pr-6">
                              <p className={`font-medium ${isActive ? 'text-green-700 dark:text-green-400' : ''}`}>
                                {option.label}
                              </p>
                              <p className="text-xs text-muted-foreground">{option.description}</p>
                            </div>
                            <Checkbox checked={isActive} className="pointer-events-none" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TooltipProvider>
                
                {/* Clear preferences button */}
                {getActivePreferencesCount() > 0 && (
                  <div className="mt-6 pt-4 border-t flex justify-end">
                    <Button 
                      variant="destructive" 
                      onClick={clearPreferences}
                      className="w-full sm:w-auto"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Rensa alla filter ({getActivePreferencesCount()})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-white/95 dark:bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-500" />
                  Notifieringar
                </CardTitle>
                <CardDescription>
                  Få meddelanden när nya bostäder matchar dina önskemål
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">E-postnotifieringar</p>
                    <p className="text-sm text-muted-foreground">
                      Ta emot e-post om nya matchande bostäder
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.email_notifications || false}
                    onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
                  />
                </div>
                
                {preferences?.email_notifications && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Hur ofta vill du få notifieringar?</Label>
                      <Select
                        value={preferences?.notification_frequency || 'daily'}
                        onValueChange={(value) => updatePreference('notification_frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">Direkt (vid varje ny bostad)</SelectItem>
                          <SelectItem value="daily">Daglig sammanfattning</SelectItem>
                          <SelectItem value="weekly">Veckovis sammanfattning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Tip about instant notifications */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex gap-3">
                        <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-blue-700 dark:text-blue-300">Tips: Välj "Direkt" för bästa chansen!</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Genom att få notiser direkt när nya objekt läggs ut kan du kontakta mäklaren innan den officiella visningen och boka en privat visning. 
                            Detta ger dig möjlighet att lägga bud före andra spekulanter!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                onClick={savePreferences}
                disabled={saving}
                variant="premium"
                className="w-full sm:w-auto"
                size="lg"
              >
                {saving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Sparar...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Spara mina önskemål
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      </div>
    </div>
  );
};

export default BuyerDashboard;
