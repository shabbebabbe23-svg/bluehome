import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Eye, Clock, TrendingUp, Image, MapPin, Mail, Loader2, Smartphone, Monitor, Tablet, Share2, Calendar, X, ZoomIn, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageStat {
  image_index: number;
  image_url: string;
  views: number;
  avg_time_ms: number;
}

interface PropertyStats {
  property_id: string;
  property_title: string;
  property_image: string | null;
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
  const [selectedProperty, setSelectedProperty] = useState<PropertyStats | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);

      try {
        // Fetch all properties for the agent
        const { data: properties, error: propertiesError } = await supabase
          .from("properties")
          .select("id, title, address, seller_email, image_url")
          .eq("user_id", user.id)
          .eq("is_deleted", false);

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
            property_image: prop.image_url || null,
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.property_id}
                  className="flex flex-col p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <Link 
                      to={`/fastighet/${stat.property_id}`}
                      className="font-medium text-base flex-1 line-clamp-1 hover:text-primary hover:underline transition-colors"
                    >
                      {stat.property_title}
                    </Link>
                    <div className="text-xl font-bold text-primary ml-2">
                      {stat.total_views}
                    </div>
                  </div>
                  
                  {/* Property Image */}
                  {stat.property_image && (
                    <Link to={`/fastighet/${stat.property_id}`} className="mb-2 block">
                      <img 
                        src={stat.property_image} 
                        alt={stat.property_title}
                        className="w-full h-20 object-cover rounded hover:opacity-90 transition-opacity"
                      />
                    </Link>
                  )}
                  
                  {/* Main Stats Row */}
                  <div className="grid grid-cols-2 gap-1 mb-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      <span>{stat.total_views} visningar</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>{formatTime(stat.avg_time_spent)} snitt</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-3 h-3 text-muted-foreground" />
                      <span>{stat.shares_count} delningar</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span>{stat.viewing_registrations_count} anmälda</span>
                    </div>
                  </div>

                  {/* Device Stats */}
                  <div className="mb-2 p-1.5 bg-muted/50 rounded">
                    <div className="flex gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Monitor className="w-3 h-3" />
                        <span>{stat.device_stats.desktop}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        <span>{stat.device_stats.mobile}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tablet className="w-3 h-3" />
                        <span>{stat.device_stats.tablet}</span>
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  {stat.visitor_locations.length > 0 && (
                    <div className="mb-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 mb-0.5">
                        <MapPin className="w-3 h-3" />
                        <span className="font-medium">Besökare:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {stat.visitor_locations.slice(0, 3).map((loc, idx) => (
                          <span key={idx} className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                            {loc.city} ({loc.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Stats */}
                  {stat.image_views > 0 && (
                    <div className="mb-2 p-1.5 bg-purple-50 dark:bg-purple-950/30 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Image className="w-3 h-3 text-purple-600" />
                          <span className="text-xs font-medium text-purple-700 dark:text-purple-400">{stat.image_views} bildklick</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedProperty(stat);
                            setImageModalOpen(true);
                          }}
                          className="flex items-center gap-0.5 text-[11px] text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          <ZoomIn className="w-3 h-3" />
                          Visa alla
                        </button>
                      </div>
                      {stat.top_images.length > 0 && (
                        <div 
                          className="flex gap-1 overflow-x-auto cursor-pointer"
                          onClick={() => {
                            setSelectedProperty(stat);
                            setImageModalOpen(true);
                          }}
                        >
                          {stat.top_images.slice(0, 3).map((img, idx) => (
                            <div key={idx} className="flex-shrink-0 relative group">
                              {img.image_url ? (
                                <div className="relative">
                                  <img 
                                    src={img.image_url} 
                                    alt={`Bild ${img.image_index + 1}`}
                                    className="w-10 h-8 object-cover rounded border group-hover:opacity-80 transition-opacity"
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center rounded-b">
                                    {img.views}
                                  </div>
                                </div>
                              ) : (
                                <div className="w-10 h-8 bg-muted rounded flex items-center justify-center text-[9px] text-muted-foreground">
                                  {img.views}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t mt-auto space-y-1.5">
                    <Button
                      size="sm"
                      variant="default"
                      asChild
                      className="w-full h-7 text-xs"
                    >
                      <Link to={`/fastighet/${stat.property_id}`}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visa objekt
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendStatisticsEmail(stat.property_id, stat.seller_email)}
                      disabled={sendingEmail === stat.property_id || !stat.seller_email}
                      className="w-full h-7 text-xs"
                    >
                      {sendingEmail === stat.property_id ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Skickar...
                        </>
                      ) : (
                        <>
                          <Mail className="w-3 h-3 mr-1" />
                          {stat.seller_email ? "Skicka statistik" : "Ingen email"}
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

      {/* Image Statistics Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-purple-600" />
              Bildstatistik - {selectedProperty?.property_title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-4 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{selectedProperty.image_views}</div>
                  <div className="text-xs text-muted-foreground">Totalt bildklick</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">~{selectedProperty.avg_images_per_session}</div>
                  <div className="text-xs text-muted-foreground">Bilder/besök</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{selectedProperty.top_images.length}</div>
                  <div className="text-xs text-muted-foreground">Unika bilder</div>
                </div>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {selectedProperty.top_images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    {img.image_url ? (
                      <div className="relative">
                        <img 
                          src={img.image_url} 
                          alt={`Bild ${img.image_index + 1}`}
                          className="w-full h-40 object-cover rounded-lg border shadow-sm"
                        />
                        {/* Ranking Badge */}
                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center shadow">
                          #{idx + 1}
                        </div>
                        {/* Stats Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-b-lg">
                          <div className="text-white">
                            <div className="text-lg font-bold">{img.views} visningar</div>
                            <div className="text-xs opacity-80">
                              {img.image_index === 0 ? 'Huvudbild' : `Bild ${img.image_index + 1}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-muted rounded-lg flex flex-col items-center justify-center">
                        <Image className="w-8 h-8 text-muted-foreground mb-2" />
                        <div className="text-sm font-medium">{img.views} visningar</div>
                        <div className="text-xs text-muted-foreground">Bild {img.image_index + 1}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedProperty.top_images.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Ingen bildstatistik tillgänglig ännu</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
