import { THEMES, setTheme, useTheme } from '../lib/theme'

/** Choix du thème de couleur (propre à cet appareil). */
export default function ThemePicker() {
  const current = useTheme()
  return (
    <div className="stack">
      <strong>🎨 Thème de l’application</strong>
      <div className="themes" role="radiogroup" aria-label="Thème">
        {THEMES.map((t) => (
          <button
            type="button" key={t.id} role="radio" aria-checked={current === t.id}
            className={'theme' + (current === t.id ? ' on' : '')}
            onClick={() => setTheme(t.id)} title={t.hint}
          >
            <span className="theme-prev" style={{ background: t.preview[0], borderColor: t.preview[3] + '33' }}>
              {t.id === 'auto'
                ? <span className="theme-split" style={{ background: `linear-gradient(115deg, ${t.preview[0]} 50%, ${t.preview[1]} 50%)` }} />
                : <span className="theme-card" style={{ background: t.preview[1], borderColor: t.preview[3] + '22' }}><i style={{ background: t.preview[3] }} /><i style={{ background: t.preview[3], width: '55%', opacity: 0.5 }} /></span>}
              <span className="theme-dot" style={{ background: t.preview[2] }} />
            </span>
            <span className="theme-name">{t.label}</span>
          </button>
        ))}
      </div>
      <p className="sub">{THEMES.find((t) => t.id === current)?.hint}. Ce choix est propre à cet appareil.</p>
    </div>
  )
}
