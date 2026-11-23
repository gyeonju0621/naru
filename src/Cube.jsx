// NARU v9 · 큐브맵 뷰 — 언리얼 엔진 6면 큐브맵 실시간 스트림 자리
// 지금은 송정역시장 3D 레벨 미리보기 이미지를 면 텍스처로 임시 사용 (실제: UE5 실시간 렌더 6면)
// 축척: 1m = 200px · 눈높이 1.5m · 큐브 한 변 600px

const FACES = { corner: '골목', plaza: '광장', gate: '승강장', crosswalk: '횡단보도' };

// 바닥에 눕는 길 — 눈높이에서는 원근으로, 위에서는 평면으로
function GroundRoute({ progress = 1, hazards = [], route = 'aid', top = false }) {
  const d = top
    ? (route === 'walk' ? 'M 50 88 L 50 8' : 'M 50 90 L 50 54 Q 50 45 60 45 L 92 45')
    : (route === 'walk' ? 'M 50 100 L 50 0' : 'M 50 100 L 50 42 Q 50 30 60 30 L 96 30');
  const w = top ? 5.5 : 26;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <path d={d} fill="none" stroke="rgba(255,255,255,.92)" strokeWidth={w * 1.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: top ? 15 : 46 }} />
      <path d={d} fill="none" stroke="rgba(143,214,191,.95)" strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" pathLength="1" strokeDasharray={`${progress} 1`} style={{ strokeWidth: top ? 10 : 34, transition: 'stroke-dasharray .9s' }} />
      {[.28, .55, .8].map((t, i) => {
        const y = 100 - t * 96;
        return <g key={i} transform={`translate(50 ${route === 'walk' ? y : (t < .45 ? y : 45)}) ${route === 'walk' || t < .45 ? '' : 'translate(20 0)'}`}>
          <path d="M -3 1.6 L 0 -1.6 L 3 1.6" fill="none" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" style={{ animation: `n9chev 2s ease-in-out ${-i * .5}s infinite` }} />
        </g>;
      })}
      {hazards.map(([x, y, n]) => <g key={n} transform={`translate(${x} ${y})`}><circle r="2.6" fill="#fff" stroke="#17181B" strokeWidth=".5" /><text y=".9" textAnchor="middle" fontSize="2.6" fontWeight="700" fill="#17181B" fontFamily="Pretendard Variable, sans-serif">{n}</text></g>)}
      {route !== 'walk' && <g transform={top ? 'translate(92 45)' : 'translate(96 30)'}><circle r="2.4" fill="none" stroke="#EE9A2E" strokeWidth=".7" className="breath" /><circle r="1.2" fill="#17181B" /></g>}
    </svg>
  );
}

// 장면 위에 꽂는 표지
const Tag9 = ({ x, y, label, dark, amber }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', zIndex: 4 }}>
    <span className="nw" style={{ height: 34, padding: '0 15px', borderRadius: 17, display: 'flex', alignItems: 'center', gap: 7, fontSize: 15, fontWeight: 650, background: dark ? '#17181B' : 'rgba(255,255,255,.95)', color: dark ? '#fff' : '#17181B', boxShadow: '0 8px 18px -10px rgba(0,0,0,.45)' }}>
      {amber && <i style={{ width: 7, height: 7, borderRadius: 4, background: '#EE9A2E', boxShadow: '0 0 0 3px rgba(238,154,46,.25)' }} />}{label}
    </span>
    <i style={{ width: 1.5, height: 30, background: 'rgba(255,255,255,.95)' }} /><i style={{ width: 9, height: 9, borderRadius: 5, background: '#fff' }} />
  </div>
);

