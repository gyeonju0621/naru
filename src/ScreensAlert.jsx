// NARU v9 · 경보 → 동행 → 나루 → 탑승 → 안전 · 보호자
// 같은 틀(큰 숫자 · 한 줄 · 원반) 그대로, 밤이 되면 바탕만 흑칠로.

function KAlert({ go }) {
  return (
    <>
      <div className="rain" />
      <Top title="23:02 · 호우 경보" right={<IconBtn icon="phone" label="119" />} />
      <Hero
        big={<Big v="40" u="분" delta="뒤 무릎 높이" under={<span>집 앞 HOME PLATE 기준<Ex /></span>} />}
        pills={<span className="pill" style={{ borderColor: 'var(--amber)', color: 'var(--amber)' }}><span className="dot breath" style={{ width: 6, height: 6 }} />경보</span>}
        place={<Place icon="map-pin" where="시장길 남쪽 골목" state="에 물이 차요" stateTone="var(--fg1)" time="재난문자 · 23:01 수신" />}
        stage={<Stage src={SCN('crosswalk')} size={220} water={.3} pos="50% 60%" zoom={1.3} glow>
          <Mark x={-8} y={60} icon="footprints" label="문턱" />
        </Stage>}
        foot={<div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <div className="b" style={{ flex: 1, fontSize: 14 }}>계획 A대로 승강장 A로 가요. 길은 나루가 안내할게요.</div>
          <Side v="7" u="분" label="승강장 A까지" tone="var(--fg1)" />
        </div>}
        actions={<div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-line" style={{ flex: 1 }} onClick={() => go('kCall')}>나루 부르기</button>
          <button className="btn btn-act" style={{ flex: 1.4 }} onClick={() => go('kGuide')}>길 안내 시작</button>
        </div>}
        bottom={34}
      />
    </>
  );
}

// 앞 보기 — 3D 레벨 장면 + 바닥 리본 (Ticket AR 문법)
const Ribbon9 = ({ turn = 0 }) => {
  const vx = 187 + turn * 3.4, vy = 120, cx = 187 + turn, cy = 260;
  const L = `M 104 470 C ${cx - 44} ${cy + 50}, ${cx - 22} ${cy - 30}, ${vx - 7} ${vy}`;
  const R = `L ${vx + 7} ${vy} C ${cx + 22} ${cy - 30}, ${cx + 44} ${cy + 50}, 270 470 Z`;
  const B = (t, k) => { const p = [[187, 470], [cx, cy + 50], [cx, cy - 30], [vx, vy]]; return (1 - t) ** 3 * p[0][k] + 3 * (1 - t) ** 2 * t * p[1][k] + 3 * (1 - t) * t * t * p[2][k] + t ** 3 * p[3][k]; };
  return (
    <svg viewBox="0 0 375 470" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
      <defs><linearGradient id="r9" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#8FD6BF" stopOpacity=".95" /><stop offset=".6" stopColor="#8FD6BF" stopOpacity=".75" /><stop offset="1" stopColor="#8FD6BF" stopOpacity="0" /></linearGradient></defs>
      <path d={L + ' ' + R} fill="url(#r9)" />
      {[.1, .3, .5, .68].map((t, i) => {
        const x = B(t, 0), y = B(t, 1), x2 = B(t + .02, 0), y2 = B(t + .02, 1), s = 1.1 - t * 1, a = Math.atan2(x2 - x, y - y2) * 180 / Math.PI;
        return <g key={i} transform={`translate(${x},${y}) rotate(${a}) scale(${s},${s * .6})`}><path d="M -30 12 L 0 -10 L 30 12" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" style={{ animation: `n9chev 2s ease-in-out ${-i * .4}s infinite` }} /></g>;
      })}
    </svg>
  );
};
const Tag9 = ({ x, y, label, dark, line = 30 }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
    <span className="nw" style={{ height: 28, padding: '0 12px', borderRadius: 14, display: 'flex', alignItems: 'center', fontSize: 12.5, fontWeight: 600, background: dark ? '#17181B' : 'rgba(255,255,255,.92)', color: dark ? '#fff' : '#17181B' }}>{label}</span>
    <i style={{ width: 1, height: line, background: 'rgba(255,255,255,.9)' }} /><i style={{ width: 8, height: 8, borderRadius: 4, background: '#fff' }} />
  </div>
);

