import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, MapPin, Bed, Bath, Square, Calendar, FileSignature, Gavel, User, Phone, Building2, Scale, Check, ChevronLeft, ChevronRight, Pencil, Eye } from "lucide-react";
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
  brfDebtPerSqm?: number;
  floor?: number;
  totalFloors?: number;
  tagline?: string;
  onEditClick?: () => void;
  viewCount?: number;
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
  brfDebtPerSqm,
  floor,
  totalFloors,
  tagline,
  onEditClick,
  viewCount,
}: PropertyCardProps) => {
  const { toggleFavorite, isFavorite: isFavoriteHook } = useFavorites();
  const { toggleComparison, isInComparison, canAddMore } = useComparison();
  const isFavorite = isFavoriteHook(String(id));
  const isComparing = isInComparison(String(id));

  // Image gallery state for scrolling through images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  // Limit to first 5 images for the slider
  const allImages = [image, ...(additionalImages || [])].filter(Boolean).slice(0, 5) as string[];
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-slide images state (for carousel mode)
  const images = [image, hoverImage].filter(Boolean) as string[];

  // Add non-passive touchmove listener to allow preventDefault for horizontal swipes
  useEffect(() => {
    const container = containerRef.current;
    if (!container || allImages.length <= 1) return;

    const handleTouchMoveNative = (e: TouchEvent) => {
      // Only prevent default if we're doing a horizontal swipe
      if (isHorizontalSwipeRef.current === true) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchmove', handleTouchMoveNative, { passive: false });
    return () => {
      container.removeEventListener('touchmove', handleTouchMoveNative);
    };
  }, [allImages.length]);

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
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(true);
    setIsHorizontalSwipe(null);
    isHorizontalSwipeRef.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current || !containerRef.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Determine swipe direction on first significant movement
    if (isHorizontalSwipeRef.current === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      const isHorizontal = Math.abs(diffX) > Math.abs(diffY);
      setIsHorizontalSwipe(isHorizontal);
      isHorizontalSwipeRef.current = isHorizontal;
    }

    // Only handle horizontal swipes
    if (isHorizontalSwipeRef.current === false) return;

    const containerWidth = containerRef.current.offsetWidth;

    // Allow full swipe in both directions for looping (no resistance at edges)
    const offset = diffX;

    setSwipeOffset((offset / containerWidth) * 100);
  }, [currentImageIndex, allImages.length]);

  const handleTouchEnd = useCallback(() => {
    if (!containerRef.current) {
      setSwipeOffset(0);
      setIsSwiping(false);
      setIsHorizontalSwipe(null);
      isHorizontalSwipeRef.current = null;
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    const swipeThreshold = 15; // Percentage threshold to trigger slide (lowered for easier swiping)

    if (isHorizontalSwipeRef.current && Math.abs(swipeOffset) > swipeThreshold) {
      if (swipeOffset < 0) {
        // Swipe left - next image or loop to first
        setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
      } else if (swipeOffset > 0) {
        // Swipe right - previous image or loop to last
        setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
      }
    }

    setSwipeOffset(0);
    setIsSwiping(false);
    setIsHorizontalSwipe(null);
    isHorizontalSwipeRef.current = null;
    touchStartX.current = null;
    touchStartY.current = null;
  }, [swipeOffset, allImages.length]);

  const goToPrevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
  }, [allImages.length]);

  const goToNextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
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

  // Different truncation lengths for different screen sizes
  const truncatedListDescriptionShort = description
    ? description.length > 80
      ? `${description.slice(0, 80)}…`
      : description
    : "";

  const truncatedListDescriptionMedium = description
    ? description.length > 150
      ? `${description.slice(0, 150)}…`
      : description
    : "";

  const truncatedListDescriptionLong = description
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

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Villa':
        return 'bg-blue-500 hover:bg-blue-600 text-white border-transparent';
      case 'Lägenhet':
        return 'bg-green-500 hover:bg-green-600 text-white border-transparent';
      case 'Radhus':
        return 'bg-purple-500 hover:bg-purple-600 text-white border-transparent';
      case 'Parhus':
        return 'bg-teal-500 hover:bg-teal-600 text-white border-transparent';
      case 'Tomt':
        return 'bg-orange-500 hover:bg-orange-600 text-white border-transparent';
      case 'Fritidshus':
        return 'bg-pink-500 hover:bg-pink-600 text-white border-transparent';
      default:
        return 'bg-white/90 text-foreground hover:bg-white/100';
    }
  };

  // List view layout
  if (viewMode === "list") {
    return (
      <Card className={`relative group overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-300 transform-gpu hover:scale-[1.02] h-auto sm:h-[155px] md:h-[165px] w-full lg:w-[100%] mx-auto cursor-pointer ${bulkSelectMode && isSelected ? 'ring-4 ring-primary' : ''}`}>
        {/* Full-card clickable overlay */}
        {!bulkSelectMode && (
          <Link
            to={`/fastighet/${id}`}
            className="absolute inset-0 z-30"
            aria-label={`Visa ${title}`}
            onClick={handleNavigateToDetail}
          />
        )}

        <div className="flex flex-col sm:flex-row w-full sm:h-full">
          {/* Image section */}
          <div className="relative w-full sm:w-[242px] md:w-[315px] lg:w-[363px] xl:w-[411px] h-[154px] sm:h-full flex-shrink-0 overflow-hidden">
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
              <Badge variant="secondary" className={`${getBadgeColor(type)} text-sm shadow-sm`}>
                {type}
              </Badge>
            </div>

            {/* Favorite and Compare buttons - hide for sold properties */}
            {!hideControls && !isSold && (
              <div className="absolute top-3 right-3 flex gap-1.5 z-40">
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
                      brfDebtPerSqm,
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
                <h3 className="font-bold text-lg sm:text-xl text-black line-clamp-2" style={{ color: '#111' }}>
                  {title}
                </h3>
                {tagline && (
                  <div className="text-xs sm:text-sm text-primary font-medium line-clamp-2 sm:truncate">
                    {tagline}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                {isSold && soldPrice ? (
                  <span className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                    {soldPrice}
                  </span>
                ) : newPrice ? (
                  <span className={
                    hasActiveBidding && newPrice
                      ? 'text-lg sm:text-xl font-bold whitespace-nowrap text-[#FF6B2C]'
                      : 'text-lg sm:text-xl font-bold whitespace-nowrap text-primary'
                  }>
                    {newPrice}
                  </span>
                ) : (
                  <span className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                    {price}
                  </span>
                )}
                {hasActiveBidding && !isSold && (
                  <div className="flex items-center gap-1 text-[#FF6B2C] font-bold text-xs sm:text-sm mt-1">
                    <Gavel className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Pågående budgivning</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description - responsive for different screen sizes */}
            <div className="hidden sm:block text-muted-foreground mt-1 min-h-4">
              {/* Small screens (sm): shorter description */}
              <p className="block md:hidden text-sm line-clamp-1 leading-tight">
                {truncatedListDescriptionShort || "\u00A0"}
              </p>
              {/* Medium screens (md): medium description */}
              <p className="hidden md:block lg:hidden text-base line-clamp-1 leading-tight">
                {truncatedListDescriptionMedium || "\u00A0"}
              </p>
              {/* Large screens (lg+): full description */}
              <p className="hidden lg:block text-base line-clamp-2 leading-tight">
                {truncatedListDescriptionLong || "\u00A0"}
              </p>
            </div>

            {/* Bottom row: Details and Days on market */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 mt-1.5 sm:mt-2 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg text-muted-foreground font-semibold min-w-0 overflow-hidden flex-nowrap">
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Bed className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  <span className="whitespace-nowrap">{bedrooms} rum</span>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Bath className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  <span className="whitespace-nowrap">{bathrooms}</span>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Square className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  <span className="whitespace-nowrap">{area} m²</span>
                </div>
                {viewCount !== undefined && (
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Eye className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-500" />
                    <span className="whitespace-nowrap text-blue-600">{viewCount}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-3">
                <p className="text-xs sm:text-base font-semibold text-muted-foreground whitespace-nowrap">
                  {isSold && soldDate
                    ? `Såld ${new Date(soldDate).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}`
                    : daysOnMarketText
                  }
                </p>
                <Link to={`/fastighet/${id}`} onClick={handleNavigateToDetail} className="z-20 ml-auto">
                  <Button className="bg-primary hover:bg-hero-gradient text-white text-sm sm:text-base px-4 py-1.5 h-8 sm:h-9">
                    Visa objekt
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view layout (original)
  return (
    <Card className={`relative group overflow-hidden bg-property shadow-property hover:shadow-property-hover transition-all duration-300 transform-gpu hover:-translate-y-1 hover:scale-[1.05] animate-scale-in h-full flex flex-col cursor-pointer ${bulkSelectMode && isSelected ? 'ring-4 ring-primary' : ''}`}>
      {/* Full-card clickable overlay (keeps favorite button above) */}
      {!bulkSelectMode && (
        <Link
          to={`/fastighet/${id}`}
          className="absolute inset-0 z-30"
          aria-label={`Visa ${title}`}
          onClick={handleNavigateToDetail}
        />
      )}

      {/* Bulk select checkbox */}
      {bulkSelectMode && (
        <div
          className="absolute top-4 left-4 z-40 cursor-pointer"
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
          className="w-full aspect-[4/3] sm:aspect-[16/10] relative overflow-hidden select-none touch-pan-y"
          style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
          onTouchStart={allImages.length > 1 ? handleTouchStart : undefined}
          onTouchMove={allImages.length > 1 ? handleTouchMove : undefined}
          onTouchEnd={allImages.length > 1 ? handleTouchEnd : undefined}
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
                  transition: isSwiping ? 'none' : 'transform 0.45s cubic-bezier(.22,1,.36,1)'
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
                    loading="lazy"
                  />
                ))}
              </div>

              {/* Navigation arrows - only visible on desktop hover */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 items-center justify-center text-white z-40 hidden sm:group-hover:flex transition-opacity"
                aria-label="Föregående bild"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 items-center justify-center text-white z-40 hidden sm:group-hover:flex transition-opacity"
                aria-label="Nästa bild"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {/* Image counter/dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'bg-white scale-125 shadow' : 'bg-white/50'}`}
                  />
                ))}
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
        {!hideControls && vendorLogo && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-4 w-16 sm:w-24 h-10 sm:h-16 flex items-center justify-center overflow-hidden z-10">
            <img src={vendorLogo} alt="Mäklarlogo" className="w-full h-full object-contain drop-shadow-md" loading="lazy" />
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
            <Badge className="bg-orange-500 text-white border-none flex items-center gap-1.5 px-3 py-1.5 shadow-lg animate-pulse">
              <Gavel className="w-4 h-4" />
              <span className="font-semibold">Budgivning pågår</span>
            </Badge>
          )}
          <Badge variant="secondary" className={`${getBadgeColor(type)} shadow-sm`}>
            {type}
          </Badge>
        </div>

        {/* Favorite and Compare buttons - hide for sold properties */}
        {!hideControls && !isSold && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1.5 sm:gap-2 z-40">
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
                  brfDebtPerSqm,
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
            <h3 className="font-semibold text-[15px] sm:text-lg text-foreground group-hover:text-primary transition-colors truncate">
              {title}
            </h3>
            {/* Dynamic subtitle text */}
            {tagline && (
              <div className="text-[11px] sm:text-sm text-primary font-medium line-clamp-2 sm:truncate">
                {tagline}
              </div>
            )}
          </div>

          {/* Right side - Price */}
          <div className="flex flex-col items-end flex-shrink-0">
            {isSold && soldPrice ? (
              <>
                <span className="text-[17px] sm:text-xl font-bold bg-clip-text text-transparent bg-hero-gradient whitespace-nowrap">
                  {soldPrice}
                </span>
                <span className="text-[10px] sm:text-sm text-muted-foreground line-through whitespace-nowrap">
                  {price}
                </span>
                {fee && fee > 0 && (
                  <span className="text-[10px] sm:text-sm text-muted-foreground whitespace-nowrap">
                    {fee.toLocaleString('sv-SE')} kr/mån
                  </span>
                )}
              </>
            ) : newPrice && hasActiveBidding ? (
              <>
                <span className="text-[17px] sm:text-xl font-bold text-[#FF6B2C] whitespace-nowrap">
                  {newPrice}
                </span>
                <span className="text-xs sm:text-base text-muted-foreground line-through whitespace-nowrap">
                  {price}
                </span>
                {fee && fee > 0 && (
                  <span className="text-[10px] sm:text-sm text-muted-foreground whitespace-nowrap">
                    {fee.toLocaleString('sv-SE')} kr/mån
                  </span>
                )}
              </>
            ) : newPrice ? (
              <>
                <span className="text-[17px] sm:text-xl font-bold bg-clip-text text-transparent bg-hero-gradient whitespace-nowrap">
                  {newPrice}
                </span>
                <span className="text-xs sm:text-base text-muted-foreground line-through whitespace-nowrap">
                  {price}
                </span>
                {fee && fee > 0 && (
                  <span className="text-[10px] sm:text-sm text-muted-foreground whitespace-nowrap">
                    {fee.toLocaleString('sv-SE')} kr/mån
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="text-[17px] sm:text-xl font-bold text-primary whitespace-nowrap">
                  {price}
                </span>
                {fee && fee > 0 && (
                  <span className="text-[10px] sm:text-sm text-muted-foreground whitespace-nowrap">
                    {fee.toLocaleString('sv-SE')} kr/mån
                  </span>
                )}
              </>
            )}
            {hasActiveBidding && !isSold && (
              <div className="flex items-center gap-1 text-[#FF6B2C] font-bold text-[10px] mt-0.5">
                <Gavel className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Pågående budgivning</span>
              </div>
            )}
          </div>
        </div>

        {isSold && soldDate && (
          <div className="flex items-center text-muted-foreground">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 flex-shrink-0" />
            <span className="text-[10px] sm:text-sm">
              Såld {new Date(soldDate).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
        </div>

        {agent_name && (
          <div className="mt-1 pt-1 border-t border-border/50">
            <Link
              to={`/agent/${agent_id}`}
              className="flex items-center gap-1.5 hover:bg-muted/30 p-1 rounded transition-colors group/agent relative z-40"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="w-6 h-6 sm:w-7 sm:h-7 border border-border">
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


        <div className="mt-auto pt-1">
          <div className="flex items-center gap-1.5 flex-wrap text-xs sm:text-sm mb-1">
            <div className="flex items-center gap-0.5">
              <Bed className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-sm sm:text-base font-semibold text-foreground">{bedrooms}</span>
              <span className="text-[10px] sm:text-sm text-muted-foreground">rum</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Bath className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-sm sm:text-base font-semibold text-foreground">{bathrooms}</span>
              <span className="text-[10px] sm:text-sm text-muted-foreground hidden sm:inline">bad</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Square className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-sm sm:text-base font-semibold text-foreground">{area}</span>
              <span className="text-[10px] sm:text-sm text-muted-foreground">m²</span>
            </div>
            {floor && (
              <div className="flex items-center gap-0.5">
                <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-foreground">
                  {floor}{totalFloors ? `/${totalFloors}` : ''}
                </span>
                <span className="text-[10px] sm:text-sm text-muted-foreground">vån</span>
              </div>
            )}
            {viewCount !== undefined && (
              <div className="flex items-center gap-0.5 ml-auto">
                <Eye className="w-3 h-3 text-blue-500 flex-shrink-0" />
                <span className="text-xs sm:text-base font-semibold text-blue-600">{viewCount}</span>
              </div>
            )}
          </div>
          {viewDate && (
            <div className="flex items-center justify-end text-foreground mb-1">
              <Calendar className="w-3.5 h-3.5 mr-1 text-foreground flex-shrink-0" />
              <span className="text-xs sm:text-base text-foreground">{dayLabel}{timeLabel ? ` ${timeLabel}` : ""}</span>
            </div>
          )}
          {onButtonClick ? (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onButtonClick();
              }}
              className="w-full relative z-40 bg-primary hover:bg-hero-gradient group-hover:bg-hero-gradient hover:text-white group-hover:text-white transition-colors text-xs sm:text-base py-1 h-8 sm:h-10"
            >
              {buttonText || "Visa objekt"}
            </Button>
          ) : (
            <Link to={`/fastighet/${id}`} onClick={handleNavigateToDetail}>
              <Button className="w-full bg-primary hover:bg-hero-gradient group-hover:bg-hero-gradient hover:text-white group-hover:text-white transition-colors text-xs sm:text-base py-1 h-8 sm:h-10">
                {buttonText || "Visa objekt"}
              </Button>
            </Link>
          )}
          {/* Edit button (for agent's own properties) */}
          {onEditClick && (
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditClick();
              }}
              className="w-full mt-2 relative z-40 text-xs sm:text-base py-1 h-8 sm:h-10 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Redigera
            </Button>
          )}
          <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground text-right mt-1 truncate">
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