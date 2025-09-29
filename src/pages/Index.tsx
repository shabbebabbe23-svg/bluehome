import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PropertyGrid from "@/components/PropertyGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen" style={{background: 'var(--main-gradient)'}}>
      <Header />
      <main>
        <Hero />
        <PropertyGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
