import React, { useState, useEffect } from "react";
import { Heart, MapPin, Bed, Bath, Square, Calendar, FileSignature, User, Phone, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFavorites } from "@/hooks/useFavorites";

interface PropertyCardProps {
  id: string | number;
  title: string;
  price: string;
  location: string;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  fee?: number;
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
  hideControls?: boolean;
  hasActiveBidding?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  agent_name?: string;
  agent_avatar?: string;
  agent_phone?: string;
  agent_agency?: string;
  agent_id?: string;
  bulkSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string | number) => void;
  autoSlideImages?: boolean;
}

const PropertyCard = ({
  id,
  title,
  price,
  location,
  address,
  bedrooms,
  bathrooms,
  area,
  fee = 0,
  image,
  hoverImage,
  viewingDate,
  type,
  isNew = false,
  isFavorite: initialIsFavorite = false,
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
  hideControls = false,
  hasActiveBidding = false,
  buttonText,
  onButtonClick,
  agent_name,
  agent_avatar,
  agent_phone,
  agent_agency,
  agent_id,
  bulkSelectMode = false,
  isSelected = false,
  onSelect,
  autoSlideImages = false,
}: PropertyCardProps) => {
  const { toggleFavorite, isFavorite: isFavoriteHook } = useFavorites();
  const isFavorite = isFavoriteHook(String(id));
  
  // Auto-slide images state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [image, hoverImage].filter(Boolean) as string[];
  
  useEffect(() => {
    if (!autoSlideImages || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoSlideImages, images.length]);
  // Normalize viewing date and prepare label/time
  // Parse the date string as local time to avoid timezone issues
  const viewDate = viewingDate ? (() => {
    const dateObj = new Date(viewingDate);
    // If the date comes from database, it's in ISO format and may have timezone info
    // We want to display it in the user's local timezone
    return dateObj;
  })() : null;

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
    <Card className={`relative group overflow-hidden bg-property shadow-property hover:shadow-property-hover transition-all duration-300 hover:-translate-y-1 animate-scale-in h-full flex flex-col ${bulkSelectMode && isSelected ? 'ring-4 ring-primary' : ''}`}>
      {/* Full-card clickable overlay (keeps favorite button above) */}
      {!bulkSelectMode && (
        <Link
          to={`/fastighet/${id}`}
          className="absolute inset-0 z-10"
          aria-label={`Visa ${title}`}
          onClick={handleNavigateToDetail}
        />
      )}

      {/* Bulk select checkbox */}
      {bulkSelectMode && (
        <div
          className="absolute top-4 left-4 z-30 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(id);
          }}
        >
          <div className={`w-8 h-8 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
            ? 'bg-primary border-primary'
            : 'bg-white/90 border-border hover:border-primary'
            }`}>
            {isSelected && (
              <svg className="w-5 h-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden">
        {/* Layered images for smooth cross-fade on hover or auto-slide */}
        <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 relative">
          {autoSlideImages ? (
            // Auto-slide mode: cycle through images
            images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${title} - bild ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              />
            ))
          ) : (
            // Default hover mode
            <>
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
            </>
          )}
          {/* Image indicator dots for auto-slide */}
          {autoSlideImages && images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? 'bg-white w-3' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        {/* Agency logo area (right side, slightly offset from favorite button) */}
        {!hideControls && (
          <div className="absolute top-4 right-16 w-20 h-12 bg-white/90 rounded flex items-center justify-center text-xs text-muted-foreground shadow overflow-hidden">
            {vendorLogo ? (
              <img src={vendorLogo} alt="Mäklarlogo" className="w-full h-full object-contain p-1" />
            ) : (
              <span>Mäklarlogo</span>
            )}
          </div>
        )}

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
          {hasActiveBidding && !isSold && (
            <Badge className="bg-orange-500 text-white">
              Pågående budgivning
            </Badge>
          )}
          <Badge variant="secondary" className="bg-white/90 text-foreground">
            {type}
          </Badge>
        </div>

        {/* Favorite button */}
        {!hideControls && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white transition-colors group/heart z-20"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(String(id));
            }}
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
              className={`w-4 h-4 transition-all duration-300 ${isFavorite
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
        )}
      </div>

      <CardContent className="p-2 flex-1 flex flex-col justify-between gap-0.5">
        {/* Address and price on same row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0">
          <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1">
            {title}
          </h3>
          <div className="flex flex-col items-end">
            {isSold && soldPrice ? (
              <>
                <span className="text-xs sm:text-sm md:text-base text-muted-foreground line-through whitespace-nowrap">
                  {price}
                </span>
                <span className="text-sm sm:text-base font-bold bg-clip-text text-transparent bg-hero-gradient whitespace-nowrap">
                  {soldPrice}
                </span>
              </>
            ) : newPrice ? (
              <>
                <span className="text-xs sm:text-sm md:text-base text-muted-foreground line-through whitespace-nowrap">
                  {price}
                </span>
                <span className="text-sm sm:text-base font-bold bg-clip-text text-transparent bg-hero-gradient whitespace-nowrap">
                  {newPrice}
                </span>
              </>
            ) : (
              <div className="flex flex-col items-end">
                <span className="text-sm sm:text-base font-bold text-primary whitespace-nowrap">
                  {price}
                </span>
                {hasActiveBidding && !isSold && (
                  <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-500 font-semibold whitespace-nowrap flex items-center gap-1">
                    <FileSignature className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Pågående budgivning
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center text-muted-foreground mb-0.5 sm:mb-1">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
          <span className="text-xs sm:text-sm md:text-base truncate">
            {address ? `${address}, ${location}` : location}
          </span>
        </div>

        {/* Sold date on left side */}
        {isSold && soldDate && (
          <div className="flex items-center text-muted-foreground mb-0.5 sm:mb-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
            <span className="text-xs sm:text-sm md:text-base">
              Såld {new Date(soldDate).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        )}

        <div className="mb-0">
          <div className="flex items-center gap-2 sm:gap-3">
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

          {agent_name && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <Link
                to={`/agent/${agent_id}`}
                className="flex items-center gap-2 hover:bg-muted/30 p-2 rounded-lg transition-colors group/agent relative z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="w-10 h-10 border-2 border-border">
                  <AvatarImage src={agent_avatar} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover/agent:text-primary transition-colors truncate">
                    {agent_name}
                  </p>
                  {agent_agency && (
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Building2 className="w-3 h-3 flex-shrink-0" />
                      {agent_agency}
                    </p>
                  )}
                </div>
                {agent_phone && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 h-8 w-8 p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `tel:${agent_phone}`;
                    }}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                )}
              </Link>
            </div>
          )}

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
          {onButtonClick ? (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onButtonClick();
              }}
              className="w-full relative z-20 bg-primary hover:bg-hero-gradient group-hover:bg-hero-gradient hover:text-white group-hover:text-white transition-colors text-xs sm:text-sm md:text-base py-1.5 sm:py-2"
            >
              {buttonText || "Visa detaljer"}
            </Button>
          ) : (
            <Link to={`/fastighet/${id}`} onClick={handleNavigateToDetail}>
              <Button className="w-full bg-primary hover:bg-hero-gradient group-hover:bg-hero-gradient hover:text-white group-hover:text-white transition-colors text-xs sm:text-sm md:text-base py-1.5 sm:py-2">
                {buttonText || "Visa detaljer"}
              </Button>
            </Link>
          )}
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground text-right mt-0.5">
            {isSold && soldDate
              ? `Såld ${new Date(soldDate).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" })}`
              : `${daysOnMarket} ${daysOnMarket === 1 ? "dag" : "dagar"} på BaraHem`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;