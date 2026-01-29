import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, User, Menu, X, LogOut, Plus, Archive, BarChart3, UserCircle, Shield, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    user,
    session,
    userType,
    profileName,
    avatarUrl,
    signOut
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isCommercialPage = location.pathname === "/foretag";
  const isAgentPage = location.pathname === "/maklare";
  const isPropertyDetailPage = location.pathname.startsWith("/fastighet/");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? "backdrop-blur-sm border-b border-transparent"
        : "backdrop-blur-md border-b border-white/20"
        }`}
      style={{
        background: isScrolled
          ? 'transparent'
          : 'var(--main-gradient)'
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            {/* Back Arrow for Mobile on Property Detail Pages */}
            {isPropertyDetailPage && (
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => navigate('/')}
                className="lg:hidden cursor-pointer hover:-translate-x-2 hover:scale-x-110 transition-all duration-300 ease-out origin-center"
              >
                <defs>
                  <linearGradient id="headerArrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="url(#headerArrowGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}



            {/* Logo and Menu Wrapper */}
            <div className="flex items-center gap-1 sm:gap-2">
              {user ? (
                // If logged in: House is the menu trigger
                <DropdownMenu onOpenChange={setIsDesktopMenuOpen}>
                  <DropdownMenuTrigger className="focus:outline-none hover:opacity-80 transition-opacity">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 cursor-pointer" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)' }} />
                          <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)' }} />
                        </linearGradient>
                      </defs>
                      {/* House outline */}
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="url(#homeGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Door Group - Animated with 3D rotation */}
                      <g
                        className={`transform-gpu transition-all duration-700 ease-in-out origin-[9px_17px]`}
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: isDesktopMenuOpen
                            ? 'perspective(1000px) rotateY(-110deg)'
                            : 'perspective(1000px) rotateY(0deg)'
                        }}
                      >
                        {/* Door Leaf */}
                        <rect
                          x="9" y="12" width="6" height="10"
                          stroke="url(#homeGradient)" strokeWidth="2" fill="none"
                          style={{ backfaceVisibility: 'visible' }}
                        />
                        {/* Door Knob */}
                        <circle cx="13.5" cy="17" r="0.5" fill="url(#homeGradient)" />
                      </g>
                    </svg>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 sm:w-64 bg-card z-50">
                    {/* Superadmin specific */}
                    {userType === "superadmin" && (
                      <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200">
                        <Link to="/superadmin" className="flex items-center gap-3 cursor-pointer py-3 sm:py-4">
                          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="font-medium text-base sm:text-lg">Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Agency Admin specific */}
                    {userType === "agency_admin" && (
                      <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200">
                        <Link to="/byra-admin" className="flex items-center gap-3 cursor-pointer py-3 sm:py-4">
                          <User className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="font-medium text-base sm:text-lg">Hantera byrå</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Property management for superadmin, agency_admin, maklare */}
                    {(userType === "superadmin" || userType === "agency_admin" || userType === "maklare") && (
                      <>
                        <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200">
                          <Link to="/maklare" className="flex items-center gap-3 cursor-pointer py-3 sm:py-4">
                            <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="font-medium text-base sm:text-lg">Hantera fastigheter</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200">
                          <Link to="/maklare?tab=profile" className="flex items-center gap-3 cursor-pointer py-3 sm:py-4">
                            <UserCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="font-medium text-base sm:text-lg">Hantera konto</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {/* Buyer specific - Min bostad-profil */}
                    {(userType === "buyer" || userType === "user") && (
                      <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200">
                        <Link to="/min-bostad" className="flex items-center gap-3 cursor-pointer py-3 sm:py-4">
                          <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="font-medium text-base sm:text-lg">Min bostad-profil</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // If not logged in: House is a link to home
                <Link to="/" className="hover:opacity-80 transition-opacity">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'hsl(200 98% 35%)' }} />
                        <stop offset="100%" style={{ stopColor: 'hsl(142 76% 30%)' }} />
                      </linearGradient>
                    </defs>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="url(#homeGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="9 22 9 12 15 12 15 22" stroke="url(#homeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}

              {/* Text is always a link to home */}
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-hero-gradient bg-clip-text text-transparent">
                  BaraHem
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-6 xl:gap-10 ml-4 lg:ml-8 xl:ml-12">

            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm lg:text-base xl:text-xl hover:text-primary transition-colors whitespace-nowrap text-foreground font-medium">
                Sälj
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-72 bg-card z-50 animate-in slide-in-from-top-4 fade-in-0 duration-500">
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
            <Link to="/om-oss" className="text-sm lg:text-base xl:text-xl hover:text-primary transition-colors whitespace-nowrap text-foreground font-medium">
              Om oss
            </Link>
            <Link to="/marknadsanalys" className="text-sm lg:text-base xl:text-xl hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap mr-4 lg:mr-6 xl:mr-8 text-foreground font-medium">
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden lg:inline">Marknadsanalys</span>
              <span className="lg:hidden">Marknad</span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 xl:gap-4">
            {/* User Profile Avatar & Role Indicator */}
            {user && (
              <div className={`flex items-center gap-1 lg:gap-2 xl:gap-3 px-2 xl:px-4 py-1 lg:py-1.5 xl:py-2 rounded-full backdrop-blur-sm border-2 transition-all ${userType === "superadmin" ? "bg-gradient-to-r from-[hsl(200,98%,35%)]/20 to-[hsl(142,76%,30%)]/20 border-[hsl(200,98%,35%)]/60 shadow-lg shadow-[hsl(200,98%,35%)]/30" : "bg-white/10 border-white/30"}`}>
                {/* Profile Avatar */}
                <Link to={userType === "maklare" ? "/maklare?tab=profile" : "#"} className="hover:scale-110 transition-transform relative">
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[hsl(200,98%,50%)] to-[hsl(142,76%,50%)] opacity-100 blur-[3px] animate-[pulse_1s_ease-in-out_infinite]"></div>
                  <Avatar className="relative w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9" style={{ boxShadow: '0 0 0 2px hsl(200, 98%, 35%), 0 0 0 4px hsl(142, 76%, 30%)' }}>
                    <AvatarImage src={avatarUrl || undefined} alt={profileName || "Profil"} />
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(200,98%,35%)] to-[hsl(142,76%,30%)] text-white text-xs xl:text-sm font-bold">
                      {profileName ? profileName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                {userType === "superadmin" && (
                  <Shield className="w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-[hsl(200,98%,50%)]" fill="currentColor" />
                )}
                <span className="hidden lg:block text-xs lg:text-sm xl:text-base font-bold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent drop-shadow max-w-[80px] lg:max-w-[120px] xl:max-w-none truncate">
                  {profileName || session?.user?.email || "Användare"}
                </span>
              </div>
            )}

            {/* Notifications - only for buyers/users, not agents */}
            {user && (userType === "buyer" || userType === "user") && <NotificationBell />}

            <Link to={isCommercialPage ? "/" : "/foretag"}>
              <Button variant="outline" size="sm" className={`text-xs lg:text-sm xl:text-base px-2 lg:px-3 ${isCommercialPage ? 'bg-gradient-to-r from-blue-600 to-green-600 border-none text-white hover:from-blue-700 hover:to-green-700 font-bold' : 'bg-black border-black hover:bg-black/90'}`}>
                {isCommercialPage ? "Privat" : (
                  <span className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent font-bold">
                    Företag
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <Link to="/favoriter">
                <Button variant="ghost" size="sm" className="text-xs lg:text-sm xl:text-base px-2 lg:px-3">
                  <Heart className="w-4 h-4 xl:w-5 xl:h-5 lg:mr-1.5" />
                  <span className="hidden xl:inline">Mina favoriter</span>
                  <span className="hidden lg:inline xl:hidden">Favoriter</span>
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="icon" className="w-8 h-8 lg:w-9 lg:h-9">
                <Heart className="w-4 h-4 lg:w-5 lg:h-5" />
              </Button>
            )}
            {user ? (
              <Button onClick={signOut} size="sm" className="text-xs lg:text-sm xl:text-base px-2 lg:px-3 bg-hero-gradient hover:scale-105 transition-transform">
                <LogOut className="w-4 h-4 xl:w-5 xl:h-5 lg:mr-1.5" />
                <span className="hidden lg:inline">Logga ut</span>
              </Button>
            ) : (
              <Link to="/logga-in">
                <Button size="sm" className="text-xs lg:text-sm xl:text-base px-2 lg:px-3 text-white bg-hero-gradient hover:scale-105 transition-transform whitespace-nowrap">
                  Logga in
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 sm:h-11 sm:w-11 hover:scale-110 transition-all duration-300 ease-out hover:bg-white/20 flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="relative block h-8 w-8 sm:h-9 sm:w-9 ml-2 mt-1">
              {/* Menu Icon with gradient */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`absolute inset-0 w-full h-full transform-gpu transition-all duration-300 ease-out ${isMenuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="mobileMenuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0276B1" />
                    <stop offset="100%" stopColor="#12873D" />
                  </linearGradient>
                </defs>
                <path d="M4 6h16M4 12h16M4 18h16" stroke="url(#mobileMenuGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:stroke-[3]" />
              </svg>

              {/* X Icon with gradient */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`absolute inset-0 w-full h-full transform-gpu transition-all duration-300 ease-out ${isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="mobileCloseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0276B1" />
                    <stop offset="100%" stopColor="#12873D" />
                  </linearGradient>
                </defs>
                <path d="M18 6L6 18M6 6l12 12" stroke="url(#mobileCloseGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:stroke-[3]" />
              </svg>
            </span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden border-t border-white/20 backdrop-blur-md overflow-hidden transform-gpu transition-all duration-300 ease-out ${isMenuOpen
            ? "max-h-[80vh] opacity-100 translate-y-0 py-4"
            : "max-h-0 opacity-0 -translate-y-2 py-0 pointer-events-none"
            }`}
          style={{
            background: 'var(--main-gradient)'
          }}
          aria-hidden={!isMenuOpen}
        >
          <nav className="flex flex-col gap-3">
            {/* User Role Indicator with Avatar for Mobile */}
            {user && (
              <div className={`flex items-center justify-center gap-3 px-4 py-3 mx-4 rounded-lg backdrop-blur-sm border-2 transition-all ${userType === "superadmin" ? "bg-gradient-to-r from-[hsl(200,98%,35%)]/20 to-[hsl(142,76%,30%)]/20 border-[hsl(200,98%,35%)]/60 shadow-lg shadow-[hsl(200,98%,35%)]/30" : "bg-white/10 border-white/30"}`}>
                {/* Mobile Profile Avatar */}
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[hsl(200,98%,50%)] to-[hsl(142,76%,50%)] opacity-100 blur-[3px] animate-[pulse_1s_ease-in-out_infinite]"></div>
                  <Avatar className="relative w-10 h-10" style={{ boxShadow: '0 0 0 2px hsl(200, 98%, 35%), 0 0 0 4px hsl(142, 76%, 30%)' }}>
                    <AvatarImage src={avatarUrl || undefined} alt={profileName || "Profil"} />
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(200,98%,35%)] to-[hsl(142,76%,30%)] text-white text-sm font-bold">
                      {profileName ? profileName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent drop-shadow">
                    {profileName || session?.user?.email || "Användare"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {userType === "superadmin" ? "Superadmin" : userType === "agency_admin" ? "Byrå Admin" : userType === "maklare" ? "Mäklare" : userType === "buyer" ? "Köpare" : "Användare"}
                  </span>
                </div>
                {userType === "superadmin" && <Shield className="w-5 h-5 text-[hsl(200,98%,50%)]" fill="currentColor" />}
              </div>
            )}

            {/* Superadmin Menu Items for Mobile */}
            {user && userType === "superadmin" && (
              <div className="flex flex-col gap-2 px-4 pb-3 border-b border-white/20">
                <Link to="/superadmin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium text-base">Admin Dashboard</span>
                </Link>
                <Link to="/maklare" className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <Home className="w-5 h-5" />
                  <span className="font-medium text-base">Hantera fastigheter</span>
                </Link>
                <Link to="/maklare?tab=profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <UserCircle className="w-5 h-5" />
                  <span className="font-medium text-base">Hantera konto</span>
                </Link>
              </div>
            )}

            {/* Agency Admin Menu Items for Mobile */}
            {user && userType === "agency_admin" && (
              <div className="flex flex-col gap-2 px-4 pb-3 border-b border-white/20">
                <Link to="/byra-admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <User className="w-5 h-5" />
                  <span className="font-medium text-base">Hantera byrå</span>
                </Link>
                <Link to="/maklare" className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <Home className="w-5 h-5" />
                  <span className="font-medium text-base">Hantera fastigheter</span>
                </Link>
                <Link to="/maklare?tab=profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <UserCircle className="w-5 h-5" />
                  <span className="font-medium text-base">Hantera konto</span>
                </Link>
              </div>
            )}

            {/* Agent Menu Items for Mobile */}
            {user && userType === "maklare" && (
              <div className="flex flex-col gap-2 px-4 pb-3 border-b border-white/20">
                <Link to="/maklare" className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <Home className="w-5 h-5" />
                  <span className="font-medium text-base">Hantera fastigheter</span>
                </Link>
                <Link to="/maklare?tab=profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <UserCircle className="w-5 h-5" />
                  <span className="font-medium text-base">Hantera konto</span>
                </Link>
              </div>
            )}

            {/* Buyer Menu Items for Mobile */}
            {user && (userType === "buyer" || userType === "user") && (
              <div className="flex flex-col gap-2 px-4 pb-3 border-b border-white/20">
                <Link to="/min-bostad" className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <Home className="w-5 h-5" />
                  <span className="font-medium text-base">Min bostad-profil</span>
                </Link>
              </div>
            )}
            <div className="px-4">
              <DropdownMenu>
                <DropdownMenuTrigger className={`text-lg hover:text-primary transition-colors ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`}>
                  Sälj
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 bg-card z-50 animate-in slide-in-from-top-4 fade-in-0 duration-500">
                  <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200 cursor-pointer py-3">
                    <Link to="/hitta-maklare" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <span className="font-medium text-base">Hitta rätt mäklare för dig</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-accent transition-colors duration-200 cursor-pointer py-3">
                    <Link to="/annonsera-pris" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <span className="font-medium text-base">Pris för att annonsera på BaraHem</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Link to="/om-oss" className={`text-lg hover:text-primary transition-colors px-4 py-2 ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`} onClick={() => setIsMenuOpen(false)}>
              Om oss
            </Link>

            <Link to="/marknadsanalys" className={`text-lg hover:text-primary transition-colors px-4 py-2 flex items-center gap-2 ${isCommercialPage || isAgentPage ? 'text-white' : 'text-black'}`} onClick={() => setIsMenuOpen(false)}>
              <TrendingUp className="w-5 h-5" />
              Marknadsanalys
            </Link>

            <Link to={isCommercialPage ? "/" : "/foretag"} className="px-4">
              <Button variant="outline" className={`text-base w-full ${isCommercialPage ? 'bg-gradient-to-r from-blue-600 to-green-600 border-none text-white hover:from-blue-700 hover:to-green-700 font-bold' : 'bg-black border-black hover:bg-black/90'}`}>
                {isCommercialPage ? "Privat" : (
                  <span className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent font-bold">
                    Företag
                  </span>
                )}
              </Button>
            </Link>

            <div className="flex flex-col gap-3 px-4 pt-3 border-t border-white/20">
              {user ? (
                <>
                  <Link to="/favoriter" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Heart className="w-5 h-5 mr-2" />
                      Mina favoriter
                    </Button>
                  </Link>
                  <Button onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }} className="text-base bg-hero-gradient w-full">
                    <LogOut className="w-5 h-5 mr-2" />
                    Logga ut
                  </Button>
                </>
              ) : (
                <Link to="/logga-in" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button className="text-base text-white bg-hero-gradient w-full">
                    Logga in
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
