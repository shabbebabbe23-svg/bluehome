import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Eye, Clock, TrendingUp, Image, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyStats {
  property_id: string;
  property_title: string;
  total_views: number;
  avg_time_spent: number;
  image_views: number;
  avg_images_per_session: number;
  visitor_locations: { city: string; region: string; count: number }[];
}

export const AgentStatistics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PropertyStats[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalAvgTime, setTotalAvgTime] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);

      try {
        // Fetch all properties for the agent
        const { data: properties, error: propertiesError } = await supabase
          .from("properties")
          .select("id, title, address")
          .eq("user_id", user.id);

        if (propertiesError) throw propertiesError;

        if (!properties || properties.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch views for each property
        const propertyIds = properties.map(p => p.id);
        const { data: views, error: viewsError } = await supabase
          .from("property_views")
          .select("property_id, time_spent_seconds, visitor_city, visitor_region")
          .in("property_id", propertyIds);

        if (viewsError) throw viewsError;

        // Fetch image views for properties
        const { data: imageViews, error: imageViewsError } = await supabase
          .from("image_views")
          .select("property_id, session_id")
          .in("property_id", propertyIds);

        if (imageViewsError) throw imageViewsError;

        // Calculate stats per property
        const propertyStatsMap = new Map<string, PropertyStats>();
        let totalViewCount = 0;
        let totalTimeSum = 0;
        let viewsWithTime = 0;

        properties.forEach(prop => {
          propertyStatsMap.set(prop.id, {
            property_id: prop.id,
            property_title: prop.address || prop.title,
            total_views: 0,
            avg_time_spent: 0,
            image_views: 0,
            avg_images_per_session: 0,
            visitor_locations: [],
          });
        });

        // Track views with actual time spent for each property
        const propertyTimeData = new Map<string, { totalTime: number; viewsWithTime: number }>();

        views?.forEach(view => {
          const stat = propertyStatsMap.get(view.property_id);
          if (stat) {
            stat.total_views += 1;
            totalViewCount += 1;
            
            // Only count time if it's > 0
            const timeSpent = view.time_spent_seconds || 0;
            if (timeSpent > 0) {
              const timeData = propertyTimeData.get(view.property_id) || { totalTime: 0, viewsWithTime: 0 };
              timeData.totalTime += timeSpent;
              timeData.viewsWithTime += 1;
              propertyTimeData.set(view.property_id, timeData);
              
              totalTimeSum += timeSpent;
              viewsWithTime += 1;
            }
          }
        });

        // Calculate image view stats
        imageViews?.forEach(imgView => {
          const stat = propertyStatsMap.get(imgView.property_id);
          if (stat) {
            stat.image_views += 1;
          }
        });

        // Calculate averages and location distribution
        propertyStatsMap.forEach(stat => {
          if (stat.total_views > 0) {
            // Calculate average time only from views with actual time data
            const timeData = propertyTimeData.get(stat.property_id);
            if (timeData && timeData.viewsWithTime > 0) {
              stat.avg_time_spent = Math.round(timeData.totalTime / timeData.viewsWithTime);
            } else {
              stat.avg_time_spent = 0;
            }
            
            // Calculate unique sessions for this property
            const propertyImageViews = imageViews?.filter(iv => iv.property_id === stat.property_id) || [];
            const uniqueSessions = new Set(propertyImageViews.map(iv => iv.session_id)).size;
            stat.avg_images_per_session = uniqueSessions > 0 ? 
              Math.round(stat.image_views / uniqueSessions) : 0;
            
            // Calculate location distribution
            const locationMap = new Map<string, number>();
            const propertyViews = views?.filter(v => v.property_id === stat.property_id) || [];
            propertyViews.forEach(view => {
              if (view.visitor_city && view.visitor_region) {
                const key = `${view.visitor_city}, ${view.visitor_region}`;
                locationMap.set(key, (locationMap.get(key) || 0) + 1);
              }
            });
            
            stat.visitor_locations = Array.from(locationMap.entries())
              .map(([location, count]) => {
                const [city, region] = location.split(', ');
                return { city, region, count };
              })
              .sort((a, b) => b.count - a.count)
              .slice(0, 5); // Top 5 locations
          }
        });

        const statsArray = Array.from(propertyStatsMap.values())
          .sort((a, b) => b.total_views - a.total_views);

        setStats(statsArray);
        setTotalViews(totalViewCount);
        // Calculate average only from views that have time data
        setTotalAvgTime(viewsWithTime > 0 ? Math.round(totalTimeSum / viewsWithTime) : 0);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totala klick</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              På alla dina objekt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genomsnittlig tid</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalAvgTime)}</div>
            <p className="text-xs text-muted-foreground">
              Per visning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiva objekt</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.length}</div>
            <p className="text-xs text-muted-foreground">
              Med visningar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Property Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Statistik per objekt
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ingen statistik än</p>
              <p className="text-sm">Klick kommer att visas här när personer besöker dina objekt</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.property_id}
                  className="flex flex-col p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium flex-1">{stat.property_title}</h4>
                    <div className="text-2xl font-bold text-primary ml-2">
                      {stat.total_views}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {stat.total_views} visningar
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(stat.avg_time_spent)} snitt
                    </span>
                    <span className="flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      {stat.avg_images_per_session} bilder/besök
                    </span>
                  </div>
                  {stat.visitor_locations.length > 0 && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3" />
                        <span className="font-medium">Besökare från:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {stat.visitor_locations.map((loc, idx) => (
                          <span key={idx} className="bg-muted px-2 py-0.5 rounded">
                            {loc.city}, {loc.region} ({loc.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
