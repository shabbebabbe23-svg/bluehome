import { useState } from "react";
import { Heart, MapPin, Bed, Bath, Square, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface PropertyCardProps {
  id: number;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  hoverImage?: string;
  type: string;
  isNew?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: number) => void;
}

const PropertyCard = ({
  id,
  title,
  price,
  location,
  bedrooms,
  bathrooms,
  area,
  image,
  hoverImage,
  type,
  isNew = false,
  isFavorite = false,
  onFavoriteToggle,
}: PropertyCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card className="group overflow-hidden bg-property shadow-property hover:shadow-property-hover transition-all duration-300 hover:-translate-y-1 animate-scale-in">
      <div 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={isHovered && hoverImage ? hoverImage : image}
          alt={title}
          className="w-full h-48 object-cover transition-all duration-500 group-hover:scale-105"
        />
        
        {/* Overlay with badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isNew && (
            <Badge className="bg-success text-white">
              Ny
            </Badge>
          )}
          <Badge variant="secondary" className="bg-white/90 text-foreground">
            {type}
          </Badge>
        </div>

        {/* Favorite button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 bg-white/90 hover:bg-white transition-colors group/heart"
          onClick={() => onFavoriteToggle?.(id)}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${
              isFavorite 
                ? "fill-red-500 text-red-500" 
                : "text-muted-foreground group-hover/heart:text-transparent group-hover/heart:bg-gradient-to-r group-hover/heart:from-primary group-hover/heart:to-secondary group-hover/heart:bg-clip-text"
            }`}
            style={
              !isFavorite 
                ? {
                    backgroundImage: "linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 36%))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                  }
                : undefined
            }
          />
        </Button>
      </div>

      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <span className="text-2xl font-bold text-primary">{price}</span>
        </div>

        <div className="flex items-center text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{location}</span>
        </div>

        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{area}m²</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Idag</span>
          </div>
        </div>

        <Link to={`/fastighet/${id}`}>
          <Button className="w-full bg-primary hover:bg-primary-glow transition-colors">
            Visa detaljer
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;