import type { Member } from '../lib/types'

export default function Avatar({ m, size = 24, title }: { m: Member; size?: number; title?: string }) {
  return (
    <span
      className="dot-badge"
      style={{ background: m.color, width: size, height: size, fontSize: size * (m.emoji ? 0.58 : 0.46) }}
      title={title ?? m.name}
    >
      {m.emoji || m.name.trim()[0]?.toUpperCase() || '?'}
    </span>
  )
}
