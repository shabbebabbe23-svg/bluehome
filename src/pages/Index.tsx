import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PropertyGrid from "@/components/PropertyGrid";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";

const Index = () => {
  return (
    <div className="min-h-screen" style={{background: 'var(--main-gradient)'}}>
      <Header />
      <div className="flex justify-center gap-6 px-4 lg:px-8">
        <main className="flex-1 max-w-7xl">
          <Hero />
          <PropertyGrid />
        </main>
        <AdBanner />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
