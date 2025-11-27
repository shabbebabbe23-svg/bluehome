import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Heart, Users, TrendingUp, Award, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <>
            <Header />
            <div className="min-h-screen pt-24 pb-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-16 animate-fade-in">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                            Om BaraHem
                        </h1>
                        <p className="text-xl md:text-2xl text-black max-w-3xl mx-auto">
                            Vi gör vägen till ditt nya hem enklare, smidigare och helt kostnadsfri
                        </p>
                    </div>

                    {/* Mission Statement */}
                    <Card className="mb-12 border-2 border-primary/20">
                        <CardContent className="py-12 px-6 md:px-12">
                            <div className="flex items-center gap-3 mb-6">
                                <Home className="w-10 h-10 text-primary" />
                                <h2 className="text-3xl font-bold text-black">Vår Mission</h2>
                            </div>
                            <p className="text-lg leading-relaxed mb-6 text-black">
                                På BaraHem ser vi det som vårt viktigaste jobb att göra vägen till ett nytt hem så smidig, enkel och effektiv som möjligt för alla. Vi strävar efter att skapa en transparent och tillgänglig bostadsmarknad där bostadssäljare kan nå ut till alla potentiella köpare, och där köpare får tillgång till alla bostäder till salu.
                            </p>
                            <p className="text-lg leading-relaxed font-semibold text-primary">
                                Kort sagt – vi tror på en öppen bostadsmarknad som gynnar alla.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Key Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <CardContent className="py-8 px-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-black">100% Gratis Annonsering</h3>
                                <p className="text-black">
                                    Vi erbjuder helt kostnadsfri grundannonsering för alla som vill sälja sin bostad. Ingen dold kostnad, inga överraskningar.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <CardContent className="py-8 px-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-black">Tillgänglig för Alla</h3>
                                <p className="text-black">
                                    Vår plattform är öppen och tillgänglig för alla köpare och säljare, utan begränsningar eller exklusiva krav.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <CardContent className="py-8 px-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-black">Transparent Marknad</h3>
                                <p className="text-black">
                                    Vi tror på öppenhet och transparens. Alla annonser är synliga för alla, vilket skapar en rättvis marknad.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* How We Make It Possible */}
                    <Card className="mb-12 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                        <CardContent className="py-10 px-6 md:px-12">
                            <div className="flex items-center gap-3 mb-6">
                                <Award className="w-10 h-10 text-primary" />
                                <h2 className="text-3xl font-bold text-black">Hur Gör Vi Det Möjligt?</h2>
                            </div>
                            <p className="text-lg leading-relaxed mb-4 text-black">
                                Tack vare våra samarbetspartners och reklamintäkter kan vi erbjuda grundannonsering helt kostnadsfritt. Detta gör att vi kan hålla vår tjänst tillgänglig för alla, oavsett budget.
                            </p>
                            <p className="text-lg leading-relaxed text-black">
                                Vi är stolta över att kunna erbjuda en plattform där alla har samma möjligheter att hitta sitt drömhem eller sälja sin bostad till rätt köpare.
                            </p>
                        </CardContent>
                    </Card>

                    {/* CTA Section */}
                    <div className="text-center">
                        <Card className="bg-hero-gradient text-white border-none">
                            <CardContent className="py-12">
                                <Heart className="w-16 h-16 mx-auto mb-6" />
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                    Redo att hitta ditt nya hem?
                                </h2>
                                <p className="text-xl mb-8 opacity-90">
                                    Börja din resa mot ditt drömhem idag
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        className="text-lg"
                                        onClick={() => navigate('/')}
                                    >
                                        Sök Bostäder
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="text-lg bg-white/10 hover:bg-white/20 border-white/30"
                                        onClick={() => navigate('/hitta-maklare')}
                                    >
                                        Hitta Mäklare
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AboutUs;
