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
    // Use sticky on large screens so the left ad follows while staying within the column
    // This prevents it from overlapping content that comes after the grid (like the DetailAdBanner)
    <aside className={`hidden lg:block w-64 xl:w-80 shrink-0 ${className ?? ""} lg:sticky lg:top-24`}>
      <div className="p-2 xl:p-4">
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-[440px] xl:h-[520px] flex flex-col">
          <img 
            src={imageSrc} 
            alt={alt} 
            className="w-full h-36 xl:h-48 object-cover"
          />
          <div className="p-3 xl:p-4 space-y-2 xl:space-y-3 flex-1">
            <h3 className="text-lg xl:text-2xl font-bold text-foreground">
              {title}
            </h3>
            <p className="text-sm xl:text-base text-muted-foreground">
              {description}
            </p>
            <ul className="space-y-1 xl:space-y-2 text-xs xl:text-sm text-muted-foreground">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <Button className="w-full bg-primary hover:bg-hero-gradient hover:text-white transition-colors text-sm xl:text-base">
              {buttonText}
            </Button>
            <p className="text-[10px] xl:text-xs text-muted-foreground text-center">
              {note}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdBanner;