// 위에서 보기 — 시장길 평면 도식
function AerialPlan({ route = 'aid', progress = 1, hazards = [], x = 0 }) {
  const d = route === 'walk' ? 'M 190 400 L 190 60' : 'M 190 420 L 190 250 Q 190 214 226 214 L 330 214';
  const blocks = [];
  for (let i = 0; i < 8; i++) { const y = 72 + i * 46; if ([2, 4].includes(i)) continue; blocks.push([52, y, 88, 34], [230, y, 118, 34]); }
  return (
    <svg viewBox="0 0 375 620" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: `translateX(${x}px)` }}>
      <rect width="375" height="620" fill="var(--plan-ground, #EFEDE8)" />
      {[[8, 60, 34, 460], [344, 60, 34, 460]].map((b, i) => <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx="10" fill="var(--plan-block, #E2DED6)" opacity=".7" />)}
      {blocks.map((b, i) => <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx="8" fill="var(--plan-block, #E2DED6)" stroke="rgba(23,24,27,.05)" />)}
      <path d={d} fill="none" stroke="#fff" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
      <path d={d} fill="none" stroke="#8FD6BF" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#2E7D69" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray={`${progress} 1`} style={{ transition: 'stroke-dasharray .9s' }} />
      {hazards.map(([hx, hy, n]) => <g key={n} transform={`translate(${hx} ${hy})`}><circle r="13" fill="#fff" stroke="#17181B" strokeWidth="1.3" /><text y="4.6" textAnchor="middle" fontSize="13" fontWeight="700" fill="#17181B" fontFamily="Pretendard Variable, sans-serif">{n}</text></g>)}
      <g transform="translate(330 214)"><circle r="20" fill="none" stroke="#EE9A2E" strokeWidth="2.2" className="breath" /><circle r="9" fill="#17181B" /></g>
      <g transform="translate(190 420)"><circle r="16" fill="rgba(46,125,105,.16)" /><circle r="7" fill="#fff" stroke="#2E7D69" strokeWidth="3.4" /></g>
      <text x="190" y="580" textAnchor="middle" fontSize="11" fill="#8B8D93" letterSpacing="1.6" fontFamily="Pretendard Variable, sans-serif">↓ 광주송정역 방향</text>
    </svg>
  );
}

// 6면 표시 — UE5 큐브맵 스트림
const CubeHUD = ({ yaw, top, top_: t }) => {
  const cells = [['up', 1, 0], ['left', 0, 1], ['front', 1, 1], ['right', 2, 1], ['back', 3, 1], ['down', 1, 2]];
  const yn = ((yaw % 360) + 360) % 360;
  const cur = t ? 'down' : yn < 45 || yn >= 315 ? 'front' : yn < 135 ? 'right' : yn < 225 ? 'back' : 'left';
  return (
    <div style={{ position: 'absolute', left: 14, top: t ? 216 : 214, display: 'flex', alignItems: 'center', gap: 8, height: 30, padding: '0 10px 0 8px', borderRadius: 15, background: 'rgba(255,255,255,.9)', color: '#17181B', pointerEvents: 'none', zIndex: 6 }}>
      <span style={{ position: 'relative', width: 34, height: 25 }}>{cells.map(([k, gx, gy]) => <i key={k} style={{ position: 'absolute', left: gx * 8.5, top: gy * 8.5, width: 7.5, height: 7.5, borderRadius: 2, background: cur === k ? '#17181B' : 'rgba(23,24,27,.16)' }} />)}</span>
      <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em' }}>UE5 · 6면</span>
    </div>
  );
};

