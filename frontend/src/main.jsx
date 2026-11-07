import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/globals.css';

// Global uncaught error listener to ensure errors are visibly logged and never swallowed silently
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('[FLUX Global Error Caught]:', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[FLUX Unhandled Promise Rejection]:', event.reason);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary fallbackTitle="FLUX Arena Core Interface Error">
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
