import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, Bike, PersonStanding } from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';

interface PropertyDetailMapProps {
  address: string;
  location: string;
}

const PropertyDetailMap = ({ address, location }: PropertyDetailMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const routeLayerId = 'route-layer';
  const routeSourceId = 'route-source';
  const [fromAddress, setFromAddress] = useState(`${address}, ${location}`);
  const [toAddress, setToAddress] = useState('');
  const [travelMode, setTravelMode] = useState<'driving' | 'cycling' | 'walking'>('driving');
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [propertyCoords, setPropertyCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!mapRef.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const geocodeAddress = async () => {
      const fullAddress = `${address}, ${location}, Sverige`;
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_TOKEN}`
        );
        const data = await response.json();
        
        if (data.features && data.features[0]) {
          const [lng, lat] = data.features[0].center;
          setPropertyCoords([lng, lat]);

          // Initialize map
          if (!mapInstanceRef.current) {
            const map = new mapboxgl.Map({
              container: mapRef.current,
              style: 'mapbox://styles/mapbox/satellite-streets-v12',
              center: [lng, lat],
              zoom: 15,
            });

            map.addControl(new mapboxgl.NavigationControl(), 'top-right');

            // Add marker
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.innerHTML = `
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#0069D9" stroke="white" stroke-width="2"/>
                <circle cx="16" cy="16" r="6" fill="white"/>
              </svg>
            `;
            el.style.cursor = 'pointer';

            const marker = new mapboxgl.Marker({ element: el })
              .setLngLat([lng, lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                  .setHTML(`
                    <div style="font-family: system-ui; padding: 8px;">
                      <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${address}</strong>
                      <span style="color: #666; font-size: 12px;">${location}</span>
                    </div>
                  `)
              )
              .addTo(map);

            markerRef.current = marker;
            mapInstanceRef.current = map;
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    };

    geocodeAddress();

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [address, location]);

  const handleRouteSearch = async () => {
    if (!mapInstanceRef.current || !fromAddress || !toAddress || !MAPBOX_TOKEN) return;

    const map = mapInstanceRef.current;

    try {
      // Geocode from address
      const fromResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fromAddress)}.json?access_token=${MAPBOX_TOKEN}`
      );
      const fromData = await fromResponse.json();

      // Geocode to address
      const toResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(toAddress)}.json?access_token=${MAPBOX_TOKEN}`
      );
      const toData = await toResponse.json();

      if (fromData.features?.[0] && toData.features?.[0]) {
        const fromCoords = fromData.features[0].center;
        const toCoords = toData.features[0].center;

        // Map travel mode to Mapbox profile
        const profile = travelMode === 'driving' ? 'driving' : travelMode === 'cycling' ? 'cycling' : 'walking';

        // Get directions from Mapbox
        const directionsResponse = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/${profile}/${fromCoords[0]},${fromCoords[1]};${toCoords[0]},${toCoords[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
        );
        const directionsData = await directionsResponse.json();

        if (directionsData.routes && directionsData.routes[0]) {
          const route = directionsData.routes[0];
          
          // Extract distance and duration
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.round(route.duration / 60);
          const hours = Math.floor(durationMin / 60);
          const minutes = durationMin % 60;
          const durationStr = hours > 0 ? `${hours} tim ${minutes} min` : `${minutes} min`;
          
          setRouteInfo({
            distance: `${distanceKm} km`,
            duration: durationStr
          });

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
              'line-width': 4
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
      console.error('Route calculation error:', error);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Karta</h2>
        <div 
          ref={mapRef} 
          className="w-full h-[400px] rounded-lg mb-4"
          style={{ zIndex: 0 }}
        />
        
        {/* Route Info Display */}
        {routeInfo && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold">Avstånd:</span>
                <span className="ml-2">{routeInfo.distance}</span>
              </div>
              <div>
                <span className="text-sm font-semibold">Restid:</span>
                <span className="ml-2">{routeInfo.duration}</span>
              </div>
            </div>
          </div>
        )}

        {/* Route Search */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Beräkna vägbeskrivning</h3>
          
          {/* Travel Mode Selection */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={travelMode === 'driving' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTravelMode('driving')}
              className="flex-1"
            >
              <Car className="w-4 h-4 mr-1" />
              Bil
            </Button>
            <Button
              variant={travelMode === 'cycling' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTravelMode('cycling')}
              className="flex-1"
            >
              <Bike className="w-4 h-4 mr-1" />
              Cykel
            </Button>
            <Button
              variant={travelMode === 'walking' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTravelMode('walking')}
              className="flex-1"
            >
              <PersonStanding className="w-4 h-4 mr-1" />
              Gång
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Från adress..."
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
            />
            <Input
              placeholder="Till adress..."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleRouteSearch}
            className="w-full"
            disabled={!fromAddress || !toAddress}
          >
            Visa vägbeskrivning
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyDetailMap;
