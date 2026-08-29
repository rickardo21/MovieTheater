import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './routes'
import { ClientProvider } from './store/ClientContext'
import { NavBarProvider } from './store/NavBarContext'
import { PopupProvider } from './store/PopupContext'
import { GlobalPopup } from './components/GlobalPopup'
import { GlobalVideoPlayer } from './components/GlobalVideoPlayer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClientProvider>
      <NavBarProvider>
        <PopupProvider>
          <RouterProvider router={router} />
          <GlobalPopup />
          <GlobalVideoPlayer />
        </PopupProvider>
      </NavBarProvider>
    </ClientProvider>
  </StrictMode>,
)
