import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Clock, UserCheck, Mail, Trash2, Lock } from "lucide-react";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Integritetspolicy - BaraHem | Dataskydd och GDPR";
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
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Integritetspolicy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Så hanterar BaraHem dina personuppgifter
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Senast uppdaterad: 4 februari 2026
            </p>
          </div>

          {/* Intro */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-foreground leading-relaxed">
                BaraHem värnar om din integritet. Denna integritetspolicy förklarar hur vi samlar 
                in, använder, lagrar och skyddar dina personuppgifter i enlighet med 
                dataskyddsförordningen (GDPR) och annan tillämplig lagstiftning.
              </p>
              <p className="text-foreground leading-relaxed mt-4">
                Genom att använda våra tjänster godkänner du behandlingen av dina personuppgifter 
                enligt denna policy.
              </p>
            </CardContent>
          </Card>

          {/* Personuppgiftsansvarig */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-primary" />
                Personuppgiftsansvarig
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                BaraHem AB är personuppgiftsansvarig för behandlingen av dina personuppgifter.
              </p>
              <ul className="space-y-2 text-foreground">
                <li><strong>Företagsnamn:</strong> BaraHem AB</li>
                <li><strong>E-post:</strong> <a href="mailto:dataskydd@barahem.se" className="text-primary hover:underline">dataskydd@barahem.se</a></li>
                <li><strong>Webb:</strong> <a href="https://barahem.se" className="text-primary hover:underline">barahem.se</a></li>
              </ul>
            </CardContent>
          </Card>

          {/* Vilka uppgifter samlar vi in */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Database className="w-6 h-6 text-blue-500" />
                Vilka personuppgifter samlar vi in?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Vi samlar in följande kategorier av personuppgifter:
              </p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Kontoinformation</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Namn och e-postadress</li>
                    <li>Telefonnummer (valfritt)</li>
                    <li>Profilbild (valfritt)</li>
                    <li>Lösenord (krypterat)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Användningsdata</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Sparade favoriter och sökningar</li>
                    <li>Visningshistorik</li>
                    <li>Kontaktförfrågningar till mäklare</li>
                    <li>IP-adress och enhetsinformation</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">För mäklare och byråer</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Företagsinformation och organisationsnummer</li>
                    <li>Mäklarlegitimation</li>
                    <li>Fastighetsinformation som publiceras</li>
                    <li>Kontaktuppgifter för offentlig visning</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Varför samlar vi in uppgifter */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-green-500" />
                Varför behandlar vi dina uppgifter?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Fullgöra avtal</h4>
                  <p className="text-muted-foreground text-sm">
                    För att tillhandahålla våra tjänster, hantera ditt konto och möjliggöra 
                    kontakt mellan köpare och mäklare.
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-foreground">Berättigat intresse</h4>
                  <p className="text-muted-foreground text-sm">
                    För att förbättra våra tjänster, analysera användning och skicka relevant 
                    information om fastigheter du visat intresse för.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-foreground">Samtycke</h4>
                  <p className="text-muted-foreground text-sm">
                    För marknadsföring och nyhetsbrev (endast om du aktivt samtyckt).
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-foreground">Rättslig förpliktelse</h4>
                  <p className="text-muted-foreground text-sm">
                    För att uppfylla lagkrav som bokföringslagen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lagringstid */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-orange-500" />
                Hur länge sparar vi dina uppgifter?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-foreground">Kontoinformation</span>
                  <span className="text-muted-foreground">Så länge kontot är aktivt + 12 månader</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-foreground">Sparade favoriter</span>
                  <span className="text-muted-foreground">Så länge kontot är aktivt</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-foreground">Kontaktförfrågningar</span>
                  <span className="text-muted-foreground">24 månader</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-foreground">Bokföringsunderlag</span>
                  <span className="text-muted-foreground">7 år (enligt lag)</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-foreground">Anonymiserad statistik</span>
                  <span className="text-muted-foreground">Obegränsat</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dina rättigheter */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-purple-500" />
                Dina rättigheter enligt GDPR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Som registrerad har du följande rättigheter:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Rätt till tillgång</h4>
                  <p className="text-sm text-muted-foreground">
                    Du har rätt att få bekräftelse på om vi behandlar dina uppgifter och i så 
                    fall få en kopia av dem.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Rätt till rättelse</h4>
                  <p className="text-sm text-muted-foreground">
                    Du har rätt att få felaktiga uppgifter rättade och ofullständiga uppgifter 
                    kompletterade.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Rätt till radering</h4>
                  <p className="text-sm text-muted-foreground">
                    Du har under vissa omständigheter rätt att få dina uppgifter raderade 
                    ("rätten att bli glömd").
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Rätt till begränsning</h4>
                  <p className="text-sm text-muted-foreground">
                    Du har rätt att begära begränsning av behandlingen av dina uppgifter.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Rätt till dataportabilitet</h4>
                  <p className="text-sm text-muted-foreground">
                    Du har rätt att få ut dina uppgifter i ett strukturerat format och överföra 
                    dem till en annan tjänst.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Rätt att invända</h4>
                  <p className="text-sm text-muted-foreground">
                    Du har rätt att invända mot behandling som grundar sig på berättigat intresse.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delning av uppgifter */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-cyan-500" />
                Vilka delar vi uppgifter med?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Vi kan dela dina uppgifter med följande parter:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-semibold text-foreground">Mäklare och mäklarbyråer</span>
                    <p className="text-sm text-muted-foreground">
                      När du skickar kontaktförfrågningar eller anmäler intresse för en fastighet.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-semibold text-foreground">Tjänsteleverantörer</span>
                    <p className="text-sm text-muted-foreground">
                      T.ex. hosting (Supabase), e-post och betalningslösningar som agerar som 
                      personuppgiftsbiträden åt oss.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-semibold text-foreground">Myndigheter</span>
                    <p className="text-sm text-muted-foreground">
                      Om vi är skyldiga enligt lag.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Radering */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Trash2 className="w-6 h-6 text-red-500" />
                Radera ditt konto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Du kan när som helst begära att få ditt konto och alla tillhörande uppgifter 
                raderade. Kontakta oss på{" "}
                <a href="mailto:dataskydd@barahem.se" className="text-primary hover:underline">
                  dataskydd@barahem.se
                </a>{" "}
                för att initiera raderingen.
              </p>
              <p className="text-sm text-muted-foreground">
                Observera att vissa uppgifter kan behöva sparas längre på grund av lagkrav 
                (t.ex. bokföringslagen).
              </p>
            </CardContent>
          </Card>

          {/* Kontakt och klagomål */}
          <Card>
            <CardHeader>
              <CardTitle>Kontakt och klagomål</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Har du frågor om hur vi hanterar dina personuppgifter eller vill utöva dina 
                rättigheter? Kontakta oss:
              </p>
              <ul className="space-y-2 text-foreground mb-6">
                <li>E-post: <a href="mailto:dataskydd@barahem.se" className="text-primary hover:underline">dataskydd@barahem.se</a></li>
              </ul>
              <p className="text-muted-foreground">
                Om du anser att vi behandlar dina personuppgifter i strid med 
                dataskyddsförordningen har du rätt att lämna klagomål till{" "}
                <a 
                  href="https://www.imy.se" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Integritetsskyddsmyndigheten (IMY)
                </a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;
