import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Heart, User, Menu, X, LogOut, Plus, Archive, BarChart3, UserCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userType, signOut } = useAuth();
  const location = useLocation();
  const isCommercialPage = location.pathname === "/foretag";
  const isAgentPage = location.pathname === "/maklare";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/20"
      style={{
        background: 'var(--main-gradient)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Superadmin Menu Button */}
            {user && userType === "superadmin" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="lg" className="hidden md:flex h-14 w-14 hover:scale-110 transition-all duration-300">
                    <Menu className="w-12 h-12" strokeWidth={2.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-64 bg-card z-50 animate-in slide-in-from-top-4 fade-in-0 duration-500 origin-top"
                >
                  <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200">
                    <Link to="/superadmin" className="flex items-center gap-3 cursor-pointer py-4">
                      <BarChart3 className="w-6 h-6" />
                      <span className="font-medium text-lg">Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Agent Menu Button */}
            {user && userType === "maklare" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="lg" className="hidden md:flex h-14 w-14 hover:scale-110 transition-all duration-300">
                    <Menu className="w-12 h-12" strokeWidth={2.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-64 bg-card z-50 animate-in slide-in-from-top-4 fade-in-0 duration-500 origin-top"
                >
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
              </DropdownMenu>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)' }} />
                    <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)' }} />
                  </linearGradient>
                </defs>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="url(#homeGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="9 22 9 12 15 12 15 22" stroke="url(#homeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xl md:text-2xl lg:text-3xl font-bold bg-hero-gradient bg-clip-text text-transparent">
                BaraHem
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            <a href="#" className={`text-sm md:text-base lg:text-xl hover:text-primary transition-colors ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
              Köp
            </a>

            <DropdownMenu>
              <DropdownMenuTrigger className={`text-sm md:text-base lg:text-xl hover:text-primary transition-colors ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
                Sälj
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-72 bg-card z-50 animate-in slide-in-from-top-4 fade-in-0 duration-500"
              >
                <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200 cursor-pointer py-4">
                  <Link to="/hitta-maklare" className="w-full">
                    <span className="font-medium text-base">Hitta rätt mäklare för dig</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200 cursor-pointer py-4">
                  <Link to="/annonsera-pris" className="w-full">
                    <span className="font-medium text-base">Pris för att annonsera på BaraHem</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/om-oss" className={`text-sm md:text-base lg:text-xl hover:text-primary transition-colors ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
              Om oss
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {/* User Role Indicator */}
            {user && userType && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border-2 transition-all ${userType === "superadmin"
                ? "bg-gradient-to-r from-[hsl(200,98%,35%)]/20 to-[hsl(142,76%,30%)]/20 border-[hsl(200,98%,35%)]/60 shadow-lg shadow-[hsl(200,98%,35%)]/30"
                : "bg-white/10 border-white/30"
                }`}>
                {userType === "superadmin" ? (
                  <Shield className="w-5 h-5 text-[hsl(200,98%,50%)]" fill="currentColor" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                )}
                <span className="text-base font-bold text-white">
                  {userType === "superadmin" ? "Superadmin" :
                    userType === "agency_admin" ? "Byrå Admin" :
                      userType === "maklare" ? "Mäklare" :
                        userType === "buyer" ? "Köpare" : "Användare"}
                </span>
              </div>
            )}

            {/* Notifications */}
            {user && (userType === "maklare" || userType === "buyer") && <NotificationBell />}

            <Link to={isCommercialPage ? "/" : "/foretag"}>
              <Button
                variant="outline"
                className={`text-sm lg:text-base ${isCommercialPage
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
            {user ? (
              <Link to="/favoriter">
                <Button variant="ghost" className="text-sm lg:text-base">
                  <Heart className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                  Mina favoriter
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="icon">
                <Heart className="w-5 h-5 lg:w-6 lg:h-6" />
              </Button>
            )}
            {user ? (
              <Button
                onClick={signOut}
                className="text-sm lg:text-base bg-hero-gradient hover:scale-105 transition-transform"
              >
                <LogOut className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Logga ut
              </Button>
            ) : (
              <Link to="/logga-in">
                <Button className="text-sm lg:text-base text-white bg-hero-gradient hover:scale-105 transition-transform">
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
            {isMenuOpen ? <X className="w-10 h-10" strokeWidth={2.5} /> : <Menu className="w-10 h-10" strokeWidth={2.5} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            className="md:hidden py-4 border-t border-white/20 backdrop-blur-md animate-fade-in"
            style={{
              background: 'var(--main-gradient)'
            }}
          >
            <nav className="flex flex-col gap-4">
              {/* User Role Indicator for Mobile */}
              {user && userType && (
                <div className={`flex items-center justify-center gap-3 px-5 py-4 mx-4 rounded-lg backdrop-blur-sm border-2 transition-all ${userType === "superadmin"
                  ? "bg-gradient-to-r from-[hsl(200,98%,35%)]/20 to-[hsl(142,76%,30%)]/20 border-[hsl(200,98%,35%)]/60 shadow-lg shadow-[hsl(200,98%,35%)]/30"
                  : "bg-white/10 border-white/30"
                  }`}>
                  {userType === "superadmin" ? (
                    <Shield className="w-6 h-6 text-[hsl(200,98%,50%)]" fill="currentColor" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  )}
                  <span className="text-lg font-bold text-white">
                    Inloggad som: {userType === "superadmin" ? "Superadmin" :
                      userType === "agency_admin" ? "Byrå Admin" :
                        userType === "maklare" ? "Mäklare" : "Användare"}
                  </span>
                </div>
              )}

              {/* Superadmin Menu Items for Mobile */}
              {user && userType === "superadmin" && (
                <div className="flex flex-col gap-2 px-4 pb-4 border-b border-white/20">
                  <Link
                    to="/superadmin"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span className="font-medium text-lg">Admin Dashboard</span>
                  </Link>
                </div>
              )}

              {/* Agent Menu Items for Mobile */}
              {user && userType === "maklare" && (
                <div className="flex flex-col gap-2 px-4 pb-4 border-b border-white/20">
                  <Link
                    to="/maklare?tab=add"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="w-6 h-6" />
                    <span className="font-medium text-lg">Lägg till ny bostad</span>
                  </Link>
                  <Link
                    to="/maklare?tab=existing"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="w-6 h-6" />
                    <span className="font-medium text-lg">Befintliga bostäder</span>
                  </Link>
                  <Link
                    to="/maklare?tab=removed"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Archive className="w-6 h-6" />
                    <span className="font-medium text-lg">Borttagna bostäder</span>
                  </Link>
                  <Link
                    to="/maklare?tab=statistics"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span className="font-medium text-lg">Din statistik</span>
                  </Link>
                  <Link
                    to="/maklare?tab=profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircle className="w-6 h-6" />
                    <span className="font-medium text-lg">Min profil</span>
                  </Link>
                </div>
              )}

              <a href="#" className={`text-xl hover:text-primary transition-colors px-4 py-2 ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
                Köp
              </a>

              <div className="px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger className={`text-xl hover:text-primary transition-colors ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
                    Sälj
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-80 bg-card z-50 animate-in slide-in-from-top-4 fade-in-0 duration-500"
                  >
                    <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200 cursor-pointer py-4">
                      <Link to="/hitta-maklare" className="w-full" onClick={() => setIsMenuOpen(false)}>
                        <span className="font-medium text-lg">Hitta rätt mäklare för dig</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200 cursor-pointer py-4">
                      <Link to="/annonsera-pris" className="w-full" onClick={() => setIsMenuOpen(false)}>
                        <span className="font-medium text-lg">Pris för att annonsera på BaraHem</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Link to="/om-oss" className={`text-xl hover:text-primary transition-colors px-4 py-2 ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`} onClick={() => setIsMenuOpen(false)}>
                Om oss
              </Link>
              <Link to={isCommercialPage ? "/" : "/foretag"} className="px-4">
                <Button
                  variant="outline"
                  className={`text-xl w-full ${isCommercialPage
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
                {user ? (
                  <>
                    <Link to="/favoriter" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Heart className="w-5 h-5 mr-2" />
                        Mina favoriter
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="text-xl bg-hero-gradient w-full"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Logga ut
                    </Button>
                  </>
                ) : (
                  <Link to="/logga-in" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button className="text-xl text-white bg-hero-gradient w-full">
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