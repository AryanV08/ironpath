import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import logoIcon from './components/layout/logo.png';
import './index.css';

const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
if (favicon) {
  favicon.type = 'image/png';
  favicon.href = logoIcon;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
