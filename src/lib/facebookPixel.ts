/**
 * Facebook Pixel Integration
 * 
 * För att använda:
 * 1. Skapa ett Facebook Business-konto på business.facebook.com
 * 2. Gå till Events Manager och skapa en Pixel
 * 3. Kopiera Pixel ID och lägg i .env som VITE_FACEBOOK_PIXEL_ID
 */

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const FB_PIXEL_ID = import.meta.env.VITE_FACEBOOK_PIXEL_ID;

// Initiera Facebook Pixel
export const initFacebookPixel = () => {
  if (!FB_PIXEL_ID) {
    console.warn('Facebook Pixel ID saknas. Lägg till VITE_FACEBOOK_PIXEL_ID i .env');
    return;
  }

  // Undvik att ladda dubbelt
  if (window.fbq) return;

  // Facebook Pixel base code
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', FB_PIXEL_ID);
  window.fbq('track', 'PageView');

  console.log('Facebook Pixel initialized:', FB_PIXEL_ID);
};

// Tracka sidvisning
export const trackPageView = () => {
  if (!window.fbq) return;
  window.fbq('track', 'PageView');
};

// Tracka när någon visar en fastighet
export const trackViewContent = (property: {
  id: string;
  title: string;
  price?: number;
  type?: string;
  city?: string;
}) => {
  if (!window.fbq) return;
  window.fbq('track', 'ViewContent', {
    content_ids: [property.id],
    content_name: property.title,
    content_type: 'home_listing',
    content_category: property.type || 'property',
    value: property.price || 0,
    currency: 'SEK',
    city: property.city,
  });
};

// Tracka sökning
export const trackSearch = (searchQuery: string, filters?: {
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  if (!window.fbq) return;
  window.fbq('track', 'Search', {
    search_string: searchQuery,
    content_category: filters?.type || 'property',
    city: filters?.city,
    ...filters,
  });
};

// Tracka när någon lägger till favorit
export const trackAddToWishlist = (property: {
  id: string;
  title: string;
  price?: number;
}) => {
  if (!window.fbq) return;
  window.fbq('track', 'AddToWishlist', {
    content_ids: [property.id],
    content_name: property.title,
    content_type: 'home_listing',
    value: property.price || 0,
    currency: 'SEK',
  });
};

// Tracka kontaktförfrågan (Lead)
export const trackLead = (propertyId?: string, leadType?: string) => {
  if (!window.fbq) return;
  window.fbq('track', 'Lead', {
    content_ids: propertyId ? [propertyId] : undefined,
    content_category: leadType || 'contact_request',
  });
};

// Tracka visningsbokning
export const trackSchedule = (property: {
  id: string;
  title: string;
}) => {
  if (!window.fbq) return;
  window.fbq('track', 'Schedule', {
    content_ids: [property.id],
    content_name: property.title,
    content_type: 'home_listing',
  });
};

// Tracka registrering
export const trackCompleteRegistration = (userType?: string) => {
  if (!window.fbq) return;
  window.fbq('track', 'CompleteRegistration', {
    content_name: userType || 'user',
  });
};

// Tracka delning
export const trackShare = (platform: string, propertyId?: string) => {
  if (!window.fbq) return;
  window.fbq('trackCustom', 'Share', {
    platform,
    content_ids: propertyId ? [propertyId] : undefined,
  });
};

// Custom event för mäklarkontakt
export const trackAgentContact = (agentId: string, contactMethod: string) => {
  if (!window.fbq) return;
  window.fbq('trackCustom', 'AgentContact', {
    agent_id: agentId,
    contact_method: contactMethod,
  });
};
