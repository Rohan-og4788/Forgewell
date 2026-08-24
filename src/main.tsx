import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1117',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e2e8f0',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
);
