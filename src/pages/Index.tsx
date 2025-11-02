import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PropertyGrid from "@/components/PropertyGrid";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import sofaAd from "@/assets/sofa-ad.svg";

const Index = () => {
  const [userSofaSrc, setUserSofaSrc] = useState<string | null>(null);

  useEffect(() => {
    // Try to load a user-provided PNG at runtime without causing build errors.
    const candidate = "/src/assets/soffa-banner.png";
    const img = new Image();
    img.onload = () => setUserSofaSrc(candidate);
    img.onerror = () => {};
    img.src = candidate;
  }, []);

  return (
    <div className="min-h-screen" style={{background: 'var(--main-gradient)'}}>
      <Header />
      <div className="flex flex-col lg:flex-row items-start justify-center gap-4 md:gap-6 px-3 sm:px-4 lg:px-8">
        <AdBanner
          imageSrc={userSofaSrc ?? sofaAd}
          alt={"Soffa annons"}
          title={"Soffor — Fynda din nya soffa"}
          description={"Letar du efter en ny soffa? Upptäck kvalitetssoffor till bra priser."}
          bullets={["✓ Fri hemleverans", "✓ 0% delbetalning", "✓ Många tyger och färger"]}
          buttonText={"Se erbjudanden"}
          note={<><strong className="font-semibold">Spara 5 000 kr</strong>{" - Erbjudande: fri frakt denna månad"}</>}
          className="lg:order-1 order-3"
        />
        <main className="order-1 lg:order-2 flex-1 w-full">
          <Hero />
          <PropertyGrid />
        </main>
  <AdBanner
    note={<><strong className="font-semibold">Specialerbjudande: 15% rabatt i april</strong></>}
    className="lg:order-3 order-2"
  />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
