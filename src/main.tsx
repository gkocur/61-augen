// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/grenze-gotisch';
import '@fontsource/grenze/400.css';
import '@fontsource/grenze/400-italic.css';
import '@fontsource/grenze/600.css';
import './styles.css';
import { App } from './ui/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
