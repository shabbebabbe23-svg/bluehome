import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App.tsx";
import "./index.css";

// Preload a few critical vendor logos early to avoid flicker
import logo1 from "@/assets/logo-1.svg";
import logo2 from "@/assets/logo-2.svg";
import logo3 from "@/assets/logo-3.svg";
import logo4 from "@/assets/logo-4.svg";

try {
	[logo1, logo2, logo3, logo4].forEach((src) => {
		const img = new Image();
		img.src = src;
	});
} catch (e) {
	// ignore preload errors
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
