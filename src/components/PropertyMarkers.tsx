import { Marker, Popup } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PropertyWithCoords {
  id: number;
  title: string;
  price: string;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  lat: number;
  lng: number;
}

interface PropertyMarkersProps {
  properties: PropertyWithCoords[];
}

const PropertyMarkers = ({ properties }: PropertyMarkersProps) => {
  return (
    <>
      {properties.map((property) => (
        <Marker key={property.id} position={[property.lat, property.lng]}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-sm mb-1">{property.title}</h3>
              <p className="text-xs text-muted-foreground mb-1">{property.address}</p>
              <p className="text-xs text-muted-foreground mb-2">{property.location}</p>
              <p className="font-semibold text-sm mb-2">{property.price}</p>
              <p className="text-xs mb-2">
                {property.bedrooms} rum • {property.bathrooms} badrum • {property.area} m²
              </p>
              <Link to={`/fastighet/${property.id}`}>
                <Button size="sm" className="w-full">
                  Visa detaljer
                </Button>
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default PropertyMarkers;
