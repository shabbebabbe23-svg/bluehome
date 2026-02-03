import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Cookie, X, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

interface CookiePreferences {
  necessary: boolean;
  statistics: boolean;
  marketing: boolean;
}

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Alltid på
    statistics: false,
    marketing: false,
  });

  useEffect(() => {
    // Kolla om användaren redan har gett samtycke
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Vänta lite innan vi visar bannern
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(prefs));
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setIsVisible(false);

    // Här kan du trigga analytics etc baserat på preferenser
    if (prefs.statistics) {
      // Aktivera Google Analytics etc
      console.log("Statistics cookies enabled");
    }
    if (prefs.marketing) {
      // Aktivera marknadsförings-cookies
      console.log("Marketing cookies enabled");
    }
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      statistics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      statistics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    savePreferences(onlyNecessary);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-lg shadow-2xl border-2 animate-slide-up">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Cookie className="w-6 h-6 text-primary" />
              Vi använder cookies
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={acceptNecessary}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showDetails ? (
            <>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Vi använder cookies för att förbättra din upplevelse, analysera trafik och 
                visa relevant innehåll. Du kan välja att acceptera alla cookies eller bara 
                de nödvändiga.
              </p>
              <p className="text-sm">
                Läs mer i vår{" "}
                <Link to="/cookies" className="text-primary hover:underline">
                  cookie-policy
                </Link>
                .
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={acceptAll} 
                  className="flex-1"
                >
                  Acceptera alla
                </Button>
                <Button 
                  variant="outline" 
                  onClick={acceptNecessary}
                  className="flex-1"
                >
                  Endast nödvändiga
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setShowDetails(true)}
              >
                <Settings2 className="w-4 h-4 mr-2" />
                Anpassa inställningar
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                {/* Nödvändiga */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Nödvändiga</h4>
                    <p className="text-xs text-muted-foreground">
                      Krävs för att webbplatsen ska fungera
                    </p>
                  </div>
                  <Switch 
                    checked={true} 
                    disabled 
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>

                {/* Statistik */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Statistik</h4>
                    <p className="text-xs text-muted-foreground">
                      Hjälper oss förstå hur webbplatsen används
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.statistics}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, statistics: checked }))
                    }
                  />
                </div>

                {/* Marknadsföring */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Marknadsföring</h4>
                    <p className="text-xs text-muted-foreground">
                      Används för att visa relevanta annonser
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={saveCustomPreferences} 
                  className="flex-1"
                >
                  Spara inställningar
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="flex-1"
                >
                  Tillbaka
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent;
