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
    // Fixed position at top - same position regardless of view mode
    <aside className={`w-full lg:w-[229px] xl:w-[264px] 2xl:w-[300px] shrink-0 ${className ?? ""} lg:sticky lg:top-24 lg:self-start`}>
      <div className="p-2 lg:p-1 xl:p-2 2xl:p-2">
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-auto flex flex-row lg:flex-col">
          <div className="w-1/3 sm:w-1/4 lg:w-full shrink-0">
            <img
              src={imageSrc}
              alt={alt}
              className="w-full h-full lg:h-36 xl:h-44 2xl:h-52 object-cover"
            />
          </div>
          <div className="p-2 sm:p-3 lg:p-3 xl:p-4 2xl:p-5 space-y-1 sm:space-y-1.5 lg:space-y-2 xl:space-y-2 2xl:space-y-3 flex-1 flex flex-col justify-center lg:justify-start">
            <h3 className="text-base sm:text-lg lg:text-lg xl:text-xl 2xl:text-[1.7rem] font-bold text-foreground leading-tight">
              {title}
            </h3>
            <p className="text-[11px] sm:text-xs lg:text-sm xl:text-sm 2xl:text-lg text-muted-foreground line-clamp-2 lg:line-clamp-none">
              {description}
            </p>
            <ul className="hidden sm:block space-y-0.5 lg:space-y-1 xl:space-y-1 2xl:space-y-2 text-[9px] sm:text-[10px] lg:text-xs xl:text-xs 2xl:text-base text-muted-foreground">
              {bullets.slice(0, 3).map((b) => (
                <li key={b} className="whitespace-nowrap overflow-hidden text-ellipsis">{b}</li>
              ))}
            </ul>
            <div className="mt-auto pt-1 sm:pt-1.5 lg:pt-2">
              <Button className="w-full bg-primary hover:bg-hero-gradient hover:text-white transition-colors text-[10px] sm:text-xs lg:text-sm xl:text-sm 2xl:text-lg h-6 sm:h-7 lg:h-9 xl:h-9 2xl:h-11">
                {buttonText}
              </Button>
            </div>
            <p className="hidden md:block text-[9px] sm:text-[10px] lg:text-xs xl:text-xs 2xl:text-sm text-muted-foreground text-center mt-1 lg:mt-1.5 xl:mt-2">
              {note}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdBanner;
