// NARU · 공공 안내 그림표지 (Picto) — 초안 v1
// 한 가지 색(currentColor), 48 x 48 격자. 머리 = 반지름 4.25 원, 팔다리 = 굵기 5 둥근 끝, 몸통 = 굵기 6.5.
// 사람은 모두 오른쪽으로 움직이거나 오른쪽을 본다. 가장자리 3칸은 비운다 ('stand'만 위아래를 꽉 채운다).

const PICTO = (() => {
  const limb = { fill: 'none', stroke: 'currentColor', strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const trunk = { ...limb, strokeWidth: 6.5 };
  const ink = { fill: 'currentColor' };

  // 금지 표지: 사선이 사람 '위'를 지나가 보이도록 사람 조각을 사선 띠(막대 + 양쪽 틈)만큼 잘라 낸다. 마스크 없이 도형만 쓴다.
  const capsule = (x1, y1, x2, y2, w, n = 10) => {
    const r = w / 2, a = Math.atan2(y2 - y1, x2 - x1), p = [];
    for (let i = 0; i <= n; i++) { const t = a + Math.PI / 2 + Math.PI * i / n; p.push([x1 + r * Math.cos(t), y1 + r * Math.sin(t)]); }
    for (let i = 0; i <= n; i++) { const t = a - Math.PI / 2 + Math.PI * i / n; p.push([x2 + r * Math.cos(t), y2 + r * Math.sin(t)]); }
    return p;
  };
  const clip = (poly, side, c) => {
    const f = p => side * (p[0] - p[1]) - c, out = [];
    poly.forEach((p, i) => {
      const q = poly[(i + 1) % poly.length], fp = f(p), fq = f(q);
      if (fp >= 0) out.push(p);
      if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    });
    return out;
  };
  const area = poly => Math.abs(poly.reduce((s, p, i) => { const q = poly[(i + 1) % poly.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  const cutD = (segs, c, min = 5) => segs
    .flatMap(s => [clip(capsule(...s), 1, c), clip(capsule(...s), -1, c)])
    .filter(p => p.length > 2 && area(p) > min)
    .map(p => 'M' + p.map(v => v.map(n => +n.toFixed(2)).join(' ')).join('L') + 'Z').join('');

  const NO_C = 3.1 * Math.SQRT2;
  const NO_SEGS = [
    [24.8, 18.5, 24.2, 26.6, 4.8],                                   // 몸통
    [25.2, 18.9, 29.5, 21.5, 3.8], [29.5, 21.5, 33, 20.5, 3.8],      // 앞팔
    [24.5, 18.9, 21.1, 23.25, 3.8], [21.1, 23.25, 17.5, 28.5, 3.8],  // 뒷팔
    [24.2, 26.6, 25.6, 31, 3.8], [25.6, 31, 26.8, 35.5, 3.8],        // 앞다리
    [24.2, 26.6, 21.5, 31.2, 3.8], [21.5, 31.2, 18, 35.5, 3.8],      // 뒷다리
  ];

  return {
    run: <>
      <circle cx="31" cy="8" r="4.25" {...ink} />
      <path d="M26.5 16.5L20.5 28" {...trunk} />
      <path d="M27 16.5L34 21.5L40 17.5" {...limb} />
      <path d="M26 16.5L17.5 17.5L12 23" {...limb} />
      <path d="M20.5 28L30.5 31L29 42.5" {...limb} />
      <path d="M20.5 28L13 35.5L5.5 41" {...limb} />
    </>,
    up: <>
      <path d="M5 43H19V36H29V29H39V22H43" {...limb} strokeWidth="4" />
      <circle cx="24" cy="7.5" r="4.25" {...ink} />
      <path d="M21 15.5L17.5 26" {...trunk} />
      <path d="M17.5 26L15.5 32.5L12.5 38.5" {...limb} />
      <path d="M17.5 26L24.5 24.5L25 31.5" {...limb} />
      <path d="M21.5 16L27.5 18.5L32.5 14.5" {...limb} />
      <path d="M20.5 16L13 17.5L9.5 22.5" {...limb} />
    </>,
    wait: <>
      <path d="M5.5 22.5L24 6L42.5 22.5" {...limb} strokeWidth="4" />
      <path d="M10 20V43H38V20" {...limb} strokeWidth="4" />
      <circle cx="24" cy="17.5" r="4.25" {...ink} />
      <rect x="19.75" y="23.5" width="8.5" height="10.5" rx="2.5" {...ink} />
      <path d="M17 25.5V32M31 25.5V32" {...limb} strokeWidth="3.5" />
      <path d="M21.7 33V40M26.3 33V40" {...limb} strokeWidth="3.8" />
    </>,
    noexit: <>
      <circle cx="24" cy="24" r="18.9" fill="none" stroke="currentColor" strokeWidth="4.2" />
      <path d="M10.6 10.6L37.4 37.4" fill="none" stroke="currentColor" strokeWidth="3.6" />
      <circle cx="25.5" cy="12.6" r="3.4" {...ink} />
      <path d={cutD(NO_SEGS, NO_C)} {...ink} />
    </>,
    naru: <>
      <path fillRule="evenodd" {...ink} d="M22 10H35A10 10 0 0 1 45 20V32A6 6 0 0 1 39 38H43.5A6 6 0 0 0 31.5 38H28A6 6 0 0 0 16 38H12V20A10 10 0 0 1 22 10ZM16.5 18A2.5 2.5 0 0 1 19 15.5H21.5A2.5 2.5 0 0 1 24 18V34.5H16.5ZM27 18.5A3 3 0 0 1 30 15.5H37.5A3 3 0 0 1 40.5 18.5V21A3 3 0 0 1 37.5 24H30A3 3 0 0 1 27 21Z" />
      <circle cx="22" cy="40.5" r="4.5" {...ink} />
      <circle cx="37.5" cy="40.5" r="4.5" {...ink} />
      <path d="M12.5 37.5L4.6 43.4" {...limb} strokeWidth="3.2" />
    </>,
    walk: <>
      <circle cx="25.5" cy="7.75" r="4.25" {...ink} />
      <path d="M24.5 16.5L23.5 28.5" {...trunk} />
      <path d="M25 17L30 23L33.5 27.5" {...limb} />
      <path d="M24 17L19 23.5L16.5 28.5" {...limb} />
      <path d="M23.5 28.5L28 35.5L32.5 42.5" {...limb} />
      <path d="M23.5 28.5L19.5 35.5L14 42.5" {...limb} />
    </>,
    walker: <>
      <circle cx="17" cy="8" r="4.25" {...ink} />
      <path d="M16 16.5L13.5 28" {...trunk} />
      <path d="M16.5 17.5L21 23.5L27.5 25" {...limb} />
      <path d="M13.5 28L17 35.5L18 42.5" {...limb} />
      <path d="M13.5 28L10.5 35.5L7 42.5" {...limb} />
      <path d="M25.5 25H31M30 25L28.5 40M30 27L40 40M29.3 32.5H34.5" {...limb} strokeWidth="3" />
      <circle cx="28.5" cy="41.5" r="3.5" {...ink} />
      <circle cx="40.5" cy="41.5" r="3.5" {...ink} />
    </>,
    wheel: <>
      <circle cx="20" cy="8" r="4.25" {...ink} />
      <path d="M19.5 16.5L17.5 27.5" {...trunk} />
      <path d="M17.5 27.5H31L35 39L39.5 39.5" {...limb} />
      <path d="M20 18L27 21.5" {...limb} strokeWidth="4.5" />
      <circle cx="17" cy="33.5" r="9.25" fill="none" stroke="currentColor" strokeWidth="3.5" />
    </>,
    stand: <>
      <circle cx="24" cy="6.25" r="4.25" {...ink} />
      <path d="M17 14.5H31" {...limb} />
      <rect x="18.75" y="12" width="10.5" height="18" rx="2.5" {...ink} />
      <path d="M16.25 14.75L14 28M31.75 14.75L34 28" {...limb} strokeWidth="4.5" />
      <path d="M18.75 28H23.5V44.4A1.6 1.6 0 0 1 21.9 46H20.35A1.6 1.6 0 0 1 18.75 44.4ZM24.5 28H29.25V44.4A1.6 1.6 0 0 1 27.65 46H26.1A1.6 1.6 0 0 1 24.5 44.4Z" {...ink} />
    </>,
    gate: <>
      <path d="M5 17.5Q24 3.5 43 17.5" fill="none" stroke="currentColor" strokeWidth="7" />
      <path d="M10.5 16V45M37.5 16V45" fill="none" stroke="currentColor" strokeWidth="5" />
    </>,
    manhole: <>
      <circle cx="24" cy="24" r="18.75" fill="none" stroke="currentColor" strokeWidth="4.5" />
      <path d="M18 6.3V41.7M30 6.3V41.7M6.3 18H41.7M6.3 30H41.7" fill="none" stroke="currentColor" strokeWidth="3" />
    </>,
    sill: <>
      <path d="M3 40H27V31H45V45H3Z" {...ink} />
      <circle cx="15.5" cy="29.25" r="7.25" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="15.5" cy="29.25" r="2" {...ink} />
      <path d="M15.5 29.25L9 12.5" {...limb} strokeWidth="3.5" />
    </>,
  };
})();

function Picto({ name, size = 48, color, title, style }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={{ display: 'block', color, flexShrink: 0, ...style }}>
      {PICTO[name] || null}
    </svg>
  );
}

Object.assign(window, { PICTO, Picto });
