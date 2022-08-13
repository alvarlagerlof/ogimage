/// <reference types="vite/client" />

import { Metadata } from "metascraper";

declare global {
  interface Window {
    __takeScreenshot__(): Promise<void>;
    __done__(error?: string): Promise<void>;
    __meta__(): Metadata;
    meta: Metadata;
  }
}

// Default implementation of functions normally injected by the browser.
//
// This is especially useful when running the `debug` command.
if (!window.__takeScreenshot__) {
  window.__takeScreenshot__ = () => {
    console.log(`Simulating screenshot`);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  window.__done__ = async (errorMessage) => {
    if (errorMessage) {
      console.error(`Done with error: ${errorMessage}`);
    } else {
      console.log(`Done without errors.`);
    }
  };
}

// Useful polyfills.
// const w = window as any;
// w.global ||= window;
// w.process ||= {
//   env: {},
// };

// Catch runtime errors and stop immediately.
window.onerror = (event, source, lineno, colno, error) => {
  void window.__done__(
    (error && (error.stack || error.message)) || "Unknown error"
  );
};

// Catch Vite errors and also stop immediately.
import.meta.hot?.on("vite:error", (payload) => {
  void window.__done__(payload.err.message);
});
