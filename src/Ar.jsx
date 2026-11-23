// NARU AR 부품 (2026-11-22 새벽)
// 배경데이터가 먼저: 길과 물을 보여 주는 화면은 '언리얼 원본 렌더'가 화면 전체(카메라처럼)이고, 그 위에 길 · 이름표 · 나루를 겹친다(AR).
// 렌더 파일은 손대지 않는다(겹친 것은 화면의 층). 렌더가 오기 전에는 같은 원근의 '임시 그림'을 깔고 그렇다고 표시한다.
// 나루 v3: assets/mascot3/m3-<pose>.png (idle · happy · guide · worry · wave) · 물결 탭 카드(Wave) = 나루의 모양

// ── 원근: 내 눈높이(걸음)에서 골목 끝(입구)을 바라본다. X = 오른쪽(+) m, Y = 바닥에서 높이 m, d = 앞으로 거리 m
const AR = { W: 375, H: 780, hz: 372, f: 300, half: 2.1 };
// 원본 렌더(360°)를 이 원근과 똑같이 보이게: 세로 화각 = 2·atan(H/2 ÷ f) ≈ 104.9°, 지평선이 가운데보다 18px 위 = 3.43° 내려다봄
const AR_VFOV = 2 * Math.atan(AR.H / 2 / AR.f) * 180 / Math.PI;
const arP = (eye = 140) => { const e = eye / 100; return (X, Y, d) => [AR.W / 2 + AR.f * X / d, AR.hz + AR.f * (e - Y) / d]; };
const arPts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

// 길 (보이는 쪽에서): 갈 곳마다 [X, d]. far = 골목 끝(입구)까지 남은 거리
// hz = [X, d] 가는 길 위의 맨홀: 길은 그 옆으로 2m 비켜 간다 (길 띠가 맨홀 고리를 밟지 않게)
function arRoute(safe, far, hz) {
  const clear = hz ? hz[0] + (hz[0] <= 0 ? 2.0 : -2.0) : 0;
  if (safe && safe.building) {
    const b = buildingOf(safe.building), dz = far - safe.door, sx = b.side === 'L' ? 1 : -1;
    if (dz < 6) return [[0.35, 1.6], [0.25, 2.5], [sx * 0.15, 3.1], [sx * 0.8, 3.6], [sx * 1.6, 3.9]];           // 문 바로 앞: 옆으로 꺾어 들어간다
    if (hz && Math.abs(hz[1] - dz) < 3) {                                                     // 문 앞에 맨홀: 비켜 지나서 돌아 들어간다
      const a = [[0.55, 1.6], [0.45, 4]]; if (dz - 4 > 6) a.push([0.3, dz - 4]);
      return a.concat([[clear, dz - 2.2], [clear, hz[1] + 0.9], [sx * 2.0, hz[1] + 1.0]]);
    }
    return [[0.55, 1.6], [0.45, 4], [0.2, Math.max(5, dz - 3)], [sx * 0.9, dz - 0.6], [sx * 2.0, dz]];
  }
  const a = [[0.55, 1.6], [0.4, 4], [0.3, 12]];
  if (hz && hz[1] > 8 && hz[1] < far - 3) {
    a.push([clear, hz[1] - 3], [clear, hz[1] + 2.5]);
    if (hz[1] + 8 < far - 1.2) a.push([0, hz[1] + 8]);
  }
  a.push([0, far - 1.2]);
  return a.filter((p, i) => i === 0 || p[1] > a[i - 1][1] + 0.2);                             // 앞으로만 (뒤로 접히지 않게)
}
function arSmooth(P1, step = 0.6) {
  // 긴 구간은 먼저 4m 이하로 곧게 나눈다 — 먼 다음 점에 끌려 곡선이 발밑 쪽에서 뒤로 휘면(걸어서 · 2층 길) 길 띠가 발밑까지 오지 않는다
  const P0 = [P1[0]];
  for (let i = 1; i < P1.length; i++) {
    const a = P1[i - 1], b = P1[i], k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4));
    for (let j = 1; j <= k; j++) P0.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
  }
  const out = [];
  for (let i = 0; i < P0.length - 1; i++) {
    const p0 = P0[Math.max(0, i - 1)], p1 = P0[i], p2 = P0[i + 1], p3 = P0[Math.min(P0.length - 1, i + 2)];
    const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t, f = (a, b, c, d) => .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(P0[P0.length - 1]); return out;
}

