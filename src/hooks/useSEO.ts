import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  schema?: object;
  keywords?: string[];
}

/**
 * Hook för att hantera SEO meta-taggar dynamiskt
 */
export const useSEO = ({
  title,
  description,
  image = 'https://www.barahem.se/og-image.png',
  url,
  type = 'website',
  noIndex = false,
  schema,
  keywords = [],
}: SEOProps) => {
  useEffect(() => {
    // Uppdatera titel
    const fullTitle = title.includes('BaraHem') ? title : `${title} | BaraHem`;
    document.title = fullTitle;

    // Helper för att sätta/uppdatera meta-taggar
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Basiska meta-taggar
    setMeta('description', description);
    
    if (keywords.length > 0) {
      setMeta('keywords', keywords.join(', '));
    }

    // Robots
    if (noIndex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      setMeta('robots', 'index, follow');
    }

    // Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:type', type, true);
    setMeta('og:image', image, true);
    if (url) {
      setMeta('og:url', url, true);
    }
    setMeta('og:site_name', 'BaraHem', true);
    setMeta('og:locale', 'sv_SE', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    // Canonical URL
    if (url) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = url;
    }

    // JSON-LD Schema
    if (schema) {
      let schemaScript = document.getElementById('dynamic-schema') as HTMLScriptElement;
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'dynamic-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    }

    // Cleanup
    return () => {
      document.title = 'BaraHem - Hitta ditt drömhem i Sverige';
      
      // Återställ description
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) {
        descMeta.setAttribute('content', 'Sveriges modernaste fastighetsplattform. Utforska tusentals fastigheter till salu över hela Sverige.');
      }

      // Ta bort dynamic schema
      const dynamicSchema = document.getElementById('dynamic-schema');
      if (dynamicSchema) dynamicSchema.remove();

      // Återställ canonical
      const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (canonical) {
        canonical.href = 'https://www.barahem.se';
      }

      // Återställ OG
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', 'https://www.barahem.se');
    };
  }, [title, description, image, url, type, noIndex, schema, keywords]);
};

/**
 * Generera breadcrumb schema för bättre Google-resultat
 */
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

/**
 * Generera FAQ schema för bättre Google-resultat
 */
export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

/**
 * Generera LocalBusiness schema
 */
export const generateLocalBusinessSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "BaraHem",
    "url": "https://www.barahem.se",
    "logo": "https://www.barahem.se/og-image.png",
    "description": "Sveriges modernaste fastighetsplattform för att hitta bostäder till salu.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "SE"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Sweden"
    },
    "priceRange": "$$"
  };
};

export default useSEO;
