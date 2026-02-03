import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cookie, Shield, BarChart3, Megaphone } from "lucide-react";
import Footer from "@/components/Footer";

const CookiePolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Cookie-policy - BaraHem | Information om cookies";
    return () => {
      document.title = 'BaraHem - Hitta ditt drömhem i Sverige';
    };
  }, []);

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
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="url(#arrowGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

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

          <div className="w-9"></div>
        </div>
      </header>

      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Cookie className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Cookie-policy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Information om hur BaraHem använder cookies och liknande tekniker
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Senast uppdaterad: 4 februari 2026
            </p>
          </div>

          {/* Intro */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-foreground leading-relaxed">
                Cookies är små textfiler som lagras på din dator eller mobila enhet när du besöker 
                vår webbplats. De används för att förbättra din upplevelse, komma ihåg dina 
                inställningar och för att vi ska kunna analysera hur webbplatsen används.
              </p>
              <p className="text-foreground leading-relaxed mt-4">
                På den här sidan kan du läsa om vilka cookies vi använder och varför. Du kan när 
                som helst ändra dina cookie-inställningar.
              </p>
            </CardContent>
          </Card>

          {/* Nödvändiga cookies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-500" />
                Nödvändiga cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Dessa cookies är nödvändiga för att webbplatsen ska fungera korrekt. De kan inte 
                stängas av eftersom de möjliggör grundläggande funktioner som inloggning, 
                navigering och säkerhet.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cookie</TableHead>
                    <TableHead>Beskrivning</TableHead>
                    <TableHead>Domän</TableHead>
                    <TableHead>Varaktighet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">sb-*-auth-token</TableCell>
                    <TableCell>Autentiserings-token för inloggning via Supabase</TableCell>
                    <TableCell>barahem.se</TableCell>
                    <TableCell>Session</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">sidebar:state</TableCell>
                    <TableCell>Sparar tillståndet för sidomenyn (öppen/stängd)</TableCell>
                    <TableCell>barahem.se</TableCell>
                    <TableCell>7 dagar</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">cookie-consent</TableCell>
                    <TableCell>Sparar dina cookie-preferenser</TableCell>
                    <TableCell>barahem.se</TableCell>
                    <TableCell>365 dagar</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Statistik-cookies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-500" />
                Statistik-cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Dessa cookies hjälper oss att förstå hur besökare interagerar med webbplatsen 
                genom att samla in och rapportera information anonymt. Detta hjälper oss att 
                förbättra webbplatsen.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cookie</TableHead>
                    <TableHead>Beskrivning</TableHead>
                    <TableHead>Domän</TableHead>
                    <TableHead>Varaktighet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">_ga</TableCell>
                    <TableCell>Google Analytics - används för att skilja på användare</TableCell>
                    <TableCell>.barahem.se</TableCell>
                    <TableCell>2 år</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">_ga_*</TableCell>
                    <TableCell>Google Analytics - används för att bevara sessionstillstånd</TableCell>
                    <TableCell>.barahem.se</TableCell>
                    <TableCell>2 år</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Marknadsförings-cookies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Megaphone className="w-6 h-6 text-orange-500" />
                Marknadsförings-cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Dessa cookies kan användas för att visa relevanta annonser för dig på andra 
                webbplatser. De spårar ditt beteende över webbplatser för att leverera 
                personaliserad annonsering.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cookie</TableHead>
                    <TableHead>Beskrivning</TableHead>
                    <TableHead>Domän</TableHead>
                    <TableHead>Varaktighet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Inga marknadsförings-cookies används för tillfället
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Hantera cookies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Hantera dina cookie-inställningar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Du kan när som helst ändra eller återkalla ditt samtycke till cookies genom att 
                klicka på knappen nedan. Du kan också hantera cookies i din webbläsares inställningar.
              </p>
              <p className="text-muted-foreground mb-6">
                Observera att om du blockerar vissa cookies kan det påverka din upplevelse av 
                webbplatsen och begränsa de tjänster vi kan erbjuda dig.
              </p>
              <button 
                onClick={() => {
                  // Trigger cookie consent modal
                  localStorage.removeItem('cookie-consent');
                  window.location.reload();
                }}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Ändra cookie-inställningar
              </button>
            </CardContent>
          </Card>

          {/* Kontakt */}
          <Card>
            <CardHeader>
              <CardTitle>Kontakta oss</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Om du har frågor om hur vi använder cookies, vänligen kontakta oss:
              </p>
              <ul className="mt-4 space-y-2 text-foreground">
                <li>E-post: <a href="mailto:info@barahem.se" className="text-primary hover:underline">info@barahem.se</a></li>
                <li>Webb: <a href="https://barahem.se" className="text-primary hover:underline">barahem.se</a></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CookiePolicy;