const GSTEP = [
  { img: 'corner', d: 12, ic: 'corner-up-right', t: '경사로 쪽으로 오른쪽', s: '가운데 문턱 12cm를 피해요', turn: 14, tags: [['32%', 120, '문턱 12cm'], ['74%', 170, '경사로', true]] },
  { img: 'plaza', d: 40, ic: 'arrow-up', t: '광장 왼쪽 가장자리로', s: '왼쪽이 조금 더 높아요', turn: 0, tags: [['50%', 70, '승강장 A · 40m', true]] },
  { img: 'gate', d: 8, ic: 'map-pin', t: '승강장 A 도착', s: '기둥 옆에서 기다려요', turn: 0, tags: [['50%', 80, '나루 · 3분', true]] },
];
function KGuide({ go, st, set }) {
  const v = st.view || 'front', i = st.g ?? 0, S = GSTEP[i];
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 470, overflow: 'hidden', borderRadius: '0 0 40px 40px', background: 'var(--disc)' }}>
        {v === 'front' ? <>
          <img key={S.img} className="in" src={SCN(S.img)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.55) brightness(1.02)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.28), transparent 30%)' }} />
          <Ribbon9 turn={S.turn} />
          {S.tags.map(([x, y, l, dk]) => <Tag9 key={l} x={x} y={y + 80} label={l} dark={dk} />)}
        </> : <div className="in" style={{ position: 'absolute', inset: 0 }}><PlanDisc progress={[.35, .7, 1][i]} /></div>}
      </div>
      <div style={{ position: 'absolute', top: 54, left: 10, right: 14, display: 'flex', alignItems: 'center', zIndex: 20 }}>
        <button onClick={() => go('kAlert')} aria-label="뒤로" style={{ width: 40, height: 40, borderRadius: 20, border: 0, background: 'rgba(255,255,255,.92)', color: '#17181B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Ico name="chevron-left" size={20} /></button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', background: 'rgba(255,255,255,.92)', borderRadius: 20, padding: 3 }}>
          {[['front', '앞 보기'], ['top', '위 보기']].map(([k, l]) => <button key={k} onClick={() => set({ view: k })} style={{ height: 34, padding: '0 14px', border: 0, borderRadius: 17, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: v === k ? '#17181B' : 'transparent', color: v === k ? '#fff' : '#4D4F55' }}>{l}</button>)}
        </div>
      </div>
      <div className="in" key={i} style={{ position: 'absolute', top: 492, left: 24, right: 24, bottom: 34, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--act)', color: 'var(--on-act)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ico name={S.ic} size={24} stroke={2.2} /></div>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}><span className="big" style={{ fontSize: 64 }}>{S.d}</span><span className="big-u" style={{ paddingTop: 8 }}>m</span></div>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'right' }}><div className="c">남은 시간</div><div style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }} className="nw">{['4분', '2분', '도착'][i]}</div></div>
        </div>
        <div className="h2" style={{ marginTop: 12 }}>{S.t}</div>
        <div className="s" style={{ marginTop: 2 }}>{S.s} · 3D 데이터 높이 기준</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-line" style={{ flex: 1 }} onClick={() => go('kCall')}>나루 부르기</button>
          <button className="btn btn-act" style={{ flex: 1.4 }} onClick={() => i < 2 ? set({ g: i + 1 }) : (set({ g: 0 }), go('kCall'))}>{i < 2 ? '다음' : '여기서 기다리기'}</button>
        </div>
      </div>
    </>
  );
}

