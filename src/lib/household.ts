import { useEffect } from 'react'
import { uid, useStored } from './storage'
import type { Member } from './types'

export const PALETTE = ['#d9694a', '#2f7d68', '#4f7cac', '#c9922e', '#9a6fb0', '#c4607e', '#6a7480', '#3f8f86']
export const EMOJIS = ['🙂', '😎', '🤓', '🥳', '🦊', '🐱', '🐶', '🐼', '🦄', '🌻', '🍓', '🚀', '🎸', '⚽', '🌈', '🍀']

const PLACEHOLDER: Member = { id: '', name: '…', color: PALETTE[0] }

/** Ancien identifiant "membre courant" (avant les profils par appareil), pour ne pas perdre l'historique. */
function legacyId() {
  try {
    return JSON.parse(localStorage.getItem('homey:current-member') ?? 'null') as string | null
  } catch {
    return null
  }
}

/**
 * Chaque appareil a SON profil (non synchronisé). Il s'inscrit tout seul dans la liste
 * partagée des membres du foyer et s'y remet si une écriture concurrente l'efface.
 */
export function useMembers() {
  const [members, setMembers] = useStored<Member[]>('members', [])
  const [profile, setProfile] = useStored<Member | null>('profile', null)

  useEffect(() => {
    if (!profile) return
    const me = members.find((m) => m.id === profile.id)
    if (me && me.name === profile.name && me.color === profile.color && me.emoji === profile.emoji) return
    setMembers((ms) => (ms.some((m) => m.id === profile.id) ? ms.map((m) => (m.id === profile.id ? profile : m)) : [...ms, profile]))
  }, [members, profile, setMembers])

  const legacy = members.find((m) => m.id === legacyId())

  const saveProfile = (p: Omit<Member, 'id'>) =>
    setProfile((old) => ({ ...p, id: old?.id ?? legacy?.id ?? uid() }))
  /** Reprendre un profil déjà présent dans le foyer (évite les doublons quand on change d'appareil). */
  const claim = (m: Member) => {
    if (profile && profile.id !== m.id) setMembers((ms) => ms.filter((x) => x.id !== profile.id))
    setProfile(m)
  }
  const removeMember = (id: string) => setMembers((ms) => (id === profile?.id ? ms : ms.filter((m) => m.id !== id)))

  return {
    members: members.length ? members : profile ? [profile] : [],
    current: profile ?? PLACEHOLDER,
    needsProfile: !profile,
    legacy,
    saveProfile,
    claim,
    removeMember,
  }
}

export type Household = ReturnType<typeof useMembers>
