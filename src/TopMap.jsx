// NARU · 우리 시장 지도 (2026-11-23) — 배경데이터 레벨을 45m 위에서 곧장 내려다본 원본 렌더(spec_top, P02 위 · 90° 화각) 위에
// 레벨에서 잰 자리로 길 · 안전한 곳 · 위험 · 물 높이를 겹친다. 렌더 파일은 그대로(앱에는 1600px 사본 assets/map/top45.jpg).
// 좌표: 앱의 x(들어가는 방향 오른쪽 +) · y(입구 P01에서 안쪽 +). 사진에서는 위 = 입구 쪽, 왼쪽 = x +.
//   1600px = 90m (45m 높이 × tan45° × 2). 맨홀 두 곳(r1 · r8)과 건널목(r12)이 사진의 자리와 맞는 것을 확인했다.
// 11/23 아침(화면을 재어 고친 것):
//   · 이름표의 글자는 화면에서 19 / 15px로(그려진 크기를 재어 맞춘다 · 글자 크기 5단계를 따른다), 번호표의 숫자는 15px
//   · 그리는 차례: 길 → 안전한 곳 표 → 위험 → 내 가게 → 이름표. 위험은 표에 가려지지 않고, 이름표는 위험을 덮으면 아래로 비킨다
//   · 위험의 모양: 세모 = 빠짐 · 감전, 동그라미 = 걸림 · 미끄럼 (색만으로 말하지 않는다)
//   · 안전한 곳 표는 누를 수 있으면 단추(자판 · 화면 읽기 프로그램)이고, 누를 자리는 45px
//   · 이름표는 지도 밖으로 나가지 않는다: 글자를 키워 이름이 자리보다 길어지면 가장 좁은 자리에 맞춰 그 지도의 이름표를 함께 줄인다
//     (한 지도의 이름표는 모두 같은 크기 · 15px 아래로는 줄이지 않는다)

const TOP = { src: 'assets/map/top45.jpg', N: 1600, m: 90 };
const topC = () => WALK.pts[WALK.at('P02')] || { x: 0, y: 27.8 };
const topXY = (x, y) => { const c = topC(), k = TOP.N / TOP.m; return [TOP.N / 2 - (x - c.x) * k, TOP.N / 2 + (y - c.y) * k]; };
// 보는 범위(사진 px): 골목 전체(건널목 ~ 가게 끝) · 위 = 입구
const TOP_VIEW = { all: [520, 150, 560, 1380], entry: [520, 150, 560, 640], shop: [520, 820, 560, 700] };
// 물 높이 → 지도의 물빛 (깊을수록 짙게). 렌더의 흙탕물과 결이 맞게 회갈색 → 청회색이 아니라 '물' 하나의 색으로 짙기만 바꾼다
const topWaterAlpha = m => (m <= 0 ? 0 : Math.min(.58, .22 + m * .36));
// 굵은 글 한 줄의 너비(화면 px): 이름표가 지도 안에 드는지 재는 데 쓴다
let tmCtx = null;
const tmWidth = (txt, px, fam) => { try { tmCtx = tmCtx || document.createElement('canvas').getContext('2d'); tmCtx.font = `700 ${px}px ${fam}`; return tmCtx.measureText(txt).width; } catch (e) { return txt.length * px * .9; } };

