import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// NUCLEAR OPTION FOR CACHING ISSUES:
// Unregister any existing service workers to force the browser to load new files
// We wrap this in a 'load' listener and try-catch to prevent "invalid state" errors
// from crashing the application startup.
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.getRegistrations()
        .then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister().catch(err => console.warn('SW Unregister failed:', err));
          }
        })
        .catch(err => {
          console.warn('Error getting SW registrations:', err);
        });
    } catch (e) {
      console.warn('Service Worker API not available or threw error:', e);
    }
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);