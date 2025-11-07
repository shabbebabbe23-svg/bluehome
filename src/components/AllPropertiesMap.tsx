import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Property {
  id: number;
  title: string;
  price: string;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
}

interface AllPropertiesMapProps {
  properties: Property[];
}

interface PropertyWithCoords extends Property {
  lat: number;
  lng: number;
}

const AllPropertiesMap = ({ properties }: AllPropertiesMapProps) => {
  const [propertiesWithCoords, setPropertiesWithCoords] = useState<PropertyWithCoords[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const geocodeProperties = async () => {
      const geocoded: PropertyWithCoords[] = [];
      
      for (const property of properties) {
        const fullAddress = `${property.address}, ${property.location}, Sverige`;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
          );
          const data = await response.json();
          
          if (data && data[0]) {
            geocoded.push({
              ...property,
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
          }
          
          // Rate limiting - wait between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Geocoding error for ${property.address}:`, error);
        }
      }
      
      setPropertiesWithCoords(geocoded);
      setLoading(false);
    };

    geocodeProperties();
  }, [properties]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Kartvy</h2>
          <div className="w-full h-[600px] rounded-lg bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">Laddar karta...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Center map on Stockholm by default or first property
  const center: [number, number] = propertiesWithCoords.length > 0 
    ? [propertiesWithCoords[0].lat, propertiesWithCoords[0].lng]
    : [59.3293, 18.0686];

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Kartvy</h2>
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: '600px', width: '100%', borderRadius: '0.5rem' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {propertiesWithCoords.map((property) => (
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
        </MapContainer>
      </CardContent>
    </Card>
  );
};

export default AllPropertiesMap;
