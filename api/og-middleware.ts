import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Lista över sociala medier crawlers
  const socialCrawlers = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'LinkedInBot',
    'Pinterest',
    'Slackbot',
    'TelegramBot',
    'WhatsApp',
    'Discordbot',
  ];
  
  const isSocialCrawler = socialCrawlers.some(crawler => 
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
  
  // Endast hantera fastighets-URLs för sociala crawlers
  const propertyMatch = url.pathname.match(/^\/fastighet\/([a-zA-Z0-9-]+)$/);
  
  if (!isSocialCrawler || !propertyMatch) {
    // Låt Vercel hantera vanliga requests
    return fetch(request);
  }
  
  const propertyId = propertyMatch[1];
  
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return fetch(request);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: property, error } = await supabase
      .from('properties')
      .select('address, city, type, rooms, area, price, images, description')
      .eq('id', propertyId)
      .single();
    
    if (error || !property) {
      console.error('Property not found:', propertyId);
      return fetch(request);
    }
    
    const title = `${property.address}${property.city ? `, ${property.city}` : ''} - Till salu | BaraHem`;
    const description = `${property.type || 'Bostad'}${property.rooms ? ` med ${property.rooms} rum` : ''}${property.area ? `, ${property.area} kvm` : ''} på ${property.address}${property.city ? ` i ${property.city}` : ''}.${property.price ? ` Pris: ${Number(property.price).toLocaleString('sv-SE')} kr.` : ''} Se bilder och boka visning på BaraHem.`;
    const image = property.images?.[0] || 'https://www.barahem.se/og-image.png';
    const propertyUrl = `https://www.barahem.se/fastighet/${propertyId}`;
    
    // Generera HTML med rätt OG-taggar
    const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${propertyUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="BaraHem">
  <meta property="og:locale" content="sv_SE">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${propertyUrl}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  
  <link rel="canonical" href="${propertyUrl}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <img src="${escapeHtml(image)}" alt="${escapeHtml(property.address)}">
  <a href="${propertyUrl}">Se fastigheten på BaraHem</a>
</body>
</html>`;
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache i 1 timme
      },
    });
    
  } catch (error) {
    console.error('Error in OG middleware:', error);
    return fetch(request);
  }
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
