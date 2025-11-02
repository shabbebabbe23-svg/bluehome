import { Button } from "@/components/ui/button";
import bathroomAd from "@/assets/bathroom-ad.jpg";
import { ReactNode } from "react";

type AdBannerProps = {
  imageSrc?: string;
  alt?: string;
  title?: string;
  description?: string;
  bullets?: string[];
  buttonText?: string;
  note?: ReactNode;
  className?: string;
};

const AdBanner = ({
  imageSrc = bathroomAd,
  alt = "Badrumrenovering",
  title = "Badrumsrenovering",
  description = "Drömmer du om ett nytt badrum? Vi hjälper dig från idé till verklighet.",
  bullets = [
    "✓ Kostnadsfri konsultation",
    "✓ Professionella hantverkare",
    "✓ 10 års garanti",
    "✓ Fast pris - inga dolda kostnader",
  ],
  buttonText = "Begär offert",
  note = "Specialerbjudande: 15% rabatt i april",
  className = "",
}: AdBannerProps) => {

  return (
    <aside className={`hidden lg:block w-80 shrink-0 ${className ?? ""}`}>
  <div className={`sticky top-24 p-4 lg:top-auto lg:bottom-16 lg:translate-y-0`}>
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-[420px] flex flex-col">
          <img 
            src={imageSrc} 
            alt={alt} 
            className="w-full h-64 object-cover"
          />
          <div className="p-6 space-y-4 flex-1 overflow-auto">
            <h3 className="text-2xl font-bold text-foreground">
              {title}
            </h3>
            <p className="text-muted-foreground">
              {description}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <Button className="w-full bg-primary hover:bg-primary-glow">
              {buttonText}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {note}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdBanner;
