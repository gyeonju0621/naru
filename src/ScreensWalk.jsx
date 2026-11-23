// NARU · 직접 걸어 보기 (2026-11-23)
// 그녀의 말: "화면을 돌려서 옆도 보고 뒤도 보고 … 직접 걸어 볼 수 있고, 턱이나 그런 건 다른 색으로"
//            "갈 곳을 나루 타는 곳이라고 지정하지 말고 안전한 곳으로 나오는 걸 목적으로 … 몇 m인지만 … 화면이 안 보여"
//            "물이 올라오면 나가지 않아요가 아니라 … 높은 건물 입구로 안내 … 가장 높은 곳이 그래서 어딘데?"
// 가게 문(나무 마루 위) → 턱을 내려와 → 골목 → 안전한 곳(입구 밖, 또는 레벨에서 잰 높은 건물의 문). 1m마다 언리얼로 렌더한 장면을 이어 걷는다.
// 장면 위에는 길(민트 빛줄) · 위험(색 테두리) · 남은 거리(m) 하나만. 이름표로 장면을 가리지 않는다.
// 실제 경보의 말은 '…세요', 연습은 '…요'. 판의 색 = 지금의 상태(실제 경보 = 옅은 산호 + 빨간 알약 · 평소 · 연습 = 옅은 민트).

// 가게 턱의 높이(cm): 레벨의 마루 윗면 (risks3d.js가 없으면 잰 값 21)
const sillCm = () => Math.round((((window.NARU_RISKS3D || {}).sill || {}).h || .21) * 100);

