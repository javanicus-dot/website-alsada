/// <reference path="../.astro/types.d.ts" />

// Type declarations for external libraries and global objects
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    turnstile?: {
      reset: () => void;
    };
  }
}

export {};