// ── CubeView: 이름은 그대로 두고 내부를 '펼친 장면'으로
function CubeView({ yaw: yaw0 = 0, pitch: pitch0 = 10, water = 0, route, progress = 1, hazards = [], tags = [], drift = true, hudTop, scene, hud = true, walk = 'aid' }) {
  const [yaw, setYaw] = React.useState(yaw0);
  const drag = React.useRef(null);
  const panoOk = usePanoReady();                       // 언리얼에서 뽑은 360° 파노라마가 있으면 그것을 쓴다
  const [panoFail, setPanoFail] = React.useState(false);
  const top = pitch0 >= 60;
  const pano = panoOk && !panoFail && !top;
  React.useEffect(() => { setYaw(yaw0); }, [yaw0]);
  React.useEffect(() => {
    if (!drift || pano) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf, t0 = performance.now();
    const tick = t => { if (!drag.current) setYaw(yaw0 + Math.sin((t - t0) / 3000) * 7); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [drift, yaw0, pano]);
  const down = e => { drag.current = { x: e.clientX, y: e.clientY, yaw }; };
  const move = e => { const d = drag.current; if (!d) return; setYaw(Math.max(-80, Math.min(120, d.yaw - (e.clientX - d.x) * .45))); };
  const up = () => { drag.current = null; };
  const shift = Math.max(-70, Math.min(70, -yaw * 1.5));   // 사진 틀(좌우 70px 여유) 밖으로 밀려 빈 띠가 생기지 않게
  const near =['corner', 'plaza', 'gate', 'crosswalk'][(Math.round(yaw / 90) + 4) % 4];
  const src = scene || near;
  if (pano) {
    const pt = PANO.scenePoint[src] || 'P02', eye = PANO.walkEye[walk] || 140, wcm = PANO.waterOf(water);
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--disc, #E9E5DE)' }}>
        <PanoView src={PANO.file(pt, eye, wcm)} yaw0={yaw0} ribbon={!!route} h={(eye - wcm) / 100} drift={drift}
          spots={PANO.hotspots[pt] || []} onYaw={setYaw} onFail={() => setPanoFail(true)} />
        {hud && <CubeHUD yaw={yaw} top={hudTop} top_={false} />}
      </div>
    );
  }
  return (
    <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--disc, #E9E5DE)', cursor: 'grab', touchAction: 'none' }}>
      {top ? (
        <div className="in" style={{ position: 'absolute', inset: 0 }}><AerialPlan route={route} progress={progress} hazards={hazards} x={shift * .4} /></div>
      ) : (
        <>
          {/* 하늘 */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#E6E4DF,#D8D5CF 54%,#CFCBC4)' }} />
          {/* 장면 */}
          <div style={{ position: 'absolute', left: -70, right: -70, top: 0, height: '62%', transform: `translateX(${shift}px)` }}>
            <img src={SCN(src)} alt="" draggable="false" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 62%', filter: 'saturate(.58) brightness(1.03)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(232,229,224,.5) 0%, rgba(232,229,224,0) 26%, rgba(120,112,100,.14) 100%)' }} />
          </div>
          {/* 바닥 — 발밑에서 소실점으로 좁아지는 길 (CSS 원근) */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', bottom: 0, overflow: 'hidden', background: 'linear-gradient(180deg,#D2CDC4,#C6C0B7 45%,#BAB4AA)' }}>
            <div style={{ position: 'absolute', left: '18%', right: '18%', top: 0, bottom: 0, background: 'rgba(255,255,255,.55)', clipPath: 'polygon(43% 0, 57% 0, 108% 100%, -8% 100%)' }} />
            <div style={{ position: 'absolute', left: '18%', right: '18%', top: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(143,214,191,.95), #2E7D69 75%, #2E7D69)', clipPath: route === 'walk' ? 'polygon(43% 0, 57% 0, 64% 100%, 36% 100%)' : 'polygon(43% 0, 57% 0, 104% 100%, -4% 100%)', opacity: .92 }} />
            {[0, 1, 2, 3].map(i => {
              const t = .18 + i * .22;
              const w = 22 + t * 30, y = t * 100;
              return <div key={i} style={{ position: 'absolute', left: '50%', top: y + '%', width: w, height: w * .55, marginLeft: -w / 2, marginTop: -w * .28, opacity: .95, animation: `n9chev 2.2s ease-in-out ${-i * .5}s infinite` }}>
                <svg viewBox="0 0 30 16" style={{ width: '100%', height: '100%' }}><path d="M 4 12 L 15 3 L 26 12" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>;
            })}
            {hazards.map(([hx, hy, n]) => {
              const t = Math.min(.6, (340 - hy) / 250);
              const spread = 20 + t * 62;
              const x = 50 + ((hx - 190) / 190) * spread;
              return <div key={n} style={{ position: 'absolute', left: x + '%', top: (t * 100) + '%', transform: 'translate(-50%,-50%)', width: 26, height: 26, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#17181B' }}>{n}</div>;
            })}
            {route !== 'walk' && <div style={{ position: 'absolute', left: '50%', top: 2, width: 30, height: 30, marginLeft: -15, borderRadius: '50%', border: '2px solid #EE9A2E', animation: 'n9breath 1.8s ease-in-out infinite' }} />}
            {water > 0 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.min(100, water * 150) + '%', background: 'linear-gradient(180deg, rgba(143,214,191,.45), rgba(46,125,105,.55))', borderTop: '2px solid rgba(255,255,255,.8)', transition: 'height 1.3s ease' }} />}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(180deg, rgba(207,202,193,.96), rgba(207,202,193,0))' }} />
          </div>
          {tags.map(t => <Tag9 key={t.label} {...t} />)}
        </>
      )}
      {hud && <CubeHUD yaw={yaw} top={hudTop} top_={top} />}
    </div>
  );
}

Object.assign(window, { CubeView, GroundRoute, AerialPlan, Tag9 });
