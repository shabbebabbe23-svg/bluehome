import { useState, useEffect, useRef, useCallback } from "react";
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

  // Swipe state for main image strip
  const [mainSwipeOffset, setMainSwipeOffset] = useState(0);
  const [mainIsSwiping, setMainIsSwiping] = useState(false);
  const [mainCurrentIndex, setMainCurrentIndex] = useState(0);
  const mainTouchStartX = useRef<number | null>(null);
  const mainTouchStartY = useRef<number | null>(null);
  const mainIsHorizontalRef = useRef<boolean | null>(null);
  const mainSwipePerformedRef = useRef(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Swipe state for lightbox
  const [lbSwipeOffset, setLbSwipeOffset] = useState(0);
  const [lbIsSwiping, setLbIsSwiping] = useState(false);
  const lbTouchStartX = useRef<number | null>(null);
  const lbTouchStartY = useRef<number | null>(null);
  const lbIsHorizontalRef = useRef<boolean | null>(null);
  const lbContainerRef = useRef<HTMLDivElement>(null);
  
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

  // ─── Main image strip swipe handlers ───────────────────────────

  // Non-passive touchmove so we can preventDefault on horizontal swipes
  useEffect(() => {
    const el = mainContainerRef.current;
    if (!el || allImages.length <= 1) return;
    const handler = (e: TouchEvent) => {
      if (mainIsHorizontalRef.current === true) e.preventDefault();
    };
    el.addEventListener('touchmove', handler, { passive: false });
    return () => el.removeEventListener('touchmove', handler);
  }, [allImages.length]);

  const mainHandleTouchStart = useCallback((e: React.TouchEvent) => {
    mainTouchStartX.current = e.touches[0].clientX;
    mainTouchStartY.current = e.touches[0].clientY;
    mainIsHorizontalRef.current = null;
    mainSwipePerformedRef.current = false;
    setMainIsSwiping(true);
  }, []);

  const mainHandleTouchMove = useCallback((e: React.TouchEvent) => {
    if (mainTouchStartX.current === null || mainTouchStartY.current === null || !mainContainerRef.current) return;
    const diffX = e.touches[0].clientX - mainTouchStartX.current;
    const diffY = e.touches[0].clientY - mainTouchStartY.current;
    if (mainIsHorizontalRef.current === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      mainIsHorizontalRef.current = Math.abs(diffX) > Math.abs(diffY);
    }
    if (mainIsHorizontalRef.current === false) return;
    const w = mainContainerRef.current.offsetWidth;
    setMainSwipeOffset((diffX / w) * 100);
  }, []);

  const mainHandleTouchEnd = useCallback(() => {
    const threshold = 15;
    if (mainIsHorizontalRef.current !== null) {
      mainSwipePerformedRef.current = true;
      if (mainIsHorizontalRef.current && Math.abs(mainSwipeOffset) > threshold) {
        if (mainSwipeOffset < 0) {
          setMainCurrentIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
        } else {
          setMainCurrentIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
        }
      }
    }
    setMainSwipeOffset(0);
    setMainIsSwiping(false);
    mainIsHorizontalRef.current = null;
    mainTouchStartX.current = null;
    mainTouchStartY.current = null;
  }, [mainSwipeOffset, allImages.length]);

  const mainHandleClick = useCallback(() => {
    if (mainSwipePerformedRef.current) {
      mainSwipePerformedRef.current = false;
      return;
    }
    openGallery(mainCurrentIndex);
  }, [mainCurrentIndex]);

  // ─── Lightbox swipe handlers ───────────────────────────────────

  useEffect(() => {
    const el = lbContainerRef.current;
    if (!el || allImages.length <= 1) return;
    const handler = (e: TouchEvent) => {
      if (lbIsHorizontalRef.current === true) e.preventDefault();
    };
    el.addEventListener('touchmove', handler, { passive: false });
    return () => el.removeEventListener('touchmove', handler);
  }, [isOpen, allImages.length]);

  const lbHandleTouchStart = useCallback((e: React.TouchEvent) => {
    lbTouchStartX.current = e.touches[0].clientX;
    lbTouchStartY.current = e.touches[0].clientY;
    lbIsHorizontalRef.current = null;
    setLbIsSwiping(true);
  }, []);

  const lbHandleTouchMove = useCallback((e: React.TouchEvent) => {
    if (lbTouchStartX.current === null || lbTouchStartY.current === null || !lbContainerRef.current) return;
    const diffX = e.touches[0].clientX - lbTouchStartX.current;
    const diffY = e.touches[0].clientY - lbTouchStartY.current;
    if (lbIsHorizontalRef.current === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      lbIsHorizontalRef.current = Math.abs(diffX) > Math.abs(diffY);
    }
    if (lbIsHorizontalRef.current === false) return;
    const w = lbContainerRef.current.offsetWidth;
    setLbSwipeOffset((diffX / w) * 100);
  }, []);

  const lbHandleTouchEnd = useCallback(() => {
    const threshold = 15;
    if (lbIsHorizontalRef.current && Math.abs(lbSwipeOffset) > threshold) {
      if (lbSwipeOffset < 0) {
        nextImage();
      } else {
        previousImage();
      }
    }
    setLbSwipeOffset(0);
    setLbIsSwiping(false);
    lbIsHorizontalRef.current = null;
    lbTouchStartX.current = null;
    lbTouchStartY.current = null;
  }, [lbSwipeOffset]);

  return (
    <>
      {/* Main Image - Swipeable strip */}
      <div
        ref={mainContainerRef}
        className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-t-lg cursor-pointer select-none"
        style={{ touchAction: allImages.length > 1 ? 'pan-y' : undefined, WebkitUserSelect: 'none', userSelect: 'none' }}
        onClick={mainHandleClick}
        onTouchStart={allImages.length > 1 ? mainHandleTouchStart : undefined}
        onTouchMove={allImages.length > 1 ? mainHandleTouchMove : undefined}
        onTouchEnd={allImages.length > 1 ? mainHandleTouchEnd : undefined}
      >
        {allImages.length > 1 ? (
          <>
            <div
              className="flex h-full"
              style={{
                transform: `translateX(calc(-${mainCurrentIndex * 100}% + ${mainSwipeOffset}%))`,
                transition: mainIsSwiping ? 'none' : 'transform 0.45s cubic-bezier(.22,1,.36,1)',
              }}
            >
              {allImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${title} ${idx + 1}`}
                  className="w-full h-full object-cover flex-shrink-0"
                  style={{ minWidth: '100%' }}
                  draggable={false}
                  loading={idx === 0 ? undefined : 'lazy'}
                />
              ))}
            </div>
            {/* Navigation arrows - desktop only */}
            <button
              onClick={(e) => { e.stopPropagation(); setMainCurrentIndex(mainCurrentIndex === 0 ? allImages.length - 1 : mainCurrentIndex - 1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 items-center justify-center text-white z-10 hidden sm:flex transition-opacity"
              aria-label="Föregående bild"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setMainCurrentIndex(mainCurrentIndex === allImages.length - 1 ? 0 : mainCurrentIndex + 1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 items-center justify-center text-white z-10 hidden sm:flex transition-opacity"
              aria-label="Nästa bild"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {allImages.slice(0, 8).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === mainCurrentIndex ? 'bg-white scale-125 shadow' : 'bg-white/50'}`}
                />
              ))}
              {allImages.length > 8 && (
                <span className="text-white/70 text-xs ml-1">+{allImages.length - 8}</span>
              )}
            </div>
          </>
        ) : (
          <img
            src={mainImage}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        )}
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

          <div
            ref={lbContainerRef}
            className="relative h-[80vh] flex items-center justify-center select-none"
            style={{ touchAction: 'pan-y', WebkitUserSelect: 'none', userSelect: 'none' }}
            onTouchStart={allImages.length > 1 ? lbHandleTouchStart : undefined}
            onTouchMove={allImages.length > 1 ? lbHandleTouchMove : undefined}
            onTouchEnd={allImages.length > 1 ? lbHandleTouchEnd : undefined}
          >
            <div
              className="flex items-center h-full w-full"
              style={{
                transform: `translateX(${lbSwipeOffset}%)`,
                transition: lbIsSwiping ? 'none' : 'transform 0.35s cubic-bezier(.22,1,.36,1)',
              }}
            >
              <img
                src={allImages[currentIndex]}
                alt={`${title} ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain mx-auto"
                draggable={false}
              />
            </div>

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
