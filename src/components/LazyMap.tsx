import { lazy, Suspense } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Property } from "@/components/PropertyGrid";

const AllPropertiesMap = lazy(() => import('./AllPropertiesMap'));

interface LazyMapProps {
  properties: Property[];
}

const LazyMap = ({ properties }: LazyMapProps) => {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Kartvy</h2>
            <div className="w-full h-[600px] rounded-lg bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">Laddar karta...</p>
            </div>
          </CardContent>
        </Card>
      }
    >
      <AllPropertiesMap properties={properties} />
    </Suspense>
  );
};

export default LazyMap;
