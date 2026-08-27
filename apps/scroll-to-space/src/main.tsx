import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EazoProvider } from '@eazo/sdk/react';
import './styles.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<StrictMode><EazoProvider><App/></EazoProvider></StrictMode>);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => void navigator.serviceWorker.register('./sw.js'));
}
