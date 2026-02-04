/**
 * Rate Limiting utility för att förebygga överbelastning
 * Begränsar antal anrop per tidsenhet
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitState {
  requests: number[];
}

const rateLimitStates = new Map<string, RateLimitState>();

/**
 * Kontrollera om en åtgärd är tillåten baserat på rate limit
 */
export const checkRateLimit = (
  key: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): { allowed: boolean; retryAfter?: number } => {
  const now = Date.now();
  
  // Hämta eller skapa state
  let state = rateLimitStates.get(key);
  if (!state) {
    state = { requests: [] };
    rateLimitStates.set(key, state);
  }

  // Rensa gamla requests utanför fönstret
  state.requests = state.requests.filter(
    (timestamp) => now - timestamp < config.windowMs
  );

  // Kontrollera om limit är nådd
  if (state.requests.length >= config.maxRequests) {
    const oldestRequest = state.requests[0];
    const retryAfter = Math.ceil((oldestRequest + config.windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Lägg till ny request
  state.requests.push(now);
  return { allowed: true };
};

/**
 * Rate limit presets för olika operationer
 */
export const RATE_LIMITS = {
  // Uppladdning av bilder: max 20 per minut
  IMAGE_UPLOAD: { maxRequests: 20, windowMs: 60000 },
  
  // Skapa fastighet: max 5 per minut
  CREATE_PROPERTY: { maxRequests: 5, windowMs: 60000 },
  
  // Skicka meddelanden: max 10 per minut
  SEND_MESSAGE: { maxRequests: 10, windowMs: 60000 },
  
  // API-anrop generellt: max 100 per minut
  API_CALL: { maxRequests: 100, windowMs: 60000 },
  
  // Sökningar: max 30 per minut
  SEARCH: { maxRequests: 30, windowMs: 60000 },
};

/**
 * Dekorator för att rate-limita funktioner
 */
export const withRateLimit = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  key: string,
  config: RateLimitConfig
): T => {
  return (async (...args: Parameters<T>) => {
    const { allowed, retryAfter } = checkRateLimit(key, config);
    
    if (!allowed) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
      );
    }
    
    return fn(...args);
  }) as T;
};

/**
 * Rensa rate limit state (för tester)
 */
export const clearRateLimitState = (key?: string): void => {
  if (key) {
    rateLimitStates.delete(key);
  } else {
    rateLimitStates.clear();
  }
};