// ── 임시 그림: 렌더가 오기 전, 같은 원근으로 그린 시장 골목 (배경데이터가 아니다 — 화면에 표시)
function ArSketch({ night, eye = 140, far = 62.4, water = 0, fast, rain }) {
  // 모양: 건축 '클레이 렌더' 자리표시 — 채도를 뺀 차분한 면, 바닥 가까이와 멀리 갈수록 짙어지는 그늘(가짜 AO), 밝은 입구. 글자 없음.
  // 순서: 하늘 → 바닥(빛 웅덩이) → 벽 → 가게(먼 것부터: 안쪽 · 문틀 · 간판 · 차양) → 깊이 그늘 → 밤 불빛 → 물 → 입구 빛 → 초롱
  const P = arP(eye), h = AR.half, top = 3.5, d0 = 0.9, e = eye / 100, W = AR.W, H = AR.H, hz = AR.hz;
  // 그라디언트 id는 그림마다 따로 (한 화면에 낮 · 밤 · 썸네일이 함께 있어도 섞이지 않게)
  const uid = 'ars' + String(React.useId ? React.useId() : '').replace(/[^\w-]/g, '') + (night ? 'n' : 'd');
  const u = k => `url(#${uid}${k})`;
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, t) => '#' + hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
  const C = night
    ? { sky: ['#060812', '#0A0E1E', '#10162B'], wall: ['#1F2533', '#1A202D'], cope: '#2B3243', ao: '#000000', aoA: .06, aoK: 1.8, deep: '#020309', deepA: .62,
        open: ['#0D1016', '#13161D'], lit: ['#2C2119', '#1A140F'], soffit: '#07080C', jamb: '#161A24', sign: '#232937',
        awn: ['#394358', '#3A4741', '#544E40', '#52433D', '#3F4552'], floor: ['#232938', '#10141D'], joint: 'rgba(175,190,225,.06)',
        end: '#F4D8A8', bloom: '#FFC676', bloomA: .5, arch: '#D2AE78', str: '#4D4537', lamp: '#FFDDA8', glow: '#FFB95F', glowA: .72,
        wat: [['#2B3A56', .9], ['#192943', .82], ['#0F2236', .72], ['#0B1C2C', .74]], wtint: ['#0A1B2A', .5], wline: '#A8C6E2', wave: '#D2E3F4' }
    : { sky: ['#CAD6E2', '#E2E8EE', '#F5F6F7'], wall: ['#E8E4DC', '#DFDAD2'], cope: '#F6F3EE', ao: '#454852', aoA: .035, aoK: 1, deep: '#2D3140', deepA: .32,
        open: ['#9C968E', '#B1ABA2'], soffit: '#827D78', jamb: '#CAC5BE', sign: '#F7F5F1',
        awn: ['#8D99A8', '#A0AA98', '#CABDA5', '#B69D8E', '#9FA5AC'], floor: ['#DAD6CE', '#C6C0B7'], joint: 'rgba(84,74,64,.09)',
        end: '#FFFFFF', bloom: '#FFFFFF', bloomA: .8, arch: '#8390A5', str: '#A3988A', lamp: '#EFC38A', glow: '#F2B66E', glowA: .55,
        wat: [['#EAF3F6', .9], ['#BDDBE5', .8], ['#4F95B2', .6], ['#1E638E', .66]], wtint: ['#2C6D8C', .3], wline: '#FFFFFF', wave: '#FFFFFF' };
  const quad = pts => arPts(pts.map(p => P(p[0], p[1], p[2])));
  const units = side => { const a = []; let k = side > 0 ? 1 : 0; for (let d = 1.4; d < far - 2; d += 3.6, k++) a.push([d, Math.min(far - 1.5, d + 3.3), k]); return a; };
  // 가게 한 칸: 문 안쪽(a1~b1) · 벽 두께 .25m(문틀) · 밤에는 셋 중 둘이 불을 켰다. 가까운 것이 위에 오도록 먼 것부터 그린다
  const U = [-1, 1].flatMap(side => units(side).reverse().map(([a, b, k]) => ({ side, a, b, k, X: side * h, Xi: side * (h + .25), a1: a + .15, b1: b - .15, lit: !!night && (k * 5) % 3 !== 0 })));
  const lanterns = [9, 21, 36].filter(d => d < far - 3);
  const ww = Math.max(0, water), ew = Math.max(.05, e - ww); // ew: 눈에서 물낯까지 (m)
  const box = quad([[-h, top, d0], [-h, top, far], [h, top, far], [h, top, d0], [h, 0, d0], [-h, 0, d0]]);
  const rnd = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
  // 그늘 띠: 반투명을 여러 장 겹치면 8비트 반올림으로 색이 틀어진다 → 미리 섞은 불투명 띠를 큰 것부터 작은 것 순서로 덮는다
  // 바닥: [벽에서 안쪽으로 폭 m, 그늘 세기] · 벽: [바닥에서 높이 m, 그늘 세기]
  const FL = [[1.3, .016], [.95, .032], [.7, .048], [.5, .064], [.36, .08], [.25, .096], [.17, .112], [.11, .128], [.06, .144], [.03, .16]];
  const WL = [[3.0, .015], [2.5, .03], [2.05, .045], [1.65, .06], [1.3, .075], [1.0, .09], [.74, .105], [.52, .12], [.34, .135], [.2, .15], [.09, .165]];
  // 바닥에 번지는 빛: 벽을 따라 누운 부드러운 타원
  const pool = (key, Xp, a, b, k = 1) => {
    const A = P(Xp, 0, a), B = P(Xp, 0, b), cx = (A[0] + B[0]) / 2, cy = (A[1] + B[1]) / 2, ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
    const ry = Math.max(.8, AR.f * .8 * k / ((a + b) / 2) * Math.abs(Math.sin(ang)));
    return <ellipse key={key} cx={cx.toFixed(1)} cy={cy.toFixed(1)} rx={(Math.hypot(B[0] - A[0], B[1] - A[1]) * .6).toFixed(1)} ry={ry.toFixed(1)} transform={`rotate(${(ang * 180 / Math.PI).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})`} fill={u('pool')} />;
  };
  // 물: 발밑(화면 아래 끝)까지 덮도록 가까운 끝을 당긴다
  const dn = Math.min(d0, AR.f * ew / (H + 80 - hz));
  const surf = quad([[-h, ww, dn], [h, ww, dn], [h, ww, far], [-h, ww, far]]);
  // 물결: 가는 빛줄(∿, 양 끝이 사라진다). 줄은 화면 높이로 나눠 물 높이 · 눈높이와 상관없이 발밑까지 고르게, 멀수록 촘촘 · 가늘 · 옅게.
  // 빠르면 줄이 더 많고 길고 또렷하다
  const waves = [];
  if (ww > 0) for (let i = 0; i < (fast ? 19 : 10); i++) {
    const y = hz + (H + 10 - hz) * Math.pow(fast ? .83 : .74, i + .45), dz = AR.f * ew / (y - hz);
    if (dz > far - 2) break;
    const xl = Math.max(-30, W / 2 - AR.f * h / dz), xr = Math.min(W + 30, W / 2 + AR.f * h / dz), span = xr - xl, n = Math.max(1, Math.round(span / (fast ? 92 : 128)));
    for (let j = 0; j < n; j++) {
      const wd = Math.min(fast ? 128 : 78, AR.f * (fast ? 1 : .5) / dz) * (.7 + .6 * rnd(i, j)), s = wd * (fast ? .085 : .1);
      const cx = xl + span * (j + .2 + .6 * rnd(j + 5, i)) / n, cy = y + (rnd(i + 3, j) - .5) * (y - hz) * .12, x0 = cx - wd / 2;
      waves.push(<path key={'v' + i + ':' + j} d={`M${x0.toFixed(1)} ${cy.toFixed(1)} C${(x0 + wd / 3).toFixed(1)} ${(cy - 2 * s).toFixed(1)} ${(x0 + wd * 2 / 3).toFixed(1)} ${(cy + 2 * s).toFixed(1)} ${(x0 + wd).toFixed(1)} ${cy.toFixed(1)}`}
        fill="none" stroke={u('rip')} strokeWidth={Math.max(.5, Math.min(2.2, (y - hz) / (fast ? 120 : 150))).toFixed(2)} strokeLinecap="round" opacity={((fast ? .95 : .72) * Math.max(.3, Math.min(1, (y - hz) / 70))).toFixed(2)} />);
    }
  }
  const gate = (() => { const a = P(-h * .9, ww, far), b = P(-h * .9, 3.0, far), c = P(0, 3.6, far), g = P(h * .9, 3.0, far), gb = P(h * .9, ww, far); return `M${a[0]} ${a[1]} L${b[0]} ${b[1]} Q${c[0]} ${c[1] - 6} ${g[0]} ${g[1]} L${gb[0]} ${gb[1]}`; })();
  const ec = P(0, 1.5, far);
  const stops = (c, a, list) => list.map(([o, k]) => <stop key={o} offset={o} stopColor={c} stopOpacity={+(a * k).toFixed(3)} />);
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, display: 'block' }} aria-hidden="true">
      <defs>
        <linearGradient id={uid + 'sky'} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={hz}><stop offset="0" stopColor={C.sky[0]} /><stop offset=".62" stopColor={C.sky[1]} /><stop offset="1" stopColor={C.sky[2]} /></linearGradient>
        {[[0, 0]].concat(FL).map(([w, t], i) => <linearGradient key={'fl' + i} id={uid + 'fl' + i} gradientUnits="userSpaceOnUse" x1="0" y1={H} x2="0" y2={hz}><stop offset="0" stopColor={mix(C.floor[0], C.ao, t * C.aoK)} /><stop offset="1" stopColor={mix(C.floor[1], C.ao, t * C.aoK)} /></linearGradient>)}
        <radialGradient id={uid + 'deep'} gradientUnits="userSpaceOnUse" cx={W / 2} cy={hz} r="270">{stops(C.deep, C.deepA, [[0, 1], [.1, .8], [.25, .5], [.5, .2], [.75, .06], [1, 0]])}</radialGradient>
        <linearGradient id={uid + 'op'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.open[0]} /><stop offset="1" stopColor={C.open[1]} /></linearGradient>
        <radialGradient id={uid + 'glow'}>{stops(C.glow, C.glowA, [[0, 1], [.3, .45], [.65, .12], [1, 0]])}</radialGradient>
        <radialGradient id={uid + 'bloom'}>{stops(C.bloom, C.bloomA, [[0, 1], [.2, .55], [.5, .18], [1, 0]])}</radialGradient>
        {night && <linearGradient id={uid + 'lt'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.lit[0]} /><stop offset="1" stopColor={C.lit[1]} /></linearGradient>}
        {night && [['L', '.6'], ['R', '.4']].map(([k, cx]) => <radialGradient key={k} id={uid + 'lg' + k} cx={cx} cy=".62" r=".62"><stop offset="0" stopColor="#FFD596" stopOpacity=".8" /><stop offset=".4" stopColor="#E9A55E" stopOpacity=".42" /><stop offset=".8" stopColor="#B87A40" stopOpacity=".12" /><stop offset="1" stopColor="#B87A40" stopOpacity="0" /></radialGradient>)}
        {night && <radialGradient id={uid + 'pool'}>{stops('#FFB461', .2, [[0, 1], [.45, .5], [1, 0]])}</radialGradient>}
        {ww > 0 && <linearGradient id={uid + 'wat'} x1="0" y1="0" x2="0" y2="1">{C.wat.map(([c, a], i) => <stop key={i} offset={[0, .07, .35, 1][i]} stopColor={c} stopOpacity={a} />)}</linearGradient>}
        {ww > 0 && <linearGradient id={uid + 'rip'} x1="0" y1="0" x2="1" y2="0">{stops(C.wave, 1, [[0, 0], [.5, 1], [1, 0]])}</linearGradient>}
        {ww > 0 && <clipPath id={uid + 'wc'}><polygon points={surf} /></clipPath>}
        {ww > 0 && !night && <linearGradient id={uid + 'wmg'} gradientUnits="userSpaceOnUse" x1="0" y1={hz} x2="0" y2={hz + 230}><stop offset="0" stopColor="#FFFFFF" /><stop offset=".45" stopColor="#FFFFFF" stopOpacity=".55" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>}
        {ww > 0 && !night && <mask id={uid + 'wm'} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}><rect width={W} height={H} fill={u('wmg')} /></mask>}
        {ww > 0 && night && <radialGradient id={uid + 'lgr'} cx=".5" cy=".24" r=".5"><stop offset="0" stopColor="#FFC97F" stopOpacity=".5" /><stop offset=".35" stopColor="#E0995A" stopOpacity=".2" /><stop offset=".7" stopColor="#B87A40" stopOpacity="0" /></radialGradient>}
      </defs>
      {/* 하늘 */}
      <rect width={W} height={H} fill={u('sky')} />
      {/* 바닥: 가까울수록 밝고 벽 밑은 그늘, 줄눈은 옅게 */}
      <polygon points={quad([[-h, 0, d0], [h, 0, d0], [h, 0, far], [-h, 0, far]])} fill={u('fl0')} />
      {[-1, 1].map(s => FL.map(([w], i) => <polygon key={s + ':' + i} points={quad([[s * h, 0, d0], [s * h, 0, far], [s * (h - w), 0, far], [s * (h - w), 0, d0]])} fill={u('fl' + (i + 1))} />))}
      {Array.from({ length: 16 }, (_, i) => 1.2 + i * 1.6 + i * i * .18).filter(d => d < far).map(d => <polyline key={d} points={quad([[-h, 0, d], [h, 0, d]])} stroke={C.joint} strokeWidth={Math.max(.5, Math.min(1.1, 3 / d))} fill="none" />)}
      {[-1, 1].map(s => <polyline key={'g' + s} points={quad([[s * (h - .32), 0, d0], [s * (h - .32), 0, far]])} stroke={C.joint} strokeWidth="1" fill="none" />)}
      {/* 밤: 불 켠 가게 앞 · 초롱 아래 바닥에 번지는 빛 */}
      {night && U.filter(v => v.lit && v.a < 40).map(v => pool('p' + v.side + ':' + v.a, v.side * (h - .55), v.a1, v.b1))}
      {night && lanterns.map(d => pool('q' + d, 0, d - 1.4, d + 1.4, 1.6))}
      {/* 양쪽 벽: 위가 밝고 바닥 가까이 짙게 (미리 섞은 띠) · 맨 위 처마선 */}
      {[-1, 1].map(s => {
        const X = s * h, wc = C.wall[s < 0 ? 0 : 1];
        return <g key={'w' + s}>
          <polygon points={quad([[X, 0, d0], [X, 0, far], [X, top, far], [X, top, d0]])} fill={wc} />
          {WL.map(([y, t]) => <polygon key={y} points={quad([[X, 0, d0], [X, 0, far], [X, y, far], [X, y, d0]])} fill={mix(wc, C.ao, t * C.aoK)} />)}
          <polygon points={quad([[X, top - .16, d0], [X, top - .16, far], [X, top - .07, far], [X, top - .07, d0]])} fill={C.ao} opacity={C.aoA * 2} />
          <polygon points={quad([[X, top - .06, d0], [X, top - .06, far], [X, top, far], [X, top, d0]])} fill={C.cope} />
        </g>;
      })}
      {/* 가게: 움푹 들어간 문(안쪽 · 위 그늘 띠 · 먼 쪽 문틀) · 옅은 간판 · 차양(아랫면 + 앞 드림) */}
      {U.map(v => {
        const { side, X, Xi, a, b, a1, b1, k, lit } = v, aw = C.awn[k % C.awn.length], Xa = X - side * .75, dr = a1 * (h + .25) / h;
        return <g key={'u' + side + ':' + a}>
          <polygon points={quad([[X, 0, a1], [X, 0, b1], [X, 2.2, b1], [X, 2.2, a1]])} fill={lit ? u('lt') : u('op')} />
          {dr < b1 - .2 && <polygon points={quad([[X, 2.2, a1], [X, 2.2, b1], [Xi, 2.2, b1], [Xi, 2.2, dr]])} fill={C.soffit} />}
          {dr < b1 - .2 && <polygon points={quad([[X, 0, b1], [Xi, 0, b1], [Xi, 2.2, b1], [X, 2.2, b1]])} fill={C.jamb} />}
          <polygon points={quad([[X, 2.7, a + .2], [X, 2.7, b - .2], [X, 2.75, b - .2], [X, 2.75, a + .2]])} fill={C.ao} opacity=".1" />
          <polygon points={quad([[X, 2.75, a + .2], [X, 2.75, b - .2], [X, 3.2, b - .2], [X, 3.2, a + .2]])} fill={C.sign} />
          <polygon points={quad([[X, 2.55, a], [X, 2.55, b], [Xa, 2.25, b], [Xa, 2.25, a]])} fill={mix(aw, C.ao, night ? .12 : .22)} />
          <polygon points={quad([[Xa, 2.25, a], [Xa, 2.25, b], [Xa, 2.1, b], [Xa, 2.1, a]])} fill={aw} />
        </g>;
      })}
      {/* 멀수록 짙어지는 그늘 (벽 + 바닥) */}
      <polygon points={box} fill={u('deep')} />
      {/* 밤: 불 켠 가게 안쪽의 은은한 빛 · 문틀과 간판에 닿은 빛 */}
      {night && U.filter(v => v.lit).map(v => {
        const { side, X, Xi, a, b, a1, b1 } = v, dr = a1 * (h + .25) / h;
        return <g key={'l' + side + ':' + a}>
          <polygon points={quad([[X, 0, a1], [X, 0, b1], [X, 2.2, b1], [X, 2.2, a1]])} fill={u(side < 0 ? 'lgL' : 'lgR')} />
          {dr < b1 - .2 && <polygon points={quad([[X, 0, b1], [Xi, 0, b1], [Xi, 2.2, b1], [X, 2.2, b1]])} fill="#F0A85C" opacity=".16" />}
          <polygon points={quad([[X, 2.75, a + .2], [X, 2.75, b - .2], [X, 3.2, b - .2], [X, 3.2, a + .2]])} fill="#E8C9A0" opacity=".1" />
        </g>;
      })}
      {/* 물 (연습: 그 높이까지): 맑은 코발트 · 청록, 벽에 닿는 밝은 물금, 물결은 가는 빛줄 (빠르면 더 많고 길게) */}
      {ww > 0 && <g>
        {[-1, 1].map(s => <polygon key={'t' + s} points={quad([[s * h, 0, dn], [s * h, 0, far], [s * h, ww, far], [s * h, ww, dn]])} fill={C.wtint[0]} opacity={C.wtint[1]} />)}
        <polygon points={surf} fill={u('wat')} />
        {/* 낮: 벽 · 가게 · 차양 · 입구가 물에 옅게 비친다 (한 묶음을 한 번에 옅게 → 색이 틀어지지 않는다) */}
        {!night && <g clipPath={u('wc')} mask={u('wm')} opacity=".26">
          {[-1, 1].map(s => <polygon key={'mw' + s} points={quad([[s * h, ww, dn], [s * h, ww, far], [s * h, 2 * ww - top, far], [s * h, 2 * ww - top, dn]])} fill={C.wall[s < 0 ? 0 : 1]} />)}
          {U.map(v => <g key={'mu' + v.side + ':' + v.a}>
            <polygon points={quad([[v.X, ww, v.a1], [v.X, ww, v.b1], [v.X, 2 * ww - 2.2, v.b1], [v.X, 2 * ww - 2.2, v.a1]])} fill={C.open[0]} />
            <polygon points={quad([[v.X, 2 * ww - 3.2, v.a + .2], [v.X, 2 * ww - 3.2, v.b - .2], [v.X, 2 * ww - 2.75, v.b - .2], [v.X, 2 * ww - 2.75, v.a + .2]])} fill={C.sign} />
            <polygon points={quad([[v.X - v.side * .75, 2 * ww - 2.25, v.a], [v.X - v.side * .75, 2 * ww - 2.25, v.b], [v.X - v.side * .75, 2 * ww - 2.1, v.b], [v.X - v.side * .75, 2 * ww - 2.1, v.a]])} fill={C.awn[v.k % C.awn.length]} />
          </g>)}
          <polygon points={quad([[-h, ww, far], [h, ww, far], [h, 2 * ww - top, far], [-h, 2 * ww - top, far]])} fill={C.end} />
        </g>}
        <polygon points={surf} fill={u('deep')} />
        {/* 밤: 불 켠 가게가 물에 비친다 (물금 아래로 뒤집힌 빛) */}
        {night && U.filter(v => v.lit && v.a < 32).map(v => <polygon key={'r' + v.side + ':' + v.a} points={quad([[v.X, ww, v.a1], [v.X, ww, v.b1], [v.X, 2 * ww - 2.4, v.b1], [v.X, 2 * ww - 2.4, v.a1]])} fill={u('lgr')} />)}
        {[-1, 1].map(s => <polygon key={'m' + s} points={quad([[s * h, ww, dn], [s * h, ww, far], [s * h, ww + .03, far], [s * h, ww + .03, dn]])} fill={C.wline} opacity={night ? .5 : .85} />)}
        <g clipPath={u('wc')}>{waves}</g>
      </g>}
      {/* 골목 끝: 입구 밖이 밝다 (아치 = 입구 문) */}
      <polygon points={quad([[-h, ww, far], [h, ww, far], [h, top, far], [-h, top, far]])} fill={C.end} />
      <path d={gate} fill="none" stroke={C.arch} strokeWidth="1.3" strokeLinejoin="round" opacity=".9" />
      <circle cx={ec[0]} cy={ec[1]} r={night ? 72 : 64} fill={u('bloom')} />
      {/* 골목을 가로지르는 초롱 줄: 작은 따뜻한 점 + 부드러운 빛 */}
      {lanterns.map(d => {
        const a = P(-h, 3.35, d), b = P(h, 3.35, d), m = P(0, 2.95, d), r = Math.max(1.2, 22 / d);
        return <g key={'c' + d}>
          <path d={`M${a[0]} ${a[1]} Q${m[0]} ${2 * m[1] - a[1]} ${b[0]} ${b[1]}`} fill="none" stroke={C.str} strokeWidth={Math.max(.5, 4.5 / d)} />
          {[-.6, -.2, .2, .6].map((t, i) => {
            const x = a[0] + (b[0] - a[0]) * (t + 1) / 2, y = a[1] + (m[1] - a[1]) * (1 - t * t) + r * 1.25;
            return <g key={i}><circle cx={x} cy={y} r={r * (night ? 5.5 : 3.4)} fill={u('glow')} /><ellipse cx={x} cy={y} rx={r} ry={r * 1.2} fill={C.lamp} /></g>;
          })}
        </g>;
      })}
    </svg>
  );
}

