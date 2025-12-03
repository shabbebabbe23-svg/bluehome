import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Move3D, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Property {
  id: string;
  title: string;
  address: string;
  image_url: string;
  additional_images: string[];
  has_vr: boolean;
}

const VirtualTour = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, address, image_url, additional_images, has_vr")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error("Error fetching property:", error);
    } finally {
      setLoading(false);
    }
  };

  const allImages = property
    ? [property.image_url, ...(property.additional_images || [])].filter(Boolean)
    : [];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setRotation((prev) => ({
      x: Math.max(-45, Math.min(45, prev.x - deltaY * 0.3)),
      y: prev.y + deltaX * 0.3,
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(3, prev + 0.2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.5, prev - 0.2));
  };

  const handleReset = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Fastighet hittades inte</h1>
          <Button onClick={() => navigate("/")}>Tillbaka till startsidan</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(`/property/${id}`)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Tillbaka till fastigheten
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-green-500/20">
              <Move3D className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <p className="text-muted-foreground">{property.address}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Tour Viewer */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Main Viewer */}
              <div
                ref={containerRef}
                className={`relative bg-black ${isFullscreen ? "h-screen" : "h-[70vh]"} select-none`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* 360 Image Viewer */}
                <div
                  className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
                  style={{
                    perspective: "1000px",
                  }}
                >
                  <div
                    className="w-full h-full transition-transform duration-100"
                    style={{
                      transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {allImages[currentImageIndex] && (
                      <img
                        src={allImages[currentImageIndex]}
                        alt={`${property.title} - Bild ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    )}
                  </div>
                </div>

                {/* Controls Overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleZoomIn}
                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleZoomOut}
                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleReset}
                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </Button>
                </div>

                {/* Instructions */}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
                  <p className="flex items-center gap-2">
                    <Move3D className="w-4 h-4" />
                    Dra för att rotera • Scrolla för att zooma
                  </p>
                </div>

                {/* VR Badge */}
                {property.has_vr && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-primary to-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    VR-redo
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              <div className="p-4 bg-card border-t">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Miniatyr ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Info */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Move3D className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">360° Visning</h3>
                <p className="text-sm text-muted-foreground">
                  Utforska bostaden från alla vinklar med vår interaktiva 360-graders visning
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Maximize2 className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Fullskärmsläge</h3>
                <p className="text-sm text-muted-foreground">
                  Upplev bostaden i fullskärm för maximal immersion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">VR-kompatibel</h3>
                <p className="text-sm text-muted-foreground">
                  Kompatibel med VR-headset för en ännu mer verklighetstrogen upplevelse
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VirtualTour;