// ── 실시간 추적: 승강장 → 나 (지도 위에서 차가 다가온다)
const TRACK = [[152, 62], [110, 68], [82, 92], [76, 140], [76, 238]];
function trackPoint(u) {
  const seg = [];
  let total = 0;
  for (let i = 0; i < TRACK.length - 1; i++) { const d = Math.hypot(TRACK[i + 1][0] - TRACK[i][0], TRACK[i + 1][1] - TRACK[i][1]); seg.push(d); total += d; }
  let left = Math.max(0, Math.min(1, u)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i]) { const k = left / seg[i]; return [TRACK[i][0] + (TRACK[i + 1][0] - TRACK[i][0]) * k, TRACK[i][1] + (TRACK[i + 1][1] - TRACK[i][1]) * k]; }
    left -= seg[i];
  }
  return TRACK[TRACK.length - 1];
}
function LiveTrack({ u = 0, h = 224, stop = '승강장 A' }) {
  const [x, y] = trackPoint(u);
  const blocks = [];
  for (let i = 0; i < 7; i++) { const yy = 26 + i * 30; blocks.push([16, yy, 44, 24], [300, yy, 58, 24]); }
  return (
    <div style={{ position: 'relative', height: h, borderRadius: 30, overflow: 'hidden', background: 'var(--plan-ground)', boxShadow: '0 0 0 1px var(--line)' }}>
      <svg viewBox="0 0 375 250" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        {blocks.map((b, i) => <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx="6" fill="var(--plan-block)" />)}
        <path d="M 152 62 L 110 68 L 82 92 L 76 140 L 76 238" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 152 62 L 110 68 L 82 92 L 76 140 L 76 238" fill="none" stroke="#2E7D69" strokeWidth="6" strokeDasharray="2 9" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
        <path d="M 152 62 L 110 68 L 82 92 L 76 140 L 76 238" fill="none" stroke="#2E7D69" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray={`${u} 1`} />
        {/* 승강장 */}
        <g transform="translate(152 62)">
          <circle r="17" fill="var(--card)" stroke="var(--line2)" />
          <circle r="6" fill="var(--fg2)" />
        </g>
        {/* 나 */}
        <g transform="translate(76 238)">
          <circle r="22" fill="rgba(46,125,105,.14)" />
          <circle r="9" fill="var(--card)" stroke="#2E7D69" strokeWidth="4" />
        </g>
        {/* 나루 차량 */}
        <g transform={`translate(${x} ${y})`} style={{ transition: 'transform 1s linear' }}>
          <circle r="24" fill="rgba(238,154,46,.14)" className="breath" />
          <circle r="15" fill="#17181B" />
          <g transform="translate(-7.5 -7.5) scale(.62)" style={{ fill: '#fff' }}><path d="M2 21V7l15 14V7" transform="translate(0 0)" /><path d="M2 21V7l15 14V7" /></g>
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 10, top: 10, display: 'flex', gap: 6 }}>
        <span className="pill" style={{ height: 26, background: 'var(--card)', borderColor: 'var(--jade)', color: 'var(--jade)' }}><i className="breath" style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--jade)' }} />실시간</span>
      </div>
      <div style={{ position: 'absolute', right: 10, top: 10 }}>
        <span className="pill" style={{ height: 26, background: 'var(--card)', borderColor: 'var(--line2)', color: 'var(--fg2)' }}>{stop}</span>
      </div>
    </div>
  );
}

