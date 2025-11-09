import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Heart, User, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userType, signOut } = useAuth();
  const location = useLocation();
  const isCommercialPage = location.pathname === "/foretag";

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/20" 
      style={{
        background: isCommercialPage 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #134e4a 80%, #065f46 100%)' 
          : 'var(--main-gradient)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Home className="w-10 h-10 text-primary" />
            <span className="text-4xl font-bold bg-hero-gradient bg-clip-text text-transparent">
              Bluehome
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground text-xl hover:text-primary transition-colors">
              Köp
            </a>
            <a href="#" className="text-foreground text-xl hover:text-primary transition-colors">
              Hyra
            </a>
            <a href="#" className="text-foreground text-xl hover:text-primary transition-colors">
              Sälj
            </a>
            <a href="#" className="text-foreground text-xl hover:text-primary transition-colors">
              Om oss
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to={isCommercialPage ? "/" : "/foretag"}>
              <Button 
                variant="outline" 
                className={`text-xl ${
                  isCommercialPage 
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 border-none text-white hover:from-blue-700 hover:to-green-700 font-bold' 
                    : 'bg-black border-black hover:bg-black/90'
                }`}
              >
                {isCommercialPage ? (
                  "Privat"
                ) : (
                  <span className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent font-bold">
                    Företag
                  </span>
                )}
              </Button>
            </Link>
            {user && userType === "private" ? (
              <Button variant="ghost">
                <Heart className="w-5 h-5 mr-2" />
                Mina favoriter
              </Button>
            ) : (
              <Button variant="ghost" size="icon">
                <Heart className="w-7 h-7" />
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <User className="w-7 h-7" />
            </Button>
            {user ? (
              <Button 
                onClick={signOut}
                className="text-xl bg-hero-gradient hover:scale-105 transition-transform"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logga ut
              </Button>
            ) : (
              <Link to="/logga-in">
                <Button className="text-xl bg-hero-gradient hover:scale-105 transition-transform">
                  Logga in
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            className="md:hidden py-4 border-t border-white/20 backdrop-blur-md animate-fade-in" 
            style={{
              background: isCommercialPage 
                ? 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #134e4a 80%, #065f46 100%)' 
                : 'var(--main-gradient)'
            }}
          >
            <nav className="flex flex-col gap-4">
              <a href="#" className="text-foreground text-xl hover:text-primary transition-colors px-4 py-2">
                Köp
              </a>
              <a href="#" className="text-foreground text-xl hover:text-primary transition-colors px-4 py-2">
                Hyra
              </a>
              <a href="#" className="text-foreground text-xl hover:text-primary transition-colors px-4 py-2">
                Sälj
              </a>
              <a href="#" className="text-foreground text-xl hover:text-primary transition-colors px-4 py-2">
                Om oss
              </a>
              <Link to={isCommercialPage ? "/" : "/foretag"} className="px-4">
                <Button 
                  variant="outline" 
                  className={`text-xl w-full ${
                    isCommercialPage 
                      ? 'bg-gradient-to-r from-blue-600 to-green-600 border-none text-white hover:from-blue-700 hover:to-green-700 font-bold' 
                      : 'bg-black border-black hover:bg-black/90'
                  }`}
                >
                  {isCommercialPage ? (
                    "Privat"
                  ) : (
                    <span className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent font-bold">
                      Företag
                    </span>
                  )}
                </Button>
              </Link>
              <div className="flex flex-col gap-4 px-4 pt-4 border-t border-white/20">
                {user && userType === "private" ? (
                  <Button variant="ghost" className="w-full justify-start">
                    <Heart className="w-5 h-5 mr-2" />
                    Mina favoriter
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon">
                    <Heart className="w-7 h-7" />
                  </Button>
                )}
                <Button variant="ghost" size="icon">
                  <User className="w-7 h-7" />
                </Button>
                {user ? (
                  <Button 
                    onClick={signOut}
                    className="text-xl bg-hero-gradient w-full"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logga ut
                  </Button>
                ) : (
                  <Link to="/logga-in" className="flex-1">
                    <Button className="text-xl bg-hero-gradient w-full">
                      Logga in
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;