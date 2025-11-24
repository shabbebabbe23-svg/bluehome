import { useState, useEffect } from "react";
import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Grid3x3, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
import storgatan1 from "@/assets/storgatan-1.jpg";
import storgatan2 from "@/assets/storgatan-2.jpg";
import logo1 from "@/assets/logo-1.svg";
import logo2 from "@/assets/logo-2.svg";
import logo3 from "@/assets/logo-3.svg";
import logo4 from "@/assets/logo-4.svg";
import logo5 from "@/assets/logo-5.svg";
import logo6 from "@/assets/logo-6.svg";
import logo7 from "@/assets/logo-7.svg";
import logo8 from "@/assets/logo-8.svg";
import logo9 from "@/assets/logo-9.svg";
import logo10 from "@/assets/logo-10.svg";
import logo11 from "@/assets/logo-11.svg";
import logo12 from "@/assets/logo-12.svg";
import logo13 from "@/assets/logo-13.svg";
import logo14 from "@/assets/logo-14.svg";
import logo15 from "@/assets/logo-15.svg";
import logo16 from "@/assets/logo-16.svg";
import logo17 from "@/assets/logo-17.svg";
import logo18 from "@/assets/logo-18.svg";

interface PropertyGridProps {
  showFinalPrices?: boolean;
  propertyType?: string;
  searchAddress?: string;
}

export interface Property {
  id: string | number;
  title: string;
  price: string;
  priceValue: number;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  fee: number;
  viewingDate: Date;
  image: string;
  hoverImage: string;
  type: string;
  isNew: boolean;
  vendorLogo: string;
  isSold?: boolean;
  soldDate?: Date | string;
  hasVR?: boolean;
  description?: string;
  sold_price?: number;
  new_price?: number;
  is_manual_price_change?: boolean;
  agent_name?: string;
  agent_avatar?: string;
  agent_phone?: string;
  agent_email?: string;
  agent_agency?: string;
  agent_id?: string;
  createdAt?: Date;
}

