import React from "react";
import { Heart, MapPin, Bed, Bath, Square, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface PropertyCardProps {
  id: string | number;
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
  onFavoriteToggle?: (id: string | number) => void;
  vendorLogo?: string;
  isSold?: boolean;
  listedDate?: Date | string;
  soldDate?: Date | string;
  hasVR?: boolean;
  description?: string;
  viewMode?: "grid" | "list";
  soldPrice?: string;
  newPrice?: string;
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
  isSold = false,
  listedDate,
  soldDate,
  hasVR = false,
  description,
  viewMode = "grid",
  soldPrice,
  newPrice,
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

  // Calculate days on bluehome
  const daysOnMarket = listedDate 
    ? Math.floor((now.getTime() - new Date(listedDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Save scroll position before navigating to detail page
  const handleNavigateToDetail = () => {
    sessionStorage.setItem('scrollPosition', window.scrollY.toString());
  };

  return (
  <Card className="relative group overflow-hidden bg-property shadow-property hover:shadow-property-hover transition-all duration-300 hover:-translate-y-1 animate-scale-in h-full flex flex-col">
      {/* Full-card clickable overlay (keeps favorite button above) */}
      <Link 
        to={`/fastighet/${id}`} 
        className="absolute inset-0 z-10" 
        aria-label={`Visa ${title}`}
        onClick={handleNavigateToDetail}
      />
      <div className="relative overflow-hidden">
        {/* Layered images for smooth cross-fade on hover using CSS (group-hover) */}
        <div className="w-full h-48 sm:h-52 md:h-56 lg:h-52 xl:h-56 relative">
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-100 group-hover:opacity-0 group-hover:scale-110"
          />
          <img
            src={hoverImage ?? image}
            alt={`${title} - alternativ bild`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-110"
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
        
        {/* VR Badge - Bottom Left */}
        {hasVR && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-foreground font-semibold text-xs">
            VR
          </div>
        )}
        
        {/* Overlay with badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isSold && (
            <Badge className="bg-destructive text-white">
              Såld
            </Badge>
          )}
          {isNew && !isSold && (
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

      <CardContent className="p-1.5 sm:p-2 md:p-3 flex-1 flex flex-col justify-between">
        {/* Address and price on same row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-0.5 sm:mb-1">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1">
            {title}
          </h3>
          <div className="flex flex-col items-end">
            {isSold && soldPrice ? (
              <>
                <span className="text-xs sm:text-sm md:text-base text-muted-foreground line-through whitespace-nowrap">
                  {price}
                </span>
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold bg-clip-text text-transparent bg-hero-gradient whitespace-nowrap">
                  {soldPrice}
                </span>
              </>
            ) : newPrice ? (
              <>
                <span className="text-xs sm:text-sm md:text-base text-muted-foreground line-through whitespace-nowrap">
                  {price}
                </span>
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold bg-clip-text text-transparent bg-hero-gradient whitespace-nowrap">
                  {newPrice}
                </span>
              </>
            ) : (
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-primary whitespace-nowrap">
                {price}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center text-muted-foreground mb-0.5 sm:mb-1">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
          <span className="text-xs sm:text-sm md:text-base truncate">{location}</span>
        </div>

        <div className="mb-0.5 sm:mb-1">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Bed className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-foreground">{bedrooms}</span>
                <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">rum</span>
              </div>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1">
              <Bath className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-foreground">{bathrooms}</span>
                <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground hidden sm:inline">badrum</span>
                <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground sm:hidden">bad</span>
              </div>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1">
              <Square className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-foreground">{area}</span>
                <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">m²</span>
              </div>
            </div>
          </div>

          {/* Show viewing date only for non-sold properties */}
          {!isSold && (
            <div className="flex items-center justify-end text-foreground mt-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 text-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm md:text-base text-foreground">{dayLabel}{timeLabel ? ` ${timeLabel}` : ""}</span>
            </div>
          )}
        </div>

        {/* Description - Only show in list view */}
        {viewMode === "list" && description && (
          <div className="mb-2 sm:mb-3">
            <p className="text-sm sm:text-base text-muted-foreground line-clamp-3">
              {description}
            </p>
          </div>
        )}

        <div className="mt-0.5 sm:mt-1">
          <Link to={`/fastighet/${id}`} onClick={handleNavigateToDetail}>
            <Button className="w-full bg-primary hover:bg-hero-gradient group-hover:bg-hero-gradient hover:text-white group-hover:text-white transition-colors text-xs sm:text-sm md:text-base py-1.5 sm:py-2">
              Visa detaljer
            </Button>
          </Link>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground text-center mt-0.5">
            {isSold && soldDate 
              ? `Såld ${new Date(soldDate).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" })}`
              : daysOnMarket === 0 
              ? "Ny idag" 
              : `${daysOnMarket} ${daysOnMarket === 1 ? "dag" : "dagar"} på bluehome`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;