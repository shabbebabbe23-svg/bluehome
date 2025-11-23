import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, Bike, PersonStanding } from "lucide-react";

interface PropertyDetailMapProps {
  address: string;
  location: string;
}

const PropertyDetailMap = ({ address, location }: PropertyDetailMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<any>(null);
  const [fromAddress, setFromAddress] = useState(`${address}, ${location}`);
  const [toAddress, setToAddress] = useState('');
  const [travelMode, setTravelMode] = useState<'driving' | 'cycling' | 'walking'>('driving');
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

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
      if (routingControlRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [address, location]);

  const handleRouteSearch = async () => {
    if (!mapInstanceRef.current || !fromAddress || !toAddress) return;

    try {
      // Geocode from address
      const fromResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fromAddress)}`
      );
      const fromData = await fromResponse.json();

      // Geocode to address
      const toResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(toAddress)}`
      );
      const toData = await toResponse.json();

      if (fromData[0] && toData[0]) {
        const fromLatLng = L.latLng(parseFloat(fromData[0].lat), parseFloat(fromData[0].lon));
        const toLatLng = L.latLng(parseFloat(toData[0].lat), parseFloat(toData[0].lon));

        // Remove existing routing control if any
        if (routingControlRef.current) {
          mapInstanceRef.current.removeControl(routingControlRef.current);
        }

        // Determine router based on travel mode
        const getRouter = () => {
          const baseUrl = 'https://router.project-osrm.org/route/v1';
          return (L as any).Routing.osrmv1({
            serviceUrl: `${baseUrl}/${travelMode === 'driving' ? 'car' : travelMode === 'cycling' ? 'bike' : 'foot'}`,
            profile: travelMode === 'driving' ? 'car' : travelMode === 'cycling' ? 'bike' : 'foot'
          });
        };

        // Create new routing control
        routingControlRef.current = (L as any).Routing.control({
          waypoints: [fromLatLng, toLatLng],
          router: getRouter(),
          routeWhileDragging: true,
          showAlternatives: false,
          lineOptions: {
            styles: [{ color: '#0069D9', weight: 4 }]
          },
          createMarker: function(i: number, wp: any) {
            const svgIcon = `
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="${i === 0 ? '#22c55e' : '#ef4444'}" stroke="white" stroke-width="2"/>
                <circle cx="16" cy="16" r="6" fill="white"/>
              </svg>
            `;
            return L.marker(wp.latLng, {
              icon: L.divIcon({
                html: svgIcon,
                className: 'custom-marker',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })
            });
          }
        }).addTo(mapInstanceRef.current);

        // Zoom map to fit the entire route and extract distance/time
        routingControlRef.current.on('routesfound', function(e: any) {
          const routes = e.routes;
          const bounds = L.latLngBounds([fromLatLng, toLatLng]);
          
          if (routes[0]) {
            // Extract distance and time
            const distanceKm = (routes[0].summary.totalDistance / 1000).toFixed(1);
            const durationMin = Math.round(routes[0].summary.totalTime / 60);
            const hours = Math.floor(durationMin / 60);
            const minutes = durationMin % 60;
            const durationStr = hours > 0 ? `${hours} tim ${minutes} min` : `${minutes} min`;
            
            setRouteInfo({
              distance: `${distanceKm} km`,
              duration: durationStr
            });

            // Extend bounds with route coordinates
            if (routes[0].coordinates) {
              routes[0].coordinates.forEach((coord: any) => {
                bounds.extend(L.latLng(coord.lat, coord.lng));
              });
            }
          }
          
          mapInstanceRef.current?.fitBounds(bounds, { padding: [50, 50] });
        });
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
