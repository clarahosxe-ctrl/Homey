/**
 * Photos : réduites sur l'appareil (aperçu 240 px + version 1280 px), gardées dans IndexedDB
 * (localStorage est trop petit), puis envoyées au foyer comme document "photo-<id>".
 * Chez les autres membres, une photo n'est téléchargée que lorsqu'elle est affichée.
 */
import { getHousehold, rpc, syncAvailable } from './sync'
import { uid } from './storage'

interface Rec { thumb: string; full: string; synced: boolean }

const DB_NAME = 'homey-photos'
const STORE = 'photos'
const cache = new Map<string, Rec>()
const missUntil = new Map<string, number>()
let dbp: Promise<IDBDatabase> | null = null

function db() {
  dbp ??= new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open(DB_NAME, 1)
    r.onupgradeneeded = () => r.result.createObjectStore(STORE)
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
  return dbp
}
const tx = async <T,>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) => {
  const d = await db()
  return new Promise<T>((resolve, reject) => {
    const req = fn(d.transaction(STORE, mode).objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
const idbGet = (id: string) => tx<Rec | undefined>('readonly', (s) => s.get(id))
const idbPut = (id: string, rec: Rec) => tx('readwrite', (s) => s.put(rec, id))
const idbDel = (id: string) => tx('readwrite', (s) => s.delete(id))

async function load(file: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('image illisible'))
      i.src = url
    })
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
}

/** Redimensionne : côté max `max`, ou carré rogné si `square`. */
function render(img: HTMLImageElement, max: number, q: number, square = false) {
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')!
  if (square) {
    const side = Math.min(img.naturalWidth, img.naturalHeight)
    c.width = c.height = Math.min(max, side)
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, c.width, c.height)
  } else {
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s)
    ctx.drawImage(img, 0, 0, c.width, c.height)
  }
  return c.toDataURL('image/jpeg', q)
}

async function upload(id: string, rec: Rec) {
  if (!syncAvailable) return
  const hh = getHousehold()
  if (!hh) return
  try {
    await rpc('put_doc', { p_code: hh.code, p_key: `photo-${id}`, p_value: { t: rec.thumb, f: rec.full } })
    const done = { ...rec, synced: true }
    cache.set(id, done); await idbPut(id, done)
  } catch { /* on réessaiera */ }
}

export async function addPhoto(file: Blob): Promise<string> {
  const img = await load(file)
  const rec: Rec = { thumb: render(img, 240, 0.72, true), full: render(img, 1280, 0.72), synced: false }
  const id = uid() + uid()
  cache.set(id, rec); await idbPut(id, rec)
  void upload(id, rec)
  return id
}

export async function loadPhoto(id: string): Promise<Rec | null> {
  const hit = cache.get(id)
  if (hit) return hit
  try {
    const local = await idbGet(id)
    if (local) { cache.set(id, local); return local }
  } catch { /* IndexedDB indisponible */ }
  if ((missUntil.get(id) ?? 0) > Date.now()) return null
  const hh = getHousehold()
  if (!syncAvailable || !hh) return null
  try {
    const v = await rpc<{ t: string; f: string } | null>('get_doc', { p_code: hh.code, p_key: `photo-${id}` })
    if (v?.t) {
      const rec: Rec = { thumb: v.t, full: v.f, synced: true }
      cache.set(id, rec); await idbPut(id, rec)
      return rec
    }
  } catch { /* hors ligne */ }
  missUntil.set(id, Date.now() + 20_000)
  return null
}

export async function removePhoto(id: string) {
  cache.delete(id)
  try { await idbDel(id) } catch { /* ignore */ }
  const hh = getHousehold()
  if (syncAvailable && hh) rpc('put_doc', { p_code: hh.code, p_key: `photo-${id}`, p_value: null }).catch(() => {})
}

/** Envoie les photos prises hors ligne ou avant d'avoir rejoint un foyer. */
export async function retryPending() {
  if (!syncAvailable || !getHousehold()) return
  try {
    const d = await db()
    const pending: [string, Rec][] = await new Promise((resolve, reject) => {
      const out: [string, Rec][] = []
      const req = d.transaction(STORE, 'readonly').objectStore(STORE).openCursor()
      req.onsuccess = () => {
        const c = req.result
        if (c) { if (!(c.value as Rec).synced) out.push([String(c.key), c.value as Rec]); c.continue() } else resolve(out)
      }
      req.onerror = () => reject(req.error)
    })
    for (const [id, rec] of pending) await upload(id, rec)
  } catch { /* ignore */ }
}
