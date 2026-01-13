import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";

// Lazy load all route components for better performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const CommercialProperties = lazy(() => import("./pages/CommercialProperties"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const AgentProfile = lazy(() => import("./pages/AgentProfile"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const AgencyAdminDashboard = lazy(() => import("./pages/AgencyAdminDashboard"));
const InvitationAccept = lazy(() => import("./pages/InvitationAccept"));
const Favorites = lazy(() => import("./pages/Favorites"));
const FindAgent = lazy(() => import("./pages/FindAgent"));
const AdvertisingPricing = lazy(() => import("./pages/AdvertisingPricing"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CreateAgencyManual = lazy(() => import("./pages/CreateAgencyManual"));
const ManageAgents = lazy(() => import("./pages/ManageAgents"));
const MarketAnalysis = lazy(() => import("./pages/MarketAnalysis"));
const VirtualTour = lazy(() => import("./pages/VirtualTour"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Keep these components loaded immediately as they're used globally
import ScrollToTop from "@/components/ScrollToTop";
import TopLoadingBar from "@/components/TopLoadingBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ComparisonFloatingButton } from "@/components/ComparisonFloatingButton";
import { ComparisonModal } from "@/components/ComparisonModal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ComparisonProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <TopLoadingBar />
            <ScrollToTop />
            <ComparisonFloatingButton />
            <ComparisonModal />
            <Suspense fallback={<LoadingSpinner />}>
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
                <Route path="/aterstall-losenord" element={<ResetPassword />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </TooltipProvider>
        </ComparisonProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
