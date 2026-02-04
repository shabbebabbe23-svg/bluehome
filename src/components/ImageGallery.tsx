import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ImageGalleryProps {
  images: string[];
  mainImage: string;
  title: string;
  propertyId?: string;
}

const ImageGallery = ({ images, mainImage, title, propertyId }: ImageGalleryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageViewStartRef = useRef<number>(Date.now());
  const currentViewIdRef = useRef<string | null>(null);
  
  const allImages = [mainImage, ...images];

  // Update time spent on current image before switching
  const updateImageTimeSpent = async () => {
    if (!currentViewIdRef.current) return;
    
    const timeSpent = Date.now() - imageViewStartRef.current;
    try {
      await supabase
        .from('image_views')
        .update({ time_spent_ms: timeSpent })
        .eq('id', currentViewIdRef.current);
    } catch (error) {
      console.error('Error updating image time:', error);
    }
  };

  // Track image views
  const trackImageView = async (imageIndex: number) => {
    if (!propertyId) return;
    
    // First update time spent on previous image
    await updateImageTimeSpent();
    
    // Reset timer for new image
    imageViewStartRef.current = Date.now();
    
    try {
      const sessionId = sessionStorage.getItem('session_id') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', sessionId);
      }

      const { data } = await supabase.from('image_views').insert({
        property_id: propertyId,
        session_id: sessionId,
        image_index: imageIndex,
        image_url: allImages[imageIndex],
        time_spent_ms: 0,
      }).select().single();
      
      currentViewIdRef.current = data?.id || null;
    } catch (error) {
      console.error('Error tracking image view:', error);
    }
  };

  const openGallery = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    trackImageView(index);
  };

  const closeGallery = async () => {
    await updateImageTimeSpent();
    currentViewIdRef.current = null;
    setIsOpen(false);
  };

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % allImages.length;
    setCurrentIndex(newIndex);
    trackImageView(newIndex);
  };

  const previousImage = () => {
    const newIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setCurrentIndex(newIndex);
    trackImageView(newIndex);
  };

  return (
    <>
      {/* Main Image */}
      <div className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-t-lg cursor-pointer" onClick={() => openGallery(0)}>
        <img
          src={mainImage}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {allImages.length} bilder
        </div>
      </div>

      {/* Thumbnail Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {images.slice(0, 3).map((img, idx) => (
            <div
              key={idx}
              className="relative h-20 sm:h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => openGallery(idx + 1)}
            >
              <img src={img} alt={`${title} ${idx + 2}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
          {images.length > 3 && (
            <div
              className="relative h-20 sm:h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => openGallery(4)}
            >
              <img src={images[3]} alt={`${title} 5`} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{images.length - 3}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeGallery(); else setIsOpen(true); }}>
        <DialogContent className="max-w-6xl p-0 bg-black/95">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={closeGallery}
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="relative h-[80vh] flex items-center justify-center">
            <img
              src={allImages[currentIndex]}
              alt={`${title} ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                  onClick={previousImage}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/60 px-4 py-2 rounded-full">
                  {currentIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;
