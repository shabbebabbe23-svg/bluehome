import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Property } from "@/components/PropertyGrid";
import { Home, Building, TreePine, Square, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

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
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    const geocodeProperties = async () => {
      const geocoded: PropertyWithCoords[] = [];
      
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
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
          
          // Update progress
          setGeocodingProgress(Math.round(((i + 1) / properties.length) * 100));
          
          // Update map with current geocoded properties
          setPropertiesWithCoords([...geocoded]);
          
          // Rate limiting - reduced to 500ms for faster loading
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Geocoding error for ${property.address}:`, error);
        }
      }
      
      setLoading(false);
    };

    if (properties.length > 0) {
      geocodeProperties();
    }
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

    // Add satellite tile layer from Esri
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
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
        case 'Tomt':
          color = '#f59e0b'; // Orange
          break;
        case 'Fritidshus':
          color = '#ec4899'; // Pink
          break;
        default:
          color = '#6b7280'; // Gray for others
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
      if (routingControlRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [propertiesWithCoords, loading, properties]);

  const handleRouteSearch = async () => {
    if (!mapInstanceRef.current || !fromAddress || !toAddress) return;

    try {
      // Geocode from address
      const fromResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fromAddress + ', Sverige')}`
      );
      const fromData = await fromResponse.json();

      // Geocode to address
      const toResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(toAddress + ', Sverige')}`
      );
      const toData = await toResponse.json();

      if (fromData[0] && toData[0]) {
        const fromLatLng = L.latLng(parseFloat(fromData[0].lat), parseFloat(fromData[0].lon));
        const toLatLng = L.latLng(parseFloat(toData[0].lat), parseFloat(toData[0].lon));

        // Remove existing routing control if any
        if (routingControlRef.current) {
          mapInstanceRef.current.removeControl(routingControlRef.current);
        }

        // Create routing control
        routingControlRef.current = (L as any).Routing.control({
          waypoints: [fromLatLng, toLatLng],
          routeWhileDragging: true,
          showAlternatives: true,
          lineOptions: {
            styles: [{ color: 'hsl(var(--primary))', opacity: 0.8, weight: 6 }]
          },
          createMarker: function(i: number, waypoint: any, n: number) {
            const marker = L.marker(waypoint.latLng, {
              draggable: true,
              icon: L.divIcon({
                html: `<div style="background: hsl(var(--primary)); color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">${i === 0 ? 'A' : 'B'}</div>`,
                className: 'custom-route-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              })
            });
            return marker;
          }
        }).addTo(mapInstanceRef.current);

        // Fit map to route
        const bounds = L.latLngBounds([fromLatLng, toLatLng]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (error) {
      console.error('Routing error:', error);
    }
  };

  if (loading && propertiesWithCoords.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Kartvy</h2>
          <div className="w-full h-[600px] rounded-lg bg-muted flex flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">Laddar kartan och placerar ut fastigheter...</p>
            <div className="w-64 h-2 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${geocodingProgress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{geocodingProgress}% klar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Kartvy över alla fastigheter</h2>
        
        {/* Route Search */}
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Vägbeskrivning och avstånd</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Från adress..."
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              className="bg-background"
            />
            <Input
              placeholder="Till adress..."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="bg-background"
            />
            <Button 
              onClick={handleRouteSearch}
              disabled={!fromAddress || !toAddress}
              className="w-full bg-primary hover:bg-hero-gradient hover:text-white transition-colors"
            >
              Beräkna rutt
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="font-semibold">Fastighetstyper:</div>
          <div className="flex gap-3 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span>Villa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center">
                <Building className="w-4 h-4 text-white" />
              </div>
              <span>Lägenhet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center">
                <div className="flex -ml-0.5">
                  <Home className="w-3 h-3 text-white -mr-0.5" />
                  <Home className="w-3 h-3 text-white" />
                </div>
              </div>
              <span>Radhus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center">
                <Square className="w-4 h-4 text-white" />
              </div>
              <span>Tomt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-pink-500 flex items-center justify-center">
                <TreePine className="w-4 h-4 text-white" />
              </div>
              <span>Fritidshus</span>
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
