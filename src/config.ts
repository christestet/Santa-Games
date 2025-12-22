const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

export const config = {
  apiUrl: `${API_BASE_URL}/api/scores`,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
