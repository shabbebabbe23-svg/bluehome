import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Heart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Home className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold bg-hero-gradient bg-clip-text text-transparent">
              Bluehome
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              Köp
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              Hyra
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              Sälj
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              Om oss
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <Link to="/logga-in">
              <Button className="bg-hero-gradient hover:scale-105 transition-transform">
                Logga in
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 bg-white/95 backdrop-blur-md animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a href="#" className="text-foreground hover:text-primary transition-colors px-4 py-2">
                Köp
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors px-4 py-2">
                Hyra
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors px-4 py-2">
                Sälj
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors px-4 py-2">
                Om oss
              </a>
              <div className="flex items-center gap-4 px-4 pt-4 border-t border-white/20">
                <Button variant="ghost" size="icon">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
                <Link to="/logga-in" className="flex-1">
                  <Button className="bg-hero-gradient w-full">
                    Logga in
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;