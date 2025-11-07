import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Property } from "@/components/PropertyGrid";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

    // Function to create colored icons based on property type
    const createColoredIcon = (type: string) => {
      let color = '#3b82f6'; // Default blue
      
      switch(type) {
        case 'Villa':
          color = '#3b82f6'; // Blue
          break;
        case 'Lägenhet':
          color = '#22c55e'; // Green
          break;
        case 'Radhus':
          color = '#a855f7'; // Purple
          break;
        default:
          color = '#f59e0b'; // Orange for others
      }

      const svgIcon = `
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
          <circle cx="12.5" cy="12.5" r="7" fill="white"/>
        </svg>
      `;

      return L.divIcon({
        html: svgIcon,
        className: 'custom-marker',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    };

    // Add markers
    propertiesWithCoords.forEach((property) => {
      const icon = createColoredIcon(property.type);
      const marker = L.marker([property.lat, property.lng], { icon }).addTo(map);
      
      // Find the property in allProperties to get the image
      const fullProperty = properties.find(p => p.id === property.id);
      const imageUrl = fullProperty?.image || '';
      
      const popupContent = `
        <div style="min-width: 250px; max-width: 300px;">
          ${imageUrl ? `<img src="${imageUrl}" alt="${property.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 0.5rem; margin-bottom: 0.5rem;" />` : ''}
          <h3 style="font-weight: bold; font-size: 0.875rem; margin-bottom: 0.25rem;">${property.title}</h3>
          <p style="font-size: 0.75rem; color: #666; margin-bottom: 0.25rem;">${property.address}</p>
          <p style="font-size: 0.75rem; color: #666; margin-bottom: 0.5rem;">${property.location}</p>
          <p style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.5rem;">${property.price}</p>
          <p style="font-size: 0.75rem; margin-bottom: 0.75rem;">
            ${property.bedrooms} rum • ${property.bathrooms} badrum • ${property.area} m²
          </p>
          <a href="/fastighet/${property.id}" style="display: inline-block; width: 100%; text-align: center; padding: 0.5rem; background-color: hsl(var(--primary)); color: white; border-radius: 0.375rem; text-decoration: none; font-size: 0.875rem;">
            Visa detaljer
          </a>
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'property-popup'
      });
    });

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [propertiesWithCoords, loading, properties]);

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
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Kartvy över alla fastigheter</h2>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>Villa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Lägenhet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
              <span>Radhus</span>
            </div>
          </div>
        </div>
        <div 
          ref={mapRef}
          style={{ height: '600px', width: '100%', borderRadius: '0.5rem' }}
        />
      </CardContent>
    </Card>
  );
};

export default AllPropertiesMap;
