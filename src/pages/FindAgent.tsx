import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, MapPin, Star, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const FindAgent = () => {
  const navigate = useNavigate();

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
          <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
            <svg className="w-14 h-14 md:w-20 md:h-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)' }} />
                  <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)' }} />
                </linearGradient>
              </defs>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="url(#homeGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="9 22 9 12 15 12 15 22" stroke="url(#homeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-4xl md:text-5xl font-bold bg-hero-gradient bg-clip-text text-transparent">
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
            Hitta rätt mäklare för dig
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Vi hjälper dig att hitta den perfekta mäklaren för din fastighetsaffär
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-2xl mx-auto mb-12 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Sök mäklare i ditt område
            </CardTitle>
            <CardDescription>
              Fyll i dina uppgifter så hittar vi de bästa mäklarna för dig
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Område/Stad</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="T.ex. Stockholm, Göteborg..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="propertyType">Typ av bostad</Label>
              <select
                id="propertyType"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Välj bostadstyp</option>
                <option value="villa">Villa</option>
                <option value="lagenhet">Lägenhet</option>
                <option value="radhus">Radhus</option>
                <option value="tomt">Tomt</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Ditt namn</Label>
              <Input id="name" placeholder="För- och efternamn" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="din@email.se"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="070-123 45 67"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Berätta mer om ditt ärende (valfritt)</Label>
              <Textarea
                id="message"
                placeholder="T.ex. när du vill sälja, uppskattat värde..."
                rows={4}
              />
            </div>

            <Button variant="premium" className="w-full" size="lg">
              Hitta mäklare
            </Button>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <Star className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Erfarna mäklare</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Våra mäklare har många års erfarenhet och höga omdömen från tidigare kunder
              </p>
            </CardContent>
          </Card>

          <Card className="text-center animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Lokalkännedom</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Mäklare som känner ditt område och vet vad som gäller på den lokala marknaden
              </p>
            </CardContent>
          </Card>

          <Card className="text-center animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <Phone className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Personlig service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Vi matchar dig med mäklare som passar just dina behov och din situation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Hur fungerar det?</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  1
                </div>
                <h3 className="font-semibold mb-2">Fyll i formuläret</h3>
                <p className="text-sm text-muted-foreground">
                  Berätta om din bostad och vad du söker
                </p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  2
                </div>
                <h3 className="font-semibold mb-2">Vi hittar mäklare</h3>
                <p className="text-sm text-muted-foreground">
                  Vi matchar dig med 2-3 lämpliga mäklare
                </p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  3
                </div>
                <h3 className="font-semibold mb-2">Du väljer</h3>
                <p className="text-sm text-muted-foreground">
                  Jämför och välj den mäklare som passar dig bäst
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default FindAgent;
