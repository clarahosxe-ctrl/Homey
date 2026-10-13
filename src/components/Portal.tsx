import { createPortal } from 'react-dom'

/**
 * Affiche ses enfants directement dans <body>. Indispensable pour les fenêtres : un parent avec
 * `backdrop-filter` / `filter` (thèmes verre) devient le repère de `position: fixed` et les emprisonnerait.
 */
export default function Portal({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body)
}
