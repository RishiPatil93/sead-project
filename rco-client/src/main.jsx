import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import App from './App';
import { SocketProvider } from './context/SocketContext';
import AuthInitializer from './components/AuthInitializer';
import './index.css';

// Suppress harmless Monaco "operation is manually canceled" unhandled rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason;
      const isMonacoCancel = !!(
        (reason && typeof reason === 'object' && (reason.name === 'Canceled' || reason.type === 'cancelation' || reason.type === 'canceled')) ||
        (reason && typeof reason === 'object' && typeof reason.msg === 'string' && reason.msg.toLowerCase().includes('operation is manually canceled')) ||
        (typeof reason === 'string' && reason.toLowerCase().includes('operation is manually canceled'))
      );
      if (isMonacoCancel) {
        event.preventDefault();
      }
    } catch (e) {
      // ignore inspection errors
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthInitializer />
        <SocketProvider>
          <App />
        </SocketProvider>
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#161b22',
              color: '#e6edf3',
              border: '1px solid #30363d',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#3fb950', secondary: '#161b22' },
            },
            error: {
              iconTheme: { primary: '#f78166', secondary: '#161b22' },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