// ── 걸을 계획: 출발 자리(기본 = 가게 문 W00)부터 · 걸어서 닿는 마지막 자리 · 그 뒤 바닥 길(문까지) · 도착해서 바라볼 곳
//   입구 밖 · 역 = P01까지(역은 그 뒤 골목 밖으로 더). 높은 건물 = 그 문 앞 마지막 걸음 자리 → 문
//   '다른 곳으로'를 고르면 지금 선 걸음 자리에서 다시 잰다 — 문이 뒤(가게 쪽)에 있으면 되돌아 걷는다
function walkPlan(safe, from = 'W00') {
  if (!WALK.pts.length || !safe) return null;
  const fi = Math.max(0, WALK.at(from)), f = WALK.pts[fi], P = id => WALK.pts[WALK.at(id)];
  if (safe.tall) {
    const door = { x: safe.doorX, y: safe.door };
    let end = fi;
    if (door.y < f.y) WALK.pts.forEach((q, i) => { if (i >= fi && q.y >= door.y + .4 && (q.floor || 0) < .1) end = i; });   // 입구 쪽으로 가며 문 바로 앞
    else for (let i = fi; i >= 0; i--) { const q = WALK.pts[i]; if ((q.floor || 0) < .1 && q.y <= door.y - .4) end = i; }        // 가게 쪽으로 되돌아가며 문 바로 앞
    if (end === fi) end = Math.max(0, Math.min(WALK.pts.length - 1, fi + (door.y < f.y ? 1 : -1)));                            // 한 칸은 걷는다
    const e = WALK.pts[end];
    const tail = [[e.x + (door.x - e.x) * .45, e.y + (door.y - e.y) * .5], [door.x - Math.sign(door.x - e.x) * .3, door.y]];
    return { kind: 'tall', from: f.id, to: e.id, tail, door: { x: door.x, y: door.y, z: 1.4 }, face: wBearing(door.x - e.x, door.y - e.y), fromY: f.y };
  }
  const e = P('P01'), arch = (window.NARU_RISKS3D || {}).arch || { x: -1.3, y: 9.6, z: 5.9 };
  return { kind: safe.outside ? 'outside' : 'exit', from: f.id, to: 'P01', tail: [], door: { x: e.x, y: e.y, z: 1.4 }, face: wBearing(arch.x - e.x, arch.y - e.y), arch, fromY: f.y };
}
// 걷는 순서대로(되돌아 걸으면 거꾸로) 바닥 점 + 문까지의 꼬리
function walkRoute(plan) {
  if (!plan) return [];
  const a = WALK.at(plan.from), b = WALK.at(plan.to), seg = WALK.pts.slice(Math.min(a, b), Math.max(a, b) + 1);
  return (a <= b ? seg : seg.reverse()).map(p => [p.x, p.y]).concat(plan.tail || []);
}
// 걸음 자리 id 중 길을 따라 s m 간 자리에 가장 가까운 것 (다른 곳으로 바꿀 때 출발 자리)
function walkNodeAt(plan, s) {
  if (!plan) return 'W00';
  const a = WALK.at(plan.from), b = WALK.at(plan.to), seg = WALK.pts.slice(Math.min(a, b), Math.max(a, b) + 1);
  const pts = a <= b ? seg : seg.reverse(); let acc = 0, best = pts[0];
  for (let k = 1; k < pts.length; k++) { acc += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y); if (acc <= s + .5) best = pts[k]; }
  return best.id;
}
const routeLen = R => R.reduce((n, p, i) => n + (i ? Math.hypot(p[0] - R[i - 1][0], p[1] - R[i - 1][1]) : 0), 0);
// 길 위로 내린 자리: s = 길을 따라 잰 거리(길 끝 너머는 그만큼 더), side = 걷는 쪽에서 본 왼쪽 · 오른쪽
function alongRoute(R, x, y) {
  let best = { d: 1e9 }, acc = 0;
  for (let k = 0; k < R.length - 1; k++) {
    const a = R[k], b = R[k + 1], L2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2, L = Math.sqrt(L2);
    const h0 = ((x - a[0]) * (b[0] - a[0]) + (y - a[1]) * (b[1] - a[1])) / Math.max(1e-6, L2), h = Math.max(0, Math.min(1, h0));
    const qx = a[0] + (b[0] - a[0]) * h, qy = a[1] + (b[1] - a[1]) * h, d = Math.hypot(x - qx, y - qy);
    if (d < best.d) {
      const tx = (b[0] - a[0]) / (L || 1), ty = (b[1] - a[1]) / (L || 1), lat = (x - qx) * -ty + (y - qy) * tx;
      const over = k === R.length - 2 && h0 > 1 ? (h0 - 1) * L : 0;                 // 길 끝(P01) 너머: 입구 밖 찻길
      best = { d, s: acc + h * L + over, lat: over ? 0 : lat };
    }
    acc += L;
  }
  return { s: best.s || 0, off: best.d, side: best.lat > .8 ? '왼쪽' : best.lat < -.8 ? '오른쪽' : '앞' };
}
// 가는 길의 위험 (만나는 순서): 레벨에서 찾은 것(MARKET.risks) — 가게 턱은 '발밑'
function walkHazards(safe, gait, R, fromY = MARKET.home.y) {
  return risksOn(safe, fromY).map(r => {
    const R3 = window.NARU_RISKS3D, sh = (R3 && (r.kind === 'sill' ? (R3.sill ? [R3.sill] : []) : R3.shapes[r.id])) || [];
    const an = sh[0] ? wShapeAnchor(sh[0]) : { fx: r.x, fy: r.y, x: r.x, y: r.y, z: .6 };
    const o = R.length > 1 ? alongRoute(R, an.fx, an.fy) : { s: Math.max(0, MARKET.home.y - r.y), side: riskSide(r.x), off: 0 };
    return { ...r, s: r.kind === 'sill' ? Math.min(1.2, o.s) : o.s, side: r.kind === 'sill' ? '발밑' : o.side, off: o.off || 0, an, sev: SEV_OF[r.kind] || 'amber',
      why: r.kind === 'sill' ? (gait === 'walk' ? '발이 걸리기 쉬워요' : '바퀴가 걸려요') : r.why };
  }).sort((a, b) => a.s - b.s);
}
const SEV_OF = { manhole: 'red', power: 'red', road: 'red', sill: 'amber', oil: 'amber', float: 'amber' };
// 길을 따라 s m 간 자리 (세계 좌표)
function routeAt(R, s) {
  let acc = 0;
  for (let k = 0; k < R.length - 1; k++) { const a = R[k], b = R[k + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (acc + L >= s) { const f = (s - acc) / (L || 1); return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; } acc += L; }
  return R.length ? R[R.length - 1] : [0, MARKET.home.y];
}
// 가게 문에서 갈 곳까지 길을 따라 잰 거리(m) — 걷는 장면이 없으면 null (그때는 지점 사이 거리)
const WDIST = {};
function walkDist(safe) { if (!safe) return null; if (safe.id in WDIST) return WDIST[safe.id]; const pl = walkPlan(safe); const d = pl ? routeLen(walkRoute(pl)) : null; if (WALK.pts.length) WDIST[safe.id] = d; return d; }
// 그 길의 걸음 자리마다 물 찬 장면이 다 있으면 그 수위로 걷는다(없으면 마른 골목)
function walkWater(plan, eye, w) {
  if (!plan || !w) return 0;
  const a = WALK.at(plan.from), b = WALK.at(plan.to);
  return WALK.pts.slice(Math.min(a, b), Math.max(a, b) + 1).every(p => wEye(p.id, eye, w) != null) ? w : 0;
}

// ── 3D 장면 한 장: 렌더가 있으면 직접 보는 장면(WorldView), 없으면 임시 그림
const WScene = React.memo(function WScene({ p = 'P03', eye = 140, w = 0, walk, interactive = true, children, fallbackNote = true, ...rest }) {
  const ready = usePanoReady(), [bad, setBad] = React.useState(false);
  const e = ready ? (walk ? wEye(walk.from, eye, walk.w || 0) : wEye(p, eye, w)) : null;
  const at = React.useMemo(() => (walk || e == null ? null : { id: p, eye: e, w }), [walk, p, e, w]);
  const wk = React.useMemo(() => (walk && e != null ? { ...walk, eye: e } : null), [walk, e]);
  const fail = React.useCallback(() => setBad(true), []);
  if (e == null) return <div className="ar-cam"><ArSketch eye={eye} water={w / 100} />{fallbackNote && <span className="ar-ph" style={{ left: 16, bottom: 104 }}><Ico name="image-off" size={15} stroke={2} />골목 사진을 불러오지 못했어요 · 그림으로 보여 드려요</span>}{children}</div>;
  // 이 폰에서 새 장면(WebGL 셰이더)을 못 돌리면: 원본 장면을 그대로 둘러보는 예전 뷰어로 (길 · 위험 표시 없이)
  if (bad) { const id = walk ? walk.from : p; return <div className="ar-cam"><div style={{ position: 'absolute', inset: 0, filter: PANO.test ? undefined : AR_GRADE }}><PanoView src={PANO.file(id, e, walk ? walk.w || 0 : w)} yaw0={rest.yaw0 ?? 180} pitch0={rest.pitch0 ?? -8} vfov={rest.vfov || AR_VFOV} interactive={interactive} testTag={false} /></div>{children}</div>; }
  return <div className="ar-cam"><WorldView at={at} walk={wk} interactive={interactive} vfov={AR_VFOV} onFail={fail} {...rest} />{children}</div>;
});
// 안전한 곳 표시 (장면 속): 민트 점 + 남은 거리(m)만. 화면 밖이면 가장자리에 방향과 거리
const distPin = (plan, m) => plan && ({ key: 'go', x: plan.door.x, y: plan.door.y, z: plan.door.z, edge: true, prio: 3, tone: 'go', min: 1.5,
  el: <span className="wv-dist"><i />{m != null ? `${m}m` : <em data-d="" />}</span> });
// 화면 안의 도구: 길 쪽으로 돌리기 · 폰 돌리기 (작은 둥근 단추)
const canGyro = () => typeof window !== 'undefined' && 'DeviceOrientationEvent' in window && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
function WTools({ ctl, follow, style, gyroOn, setGyro }) {
  return <div className="wv-tools" style={style}>
    {!follow && <button className="wv-tool" onClick={() => ctl.current && ctl.current.follow()}><Ico name="navigation-2" size={17} stroke={2.2} />길 쪽</button>}
    {canGyro() && <button className={'wv-tool round' + (gyroOn ? ' on' : '')} aria-label={gyroOn ? '폰 돌리기 끄기' : '폰을 돌려서 둘러보기'} onClick={() => { const c = ctl.current; if (!c) return; c.gyro(!gyroOn).then(v => setGyro(!!v)); }}><Ico name="smartphone" size={18} stroke={2.2} /></button>}
  </div>;
}
// 처음 몇 초: 둘러볼 수 있다고 알려 준다
// 자리: 아래 단추 위(bottom) — 휴대폰이 길어도 길의 끝(갈 곳 · 거리 칩)을 가리지 않는다. 장면이 좁으면(room) 나오지 않는다
function WHint({ follow, text = '끌어서 옆 · 뒤 둘러보기', top = 300, bottom, room = 999 }) {
  const [on, setOn] = React.useState(true);
  React.useEffect(() => { const t = setTimeout(() => setOn(false), 5000); return () => clearTimeout(t); }, []);
  if (!on || !follow) return null;
  if (room < 120) return null;
  return <span className="wv-hint" style={bottom != null ? { bottom } : { top }}><Ico name="move-horizontal" size={17} stroke={2.2} />{text}</span>;
}
// 걸은 만큼 (판 아래쪽의 한 줄): 위험 = 색 점, 끝 = 남은 거리
const WStrip = ({ s, len, hz, left }) => (
  <div className="wv-strip" aria-hidden="true">
    <i className="tr" /><i className="fl" style={{ width: Math.min(100, s / Math.max(1, len) * 100) + '%' }} />
    {hz.filter(h => h.kind !== 'sill' && h.s <= len + 1.5 && Math.abs(h.s - s) > len * .035).map(h => <i key={h.id} className={'dot ' + h.sev + (h.s < s - .3 ? ' past' : '')} style={{ left: Math.min(100, h.s / Math.max(1, len) * 100) + '%' }} />)}
    <i className="me" style={{ left: Math.min(100, s / Math.max(1, len) * 100) + '%' }} />
    <span className="end">{left}m</span>
  </div>
);

// 장면 위의 색 판은 글자 크기를 키우면 함께 커진다. 이름표 · 알림이 그 밑으로 숨지 않게 판의 높이를 잰다(잴 수 없으면 어림값)
function useBandH(fallback) {
  const [h, setH] = React.useState(fallback), [H, setHH] = React.useState(780), mark = React.useRef(null);
  React.useLayoutEffect(() => {
    const host = mark.current && mark.current.parentElement, band = host && host.querySelector('.ar-band.over');
    if (!band) return;
    const box = band.offsetParent || host;      // 휴대폰 화면(실제 폰은 640~930, 틀은 780)
    const m = () => { const n = Math.round(band.offsetHeight); if (n > 0) setH(v => (Math.abs(n - v) > 1 ? n : v)); const hh = Math.round(box.clientHeight); if (hh > 0) setHH(v => (Math.abs(hh - v) > 1 ? hh : v)); };
    m(); if (!window.ResizeObserver) return;
    const o = new ResizeObserver(m); o.observe(band); o.observe(box); return () => o.disconnect();
  }, []);
  return [h, <i ref={mark} hidden />, H];
}

// ── 홈 · 대피 길의 작은 장면 (움직이지 않는 사진 한 장): 가게 앞에서 입구 쪽, 바닥의 민트 길
function ThumbScene({ safe, g }) {
  const R = React.useMemo(() => walkRoute(walkPlan(safe)), [safe && safe.id]);
  return <WScene p="P03" eye={GAITS[g].eye} interactive={false} route={R} yaw0={safe && safe.tall ? 200 : 180} pitch0={-11} vfov={46} fallbackNote={false} />;
}
// ── 경보 · 연습 결과의 장면: 가게 앞(P03)에서 입구 쪽. 끌어서 옆 · 뒤를 볼 수 있고, 길 · 위험 · 남은 거리는 제자리에
function AlertScene({ safe, g, w = 0, toolsBottom = 228 }) {
  const plan = React.useMemo(() => (safe ? walkPlan(safe) : null), [safe && safe.id]);
  const R = React.useMemo(() => walkRoute(plan), [plan]);
  const hz = React.useMemo(() => (safe ? walkHazards(safe, g, R) : []), [safe && safe.id, g, R]);
  const marks = React.useMemo(() => wHazards(hz), [hz]);
  const ctl = React.useRef(null), [f, setF] = React.useState(true), [gy, setGy] = React.useState(false);
  const onProgress = React.useCallback(p => setF(v => (v === p.follow ? v : p.follow)), []);
  const pins = React.useMemo(() => (plan ? [distPin(plan, Math.round(routeLen(R)))] : []), [plan, R]);
  const [bandH, mark, scrH] = useBandH(272);
  return <>
    {mark}
    <WScene p="P03" eye={GAITS[g].eye} w={w} ctl={ctl} route={R} hazards={marks} pins={pins} yaw0={safe && safe.tall ? 200 : 180} pitch0={-8} padTop={bandH + 12} padBottom={toolsBottom + 52} onProgress={onProgress} />
    <WHint follow={f} bottom={toolsBottom} room={scrH - bandH - toolsBottom} />
    <WTools ctl={ctl} follow={f} gyroOn={gy} setGyro={setGy} style={{ bottom: toolsBottom }} />
  </>;
}
// ── 물 높이 재기: 가게 앞(P03)에서 입구 쪽 3.3m · 오른쪽 0.5m에 선 자(전과 같은 자리), 못 가는 높이는 골목을 가로지르는 점선
function WaterScene({ B, g, eye, stop }) {
  const p3 = WALK.pts[WALK.at('P03')] || { x: .1, y: 62.4 }, G = { x: p3.x - .5, y: p3.y - 3.3 };
  const ticks = WATER_BANDS.filter(x => x.m > B.m + .01);
  const lines = [
    { key: 'stop', a: [-5.7, G.y, stop], b: [4.0, G.y, stop], w: 2.4, dash: '7 5', color: '#FFB114' },
    ticks.length ? { key: 'rod', a: [G.x, G.y, B.m], b: [G.x, G.y, ticks[ticks.length - 1].m], w: 1.5 } : null,
    ...ticks.map(x => ({ key: 't' + x.m, a: [G.x - .07, G.y, x.m], b: [G.x + .07, G.y, x.m], w: 2 })),
    B.m > 0 ? { key: 'lvl', a: [G.x, G.y, 0], b: [G.x, G.y, B.m], w: 3 } : null,
    B.m > 0 ? { key: 'top', a: [G.x - .09, G.y, B.m], b: [G.x + .09, G.y, B.m], w: 2.6 } : null,
  ].filter(Boolean);
  const pins = [
    B.m > 0 ? { key: 'lv', x: G.x, y: G.y, z: B.m, anchor: 'r', prio: 3, dy: Math.abs(B.m - stop) > .01 && Math.abs(B.m - stop) < .25 ? (B.m > stop ? -10 : 10) : 0, el: <span className="ar-mlab">{bodyFor(B, g)} {Math.round(B.m * 100)}cm</span> } : null,
    { key: 'stop', x: G.x + 1.7, y: G.y, z: stop, anchor: 'up', prio: 2, el: <span className="ar-mlab stop"><Picto name={GPICT_W[g]} size={17} color="currentColor" />혼자 못 가는 높이<ArEx /></span> },
  ].filter(Boolean);
  const ctl = React.useRef(null), [f, setF] = React.useState(true), [gy, setGy] = React.useState(false);
  const [bandH, mark, scrH] = useBandH(206);
  return <>
    {mark}
    <WScene p="P03" eye={eye} w={Math.round(B.m * 100)} ctl={ctl} lines={lines} pins={pins} yaw0={180} pitch0={-12} padTop={bandH + 20} padBottom={330} onProgress={p => setF(v => (v === p.follow ? v : p.follow))} />
    <WHint follow={f} top={bandH + 32} room={scrH - bandH - 282 - 50} text="끌어서 물 높이 둘러보기" />
    <WTools ctl={ctl} follow={f} gyroOn={gy} setGyro={setGy} style={{ bottom: 282 }} />
  </>;
}
const GPICT_W = { walk: 'walk', aid: 'walker', wheel: 'wheel' };

// ─ 3. 길 안내 (직접 걷기): 판 = 지금 할 일 한 문장 · 장면 = 끌어서 둘러보기 · 단추 = 걷기/멈추기
function EGuide({ go, st, set, night, ui = {}, pop, toast }) {
  const g = eGait(st), drill = eDrill(st), safe = eSafe(st), real = !drill, eye = GAITS[g].eye;
  // 출발 자리: 기본은 가게 문. '다른 곳으로'에서 새 곳을 골랐으면 그때 선 걸음 자리
  const from0 = st.walkFrom && WALK.at(st.walkFrom) >= 0 ? st.walkFrom : 'W00';
  const plan = React.useMemo(() => walkPlan(safe, from0), [safe.id, from0]);
  const R = React.useMemo(() => walkRoute(plan), [plan]);
  const len = React.useMemo(() => routeLen(R), [R]);
  // 가게 턱은 가게 마루에서 출발할 때만 (골목 가운데에서 '다른 곳으로' 다시 떠나면 이미 내려온 턱을 또 말하지 않는다)
  const hz = React.useMemo(() => { const onDeck = !plan || ((WALK.pts[WALK.at(plan.from)] || {}).floor || 0) > .1; return walkHazards(safe, g, R, plan ? plan.fromY : MARKET.home.y).filter(h => h.kind !== 'sill' || onDeck); }, [safe.id, g, R, plan]);
  const marks = React.useMemo(() => wHazards(hz), [hz]);
  const walkLen = React.useMemo(() => { if (!plan) return 0; const a = WALK.at(plan.from), b = WALK.at(plan.to); return Math.abs(WALK.pts[b].s - WALK.pts[a].s); }, [plan]);
  // 연습에서 물 높이를 골랐으면, 그 길의 물 찬 장면이 있을 때 그 물속을 걷는다
  const ww = React.useMemo(() => walkWater(plan, eye, drill ? Math.round(eLevel(st) * 100) : 0), [plan, eye, drill, st.lv]);
  // 도착한 채로 여는 때: 캡처(ui.arrived) · 걸을 길이 없을 때(입구에 서서 역으로) · 다 걸은 뒤 '다른 곳으로'에 갔다가 그냥 돌아왔을 때
  const arr0 = !!ui.arrived || (!!plan && (len < .5 || (st.walkS != null && +st.walkS >= walkLen - .6)));
  // 시작 자리 · 시선은 이 화면이 열릴 때 한 번만 정한다 (조심할 곳에서 왔으면 그 앞 3.5m, '다른 곳으로' 화면에서 그냥 돌아왔으면 멈춘 자리)
  const S0 = React.useRef(null);
  if (!S0.current) {
    const focus = st.rkFocus ? hz.find(h => h.id === st.rkFocus) : null;
    // 캡처용: ?ui={"walkS":12,"look":180,"arrived":1,"hold":1,"autoplay":1}
    const capS = ui.walkS != null ? Math.max(0, Math.min(walkLen, +ui.walkS)) : null;
    const back = st.walkS != null ? Math.max(0, Math.min(walkLen, +st.walkS)) : null;
    const s = focus ? Math.max(0, Math.min(walkLen, focus.s - 3.5)) : capS != null ? capS : back != null ? back : 0;
    let v = { yaw: 180, pitch: -8 };
    if (plan && WALK.pts.length) {
      const a = WALK.at(plan.from), dir = WALK.at(plan.to) >= a ? 1 : -1, n0 = WALK.pts[a], n1 = WALK.pts[a + dir] || n0;
      let k = a; while (WALK.pts[k + dir] && WALK.pts[k + 2 * dir] && Math.abs(WALK.pts[k + dir].s - n0.s) <= s + .01) k += dir;
      const n = WALK.pts[k], nx = WALK.pts[k + dir] || n;
      if (focus) {                                     // 그 물건 쪽, 그 물건의 높이로
        const d = Math.max(1, Math.hypot(focus.an.fx - n.x, focus.an.fy - n.y));
        v = { yaw: wYaw(wBearing(focus.an.fx - n.x, focus.an.fy - n.y)), pitch: Math.max(-30, Math.min(25, Math.atan2(focus.an.z * .6 - eye / 100, d) * 180 / Math.PI)) };
      } else if (arr0) v = { yaw: wYaw(plan.face), pitch: plan.kind === 'tall' ? 8 : -2 };   // 도착한 모습
      else if (s > 0) v = { yaw: wYaw(wBearing(nx.x - n.x, nx.y - n.y)) + (+ui.look || 0), pitch: ui.pitch != null ? +ui.pitch : -9 };
      else v = { yaw: wYaw(wBearing(n1.x - n0.x, n1.y - n0.y)), pitch: plan.from === 'W00' ? -24 : -9 };   // 첫 장면: 문 앞 마루에서는 발밑의 턱이 보이게, 골목 가운데서는 가는 쪽
    }
    S0.current = { s, yaw: v.yaw, pitch: v.pitch, focus: focus ? focus.id : null };
  }
  // 조심할 곳의 표시는 한 번 쓰고 지운다(다음 경보의 길 안내가 그 자리에서 시작하지 않게). 돌아갈 곳(from · rkMode)은 남긴다
  React.useEffect(() => { if (st.rkFocus) set({ rkFocus: null }); }, []);
  const ctl = React.useRef(null);
  const [play, setPlay] = React.useState(false), [arrived, setArrived] = React.useState(arr0), [gyro, setGyro] = React.useState(false);
  const [pg, setPg] = React.useState(() => { const q = routeAt(R, S0.current.s); return { s: S0.current.s, follow: true, y: q[1], stalled: false }; });
  const onProgress = React.useCallback(p => setPg(o => (Math.abs(o.s - p.s) > .25 || o.follow !== p.follow || p.playing !== o.playing || !!p.stalled !== o.stalled ? { s: p.s, follow: p.follow, playing: p.playing, y: p.cam ? p.cam.y : o.y, stalled: !!p.stalled } : o)), []);
  const onArrive = React.useCallback(() => { setPlay(false); setArrived(true); setTimeout(() => ctl.current && plan && ctl.current.face(plan.face, plan.kind === 'tall' ? 8 : -2), 60); }, [plan]);
  // 시연 · 캡처용: ?ui={"autoplay":1} 이면 열리자마자 걷기 시작
  React.useEffect(() => { if (!ui.autoplay) return; const t = setTimeout(() => { if (ctl.current) ctl.current.play(); setPlay(true); }, 700); return () => clearTimeout(t); }, []);
  // 3D 장면을 못 쓰는 폰(예전 뷰어 · 임시 그림)에서도 걷기 · 한 문장 · 도착이 돌아가게: 1.25m/s로 길을 따라 셈만 한다
  React.useEffect(() => {
    if (!play || ctl.current || arrived) return;
    let s = pg.s, last = performance.now();
    const id = setInterval(() => {
      const now = performance.now(); s = Math.min(len, s + (now - last) / 1000 * 1.25); last = now;
      const q = routeAt(R, s); setPg(o => ({ ...o, s, y: q[1] }));
      if (s >= len - 1e-3) { clearInterval(id); onArrive(); }
    }, 150);
    return () => clearInterval(id);
  }, [play]);
  const say = (r, p) => (real ? r : p);
  const out = safe.outside, extra = safe.extra || 0, tall = !!safe.tall;
  // 판이 말하는 위험 = 걷는 줄에서 3m 안의 것(턱 · 맨홀 · 문 옆 냉동고)과 찻길. 벽 쪽의 것은 장면 속 색 테두리로 (판이 쉴 새 없이 바뀌지 않게)
  const said = React.useMemo(() => hz.filter(h => h.kind === 'sill' || h.kind === 'road' || h.off <= 3.2), [hz]);
  const ahead = said.filter(h => h.s > pg.s - .6);
  // 조심할 곳에서 '그 자리 걸어서 보기'로 왔으면: 걷기 전에는 그것의 이름과 할 일을 판에 (벽 쪽 물건이라도)
  const shown = S0.current.focus && !play && Math.abs(pg.s - S0.current.s) < .6 ? hz.find(h => h.id === S0.current.focus) : null;
  const cur = shown || ahead.find(h => h.s - pg.s < 9);
  const left = Math.max(0, Math.round(len - pg.s));
  const back = () => { if (st.from === 'risk') { set({ mode: st.rkMode || st.mode, from: null, rkMode: null }); return go('eRisk'); } if (!drill && st.from === 'wait') { set({ arrived: st.waitAt || 's0', dest: st.waitAt || 's0', from: null, waitAt: null, walkFrom: null, walkS: null, detourAt: null, detourFrom: null }); return go('eNow'); }   // 기다리던 곳에서 떠났으면 그 화면으로
    if (drill && st.from === 'drill') return go('eNow');   // 연습 경보에서 왔으면 그 화면으로
    if (drill && (st.from === 'now' || st.from === 'find' || st.from === 'map')) { set({ mode: 'real', from: null }); return go(st.from === 'find' ? 'eFind' : st.from === 'map' ? 'eMap' : 'eNow'); } go(drill ? 'eWater' : 'eNow'); };
  const toggle = () => { const c = ctl.current; if (play) { c && c.pause(); setPlay(false); } else { c && c.play(); setPlay(true); } };
  // 다른 곳으로: 길이 막혔거나 힘들면 — 지금 선 자리에서 가까운 다른 안전한 곳 · 도움 요청 화면으로 (그냥 돌아오면 여기서 이어 걷는다)
  const detour = () => { const c = ctl.current; c && c.pause(); setPlay(false); set({ walkS: Math.round(pg.s * 100) / 100, detourAt: walkNodeAt(plan, pg.s), detourFrom: 'guide' }); go('eDetour'); };
  // 다 왔을 때: 실제 경보에서 입구 밖이면 곧장 기다리는 화면으로(같은 말을 두 번 보이지 않는다). 높은 건물 · 연습은 도착 화면으로
  const done = () => { const clear = { rkFocus: null, from: null, waitAt: null, rkMode: null, at: null, walkS: null, walkFrom: null, detourAt: null, detourFrom: null };
    if (real && plan && plan.kind === 'exit') { set({ ...clear, arrived: safe.id, step: 0 }); return go('eNow'); }
    set(clear); go('eArrive'); };
  // 판의 한 문장 (작게 · 짧게): 지금 할 일 하나와 거리 하나
  let kick, ksev = null, kico = null, title;
  // 높은 건물: 걷는 장면은 문 3~6m 앞에서 끝난다. 그 남은 길(문 옆 냉동고 등)의 위험은 도착 문장에 넣는다
  const tailHz = arrived && tall ? said.find(h => h.kind !== 'sill' && h.s > pg.s - .6 && h.s <= len + 2) : null;
  if (arrived) {
    ksev = tall && tailHz ? tailHz.sev : null;
    kick = tall ? <>{placeName(safe)}{left > 1 ? ` · 문까지 ${left}m` : ''}</> : out ? <>입구 · 역까지 {extra}m 더<ArEx /></> : <>입구 밖 · 안전한 곳 도착</>;
    kico = !tall && !out ? 'circle-check' : null;
    title = tall ? (tailHz ? say(`${tailHz.label}에서 떨어져 문으로 들어가세요`, `${tailHz.label}에서 떨어져 문으로 들어가요`) : say('문으로 들어가세요', '문으로 들어가요'))
      : out ? say('입구를 지나 역으로 가세요', '입구를 지나 역으로 가요')
      : say('찻길에서 떨어져 기다리세요', '찻길에서 떨어져 기다려요');   // 물이 들면 갈 높은 건물은 다음(기다리는) 화면이 이름 · 거리 · 단추로 알려 준다
  } else if (cur) {
    const d = Math.max(1, Math.round(cur.s - pg.s));
    ksev = cur.sev;
    kick = <>{cur.side === '발밑' ? '발밑' : `${d}m 앞` + (cur.side === '앞' ? '' : ` ${cur.side}`)} · {cur.kind === 'sill' ? `가게 턱 ${sillCm()}cm` : cur.label}</>;
    title = cur.kind === 'sill' ? say('가게 앞 턱을 조심해서 내려가세요', '가게 앞 턱을 조심해서 내려가요') : real ? cur.act[0] : cur.act[1];
  } else {
    kick = out ? <>입구까지 {left}m</> : <>안전한 곳까지 {left}m</>;
    title = tall ? say(`${ro(safe.short)} 가세요`, `${ro(safe.short)} 가요`)
      : left > 14 ? say('입구 쪽으로 곧장 가세요', '입구 쪽으로 곧장 가요')
      : out ? say('입구를 지나 역으로 가세요', '입구를 지나 역으로 가요') : say('아치를 지나 밖으로 나가세요', '아치를 지나 밖으로 나가요');
  }
  const emph = tailHz ? tailHz.id : cur && cur.s - pg.s < 5 ? cur.id : null;
  // 거리 칩: 갈 곳의 문(남은 m). 입구 밖에 닿으면 칩을 거둔다(0m — 다른 건물의 거리를 같은 모양으로 보이지 않는다)
  const pins = React.useMemo(() => (!plan || (arrived && plan.kind !== 'tall') ? [] : [distPin(plan, left)]), [plan, left, arrived]);   // 역으로 갈 때도 입구에서는 거둔다(역은 258m 더 — 판이 말한다)
  // 걸을 길이 없으면(입구에 서서 역으로 갈 때) 걷는 장면 대신 그 자리의 장면 한 장
  const walkProp = React.useMemo(() => (plan && len >= .5 ? { from: plan.from, to: plan.to, w: ww } : null), [plan, ww, len]);
  const doneLabel = drill ? '다 걸었어요' : out ? '역에 도착했어요' : tall ? '건물에 들어왔어요' : '안전한 곳에 왔어요';
  if (!kico && ksev) kico = ksev === 'red' ? 'triangle-alert' : 'circle-alert';
  const voice = st.voice === true;   // 자동으로 읽기는 켠 사람에게만
  // 소리로 읽기(내 정보에서 켠 경우): 걷는 동안 문장이 바뀌면 읽는다 — 두 손이 보행보조차에 있어도 들리게
  React.useEffect(() => { if (voice && !ui.still && (play || arrived)) naruSay(title); }, [title, play, arrived]);
  const [bandH, mark, scrH] = useBandH(198);
  return (
    <>
      {mark}
      <WScene walk={walkProp} p={plan && len < .5 ? plan.from : 'P03'} eye={eye} ctl={ctl} route={R} hazards={marks} pins={pins} emph={emph}
        yaw0={S0.current.yaw} pitch0={S0.current.pitch} startS={S0.current.s} speed={1.25} hold={!!ui.hold} padTop={bandH + 28} padBottom={156} onProgress={onProgress} onArrive={onArrive} label="1913 송정역시장 골목을 걸어 보는 장면" />
      <Band tone={real ? 'real' : 'brand'} over round slim left={<><ArBack on onClick={back} />{drill ? <PracChip on /> : <RealChip on />}</>} right={<Replay on text={title} toast={toast} />}>
        <div className="ar-in" key={arrived ? 'a' : cur ? cur.id : 'g'} aria-live="assertive">
          <p className={'wv-kick ' + (ksev || (kico ? 'ok' : 'plain'))}>{kico ? <Ico name={kico} size={19} stroke={2.4} /> : null}<span>{kick}</span></p>
          <h1 className="ar-h2">{title}</h1>
        </div>
        <WStrip s={pg.s} len={len} hz={said} left={left} />
      </Band>
      <WHint follow={pg.follow} bottom={100} room={scrH - bandH - 100} />
      {play && pg.stalled && <span className="wv-hint" style={{ bottom: 152 }}><Ico name="loader" size={17} stroke={2.2} />다음 장면을 불러오고 있어요</span>}
      <WTools ctl={ctl} follow={pg.follow} gyroOn={gyro} setGyro={setGyro} style={{ bottom: 100 }} />
      <div className="ar-btns row">
        <button className="ar-btn sec flex0" onClick={detour}>다른 곳으로</button>
        {arrived ? <button className="ar-btn" onClick={done}>{doneLabel}</button>
          : <button className="ar-btn" onClick={toggle}><Ico name={play ? 'pause' : 'footprints'} size={20} stroke={2.2} />{play ? '멈추기' : pg.s > .3 ? '이어 걷기' : '걷기 시작'}</button>}
      </div>
    </>
  );
}

// ─ 다른 곳으로 (11/23 그녀의 말: '못 가겠어요 말고 다른 화면으로 계속 하는 거'): 길이 막혔거나 힘들 때 멈추지 않고 이어 간다
//   ① 지금 선 자리에서 가까운 다른 안전한 곳(걷는 길로 잰 거리) — 고르면 여기서부터 다시 걷는다  ② 그래도 어려우면 119 (시제품: 걸리지 않음)
//   혼자 못 가는 물(도움이 필요한 때)이면 차례를 바꾼다: 도움 받기(119)가 먼저, 다른 안전한 곳이 그 아래
function EDetour({ go, st, set, pop, ui = {} }) {
  const g = eGait(st), drill = eDrill(st), real = !drill, say = (r, p) => (real ? r : p);
  const at = st.detourAt && WALK.at(st.detourAt) >= 0 ? st.detourAt : 'W00', here = WALK.pts[WALK.at(at)] || { y: MARKET.home.y };
  const D = eDecide(st), help = D.act === 'help', guide = st.detourFrom === 'guide';
  // 표: 길 안내에서 왔으면 그때 가던 곳, 경보 · 물 높이 화면에서 왔으면 거기서 안내한 곳
  const cur = guide ? st.dest : D.best && D.best.id;
  const rows = React.useMemo(() => MARKET.safe.filter(s => !s.outside || s.example).map(s => {
    const pl = walkPlan(s, at), d = pl ? Math.round(routeLen(walkRoute(pl))) + (s.extra || 0) : null;
    const ok = !(s.exit || s.outside) || D.now <= 0;                       // 물이 들어왔으면 밖으로는 보내지 않는다(높은 건물로)
    return { ...s, d, ok, n: risksOn(s, here.y).length };                  // 가게 턱은 가게 문에서 떠날 때만 들어 있다(risksOn)
  }).filter(s => s.d != null && s.d >= 1).sort((a, b) => (b.ok - a.ok) || a.d - b.d), [at, D.now]);   // 이미 서 있는 곳(0m)은 다시 권하지 않는다
  const pick = s => { set({ dest: s.id, walkFrom: at, walkS: null, detourAt: null, rkFocus: null, from: drill && st.detourFrom === 'now' ? 'drill' : drill && st.detourFrom === 'water' ? 'water' : st.from }); go('eGuide'); };
  const back = () => { set({ detourAt: null }); go(guide ? 'eGuide' : st.detourFrom === 'water' ? 'eWater' : 'eNow'); };
  // 줄의 둘째 줄: 한 줄에 들어가게 짧게 (표가 붙은 줄은 높이를 뺀다)
  const subOf = s => (!s.ok ? <>물이 들어와 못 가요{s.example ? <ArEx /> : null}</>
    : s.tall ? (s.id === cur ? `조심할 곳 ${s.n}곳` : `높이 ${s.h}m` + (s.n ? ` · 조심할 곳 ${s.n}곳` : ''))
    : s.exit ? '골목 밖으로' : <>입구 밖으로 {s.extra}m 더<ArEx /></>);
  const places = rows.map(s => <PlaceRow key={s.id} s={s} real={real} ok={s.ok} tag={s.id === cur ? (guide ? '가던 곳' : '안내한 곳') : null} sub={subOf(s)} dist={s.d} onClick={pick} />);
  const helpCard = (
    <div className="ar-card list hp">
      <button type="button" className="ar-li" onClick={() => pop && pop({ k: 'call', n: '119' })}>
        <span className="ar-gt red"><Ico name="phone" size={22} stroke={2} /></span>
        <span className="tx"><span className="t">119에 전화{drill ? ' (연습)' : ''}</span><span className="s">말할 위치를 보여 드려요</span></span>
        <span className="gt"><Ico name="chevron-right" size={20} stroke={2} /></span>
      </button>
      <button type="button" className="ar-li" onClick={() => pop && pop({ k: 'sms' })}>
        <span className="ar-gt"><Ico name="message-square" size={22} stroke={2} /></span>
        <span className="tx"><span className="t">문자로 119 신고{drill ? ' (연습)' : ''}</span><span className="s">말하기 어려울 때 · 위치도 보내요</span></span>
        <span className="gt"><Ico name="chevron-right" size={20} stroke={2} /></span>
      </button>
    </div>
  );
  return (
    <Page>
      <Band tone={real ? 'real' : 'brand'} round left={<><ArBack on onClick={back} />{drill ? <PracChip on /> : <RealChip on />}</>}>
        <div className="ar-in">
          <p className="ar-c">{at === 'W00' ? '지금 있는 곳 · 가게 문 앞' : Math.round(here.y) < 1 ? '지금 있는 곳 · 입구 밖' : `지금 있는 곳 · 입구에서 ${Math.round(here.y)}m 안쪽`}</p>
          <h1 className="ar-h1">{help ? say(<>혼자 가기 어려우면 <b>도움</b>을 받으세요</>, <>혼자 가기 어려우면 <b>도움</b>을 받아요</>)
            : say(<>가까운 <b>다른 안전한 곳</b>으로 가세요</>, <>가까운 <b>다른 안전한 곳</b>으로 가요</>)}</h1>
          <p className="ar-b2">{help ? say('119에 알리거나 갈 곳을 고르세요', '119에 알리거나 갈 곳을 골라요') : say('한 곳을 고르세요 · 여기서부터 다시 안내해요', '고르면 여기서부터 다시 안내해요')}</p>
        </div>
      </Band>
      <Body scroll={ui.scroll}>
        {help ? <><h2 className="ar-sec">도움 받기</h2>{helpCard}<h2 className="ar-sec">다른 안전한 곳</h2>{places}</>
          : <>{places}<h2 className="ar-sec">그래도 어려우면</h2>{helpCard}</>}
      </Body>
    </Page>
  );
}

Object.assign(window, { sillCm, walkPlan, walkRoute, walkNodeAt, routeLen, alongRoute, walkHazards, routeAt, walkDist, walkWater, SEV_OF, WScene, distPin, WTools, WHint, WStrip, canGyro, useBandH, ThumbScene, AlertScene, WaterScene, EGuide, EDetour });
