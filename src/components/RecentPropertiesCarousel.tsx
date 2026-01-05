import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyCard from "./PropertyCard";

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
  hasActiveBidding?: boolean;
}

interface RecentPropertiesCarouselProps {
  properties: PropertyData[];
}

const RecentPropertiesCarousel = ({ properties }: RecentPropertiesCarouselProps) => {
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);

  // Switch property every 15 seconds
  useEffect(() => {
    if (properties.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentPropertyIndex(prev => (prev + 1) % properties.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [properties.length]);

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentPropertyIndex(prev =>
      prev === 0 ? properties.length - 1 : prev - 1
    );
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentPropertyIndex(prev =>
      (prev + 1) % properties.length
    );
  };

  if (properties.length === 0) return null;

  const currentProperty = properties[currentPropertyIndex];

  return (
    <div className="flex flex-col items-center w-full px-4 sm:px-0">
      <div className="flex items-center gap-2 sm:gap-4 w-full max-w-[500px] sm:max-w-none sm:w-auto">
        {/* Left arrow */}
        {properties.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="bg-background/80 hover:bg-background shadow-md rounded-full h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 z-10"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}

        {/* Property Card */}
        <div className="w-full sm:w-[400px] md:w-[450px]">
          <div key={currentProperty.id} className="animate-in fade-in slide-in-from-right-4 duration-500">
            <PropertyCard
              id={currentProperty.id}
              title={currentProperty.title}
              price={currentProperty.price}
              location={currentProperty.location}
              address={currentProperty.address}
              bedrooms={currentProperty.bedrooms}
              bathrooms={currentProperty.bathrooms}
              area={currentProperty.area}
              fee={currentProperty.fee}
              image={currentProperty.image}
              hoverImage={currentProperty.hoverImage}
              additionalImages={currentProperty.additional_images}
              type={currentProperty.type}
              viewingDate={currentProperty.viewingDate}
              vendorLogo={currentProperty.vendorLogo}
              hasVR={currentProperty.hasVR}
              isNew={true} // Senast uppladdade är alltid "nya" i kontexten
              viewMode="grid"
              agent_name={currentProperty.agent_name}
              agent_avatar={currentProperty.agent_avatar}
              agent_agency={currentProperty.agent_agency}
              hasActiveBidding={currentProperty.hasActiveBidding}
              autoSlideImages={true}
            />
          </div>
        </div>

        {/* Right arrow */}
        {properties.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="bg-background/80 hover:bg-background shadow-md rounded-full h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 z-10"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
      </div>

      {/* Property indicators */}
      {properties.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {properties.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPropertyIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentPropertyIndex
                ? "bg-primary scale-110"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              aria-label={`Visa fastighet ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentPropertiesCarousel;
