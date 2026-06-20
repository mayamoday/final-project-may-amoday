import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { UIPreferencesProvider } from './contexts/UIPreferencesContext'
import { ProfileProvider } from './contexts/ProfileContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIPreferencesProvider>
      <AuthProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </AuthProvider>
    </UIPreferencesProvider>
  </StrictMode>,
)
