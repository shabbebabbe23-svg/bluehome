import React from "react";
import { Heart, MapPin, Bed, Bath, Square, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface PropertyCardProps {
  id: number;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  hoverImage?: string;
  type: string;
  viewingDate?: Date | string;
  isNew?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: number) => void;
  vendorLogo?: string;
}

const PropertyCard = ({
  id,
  title,
  price,
  location,
  bedrooms,
  bathrooms,
  area,
  image,
  hoverImage,
  viewingDate,
  type,
  isNew = false,
  isFavorite = false,
  onFavoriteToggle,
  vendorLogo,
}: PropertyCardProps) => {
  // Normalize viewing date and prepare label/time
  const viewDate = viewingDate ? new Date(viewingDate) : null;
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const now = new Date();
  const dayLabel = viewDate ? (isSameDay(viewDate, now) ? "Idag" : viewDate.toLocaleDateString("sv-SE", { day: "numeric", month: "short" })) : "Idag";
  const timeLabel = viewDate ? viewDate.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
  <Card className="relative group overflow-hidden bg-property shadow-property hover:shadow-property-hover transition-all duration-300 hover:-translate-y-1 animate-scale-in h-full flex flex-col">
      {/* Full-card clickable overlay (keeps favorite button above) */}
      <Link to={`/fastighet/${id}`} className="absolute inset-0 z-10" aria-label={`Visa ${title}`} />
      <div className="relative overflow-hidden">
        {/* Layered images for smooth cross-fade on hover using CSS (group-hover) */}
        <div className="w-full h-56 sm:h-64 md:h-72 lg:h-64 xl:h-72 relative">
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 transform opacity-100 group-hover:opacity-0 group-hover:scale-105"
          />
          <img
            src={hoverImage ?? image}
            alt={`${title} - alternativ bild`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 transform opacity-0 group-hover:opacity-100 group-hover:scale-105"
          />
        </div>
        {/* Agency logo area (right side, slightly offset from favorite button) */}
        <div className="absolute top-4 right-16 w-20 h-12 bg-white/90 rounded flex items-center justify-center text-xs text-muted-foreground shadow overflow-hidden">
          {vendorLogo ? (
            <img src={vendorLogo} alt="Mäklarlogo" className="w-full h-full object-contain p-1" />
          ) : (
            <span>Mäklarlogo</span>
          )}
        </div>
        
        {/* Overlay with badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isNew && (
            <Badge className="bg-success text-white">
              Ny
            </Badge>
          )}
          <Badge variant="secondary" className="bg-white/90 text-foreground">
            {type}
          </Badge>
        </div>

        {/* Favorite button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 bg-white/90 hover:bg-white transition-colors group/heart z-20"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onFavoriteToggle?.(id); }}
        >
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(142 76% 36%)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${
              isFavorite 
                ? "fill-red-500 text-red-500" 
                : "text-muted-foreground group-hover/heart:fill-[url(#heart-gradient)]"
            }`}
            style={
              !isFavorite 
                ? { stroke: 'currentColor' }
                : undefined
            }
          />
        </Button>
      </div>

      <CardContent className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col justify-between">
        {/* Address and price on the same line */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
          <h3 className="font-semibold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors truncate sm:pr-4">
            {title}
          </h3>
          <span className="text-xl sm:text-xl md:text-2xl font-bold text-primary whitespace-nowrap leading-tight sm:min-w-[6rem] sm:text-right">
            {price}
          </span>
        </div>

        <div className="flex items-center text-muted-foreground mb-3 md:mb-4">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="text-sm truncate">{location}</span>
        </div>

        <div className="mb-3 md:mb-4">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
            <div className="flex items-center gap-1 sm:gap-2">
              <Bed className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg md:text-xl font-semibold text-foreground">{bedrooms}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">rum</span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Bath className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg md:text-xl font-semibold text-foreground">{bathrooms}</span>
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">badrum</span>
                <span className="text-xs sm:text-sm text-muted-foreground sm:hidden">bad</span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg md:text-xl font-semibold text-foreground">{area}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">m²</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end text-foreground mt-2">
            <Calendar className="w-4 h-4 mr-1 text-foreground flex-shrink-0" />
            <span className="text-xs sm:text-sm text-foreground">{dayLabel}{timeLabel ? ` ${timeLabel}` : ""}</span>
          </div>
        </div>

        <div className="mt-3 md:mt-4">
          <Link to={`/fastighet/${id}`}>
            <Button className="w-full bg-primary hover:bg-hero-gradient group-hover:bg-hero-gradient hover:text-white group-hover:text-white transition-colors text-sm sm:text-base">
              Visa detaljer
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;