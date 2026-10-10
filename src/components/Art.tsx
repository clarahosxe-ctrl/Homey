/** Illustrations "papier découpé" (formes simples, ombres douces) pour les tuiles. */
const G = '#1f4a42', G2 = '#2f6a5c', T = '#c4593a', B = '#d9c4a0', W = '#f8f4ea', Y = '#e0b73a', BL = '#6f93ad'

const art: Record<string, React.ReactNode> = {
  courses: (
    <>
      <rect x="62" y="14" width="40" height="52" rx="4" fill={G} />
      <rect x="106" y="28" width="34" height="38" rx="4" fill={B} />
      <circle cx="52" cy="54" r="14" fill={T} />
      <path d="M22 62h156l-16 58H42z" fill={W} stroke={G} strokeWidth="5" strokeLinejoin="round" />
      <path d="M70 66l6 52M100 66v52M130 66l-6 52M30 90h140" stroke={G} strokeWidth="3" />
      <circle cx="58" cy="132" r="7" fill={G} /><circle cx="150" cy="132" r="7" fill={G} />
    </>
  ),
  poubelles: (
    <>
      <rect x="116" y="38" width="52" height="94" rx="5" fill={BL} />
      <rect x="110" y="30" width="64" height="14" rx="4" fill="#5a7e96" />
      <rect x="62" y="52" width="56" height="80" rx="5" fill={Y} />
      <rect x="56" y="44" width="68" height="14" rx="4" fill="#c99f25" />
      <rect x="80" y="82" width="22" height="14" rx="2" fill={T} />
      <rect x="14" y="62" width="58" height="70" rx="5" fill={G} />
      <rect x="8" y="54" width="70" height="14" rx="4" fill={G2} />
    </>
  ),
  travail: (
    <>
      <path d="M72 44v-12q0-8 8-8h40q8 0 8 8v12" fill="none" stroke={G} strokeWidth="9" strokeLinecap="round" />
      <rect x="22" y="44" width="156" height="92" rx="10" fill={B} />
      <rect x="22" y="44" width="156" height="36" rx="10" fill="#c7ad82" />
      <rect x="88" y="70" width="24" height="22" rx="4" fill={T} />
      <rect x="40" y="104" width="50" height="8" rx="3" fill={W} opacity=".7" />
    </>
  ),
  taches: (
    <>
      <rect x="96" y="12" width="28" height="64" rx="5" fill={G} transform="rotate(-18 110 50)" />
      <rect x="98" y="10" width="26" height="16" rx="2" fill={B} transform="rotate(-18 110 50)" />
      <path d="M28 78h108l-12 56H40z" fill={W} stroke={G} strokeWidth="5" strokeLinejoin="round" />
      <rect x="36" y="84" width="92" height="12" rx="3" fill={G} />
      <rect x="146" y="58" width="26" height="76" rx="6" fill={G2} />
      <rect x="150" y="44" width="18" height="18" rx="3" fill={W} />
      <rect x="146" y="92" width="26" height="22" fill={T} />
    </>
  ),
  fidelite: (
    <>
      <rect x="22" y="40" width="96" height="62" rx="8" fill={T} transform="rotate(-18 70 70)" />
      <rect x="50" y="26" width="96" height="62" rx="8" fill={B} transform="rotate(-6 98 57)" />
      <rect x="74" y="24" width="96" height="62" rx="8" fill={G2} transform="rotate(8 122 55)" />
      <rect x="92" y="30" width="96" height="62" rx="8" fill={Y} transform="rotate(18 140 61)" />
      <path d="M14 96h172v38q0 6-6 6H20q-6 0-6-6z" fill={G} />
    </>
  ),
}

art.anniversaires = (
  <>
    <rect x="124" y="36" width="8" height="30" rx="2" fill={G} /><rect x="96" y="30" width="8" height="30" rx="2" fill={T} /><rect x="68" y="36" width="8" height="30" rx="2" fill={G} />
    <ellipse cx="128" cy="30" rx="5" ry="8" fill={Y} /><ellipse cx="100" cy="24" rx="5" ry="8" fill={Y} /><ellipse cx="72" cy="30" rx="5" ry="8" fill={Y} />
    <rect x="50" y="64" width="100" height="32" rx="8" fill={W} />
    <path d="M50 82q10 10 20 0t20 0 20 0 20 0 20 0v6H50z" fill={W} stroke={B} strokeWidth="3" />
    <rect x="30" y="96" width="140" height="30" rx="8" fill={B} />
    <rect x="12" y="126" width="176" height="30" rx="8" fill={G} />
  </>
)

export default function Art({ id }: { id: string }) {
  return (
    <svg className="art" viewBox="0 0 200 144" aria-hidden>
      {art[id]}
    </svg>
  )
}
