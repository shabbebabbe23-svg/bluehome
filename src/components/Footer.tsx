import { Home, Facebook, Twitter, Instagram, Mail, Phone, MapPin, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Home className="w-8 h-8 text-primary-glow" />
              <span className="text-2xl font-bold">BaraHem</span>
            </div>
            <p className="text-white/80">
              Sveriges ledande plattform för att köpa, sälja och hyra fastigheter. 
              Hitta ditt perfekta hem idag.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Snabblänkar</h3>
            <div className="space-y-2">
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Köp bostad
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Hyra bostad
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Sälj bostad
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Bostadsvärdering
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Marknadsinsikter
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <div className="space-y-2">
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Hjälpcenter
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Kontakta oss
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Användarvillkor
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Integritetspolicy
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Cookiepolicy
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gradient-to-br from-[hsl(200,98%,39%)] to-[hsl(142,76%,36%)] rounded p-0.5">
                  <Phone className="w-full h-full text-white" />
                </div>
                <span className="text-white/80">+46 8 123 456 78</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gradient-to-br from-[hsl(200,98%,39%)] to-[hsl(142,76%,36%)] rounded p-0.5">
                  <Mail className="w-full h-full text-white" />
                </div>
                <span className="text-white/80">info@barahem.se</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gradient-to-br from-[hsl(200,98%,39%)] to-[hsl(142,76%,36%)] rounded p-0.5">
                  <MapPin className="w-full h-full text-white" />
                </div>
                <span className="text-white/80">Stockholm, Sverige</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Följ oss</h3>
            <div className="flex flex-col gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-[hsl(200,98%,39%)] to-[hsl(142,76%,36%)] rounded p-0.5">
                  <Facebook className="w-full h-full text-white" />
                </div>
                <span>Facebook</span>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-[hsl(200,100%,50%)] to-[hsl(142,76%,45%)] rounded p-0.5">
                  <Instagram className="w-full h-full text-white" />
                </div>
                <span>Instagram</span>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-[hsl(200,98%,39%)] to-[hsl(142,76%,36%)] rounded p-0.5">
                  <Linkedin className="w-full h-full text-white" />
                </div>
                <span>LinkedIn</span>
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-[hsl(200,98%,39%)] to-[hsl(142,76%,36%)] rounded p-0.5">
                  <Twitter className="w-full h-full text-white" />
                </div>
                <span>X (Twitter)</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm md:text-base text-center md:text-left">
            © 2024 BaraHem. Alla rättigheter förbehållna.
          </p>
          <div className="flex gap-4 md:gap-6 text-sm md:text-base">
            <a href="#" className="text-white/60 hover:text-primary-glow transition-colors">
              Integritet
            </a>
            <a href="#" className="text-white/60 hover:text-primary-glow transition-colors">
              Villkor
            </a>
            <a href="#" className="text-white/60 hover:text-primary-glow transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;