import { Facebook, Instagram, Mail, Phone, MapPin, Linkedin } from "lucide-react";

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
                  <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
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