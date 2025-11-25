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
      name: "Bas",
      price: "9 995",
      description: "Perfekt för dig som vill ha grundläggande exponering",
      icon: Check,
      features: [
        "30 dagars annonsering",
        "Publicering på BaraHem",
        "Upp till 10 bilder",
        "Grundläggande statistik",
        "E-postnotiser om intressenter",
      ],
      highlighted: false,
    },
    {
      name: "Premium",
      price: "19 995",
      description: "Mest populära paketet med maximal exponering",
      icon: Star,
      features: [
        "60 dagars annonsering",
        "Publicering på BaraHem + partnersajter",
        "Upp till 30 bilder",
        "3D-visning och planritning",
        "Utökad statistik och analys",
        "Prioriterad placering i sökresultat",
        "Social media-marknadsföring",
        "Dedikerad kundansvarig",
      ],
      highlighted: true,
    },
    {
      name: "Exklusiv",
      price: "34 995",
      description: "För premium-fastigheter som kräver unik marknadsföring",
      icon: Crown,
      features: [
        "90 dagars annonsering",
        "Publicering på BaraHem + alla partnersajter",
        "Obegränsat antal bilder",
        "3D-visning, planritning & drönarbild",
        "Komplett statistik i realtid",
        "Toppplacering i alla sökningar",
        "Omfattande social media-kampanj",
        "Professionell fastighetsvideo",
        "Dedikerat premium-team",
        "Tryckta annonser i lokaltidningar",
      ],
      highlighted: false,
    },
  ];


  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/20" style={{
        background: 'var(--main-gradient)'
      }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
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
        </div>
      </header>
      <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-hero-gradient bg-clip-text text-transparent">
            Annonsera din bostad på BaraHem
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Välj det paket som passar din fastighet bäst. Alla priser är engångskostnader utan bindningstid.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
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
                    Mest populär
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
                    <span className="text-4xl font-bold bg-hero-gradient bg-clip-text text-transparent">
                      {pkg.price}
                    </span>
                    <span className="text-muted-foreground"> kr</span>
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
                    variant={pkg.highlighted ? "premium" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    Välj {pkg.name}
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