// ── 배경데이터 카메라: 렌더가 있으면 원본 렌더, 없으면 임시 그림.
//    렌더 위에는 표를 붙이지 않는다(2026-11-22 그녀의 요청). 임시 그림 · 시험 장면일 때만 작은 표로 알린다
//    chipAt = 화면 가득일 때의 표 자리 · tag = 작은 썸네일의 표 자리(mini = 아이콘만)
//    원본 렌더는 375×780 무대에 이 화면과 같은 화각 · 내려다봄으로 그리고, 상자에 맞춰 같은 비율로 줄인다(겹친 길 · 이름표와 맞도록)
//    yaw = 바라보는 쪽(180 = 입구 쪽). 문 앞처럼 옆을 봐야 하는 단계만 바꾼다(MARKET.views)
// 화면 보정: 앱 화면에서만 아주 살짝(밝기 +4% · 대비 −5% · 채도 −8%). 렌더 파일과 증빙 장(evidence.html)은 원본 그대로
const AR_GRADE = 'brightness(1.04) contrast(.95) saturate(.92)';
// ── 물결 탭 카드 (나루의 모양). 탭(높은 곳) = 이름표, 물결이 지나간 골 = 조용한 동작 하나.
//    물결선(위쪽 윤곽)의 색 = 상태: calm 옅은 청화(백자 위의 청화 한 획) · real 빨강 · prac 초록 점선
function wavePath(w, h, tab, th, sw, r, dip, rec, top) {
  const f = n => +n.toFixed(2), b = th + dip, x1 = tab + sw, x2 = x1 + rec;
  const head = `M0 ${f(top ? r : h - r)}V${f(r)}A${r} ${r} 0 0 1 ${r} 0H${f(tab)}`
    + `C${f(tab + sw * .5)} 0 ${f(tab + sw * .56)} ${f(b)} ${f(x1)} ${f(b)}`
    + `C${f(x1 + rec * .42)} ${f(b)} ${f(x1 + rec * .5)} ${th} ${f(x2)} ${th}`
    + `H${f(w - r)}A${r} ${r} 0 0 1 ${w} ${f(th + r)}`;
  return top ? head : head + `V${f(h - r)}A${r} ${r} 0 0 1 ${f(w - r)} ${h}H${r}A${r} ${r} 0 0 1 0 ${f(h - r)}Z`;
}
function Wave({ tab, tr, children, fill, edge = 'calm', th = 44, sw = 92, rec = 76, r = 28, dip, glass, lift, float, className = '', style, bodyStyle, onClick, label, minTab = 96 }) {
  const ref = React.useRef(null), tref = React.useRef(null), [g, setG] = React.useState(null);
  React.useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const upd = () => {
      const w = el.offsetWidth, h = el.offsetHeight, tw = Math.max(minTab, tref.current ? tref.current.offsetWidth + 6 : minTab);
      const room = w - r - 6 - tw, k = Math.min(1, room / (sw + rec)), s = sw * k, c = rec * k;
      const dp = dip ?? Math.round(Math.max(8, Math.min(14, w * .04)));
      setG(o => (o && o.w === w && o.h === h && o.tw === tw ? o : { w, h, tw, s, c, d: wavePath(w, h, tw, th, s, r, dp, c), e: wavePath(w, h, tw, th, s, r, dp, c, true) }));
    };
    upd();
    const ro = new ResizeObserver(upd); ro.observe(el); if (tref.current) ro.observe(tref.current);
    return () => ro.disconnect();
  }, [th, sw, rec, r, dip, minTab]);
  const act = onClick ? { role: 'button', tabIndex: 0, onClick, onKeyDown: e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(e); } }, 'aria-label': label } : {};
  return (
    <div ref={ref} className={'ar-wv' + (glass ? ' glass' : '') + (lift ? ' lift' : '') + (float ? ' float' : '') + (onClick ? ' tap' : '') + (className ? ' ' + className : '')} style={style} {...act}>
      <div className="bg" style={g ? { clipPath: `path('${g.d}')` } : { opacity: 0 }}>{fill}</div>
      {g && <svg className="ln" viewBox={`0 0 ${g.w} ${g.h}`} aria-hidden="true"><path className="o" d={g.d} />{edge && <path className={'e ' + edge} d={g.e} />}</svg>}
      {tab && <div className="tab" ref={tref} style={{ height: th }}>{tab}</div>}
      {tr && g && <div className="tr" style={{ left: g.tw + g.s + g.c * .3, height: th - 4 }}>{tr}</div>}
      <div className="bd" style={{ paddingTop: th + 12, ...bodyStyle }}>{children}</div>
    </div>
  );
}

