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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          <div className="md:col-span-1">
            <img src={imageSrc} alt={alt} className="w-full h-48 object-cover" />
          </div>
          <div className="p-4 md:col-span-2 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-semibold text-foreground">{title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
              <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                {bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Button className="bg-primary hover:bg-hero-gradient hover:text-white transition-colors text-sm">
                {buttonText}
              </Button>
              {note && <div className="text-xs text-muted-foreground ml-3">{note}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineAdBanner;
