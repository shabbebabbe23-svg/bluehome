import { Home, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Home className="w-8 h-8 text-primary-glow" />
              <span className="text-2xl font-bold">Shabbes Real Estate</span>
            </div>
            <p className="text-white/80">
              Sweden's leading platform for buying, selling, and renting properties. 
              Find your perfect home today.
            </p>
            <div className="flex gap-4">
              <Facebook className="w-5 h-5 text-white/60 hover:text-primary-glow cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-white/60 hover:text-primary-glow cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-white/60 hover:text-primary-glow cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Buy Property
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Rent Property
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Sell Property
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Property Valuation
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Market Insights
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <div className="space-y-2">
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Help Center
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Contact Us
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Terms of Service
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="block text-white/80 hover:text-primary-glow transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-glow" />
                <span className="text-white/80">+46 8 123 456 78</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-glow" />
                <span className="text-white/80">info@shabbesrealestate.se</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary-glow" />
                <span className="text-white/80">Stockholm, Sweden</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 mb-4 md:mb-0">
            © 2024 Shabbes Real Estate. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/60 hover:text-primary-glow transition-colors">
              Privacy
            </a>
            <a href="#" className="text-white/60 hover:text-primary-glow transition-colors">
              Terms
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