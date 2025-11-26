import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const AdvertisingPricing = () => {
  const navigate = useNavigate();

  const packages = [
    {
      name: "Gratis",
      price: "0",
      description: "Grundannonsering helt utan kostnad",
      icon: Check,
      features: [
        "Upp till 20 bilder",
        "Grundläggande statistik",
        "E-postnotiser om intressenter",
        "Möjligt tack vare våra annonsörer",
      ],
      highlighted: false,
      isFree: true,
    },
    {
      name: "Premium",
      price: "2 900",
      description: "Maximal exponering för din fastighet",
      icon: Star,
      features: [
        "Obegränsat antal bilder",
        "3D-visning, planritning & drönarbild",
        "Toppplacering i alla sökningar",
        "Omfattande social media-kampanj",
        "Utökad statistik i realtid",
      ],
      highlighted: true,
      isFree: false,
    },
  ];


  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/20" style={{
        background: 'var(--main-gradient)'
      }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <svg 
            width="36" 
            height="36" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => navigate('/')}
            className="cursor-pointer hover:-translate-x-2 hover:scale-x-110 transition-all duration-300 ease-out origin-center"
          >
            <defs>
              <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="url(#arrowGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          {/* BaraHem Logo - Center */}
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)' }} />
                  <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)' }} />
                </linearGradient>
              </defs>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="url(#homeGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="9 22 9 12 15 12 15 22" stroke="url(#homeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-2xl md:text-3xl font-bold bg-hero-gradient bg-clip-text text-transparent">
              BaraHem
            </span>
          </div>

          {/* Spacer for balance */}
          <div className="w-9"></div>
        </div>
      </header>
      <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-hero-gradient bg-clip-text text-transparent">
            Annonsera din bostad på BaraHem
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Grundannonsering är helt <span className="font-bold text-primary">gratis!</span> Tack vare reklamintäkterna på sidan kan vi erbjuda detta kostnadsfritt.
          </p>
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="py-6">
              <p className="text-lg">
                🎉 <span className="font-semibold">100% gratis grundannonsering</span> – möjligt tack vare våra samarbetspartners och reklam på sidan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
          {packages.map((pkg, index) => {
            const Icon = pkg.icon;
            return (
              <Card
                key={pkg.name}
                className={`relative transition-all duration-300 hover:shadow-xl animate-scale-in ${
                  pkg.highlighted
                    ? "border-primary shadow-lg scale-105"
                    : "hover:scale-105"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {pkg.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-hero-gradient">
                    Rekommenderas
                  </Badge>
                )}
                {pkg.isFree && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500">
                    100% Gratis
                  </Badge>
                )}
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {pkg.description}
                  </CardDescription>
                  <div className="mt-4">
                    {pkg.isFree ? (
                      <div>
                        <span className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                          Gratis
                        </span>
                        <p className="text-sm text-muted-foreground mt-2">Ingen kostnad</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold bg-hero-gradient bg-clip-text text-transparent">
                          {pkg.price}
                        </span>
                        <span className="text-muted-foreground"> kr</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={pkg.highlighted ? "premium" : pkg.isFree ? "default" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    {pkg.isFree ? "Börja annonsera gratis" : "Kontakta oss"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Extra Services */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Tilläggsmoduler
            </CardTitle>
            <CardDescription>
              Komplettera ditt paket med extra exponering och tjänster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Hemnet Premium-placering</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Extra exponering på Hemnet under 14 dagar
                  </p>
                  <p className="text-lg font-bold text-primary">4 995 kr</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Professionell styling</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Homestyling inför fotografering
                  </p>
                  <p className="text-lg font-bold text-primary">Från 12 995 kr</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Virtuell visning</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    360° virtuell rundtur i bostaden
                  </p>
                  <p className="text-lg font-bold text-primary">8 995 kr</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Öppet hus Premium</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Marknadsföring av öppet hus via flera kanaler
                  </p>
                  <p className="text-lg font-bold text-primary">2 995 kr</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-hero-gradient text-white border-none">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Osäker på vilket paket som passar dig?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Kontakta oss så hjälper vi dig att hitta den bästa lösningen för din fastighet
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg">
                Kontakta oss
              </Button>
              <Button size="lg" variant="outline" className="text-lg bg-white/10 hover:bg-white/20 border-white/30">
                Ring 08-123 456 78
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default AdvertisingPricing;
