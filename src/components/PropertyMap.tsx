import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Card, CardContent } from "@/components/ui/card";

interface PropertyMapProps {
  address: string;
  location: string;
}

const PropertyMap = ({ address, location }: PropertyMapProps) => {
  const [coordinates, setCoordinates] = useState({ lat: 59.3293, lng: 18.0686 }); // Default: Stockholm
  
  // Temporary API key placeholder - users should add their own Google Maps API key
  const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

  useEffect(() => {
    // Simple geocoding using nominatim (free alternative)
    const geocodeAddress = async () => {
      const fullAddress = `${address}, ${location}, Sverige`;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
        );
        const data = await response.json();
        if (data && data[0]) {
          setCoordinates({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    };

    geocodeAddress();
  }, [address, location]);

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.5rem',
  };

  if (API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Karta</h2>
          <div className="w-full h-[400px] rounded-lg bg-muted flex items-center justify-center">
            <p className="text-muted-foreground text-center px-4">
              För att visa Google Maps behöver du lägga till din API-nyckel.<br />
              <a 
                href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Hämta API-nyckel här
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Karta</h2>
        <LoadScript googleMapsApiKey={API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={coordinates}
            zoom={15}
          >
            <Marker position={coordinates} />
          </GoogleMap>
        </LoadScript>
      </CardContent>
    </Card>
  );
};

export default PropertyMap;
