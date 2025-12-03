import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import PropertyDetail from "./pages/PropertyDetail";
import CommercialProperties from "./pages/CommercialProperties";
import AgentDashboard from "./pages/AgentDashboard";
import AgentProfile from "./pages/AgentProfile";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AgencyAdminDashboard from "./pages/AgencyAdminDashboard";
import InvitationAccept from "./pages/InvitationAccept";
import Favorites from "./pages/Favorites";
import FindAgent from "./pages/FindAgent";
import AdvertisingPricing from "./pages/AdvertisingPricing";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";
import CreateAgencyManual from "./pages/CreateAgencyManual";
import ManageAgents from "./pages/ManageAgents";
import MarketAnalysis from "./pages/MarketAnalysis";
import VirtualTour from "./pages/VirtualTour";
import ScrollToTop from "@/components/ScrollToTop";
import TopLoadingBar from "@/components/TopLoadingBar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <TopLoadingBar />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/logga-in" element={<Login />} />
            <Route path="/fastighet/:id" element={<PropertyDetail />} />
            <Route path="/foretag" element={<CommercialProperties />} />
            <Route path="/maklare" element={<AgentDashboard />} />
            <Route path="/agent/:agentId" element={<AgentProfile />} />
            <Route path="/superadmin" element={<SuperAdminDashboard />} />
            <Route path="/byra-admin" element={<AgencyAdminDashboard />} />
            <Route path="/skapa-byra-manuellt" element={<CreateAgencyManual />} />
            <Route path="/hantera-maklare" element={<ManageAgents />} />
            <Route path="/acceptera-inbjudan" element={<InvitationAccept />} />
            <Route path="/favoriter" element={<Favorites />} />
            <Route path="/hitta-maklare" element={<FindAgent />} />
            <Route path="/annonsera-pris" element={<AdvertisingPricing />} />
            <Route path="/om-oss" element={<AboutUs />} />
            <Route path="/marknadsanalys" element={<MarketAnalysis />} />
            <Route path="/virtuell-visning/:id" element={<VirtualTour />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
