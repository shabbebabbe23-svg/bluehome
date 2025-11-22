import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Heart, User, Menu, X, LogOut, Plus, Archive, BarChart3, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import bluehomeLogo from "@/assets/bluehome-logo.png";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    user,
    userType,
    signOut
  } = useAuth();
  const location = useLocation();
  const isCommercialPage = location.pathname === "/foretag";
  const isAgentPage = location.pathname === "/maklare";
  return <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/20" style={{
    background: 'var(--main-gradient)'
  }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Agent Menu Button */}
            {user && userType === "maklare" && <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="lg" className="hidden md:flex h-14 w-14 hover:scale-110 transition-all duration-300">
                    <Menu className="w-12 h-12" strokeWidth={2.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 bg-card z-50 animate-in slide-in-from-top-4 fade-in-0 duration-500 origin-top">
                  <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200">
                    <Link to="/maklare?tab=add" className="flex items-center gap-3 cursor-pointer py-4">
                      <Plus className="w-6 h-6" />
                      <span className="font-medium text-lg">Lägg till ny bostad</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200">
                    <Link to="/maklare?tab=existing" className="flex items-center gap-3 cursor-pointer py-4">
                      <Home className="w-6 h-6" />
                      <span className="font-medium text-lg">Befintliga bostäder</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200">
                    <Link to="/maklare?tab=removed" className="flex items-center gap-3 cursor-pointer py-4">
                      <Archive className="w-6 h-6" />
                      <span className="font-medium text-lg">Borttagna bostäder</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200">
                    <Link to="/maklare?tab=statistics" className="flex items-center gap-3 cursor-pointer py-4">
                      <BarChart3 className="w-6 h-6" />
                      <span className="font-medium text-lg">Din statistik</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200">
                    <Link to="/maklare?tab=profile" className="flex items-center gap-3 cursor-pointer py-4">
                      <UserCircle className="w-6 h-6" />
                      <span className="font-medium text-lg">Min profil</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>}
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity">
              <img alt="Bluehome" className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-cover opacity-75" src="/lovable-uploads/6398cdfb-70c8-4690-84b8-8b9faaa3027e.png" />
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-hero-gradient bg-clip-text text-transparent">
                Bluehome
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            <a href="#" className={`text-sm md:text-base lg:text-xl hover:text-primary transition-colors ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
              Köp
            </a>
            <a href="#" className={`text-sm md:text-base lg:text-xl hover:text-primary transition-colors ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
              Hyra
            </a>
            <a href="#" className={`text-sm md:text-base lg:text-xl hover:text-primary transition-colors ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
              Sälj
            </a>
            <a href="#" className={`text-sm md:text-base lg:text-xl hover:text-primary transition-colors ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
              Om oss
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <Link to={isCommercialPage ? "/" : "/foretag"}>
              <Button variant="outline" className={`text-sm lg:text-base ${isCommercialPage ? 'bg-gradient-to-r from-blue-600 to-green-600 border-none text-white hover:from-blue-700 hover:to-green-700 font-bold' : 'bg-black border-black hover:bg-black/90'}`}>
                {isCommercialPage ? "Privat" : <span className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent font-bold">
                    Företag
                  </span>}
              </Button>
            </Link>
            {user && userType === "user" ? <Button variant="ghost" className="text-sm lg:text-base">
                <Heart className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Mina favoriter
              </Button> : <Button variant="ghost" size="icon">
                <Heart className="w-5 h-5 lg:w-6 lg:h-6" />
              </Button>}
            {user ? <Button onClick={signOut} className="text-sm lg:text-base bg-hero-gradient hover:scale-105 transition-transform">
                <LogOut className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Logga ut
              </Button> : <Link to="/logga-in">
                <Button className="text-sm lg:text-base text-white bg-hero-gradient hover:scale-105 transition-transform">
                  Logga in
                </Button>
              </Link>}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-10 h-10" strokeWidth={2.5} /> : <Menu className="w-10 h-10" strokeWidth={2.5} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden py-4 border-t border-white/20 backdrop-blur-md animate-fade-in" style={{
        background: 'var(--main-gradient)'
      }}>
            <nav className="flex flex-col gap-4">
              {/* Agent Menu Items for Mobile */}
              {user && userType === "maklare" && <div className="flex flex-col gap-2 px-4 pb-4 border-b border-white/20">
                  <Link to="/maklare?tab=add" className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <Plus className="w-6 h-6" />
                    <span className="font-medium text-lg">Lägg till ny bostad</span>
                  </Link>
                  <Link to="/maklare?tab=existing" className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <Home className="w-6 h-6" />
                    <span className="font-medium text-lg">Befintliga bostäder</span>
                  </Link>
                  <Link to="/maklare?tab=removed" className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <Archive className="w-6 h-6" />
                    <span className="font-medium text-lg">Borttagna bostäder</span>
                  </Link>
                  <Link to="/maklare?tab=statistics" className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <BarChart3 className="w-6 h-6" />
                    <span className="font-medium text-lg">Din statistik</span>
                  </Link>
                  <Link to="/maklare?tab=profile" className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <UserCircle className="w-6 h-6" />
                    <span className="font-medium text-lg">Min profil</span>
                  </Link>
                </div>}
              
              <a href="#" className={`text-xl hover:text-primary transition-colors px-4 py-2 ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
                Köp
              </a>
              <a href="#" className={`text-xl hover:text-primary transition-colors px-4 py-2 ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
                Hyra
              </a>
              <a href="#" className={`text-xl hover:text-primary transition-colors px-4 py-2 ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
                Sälj
              </a>
              <a href="#" className={`text-xl hover:text-primary transition-colors px-4 py-2 ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
                Om oss
              </a>
              <Link to={isCommercialPage ? "/" : "/foretag"} className="px-4">
                <Button variant="outline" className={`text-xl w-full ${isCommercialPage ? 'bg-gradient-to-r from-blue-600 to-green-600 border-none text-white hover:from-blue-700 hover:to-green-700 font-bold' : 'bg-black border-black hover:bg-black/90'}`}>
                  {isCommercialPage ? "Privat" : <span className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent font-bold">
                      Företag
                    </span>}
                </Button>
              </Link>
              <div className="flex flex-col gap-4 px-4 pt-4 border-t border-white/20">
                {user && userType === "user" ? <Button variant="ghost" className="w-full justify-start">
                    <Heart className="w-5 h-5 mr-2" />
                    Mina favoriter
                  </Button> : <Button variant="ghost" size="icon">
                    <Heart className="w-7 h-7" />
                  </Button>}
                {user ? <Button onClick={signOut} className="text-xl bg-hero-gradient w-full">
                    <LogOut className="w-5 h-5 mr-2" />
                    Logga ut
                  </Button> : <Link to="/logga-in" className="flex-1">
                    <Button className="text-xl text-white bg-hero-gradient w-full">
                      Logga in
                    </Button>
                  </Link>}
              </div>
            </nav>
          </div>}
      </div>
    </header>;
};
export default Header;