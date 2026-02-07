import { Facebook, Instagram, Mail, MapPin, Linkedin, TrendingUp, Move3D } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="footerHomeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)' }} />
                    <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)' }} />
                  </linearGradient>
                </defs>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="url(#footerHomeGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="9 22 9 12 15 12 15 22" stroke="url(#footerHomeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-2xl font-serif font-bold tracking-tight">BaraHem</span>
            </div>
            <p className="text-white/80">
              En helt ny plattform för bostadsmarknaden med innovativa funktioner och tjänster. 
              Upptäck ett smartare sätt att hitta ditt nästa hem.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Snabblänkar</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-white/80 hover:text-primary-glow transition-colors">
                Köp bostad
              </Link>
              <Link to="/hitta-maklare" className="block text-white/80 hover:text-primary-glow transition-colors">
                Hitta mäklare
              </Link>
              <Link to="/annonsera-pris" className="block text-white/80 hover:text-primary-glow transition-colors">
                Sälj bostad
              </Link>
              <Link to="/marknadsanalys" className="flex items-center gap-2 text-white/80 hover:text-primary-glow transition-colors">
                <TrendingUp className="w-4 h-4" />
                Marknadsanalys
              </Link>
              <Link to="/om-oss" className="block text-white/80 hover:text-primary-glow transition-colors">
                Om oss
              </Link>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Funktioner</h3>
            <div className="space-y-2">
              <Link to="/marknadsanalys" className="flex items-center gap-2 text-white/80 hover:text-primary-glow transition-colors">
                <TrendingUp className="w-4 h-4" />
                Prishistorik
              </Link>
              <span className="flex items-center gap-2 text-white/80">
                <Move3D className="w-4 h-4" />
                360° Virtuella visningar
              </span>
              <span className="block text-white/80">
                VR-funktion
              </span>
              <span className="block text-white/80">
                Statistik i realtid
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <div className="space-y-3">
              <a 
                href="mailto:info@barahem.se" 
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-[hsl(200,98%,35%)] to-[hsl(142,76%,30%)] rounded p-0.5">
                  <Mail className="w-full h-full text-white" />
                </div>
                <span>info@barahem.se</span>
              </a>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gradient-to-br from-[hsl(200,98%,35%)] to-[hsl(142,76%,30%)] rounded p-0.5">
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
                <div className="w-5 h-5 bg-gradient-to-br from-[hsl(200,98%,35%)] to-[hsl(142,76%,30%)] rounded p-0.5">
                  <Facebook className="w-full h-full text-white" />
                </div>
                <span>Facebook</span>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-[hsl(200,98%,35%)] to-[hsl(142,76%,30%)] rounded p-0.5">
                  <Linkedin className="w-full h-full text-white" />
                </div>
                <span>LinkedIn</span>
              </a>
              <a 
                href="https://www.instagram.com/barahem.se/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-[hsl(200,98%,35%)] to-[hsl(142,76%,30%)] rounded p-0.5">
                  <Instagram className="w-full h-full text-white" />
                </div>
                <span>barahem.se</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm md:text-base text-center md:text-left">
            © 2024 BaraHem. Alla rättigheter förbehållna.
          </p>
          <div className="flex gap-4 md:gap-6 text-sm md:text-base">
            <a href="/integritet" className="text-white/60 hover:text-primary-glow transition-colors">
              Integritet
            </a>
            <a href="/villkor" className="text-white/60 hover:text-primary-glow transition-colors">
              Villkor
            </a>
            <a href="/cookies" className="text-white/60 hover:text-primary-glow transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;