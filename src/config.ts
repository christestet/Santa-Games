interface AppConfig {
  apiUrl: string;
  isDev: boolean;
  isProd: boolean;
}

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return import.meta.env.DEV ? 'http://localhost:2412' : window.location.origin;
};

export const config: AppConfig = {
  apiUrl: `${getApiBaseUrl()}/api/scores`,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