// ── 나루 부르기: 배차 → 실시간으로 다가옴 → 도착
function KCall({ go, st, set }) {
  const s = st.call || 0;            // 0 부르기 전 · 1 배차 중 · 2 오는 중 · 3 도착
  const [sec, setSec] = React.useState(96);
  React.useEffect(() => {
    if (s !== 2) { setSec(96); return; }
    const t = setInterval(() => setSec(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [s]);
  React.useEffect(() => { if (s === 2 && sec === 0) set({ call: 3 }); }, [s, sec]);
  // 배차 중 → 오는 중: 예전에는 넘겨 주는 코드가 없어서 '배차 중'에서 멈췄다
  React.useEffect(() => { if (s !== 1) return; const t = setTimeout(() => set({ call: 2 }), 2600); return () => clearTimeout(t); }, [s]);
  const p = Math.min(1, 1 - sec / 96);
  const eta = Math.max(1, Math.ceil(sec / 60));
  const dist = Math.round((520 * (1 - p)) / 10) * 10;
  const L = [
    ['지나가는 차를 잡는 게 아니에요', '나루는 승강장까지 찾아오는 이동형 대피소예요'],
    ['보조기 자리를 미리 붙여 둬요', 'PASS를 대면 2-B 자리로 안내해요'],
    ['나루지기가 경사판을 내리고 마중해요', '계단을 오르지 않아도 돼요'],
  ];
  return (
    <>
      {s <= 1 && <div className="rain" />}
      <Top title={['나루 부르기', '나루를 찾고 있어요', '나루가 오고 있어요', '나루 도착'][s]} onBack={() => go('kAlert')} right={<IconBtn icon="phone" label="운행 센터" />} />
      <div style={{ position: 'absolute', top: 104, left: 22, right: 22 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {s === 0 ? <Big v="6" u="분" delta="부르면 도착까지" /> :
           s === 1 ? <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
             <span className="big" style={{ fontSize: 56, letterSpacing: '-.02em', color: 'var(--fg3)' }}>···</span>
             <span className="s nw" style={{ paddingBottom: 6 }}>찾는 중</span>
           </div> :
           s === 3 ? <Big v="2-B" u="" delta="맞춘 자리" /> : <Big v={String(eta)} u="분" delta={`남았어요 · ${dist}m`} />}
          {s >= 2 && <span className="pill" style={{ marginTop: 8 }}><Ico name="ticket" size={12} stroke={2.2} />PASS 연결</span>}
          {s === 1 && <span className="pill breath" style={{ marginTop: 8 }}>배차 중</span>}
        </div>
        <div className="s" style={{ marginTop: 8 }}>{s >= 2 ? 'NARU 07 · 나루지기 김도현' : '승강장 A · 1913 송정역시장'}</div>
      </div>
      <div style={{ position: 'absolute', top: 246, left: 20, right: 20 }}>
        <LiveTrack u={s >= 3 ? 1 : s >= 2 ? p : 0} stop="승강장 A" />
      </div>
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 24 }}>
        {s === 0 ? (
          <>
            <div className="b" style={{ fontSize: 14, textAlign: 'center', marginBottom: 10 }}>보조기 자리와 경사판을 미리 준비해 둘게요.</div>
            <Hold onDone={() => set({ call: 1 })} />
          </>
        ) : (
          <div style={{ background: 'var(--card)', borderRadius: 30, padding: '16px 18px 18px', boxShadow: 'var(--shadow)' }}>
            {s === 1 ? (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span className="breath" style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--amber)' }} />
                <div className="b" style={{ fontSize: 14 }}>가까운 나루에 요청을 보냈어요. 보통 10초 안에 배차돼요.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <NaruMark size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 650 }}>{s === 3 ? '나루가 앞에 왔어요' : '나루가 이쪽으로 오고 있어요'}</div>
                    <div className="s">{s === 3 ? '문이 열렸어요 · 경사판 내려 둠' : '도착하면 HAND가 세 번 진동해요'}</div>
                  </div>
                  <button onClick={() => go('kInside')} style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', textAlign: 'center' }}>
                    <img src="assets/scene/shuttle-cctv.png" alt="" style={{ width: 54, height: 40, objectFit: 'cover', borderRadius: 10, filter: 'grayscale(.2) contrast(1.05)' }} />
                    <span className="c" style={{ display: 'block', marginTop: 2, fontSize: 10.5 }}>차 안</span>
                  </button>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--line2)', margin: '14px 0 12px', overflow: 'hidden' }}>
                  <div style={{ width: (s === 3 ? 1 : p) * 100 + '%', height: '100%', background: 'var(--jade)', transition: 'width 1s linear' }} />
                </div>
                {L.map(([t, sub], i) => (
                  <div key={t} style={{ display: 'flex', gap: 9, padding: '7px 0', borderTop: i ? '1px solid var(--line)' : 0 }}>
                    <Ico name={['shield-check', 'accessibility', 'hand-helping'][i]} size={16} style={{ color: 'var(--jade)', marginTop: 1 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t}</div>
                      <div className="c" style={{ marginTop: 1 }}>{sub}</div>
                    </div>
                  </div>
                ))}
                <button className="btn btn-act" style={{ width: '100%', marginTop: 12 }} onClick={() => s === 3 ? go('kSafe') : set({ call: 3 })}>{s === 3 ? '타러 가기' : '지금 도착한 걸로 보기'}</button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ── 안전: 차 안에서. CCTV로 확인
function KSafe({ go, set }) {
  return (
    <>
      <Top title="23:40 · 안전" right={<IconBtn icon="share" label="가족에게" />} />
      <div className="in" style={{ position: 'absolute', top: 104, left: 20, right: 20, bottom: 30, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Big v="1.4" u="m" delta="지금 집 앞" />
          <span className="pill"><Ico name="check" size={12} stroke={2.4} />안전</span>
        </div>
        <div className="s" style={{ marginTop: 8 }}>HOME PLATE가 계속 재고 있어요</div>
        <div style={{ position: 'relative', marginTop: 16, borderRadius: 26, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <img src="assets/scene/shuttle-cctv.png" alt="나루 안 CCTV" style={{ width: '100%', display: 'block', filter: 'saturate(.85) contrast(1.02)' }} />
          <span style={{ position: 'absolute', left: 10, top: 10, display: 'flex', alignItems: 'center', gap: 5, height: 24, padding: '0 9px', borderRadius: 12, background: 'rgba(23,24,27,.62)', color: '#fff', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em' }}>
            <i className="breath" style={{ width: 6, height: 6, borderRadius: 3, background: '#ff5a4d' }} />LIVE
          </span>
          <span style={{ position: 'absolute', right: 10, top: 10, height: 24, padding: '0 9px', borderRadius: 12, background: 'rgba(23,24,27,.55)', color: '#fff', fontSize: 10.5, fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center' }}>23:40:12</span>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '18px 14px 12px', background: 'linear-gradient(180deg, transparent, rgba(10,10,12,.62))' }}>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 650 }}>나루 안에 있어요</div>
            <div style={{ color: 'rgba(255,255,255,.72)', fontSize: 12 }}>안전벨트 · 지우 님에게 알렸어요</div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}><Card pad="2px 16px">
          <Row icon="package-open" title="KEEPER 키트" sub="우비 · 보온 · 물" right={<span className="c">받음</span>} />
          <Row icon="route" title="대피소까지" sub="약 9분 · 광주송정역 앞" right={<span className="c">이동 중</span>} />
          <Row icon="house" title="물이 빠지면" sub="돌아가는 길을 같이 볼게요" last />
        </Card></div>
        <button className="btn btn-act" style={{ width: '100%', marginTop: 14 }} onClick={() => { set({ call: 0, g: 0 }); go('kHome'); }}>홈으로</button>
      </div>
    </>
  );
}

// ── 보호자: 실시간으로 나루에 타고 가는 모습을 본다
function GWatch({ go }) {
  const [tab, setTab] = React.useState('in');
  const [p, setP] = React.useState(.42);
  React.useEffect(() => {
    const t = setInterval(() => setP(v => (v >= .99 ? .12 : v + .012)), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <Top title="순례 님 지켜보기" onBack={() => go('kFamily')} right={<IconBtn icon="phone" label="전화" />} />
      <div className="in" style={{ position: 'absolute', top: 104, left: 20, right: 20, bottom: 96, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img src="assets/people/sunrye.png" alt="" style={{ width: 54, height: 54, borderRadius: 27, objectFit: 'cover' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 650, letterSpacing: '-.025em', lineHeight: 1.34 }}>박순례 님은<br />나루 안에 있어요</div>
            <div className="s" style={{ marginTop: 3 }}>23:17 승차 · 약 6분</div>
          </div>
          <span className="pill nw" style={{ borderColor: 'var(--jade)', color: 'var(--jade)', flexShrink: 0 }}><i className="breath" style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--jade)' }} />LIVE</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          {[['in', '차 안'], ['road', '지금 길']].map(([k, l]) => (
            <button key={k} className={'pill' + (tab === k ? ' on' : ' mute')} style={{ height: 32 }} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div style={{ position: 'relative', marginTop: 10, borderRadius: 26, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          {tab === 'in'
            ? <img src="assets/scene/shuttle-cctv.png" alt="나루 실내 CCTV" style={{ width: '100%', display: 'block', filter: 'saturate(.7) contrast(1.04) brightness(1.04)' }} />
            : <img src={SCN('gate')} alt="지금 지나가는 길" style={{ width: '100%', display: 'block', filter: 'saturate(.3) brightness(.9)' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 3px)', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', left: 10, top: 10, display: 'flex', alignItems: 'center', gap: 5, height: 24, padding: '0 9px', borderRadius: 12, background: 'rgba(23,24,27,.6)', color: '#fff', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em' }}>
            <i className="breath" style={{ width: 6, height: 6, borderRadius: 3, background: '#ff5a4d' }} />CCTV
          </span>
          <span style={{ position: 'absolute', right: 10, top: 10, height: 24, padding: '0 9px', borderRadius: 12, background: 'rgba(23,24,27,.55)', color: '#fff', fontSize: 10.5, display: 'flex', alignItems: 'center', fontVariantNumeric: 'tabular-nums' }}>23:19:41</span>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '20px 14px 12px', background: 'linear-gradient(180deg, transparent, rgba(10,10,12,.66))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Ico name="check" size={15} stroke={2.4} style={{ color: '#8FD6BF' }} />
              <span style={{ color: '#fff', fontSize: 14.5, fontWeight: 650 }}>안전벨트를 하고 앉아 있어요</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 11.5, marginTop: 2 }}>보조기 자리 2-B · 나루지기 동승</div>
          </div>
        </div>
        <div style={{ marginTop: 14, background: 'var(--card)', borderRadius: 24, padding: '16px 18px', boxShadow: '0 0 0 1px var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="h2">대피소까지 6분</span><span className="c">{Math.round(p * 100)}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: 'var(--line2)', marginTop: 10, overflow: 'hidden' }}>
            <div style={{ width: p * 100 + '%', height: '100%', background: 'var(--jade)', transition: 'width 1.2s linear' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}><span className="c">송정역시장</span><span className="c">광주송정역 앞 대피소</span></div>
        </div>
        <div style={{ marginTop: 12 }}><Card pad="2px 16px">
          <Row title="23:02 경보 받음" sub="계획 A 시작" right={<span className="c">✓</span>} />
          <Row title="23:12 승강장 A 도착" sub="문턱 경사로로 지남" right={<span className="c">✓</span>} />
          <Row title="23:17 나루 탑승" sub="PASS로 자리 확인" right={<span className="c">✓</span>} last />
        </Card></div>
      </div>
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 26, display: 'flex', gap: 8 }}>
        <button className="btn btn-line" style={{ flex: 1 }} onClick={() => go('kInside')}>차 안 크게 보기</button>
        <button className="btn btn-act" style={{ flex: 1.2 }} onClick={() => go('kCall')}>대신 나루 부르기</button>
      </div>
    </>
  );
}

Object.assign(window, { KAlert, KGuide, KCall, KSafe, GWatch, LiveTrack, trackPoint });
