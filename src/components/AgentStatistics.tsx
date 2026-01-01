import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Eye, Clock, TrendingUp, Image, MapPin, Mail, Loader2, Smartphone, Monitor, Tablet, Share2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageStat {
  image_index: number;
  image_url: string;
  views: number;
  avg_time_ms: number;
}

interface PropertyStats {
  property_id: string;
  property_title: string;
  total_views: number;
  avg_time_spent: number;
  image_views: number;
  avg_images_per_session: number;
  visitor_locations: { city: string; region: string; count: number }[];
  seller_email: string | null;
  device_stats: { mobile: number; desktop: number; tablet: number };
  top_images: ImageStat[];
  shares_count: number;
  viewing_registrations_count: number;
}

export const AgentStatistics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PropertyStats[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalAvgTime, setTotalAvgTime] = useState(0);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);

      try {
        // Fetch all properties for the agent
        const { data: properties, error: propertiesError } = await supabase
          .from("properties")
          .select("id, title, address, seller_email")
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
          .select("property_id, time_spent_seconds, visitor_city, visitor_region, device_type")
          .in("property_id", propertyIds);

        if (viewsError) throw viewsError;

        // Fetch image views for properties with time tracking
        const { data: imageViews, error: imageViewsError } = await supabase
          .from("image_views")
          .select("property_id, session_id, image_index, image_url, time_spent_ms")
          .in("property_id", propertyIds);

        if (imageViewsError) throw imageViewsError;

        // Fetch shares
        const { data: shares, error: sharesError } = await supabase
          .from("property_shares")
          .select("property_id")
          .in("property_id", propertyIds);

        if (sharesError) console.error("Error fetching shares:", sharesError);

        // Fetch viewing registrations
        const { data: registrations, error: registrationsError } = await supabase
          .from("viewing_registrations")
          .select("property_id")
          .in("property_id", propertyIds);

        if (registrationsError) console.error("Error fetching registrations:", registrationsError);

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
            seller_email: prop.seller_email || null,
            device_stats: { mobile: 0, desktop: 0, tablet: 0 },
            top_images: [],
            shares_count: 0,
            viewing_registrations_count: 0,
          });
        });

        // Track views with actual time spent for each property
        const propertyTimeData = new Map<string, { totalTime: number; viewsWithTime: number }>();

        views?.forEach(view => {
          const stat = propertyStatsMap.get(view.property_id);
          if (stat) {
            stat.total_views += 1;
            totalViewCount += 1;
            
            // Track device type
            const deviceType = view.device_type || 'unknown';
            if (deviceType === 'mobile') stat.device_stats.mobile += 1;
            else if (deviceType === 'tablet') stat.device_stats.tablet += 1;
            else if (deviceType === 'desktop') stat.device_stats.desktop += 1;
            
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

        // Calculate image view stats per property
        const propertyImageStats = new Map<string, Map<number, { views: number; totalTime: number; url: string }>>();
        
        imageViews?.forEach(imgView => {
          const stat = propertyStatsMap.get(imgView.property_id);
          if (stat) {
            stat.image_views += 1;
            
            // Track per-image stats
            if (!propertyImageStats.has(imgView.property_id)) {
              propertyImageStats.set(imgView.property_id, new Map());
            }
            const imageMap = propertyImageStats.get(imgView.property_id)!;
            const current = imageMap.get(imgView.image_index) || { views: 0, totalTime: 0, url: imgView.image_url || '' };
            current.views += 1;
            current.totalTime += imgView.time_spent_ms || 0;
            if (imgView.image_url) current.url = imgView.image_url;
            imageMap.set(imgView.image_index, current);
          }
        });

        // Count shares per property
        shares?.forEach(share => {
          const stat = propertyStatsMap.get(share.property_id);
          if (stat) stat.shares_count += 1;
        });

        // Count viewing registrations per property
        registrations?.forEach(reg => {
          const stat = propertyStatsMap.get(reg.property_id);
          if (stat) stat.viewing_registrations_count += 1;
        });

        // Calculate averages and location distribution
        propertyStatsMap.forEach((stat, propertyId) => {
          if (stat.total_views > 0) {
            // Calculate average time only from views with actual time data
            const timeData = propertyTimeData.get(propertyId);
            if (timeData && timeData.viewsWithTime > 0) {
              stat.avg_time_spent = Math.round(timeData.totalTime / timeData.viewsWithTime);
            } else {
              stat.avg_time_spent = 0;
            }
            
            // Calculate unique sessions for this property
            const propertyImageViews = imageViews?.filter(iv => iv.property_id === propertyId) || [];
            const uniqueSessions = new Set(propertyImageViews.map(iv => iv.session_id)).size;
            stat.avg_images_per_session = uniqueSessions > 0 ? 
              Math.round(stat.image_views / uniqueSessions) : 0;
            
            // Calculate top images
            const imageMap = propertyImageStats.get(propertyId);
            if (imageMap) {
              stat.top_images = Array.from(imageMap.entries())
                .map(([index, data]) => ({
                  image_index: index,
                  image_url: data.url,
                  views: data.views,
                  avg_time_ms: data.views > 0 ? Math.round(data.totalTime / data.views) : 0,
                }))
                .sort((a, b) => b.views - a.views)
                .slice(0, 5);
            }
            
            // Calculate location distribution
            const locationMap = new Map<string, number>();
            const propertyViews = views?.filter(v => v.property_id === propertyId) || [];
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

  const formatTimeMs = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return formatTime(seconds);
  };

  const sendStatisticsEmail = async (propertyId: string, sellerEmail: string | null) => {
    if (!sellerEmail) {
      toast.error("Ingen säljar-email registrerad för detta objekt");
      return;
    }

    setSendingEmail(propertyId);
    try {
      const { data, error } = await supabase.functions.invoke("send-property-statistics", {
        body: { property_id: propertyId }
      });

      if (error) throw error;

      toast.success(`Statistik skickad till ${sellerEmail}`);
    } catch (error) {
      console.error("Error sending statistics email:", error);
      toast.error("Kunde inte skicka statistik-mail");
    } finally {
      setSendingEmail(null);
    }
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
            <div className="grid grid-cols-1 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.property_id}
                  className="flex flex-col p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium text-lg flex-1">{stat.property_title}</h4>
                    <div className="text-2xl font-bold text-primary ml-2">
                      {stat.total_views}
                    </div>
                  </div>
                  
                  {/* Main Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span>{stat.total_views} visningar</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formatTime(stat.avg_time_spent)} snitt</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                      <span>{stat.shares_count} delningar</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{stat.viewing_registrations_count} anmälda</span>
                    </div>
                  </div>

                  {/* Device Stats */}
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">Enheter</h5>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Monitor className="w-4 h-4" />
                        <span>Desktop: {stat.device_stats.desktop}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Smartphone className="w-4 h-4" />
                        <span>Mobil: {stat.device_stats.mobile}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tablet className="w-4 h-4" />
                        <span>Surfplatta: {stat.device_stats.tablet}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Image */}
                  {stat.top_images.length > 0 && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        Populäraste bilden
                      </h5>
                      <div className="flex items-center gap-3">
                        {stat.top_images[0].image_url ? (
                          <img 
                            src={stat.top_images[0].image_url} 
                            alt={`Bild ${stat.top_images[0].image_index + 1}`}
                            className="w-16 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-muted rounded flex items-center justify-center text-xs">
                            #{stat.top_images[0].image_index + 1}
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="font-medium">{stat.top_images[0].views} visningar</span>
                          <span className="text-muted-foreground ml-2">
                            ({formatTimeMs(stat.top_images[0].avg_time_ms)} snitt)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Locations */}
                  {stat.visitor_locations.length > 0 && (
                    <div className="mb-4 text-xs text-muted-foreground">
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

                  {/* Send Email Button */}
                  <div className="pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendStatisticsEmail(stat.property_id, stat.seller_email)}
                      disabled={sendingEmail === stat.property_id || !stat.seller_email}
                      className="w-full"
                    >
                      {sendingEmail === stat.property_id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Skickar...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          {stat.seller_email ? `Skicka statistik till ${stat.seller_email}` : "Ingen säljar-email"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
