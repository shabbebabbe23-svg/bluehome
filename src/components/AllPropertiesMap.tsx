import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from "@/components/ui/card";
import { Property } from "@/components/PropertyGrid";
import { Home, Building, TreePine, Square, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';

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
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const routeLayerId = 'route-layer';
  const routeSourceId = 'route-source';

  // Show fallback if no Mapbox token
  if (!MAPBOX_TOKEN) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Kartvy över alla fastigheter</h2>
          <div className="w-full h-[600px] rounded-lg bg-muted flex items-center justify-center">
            <p className="text-muted-foreground text-center px-4">
              Mapbox är inte konfigurerat. Ladda om sidan.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    const geocodeProperties = async () => {
      if (!MAPBOX_TOKEN) return;
      
      const geocoded: PropertyWithCoords[] = [];
      
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        const fullAddress = `${property.address}, ${property.location}, Sverige`;
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_TOKEN}`
          );
          const data = await response.json();
          
          if (data.features && data.features[0]) {
            const [lng, lat] = data.features[0].center;
            geocoded.push({
              ...property,
              lat,
              lng,
            });
          }
          
          // Update progress
          setGeocodingProgress(Math.round(((i + 1) / properties.length) * 100));
          
          // Update map with current geocoded properties
          setPropertiesWithCoords([...geocoded]);
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
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
    if (!mapRef.current || propertiesWithCoords.length === 0 || loading || !MAPBOX_TOKEN) return;

    // Clean up existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Center on first property or Stockholm
    const center: [number, number] = propertiesWithCoords.length > 0 
      ? [propertiesWithCoords[0].lng, propertiesWithCoords[0].lat]
      : [18.0686, 59.3293];

    // Create map
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: center,
      zoom: 11,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Function to create colored icons based on property type
    const createColoredIcon = (type: string) => {
      let color = '#3b82f6';
      
      switch(type) {
        case 'Villa':
          color = '#3b82f6';
          break;
        case 'Lägenhet':
          color = '#22c55e';
          break;
        case 'Radhus':
          color = '#a855f7';
          break;
        case 'Parhus':
          color = '#14b8a6';
          break;
        case 'Tomt':
          color = '#f59e0b';
          break;
        case 'Fritidshus':
          color = '#ec4899';
          break;
        default:
          color = '#6b7280';
      }

      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
          <circle cx="12.5" cy="12.5" r="7" fill="white"/>
        </svg>
      `;
      el.style.cursor = 'pointer';
      return el;
    };

    // Add markers
    propertiesWithCoords.forEach((property) => {
      const el = createColoredIcon(property.type);
      
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

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([property.lng, property.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
        .addTo(map);
      
      markersRef.current.push(marker);
    });

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [propertiesWithCoords, loading, properties]);

  const handleRouteSearch = async () => {
    if (!mapInstanceRef.current || !fromAddress || !toAddress || !MAPBOX_TOKEN) return;

    const map = mapInstanceRef.current;

    try {
      // Geocode from address
      const fromResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fromAddress + ', Sverige')}.json?access_token=${MAPBOX_TOKEN}`
      );
      const fromData = await fromResponse.json();

      // Geocode to address
      const toResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(toAddress + ', Sverige')}.json?access_token=${MAPBOX_TOKEN}`
      );
      const toData = await toResponse.json();

      if (fromData.features?.[0] && toData.features?.[0]) {
        const fromCoords = fromData.features[0].center;
        const toCoords = toData.features[0].center;

        // Get directions from Mapbox
        const directionsResponse = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${fromCoords[0]},${fromCoords[1]};${toCoords[0]},${toCoords[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
        );
        const directionsData = await directionsResponse.json();

        if (directionsData.routes && directionsData.routes[0]) {
          const route = directionsData.routes[0];

          // Remove existing route layer if any
          if (map.getLayer(routeLayerId)) {
            map.removeLayer(routeLayerId);
          }
          if (map.getSource(routeSourceId)) {
            map.removeSource(routeSourceId);
          }

          // Add route to map
          map.addSource(routeSourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            }
          });

          map.addLayer({
            id: routeLayerId,
            type: 'line',
            source: routeSourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#0069D9',
              'line-width': 6,
              'line-opacity': 0.8
            }
          });

          // Fit map to route bounds
          const coordinates = route.geometry.coordinates;
          const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
            return bounds.extend(coord as [number, number]);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

          map.fitBounds(bounds, {
            padding: 50
          });
        }
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
              <div className="w-6 h-6 rounded bg-teal-500 flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span>Parhus</span>
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