export const allProperties: Property[] = [
    {
      id: "1",
      title: "Modern lägenhet i city",
      price: "3 200 000 kr",
      priceValue: 3200000,
      location: "Södermalm, Stockholm",
      address: "Götgatan 45",
      bedrooms: 2,
      bathrooms: 1,
      area: 75,
      fee: 3500,
      viewingDate: new Date("2024-10-15"),
      image: property1,
      hoverImage: property2,
      type: "Lägenhet",
      isNew: true,
      vendorLogo: logo1,
      hasVR: true,
      description: "Ljus och modern lägenhet i hjärtat av Södermalm med högt i tak och stora fönster. Nyrenoverat kök och badrum med exklusiva materialval.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 2,
      title: "Charmig svensk villa",
      price: "4 800 000 kr",
      priceValue: 4800000,
      location: "Djursholm, Stockholm",
      address: "Vendevägen 12",
      bedrooms: 4,
      bathrooms: 2,
      area: 150,
      fee: 0,
      viewingDate: new Date("2024-10-16"),
      image: property2,
      hoverImage: property3,
      type: "Villa",
      isNew: false,
      vendorLogo: logo2,
      description: "Charmig villa i klassisk stil med vacker trädgård och generösa gemensamma ytor. Perfekt för familjen som söker lugn och närhet till natur.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 3,
      title: "Modernt radhus",
      price: "2 900 000 kr",
      priceValue: 2900000,
      location: "Vasastan, Stockholm",
      address: "Odengatan 78",
      bedrooms: 3,
      bathrooms: 2,
      area: 110,
      fee: 2800,
      viewingDate: new Date("2024-10-14"),
      image: property3,
      hoverImage: property4,
      type: "Radhus",
      isNew: true,
      vendorLogo: logo3,
      description: "Modernt radhus med smart planlösning och egen uteplats. Nära till kommunikationer och stadens alla bekvämligheter.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 4,
      title: "Lyxig takvåning",
      price: "8 500 000 kr",
      priceValue: 8500000,
      location: "Östermalm, Stockholm",
      address: "Strandvägen 23",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      fee: 5200,
      viewingDate: new Date("2024-10-18"),
      image: property4,
      hoverImage: property5,
      type: "Lägenhet",
      isNew: false,
      vendorLogo: logo4,
      hasVR: true,
      description: "Exklusiv takvåning med fantastisk utsikt över vattnet. Stor takterrass och högklassigt kök från Miele. Lyxigt boende i stadens finaste läge.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 5,
      title: "Familjehus",
      price: "5 200 000 kr",
      priceValue: 5200000,
      location: "Lidingö, Stockholm",
      address: "Kyrkviken 8",
      bedrooms: 5,
      bathrooms: 3,
      area: 180,
      fee: 0,
      viewingDate: new Date("2024-10-17"),
      image: property5,
      hoverImage: property6,
      type: "Villa",
      isNew: false,
      vendorLogo: logo5,
      description: "Rymlig familjehus med många sovrum och badrum. Stor tomt med möjlighet till pool. Nära till skolor och förskolor.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 6,
      title: "Studioappartement",
      price: "1 800 000 kr",
      priceValue: 1800000,
      location: "Norrmalm, Stockholm",
      address: "Drottninggatan 56",
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      fee: 2100,
      viewingDate: new Date("2024-10-13"),
      image: property6,
      hoverImage: property7,
      type: "Lägenhet",
      isNew: true,
      vendorLogo: logo6,
      description: "Perfekt studioappartement för singeln eller studenten. Smidigt läge mitt i city med gångavstånd till allt.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 7,
      title: "Elegant stadslägeneht",
      price: "4 100 000 kr",
      priceValue: 4100000,
      location: "Gamla Stan, Stockholm",
      address: "Prästgatan 21",
      bedrooms: 2,
      bathrooms: 1,
      area: 85,
      fee: 3200,
      viewingDate: new Date("2024-10-19"),
      image: property7,
      hoverImage: property8,
      type: "Lägenhet",
      isNew: false,
      vendorLogo: logo7,
      description: "Elegant lägenhet i autentisk miljö med spår från 1600-talet. Synliga bjälkar och moderna bekvämligheter i perfekt harmoni.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 8,
      title: "Klassiskt radhus",
      price: "6 300 000 kr",
      priceValue: 6300000,
      location: "Bromma, Stockholm",
      address: "Åkeshovsvägen 34",
      bedrooms: 4,
      bathrooms: 3,
      area: 140,
      fee: 3900,
      viewingDate: new Date("2024-10-20"),
      image: property8,
      hoverImage: property9,
      type: "Radhus",
      isNew: true,
      vendorLogo: logo8,
      hasVR: true,
      description: "Välplanerat radhus i toppskick med stor trädgård och altan. Nära till grönområden och bra kommunikationer in till stan.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 9,
      title: "Exklusiv skogsvilla",
      price: "9 200 000 kr",
      priceValue: 9200000,
      location: "Nacka, Stockholm",
      address: "Skogsbacken 7",
      bedrooms: 5,
      bathrooms: 4,
      area: 220,
      fee: 0,
      viewingDate: new Date("2024-10-12"),
      image: property9,
      hoverImage: property10,
      type: "Villa",
      isNew: false,
      vendorLogo: logo9,
      description: "Arkitektritad villa omgiven av skog med panoramafönster och exklusiva materialval. Privat och naturnära boende i lugnt område.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 10,
      title: "Sjönära lägenhet",
      price: "7 800 000 kr",
      priceValue: 7800000,
      location: "Strandvägen, Stockholm",
      address: "Strandvägen 89",
      bedrooms: 3,
      bathrooms: 2,
      area: 130,
      fee: 4500,
      viewingDate: new Date("2024-10-21"),
      image: property10,
      hoverImage: property1,
      type: "Lägenhet",
      isNew: true,
      vendorLogo: logo10,
      hasVR: true,
      description: "Elegant lägenhet med öppen planlösning och utsikt över vattnet. Balkong i västerläge och klassiska sekelskiftesdetaljer.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: "storgatan",
      title: "Storgatan",
      price: "5 400 000 kr",
      priceValue: 5400000,
      location: "Vasastan, Stockholm",
      address: "Storgatan 15",
      bedrooms: 3,
      bathrooms: 2,
      area: 95,
      fee: 4200,
      viewingDate: new Date("2024-10-22"),
      image: storgatan1,
      hoverImage: storgatan2,
      type: "Lägenhet",
      isNew: true,
      vendorLogo: logo11,
      hasVR: true,
      description: "Stor och ljus lägenhet på Storgatan med högt i tak och vackra originaldetaljer. Modernt kök och fräscha badrum.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 11,
      title: "Penthouse med takterrass",
      price: "12 500 000 kr",
      priceValue: 12500000,
      location: "Östermalm, Stockholm",
      address: "Karlavägen 56",
      bedrooms: 4,
      bathrooms: 3,
      area: 165,
      fee: 6800,
      viewingDate: new Date("2024-10-22"),
      image: property3,
      hoverImage: property5,
      type: "Lägenhet",
      isNew: true,
      vendorLogo: logo11,
      description: "Spektakulär penthouse med privat takterrass på över 100 kvm. Hiss direkt in i lägenheten och utsikt i alla väderstreck.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 12,
      title: "Lantlig gård",
      price: "6 900 000 kr",
      priceValue: 6900000,
      location: "Ekerö, Stockholm",
      address: "Lantvägen 3",
      bedrooms: 6,
      bathrooms: 3,
      area: 240,
      fee: 0,
      viewingDate: new Date("2024-10-23"),
      image: property7,
      hoverImage: property9,
      type: "Villa",
      isNew: false,
      vendorLogo: logo12,
      description: "Charmig lantgård med ursprungliga detaljer bevarade. Stor tomt med ekonomibyggnader och vacker trädgård. Lantliv nära stan.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 13,
      title: "Moderne bostadsrätt",
      price: "3 600 000 kr",
      priceValue: 3600000,
      location: "Kungsholmen, Stockholm",
      address: "Hantverkargatan 82",
      bedrooms: 2,
      bathrooms: 1,
      area: 68,
      fee: 3100,
      viewingDate: new Date("2024-10-24"),
      image: property4,
      hoverImage: property8,
      type: "Lägenhet",
      isNew: true,
      vendorLogo: logo13,
      description: "Modern bostadsrätt med smart planlösning och fräsch stil. Balkong i söderläge och nära till Kungsholmens alla restauranger.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 14,
      title: "Strandnära villa",
      price: "11 200 000 kr",
      priceValue: 11200000,
      location: "Saltsjöbaden, Stockholm",
      address: "Strandpromenaden 15",
      bedrooms: 5,
      bathrooms: 4,
      area: 200,
      fee: 0,
      viewingDate: new Date("2024-10-25"),
      image: property6,
      hoverImage: property2,
      type: "Villa",
      isNew: false,
      vendorLogo: logo14,
      description: "Magnifik strandvilla med egen brygga och badplats. Öppen planlösning med stora glaspartier mot havet. Drömboende vid vattnet.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 15,
      title: "Centralt parhus",
      price: "4 500 000 kr",
      priceValue: 4500000,
      location: "Hägersten, Stockholm",
      address: "Fruängsgatan 44",
      bedrooms: 3,
      bathrooms: 2,
      area: 95,
      fee: 2600,
      viewingDate: new Date("2024-10-26"),
      image: property1,
      hoverImage: property6,
      type: "Radhus",
      isNew: true,
      vendorLogo: logo15,
      description: "Mysigt parhus i barnvänligt område. Egen trädgård och carport. Perfekt för den som söker villaboende med lägenhetsbekvämlighet.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 16,
      title: "Designervilla",
      price: "15 800 000 kr",
      priceValue: 15800000,
      location: "Danderyd, Stockholm",
      address: "Mörbyvägen 88",
      bedrooms: 6,
      bathrooms: 5,
      area: 280,
      fee: 0,
      viewingDate: new Date("2024-10-27"),
      image: property8,
      hoverImage: property4,
      type: "Villa",
      isNew: true,
      vendorLogo: logo16,
      description: "Nybyggd designervilla av erkänd arkitekt. Toppmoderna installationer, hög teknisk standard och exklusiva material genomgående.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 17,
      title: "Kompakt ettan",
      price: "2 100 000 kr",
      priceValue: 2100000,
      location: "Farsta, Stockholm",
      address: "Farstaplan 7",
      bedrooms: 1,
      bathrooms: 1,
      area: 38,
      fee: 1900,
      viewingDate: new Date("2024-10-28"),
      image: property5,
      hoverImage: property10,
      type: "Lägenhet",
      isNew: false,
      vendorLogo: logo17,
      description: "Kompakt ettrummare med bra planlösning. Nära till tunnelbana och köpcentrum. Bra investeringsobjekt eller första boende.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
    {
      id: 18,
      title: "Skärgårdshus",
      price: "8 900 000 kr",
      priceValue: 8900000,
      location: "Vaxholm, Stockholm",
      address: "Skärgårdsvägen 22",
      bedrooms: 4,
      bathrooms: 3,
      area: 170,
      fee: 0,
      viewingDate: new Date("2024-10-29"),
      image: property9,
      hoverImage: property3,
      type: "Villa",
      isNew: false,
      vendorLogo: logo18,
      description: "Idylliskt skärgårdshus med sjöutsikt och egen strand. Stor altan och utomhusdusch. Perfekt för sommarsemestern och året-runt-boende.",
      agent_name: "Shahab Barani",
      agent_avatar: "https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/09940ee3-5c89-49d8-9e1b-337bc6dff9e0/09940ee3-5c89-49d8-9e1b-337bc6dff9e0-0.2970299851187287.jpeg",
      agent_agency: "Täbys Estate",
      agent_phone: "070-123 45 67",
      agent_id: "agent-1",
    },
  ];

export const soldProperties: Property[] = [
    {
      id: 101,
      title: "Såld villa i Danderyd",
      price: "8 750 000 kr",
      priceValue: 8750000,
      location: "Danderyd, Stockholm",
      address: "Enebyvägen 22",
      bedrooms: 5,
      bathrooms: 3,
      area: 185,
      fee: 0,
      viewingDate: new Date("2024-09-20"),
      image: property1,
      hoverImage: property2,
      type: "Villa",
      isNew: false,
      isSold: true,
      soldDate: new Date("2024-10-02"),
      vendorLogo: logo1,
      description: "Vacker villa i attraktivt läge som såldes snabbt till ett konkurrenskraftigt pris. Renoverad och i utmärkt skick.",
      sold_price: 9250000,
    },
    {
      id: 102,
      title: "Såld lägenhet Södermalm",
      price: "4 200 000 kr",
      priceValue: 4200000,
      location: "Södermalm, Stockholm",
      address: "Folkungagatan 88",
      bedrooms: 3,
      bathrooms: 1,
      area: 82,
      fee: 3800,
      viewingDate: new Date("2024-09-18"),
      image: property3,
      hoverImage: property4,
      type: "Lägenhet",
      isNew: false,
      isSold: true,
      soldDate: new Date("2024-09-28"),
      vendorLogo: logo2,
      description: "Eftertraktad lägenhet i populärt område. Många intressenter och snabb försäljning över utgångspris.",
      sold_price: 4650000,
    },
    {
      id: 103,
      title: "Såld radhus Bromma",
      price: "6 950 000 kr",
      priceValue: 6950000,
      location: "Bromma, Stockholm",
      address: "Ulvsundavägen 12",
      bedrooms: 4,
      bathrooms: 2,
      area: 135,
      fee: 3200,
      viewingDate: new Date("2024-09-15"),
      image: property5,
      hoverImage: property6,
      type: "Radhus",
      isNew: false,
      isSold: true,
      soldDate: new Date("2024-09-25"),
      vendorLogo: logo3,
      description: "Attraktivt radhus som såldes efter budgivning. Perfekt läge nära skolor och grönområden lockade många familjer.",
      sold_price: 7450000,
    },
    {
      id: 104,
      title: "Såld takvåning Östermalm",
      price: "12 300 000 kr",
      priceValue: 12300000,
      location: "Östermalm, Stockholm",
      address: "Karlavägen 92",
      bedrooms: 4,
      bathrooms: 3,
      area: 145,
      fee: 7200,
      viewingDate: new Date("2024-09-12"),
      image: property7,
      hoverImage: property8,
      type: "Lägenhet",
      isNew: false,
      isSold: true,
      soldDate: new Date("2024-09-22"),
      vendorLogo: logo4,
      description: "Exklusiv takvåning som såldes till ett rekordpris. Stor takterrass och fantastisk utsikt var de stora dragplåstren.",
      sold_price: 13100000,
    },
    {
      id: 105,
      title: "Såld villa Lidingö",
      price: "9 850 000 kr",
      priceValue: 9850000,
      location: "Lidingö, Stockholm",
      address: "Käppalavägen 45",
      bedrooms: 5,
      bathrooms: 3,
      area: 195,
      fee: 0,
      viewingDate: new Date("2024-09-10"),
      image: property9,
      hoverImage: property10,
      type: "Villa",
      isNew: false,
      isSold: true,
      soldDate: new Date("2024-09-20"),
      vendorLogo: logo5,
      description: "Attraktiv familjehus på Lidingö som såldes över utgångspris. Stor tomt och nära till skolor och kommunikationer.",
      sold_price: 10500000,
    },
    {
      id: 106,
      title: "Såld lägenhet Vasastan",
      price: "3 650 000 kr",
      priceValue: 3650000,
      location: "Vasastan, Stockholm",
      address: "Upplandsgatan 34",
      bedrooms: 2,
      bathrooms: 1,
      area: 68,
      fee: 2900,
      viewingDate: new Date("2024-09-08"),
      image: property2,
      hoverImage: property1,
      type: "Lägenhet",
      isNew: false,
      isSold: true,
      soldDate: new Date("2024-09-18"),
      vendorLogo: logo6,
      description: "Charmig lägenhet i centrala Vasastan. Såldes snabbt till en nöjd köpare efter visning med stort intresse.",
      sold_price: 3850000,
    },
    {
      id: 107,
      title: "Såld villa Täby",
      price: "11 200 000 kr",
      priceValue: 11200000,
      location: "Täby, Stockholm",
      address: "Näsbyparksvägen 78",
      bedrooms: 6,
      bathrooms: 4,
      area: 220,
      fee: 0,
      viewingDate: new Date("2024-09-05"),
      image: property4,
      hoverImage: property3,
      type: "Villa",
      isNew: false,
      isSold: true,
      soldDate: new Date("2024-09-15"),
      vendorLogo: logo7,
      description: "Stor och rymlig villa i eftertraktat läge. Såldes till slutpris efter intensiv budgivning mellan flera intressenter.",
      sold_price: 12100000,
    },
    {
      id: 108,
      title: "Såld radhus Kungsholmen",
      price: "5 450 000 kr",
      priceValue: 5450000,
      location: "Kungsholmen, Stockholm",
      address: "Fleminggatan 56",
      bedrooms: 3,
      bathrooms: 2,
      area: 105,
      fee: 3500,
      viewingDate: new Date("2024-09-02"),
      image: property6,
      hoverImage: property5,
      type: "Radhus",
      isNew: false,
      isSold: true,
      soldDate: new Date("2024-09-12"),
      vendorLogo: logo8,
      description: "Populärt radhus i centrala Kungsholmen. Perfekt planlösning och centralt läge lockade många budgivare.",
      sold_price: 5950000,
    },
    {
      id: 109,
      title: "Såld lägenhet Norrmalm",
      price: "7 100 000 kr",
      priceValue: 7100000,
      location: "Norrmalm, Stockholm",
      address: "Hamngatan 12",
      bedrooms: 3,
      bathrooms: 2,
      area: 115,
      fee: 5100,
      viewingDate: new Date("2024-08-28"),
      image: property8,
      hoverImage: property7,
      type: "Lägenhet",
      isNew: false,
      isSold: true,
      soldDate: new Date("2024-09-08"),
      vendorLogo: logo9,
      description: "Representativ lägenhet mitt i city. Såldes till ett attraktivt pris till en köpare som sökte centralt boende.",
      sold_price: 7600000,
    },
    {
      id: 110,
      title: "Såld villa Saltsjöbaden",
      price: "14 500 000 kr",
      priceValue: 14500000,
      location: "Saltsjöbaden, Stockholm",
      address: "Strandvägen 88",
      bedrooms: 6,
      bathrooms: 4,
      area: 265,
      fee: 0,
      viewingDate: new Date("2024-08-25"),
      image: property10,
      hoverImage: property9,
      type: "Villa",
      isNew: false,
      isSold: true,
      soldDate: new Date("2024-09-05"),
      vendorLogo: logo10,
      description: "Drömvilla vid havet i Saltsjöbaden. Egen brygga och badstrand gjorde att försäljningen gick snabbt över utgångspris.",
      sold_price: 15800000,
    },
    {
      id: 111,
      title: "Såld lägenhet Gamla Stan",
      price: "5 900 000 kr",
      priceValue: 5900000,
      location: "Gamla Stan, Stockholm",
      address: "Stora Nygatan 18",
      bedrooms: 2,
      bathrooms: 1,
      area: 72,
      fee: 3400,
      viewingDate: new Date("2024-08-20"),
      image: property1,
      hoverImage: property3,
      type: "Lägenhet",
      isNew: false,
      isSold: true,
      soldDate: new Date("2024-08-30"),
      vendorLogo: logo11,
      description: "Autentisk Gamlastan-lägenhet med historiskt värde. Såldes till en köpare som sökte den speciella charmen.",
      sold_price: 6200000,
    },
    {
      id: 112,
      title: "Såld villa Djursholm",
      price: "16 800 000 kr",
      priceValue: 16800000,
      location: "Djursholm, Stockholm",
      address: "Djursholmsvägen 125",
      bedrooms: 7,
      bathrooms: 5,
      area: 310,
      fee: 0,
      viewingDate: new Date("2024-08-15"),
      image: property5,
      hoverImage: property8,
      type: "Villa",
      isNew: false,
      isSold: true,
      soldDate: new Date("2024-08-25"),
      vendorLogo: logo12,
      description: "Exklusiv herrgårdsliknande villa i Djursholms finaste kvarter. Såldes till rekordpris efter budgivning bland flera intressenter.",
      sold_price: 18500000,
    },
  ];

const PropertyGrid = ({ showFinalPrices = false, propertyType = "", searchAddress = "" }: PropertyGridProps) => {
  const [favorites, setFavorites] = useState<(string | number)[]>([]);
  const [showAll, setShowAll] = useState(() => {
    // Restore showAll state from sessionStorage
    const saved = sessionStorage.getItem('propertyGridShowAll');
    return saved === 'true';
  });
  const [sortBy, setSortBy] = useState<string>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dbProperties, setDbProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyBids, setPropertyBids] = useState<Record<string, boolean>>({});

  // Save showAll state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('propertyGridShowAll', showAll.toString());
  }, [showAll]);

  // Restore scroll position after properties load
  useEffect(() => {
    if (!loading) {
      const savedScroll = sessionStorage.getItem('scrollPosition');
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedScroll), left: 0, behavior: "auto" });
          sessionStorage.removeItem('scrollPosition');
        }, 100);
      }
    }
  }, [loading]);

  // Fetch properties from database
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedProperties: Property[] = data.map((prop) => ({
            id: prop.id,
            title: prop.title,
            price: `${prop.price.toLocaleString('sv-SE')} kr`,
            priceValue: prop.price,
            location: prop.location,
            address: prop.address,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            area: prop.area,
            fee: prop.fee || 0,
            viewingDate: prop.viewing_date ? new Date(prop.viewing_date) : new Date(),
            image: prop.image_url || property1,
            hoverImage: prop.hover_image_url || prop.image_url || property2,
            type: prop.type,
            isNew: false,
            vendorLogo: prop.vendor_logo_url || logo1,
            isSold: prop.is_sold || false,
            soldDate: prop.sold_date ? new Date(prop.sold_date) : undefined,
            hasVR: prop.has_vr || false,
            description: prop.description || '',
            sold_price: prop.sold_price || undefined,
            new_price: prop.new_price || undefined,
            is_manual_price_change: prop.is_manual_price_change || false,
            createdAt: new Date(prop.created_at),
          }));
          setDbProperties(formattedProperties);

          // Fetch bidding status for all properties
          const propertyIds = data.map(p => p.id);
          const { data: bidsData } = await supabase
            .from('property_bids')
            .select('property_id')
            .in('property_id', propertyIds);

          if (bidsData) {
            const bidsMap: Record<string, boolean> = {};
            propertyIds.forEach(id => {
              bidsMap[id] = bidsData.some(bid => bid.property_id === id);
            });
            setPropertyBids(bidsMap);
          }
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Preload hover images to avoid flicker when user hovers
  useEffect(() => {
    const allPropertiesWithSold = [...allProperties, ...soldProperties, ...dbProperties];
    allPropertiesWithSold.forEach((p) => {
      try {
        const img = new Image();
        img.src = p.hoverImage ?? p.image;
        // Preload vendor logo if present (SVG or image path)
        if (p.vendorLogo) {
          const logo = new Image();
          logo.src = p.vendorLogo;
        }
      } catch (e) {
        // noop - if preload fails we silently ignore
      }
    });
  }, [dbProperties]);

  const filterByType = (props: Property[]) => {
    let filtered = props;
    
    // Filter by property type
    if (propertyType) {
      // Map Hero propertyType values to PropertyGrid type values
      const typeMap: Record<string, string> = {
        "house": "Villa",
        "villa": "Radhus",
        "apartment": "Lägenhet",
        "cottage": "Fritidshus",
        "plot": "Tomt"
      };
      
      const targetType = typeMap[propertyType];
      if (targetType) {
        filtered = filtered.filter(property => property.type === targetType);
      }
    }
    
    // Filter by address search
    if (searchAddress && searchAddress.trim()) {
      const searchLower = searchAddress.toLowerCase().trim();
      filtered = filtered.filter(property => 
        property.address.toLowerCase().includes(searchLower) ||
        property.location.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  const sortProperties = (props: Property[]) => {
    const sorted = [...props];
    
    switch (sortBy) {
      case "price-high":
        return sorted.sort((a, b) => b.priceValue - a.priceValue);
      case "price-low":
        return sorted.sort((a, b) => a.priceValue - b.priceValue);
      case "area-small":
        return sorted.sort((a, b) => a.area - b.area);
      case "area-large":
        return sorted.sort((a, b) => b.area - a.area);
      case "fee-low":
        return sorted.sort((a, b) => a.fee - b.fee);
      case "viewing-earliest":
        return sorted.sort((a, b) => a.viewingDate.getTime() - b.viewingDate.getTime());
      case "address-az":
        return sorted.sort((a, b) => a.address.localeCompare(b.address));
      case "address-za":
        return sorted.sort((a, b) => b.address.localeCompare(a.address));
      case "newest":
        return sorted.sort((a, b) => {
          const aTime = a.createdAt?.getTime() || 0;
          const bTime = b.createdAt?.getTime() || 0;
          return bTime - aTime;
        });
      default:
        return sorted;
    }
  };

  const currentProperties = showFinalPrices 
    ? soldProperties 
    : [...allProperties, ...dbProperties];
  const filteredProperties = filterByType(currentProperties);
  const sortedProperties = sortProperties(filteredProperties);
  const displayedProperties = showAll ? sortedProperties : sortedProperties.slice(0, 6);

  const handleFavoriteToggle = (id: string | number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  if (loading) {
    return (
      <section className="py-8 md:py-16 px-3 sm:px-4">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Laddar fastigheter...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-3 md:py-5 px-3 sm:px-4">
      <div className="w-full">
        <div className="text-center mb-3 md:mb-4 animate-fade-in">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1.5 md:mb-2 text-foreground">
            {showFinalPrices ? "Sålda fastigheter" : "Utvalda fastigheter"}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {showFinalPrices 
              ? "Se slutpriser på nyligen sålda fastigheter" 
              : "Upptäck vårt handplockade urval av premiumfastigheter över hela Sverige"}
          </p>
        </div>

        {/* Sort Dropdown and View Toggle */}
        <div className="flex flex-col items-end gap-2 mb-3 md:mb-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[280px] bg-hero-gradient text-white border-transparent">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sortera efter" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="default">Sortera efter</SelectItem>
              <SelectItem value="newest">Senaste tillagda</SelectItem>
              <SelectItem value="price-high">Pris: Högt till lågt</SelectItem>
              <SelectItem value="price-low">Pris: Lågt till högt</SelectItem>
              <SelectItem value="area-small">Kvm: Minst till störst</SelectItem>
              <SelectItem value="area-large">Kvm: Störst till minst</SelectItem>
              <SelectItem value="fee-low">Avgift: Lägst till högst</SelectItem>
              <SelectItem value="viewing-earliest">Visning: Tidigast först</SelectItem>
              <SelectItem value="address-az">Adress: A-Ö</SelectItem>
              <SelectItem value="address-za">Adress: Ö-A</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="default"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="hidden sm:flex sm:w-auto gap-2"
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
        </div>

  <div className={viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 mb-4 md:mb-6"
          : "flex flex-col gap-2 mb-4 md:mb-6"
        }>
          {displayedProperties.map((property, index) => (
            <div
              key={property.id}
              className="animate-slide-up h-full"
              style={{ 
                animationDelay: `${index * 0.1}s`
              }}
            >
              <PropertyCard
                {...property}
                title={property.address}
                isFavorite={favorites.includes(property.id)}
                onFavoriteToggle={handleFavoriteToggle}
                isSold={property.isSold || false}
                soldPrice={property.sold_price ? `${property.sold_price.toLocaleString('sv-SE')} kr` : undefined}
                newPrice={property.new_price ? `${property.new_price.toLocaleString('sv-SE')} kr` : undefined}
                viewMode={viewMode}
                hasActiveBidding={propertyBids[property.id as string] || false}
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="hover:scale-105 hover:bg-hero-gradient hover:text-white hover:border-transparent transition-all w-full sm:w-auto"
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