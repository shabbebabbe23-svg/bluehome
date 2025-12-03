import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import kitchenAd from "@/assets/kitchen-ad.jpg";

type InlineAdBannerProps = {
  imageSrc?: string;
  alt?: string;
  title?: string;
  description?: string;
  bullets?: string[];
  buttonText?: string;
  note?: ReactNode;
  className?: string;
};

const InlineAdBanner = ({
  imageSrc = kitchenAd,
  alt = "Renovering",
  title = "Köksrenovering",
  description = "Förnya ditt kök med smart design och professionellt utförande.",
  bullets = ["✓ Kostnadsfri rådgivning", "✓ Måttanpassade lösningar", "✓ 5 års garanti"],
  buttonText = "Begär offert",
  note = null,
  className = "",
}: InlineAdBannerProps) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
          <div className="sm:col-span-1">
            <img src={imageSrc} alt={alt} className="w-full h-32 sm:h-40 md:h-48 object-cover" />
          </div>
          <div className="p-3 sm:p-4 sm:col-span-2 flex flex-col justify-between">
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-foreground">{title}</h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>
              <ul className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground space-y-0.5 sm:space-y-1">
                {bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
            <div className="mt-2 sm:mt-3 flex items-center justify-between gap-2">
              <Button className="bg-primary hover:bg-hero-gradient hover:text-white transition-colors text-xs sm:text-sm">
                {buttonText}
              </Button>
              {note && <div className="text-[10px] sm:text-xs text-muted-foreground">{note}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineAdBanner;