// 지도 한 장: props
//   view   = 'all' | 'entry' | 'shop' | [x, y, w, h]
//   dest   = 길을 그릴 안전한 곳(MARKET.safe의 하나) · from = 출발 걸음 자리 id(기본 W00)
//   water  = 물 높이(m) · risks = 표시할 위험 목록(risksOn 결과) · places = 안전한 곳 목록(decide().list) · me = 지금 자리 {x, y}
//   labels = true(이름표) | 'num'(번호만: 홈의 작은 지도) · onPick(place) = 안전한 곳을 누르면
function TopMap({ view = 'all', dest, from = 'W00', water = 0, risks = [], places = [], me, labels = true, onPick, style, className = '', children, title = '1913 송정역시장 위에서 본 지도', fit = 'slice', mk = 1 }) {
  const vb = Array.isArray(view) ? view : TOP_VIEW[view] || TOP_VIEW.all;
  const R = React.useMemo(() => (dest && window.walkPlan ? walkRoute(walkPlan(dest, from)) : []), [dest && dest.id, from]);
  // 입구 밖의 표는 아치에서 2.5m 더 나간 자리: 길도 거기까지 잇는다
  const pts = dest && dest.exit && R.length ? [...R, [0, -2.5]] : R;
  const path = pts.map(p => topXY(p[0], p[1]).map(v => v.toFixed(1)).join(',')).join(' ');
  const s = vb[2] / 560 * mk;                                    // 표시 크기: 보는 범위 × 배율(작은 카드는 크게)
  // 그려진 크기(사진 1px이 화면 몇 px인지)를 재어, 글자를 화면 px로 맞춘다
  // 글자 크기 설정(--f19 · --f15)의 실제 px은 그 크기로 만든 보이지 않는 조각(probe)을 재서 안다(설정이 바뀌면 조각의 크기가 바뀌어 다시 잰다)
  const box = React.useRef(null), probe = React.useRef(null), [k, setK] = React.useState(0), [tok, setTok] = React.useState({ f19: 19, f15: 15, fam: 'sans-serif', bw: 0 });
  React.useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const m = () => {
      const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; const a = w / vb[2], b = h / vb[3], v = fit === 'meet' ? Math.min(a, b) : Math.max(a, b); setK(o => (Math.abs(o - v) > .002 ? v : o));
      const pr = probe.current, f19 = (pr && pr.offsetWidth) || 19, f15 = (pr && pr.offsetHeight) || 15, fam = getComputedStyle(el).fontFamily || 'sans-serif';
      setTok(o => (o.f19 === f19 && o.f15 === f15 && o.fam === fam && o.bw === w ? o : { ...o, f19, f15, fam, bw: w }));
    };
    m(); let live = true;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => live && setTok(o => ({ ...o, fonts: 1 })));   // 글꼴이 온 뒤의 너비로 한 번 더
    if (!window.ResizeObserver) return () => { live = false; };
    const o = new ResizeObserver(m); o.observe(el); if (probe.current) o.observe(probe.current);
    return () => { live = false; o.disconnect(); };
  }, [vb.join(','), fit]);
  // 이름표 한 덩이(이름 + 둘째 줄)가 표의 옆(edge, 화면 px)에서 지도 끝까지의 자리에 들려면 얼마로 줄여야 하나(q) · 줄이기 전의 너비(w)
  const sk = s * k, scrX = x => (tok.bw - vb[2] * k) / 2 + (x - vb[0]) * k;       // sk = 표의 단위 1이 화면 몇 px · scrX = 사진 px → 화면 px
  const fitLab = (x, left, t1, t2) => {
    const w1 = tmWidth(t1, tok.f19, tok.fam), w2 = t2 ? tmWidth(t2, tok.f15, tok.fam) : 0, edge = scrX(x) + (left ? -24 : 24) * sk;
    const room = (left ? edge : tok.bw - edge) - 8;
    return { q: Math.max(15 / tok.f19, Math.min(1, room / Math.max(w1, w2, 1))), w: Math.max(w1, w2) };
  };
  const fsU = px => ({ fontSize: (px / sk).toFixed(2) + 'px' });                    // 화면 px → 표의 단위
  const numFs = k ? { fontSize: (15 / (s * k)).toFixed(2) + 'px' } : null;                                         // 번호는 표 안에 들어야 해서 15px로 둔다
  const wl = W_WALLS, a = topXY(wl.xR, -6), b = topXY(wl.xL, 67);    // 골목 바닥(가게 앞 판 사이)
  // 내 가게: 문에서 가게 안쪽으로 1.8m (문 앞의 가게 턱 표시와 겹치지 않게). 작은 지도는 표가 커서 2.6m
  const home = WALK.pts[0] ? topXY(WALK.pts[0].x - (labels === 'num' ? 2.6 : 1.8), WALK.pts[0].y) : null;
  const num = labels === 'num', rs = s * (num ? .6 : 1);
  const riskAt = risks.map(r => ({ r, p: topXY(r.x, r.y), red: (SEV_OF[r.kind] || 'amber') === 'red' }));
  const spot = pl => (pl.exit || pl.outside ? topXY(0, -2.5) : topXY(pl.doorX, pl.door));
  const nameOf = pl => (pl.exit ? '입구 밖' : `${pl.short} ${pl.floors}층`);
  const shown = places.filter(pl => !pl.outside);
  // 이름표: 가는 곳은 이름만. 한 지도의 이름표는 모두 같은 크기 — 가장 좁은 자리에 맞춘 비율(qAll)을 함께 쓴다
  const labs = labels === true ? shown.map(pl => {
    const p = spot(pl), on = !!(dest && dest.id === pl.id), left = (pl.doorX || 0) < 0, nm = nameOf(pl), sub = on ? '' : (pl.dist != null ? `${pl.dist}m` : '') + (pl.tall ? ` · 높이 ${pl.h}m` : '');
    return { pl, p, on, left, nm, sub, fit: k ? fitLab(p[0], left, nm, sub) : null };
  }) : [];
  const qAll = k && labels === true ? Math.min(1, ...labs.map(l => l.fit.q), home ? fitLab(home[0], false, '내 가게').q : 1) : 1;
  const f1 = tok.f19 * qAll, f2 = Math.max(Math.min(15, tok.f15), tok.f15 * qAll);   // 둘째 줄도 15px 아래로는 줄이지 않는다(더 짧은 줄이라 그래도 든다)
  return (
    <div className={'tm ' + className} style={style} ref={box}>
      <i ref={probe} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, width: 'var(--f19, 19px)', height: 'var(--f15, 15px)', visibility: 'hidden', pointerEvents: 'none' }} />
      <svg viewBox={vb.join(' ')} preserveAspectRatio={'xMidYMid ' + fit} role={onPick ? 'group' : 'img'} aria-label={title}>
        <image href={TOP.src} x="0" y="0" width={TOP.N} height={TOP.N} />
        {water > 0 && <rect className="tm-water" x={Math.min(a[0], b[0])} y={a[1]} width={Math.abs(b[0] - a[0])} height={Math.max(b[1], vb[1] + vb[3]) - a[1]} style={{ opacity: topWaterAlpha(water) }} />}
        {path && <><polyline className="tm-route-halo" points={path} /><polyline className="tm-route" points={path} /></>}
        {shown.map(pl => {
          const p = spot(pl), on = dest && dest.id === pl.id;
          const act = onPick ? { role: 'button', tabIndex: 0, 'aria-label': `${nameOf(pl)} ${pl.dist}m`, onClick: () => onPick(pl), onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(pl); } }, style: { cursor: 'pointer' } } : null;
          return <g key={pl.id} className={'tm-place' + (on ? ' on' : '')} transform={`translate(${p[0]},${p[1]}) scale(${s})`} {...act}>
            {onPick && <circle className="hit" r="27" />}
            <circle r="17" />{num ? <text className="num" x="0" y="0" dy=".36em" textAnchor="middle" style={numFs}>{pl.num}</text> : <path d={pl.exit ? 'M-6 4 L0 -6 L6 4' : 'M-6 6 V-3 L0 -7 L6 -3 V6 Z'} />}
          </g>;
        })}
        {home && <g className="tm-home" transform={`translate(${home[0]},${home[1]}) scale(${s})`}><circle r="15" /><path d="M-6 5 V-1 L0 -6 L6 -1 V5 Z" />{labels === true && <text x="24" y="6" textAnchor="start" className="t1" style={k ? fsU(f1) : null}>내 가게</text>}</g>}
        {riskAt.map(({ r, p, red }) => <g key={r.id} className={'tm-risk' + (red ? ' red' : '')} transform={`translate(${p[0]},${p[1]}) scale(${rs})`}>
          {red ? <><path d="M0 -15 L14 10 H-14 Z" /><circle r="4.5" cy="2" className="dot" /></> : <><circle r="13" /><circle r="5" className="dot" /></>}
        </g>)}
        {labs.map(({ pl, p, on, left, nm, sub, fit: F }) => {
          // 이름표의 자리(표의 단위): 잰 너비의 상자(재기 전에는 글자 수로 어림). 그 안에 위험 표시가 들어오면 한 줄 아래로 비킨다. 가는 곳은 길 위로 올린다
          const lh = F ? f2 * 1.17 / sk : 21;
          const w = F ? F.w * qAll / sk : Math.max(nm.length * 21, 150), x0 = left ? -24 - w : 24, x1 = left ? -24 : 24 + w;
          const hit = dy => riskAt.some(({ p: q }) => { const lx = (q[0] - p[0]) / s, ly = (q[1] - p[1]) / s; return lx > x0 - 16 && lx < x1 + 16 && ly > dy - 44 && ly < dy + 38; });
          const dy = on ? (pl.exit ? 10 : -14) : hit(0) && !hit(26) ? 26 : 0;   // 입구 밖은 지도의 맨 위라 올리지 않고 표의 옆에(위의 겹 고르기 칩에 닿지 않게)
          return <g key={pl.id} className={'tm-place' + (on ? ' on' : '')} transform={`translate(${p[0]},${p[1]}) scale(${s})`} aria-hidden="true" style={{ pointerEvents: 'none' }}>
            <g transform={`translate(${left ? -24 : 24},${dy})`}>
              <text x="0" y="-4" textAnchor={left ? 'end' : 'start'} className="t1" style={F ? fsU(f1) : null}>{nm}</text>
              {!on && <text x="0" y={(lh - 4).toFixed(1)} textAnchor={left ? 'end' : 'start'} className="t2" style={F ? fsU(f2) : null}>{sub}</text>}
            </g>
          </g>;
        })}
        {me && (() => { const p = topXY(me.x, me.y); return <g className="tm-me" transform={`translate(${p[0]},${p[1]}) scale(${s})`}><circle r="22" className="pulse" /><circle r="10" /></g>; })()}
      </svg>
      {children}
    </div>
  );
}

Object.assign(window, { TOP, topXY, TOP_VIEW, topWaterAlpha, TopMap });
