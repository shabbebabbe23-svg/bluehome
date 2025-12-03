import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, MapPin, Home, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PriceData {
  month: string;
  avgPrice: number;
  soldCount: number;
}

interface AreaStats {
  area: string;
  avgPrice: number;
  avgPricePerSqm: number;
  soldCount: number;
  priceChange: number;
}

const MarketAnalysis = () => {
  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [areaStats, setAreaStats] = useState<AreaStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, [selectedArea, selectedType]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      // Fetch sold properties for analysis
      let query = supabase
        .from("properties")
        .select("*")
        .eq("is_sold", true)
        .eq("is_deleted", false);

      if (selectedArea !== "all") {
        query = query.ilike("location", `%${selectedArea}%`);
      }
      if (selectedType !== "all") {
        query = query.eq("type", selectedType);
      }

      const { data: properties, error } = await query;

      if (error) throw error;

      // Process data for charts
      const monthlyData: { [key: string]: { total: number; count: number } } = {};
      const areaData: { [key: string]: { totalPrice: number; totalSqm: number; count: number; prices: number[] } } = {};

      properties?.forEach((prop) => {
        const soldDate = prop.sold_date ? new Date(prop.sold_date) : new Date(prop.created_at || "");
        const monthKey = `${soldDate.getFullYear()}-${String(soldDate.getMonth() + 1).padStart(2, "0")}`;
        const price = prop.sold_price || prop.price;

        // Monthly aggregation
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, count: 0 };
        }
        monthlyData[monthKey].total += Number(price);
        monthlyData[monthKey].count += 1;

        // Area aggregation
        const area = prop.location.split(",")[0].trim();
        if (!areaData[area]) {
          areaData[area] = { totalPrice: 0, totalSqm: 0, count: 0, prices: [] };
        }
        areaData[area].totalPrice += Number(price);
        areaData[area].totalSqm += prop.area || 1;
        areaData[area].count += 1;
        areaData[area].prices.push(Number(price));
      });

      // Format price history
      const sortedMonths = Object.keys(monthlyData).sort();
      const formattedHistory = sortedMonths.map((month) => ({
        month: new Date(month + "-01").toLocaleDateString("sv-SE", { month: "short", year: "2-digit" }),
        avgPrice: Math.round(monthlyData[month].total / monthlyData[month].count),
        soldCount: monthlyData[month].count,
      }));

      // Format area stats with price change calculation
      const formattedAreaStats = Object.entries(areaData)
        .map(([area, data]) => {
          const avgPrice = Math.round(data.totalPrice / data.count);
          const avgPricePerSqm = Math.round(data.totalPrice / data.totalSqm);
          // Simple price change calculation (last vs first half)
          const midpoint = Math.floor(data.prices.length / 2);
          const firstHalf = data.prices.slice(0, midpoint || 1);
          const secondHalf = data.prices.slice(midpoint || 0);
          const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / (firstHalf.length || 1);
          const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / (secondHalf.length || 1);
          const priceChange = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

          return {
            area,
            avgPrice,
            avgPricePerSqm,
            soldCount: data.count,
            priceChange: Math.round(priceChange * 10) / 10,
          };
        })
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 10);

      setPriceHistory(formattedHistory);
      setAreaStats(formattedAreaStats);
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} mkr`;
    }
    return `${(value / 1000).toFixed(0)} tkr`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Tillbaka
          </button>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
              Marknadsanalys
            </h1>
            <p className="text-lg text-muted-foreground">
              Utforska prishistorik och trender på bostadsmarknaden. Se hur priserna utvecklas i olika områden och få insikt i marknadens rörelser.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4">
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-[200px]">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Välj område" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla områden</SelectItem>
                <SelectItem value="Stockholm">Stockholm</SelectItem>
                <SelectItem value="Göteborg">Göteborg</SelectItem>
                <SelectItem value="Malmö">Malmö</SelectItem>
                <SelectItem value="Uppsala">Uppsala</SelectItem>
                <SelectItem value="Linköping">Linköping</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <Home className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Välj bostadstyp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla typer</SelectItem>
                <SelectItem value="Lägenhet">Lägenhet</SelectItem>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="Radhus">Radhus</SelectItem>
                <SelectItem value="Fritidshus">Fritidshus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-8">
              {/* Price History Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Prisutveckling över tid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {priceHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis tickFormatter={formatPrice} className="text-xs" />
                        <Tooltip
                          formatter={(value: number) => [formatPrice(value), "Snittpris"]}
                          labelFormatter={(label) => `Månad: ${label}`}
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="avgPrice"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      Ingen data tillgänglig för valda filter
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sales Volume Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Antal sålda bostäder per månad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {priceHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          formatter={(value: number) => [value, "Antal sålda"]}
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        />
                        <Bar dataKey="soldCount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      Ingen data tillgänglig för valda filter
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Area Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Prisstatistik per område
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {areaStats.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Område</th>
                            <th className="text-right py-3 px-4 font-medium">Snittpris</th>
                            <th className="text-right py-3 px-4 font-medium">Kr/m²</th>
                            <th className="text-right py-3 px-4 font-medium">Antal sålda</th>
                            <th className="text-right py-3 px-4 font-medium">Prisförändring</th>
                          </tr>
                        </thead>
                        <tbody>
                          {areaStats.map((stat, index) => (
                            <tr key={stat.area} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                              <td className="py-3 px-4 font-medium">{stat.area}</td>
                              <td className="text-right py-3 px-4">{formatPrice(stat.avgPrice)}</td>
                              <td className="text-right py-3 px-4">{stat.avgPricePerSqm.toLocaleString("sv-SE")} kr</td>
                              <td className="text-right py-3 px-4">{stat.soldCount}</td>
                              <td className="text-right py-3 px-4">
                                <span
                                  className={`flex items-center justify-end gap-1 ${
                                    stat.priceChange >= 0 ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {stat.priceChange >= 0 ? (
                                    <TrendingUp className="w-4 h-4" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4" />
                                  )}
                                  {stat.priceChange >= 0 ? "+" : ""}
                                  {stat.priceChange}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      Ingen data tillgänglig för valda filter
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MarketAnalysis;