// ── 나루 v4 (백자 물방울 · 청화 물결 띠 · 등불, 참고 넷처럼 3D 한 가족): assets/mascot4/m4-<pose>.png
//    idle(손 흔들기) · lantern(등불) · ruler(자) · cheer(만세) · alert(진지한 얼굴 + 등불) · avatar. 그림이 아직 없으면 v3로.
const M4_FB = { idle: 'idle', lantern: 'guide', ruler: 'idle', cheer: 'happy', alert: 'worry', avatar: 'avatar' };
const M4_ALT = { rain: 'idle', supyo: 'ruler', learn: 'lantern' };
// 11/23 아침 3: 공공 서비스의 파랑과 결이 맞는 원래의 청화 물결 띠 v4를 다시 쓴다 (v5 민트는 보관)
const m3fb = pose => e => { const el = e.currentTarget; if (el.dataset.fb) return; el.dataset.fb = '3'; el.src = 'assets/mascot3/m3-' + (M4_FB[M4_ALT[pose] || pose] || 'idle') + '.png'; };
const Naru = ({ pose = 'idle', h = 120, style, float }) => <img className={'ar-naru' + (float ? ' ar-float' : '')} src={'assets/mascot4/m4-' + pose + '.png'} onError={m3fb(pose)} alt="" style={{ height: h, ...style }} />;
const NaruAvatar = ({ s = 28, style }) => <img src="assets/mascot4/m4-avatar.png" onError={m3fb('avatar')} alt="" style={{ width: s, height: s, borderRadius: '50%', display: 'block', flex: 'none', background: 'var(--brand-soft)', objectFit: 'cover', ...style }} />;
// 판 뒤의 큰 물방울 무늬 (흰 7%): 브랜드 상징을 은은하게
// 판 뒤의 자개 고리 (NARU HOME PLATE · PASS의 동심원): 흰 선 몇 겹, 빛을 받는 쪽만 살짝 무지갯빛
const DropWm = ({ w = 260, style }) => {
  const id = 'rw' + String(React.useId()).replace(/[^\w-]/g, '');
  return <svg className="ar-wm rings" width={w} height={w} viewBox="0 0 100 100" style={style} aria-hidden="true">
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".45" stopColor="#E8F7F0" /><stop offset=".62" stopColor="#F6E9F4" /><stop offset=".8" stopColor="#E4EEFA" /><stop offset="1" stopColor="#FFFFFF" /></linearGradient></defs>
    {[46, 38.5, 31, 24].map((r, k) => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke={`url(#${id})`} strokeWidth={k % 2 ? 1.1 : 2.2} />)}
  </svg>;
};

