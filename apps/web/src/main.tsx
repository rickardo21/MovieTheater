import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './routes'
import { AuthProvider } from './store/AuthContext'
import { ClientProvider } from './store/ClientContext'
import { NavBarProvider } from './store/NavBarContext'
import { PopupProvider } from './store/PopupContext'
import { PlayerProvider } from './store/PlayerContext'
import { GlobalPopup } from './components/GlobalPopup'
import { GlobalVideoPlayer } from './components/GlobalVideoPlayer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ClientProvider>
        <NavBarProvider>
          <PlayerProvider>
            <PopupProvider>
              <RouterProvider router={router} />
              <GlobalPopup />
              <GlobalVideoPlayer />
            </PopupProvider>
          </PlayerProvider>
        </NavBarProvider>
      </ClientProvider>
    </AuthProvider>
  </StrictMode>,
)
