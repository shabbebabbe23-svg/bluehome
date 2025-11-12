import { Button } from "@/components/ui/button";
import kitchenAd from "@/assets/kitchen-ad.jpg";

const DetailAdBanner = () => {
  return (
    <aside className="w-full">
      <div className="p-2 sm:p-4">
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <img 
            src={kitchenAd} 
            alt="Köksmästarna - Köksrenovering" 
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
          />
          <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
              Nytt drömkök?
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Vi hjälper dig från planering till färdigt kök. Kvalitet och design i perfekt harmoni.
            </p>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>✓ Gratis hembesök och offert</li>
              <li>✓ Skandinavisk design</li>
              <li>✓ 15 års garanti på stommar</li>
              <li>✓ Professionell installation</li>
            </ul>
            <Button className="w-full bg-primary hover:bg-hero-gradient hover:text-white transition-colors text-sm sm:text-base">
              Boka kostnadsfri konsultation
            </Button>
            <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
              Kampanj: 20% rabatt på arbetskostnad i oktober
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DetailAdBanner;
