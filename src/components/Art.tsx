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

art.sante = (
  <>
    <path d="M70 44v-8q0-8 8-8h44q8 0 8 8v8" fill="none" stroke={G} strokeWidth="8" strokeLinecap="round" />
    <rect x="24" y="44" width="152" height="100" rx="14" fill={W} stroke={G} strokeWidth="5" />
    <rect x="82" y="62" width="36" height="64" rx="5" fill={T} /><rect x="68" y="76" width="64" height="36" rx="5" fill={T} />
    <rect x="34" y="54" width="22" height="8" rx="3" fill={B} /><rect x="144" y="54" width="22" height="8" rx="3" fill={B} />
  </>
)
art.maison = (
  <>
    <rect x="132" y="22" width="18" height="40" rx="2" fill={G} />
    <rect x="34" y="66" width="132" height="76" fill={W} stroke={G} strokeWidth="5" />
    <path d="M18 72L100 12l82 60z" fill={T} stroke="#a8452b" strokeWidth="4" strokeLinejoin="round" />
    <rect x="86" y="96" width="30" height="46" rx="4" fill={Y} />
    <rect x="46" y="86" width="28" height="26" rx="3" fill={BL} /><rect x="128" y="86" width="28" height="26" rx="3" fill={BL} />
    <circle cx="108" cy="120" r="2.5" fill={G} />
  </>
)
art.jardin = (
  <>
    <path d="M100 100c-30-6-44-30-34-56 26 6 40 26 34 56z" fill={G2} />
    <path d="M100 100c30-6 44-30 34-56-26 6-40 26-34 56z" fill={G} />
    <path d="M100 100c-6-30 4-52 20-66 14 22 4 48-20 66z" fill="#6b9a52" />
    <path d="M62 100h76l-9 42H71z" fill={T} />
    <rect x="56" y="94" width="88" height="14" rx="4" fill="#a8452b" />
    <path d="M22 126h40l-5 18H27z" fill={B} /><path d="M40 126c-12-4-18-18-10-30 12 4 16 16 10 30z" fill={G2} />
    <path d="M148 126h34l-5 18h-24z" fill={W} stroke={B} strokeWidth="3" /><path d="M165 126c10-4 14-16 8-26-10 4-14 14-8 26z" fill={G} />
  </>
)
art.abonnements = (
  <>
    <rect x="30" y="28" width="104" height="66" rx="9" fill={B} transform="rotate(-8 82 61)" />
    <rect x="54" y="44" width="104" height="66" rx="9" fill={G2} transform="rotate(6 106 77)" />
    <circle cx="112" cy="104" r="42" fill={W} stroke={G} strokeWidth="6" />
    <path d="M84 98a30 30 0 0 1 50-14" fill="none" stroke={T} strokeWidth="9" strokeLinecap="round" />
    <path d="M140 66l2 26-24-8z" fill={T} />
    <path d="M140 110a30 30 0 0 1-50 14" fill="none" stroke={G} strokeWidth="9" strokeLinecap="round" />
    <path d="M84 142l-2-26 24 8z" fill={G} />
  </>
)

art.bebe = (
  <>
    <rect x="30" y="52" width="56" height="86" rx="12" fill={W} stroke={G} strokeWidth="5" />
    <rect x="30" y="76" width="56" height="10" fill={BL} /><rect x="30" y="96" width="56" height="6" fill={BL} opacity=".6" /><rect x="30" y="110" width="56" height="6" fill={BL} opacity=".6" />
    <rect x="38" y="38" width="40" height="16" rx="5" fill={G} />
    <path d="M44 38q14-26 28 0z" fill={B} />
    <circle cx="136" cy="100" r="40" fill={Y} />
    <circle cx="160" cy="68" r="24" fill={Y} />
    <path d="M178 66l18 6-18 8z" fill={T} />
    <circle cx="164" cy="62" r="4" fill={G} />
    <path d="M110 112q26 22 54-8" fill="none" stroke="#c99f25" strokeWidth="5" strokeLinecap="round" />
  </>
)
art.enfants = (
  <>
    <path d="M70 40q0-22 30-22t30 22" fill="none" stroke={G} strokeWidth="9" strokeLinecap="round" />
    <rect x="46" y="38" width="108" height="100" rx="26" fill={T} />
    <rect x="62" y="88" width="76" height="40" rx="10" fill="#a8452b" />
    <rect x="86" y="98" width="28" height="8" rx="3" fill={Y} />
    <path d="M46 70q-22 10-22 40 0 14 12 14h10z" fill={G} /><path d="M154 70q22 10 22 40 0 14-12 14h-10z" fill={G} />
    <rect x="164" y="26" width="12" height="62" rx="3" fill={Y} transform="rotate(14 170 57)" />
    <path d="M160 88l12 4-8 16z" fill={B} transform="rotate(14 170 57)" />
  </>
)
art.documents = (
  <>
    <rect x="62" y="16" width="100" height="116" rx="5" fill={G} />
    <rect x="46" y="32" width="104" height="110" rx="5" fill={T} />
    <rect x="34" y="46" width="108" height="96" rx="5" fill={W} />
    <path d="M14 70h58l10 12h106v62H14z" fill={B} />
    <rect x="30" y="96" width="60" height="6" rx="3" fill="#c7ad82" /><rect x="30" y="110" width="40" height="6" rx="3" fill="#c7ad82" />
  </>
)
art.energie = (
  <>
    <circle cx="100" cy="68" r="48" fill={Y} />
    <circle cx="100" cy="68" r="48" fill="none" stroke="#c99f25" strokeWidth="5" />
    <path d="M108 34L80 74h18l-8 30 32-44h-20z" fill={W} />
    <path d="M76 108h48v12q0 8-8 8H84q-8 0-8-8z" fill={G} /><rect x="82" y="128" width="36" height="12" rx="5" fill={G2} />
    <path d="M30 40l12 8M170 40l-12 8M20 78h14M166 78h14" stroke="#c99f25" strokeWidth="5" strokeLinecap="round" />
  </>
)
art.envies = (
  <>
    <path d="M100 18l16 38 40 4-30 28 9 40-35-21-35 21 9-40-30-28 40-4z" fill={Y} stroke="#c99f25" strokeWidth="4" strokeLinejoin="round" />
    <path d="M52 100c-14-12-26-26-14-40 8-8 18-4 22 4 4-8 16-12 22-2 10 16-12 28-30 38z" fill={T} transform="translate(8 28) scale(1.15)" />
    <circle cx="164" cy="30" r="7" fill={G} /><circle cx="28" cy="40" r="5" fill={G2} />
    <path d="M168 110l5 11 11 5-11 5-5 11-5-11-11-5 11-5z" fill={W} />
  </>
)

export default function Art({ id }: { id: string }) {
  return (
    <svg className="art" viewBox="0 0 200 144" aria-hidden>
      {art[id]}
    </svg>
  )
}
