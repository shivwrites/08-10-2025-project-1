import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeAPIKey } from './lib/apiKey';

// Initialize API key from environment variable on app start
initializeAPIKey();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
