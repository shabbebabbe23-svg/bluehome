import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  mainImage: string;
  title: string;
}

const ImageGallery = ({ images, mainImage, title }: ImageGalleryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const allImages = [mainImage, ...images];

  const openGallery = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
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
              <img src={img} alt={`${title} ${idx + 2}`} className="w-full h-full object-cover" />
            </div>
          ))}
          {images.length > 3 && (
            <div
              className="relative h-20 sm:h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => openGallery(4)}
            >
              <img src={images[3]} alt={`${title} 5`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{images.length - 3}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl p-0 bg-black/95">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
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
