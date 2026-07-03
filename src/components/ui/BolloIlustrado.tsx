export default function BolloIlustrado({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 340 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Sombra */}
      <ellipse cx="170" cy="268" rx="120" ry="14" fill="rgba(0,0,0,0.12)" />

      {/* Base del bollo (pieza inferior) */}
      <path
        d="M 45 200 Q 45 228 170 228 Q 295 228 295 200 L 295 186 Q 295 176 170 176 Q 45 176 45 186 Z"
        fill="#fa572a" stroke="#fffff5" strokeWidth="3.5" strokeLinejoin="round"
      />

      {/* Crema visible en el corte */}
      <path
        d="M 48 182 Q 90 198 170 194 Q 250 198 292 182"
        stroke="#fffff5" strokeWidth="10" strokeLinecap="round" fill="none"
      />
      <path
        d="M 55 180 Q 95 193 170 190 Q 245 193 285 180"
        stroke="#FFFFF5" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.5"
      />

      {/* Bollo superior (domo) */}
      <path
        d="M 45 182 Q 42 62 170 58 Q 298 62 295 182 Z"
        fill="#fa572a" stroke="#fffff5" strokeWidth="3.5"
      />

      {/* Brillo del bollo */}
      <path
        d="M 100 118 Q 112 88 148 80 Q 168 75 178 90"
        stroke="rgba(255,255,245,0.3)" strokeWidth="10" fill="none" strokeLinecap="round"
      />

      {/* Cobertura glaseada encima */}
      <path
        d="M 80 158 Q 110 142 140 160 Q 170 178 200 158 Q 230 138 260 155"
        stroke="#8C52FF" strokeWidth="5" fill="none" strokeLinecap="round"
      />
      {/* Goteo de glaseado */}
      <path d="M 115 158 Q 112 172 110 182" stroke="#8C52FF" strokeWidth="4" strokeLinecap="round"/>
      <path d="M 185 158 Q 188 174 192 184" stroke="#8C52FF" strokeWidth="4" strokeLinecap="round"/>
      <path d="M 148 168 Q 145 182 143 190" stroke="#8C52FF" strokeWidth="3.5" strokeLinecap="round"/>

      {/* Sprinkles */}
      <rect x="96" y="124" width="20" height="7" rx="3.5" fill="#8C52FF"  transform="rotate(-28 96 124)"/>
      <rect x="154" y="108" width="20" height="7" rx="3.5" fill="#fffff5" transform="rotate(18 154 108)"/>
      <rect x="208" y="122" width="20" height="7" rx="3.5" fill="#8C52FF"  transform="rotate(-12 208 122)"/>
      <rect x="128" y="92"  width="16" height="6" rx="3"   fill="#fffff5" transform="rotate(35 128 92)"/>
      <rect x="182" y="90"  width="16" height="6" rx="3"   fill="#fffff5"  transform="rotate(-22 182 90)"/>
      <rect x="238" y="135" width="16" height="6" rx="3"   fill="#fffff5" transform="rotate(10 238 135)"/>
      <rect x="78"  y="138" width="16" height="6" rx="3"   fill="#fffff5" transform="rotate(-18 78 138)"/>

      {/* Puntitos de azúcar */}
      <circle cx="165" cy="82"  r="5" fill="#fffff5" />
      <circle cx="108" cy="150" r="4" fill="#fffff5" />
      <circle cx="230" cy="146" r="4" fill="#fffff5" />
      <circle cx="200" cy="100" r="3.5" fill="#8C52FF" />
      <circle cx="135" cy="104" r="3" fill="#8C52FF" />
    </svg>
  );
}
