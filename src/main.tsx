import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { retryPending } from './lib/photos'
import { startSync } from './lib/sync'
import { applyTheme, getTheme } from './lib/theme'
import './styles.css'

applyTheme(getTheme())
startSync()
void retryPending()
setInterval(() => void retryPending(), 20_000)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
}
