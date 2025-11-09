import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Building, MapPin, Square } from "lucide-react";
import commercial1 from "@/assets/commercial-1.jpg";
import commercial2 from "@/assets/commercial-2.jpg";
import commercial3 from "@/assets/commercial-3.jpg";
import commercial4 from "@/assets/commercial-4.jpg";
import commercial5 from "@/assets/commercial-5.jpg";
import commercial6 from "@/assets/commercial-6.jpg";
const commercialProperties = [{
  id: "c1",
  title: "Modern kontorslokal i city",
  location: "Stockholm, Vasastan",
  area: "450 m²",
  price: "45 000 kr/mån",
  image: commercial1,
  type: "Kontor"
}, {
  id: "c2",
  title: "Butikslokal på Drottninggatan",
  location: "Stockholm, Centrum",
  area: "120 m²",
  price: "35 000 kr/mån",
  image: commercial2,
  type: "Butik"
}, {
  id: "c3",
  title: "Lagerhall med lastbrygga",
  location: "Göteborg, Hisingen",
  area: "800 m²",
  price: "55 000 kr/mån",
  image: commercial3,
  type: "Lager"
}, {
  id: "c4",
  title: "Restauranglokal vid Stureplan",
  location: "Stockholm, Östermalm",
  area: "200 m²",
  price: "65 000 kr/mån",
  image: commercial4,
  type: "Restaurang"
}, {
  id: "c5",
  title: "Kontorshotell med flexibla ytor",
  location: "Malmö, Västra Hamnen",
  area: "300 m²",
  price: "28 000 kr/mån",
  image: commercial5,
  type: "Kontor"
}, {
  id: "c6",
  title: "Industrilokal med verkstadsutrustning",
  location: "Uppsala, Fyrislund",
  area: "600 m²",
  price: "42 000 kr/mån",
  image: commercial6,
  type: "Industri"
}];
const CommercialProperties = () => {
  const [selectedType, setSelectedType] = useState<string>("Alla");
  const propertyTypes = ["Alla", "Kontor", "Butik", "Lager", "Restaurang", "Industri"];
  const filteredProperties = selectedType === "Alla" ? commercialProperties : commercialProperties.filter(p => p.type === selectedType);
  return <div className="min-h-screen dark bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      <main className="pt-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Building className="w-12 h-12 text-primary" />
            Kommersiella Lokaler
          </h1>
          <p className="text-slate-300 text-xl">Hitta den perfekta lokalen för ert företag</p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {propertyTypes.map(type => <button key={type} onClick={() => setSelectedType(type)} className={`px-6 py-3 rounded-lg font-semibold transition-all ${selectedType === type ? "bg-primary text-white shadow-lg scale-105" : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"}`}>
              {type}
            </button>)}
        </div>

        {/* Property grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredProperties.map(property => <Card key={property.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-slate-800/50 border-slate-700">
              <div className="relative h-48 bg-slate-700">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-slate-900 font-semibold text-xs">
                  VR Funktion
                </div>
                <div className="absolute top-4 right-4 bg-primary px-3 py-1 rounded-full text-white font-semibold text-sm">
                  {property.type}
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  {property.title}
                </h3>
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{property.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-primary" />
                    <span>{property.area}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-2xl font-bold text-white">
                      {property.price}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </main>
      <Footer />
    </div>;
};
export default CommercialProperties;