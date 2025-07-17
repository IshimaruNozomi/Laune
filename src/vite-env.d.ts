/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Google Maps API の型定義
declare global {
  interface Window {
    google: typeof google;
  }
}

export {};
