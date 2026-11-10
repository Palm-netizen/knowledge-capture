"use client";

import { useId } from "react";

/* Small illustrations for the PALM DNA page. */

function useIds(...names: string[]) {
  const base = useId().replace(/:/g, "");
  return Object.fromEntries(names.map((n) => [n, `${n}-${base}`])) as Record<string, string>;
}

/** Market triangle: level 1 at the broad base, level 3 (highlighted) at the narrow, deep top. */
export function MarketPyramid({ className }: { className?: string }) {
  const id = useIds("top", "glow");
  // triangle apex (200,10), base y=330; split into 3 bands
  const xAt = (y: number) => ((y - 10) / 320) * 190; // half-width at y
  const band = (y1: number, y2: number) =>
    `${200 - xAt(y1)},${y1} ${200 + xAt(y1)},${y1} ${200 + xAt(y2)},${y2} ${200 - xAt(y2)},${y2}`;
  return (
    <svg viewBox="0 0 400 340" className={className} role="img" aria-label="สามเหลี่ยมตลาด 3 ระดับ เน้นระดับที่ 3 ด้านบน">
      <defs>
        <linearGradient id={id.top} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF8A1F" />
          <stop offset="1" stopColor="#7B61FF" />
        </linearGradient>
        <radialGradient id={id.glow} cx=".5" cy=".3" r=".5">
          <stop offset="0" stopColor="#FF8A1F" stopOpacity=".35" />
          <stop offset="1" stopColor="#FF8A1F" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="80" rx="150" ry="90" fill={`url(#${id.glow})`} />
      {/* level 3 — top */}
      <polygon points={`200,10 ${200 + xAt(118)},118 ${200 - xAt(118)},118`} fill={`url(#${id.top})`} />
      {/* level 2 */}
      <polygon points={band(124, 224)} fill="#D6E0FF" />
      {/* level 1 — base */}
      <polygon points={band(230, 330)} fill="#E7E9EE" />
      <g fontFamily="var(--font-display)" textAnchor="middle" fontWeight="600">
        <text x="200" y="92" fontSize="30" fill="#fff">3</text>
        <text x="200" y="186" fontSize="26" fill="#2F5BEA">2</text>
        <text x="200" y="292" fontSize="26" fill="#6F7582">1</text>
      </g>
    </svg>
  );
}

/** เข้าใจ → ทดลอง → เรียนรู้ → ถ่ายทอด as a loop. */
export function CycleRing({ labels, className }: { labels: readonly string[]; className?: string }) {
  const id = useIds("ring");
  const r = 74;
  const pts = labels.map((_, i) => {
    const a = (-90 + (i * 360) / labels.length) * (Math.PI / 180);
    return { x: 110 + r * Math.cos(a), y: 110 + r * Math.sin(a) };
  });
  const colors = ["#4C74FF", "#22A06B", "#8B74FF", "#FF8A1F"];
  return (
    <svg viewBox="0 0 220 220" className={className} role="img" aria-label={labels.join(" → ")}>
      <defs>
        <linearGradient id={id.ring} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4C74FF" />
          <stop offset="1" stopColor="#FF8A1F" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r={r} fill="none" stroke={`url(#${id.ring})`} strokeOpacity=".55" strokeWidth="2" strokeDasharray="5 6" />
      {/* direction arrows between nodes */}
      {pts.map((_, i) => {
        const a = (-90 + 45 + (i * 360) / labels.length) * (Math.PI / 180);
        const x = 110 + r * Math.cos(a);
        const y = 110 + r * Math.sin(a);
        const deg = -90 + 45 + (i * 360) / labels.length + 90;
        return <path key={i} d="M-4 -4 L3 0 L-4 4" transform={`translate(${x} ${y}) rotate(${deg})`} stroke="#A5ABB7" strokeWidth="1.8" fill="none" strokeLinecap="round" />;
      })}
      {pts.map((p, i) => (
        <g key={labels[i]}>
          <circle cx={p.x} cy={p.y} r="27" fill="#1D2029" stroke={colors[i]} strokeWidth="2" />
          <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="13" fontWeight="600" fill="#fff">
            {labels[i]}
          </text>
        </g>
      ))}
      <text x="110" y="106" textAnchor="middle" fontSize="11" fill="#A5ABB7">
        ทำซ้ำ
      </text>
      <text x="110" y="122" textAnchor="middle" fontSize="11" fill="#A5ABB7">
        เป็นวงจร
      </text>
    </svg>
  );
}

/** Iceberg: what people see (above water) vs what they receive (below). */
export function Iceberg({ className }: { className?: string }) {
  const id = useIds("sea", "ice", "under");
  return (
    <svg viewBox="0 0 200 260" className={className} role="img" aria-label="ภูเขาน้ำแข็ง: ส่วนที่เห็นเหนือน้ำ และส่วนใหญ่ที่อยู่ใต้น้ำ">
      <defs>
        <linearGradient id={id.sea} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4C74FF" stopOpacity=".18" />
          <stop offset="1" stopColor="#2F5BEA" stopOpacity=".45" />
        </linearGradient>
        <linearGradient id={id.ice} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#D6E0FF" />
        </linearGradient>
        <linearGradient id={id.under} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9DB5FF" />
          <stop offset="1" stopColor="#7B61FF" />
        </linearGradient>
      </defs>
      <rect x="0" y="78" width="200" height="182" rx="16" fill={`url(#${id.sea})`} />
      {/* above water */}
      <path d="M70 80 L92 34 L104 48 L118 22 L136 80 Z" fill={`url(#${id.ice})`} stroke="#B3C4F5" strokeWidth="1.2" />
      {/* below water — much bigger */}
      <path d="M70 80 L136 80 L168 130 L156 196 L112 244 L58 220 L30 150 Z" fill={`url(#${id.under})`} opacity=".85" />
      <path d="M0 80 Q25 74 50 80 T100 80 T150 80 T200 80" stroke="#FFFFFF" strokeWidth="2" fill="none" />
    </svg>
  );
}
