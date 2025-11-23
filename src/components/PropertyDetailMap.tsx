import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from "@/components/ui/card";

interface PropertyDetailMapProps {
  address: string;
  location: string;
}

const PropertyDetailMap = ({ address, location }: PropertyDetailMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const geocodeAddress = async () => {
      const fullAddress = `${address}, ${location}, Sverige`;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
        );
        const data = await response.json();
        
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);

          // Initialize map
          if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([lat, lng], 15);

            // Add satellite tile layer
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
              maxZoom: 19
            }).addTo(mapInstanceRef.current);

            // Create custom icon
            const createColoredIcon = () => {
              const svgIcon = `
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#0069D9" stroke="white" stroke-width="2"/>
                  <circle cx="16" cy="16" r="6" fill="white"/>
                </svg>
              `;
              return L.divIcon({
                html: svgIcon,
                className: 'custom-marker',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              });
            };

            // Add marker
            const marker = L.marker([lat, lng], { icon: createColoredIcon() }).addTo(mapInstanceRef.current);
            
            // Add popup
            marker.bindPopup(`
              <div style="font-family: system-ui; padding: 8px;">
                <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${address}</strong>
                <span style="color: #666; font-size: 12px;">${location}</span>
              </div>
            `);
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    };

    geocodeAddress();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [address, location]);

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Karta</h2>
        <div 
          ref={mapRef} 
          className="w-full h-[400px] rounded-lg"
          style={{ zIndex: 0 }}
        />
      </CardContent>
    </Card>
  );
};

export default PropertyDetailMap;
