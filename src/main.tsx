import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/fredoka'
import '@fontsource-variable/outfit'
import '@fontsource/press-start-2p'
import './index.css'
import App from './App.tsx'

// Register the service worker in production so the game is installable
// (Add to Home Screen) and keeps working offline. Offline support is a
// progressive enhancement, so a failed registration is silently ignored.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => undefined);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
