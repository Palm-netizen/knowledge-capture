"use client";

import { useId } from "react";

/* Vision-board illustrations (shown until the user uploads their own photo). */

function useIds(...names: string[]) {
  const base = useId().replace(/:/g, "");
  return Object.fromEntries(names.map((n) => [n, `${n}-${base}`])) as Record<string, string>;
}

/** Young man with glasses on stage, speaking to an audience of thousands. */
export function StageScene({ className }: { className?: string }) {
  const id = useIds("bg", "spot", "floor", "suit", "rim");
  // audience rows: further rows are smaller & higher
  const rows = Array.from({ length: 7 }, (_, r) => {
    const y = 382 + r * 18 + r * r * 1.6;
    const size = 5.5 + r * 2.4;
    const count = Math.ceil(800 / (size * 2.3)) + 2;
    return Array.from({ length: count }, (_, i) => {
      const jitter = Math.sin(i * 12.9898 + r * 78.233) * 0.5;
      return { x: i * (800 / (count - 2)) - 10 + jitter * size, y: y + jitter * 3, s: size * (0.9 + (jitter + 0.5) * 0.2), r };
    });
  });
  const lights = Array.from({ length: 26 }, (_, i) => ({
    x: (Math.sin(i * 3.1) * 0.5 + 0.5) * 780 + 10,
    y: 395 + (Math.cos(i * 1.7) * 0.5 + 0.5) * 95,
  }));

  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="ชายหนุ่มใส่แว่นยืนพูดบนเวทีต่อหน้าผู้ชมนับพัน">
      <defs>
        <linearGradient id={id.bg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B1030" />
          <stop offset=".6" stopColor="#1A1F55" />
          <stop offset="1" stopColor="#0B0E24" />
        </linearGradient>
        <linearGradient id={id.spot} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF6D8" stopOpacity=".75" />
          <stop offset="1" stopColor="#FFF6D8" stopOpacity=".06" />
        </linearGradient>
        <linearGradient id={id.floor} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B3F8F" />
          <stop offset="1" stopColor="#1B1D4A" />
        </linearGradient>
        <linearGradient id={id.suit} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2F5BEA" />
          <stop offset="1" stopColor="#1A2C7A" />
        </linearGradient>
        <linearGradient id={id.rim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7B61FF" stopOpacity=".55" />
          <stop offset="1" stopColor="#7B61FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill={`url(#${id.bg})`} />
      {/* stage lights */}
      {[120, 260, 540, 680].map((x, i) => (
        <g key={x} opacity=".55">
          <circle cx={x} cy={18} r={7} fill="#FFE8A3" />
          <polygon points={`${x - 5},22 ${x + 5},22 ${x + (i < 2 ? 140 : -140)},330 ${x + (i < 2 ? 60 : -60)},330`} fill="#9DB5FF" opacity=".12" />
        </g>
      ))}
      {/* big screen glow behind */}
      <rect x="230" y="40" width="340" height="150" rx="14" fill="#2F5BEA" opacity=".22" />
      <rect x="250" y="58" width="300" height="114" rx="10" fill="#7B61FF" opacity=".18" />
      {/* spotlight */}
      <polygon points="372,0 428,0 540,336 260,336" fill={`url(#${id.spot})`} />
      {/* stage */}
      <rect x="40" y="326" width="720" height="40" rx="6" fill={`url(#${id.floor})`} />
      <rect x="40" y="326" width="720" height="5" rx="2" fill="#9DB5FF" opacity=".55" />
      <ellipse cx="400" cy="331" rx="120" ry="12" fill="#FFF6D8" opacity=".35" />

      {/* speaker */}
      <g>
        {/* legs */}
        <rect x="383" y="262" width="15" height="68" rx="6" fill="#141936" />
        <rect x="402" y="262" width="15" height="68" rx="6" fill="#141936" />
        <ellipse cx="389" cy="330" rx="13" ry="5" fill="#0A0C1C" />
        <ellipse cx="412" cy="330" rx="13" ry="5" fill="#0A0C1C" />
        {/* left arm down */}
        <path d="M371 202 q-12 30 -8 62" stroke="#1E2F86" strokeWidth="13" strokeLinecap="round" fill="none" />
        <circle cx="363" cy="266" r="6.5" fill="#F0C4A0" />
        {/* raised right arm, open palm to the audience */}
        <path d="M428 200 q30 -6 42 -44" stroke="#1E2F86" strokeWidth="13" strokeLinecap="round" fill="none" />
        <circle cx="472" cy="150" r="8" fill="#F0C4A0" />
        {/* torso (blazer) */}
        <path d="M366 196 q34 -18 68 0 l-6 72 h-56 z" fill={`url(#${id.suit})`} />
        <path d="M392 192 l8 26 l8 -26 z" fill="#F4F6FF" />
        <path d="M398 206 l2 34 l2 -34 z" fill="#FF8A1F" />
        {/* neck + head */}
        <rect x="394" y="176" width="12" height="16" rx="4" fill="#E2B08C" />
        <circle cx="400" cy="160" r="22" fill="#F0C4A0" />
        <path d="M378 157 q0 -26 24 -25 q22 1 21 22 q-6 -12 -20 -12 q-14 0 -25 15 z" fill="#1A1A24" />
        {/* glasses */}
        <rect x="383" y="155" width="14" height="10" rx="3.5" fill="#9DB5FF" fillOpacity=".25" stroke="#111" strokeWidth="2.2" />
        <rect x="403" y="155" width="14" height="10" rx="3.5" fill="#9DB5FF" fillOpacity=".25" stroke="#111" strokeWidth="2.2" />
        <path d="M397 159 h6" stroke="#111" strokeWidth="2" />
        <path d="M393 172 q7 5 14 0" stroke="#9A5B3C" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* headset mic */}
        <path d="M380 162 q2 12 12 13" stroke="#E6E8F2" strokeWidth="1.6" fill="none" />
      </g>

      {/* audience */}
      <rect x="0" y="366" width="800" height="134" fill="#080A1C" />
      {rows.map((row, r) => (
        <g key={r} fill={r < 2 ? "#232860" : r < 4 ? "#1A1E4A" : "#11143A"}>
          {row.map((h, i) => (
            <g key={i}>
              <ellipse cx={h.x} cy={h.y + h.s * 1.9} rx={h.s * 1.5} ry={h.s * 1.1} />
              <circle cx={h.x} cy={h.y} r={h.s} />
            </g>
          ))}
        </g>
      ))}
      <rect x="0" y="366" width="800" height="70" fill={`url(#${id.rim})`} />
      {/* phone lights in the crowd */}
      {lights.map((l, i) => (
        <circle key={i} cx={l.x} cy={l.y} r={1.8} fill="#FFE8A3" opacity=".8" />
      ))}
    </svg>
  );
}

