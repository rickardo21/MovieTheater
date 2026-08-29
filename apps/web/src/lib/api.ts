import { createApiClient } from '@movietheater/shared';

// Leggiamo il token da .env. 
// Fallback vuoto per evitare crash prima che l'utente inserisca l'API key
const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN || '';

export const api = createApiClient(token);
