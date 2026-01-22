import React, { useState } from 'react';
import { Bed, Bath, Square, Calendar, Building2, ArrowUpDown, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useComparison } from '@/contexts/ComparisonContext';
import { Link } from 'react-router-dom';

function PropertyImageCarousel({ 
  images, 
  title, 
  isSold 
}: { 
  images: string[]; 
  title: string; 
  isSold?: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (images.length === 0) return null;

  return (
    <div className="relative aspect-[16/12] rounded-lg overflow-hidden group">
      <div
        className="w-full h-full"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={images[currentIndex]}
          alt={`${title} - bild ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>
      
      {isSold && (
        <Badge className="absolute top-2 left-2 bg-destructive">Såld</Badge>
      )}

      {/* Navigation arrows - always visible */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-background hover:bg-background/90 rounded-full p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-colors duration-200"
            aria-label="Föregående bild"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-background hover:bg-background/90 rounded-full p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-colors duration-200"
            aria-label="Nästa bild"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Image indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-3' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Gå till bild ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-background/80 text-xs px-1.5 py-0.5 rounded">
          {currentIndex + 1}/{images.length}
        </div>
      )}
    </div>
  );
}

export function ComparisonModal() {
  const { comparisonList, isCompareModalOpen, setIsCompareModalOpen, clearComparison } = useComparison();

  if (comparisonList.length < 2) return null;

  const [prop1, prop2] = comparisonList;

  const formatPrice = (price: string) => price;
  
  const getComparisonClass = (val1: number | undefined, val2: number | undefined, higherIsBetter = true) => {
    if (val1 === undefined || val2 === undefined) return '';
    if (val1 === val2) return '';
    const isBetter = higherIsBetter ? val1 > val2 : val1 < val2;
    return isBetter ? 'text-green-600 font-semibold' : 'text-muted-foreground';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Lägenhet': 'bg-blue-100 text-blue-800 border-blue-200',
      'Villa': 'bg-green-100 text-green-800 border-green-200',
      'Radhus': 'bg-orange-100 text-orange-800 border-orange-200',
      'Fritidshus': 'bg-purple-100 text-purple-800 border-purple-200',
      'Tomt': 'bg-amber-100 text-amber-800 border-amber-200',
      'Gård': 'bg-lime-100 text-lime-800 border-lime-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const parsePrice = (price: string) => {
    return parseInt(price.replace(/\D/g, '')) || 0;
  };

  const getPropertyImages = (prop: typeof prop1) => {
    const images: string[] = [];
    if (prop.image) images.push(prop.image);
    if (prop.additionalImages) images.push(...prop.additionalImages);
    return images;
  };

  const renderComparisonRow = (
    label: string,
    value1: React.ReactNode,
    value2: React.ReactNode,
    icon?: React.ReactNode
  ) => (
    <div className="grid grid-cols-[1fr_2fr_2fr] gap-4 py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-muted-foreground text-base pl-4">
        {icon}
        {label}
      </div>
      <div className="text-center font-medium text-base">{value1}</div>
      <div className="text-center font-medium text-base">{value2}</div>
    </div>
  );

  return (
    <Dialog open={isCompareModalOpen} onOpenChange={setIsCompareModalOpen}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl flex items-center gap-2">
            Jämför fastigheter
          </DialogTitle>
        </DialogHeader>

        {/* Property images header with carousel */}
        <div className="grid grid-cols-[1fr_2fr_2fr] gap-6 mb-3">
          <div></div>
          {[prop1, prop2].map((prop) => (
            <div key={prop.id} className="text-center flex flex-col items-center">
              <PropertyImageCarousel
                images={getPropertyImages(prop)}
                title={prop.title}
                isSold={prop.isSold}
              />
              <h3 className="font-semibold text-lg line-clamp-1 mt-2">{prop.title}</h3>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="bg-muted/30 rounded-lg p-4">
          {renderComparisonRow(
            'Pris',
            <span className={getComparisonClass(parsePrice(prop2.soldPrice || prop2.newPrice || prop2.price), parsePrice(prop1.soldPrice || prop1.newPrice || prop1.price), false)}>
              {prop1.soldPrice || prop1.newPrice || prop1.price}
            </span>,
            <span className={getComparisonClass(parsePrice(prop1.soldPrice || prop1.newPrice || prop1.price), parsePrice(prop2.soldPrice || prop2.newPrice || prop2.price), false)}>
              {prop2.soldPrice || prop2.newPrice || prop2.price}
            </span>
          )}

          {renderComparisonRow(
            'Typ',
            <Badge className={`${getTypeColor(prop1.type)} border`}>{prop1.type}</Badge>,
            <Badge className={`${getTypeColor(prop2.type)} border`}>{prop2.type}</Badge>
          )}

          {renderComparisonRow(
            'Rum',
            <span className={getComparisonClass(prop1.bedrooms, prop2.bedrooms)}>{prop1.bedrooms}</span>,
            <span className={getComparisonClass(prop2.bedrooms, prop1.bedrooms)}>{prop2.bedrooms}</span>,
            <Bed className="w-4 h-4" />
          )}

          {renderComparisonRow(
            'Badrum',
            <span className={getComparisonClass(prop1.bathrooms, prop2.bathrooms)}>{prop1.bathrooms}</span>,
            <span className={getComparisonClass(prop2.bathrooms, prop1.bathrooms)}>{prop2.bathrooms}</span>,
            <Bath className="w-4 h-4" />
          )}

          {renderComparisonRow(
            'Boarea',
            <span className={getComparisonClass(prop1.area, prop2.area)}>{prop1.area} m²</span>,
            <span className={getComparisonClass(prop2.area, prop1.area)}>{prop2.area} m²</span>,
            <Square className="w-4 h-4" />
          )}

          {renderComparisonRow(
            'Pris/m²',
            <span className={getComparisonClass(
              parsePrice(prop2.soldPrice || prop2.newPrice || prop2.price) / prop2.area,
              parsePrice(prop1.soldPrice || prop1.newPrice || prop1.price) / prop1.area,
              false
            )}>
              {Math.round(parsePrice(prop1.soldPrice || prop1.newPrice || prop1.price) / prop1.area).toLocaleString('sv-SE')} kr
            </span>,
            <span className={getComparisonClass(
              parsePrice(prop1.soldPrice || prop1.newPrice || prop1.price) / prop1.area,
              parsePrice(prop2.soldPrice || prop2.newPrice || prop2.price) / prop2.area,
              false
            )}>
              {Math.round(parsePrice(prop2.soldPrice || prop2.newPrice || prop2.price) / prop2.area).toLocaleString('sv-SE')} kr
            </span>
          )}

          {(prop1.fee !== undefined || prop2.fee !== undefined) && renderComparisonRow(
            'Avgift',
            <span className={getComparisonClass(prop2.fee, prop1.fee, false)}>
              {prop1.fee ? `${prop1.fee.toLocaleString('sv-SE')} kr/mån` : '-'}
            </span>,
            <span className={getComparisonClass(prop1.fee, prop2.fee, false)}>
              {prop2.fee ? `${prop2.fee.toLocaleString('sv-SE')} kr/mån` : '-'}
            </span>,
            <Calendar className="w-4 h-4" />
          )}

          {renderComparisonRow(
            'BRF skuld/m²',
            <span className={getComparisonClass(prop2.brfDebtPerSqm, prop1.brfDebtPerSqm, false)}>
              {prop1.brfDebtPerSqm ? `${prop1.brfDebtPerSqm.toLocaleString('sv-SE')} kr/m²` : '-'}
            </span>,
            <span className={getComparisonClass(prop1.brfDebtPerSqm, prop2.brfDebtPerSqm, false)}>
              {prop2.brfDebtPerSqm ? `${prop2.brfDebtPerSqm.toLocaleString('sv-SE')} kr/m²` : '-'}
            </span>,
            <Building2 className="w-4 h-4" />
          )}

          {(prop1.operatingCost !== undefined || prop2.operatingCost !== undefined) && renderComparisonRow(
            'Driftkostnad',
            <span className={getComparisonClass(prop2.operatingCost, prop1.operatingCost, false)}>
              {prop1.operatingCost ? `${prop1.operatingCost.toLocaleString('sv-SE')} kr/år` : '-'}
            </span>,
            <span className={getComparisonClass(prop1.operatingCost, prop2.operatingCost, false)}>
              {prop2.operatingCost ? `${prop2.operatingCost.toLocaleString('sv-SE')} kr/år` : '-'}
            </span>,
            <Building2 className="w-4 h-4" />
          )}

          {(prop1.constructionYear || prop2.constructionYear) && renderComparisonRow(
            'Byggår',
            <span className={getComparisonClass(prop1.constructionYear, prop2.constructionYear, true)}>
              {prop1.constructionYear || '-'}
            </span>,
            <span className={getComparisonClass(prop2.constructionYear, prop1.constructionYear, true)}>
              {prop2.constructionYear || '-'}
            </span>,
            <Calendar className="w-4 h-4" />
          )}

          {renderComparisonRow(
            'Hiss',
            prop1.hasElevator ? <span className="text-green-600 font-semibold">Ja</span> : <span className="text-muted-foreground">Nej</span>,
            prop2.hasElevator ? <span className="text-green-600 font-semibold">Ja</span> : <span className="text-muted-foreground">Nej</span>,
            <ArrowUpDown className="w-4 h-4" />
          )}

          {renderComparisonRow(
            'Balkong',
            prop1.hasBalcony ? <span className="text-green-600 font-semibold">Ja</span> : <span className="text-muted-foreground">Nej</span>,
            prop2.hasBalcony ? <span className="text-green-600 font-semibold">Ja</span> : <span className="text-muted-foreground">Nej</span>,
            <LayoutDashboard className="w-4 h-4" />
          )}
        </div>

        {/* Action buttons - matching grid layout */}
        <div className="grid grid-cols-[1fr_2fr_2fr] gap-6 mt-4">
          <div className="flex items-center pl-4">
            <Button variant="outline" size="sm" onClick={clearComparison} className="hover:bg-hero-gradient hover:text-white hover:border-transparent transition-all">
              Rensa jämförelse
            </Button>
          </div>
          <div className="flex justify-center">
            <Link to={`/fastighet/${prop1.id}`}>
              <Button variant="outline" size="sm" className="hover:bg-hero-gradient hover:text-white hover:border-transparent transition-all">
                Visa fastighet
              </Button>
            </Link>
          </div>
          <div className="flex justify-center">
            <Link to={`/fastighet/${prop2.id}`}>
              <Button variant="outline" size="sm" className="hover:bg-hero-gradient hover:text-white hover:border-transparent transition-all">
                Visa fastighet
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}