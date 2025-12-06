import React from 'react';
import { Bed, Bath, Square, Calendar, Building2, ArrowUpDown, LayoutDashboard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useComparison } from '@/contexts/ComparisonContext';
import { Link } from 'react-router-dom';

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

  const parsePrice = (price: string) => {
    return parseInt(price.replace(/\D/g, '')) || 0;
  };

  const renderComparisonRow = (
    label: string,
    value1: React.ReactNode,
    value2: React.ReactNode,
    icon?: React.ReactNode
  ) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        {icon}
        {label}
      </div>
      <div className="text-center font-medium">{value1}</div>
      <div className="text-center font-medium">{value2}</div>
    </div>
  );

  return (
    <Dialog open={isCompareModalOpen} onOpenChange={setIsCompareModalOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Jämför fastigheter
          </DialogTitle>
        </DialogHeader>

        {/* Property images header */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div></div>
          {[prop1, prop2].map((prop) => (
            <div key={prop.id} className="text-center">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                <img
                  src={prop.image}
                  alt={prop.title}
                  className="w-full h-full object-cover"
                />
                {prop.isSold && (
                  <Badge className="absolute top-2 left-2 bg-destructive">Såld</Badge>
                )}
              </div>
              <h3 className="font-semibold text-sm line-clamp-1">{prop.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {prop.address || prop.location}
              </p>
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
            <Badge variant="secondary">{prop1.type}</Badge>,
            <Badge variant="secondary">{prop2.type}</Badge>
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
            prop1.constructionYear || '-',
            prop2.constructionYear || '-',
            <Calendar className="w-4 h-4" />
          )}

          {renderComparisonRow(
            'Hiss',
            prop1.hasElevator ? <span className="text-green-600">Ja</span> : <span className="text-muted-foreground">Nej</span>,
            prop2.hasElevator ? <span className="text-green-600">Ja</span> : <span className="text-muted-foreground">Nej</span>,
            <ArrowUpDown className="w-4 h-4" />
          )}

          {renderComparisonRow(
            'Balkong',
            prop1.hasBalcony ? <span className="text-green-600">Ja</span> : <span className="text-muted-foreground">Nej</span>,
            prop2.hasBalcony ? <span className="text-green-600">Ja</span> : <span className="text-muted-foreground">Nej</span>,
            <LayoutDashboard className="w-4 h-4" />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" onClick={clearComparison}>
            Rensa jämförelse
          </Button>
          <div className="flex gap-2">
            <Link to={`/fastighet/${prop1.id}`}>
              <Button variant="outline" size="sm">
                Visa {prop1.title.slice(0, 15)}...
              </Button>
            </Link>
            <Link to={`/fastighet/${prop2.id}`}>
              <Button variant="outline" size="sm">
                Visa {prop2.title.slice(0, 15)}...
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
