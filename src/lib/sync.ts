/**
 * Synchronisation du foyer. Chaque "clé" (courses, poubelles…) est un document JSON
 * partagé via Supabase, protégé par le code du foyer. Sans configuration → mode local.
 * Résolution de conflit : dernier qui écrit gagne, par clé.
 */
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const PREFIX = 'homey:'
const HH = PREFIX + 'household'
const POLL_MS = 6000

export const syncAvailable = !!URL && !!ANON

/** Clés partagées entre les membres. (Le membre "courant" reste propre à chaque appareil.) */
export const SYNCED = ['members', 'shopping', 'bins', 'work', 'chores', 'loyalty', 'birthdays', 'gifts', 'city']

export interface Household { code: string; name: string }

export const getHousehold = (): Household | null => {
  try {
    return JSON.parse(localStorage.getItem(HH) ?? 'null')
  } catch {
    return null
  }
}

const dirty = new Set<string>()
const lastRemote: Record<string, string> = {}
const timers: Record<string, number> = {}
let poller: number | undefined
let status: 'off' | 'ok' | 'error' = 'off'
const listeners = new Set<() => void>()
export const onSyncChange = (fn: () => void) => (listeners.add(fn), () => void listeners.delete(fn))
export const getSyncStatus = () => status
const emit = (s?: typeof status) => {
  if (s) status = s
  listeners.forEach((f) => f())
}

async function rpc<T>(fn: string, args: object): Promise<T> {
  const r = await fetch(`${URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    // Ancienne clé "anon" = JWT (eyJ…) → aussi en Bearer ; nouvelle clé "sb_publishable_…" → apikey seul.
    headers: { apikey: ANON!, ...(ANON!.startsWith('eyJ') ? { Authorization: `Bearer ${ANON}` } : {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!r.ok) throw new Error(`${fn}: ${r.status}`)
  return r.status === 204 ? (undefined as T) : ((await r.json()) as T)
}

const notifyLocal = (key: string) => window.dispatchEvent(new CustomEvent('homey-store', { detail: PREFIX + key }))

/** Appelé par useStored à chaque modification faite par l'utilisateur. */
export function markDirty(key: string) {
  if (!SYNCED.includes(key)) return
  dirty.add(key)
}

export function scheduleFlush(key: string) {
  if (!dirty.has(key) || !getHousehold() || !syncAvailable) return
  window.clearTimeout(timers[key])
  timers[key] = window.setTimeout(() => void flush(key), 400)
}

async function flush(key: string) {
  const hh = getHousehold()
  const raw = localStorage.getItem(PREFIX + key)
  if (!hh || raw === null) return
  try {
    await rpc('put_doc', { p_code: hh.code, p_key: key, p_value: JSON.parse(raw) })
    lastRemote[key] = raw
    // si l'utilisateur a re-modifié entre-temps, la clé a été re-marquée par scheduleFlush
    if (localStorage.getItem(PREFIX + key) === raw) dirty.delete(key)
    emit('ok')
  } catch {
    emit('error') // on réessaiera au prochain tick
  }
}

async function pull() {
  const hh = getHousehold()
  if (!hh) return
  try {
    const docs = await rpc<{ key: string; value: unknown }[]>('get_docs', { p_code: hh.code })
    for (const d of docs) {
      if (!SYNCED.includes(d.key) || dirty.has(d.key)) continue
      const json = JSON.stringify(d.value)
      lastRemote[d.key] = json
      if (localStorage.getItem(PREFIX + d.key) !== json) {
        localStorage.setItem(PREFIX + d.key, json)
        notifyLocal(d.key)
      }
    }
    for (const k of dirty) void flush(k)
    emit('ok')
  } catch {
    emit('error')
  }
}

export function startSync() {
  window.clearInterval(poller)
  if (!syncAvailable || !getHousehold()) return emit('off')
  void pull()
  poller = window.setInterval(() => void pull(), POLL_MS)
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && void pull())
  window.addEventListener('online', () => void pull())
}

export async function createHousehold(name: string) {
  const code = await rpc<string>('create_household', { p_name: name })
  localStorage.setItem(HH, JSON.stringify({ code, name }))
  SYNCED.forEach((k) => localStorage.getItem(PREFIX + k) !== null && dirty.add(k)) // on publie l'existant
  SYNCED.forEach((k) => void flush(k))
  startSync()
  return code
}

export async function joinHousehold(code: string) {
  const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  const name = await rpc<string | null>('join_household', { p_code: clean })
  if (!name) throw new Error('Code inconnu')
  localStorage.setItem(HH, JSON.stringify({ code: clean, name }))
  dirty.clear() // le foyer rejoint fait foi
  await pull()
  startSync()
  return name
}

export function leaveHousehold() {
  localStorage.removeItem(HH)
  dirty.clear()
  window.clearInterval(poller)
  emit('off')
}

export const formatCode = (c: string) => c.replace(/(.{4})(?=.)/g, '$1-')
