import { Button } from "@/components/ui/button";
import bathroomAd from "@/assets/bathroom-ad.jpg";

const AdBanner = () => {
  return (
    <aside className="hidden lg:block w-80 shrink-0">
      <div className="sticky top-24 p-4">
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <img 
            src={bathroomAd} 
            alt="Badrumrenovering" 
            className="w-full h-64 object-cover"
          />
          <div className="p-6 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">
              Badrums-renovering
            </h3>
            <p className="text-muted-foreground">
              Drömmer du om ett nytt badrum? Vi hjälper dig från idé till verklighet.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Kostnadsfri konsultation</li>
              <li>✓ Professionella hantverkare</li>
              <li>✓ 10 års garanti</li>
              <li>✓ Fast pris - inga dolda kostnader</li>
            </ul>
            <Button className="w-full bg-primary hover:bg-primary-glow">
              Begär offert
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Specialerbjudande: 15% rabatt i april
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdBanner;
