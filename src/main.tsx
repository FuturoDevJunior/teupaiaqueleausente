import './index.css';

import React from 'react';

import { createRoot } from 'react-dom/client';

import App from './App.tsx';

// PWA Service Worker Registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Performance monitoring for first render
const startTime = performance.now();
window.addEventListener('load', () => {
  const loadTime = performance.now() - startTime;
  console.log(`Page fully loaded in ${Math.round(loadTime)}ms`);
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
