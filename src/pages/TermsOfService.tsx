import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, AlertTriangle, Scale, Ban, RefreshCw } from "lucide-react";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Användarvillkor - BaraHem | Villkor för tjänsten";
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
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Användarvillkor
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Villkor för användning av BaraHems tjänster
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Senast uppdaterad: 4 februari 2026
            </p>
          </div>

          {/* Intro */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-foreground leading-relaxed">
                Välkommen till BaraHem! Dessa användarvillkor ("Villkor") reglerar din användning 
                av webbplatsen barahem.se och tillhörande tjänster ("Tjänsten"). Genom att använda 
                Tjänsten godkänner du dessa Villkor.
              </p>
              <p className="text-foreground leading-relaxed mt-4">
                Om du inte godkänner Villkoren ber vi dig att inte använda Tjänsten.
              </p>
            </CardContent>
          </Card>

          {/* Om tjänsten */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                1. Om tjänsten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                BaraHem är en plattform som:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Visar bostadsannonser från registrerade mäklare och mäklarbyråer</li>
                <li>Möjliggör kontakt mellan bostadssökande och mäklare</li>
                <li>Erbjuder verktyg för att spara favoriter och söka bostäder</li>
                <li>Tillhandahåller marknadsanalyser och prisstatistik</li>
              </ul>
              <p className="text-muted-foreground">
                BaraHem är <strong>inte</strong> en part i eventuella köp- eller hyresavtal mellan 
                användare och mäklare/säljare. Vi ansvarar inte för innehållet i annonserna eller 
                för transaktioner som genomförs via plattformen.
              </p>
            </CardContent>
          </Card>

          {/* Användarkonto */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-500" />
                2. Användarkonto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold text-foreground mb-2">2.1 Registrering</h4>
              <p className="text-muted-foreground mb-4">
                Vissa funktioner kräver att du skapar ett konto. Vid registrering förbinder du dig att:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-6">
                <li>Ange korrekt och sanningsenlig information</li>
                <li>Hålla dina kontouppgifter uppdaterade</li>
                <li>Skydda ditt lösenord och inte dela det med andra</li>
                <li>Omedelbart meddela oss vid obehörig åtkomst till ditt konto</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2">2.2 Ansvar för kontot</h4>
              <p className="text-muted-foreground">
                Du är ansvarig för all aktivitet som sker under ditt konto. BaraHem ansvarar inte 
                för förluster som uppstår på grund av obehörig användning av ditt konto.
              </p>
            </CardContent>
          </Card>

          {/* Regler för användning */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Ban className="w-6 h-6 text-red-500" />
                3. Regler för användning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Vid användning av Tjänsten får du <strong>inte</strong>:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Publicera falsk, vilseledande eller bedräglig information</li>
                <li>Använda Tjänsten för olagliga ändamål</li>
                <li>Skicka spam eller oönskade meddelanden till andra användare</li>
                <li>Försöka få obehörig åtkomst till system eller data</li>
                <li>Kopiera, modifiera eller distribuera innehåll från Tjänsten utan tillstånd</li>
                <li>Använda automatiserade verktyg (bots, scrapers) för att samla data</li>
                <li>Utge dig för att vara någon annan person eller organisation</li>
                <li>Publicera innehåll som är diskriminerande, hotfullt eller kränkande</li>
              </ul>
            </CardContent>
          </Card>

          {/* För mäklare */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Scale className="w-6 h-6 text-green-500" />
                4. Särskilda villkor för mäklare
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Som registrerad mäklare eller mäklarbyrå på BaraHem förbinder du dig att:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>Inneha giltig mäklarregistrering hos Fastighetsmäklarinspektionen</li>
                <li>Endast publicera annonser för objekt du har i uppdrag att förmedla</li>
                <li>Säkerställa att all information i annonserna är korrekt och aktuell</li>
                <li>Ta bort eller uppdatera annonser när objekt är sålda/uthyrda</li>
                <li>Följa god fastighetsmäklarsed och tillämplig lagstiftning</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2">4.1 Annonsinnehåll</h4>
              <p className="text-muted-foreground mb-4">
                Du ansvarar för att allt material (bilder, texter, etc.) som du laddar upp:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Inte gör intrång i andras upphovsrätt eller andra rättigheter</li>
                <li>Är sanningsenligt och inte vilseledande</li>
                <li>Uppfyller kraven i marknadsföringslagen</li>
              </ul>
            </CardContent>
          </Card>

          {/* Ansvarsbegränsning */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                5. Ansvarsbegränsning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Tjänsten tillhandahålls "i befintligt skick" utan några garantier. BaraHem:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>Garanterar inte att Tjänsten är felfri eller alltid tillgänglig</li>
                <li>Ansvarar inte för innehållet i tredjepartsannonser</li>
                <li>Ansvarar inte för skada som uppstår genom användning av Tjänsten</li>
                <li>Ansvarar inte för förlust av data eller affärsmöjligheter</li>
              </ul>

              <p className="text-muted-foreground">
                BaraHems totala ansvar är begränsat till det belopp du eventuellt betalat för 
                Tjänsten under de senaste 12 månaderna, dock högst 10 000 SEK.
              </p>
            </CardContent>
          </Card>

          {/* Immateriella rättigheter */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-500" />
                6. Immateriella rättigheter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Allt innehåll på BaraHem, inklusive men inte begränsat till logotyper, design, 
                text och programkod, ägs av BaraHem AB eller våra licensgivare och är skyddat 
                av upphovsrätt och andra immateriella rättigheter.
              </p>
              <p className="text-muted-foreground">
                Du får inte kopiera, reproducera eller på annat sätt använda detta innehåll 
                utan vårt skriftliga medgivande.
              </p>
            </CardContent>
          </Card>

          {/* Ändringar */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-cyan-500" />
                7. Ändringar av villkoren
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Vi förbehåller oss rätten att ändra dessa Villkor. Vid väsentliga ändringar 
                kommer vi att:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Meddela dig via e-post eller genom en notis på webbplatsen</li>
                <li>Ge dig rimlig tid att granska ändringarna innan de träder i kraft</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Genom att fortsätta använda Tjänsten efter att ändringarna trätt i kraft 
                godkänner du de nya Villkoren.
              </p>
            </CardContent>
          </Card>

          {/* Uppsägning */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. Uppsägning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Du kan när som helst avsluta ditt konto genom att kontakta oss. BaraHem kan 
                stänga av eller avsluta ditt konto om du:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Bryter mot dessa Villkor</li>
                <li>Använder Tjänsten på ett sätt som kan skada oss eller andra användare</li>
                <li>Inte har loggat in på 24 månader (inaktivt konto)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Tillämplig lag */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>9. Tillämplig lag och tvister</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Dessa Villkor regleras av svensk lag. Tvister ska i första hand lösas genom 
                förhandling. Om det inte är möjligt ska tvisten avgöras av svensk allmän domstol 
                med Stockholms tingsrätt som första instans.
              </p>
              <p className="text-muted-foreground">
                Som konsument kan du även vända dig till Allmänna reklamationsnämnden (ARN) för 
                prövning av tvister.
              </p>
            </CardContent>
          </Card>

          {/* Kontakt */}
          <Card>
            <CardHeader>
              <CardTitle>10. Kontakt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Har du frågor om dessa Villkor? Kontakta oss:
              </p>
              <ul className="space-y-2 text-foreground">
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

export default TermsOfService;
