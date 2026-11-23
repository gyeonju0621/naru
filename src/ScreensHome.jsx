// NARU v9 · 평시 — 홈 · 미리 겪기 · 계획 · 내 걸음 · 가족

// 공통 히어로 레이아웃: 큰 숫자 | 알약 → 장소 한 줄 → 무대 → 발치 → 행동
const Hero = ({ big, pills, place, stage, foot, actions, top = 102, bottom = 84 }) => (
  <div className="in" style={{ position: 'absolute', top, left: 0, right: 0, bottom, display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
      {big}<div style={{ display: 'flex', gap: 6, paddingTop: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{pills}</div>
    </div>
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>{place}{stage}</div>
    {foot}
    {actions && <div style={{ marginTop: 14 }}>{actions}</div>}
  </div>
);

// 하루의 세 장면 — 제목을 누르면 넘어간다
const DAY = [
  { t: '오늘 21:00', lv: '0.0', d: '어제와 같아요', where: '송정역시장 앞', state: '은 맑음', mm: 0, rain: false, line: '지금은 물이 없어요. 위험한 곳 3곳을 미리 표시해 뒀어요.' },
  { t: '오늘 22:40', lv: '0.1', d: '↑ 0.1', where: '송정역시장 앞', state: '은 비 많이', mm: 27, rain: true, line: '발목 높이까지 찼어요. 계획 A를 한 번 확인해 둘까요?' },
];
function KHome({ go, st, set }) {
  const [more, setMore] = React.useState(false);
  const d = DAY[st.day || 0];
  return (
    <>
      {d.rain && <div className="rain" />}
      <Top title={d.t} onTitle={() => set({ day: ((st.day || 0) + 1) % 2 })} right={<><IconBtn icon="bell" label="알림" onClick={() => go('kInbox')} /><IconBtn icon="plus" label="장소 추가" onClick={() => go('kPlan')} /></>} />
      <Hero
        big={<Big v={d.lv} u="m" delta={d.d} under={<><span>발목 0.1</span><span>무릎 0.5</span></>} />}
        pills={<><button className="pill" onClick={() => go('kSim')}>미리 겪기</button><button className="pill" onClick={() => go('kPlan')}>계획 A</button></>}
        place={<Place where={d.where} state={d.state} time="HOME PLATE · 1분 전 측정" />}
        stage={<Stage src={IMG('plate')} size={220} water={d.rain ? .08 : 0} glow={d.rain} pos="50% 40%">
          {d.rain && <Mark x={-6} y={40} icon="droplets" label="발목" tone="jade" />}
          <Mark x={196} y={16} icon="sun-dim" tone="amber" />
        </Stage>}
        foot={<div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <div className="b" style={{ flex: 1, fontSize: 14 }}>{d.line}</div>
          <Side v={d.mm} u="mm" label="강수량" />
        </div>}
        actions={d.rain ? <button className="btn btn-act" style={{ width: '100%' }} onClick={() => go('kAlert')}>경보가 오면 이렇게 보여요</button> : null}
      />
      <Bottom go={go} onMore={() => setMore(true)} />
      <MoreSheet open={more} close={() => setMore(false)} go={go} />
    </>
  );
}

// 미리 겪기 — 3D 레벨 장면을 원반에 담고 물을 채워 본다
const LV = [['0.1', '발목', '시장길 가운데 문턱이 먼저 잠겨요.', .14], ['0.5', '무릎', '남쪽 골목은 보조기로 지나기 어려워요.', .42], ['0.9', '허리', '광장까지 잠겨요. 이때는 나루를 불러요.', .7]];
function KSim({ go, st, set }) {
  const i = st.lv ?? 0, L = LV[i];
  return (
    <>
      <Top title="미리 겪기" onBack={() => go('kHome')} right={<IconBtn icon="map" label="위에서 보기" onClick={() => go('kPlan')} />} />
      <Hero
        big={<Big v={L[0]} u="m" delta={L[1] + ' 높이'} under={<span>3D 레벨 · 1913 송정역시장</span>} />}
        pills={LV.map((x, k) => <button key={k} className={'pill' + (k === i ? ' on' : '')} onClick={() => set({ lv: k })}>{x[1]}</button>)}
        place={<Place icon="map-pin" where="시장길 남쪽 골목" state={i ? '잠김' : '문턱까지'} />}
        stage={<Stage src={SCN('corner')} size={232} water={L[3]} pos="50% 55%" zoom={1.25}>
          <Mark x={-10} y={70} icon="footprints" label="문턱 12cm" />
          {i > 0 && <Mark x={186} y={150} icon="accessibility" tone="amber" />}
        </Stage>}
        foot={<div className="b" style={{ fontSize: 14, textAlign: 'center' }}>{L[2]}</div>}
        actions={<button className="btn btn-act" style={{ width: '100%' }} onClick={() => go('kPlan')}>이 높이에 맞춰 계획 세우기</button>}
        bottom={34}
      />
    </>
  );
}

// 대비 계획 A — 원반 안에 위에서 본 길
const PlanDisc = ({ progress = 1 }) => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <img src={SCN('street-aerial')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.35) brightness(1.08)', opacity: .7 }} />
    <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <path d="M 54 92 L 54 52 Q 54 40 66 40 L 82 40" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 54 92 L 54 52 Q 54 40 66 40 L 82 40" fill="none" stroke="var(--jade)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray={`${progress} 1`} />
      <circle cx="54" cy="66" r="4.2" fill="#fff" stroke="var(--fg1)" strokeWidth=".8" /><text x="54" y="67.6" textAnchor="middle" fontSize="4.6" fontWeight="700" fill="#17181B">1</text>
      <circle cx="82" cy="40" r="5" fill="#17181B" /><circle cx="82" cy="40" r="9" fill="none" stroke="var(--amber)" strokeWidth="1" className="breath" />
      <circle cx="54" cy="92" r="3.6" fill="#fff" stroke="var(--jade)" strokeWidth="1.8" />
    </svg>
  </div>
);
function KPlan({ go, st, set }) {
  const b = st.plan === 'B';
  return (
    <>
      <Top title={'대비 계획 ' + (b ? 'B' : 'A')} onBack={() => go('kHome')} right={<IconBtn icon="share" label="가족과 나누기" />} />
      <Hero
        big={<Big v={b ? '11' : '7'} u="분" delta={b ? '광장 쪽' : '문턱 없는 길'} under={<span>승강장 {b ? 'B' : 'A'}까지 · 보조기 걸음<Ex /></span>} />}
        pills={['A', 'B'].map(k => <button key={k} className={'pill' + ((b ? 'B' : 'A') === k ? ' on' : '')} onClick={() => set({ plan: k })}>계획 {k}</button>)}
        place={<Place icon="route" where="물이 무릎에 닿기 전" state="출발" />}
        stage={<Stage size={232} top={<PlanDisc />}>
          <Mark x={196} y={60} icon="bus" label="승강장" right />
        </Stage>}
        foot={<Card pad="2px 16px">
          <Row icon="footprints" title="1번 문턱은 오른쪽 경사로로" sub="3D 데이터 · 높이 12cm" />
          <Row icon="package" title="KEEPER 키트 챙기기" sub="가방 속 · 현관 옆" last />
        </Card>}
        actions={<button className="btn btn-act" style={{ width: '100%' }} onClick={() => go('kHome')}>이 계획으로 저장</button>}
        bottom={34}
      />
    </>
  );
}

// 내 걸음 — 같은 길, 다른 위험
const WALK = { aid: ['보조기', '3', '문턱 하나를 돌아가요.'], wheel: ['휠체어', '4', '폭 90cm보다 좁은 골목을 피해요.'], walk: ['걸어요', '1', '물이 먼저 차는 곳만 피해요.'] };
function SWalk({ go, st, set }) {
  const w = st.walk || 'aid', W = WALK[w];
  return (
    <>
      <Top title="내 걸음" onBack={() => go('kHome')} />
      <Hero
        big={<Big v={W[1]} u="곳" delta="이 걸음에 위험한 곳" under={<span>같은 시장길도 걸음마다 달라요</span>} />}
        pills={null}
        place={<div style={{ display: 'flex', gap: 6 }}>{Object.entries(WALK).map(([k, v]) => <button key={k} className={'pill' + (k === w ? ' on' : ' mute')} style={{ height: 34, padding: '0 16px', fontSize: 13.5 }} onClick={() => set({ walk: k })}>{v[0]}</button>)}</div>}
        stage={<Stage size={232} top={<PlanDisc />}>
          {w !== 'walk' && <Mark x={-12} y={140} icon="footprints" label="문턱" />}
          {w === 'wheel' && <Mark x={190} y={170} icon="move-horizontal" label="좁음" right />}
        </Stage>}
        foot={<div className="b" style={{ fontSize: 14, textAlign: 'center' }}>{W[2]}</div>}
        actions={<button className="btn btn-act" style={{ width: '100%' }} onClick={() => go('kPlan')}>이 걸음으로 길 다시 찾기</button>}
        bottom={34}
      />
    </>
  );
}

// 가족 · 나
function KFamily({ go }) {
  return (
    <>
      <Top title="가족 · 나" onBack={() => go('kHome')} right={<IconBtn icon="settings" label="설정" />} />
      <div className="in" style={{ position: 'absolute', top: 104, left: 20, right: 20, bottom: 30, overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '6px 4px 18px' }}>
          <img src="assets/people/sunrye.png" alt="박순례 님" style={{ width: 68, height: 68, borderRadius: 34, objectFit: 'cover', objectPosition: '50% 22%', boxShadow: '0 0 0 1px var(--line)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="h1" style={{ fontSize: 20 }}>박순례 님</div>
            <div className="s">보조기 걸음 · 계획 A · 승강장 A</div>
          </div>
          <button onClick={() => go('gWatch')} className="pill" style={{ borderColor: 'var(--jade)', color: 'var(--jade)' }}>
            <i className="breath" style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--jade)' }} />지켜보기
          </button>
        </div>
        <div className="lb" style={{ margin: '4px 4px 8px' }}>지켜보는 가족</div>
        <Card>
          <Row icon="user" title="지우 · 손녀" sub="경보·호출·도착을 받아요" right={<span className="c" style={{ color: 'var(--jade)', fontWeight: 600 }}>연결됨</span>} onClick={() => go('gWatch')} />
          <Row icon="video" title="차 안 CCTV 보기" sub="이동하는 동안만 · 순례 님이 허락했어요" onClick={() => go('gWatch')} right={<Ico name="chevron-right" size={16} />} />
          <Row icon="user-plus" title="가족 더 부르기" sub="문자로 초대해요" last />
        </Card>
        <div className="lb" style={{ margin: '20px 4px 8px' }}>무엇을 나눌까요</div>
        <Card>
          <Row title="경보가 오면 알리기" right={<Toggle on />} />
          <Row title="나루를 부르면 알리기" right={<Toggle on />} />
          <Row title="내 위치 계속 나누기" sub="경보 중에만" right={<Toggle />} last />
        </Card>
        <div className="lb" style={{ margin: '20px 4px 8px' }}>나</div>
        <Card>
          <Row icon="footprints" title="내 걸음" sub="보조기" onClick={() => go('sWalk')} right={<Ico name="chevron-right" size={16} />} />
          <Row icon="settings" title="설정" sub="글자 크기 · 알림 · 개인정보" last onClick={() => go('kSettings')} right={<Ico name="chevron-right" size={16} />} />
        </Card>
      </div>
    </>
  );
}

// 알림함
function KInbox({ go }) {
  const N = [['22:40', 'HOME PLATE', '집 앞 물이 발목(0.1m)에 닿았어요.', true], ['21:00', 'NARU HAND', '배터리가 64%예요. 오늘 밤 충전하면 좋아요.'], ['어제', '나루', '7월 연습을 마쳤어요. 승강장까지 7분.']];
  return (
    <>
      <Top title="알림" onBack={() => go('kHome')} />
      <div className="in" style={{ position: 'absolute', top: 108, left: 20, right: 20 }}>
        {N.map(([t, who, m, on]) => (
          <div key={t} style={{ display: 'flex', gap: 14, padding: '16px 4px', borderBottom: '1px solid var(--line)' }}>
            <span className={on ? 'dot breath' : ''} style={on ? { marginTop: 6 } : { width: 8, height: 8, borderRadius: 4, background: 'var(--line2)', marginTop: 6, flexShrink: 0 }} />
            <div style={{ flex: 1 }}><div className="lb" style={{ color: 'var(--fg2)' }}>{who}</div><div style={{ fontSize: 15, marginTop: 4, lineHeight: 1.5 }}>{m}</div></div>
            <span className="c nw">{t}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// 시작
function SSplash({ go }) {
  return (
    <>
      <div className="in" style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Logo h={22} />
          <div className="lb" style={{ marginTop: 10, fontSize: 11.5 }}>나루 · 이동형 대피소</div>
        </div>
        <div style={{ position: 'absolute', top: 168, left: 0, right: 0, height: 312, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(closest-side, var(--amber-soft), transparent)' }} />
          <img src="assets/mascot/m-wave.png" alt="" style={{ position: 'relative', height: 268, animation: 'n9bob 4.6s ease-in-out infinite' }} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 196, textAlign: 'center', padding: '0 26px' }}>
          <div className="h1" style={{ fontSize: 24 }}>물이 오기 전에,<br />나루가 먼저 알아요.</div>
          <div className="s" style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.6 }}>우리 집 앞 물 높이를 재고,<br />내 걸음에 맞는 길을 찾아요.</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 40, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button className="btn btn-act" onClick={() => go('sWalk')}>시작하기</button>
        <button className="btn btn-line" onClick={() => go('kHome')}>둘러보기</button>
      </div>
    </>
  );
}

Object.assign(window, { Hero, KHome, KSim, KPlan, SWalk, KFamily, KInbox, SSplash, PlanDisc });
