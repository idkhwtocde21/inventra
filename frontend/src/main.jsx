import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          gap={10}
          visibleToasts={5}
          toastOptions={{
            style: {
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#1e293b',
              boxShadow: '0 10px 30px -12px rgb(15 23 42 / 0.2)',
              fontSize: '14px',
              padding: '14px 16px',
            },
            classNames: {
              title: '!text-sm !font-semibold !text-slate-800',
              description: '!text-xs !text-slate-500',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)