import { useEffect, useState } from 'react'
import { addPhoto, loadPhoto, removePhoto } from '../lib/photos'

/** Source d'une photo (aperçu ou grande taille) ; null tant qu'elle n'est pas disponible. */
export function usePhoto(id?: string, full = false) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let off = false
    setSrc(null)
    if (id) loadPhoto(id).then((r) => !off && setSrc(r ? (full ? r.full : r.thumb) : null))
    return () => { off = true }
  }, [id, full])
  return src
}

export function PhotoImg({ id, full, className, alt = '' }: { id?: string; full?: boolean; className?: string; alt?: string }) {
  const src = usePhoto(id, full)
  return src ? <img src={src} alt={alt} className={className} /> : null
}

/** Version non cliquable (listes) : photo ou repli. */
export function PhotoMini({ id, fallback, size = 48 }: { id?: string; fallback: React.ReactNode; size?: number }) {
  const src = usePhoto(id)
  return <span className="pmini" style={{ width: size, height: size, fontSize: size * 0.55 }}>{src ? <img src={src} alt="" /> : fallback}</span>
}

/** Pastille cliquable : affiche la photo (ou l'emoji) ; un clic ouvre la galerie / l'appareil photo. */
export function PhotoThumb({ id, fallback, onChange, onFile, size = 56, round, label = 'Changer la photo', keepOld }: {
  id?: string; fallback: React.ReactNode; onChange: (id: string | undefined) => void; onFile?: (f: File) => void; size?: number; round?: boolean; label?: string
  /** ne pas supprimer l'ancienne photo tout de suite (formulaires d'édition qu'on peut annuler) */
  keepOld?: boolean
}) {
  const src = usePhoto(id)
  const [busy, setBusy] = useState(false)
  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    onFile?.(f)
    setBusy(true)
    try { const nid = await addPhoto(f); if (id && !keepOld) void removePhoto(id); onChange(nid) } catch { alert('Cette image ne peut pas être lue.') }
    setBusy(false)
  }
  return (
    <div className={'pthumb' + (round ? ' round' : '')} style={{ width: size, height: size, fontSize: size * 0.55 }}>
      <label className="pthumb-btn" title={label} aria-label={label}>
        {src ? <img src={src} alt="" /> : <span className="pthumb-fallback">{fallback}</span>}
        <span className="pthumb-cam">{busy ? '…' : '📷'}</span>
        <input type="file" accept="image/*" onChange={pick} hidden />
      </label>
      {id && <button type="button" className="pthumb-x" onClick={() => confirm('Retirer la photo ?') && ((!keepOld && void removePhoto(id)), onChange(undefined))} aria-label="Retirer la photo">×</button>}
    </div>
  )
}

/** Album : grille d'aperçus, ajout multiple, agrandissement au toucher. */
export function Album({ ids, onChange, title = '📸 Photos' }: { ids: string[]; onChange: (ids: string[]) => void; title?: string }) {
  const [open, setOpen] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const add = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])]
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    const added: string[] = []
    for (const f of files) { try { added.push(await addPhoto(f)) } catch { /* image illisible : on ignore */ } }
    if (added.length) onChange([...ids, ...added])
    setBusy(false)
  }
  const big = usePhoto(open ?? undefined, true)
  return (
    <section className="panel stack">
      <div className="row between"><h3 className="panel-title">{title} {ids.length > 0 && <span className="sub">({ids.length})</span>}</h3>
        <label className="btn small">{busy ? 'Ajout…' : '+ Ajouter'}<input type="file" accept="image/*" multiple onChange={add} hidden /></label>
      </div>
      {ids.length === 0 && <p className="sub">Ajoutez des photos depuis votre galerie ou votre appareil photo.</p>}
      <div className="album">
        {ids.map((id) => <AlbumCell key={id} id={id} onOpen={() => setOpen(id)} />)}
      </div>
      {open && (
        <div className="overlay lightbox" onClick={() => setOpen(null)} role="dialog" aria-label="Photo">
          {big ? <img src={big} alt="" /> : <p style={{ color: '#fff' }}>Chargement…</p>}
          <div className="row" onClick={(e) => e.stopPropagation()}>
            <button className="btn small" onClick={() => { if (confirm('Supprimer cette photo ?')) { void removePhoto(open); onChange(ids.filter((x) => x !== open)); setOpen(null) } }}>🗑️ Supprimer</button>
            <button className="btn primary small" onClick={() => setOpen(null)}>Fermer</button>
          </div>
        </div>
      )}
    </section>
  )
}
function AlbumCell({ id, onOpen }: { id: string; onOpen: () => void }) {
  const src = usePhoto(id)
  return <button type="button" className="album-cell" onClick={onOpen} aria-label="Agrandir la photo">{src ? <img src={src} alt="" /> : <span className="sub">…</span>}</button>
}
