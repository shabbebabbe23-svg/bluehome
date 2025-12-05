import React, { useState, useEffect, useCallback } from "react";
import { Heart, MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";

interface PropertyData {
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
  vendorLogo?: string;
  hasVR?: boolean;
  agent_name?: string;
  agent_avatar?: string;
  agent_agency?: string;
  additional_images?: string[];
}

interface RecentPropertiesCarouselProps {
  properties: PropertyData[];
}

const RecentPropertiesCarousel = ({ properties }: RecentPropertiesCarouselProps) => {
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [imageCounters, setImageCounters] = useState<number[]>(properties.map(() => 0));
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const IMAGES_BEFORE_SWITCH = 5;
  const IMAGE_INTERVAL = 3000; // 3 seconds per image

  // Get all images for a property
  const getPropertyImages = useCallback((property: PropertyData) => {
    const images: string[] = [];
    if (property.image) images.push(property.image);
    if (property.hoverImage) images.push(property.hoverImage);
    if (property.additional_images) {
      images.push(...property.additional_images);
    }
    return images.length > 0 ? images : ['/placeholder.svg'];
  }, []);

  // Auto-slide images and switch properties
  useEffect(() => {
    if (properties.length === 0) return;

    const interval = setInterval(() => {
      setImageCounters(prev => {
        const newCounters = [...prev];
        const currentCounter = newCounters[currentPropertyIndex];
        const currentImages = getPropertyImages(properties[currentPropertyIndex]);
        const totalImagesViewed = currentCounter + 1;
        
        // Check if we've viewed enough images to switch property
        if (totalImagesViewed >= IMAGES_BEFORE_SWITCH) {
          // Switch to next property
          setCurrentPropertyIndex(prevIndex => 
            (prevIndex + 1) % properties.length
          );
          // Reset counter for current property
          newCounters[currentPropertyIndex] = 0;
        } else {
          // Just increment counter (which cycles through images)
          newCounters[currentPropertyIndex] = totalImagesViewed;
        }
        
        return newCounters;
      });
    }, IMAGE_INTERVAL);

    return () => clearInterval(interval);
  }, [properties, currentPropertyIndex, getPropertyImages]);

  const goToPrevious = () => {
    setCurrentPropertyIndex(prev => 
      prev === 0 ? properties.length - 1 : prev - 1
    );
    setImageCounters(prev => {
      const newCounters = [...prev];
      newCounters[currentPropertyIndex] = 0;
      return newCounters;
    });
  };

  const goToNext = () => {
    setCurrentPropertyIndex(prev => 
      (prev + 1) % properties.length
    );
    setImageCounters(prev => {
      const newCounters = [...prev];
      newCounters[currentPropertyIndex] = 0;
      return newCounters;
    });
  };

  if (properties.length === 0) return null;

  const currentProperty = properties[currentPropertyIndex];
  const currentImages = getPropertyImages(currentProperty);
  const currentImageIndex = imageCounters[currentPropertyIndex] % currentImages.length;

  return (
    <div className="relative">
      {/* Navigation arrows */}
      {properties.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background shadow-md rounded-full -ml-4"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background shadow-md rounded-full -mr-4"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Property cards - show 2 at a time on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1].map(offset => {
          const propertyIndex = (currentPropertyIndex + offset) % properties.length;
          const property = properties[propertyIndex];
          if (!property || (offset === 1 && properties.length === 1)) return null;
          
          const images = getPropertyImages(property);
          const imgIndex = offset === 0 
            ? currentImageIndex 
            : (imageCounters[propertyIndex] || 0) % images.length;
          const propertyIsFavorite = isFavorite(String(property.id));

          return (
            <Card 
              key={`${property.id}-${offset}`}
              className="relative group overflow-hidden bg-property shadow-property hover:shadow-property-hover transition-all duration-300 hover:-translate-y-1"
            >
              <Link
                to={`/fastighet/${property.id}`}
                className="absolute inset-0 z-10"
                aria-label={`Visa ${property.title}`}
              />

              {/* Favorite button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(String(property.id));
                }}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
              >
                <Heart 
                  className={`w-5 h-5 transition-colors ${
                    propertyIsFavorite 
                      ? "fill-red-500 text-red-500" 
                      : "text-gray-600 hover:text-red-500"
                  }`}
                />
              </button>

              {/* Image with auto-slide */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={images[imgIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-500"
                />
                
                {/* Image indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {images.slice(0, Math.min(images.length, 5)).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === imgIndex % Math.min(images.length, 5)
                            ? "bg-white scale-110"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                    {images.length > 5 && (
                      <span className="text-white text-xs ml-1">+{images.length - 5}</span>
                    )}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    {property.type}
                  </Badge>
                  {property.hasVR && (
                    <Badge className="bg-purple-600 text-white text-xs">
                      360°
                    </Badge>
                  )}
                </div>

                {/* Vendor logo */}
                {property.vendorLogo && (
                  <div className="absolute bottom-3 right-3 z-10">
                    <img 
                      src={property.vendorLogo} 
                      alt="Mäklarbyrå" 
                      className="h-8 w-auto bg-white/90 rounded px-2 py-1"
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground text-base line-clamp-1">
                    {property.title}
                  </h3>
                  <span className="font-bold text-primary text-base whitespace-nowrap ml-2">
                    {property.price}
                  </span>
                </div>

                <div className="flex items-center text-muted-foreground text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{property.address || property.location}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="w-4 h-4" />
                    <span>{property.area} m²</span>
                  </div>
                  {property.fee && property.fee > 0 && (
                    <span className="text-xs">{property.fee.toLocaleString('sv-SE')} kr/mån</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Property indicators */}
      {properties.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {properties.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentPropertyIndex(idx);
                setImageCounters(prev => {
                  const newCounters = [...prev];
                  newCounters[currentPropertyIndex] = 0;
                  return newCounters;
                });
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentPropertyIndex || idx === (currentPropertyIndex + 1) % properties.length
                  ? "bg-primary scale-110"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentPropertiesCarousel;
