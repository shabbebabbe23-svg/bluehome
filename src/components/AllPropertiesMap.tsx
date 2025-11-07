import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

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

  // Initialize map when coordinates are loaded
  useEffect(() => {
    if (!mapRef.current || propertiesWithCoords.length === 0 || loading) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Center on first property or Stockholm
    const center: [number, number] = propertiesWithCoords.length > 0 
      ? [propertiesWithCoords[0].lat, propertiesWithCoords[0].lng]
      : [59.3293, 18.0686];

    // Create map
    const map = L.map(mapRef.current).setView(center, 11);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create custom icon
    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Add markers
    propertiesWithCoords.forEach((property) => {
      const marker = L.marker([property.lat, property.lng], { icon: customIcon }).addTo(map);
      
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; font-size: 0.875rem; margin-bottom: 0.25rem;">${property.title}</h3>
          <p style="font-size: 0.75rem; color: #666; margin-bottom: 0.25rem;">${property.address}</p>
          <p style="font-size: 0.75rem; color: #666; margin-bottom: 0.5rem;">${property.location}</p>
          <p style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.5rem;">${property.price}</p>
          <p style="font-size: 0.75rem; margin-bottom: 0.5rem;">
            ${property.bedrooms} rum • ${property.bathrooms} badrum • ${property.area} m²
          </p>
          <a href="/fastighet/${property.id}" style="display: inline-block; width: 100%; text-align: center; padding: 0.5rem; background-color: hsl(var(--primary)); color: white; border-radius: 0.375rem; text-decoration: none; font-size: 0.875rem;">
            Visa detaljer
          </a>
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [propertiesWithCoords, loading]);

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

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Kartvy</h2>
        <div 
          ref={mapRef}
          style={{ height: '600px', width: '100%', borderRadius: '0.5rem' }}
        />
      </CardContent>
    </Card>
  );
};

export default AllPropertiesMap;
