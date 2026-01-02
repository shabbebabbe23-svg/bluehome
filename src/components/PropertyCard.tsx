import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, MapPin, Bed, Bath, Square, Calendar, FileSignature, User, Phone, Building2, Scale, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFavorites } from "@/hooks/useFavorites";
import { useComparison } from "@/contexts/ComparisonContext";
import { toast } from "sonner";

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
  additionalImages?: string[];
  type: string;
  viewingDate?: Date | string;
  isNew?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string | number) => void;
  vendorLogo?: string;
  isSold?: boolean;
  listedDate?: Date | string;
  createdAt?: Date | string;
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
  hasElevator?: boolean;
  hasBalcony?: boolean;
  constructionYear?: number;
  operatingCost?: number;
  floor?: number;
  totalFloors?: number;
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
  additionalImages,
  viewingDate,
  type,
  isNew = false,
  isFavorite: initialIsFavorite = false,
  onFavoriteToggle,
  vendorLogo,
  isSold = false,
  listedDate,
  createdAt,
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
  hasElevator,
  hasBalcony,
  constructionYear,
  operatingCost,
  floor,
  totalFloors,
}: PropertyCardProps) => {
  const { toggleFavorite, isFavorite: isFavoriteHook } = useFavorites();
  const { toggleComparison, isInComparison, canAddMore } = useComparison();
  const isFavorite = isFavoriteHook(String(id));
  const isComparing = isInComparison(String(id));

  // Image gallery state for scrolling through images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  // Limit to first 5 images for the slider
  const allImages = [image, ...(additionalImages || [])].filter(Boolean).slice(0, 5) as string[];
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-slide images state (for carousel mode)
  const images = [image, hoverImage].filter(Boolean) as string[];

  useEffect(() => {
    if (!autoSlideImages || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoSlideImages, images.length]);

  // Handle touch events for swiping with visual feedback
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchStartX.current || !containerRef.current) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    const containerWidth = containerRef.current.offsetWidth;

    // Limit the swipe offset and add resistance at edges
    let offset = diff;
    if ((currentImageIndex === 0 && diff > 0) ||
      (currentImageIndex === allImages.length - 1 && diff < 0)) {
      offset = diff * 0.3; // Add resistance at edges
    }

    setSwipeOffset((offset / containerWidth) * 100);
  }, [currentImageIndex, allImages.length]);

  const handleTouchEnd = useCallback(() => {
    if (!containerRef.current) {
      setSwipeOffset(0);
      setIsSwiping(false);
      touchStartX.current = null;
      return;
    }

    const containerWidth = containerRef.current.offsetWidth;
    const swipeThreshold = 20; // Percentage threshold to trigger slide

    if (Math.abs(swipeOffset) > swipeThreshold) {
      if (swipeOffset < 0 && currentImageIndex < allImages.length - 1) {
        // Swipe left - next image
        setCurrentImageIndex(prev => prev + 1);
      } else if (swipeOffset > 0 && currentImageIndex > 0) {
        // Swipe right - previous image
        setCurrentImageIndex(prev => prev - 1);
      }
    }

    setSwipeOffset(0);
    setIsSwiping(false);
    touchStartX.current = null;
  }, [swipeOffset, currentImageIndex, allImages.length]);

  const goToPrevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => Math.max(0, prev - 1));
  }, []);

  const goToNextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => Math.min(allImages.length - 1, prev + 1));
  }, [allImages.length]);
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

  const truncatedListDescription = description
    ? description.length > 254
      ? `${description.slice(0, 254)}…`
      : description
    : "";

  // Calculate days on bluehome
  const toValidDate = (value?: Date | string) => {
    if (!value) return null;
    const dateObj = value instanceof Date ? value : new Date(value);
    return Number.isNaN(dateObj.getTime()) ? null : dateObj;
  };

  const daysOnMarket = (() => {
    const baseDate = toValidDate(listedDate) ?? toValidDate(createdAt);
    if (!baseDate) return null;
    const diffDays = Math.floor((now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  })();

  const daysOnMarketText = daysOnMarket === null
    ? ""
    : daysOnMarket === 0
      ? "Ny idag"
      : `${daysOnMarket} ${daysOnMarket === 1 ? "dag" : "dagar"} på BaraHem`;

  // Save scroll position before navigating to detail page
  const handleNavigateToDetail = () => {
    sessionStorage.setItem('scrollPosition', window.scrollY.toString());
  };

  // List view layout
  if (viewMode === "list") {
    return (
      <Card className={`relative group overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-300 transform-gpu hover:scale-[1.07] h-auto sm:h-[132px] md:h-[143px] w-full lg:w-[100%] mx-auto ${bulkSelectMode && isSelected ? 'ring-4 ring-primary' : ''}`}>
        {/* Full-card clickable overlay */}
        {!bulkSelectMode && (
          <Link
            to={`/fastighet/${id}`}
            className="absolute inset-0 z-10"
            aria-label={`Visa ${title}`}
            onClick={handleNavigateToDetail}
          />
        )}

        <div className="flex flex-col sm:flex-row w-full sm:h-full">
          {/* Image section */}
          <div className="relative w-full sm:w-[176px] md:w-[220px] lg:w-[220px] xl:w-[264px] h-[154px] sm:h-full flex-shrink-0 overflow-hidden">
            {/* Hover image cross-fade (same as grid view) */}
            {hoverImage ? (
              <>
                <img
                  src={image}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-100 group-hover:opacity-0 group-hover:scale-110"
                />
                <img
                  src={hoverImage}
                  alt={`${title} - alternativ bild`}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-110"
                />
              </>
            ) : (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
            )}

            {/* Property type badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-muted/90 text-foreground text-sm">
                {type}
              </Badge>
            </div>

            {/* Favorite and Compare buttons - hide for sold properties */}
            {!hideControls && !isSold && (
              <div className="absolute top-3 right-3 flex gap-1.5 z-20">
                {/* Compare button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className={`h-8 w-8 ${isComparing ? 'bg-primary' : 'bg-white/90 hover:bg-white'} transition-colors`}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isComparing && !canAddMore) {
                      toast.error('Du kan endast jämföra 2 fastigheter');
                      return;
                    }
                    toggleComparison({
                      id: String(id),
                      title,
                      price,
                      location,
                      address,
                      bedrooms,
                      bathrooms,
                      area,
                      fee,
                      image,
                      additionalImages,
                      type,
                      soldPrice,
                      newPrice,
                      isSold,
                      hasElevator,
                      hasBalcony,
                      constructionYear,
                      operatingCost,
                    });
                  }}
                  title={isComparing ? 'Ta bort från jämförelse' : 'Lägg till i jämförelse'}
                >
                  {isComparing ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Scale className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>

                {/* Favorite button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white transition-colors"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(String(id));
                  }}
                >
                  <Heart
                    className={`w-4 h-4 transition-all duration-300 ${isFavorite
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground"
                      }`}
                  />
                </Button>
              </div>
            )}
          </div>

          {/* Content section */}
          <div className="flex-1 p-2 sm:p-3 flex flex-col justify-between min-w-0 sm:h-full overflow-hidden">
            {/* Top row: Title and Price */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg sm:text-xl text-black line-clamp-2" style={{color: '#111'}}>
                  {title}
                </h3>
                <div className="flex items-center text-muted-foreground mb-0.5">
                  <MapPin className="w-3.5 h-3.5 mr-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{address}</span>
                </div>
                <div className="text-xs sm:text-sm text-primary font-medium">
                  {description
                    ? description.length > 50
                      ? description.slice(0, 50) + '…'
                      : description
                    : 'Lägenhet med en charmig touch'}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {isSold && soldPrice ? (
                  <span className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                    {soldPrice}
                  </span>
                ) : newPrice ? (
                  <span className="text-lg sm:text-xl font-bold text-primary whitespace-nowrap">
                    {newPrice}
                  </span>
                ) : (
                  <span className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                    {price}
                  </span>
                )}
              </div>
            </div>

            {/* Description - hidden on mobile */}
            <p className="hidden md:block text-base sm:text-lg text-muted-foreground mt-1 line-clamp-1 min-h-4">
              {truncatedListDescription || "\u00A0"}
            </p>

            {/* Bottom row: Details and Days on market */}
            <div className="flex items-end justify-between gap-1 mt-1.5 sm:mt-2 min-w-0">
              <div className="flex flex-1 items-center gap-1.5 sm:gap-3 text-lg sm:text-xl text-muted-foreground min-w-0 overflow-hidden flex-nowrap">
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Bed className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">{bedrooms}</span>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Bath className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">{bathrooms}</span>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">{area} m²</span>
                </div>
              </div>
              <p className="text-lg sm:text-xl font-semibold text-muted-foreground flex-shrink-0 whitespace-nowrap text-right">
                {isSold && soldDate
                  ? `Såld ${new Date(soldDate).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}`
                  : daysOnMarketText
                }
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view layout (original)
  return (
    <Card className={`relative group overflow-hidden bg-property shadow-property hover:shadow-property-hover transition-all duration-300 transform-gpu hover:-translate-y-1 hover:scale-[1.05] animate-scale-in h-full flex flex-col ${bulkSelectMode && isSelected ? 'ring-4 ring-primary' : ''}`}>
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
        {/* Layered images for smooth scrolling/swiping */}
        <div
          ref={containerRef}
          className="w-full aspect-[4/3] sm:aspect-[16/10] relative overflow-hidden"
          style={{ touchAction: 'pan-y' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {autoSlideImages ? (
            // Auto-slide mode: cycle through images
            images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${title} - bild ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
              />
            ))
          ) : allImages.length > 1 ? (
            // Scrollable gallery mode with swipe
            <>
              <div
                className="flex h-full"
                style={{
                  transform: `translateX(calc(-${currentImageIndex * 100}% + ${swipeOffset}%))`,
                  transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
                }}
              >
                {allImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${title} - bild ${index + 1}`}
                    className="w-full h-full object-cover flex-shrink-0"
                    style={{ minWidth: '100%' }}
                    draggable={false}
                  />
                ))}
              </div>

              {/* Navigation arrows re-attached */}
              {currentImageIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const prevIndex = Math.max(0, currentImageIndex - 1);
                    setCurrentImageIndex(prevIndex);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  aria-label="Föregående bild"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentImageIndex < allImages.length - 1 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const nextIndex = Math.min(allImages.length - 1, currentImageIndex + 1);
                    setCurrentImageIndex(nextIndex);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  aria-label="Nästa bild"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              {/* Image counter/dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {allImages.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/75'
                      }`}
                    aria-label={`Visa bild ${index + 1}`}
                  />
                ))}
                {allImages.length > 5 && (
                  <span className="text-white text-[10px] ml-1">+{allImages.length - 5}</span>
                )}
              </div>
            </>
          ) : (
            // Single image (original hover effect)
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
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'bg-white w-3' : 'bg-white/50'
                    }`}
                />
              ))}
            </div>
          )}
        </div>
        {/* Agency logo area (bottom right for all properties) */}
        {!hideControls && (
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-12 sm:w-20 h-8 sm:h-12 bg-white/90 rounded flex items-center justify-center text-xs text-muted-foreground shadow overflow-hidden z-10">
            {vendorLogo ? (
              <img src={vendorLogo} alt="Mäklarlogo" className="w-full h-full object-contain p-0.5 sm:p-1" />
            ) : (
              <span className="text-[8px] sm:text-xs">Mäklarlogo</span>
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
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
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

        {/* Favorite and Compare buttons - hide for sold properties */}
        {!hideControls && !isSold && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1.5 sm:gap-2 z-20">
            {/* Compare button */}
            <Button
              variant="secondary"
              size="icon"
              className={`h-8 w-8 sm:h-10 sm:w-10 ${isComparing ? 'bg-primary' : 'bg-white/90 hover:bg-white'} transition-colors`}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isComparing && !canAddMore) {
                  toast.error('Du kan endast jämföra 2 fastigheter');
                  return;
                }
                toggleComparison({
                  id: String(id),
                  title,
                  price,
                  location,
                  address,
                  bedrooms,
                  bathrooms,
                  area,
                  fee,
                  image,
                  additionalImages,
                  type,
                  soldPrice,
                  newPrice,
                  isSold,
                  hasElevator,
                  hasBalcony,
                  constructionYear,
                  operatingCost,
                });
              }}
              title={isComparing ? 'Ta bort från jämförelse' : 'Lägg till i jämförelse'}
            >
              {isComparing ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Scale className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>

            {/* Favorite button */}
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 bg-white/90 hover:bg-white transition-colors group/heart"
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
          </div>
        )}
      </div>

      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col gap-1.5 overflow-hidden">
        {/* Address and Price row */}
        <div className="flex items-start justify-between gap-2">
          {/* Left side - Address */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors truncate">
              {title}
            </h3>
            <div className="flex items-center text-muted-foreground mb-0.5">
              <MapPin className="w-3.5 h-3.5 mr-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">{address}</span>
            </div>
            {/* Dynamic subtitle text */}
            <div className="text-xs sm:text-sm text-primary font-medium">
              {description
                ? description.length > 50
                  ? description.slice(0, 50) + '…'
                  : description
                : 'Lägenhet med en charmig touch'}
            </div>
          </div>

          {/* Right side - Price */}
          <div className="flex flex-col items-end flex-shrink-0">
            {isSold && soldPrice ? (
              <>
                <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-hero-gradient whitespace-nowrap">
                  {soldPrice}
                </span>
                <span className="text-[10px] text-muted-foreground line-through whitespace-nowrap">
                  {price}
                </span>
              </>
            ) : newPrice ? (
              <>
                <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-hero-gradient whitespace-nowrap">
                  {newPrice}
                </span>
                <span className="text-[10px] text-muted-foreground line-through whitespace-nowrap">
                  {price}
                </span>
              </>
            ) : (
              <>
                <span className="text-lg sm:text-xl font-bold text-primary whitespace-nowrap">
                  {price}
                </span>
                {fee && fee > 0 && (
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {fee.toLocaleString('sv-SE')} kr/mån
                  </span>
                )}
              </>
            )}
            {hasActiveBidding && !isSold && (
              <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 flex items-center gap-0.5 mt-0.5">
                <FileSignature className="w-3 h-3" />
                Bud
              </Badge>
            )}
          </div>
        </div>

        {isSold && soldDate && (
          <div className="flex items-center text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 mr-0.5 flex-shrink-0" />
            <span className="text-[11px] sm:text-sm">
              Såld {new Date(soldDate).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5">
            <Bed className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold text-foreground">{bedrooms}</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground">rum</span>
          </div>

          <div className="flex items-center gap-0.5">
            <Bath className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold text-foreground">{bathrooms}</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:inline">bad</span>
          </div>

          <div className="flex items-center gap-0.5">
            <Square className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold text-foreground">{area}</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground">m²</span>
          </div>

          {floor && (
            <div className="flex items-center gap-0.5">
              <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold text-foreground">
                {floor}{totalFloors ? `/${totalFloors}` : ''}
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">vån</span>
            </div>
          )}
        </div>

        {agent_name && (
          <div className="mt-1 pt-1 border-t border-border/50">
            <Link
              to={`/agent/${agent_id}`}
              className="flex items-center gap-1.5 hover:bg-muted/30 p-1 rounded transition-colors group/agent relative z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="w-7 h-7 border border-border">
                <AvatarImage src={agent_avatar} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-foreground group-hover/agent:text-primary transition-colors truncate">
                  {agent_name}
                </p>
                {agent_agency && (
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate flex items-center gap-0.5">
                    <Building2 className="w-2.5 h-2.5 flex-shrink-0" />
                    {agent_agency}
                  </p>
                )}
              </div>
              {agent_phone && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 h-5 w-5 p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `tel:${agent_phone}`;
                  }}
                >
                  <Phone className="w-2.5 h-2.5" />
                </Button>
              )}
            </Link>
          </div>
        )}

        {!isSold && (
          <div className="flex items-center justify-end text-foreground mt-0.5">
            <Calendar className="w-3 h-3 mr-0.5 text-foreground flex-shrink-0" />
            <span className="text-[10px] sm:text-xs text-foreground">{dayLabel}{timeLabel ? ` ${timeLabel}` : ""}</span>
          </div>
        )}

        <div className="mt-auto pt-1">
          {onButtonClick ? (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onButtonClick();
              }}
              className="w-full relative z-20 bg-primary hover:bg-hero-gradient group-hover:bg-hero-gradient hover:text-white group-hover:text-white transition-colors text-sm sm:text-base py-1"
            >
              {buttonText || "Visa detaljer"}
            </Button>
          ) : (
            <Link to={`/fastighet/${id}`} onClick={handleNavigateToDetail}>
              <Button className="w-full bg-primary hover:bg-hero-gradient group-hover:bg-hero-gradient hover:text-white group-hover:text-white transition-colors text-sm sm:text-base py-1">
                {buttonText || "Visa detaljer"}
              </Button>
            </Link>
          )}
          <p className="text-xs sm:text-base font-semibold text-muted-foreground text-right mt-0.5 truncate">
            {isSold && soldDate
              ? `Såld ${new Date(soldDate).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}`
              : daysOnMarketText
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;