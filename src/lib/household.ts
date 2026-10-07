import { useStored, uid } from './storage'
import type { Member } from './types'

export const PALETTE = ['#d9694a', '#5c8a6f', '#4f7cac', '#c9922e', '#9a6fb0', '#c4607e']

const DEFAULT_MEMBERS: Member[] = [
  { id: 'm1', name: 'Moi', color: PALETTE[0] },
  { id: 'm2', name: 'Partenaire', color: PALETTE[1] },
]

export function useMembers() {
  const [members, setMembers] = useStored<Member[]>('members', DEFAULT_MEMBERS)
  const [currentId, setCurrentId] = useStored<string>('current-member', 'm1')
  const current = members.find((m) => m.id === currentId) ?? members[0]

  const add = (name: string) =>
    setMembers((ms) => [...ms, { id: uid(), name, color: PALETTE[ms.length % PALETTE.length] }])
  const rename = (id: string, name: string) =>
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, name } : m)))
  const remove = (id: string) => setMembers((ms) => (ms.length > 1 ? ms.filter((m) => m.id !== id) : ms))

  return { members, current, setCurrentId, add, rename, remove }
}

export type Household = ReturnType<typeof useMembers>
