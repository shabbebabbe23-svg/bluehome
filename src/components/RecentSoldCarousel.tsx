import React, { useState, useEffect, useCallback } from "react";
import { MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface SoldPropertyData {
  id: string | number;
  title: string;
  price: string;
  priceValue: number;
  location: string;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  fee?: number;
  image: string;
  hoverImage?: string;
  type: string;
  vendorLogo?: string;
  hasVR?: boolean;
  soldDate?: Date | string;
  sold_price?: number;
  additional_images?: string[];
}

interface RecentSoldCarouselProps {
  properties: SoldPropertyData[];
}

const RecentSoldCarousel = ({ properties }: RecentSoldCarouselProps) => {
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [imageCounters, setImageCounters] = useState<number[]>(properties.map(() => 0));
  
  const IMAGES_BEFORE_SWITCH = 5;
  const IMAGE_INTERVAL = 3000; // 3 seconds per image

  // Get all images for a property
  const getPropertyImages = useCallback((property: SoldPropertyData) => {
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
  
  // Format sold date
  const soldDateFormatted = currentProperty.soldDate 
    ? format(new Date(currentProperty.soldDate), "d MMM yyyy", { locale: sv })
    : null;

  // Calculate price for display (use sold_price if available, otherwise priceValue)
  const displayPrice = currentProperty.sold_price 
    ? `${currentProperty.sold_price.toLocaleString('sv-SE')} kr`
    : currentProperty.price;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        {/* Left arrow */}
        {properties.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="bg-background/80 hover:bg-background shadow-md rounded-full h-8 w-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Single centered property card */}
        <Card 
          className="relative group overflow-hidden bg-property shadow-property hover:shadow-property-hover transition-all duration-300 hover:-translate-y-1 w-[360px] sm:w-[400px]"
        >
          <Link
            to={`/fastighet/${currentProperty.id}`}
            className="absolute inset-0 z-10"
            aria-label={`Visa ${currentProperty.title}`}
          />


          {/* Image with auto-slide */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={currentImages[currentImageIndex]}
              alt={currentProperty.title}
              className="w-full h-full object-cover transition-transform duration-500"
            />
            
            {/* SOLD overlay */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            
            {/* Image indicators */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {currentImages.slice(0, Math.min(currentImages.length, 5)).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex % Math.min(currentImages.length, 5)
                        ? "bg-white scale-110"
                        : "bg-white/50"
                    }`}
                  />
                ))}
                {currentImages.length > 5 && (
                  <span className="text-white text-[10px] ml-1">+{currentImages.length - 5}</span>
                )}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0.5">
                Såld
              </Badge>
              <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                {currentProperty.type}
              </Badge>
            </div>

            {/* Vendor logo */}
            {currentProperty.vendorLogo && (
              <div className="absolute bottom-2 right-2 z-10">
                <img 
                  src={currentProperty.vendorLogo} 
                  alt="Mäklarbyrå" 
                  className="h-6 w-auto bg-white/90 rounded px-1.5 py-0.5"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-foreground text-base line-clamp-1">
                {currentProperty.title}
              </h3>
              <span className="font-bold text-primary text-base whitespace-nowrap ml-2">
                {displayPrice}
              </span>
            </div>

            <div className="flex items-center text-muted-foreground text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{currentProperty.address || currentProperty.location}</span>
            </div>

            {/* Sold date */}
            {soldDateFormatted && (
              <div className="flex items-center text-red-600 text-sm mb-3">
                <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                <span>Såld {soldDateFormatted}</span>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{currentProperty.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{currentProperty.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Square className="w-4 h-4" />
                <span>{currentProperty.area} m²</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right arrow */}
        {properties.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="bg-background/80 hover:bg-background shadow-md rounded-full h-8 w-8"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
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
                idx === currentPropertyIndex
                  ? "bg-red-600 scale-110"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentSoldCarousel;