// ── 앱 골격 (2026-11-23 정리): 화면은 세로로 쌓는다 — 머리(색 판) → 몸(스크롤) → 발(단추) → 탭.
//    글자 크기를 키워도(5단계) 서로 밀어낼 뿐 겹치지 않는다. 3D 장면 화면만 색 판 · 단추가 장면 위에 뜬다(over · .ar-btns)
const Page = ({ children, className = '', style }) => <div className={'pg' + (className ? ' ' + className : '')} style={style}>{children}</div>;
// 몸: 스크롤 되는 곳. scroll = 캡처용 처음 스크롤 자리 (?ui={"scroll":600})
const Body = ({ children, className = '', style, flush, scroll }) => {
  const ref = React.useRef(null);
  React.useEffect(() => { if (scroll && ref.current) ref.current.scrollTop = +scroll; }, []);
  return <div ref={ref} className={'pg-body' + (flush ? ' flush' : '') + (className ? ' ' + className : '')} style={style}>{children}</div>;
};
const Foot = ({ children, row, clear, style }) => <div className={'pg-foot' + (row ? ' row' : '') + (clear ? ' clear' : '')} style={style}>{children}</div>;
// 색 판: tone = brand(평소 · 연습) · real(실제 경보). 맨 위 줄 = left(뒤로 · 상태 표 · 제목) … right(도구)
//   over = 3D 장면 위에 겹친다 · thin = 제목 줄만 · fill = 남은 높이를 다 채운다(시작 · 연결 · 연습 끝)
const Band = ({ tone = 'brand', left, right, children, over, round, slim, thin, fill, wm, bar = true, className = '', style }) => (
  <div className={'ar-band' + (tone === 'real' ? ' real' : '') + (round ? ' round' : '') + (over ? ' over' : '') + (slim ? ' slim' : '') + (thin ? ' thin' : '') + (fill ? ' fill' : '') + (className ? ' ' + className : '')} style={style}>
    {wm}
    {bar && <div className="bar">{left}<span className="sp" />{right}</div>}
    {children}
  </div>
);
const ArBack = ({ onClick, on, icon = 'chevron-left', label = '뒤로' }) => <button className={'ar-ib' + (on ? ' on' : '')} onClick={onClick} aria-label={label}><Ico name={icon} size={22} stroke={2} /></button>;
const ArTog = ({ on }) => <span className="ar-tog" aria-hidden="true" data-on={on ? '1' : '0'}><span /></span>;
const ArEx = () => <span className="ar-ex">예시</span>;
// 상태 표: 실제 경보(빨강 · 깜박이는 점) / 연습(점선 고리 · '실제 아님'을 늘 함께 쓴다)
const RealChip = ({ on }) => <span className={'ar-real' + (on ? ' on' : '')}><i />실제 경보</span>;
const PracChip = ({ on }) => <span className={'ar-prac' + (on ? ' on' : '')}><i />연습 · 실제 아님</span>;
// 소리로 읽기: 기기에 한국어 말하기가 있으면 그 문장을 읽는다(없으면 조용히 넘어간다). 두 손이 보행보조차에 있어도 들을 수 있게
const naruSay = text => { try { const S = window.speechSynthesis; if (!S || !text) return false; S.cancel(); const u = new SpeechSynthesisUtterance(String(text)); u.lang = 'ko-KR'; u.rate = .95; S.speak(u); return true; } catch (e) { return false; } };
const Replay = ({ on, text, toast }) => <button className={'ar-ib' + (on ? ' on' : '')} aria-label="소리로 다시 듣기" onClick={() => { const ok = naruSay(text); toast && toast(ok ? '소리로 읽어 드려요' : '이 휴대폰은 소리로 읽을 수 없어요'); }}><Ico name="volume-2" size={22} stroke={2} /></button>;
// 아래 탭 (KRDS 탭바: 5개 · 홈이 맨 왼쪽)
const NAV = [['eNow', 'house', '홈'], ['eMap', 'map', '지도'], ['eFind', 'route', '대피'], ['eLearn', 'book-open', '배우기'], ['ePlan', 'user-round', '내 정보']];
const ArNav = ({ go, cur, set }) => (
  <nav className="ar-nav" aria-label="메뉴">{NAV.map(([k, ic, l]) => <button key={k} aria-current={cur === k ? 'page' : undefined} onClick={() => { set && set({ mode: 'real', at: null }); go(k); }}><Ico name={ic} size={24} stroke={cur === k ? 2.3 : 1.8} />{l}</button>)}</nav>
);
// 글자 크기 5단계 (KRDS 화면 크기 조정): 작게 · 보통 · 조금 크게 · 크게 · 가장 크게 — 한 번에 한 칸씩
const FS5 = [['s', '작게'], ['m', '보통'], ['ml', '조금 크게'], ['l', '크게'], ['xl', '가장 크게']];
const FsStep = ({ st, set }) => {
  const i = Math.max(0, FS5.findIndex(f => f[0] === (st.fs || 'm')));
  return (
    <div className="ar-card fs-step" role="group" aria-label="글자 크기">
      <button className="sm" aria-label="글자 작게" disabled={i === 0} onClick={() => set({ fs: FS5[i - 1][0] })}>가</button>
      <div className="mid" aria-live="polite"><span className="nm">{FS5[i][1]}</span><div className="dots" aria-hidden="true">{FS5.map((f, k) => <i key={f[0]} className={k <= i ? 'on' : ''} />)}</div></div>
      <button className="lg" aria-label="글자 크게" disabled={i === FS5.length - 1} onClick={() => set({ fs: FS5[i + 1][0] })}>가</button>
    </div>
  );
};
// 하나만 고르는 묶음(radiogroup): 화살표로 옮기면 바로 고른다. Tab은 고른 것 하나에만 선다 (WAI-ARIA 라디오 묶음)
function radioKeys(e) {
  const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
  const all = Array.from(e.currentTarget.querySelectorAll('[role="radio"]:not([disabled])')), i = all.indexOf(document.activeElement);
  if (i < 0) return;
  e.preventDefault();
  const n = all[(i + d + all.length) % all.length]; n.focus(); n.click();
}
// 아래에서 올라오는 판 (확인 · 약관 보기)
function Sheet({ title, children, onClose, foot }) {
  const ref = React.useRef(null);
  // 열리면 판으로 초점을 옮기고, Esc로 닫는다. Tab은 판 안에서 돌고, 닫히면 열었던 단추로 초점을 돌려준다
  React.useEffect(() => {
    const opener = document.activeElement;
    if (ref.current) { try { ref.current.focus({ preventScroll: true }); } catch (e) { } }
    const f = e => {
      if (e.key === 'Escape') return onClose && onClose();
      if (e.key !== 'Tab' || !ref.current || e.defaultPrevented) return;
      const q = Array.from(ref.current.querySelectorAll('button:not([disabled]),a[href],input')); if (!q.length) return;
      const a = document.activeElement, first = q[0], last = q[q.length - 1], inside = ref.current.contains(a);
      if (!inside && a && a.closest && a.closest('.ov-sheet')) return;   // 나란히 보기(폰 두 대)는 판이 둘: 다른 판 안의 초점은 그 판이 돌린다
      if (!inside) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
      else if (e.shiftKey && (a === first || a === ref.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    };
    addEventListener('keydown', f);
    return () => { removeEventListener('keydown', f); try { opener && opener.focus && opener.focus({ preventScroll: true }); } catch (e) { } };
  }, []);
  return (
    <div className="ov" onClick={onClose}>
      <div className="ov-sheet" ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <div className="ov-grab" />
        <div className="ov-head"><h2 className="ar-t1">{title}</h2><button className="ar-ib bare" aria-label="닫기" onClick={onClose}><Ico name="x" size={22} stroke={2} /></button></div>
        <div className="ov-body">{children}</div>
        {foot && <div className="ov-foot">{foot}</div>}
      </div>
    </div>
  );
}

Object.assign(window, { AR, AR_VFOV, arP, arPts, arRoute, arSmooth, ArSketch, Wave, wavePath, Naru, DropWm, NaruAvatar,
  Page, Body, Foot, Band, ArBack, ArTog, ArEx, RealChip, PracChip, naruSay, Replay, NAV, ArNav, FS5, FsStep, Sheet, radioKeys });