/** Fit, strong body — stylised flex pose. */
export function BodyScene({ className }: { className?: string }) {
  const id = useIds("bg", "skin", "sun");
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="ร่างกายแข็งแรง หุ่นที่ดี">
      <defs>
        <linearGradient id={id.bg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF8A1F" />
          <stop offset=".55" stopColor="#F2557A" />
          <stop offset="1" stopColor="#7B61FF" />
        </linearGradient>
        <linearGradient id={id.skin} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3A2350" />
          <stop offset="1" stopColor="#1C1230" />
        </linearGradient>
        <radialGradient id={id.sun}>
          <stop offset="0" stopColor="#FFF3C4" />
          <stop offset="1" stopColor="#FFF3C4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#${id.bg})`} />
      <circle cx="200" cy="215" r="170" fill={`url(#${id.sun})`} opacity=".85" />
      <circle cx="200" cy="215" r="92" fill="#FFF3C4" opacity=".55" />
      {/* ground line */}
      <rect x="0" y="440" width="400" height="60" fill="#2A1846" opacity=".55" />

      <g fill={`url(#${id.skin})`}>
        {/* head + neck */}
        <circle cx="200" cy="118" r="26" />
        <rect x="188" y="138" width="24" height="22" rx="8" />
        {/* traps + torso (V-shape) */}
        <path d="M130 172 q70 -26 140 0 q8 10 4 26 l-30 96 q-44 14 -88 0 l-30 -96 q-4 -16 4 -26 z" />
        {/* arms: upper arm out, forearm up (double-biceps) */}
        <path d="M136 176 q-40 4 -66 -6 q-14 -6 -10 -22 l6 -10 q16 10 66 8 z" />
        <ellipse cx="96" cy="152" rx="26" ry="18" />
        <path d="M66 156 q-14 -40 -2 -76 q8 -10 20 -4 q4 34 4 70 z" />
        <circle cx="76" cy="70" r="15" />
        <path d="M264 176 q40 4 66 -6 q14 -6 10 -22 l-6 -10 q-16 10 -66 8 z" />
        <ellipse cx="304" cy="152" rx="26" ry="18" />
        <path d="M334 156 q14 -40 2 -76 q-8 -10 -20 -4 q-4 34 -4 70 z" />
        <circle cx="324" cy="70" r="15" />
        {/* shorts + legs */}
        <path d="M156 290 q44 14 88 0 l8 58 h-48 l-4 -20 l-4 20 h-48 z" fill="#0F0A1E" />
        <path d="M160 346 h38 l-4 96 h-26 z" />
        <path d="M202 346 h38 l-8 96 h-26 z" />
      </g>
      {/* muscle definition highlights */}
      <g stroke="#FFD9B8" strokeOpacity=".35" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M200 178 v104" />
        <path d="M168 196 q32 14 64 0" />
        <path d="M182 230 h36 M184 252 h32 M187 272 h26" />
        <path d="M84 146 q12 -10 26 0 M290 146 q12 -10 26 0" />
      </g>
      {/* sparkles */}
      {[[60, 260], [340, 250], [320, 400], [80, 380]].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x} ${y - 9} l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3 z`} fill="#FFF3C4" opacity=".9" />
      ))}
    </svg>
  );
}

/** New Zealand — glacier mountains and a turquoise lake. */
export function NewZealandScene({ className }: { className?: string }) {
  const id = useIds("sky", "lake", "far", "near", "ice");
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="ภูเขาน้ำแข็งที่นิวซีแลนด์">
      <defs>
        <linearGradient id={id.sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5C8DF6" />
          <stop offset=".7" stopColor="#BFD4FF" />
          <stop offset="1" stopColor="#EAF1FF" />
        </linearGradient>
        <linearGradient id={id.lake} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3FC7D4" />
          <stop offset="1" stopColor="#167C94" />
        </linearGradient>
        <linearGradient id={id.far} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7E95C9" />
          <stop offset="1" stopColor="#5A6FA6" />
        </linearGradient>
        <linearGradient id={id.near} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3D4F86" />
          <stop offset="1" stopColor="#24305C" />
        </linearGradient>
        <linearGradient id={id.ice} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#BFE6F2" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#${id.sky})`} />
      <circle cx="320" cy="80" r="26" fill="#FFF7DA" opacity=".9" />
      {/* clouds */}
      <g fill="#fff" opacity=".85">
        <ellipse cx="90" cy="90" rx="46" ry="12" />
        <ellipse cx="120" cy="82" rx="30" ry="12" />
        <ellipse cx="260" cy="140" rx="40" ry="9" />
      </g>
      {/* far range */}
      <path d="M0 270 L60 180 L100 220 L160 130 L215 210 L260 160 L320 225 L360 190 L400 230 V320 H0 Z" fill={`url(#${id.far})`} />
      <path d="M140 160 L160 130 L178 156 L168 152 L160 160 L152 154 Z M246 178 L260 160 L274 178 L262 174 Z M50 196 L60 180 L70 194 L62 192 Z" fill="#fff" />
      {/* main peak with glacier */}
      <path d="M40 340 L150 200 L205 120 L250 190 L360 340 Z" fill={`url(#${id.near})`} />
      <path d="M205 120 L230 158 L218 156 L212 172 L202 160 L190 176 L186 152 L176 160 Z" fill={`url(#${id.ice})`} />
      {/* glacier tongue flowing to the lake */}
      <path d="M196 170 q-10 60 -36 110 q-14 30 -42 60 h70 q6 -40 18 -80 q8 -40 4 -90 z" fill={`url(#${id.ice})`} opacity=".95" />
      <path d="M190 210 q-8 40 -26 80 M200 230 q-4 40 -16 90" stroke="#9FD4E6" strokeWidth="2" fill="none" />
      {/* lake + reflection */}
      <rect x="0" y="336" width="400" height="164" fill={`url(#${id.lake})`} />
      <path d="M40 336 L150 430 L205 470 L250 420 L360 336 Z" fill="#24305C" opacity=".22" />
      <g stroke="#E8FBFF" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round">
        <path d="M40 372 h60 M150 392 h90 M280 362 h70 M70 420 h50 M230 446 h80" />
      </g>
      {/* icebergs */}
      <path d="M90 352 l14 -10 l18 4 l8 8 z M300 360 l10 -8 l14 2 l6 7 z" fill="#F2FBFF" />
      {/* foreground hills */}
      <path d="M0 470 q80 -40 170 -10 q90 30 230 -20 V500 H0 Z" fill="#1F5B4A" />
      <path d="M0 488 q120 -28 240 -4 q90 16 160 -10 V500 H0 Z" fill="#164536" />
    </svg>
  );
}
