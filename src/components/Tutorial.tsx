import { useEffect, useState } from 'react'
import type { Slide } from '../lib/tutorials'

/** Diaporama d'aide en fenêtre : points, précédent / suivant, passer. */
export default function Tutorial({ title, intro, slides, last = 'Compris !', onClose, onDisable }: {
  title: string; intro?: string; slides: Slide[]; last?: string; onClose: () => void; onDisable?: () => void
}) {
  const [i, setI] = useState(0)
  const s = slides[i]
  const end = i === slides.length - 1

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI((n) => Math.min(slides.length - 1, n + 1))
      if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1))
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose, slides.length])

  return (
    <div className="overlay" role="dialog" aria-label={title} aria-modal="true">
      <div className="sheet tuto stack" onClick={(e) => e.stopPropagation()}>
        <div className="row between">
          <span className="sub">{title}{slides.length > 1 && ` · ${i + 1}/${slides.length}`}</span>
          <button className="link" onClick={onClose}>Passer</button>
        </div>
        <div className="tuto-body">
          <div className="tuto-icon" aria-hidden>{s.icon}</div>
          <h2 className="tuto-title">{s.title}</h2>
          <p className="tuto-text">{s.text}</p>
          {i === 0 && intro && slides.length > 1 && <p className="sub center">{intro}</p>}
        </div>
        {slides.length > 1 && (
          <div className="dots" role="tablist" aria-label="Étapes">
            {slides.map((_, k) => <button key={k} className={'dot' + (k === i ? ' on' : '')} onClick={() => setI(k)} aria-label={`Étape ${k + 1}`} aria-selected={k === i} role="tab" />)}
          </div>
        )}
        <div className="row">
          {i > 0 && <button className="btn" onClick={() => setI(i - 1)}>Retour</button>}
          <button className="btn primary grow" onClick={() => (end ? onClose() : setI(i + 1))}>{end ? last : 'Suivant'}</button>
        </div>
        {onDisable && <button className="link center" onClick={onDisable}>Ne plus afficher les guides des applications</button>}
      </div>
    </div>
  )
}
