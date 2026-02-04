import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { inject } from "@vercel/analytics";
import { initFacebookPixel } from "@/lib/facebookPixel";

// Initiera Vercel Analytics
inject();

// Initiera Facebook Pixel för marknadsföring
initFacebookPixel();

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

// Ensure there is a root element (some hosting setups strip index.html)
let rootEl = document.getElementById("root");
if (!rootEl) {
	rootEl = document.createElement("div");
	rootEl.id = "root";
	document.body.appendChild(rootEl);
}

try {
	createRoot(rootEl).render(
		<ErrorBoundary>
			<App />
		</ErrorBoundary>
	);
} catch (err) {
	// Fallback: write a visible error message to the page
	// eslint-disable-next-line no-console
	console.error("Render error:", err);
	if (rootEl) {
		rootEl.innerHTML = `<div style="padding:24px;font-family:system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"><h2 style="color:#b91c1c">Ett fel uppstod vid rendering</h2><pre style="white-space:pre-wrap">${String(err)}</pre></div>`;
	}
}
