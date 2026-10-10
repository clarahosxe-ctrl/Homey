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

art.cadeaux = (
  <>
    <rect x="112" y="40" width="64" height="64" rx="5" fill={G} />
    <rect x="138" y="40" width="12" height="64" fill={Y} />
    <rect x="112" y="64" width="64" height="10" fill={Y} />
    <rect x="28" y="62" width="86" height="64" rx="5" fill={B} />
    <rect x="63" y="62" width="14" height="64" fill={T} />
    <rect x="28" y="88" width="86" height="12" fill={T} />
    <path d="M70 62C46 34 26 52 56 62zM70 62c24-28 44-10 14 0z" fill={T} stroke="#a8452b" strokeWidth="3" strokeLinejoin="round" />
    <rect x="60" y="116" width="120" height="34" rx="6" fill={W} />
    <rect x="112" y="116" width="14" height="34" fill={G2} />
  </>
)

art.repas = (
  <>
    <rect x="150" y="16" width="8" height="80" rx="3" fill={G} />
    <rect x="22" y="22" width="6" height="36" rx="2" fill={G2} /><rect x="34" y="22" width="6" height="36" rx="2" fill={G2} /><rect x="46" y="22" width="6" height="36" rx="2" fill={G2} />
    <circle cx="100" cy="92" r="58" fill={G} />
    <circle cx="100" cy="92" r="46" fill={W} />
    <circle cx="82" cy="80" r="16" fill={T} /><circle cx="116" cy="76" r="12" fill="#6b9a52" /><circle cx="108" cy="108" r="14" fill={Y} />
    <circle cx="80" cy="108" r="7" fill="#6b9a52" />
  </>
)

art.animaux = (
  <>
    <ellipse cx="100" cy="104" rx="40" ry="32" fill={G} />
    <ellipse cx="52" cy="66" rx="15" ry="19" fill={G} transform="rotate(-18 52 66)" />
    <ellipse cx="86" cy="42" rx="15" ry="19" fill={G} />
    <ellipse cx="124" cy="42" rx="15" ry="19" fill={G} />
    <ellipse cx="160" cy="66" rx="15" ry="19" fill={G} transform="rotate(18 160 66)" />
    <path d="M178 118l16-10a9 9 0 1 1 6 12 9 9 0 1 1-4 12l-18-6z" fill={B} />
    <ellipse cx="100" cy="108" rx="17" ry="12" fill={T} />
  </>
)
art.vehicules = (
  <>
    <path d="M44 74l22-34q4-6 12-6h52q8 0 13 6l24 34z" fill={W} stroke={G} strokeWidth="5" strokeLinejoin="round" />
    <path d="M72 70l14-26h20v26zM116 70V44h18l16 26z" fill={BL} />
    <rect x="16" y="70" width="168" height="52" rx="14" fill={T} />
    <rect x="158" y="82" width="20" height="12" rx="4" fill={Y} />
    <circle cx="54" cy="124" r="20" fill={G} /><circle cx="54" cy="124" r="8" fill={B} />
    <circle cx="146" cy="124" r="20" fill={G} /><circle cx="146" cy="124" r="8" fill={B} />
  </>
)
art.budget = (
  <>
    <rect x="120" y="42" width="22" height="94" rx="3" fill={G} />
    <rect x="148" y="20" width="22" height="116" rx="3" fill={G2} />
    <rect x="92" y="78" width="22" height="58" rx="3" fill={T} />
    <rect x="22" y="40" width="64" height="96" rx="8" fill={G} transform="rotate(-8 54 88)" />
    <rect x="30" y="48" width="48" height="20" rx="3" fill={B} transform="rotate(-8 54 88)" />
    <g fill={W} transform="rotate(-8 54 88)"><rect x="32" y="78" width="12" height="10" rx="2" /><rect x="50" y="78" width="12" height="10" rx="2" /><rect x="68" y="78" width="12" height="10" rx="2" /><rect x="32" y="96" width="12" height="10" rx="2" /><rect x="50" y="96" width="12" height="10" rx="2" /><rect x="68" y="96" width="12" height="10" rx="2" /></g>
    <ellipse cx="110" cy="136" rx="30" ry="9" fill={Y} /><ellipse cx="110" cy="130" rx="30" ry="9" fill="#f0cb55" />
  </>
)
art.voyages = (
  <>
    <path d="M70 52v-12q0-8 8-8h28q8 0 8 8v12" fill="none" stroke={G} strokeWidth="8" strokeLinecap="round" />
    <rect x="40" y="52" width="100" height="84" rx="12" fill={T} />
    <rect x="62" y="52" width="10" height="84" fill="#a8452b" /><rect x="108" y="52" width="10" height="84" fill="#a8452b" />
    <rect x="40" y="86" width="100" height="8" fill="#a8452b" opacity=".5" />
    <path d="M132 40l56-22-8 12 18 4-52 22-10 20-8-4 4-22-28-10 4-8z" fill={W} stroke={G} strokeWidth="3" strokeLinejoin="round" transform="translate(-4 4) scale(.8)" />
  </>
)

export default function Art({ id }: { id: string }) {
  return (
    <svg className="art" viewBox="0 0 200 144" aria-hidden>
      {art[id]}
    </svg>
  )
}
