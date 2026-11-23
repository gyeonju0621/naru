// NARU v9.1 · 전체 화면 큐브맵 — 홈 · 미리 겪기 · 계획 · 내 걸음 · 경보 · 길 안내
// UE5 6면 큐브맵이 화면 전체를 채우고, UI는 위(숫자)와 아래(시트) 두 덩어리만 얹는다.

const TopScrim = ({ h = 340, solid = 0 }) => <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: h, background: `linear-gradient(180deg, var(--bg) 0%, var(--bg) 34%, color-mix(in oklab, var(--bg) ${94 - solid}%, transparent) 52%, transparent)`, pointerEvents: 'none', zIndex: 3 }} />;

// 위 덩어리 — 큰 숫자 + 알약
const Over = ({ big, pills, top = 102 }) => (
  <div className="in" style={{ position: 'absolute', top, left: 22, right: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10, pointerEvents: 'none' }}>
    <div style={{ pointerEvents: 'auto' }}>{big}</div>
    <div style={{ display: 'flex', gap: 6, paddingTop: 8, pointerEvents: 'auto' }}>{pills}</div>
  </div>
);

// 아래 덩어리 — 마스코트 + 한 줄 + 행동
const Dock = ({ say, sub, mood, children, side }) => (
  <div className="in" style={{ position: 'absolute', left: 10, right: 10, bottom: 10, background: 'var(--card)', borderRadius: 34, padding: '18px 18px 22px', zIndex: 12, boxShadow: '0 -10px 40px -20px rgba(0,0,0,.25)' }}>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <NaruMark size={42} alert={mood === 'alert'} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.42, letterSpacing: '-.022em', textWrap: 'pretty' }}>{say}</div>
        {sub && <div className="s" style={{ marginTop: 2 }}>{sub}</div>}
      </div>
      {side}
    </div>
    {children && <div style={{ marginTop: 14 }}>{children}</div>}
  </div>
);

const Glass = ({ children, style }) => <div style={{ background: 'color-mix(in oklab, var(--card) 90%, transparent)', WebkitBackdropFilter: 'blur(14px)', backdropFilter: 'blur(14px)', borderRadius: 20, ...style }}>{children}</div>;

// ─ 홈 — 우리 동네가 화면 전체
const DAY9 = [
  { t: '오늘 21:00', lv: '0.0', d: '어제와 같아요', w: 0, rain: false, say: '지금은 물이 없어요.', sub: '위험한 곳 3곳을 미리 표시해 뒀어요', mm: 0 },
  { t: '오늘 22:40', lv: '0.1', d: '↑ 0.1', w: .1, rain: true, say: '발목까지 찼어요. 계획 A를 확인해 둘까요?', sub: 'HOME PLATE · 1분 전', mm: 27 },
];
function KHome({ go, st, set, ui }) {
  const [more, setMore] = React.useState(!!(ui && ui.more));
  const d = DAY9[st.day || 0];
  return (
    <>
      <CubeView yaw={-18} pitch={14} water={d.w} route="aid" progress={0} hazards={[[190, 300, '1'], [190, 250, '2']]} hudTop={266} walk={st.walk}
        scene="corner" tags={[{ x: '30%', y: 262, label: '1 · 문턱 12cm' }, { x: '74%', y: 210, label: '승강장 A', dark: true }]} />
      {d.rain && <div className="rain" style={{ zIndex: 2 }} />}
      <TopScrim />
      <Top title={d.t} onTitle={() => set({ day: ((st.day || 0) + 1) % 2 })} right={<><IconBtn icon="bell" label="알림" onClick={() => go('kInbox')} /><IconBtn icon="plus" label="장소" onClick={() => go('kPlaces')} /></>} />
      <Over big={<Big v={d.lv} u="m" delta={d.d} under={<span>송정역시장 앞 · 집 앞 물 높이</span>} />}
        pills={<Side v={d.mm} u="mm" label="강수량" style={{ paddingTop: 0 }} />} />
      <Dock say={d.say} sub={d.sub} mood={d.rain ? 'alert' : 'calm'}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-line" style={{ flex: 1, height: 50 }} onClick={() => go('kSim')}>미리 겪기</button>
          <button className="btn btn-act" style={{ flex: 1.3, height: 50 }} onClick={() => go(d.rain ? 'kAlert' : 'kPlan')}>{d.rain ? '경보 화면 보기' : '내 계획 A'}</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, padding: '0 6px' }}>
          <IconBtn icon="sparkles" label="AI 나루" onClick={() => go('kAi')} />
          <button onClick={() => setMore(true)} style={{ border: 0, background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}><span className="c" style={{ color: 'var(--fg2)' }}>더보기</span><Ico name="chevron-down" size={14} stroke={2} style={{ color: 'var(--fg3)' }} /></button>
          <IconBtn icon="circle-user" label="가족·나" onClick={() => go('kFamily')} />
        </div>
      </Dock>
      <MoreSheet open={more} close={() => setMore(false)} go={go} />
    </>
  );
}

// ─ 미리 겪기 — 물이 차오르는 것을 그 자리에서
const LV9 = [['0.1', '발목', '시장길 가운데 문턱이 먼저 잠겨요.', .1], ['0.5', '무릎', '남쪽 골목은 보조기로 지나기 어려워요.', .5], ['0.9', '허리', '광장까지 잠겨요. 이때는 나루를 불러요.', .9]];
// 파노라마가 있을 때: 실제로 렌더한 수위(지점 바닥 기준 0 · 30 · 50 · 100cm)만 고를 수 있게 한다
const LVP = [['0.0', '지금', '물이 차기 전, 지금의 시장길이에요.', 0], ['0.3', '종아리', '흙탕물에 바닥이 보이지 않아요.', .3], ['0.5', '무릎', '무릎 높이예요. 보조기로는 지나기 어려워요.', .5], ['1.0', '허리', '허리까지 차요. 이때는 나루를 불러요.', 1]];
const WALKNAME = { aid: '보조기', wheel: '휠체어', walk: '걸어요' };
function KSim({ go, st, set }) {
  const pano = usePanoReady();
  const LV = pano ? LVP : LV9;
  const i = Math.min(st.lv ?? 0, LV.length - 1), L = LV[i];
  const pi = Math.min(st.pt ?? 1, PANO.points.length - 1), w = st.walk || 'aid';
  return (
    <>
      <CubeView yaw={0} pitch={6} water={L[3]} hud={false} walk={w}
        scene={pano ? ['crosswalk', 'corner', 'plaza'][pi] : 'corner'} tags={[{ x: '28%', y: 264, label: '문턱 12cm' }, ...(i ? [{ x: '72%', y: 258, label: '보조기 어려움', amber: true }] : [])]} />
      <TopScrim />
      <Top title="미리 겪기" onBack={() => go('kHome')} />
      <Over top={140} big={<Big v={L[0]} u="m" delta={pano && !i ? '물 없음' : L[1] + ' 높이'} under={pano ? <span>{WALKNAME[w]} 눈높이 {(PANO.walkEye[w] / 100).toFixed(1)}m · 1913 송정역시장</span> : null} />} />
      {pano && <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 226, zIndex: 11 }}>
        <Glass style={{ display: 'flex', padding: 3, borderRadius: 20 }}>{PANO.points.map(([k, l], n) => <button key={k} onClick={() => set({ pt: n })} aria-pressed={n === pi} style={{ height: 34, padding: '0 16px', border: 0, borderRadius: 17, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: n === pi ? 'var(--act)' : 'transparent', color: n === pi ? 'var(--on-act)' : 'var(--fg2)' }}>{l}</button>)}</Glass>
      </div>}
      <Dock say={L[2]} sub="화면을 끌어 사방을 둘러보세요">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>{LV.map((x, k) => <button key={k} className={'pill' + (k === i ? ' on' : '')} aria-pressed={k === i} style={{ flex: 1, height: 38, justifyContent: 'center', fontSize: pano ? 14 : 13.5, padding: pano ? '0 4px' : undefined }} onClick={() => set({ lv: k })}>{pano ? x[1] : x[1] + ' ' + x[0]}</button>)}</div>
        <button className="btn btn-act" style={{ width: '100%' }} onClick={() => go('kPlan')}>이 높이에 맞춰 계획 세우기</button>
      </Dock>
    </>
  );
}

// ─ 대비 계획 — 위에서 내려다본 큐브 바닥 = 평면도
function KPlan({ go, st, set, ui }) {
  const b = st.plan === 'B';
  const [look, setLook] = React.useState(ui && ui.look === 'front' ? 'front' : 'top');
  return (
    <>
      <CubeView pitch={look === 'top' ? 86 : 10} hud={false} route="aid" progress={1} hazards={[[190, 300, '1']]} walk={st.walk}
        tags={look === 'top' ? [] : [{ scene: 'corner', x: '38%', y: 280, label: '1 · 문턱' }, { x: '74%', y: 224, label: '승강장 A', dark: true }]} />
      {look === 'top' ? <TopScrim h={210} solid={40} /> : <TopScrim />}
      <Top title={'대비 계획 ' + (b ? 'B' : 'A')} onBack={() => go('kHome')} right={<IconBtn icon="share" label="가족과 나누기" />} />
      <Over top={140} big={<Big v={b ? '11' : '7'} u="분" delta={b ? '광장 쪽' : '문턱 없는 길'} under={<span>승강장 {b ? 'B' : 'A'}까지 · 보조기<Ex /></span>} />}
        pills={['A', 'B'].map(k => <button key={k} className={'pill' + ((b ? 'B' : 'A') === k ? ' on' : '')} onClick={() => set({ plan: k })}>계획 {k}</button>)} />
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 290, zIndex: 11 }}>
        <Glass style={{ display: 'flex', padding: 3, borderRadius: 20 }}>{[['top', '위에서'], ['front', '눈높이']].map(([k, l]) => <button key={k} onClick={() => setLook(k)} style={{ height: 34, padding: '0 16px', border: 0, borderRadius: 17, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: look === k ? 'var(--act)' : 'transparent', color: look === k ? 'var(--on-act)' : 'var(--fg2)' }}>{l}</button>)}</Glass>
      </div>
      <Dock say="물이 무릎에 닿기 전에 출발해요." sub="계획을 가족에게도 보내 둘게요">
        <Card pad="0 14px" style={{ boxShadow: 'none', background: 'var(--tray)' }}>
          <Row icon="footprints" title="1번 문턱은 오른쪽 경사로로" sub="3D 데이터 · 높이 12cm" />
          <Row icon="package" title="KEEPER 키트 챙기기" sub="가방 속 · 현관 옆" last />
        </Card>
        <button className="btn btn-act" style={{ width: '100%', marginTop: 12 }} onClick={() => go('kHome')}>이 계획으로 저장</button>
      </Dock>
    </>
  );
}

// ─ 내 걸음 — 같은 바닥, 다른 위험
const WALK9 = { aid: ['보조기', '3', '문턱 하나를 돌아가요.'], wheel: ['휠체어', '4', '폭 90cm보다 좁은 골목을 피해요.'], walk: ['걸어요', '1', '물이 먼저 차는 곳만 피해요.'] };
function SWalk({ go, st, set }) {
  const w = st.walk || 'aid', W = WALK9[w];
  // 큰 숫자(1·3·4곳)와 지도 위 표시 개수를 맞춘다. 예전 3번(360, 228)은 화면 밖으로 잘렸다
  const hz = w === 'walk' ? [[300, 290, '1']] : w === 'wheel' ? [[300, 290, '1'], [300, 240, '2'], [300, 340, '3'], [260, 300, '4']] : [[300, 290, '1'], [300, 240, '2'], [300, 340, '3']];
  return (
    <>
      <CubeView yaw={0} pitch={84} hud={false} route={w === 'walk' ? 'walk' : 'aid'} progress={1} hazards={hz} />
      <TopScrim />
      <Top title="내 걸음" onBack={() => go('kHome')} />
      <Over top={140} big={<Big v={W[1]} u="곳" delta="이 걸음에 위험한 곳" under={<span>같은 시장길도 걸음마다 달라요</span>} />} />
      <Dock say={W[2]} sub="3D 데이터의 높이·폭·문턱 기준">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>{Object.entries(WALK9).map(([k, v]) => <button key={k} className={'pill' + (k === w ? ' on' : ' mute')} style={{ flex: 1, height: 38, justifyContent: 'center', fontSize: 13.5 }} onClick={() => set({ walk: k })}>{v[0]}</button>)}</div>
        <button className="btn btn-act" style={{ width: '100%' }} onClick={() => go('kPlan')}>이 걸음으로 길 찾기</button>
      </Dock>
    </>
  );
}

// ─ 경보 — 같은 동네, 비와 물
function KAlert({ go, st }) {
  return (
    <>
      <CubeView yaw={-12} pitch={10} water={.3} route="aid" progress={0} hudTop={266} walk={st.walk}
        scene="crosswalk" tags={[{ x: '56%', y: 250, label: '남쪽 골목 · 물 차는 중', amber: true }]} />
      <div className="rain" style={{ zIndex: 2 }} />
      <TopScrim />
      <Top title="23:02 · 호우 경보" onBack={() => go('kHome')} right={<IconBtn icon="phone" label="119" />} />
      <Over big={<Big v="40" u="분" delta="뒤 무릎 높이" under={<span>집 앞 HOME PLATE 기준<Ex /></span>} />}
        pills={<span className="pill" style={{ borderColor: 'var(--amber)', color: 'var(--amber)' }}><span className="dot breath" style={{ width: 6, height: 6 }} />경보</span>} />
      <Dock mood="alert" say="계획 A대로 승강장 A로 가요." sub="재난문자 23:01 · 승강장까지 7분" side={<Side v="7" u="분" label="승강장 A" tone="var(--fg1)" />}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-line" style={{ flex: 1 }} onClick={() => go('kCall')}>나루 부르기</button>
          <button className="btn btn-act" style={{ flex: 1.4 }} onClick={() => go('kGuide')}>길 안내 시작</button>
        </div>
      </Dock>
    </>
  );
}

// ─ 길 안내 — 눈높이(앞) ↔ 위에서, 같은 큐브의 시점만 바뀐다
const G9 = [
  { yaw: 0, scene: 'corner', d: 12, ic: 'corner-up-right', t: '경사로 쪽으로 오른쪽', s: '가운데 문턱 12cm를 피해요', p: .3, tags: [{ x: '26%', y: 258, label: '문턱 12cm' }, { x: '70%', y: 212, label: '경사로', dark: true }] },
  { yaw: 62, scene: 'plaza', d: 40, ic: 'arrow-up', t: '광장 왼쪽 가장자리로', s: '왼쪽이 조금 더 높아요', p: .7, tags: [{ x: '60%', y: 214, label: '승강장 A · 40m', dark: true }] },
  { yaw: 96, scene: 'gate', d: 8, ic: 'map-pin', t: '승강장 A 도착', s: '기둥 옆에서 기다려요', p: 1, tags: [{ x: '54%', y: 218, label: '나루 · 3분', amber: true }] },
];
function KGuide({ go, st, set }) {
  const v = st.view || 'front', i = st.g ?? 0, S = G9[i];
  return (
    <>
      <CubeView yaw={v === 'top' ? 0 : S.yaw} pitch={v === 'top' ? 86 : 22} route="aid" progress={S.p} hazards={[[300, 290, '1']]} tags={v === 'top' ? [] : S.tags} hudTop={104} drift={false} scene={S.scene} walk={st.walk} />
      <div style={{ position: 'absolute', top: 54, left: 10, right: 14, display: 'flex', alignItems: 'center', zIndex: 20 }}>
        <Glass style={{ borderRadius: 20 }}><IconBtn icon="chevron-left" label="뒤로" onClick={() => go('kAlert')} /></Glass>
        <div style={{ flex: 1 }} />
        <Glass style={{ display: 'flex', padding: 3 }}>{[['front', '눈높이'], ['top', '위에서']].map(([k, l]) => <button key={k} onClick={() => set({ view: k })} style={{ height: 34, padding: '0 14px', border: 0, borderRadius: 17, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: v === k ? 'var(--act)' : 'transparent', color: v === k ? 'var(--on-act)' : 'var(--fg2)' }}>{l}</button>)}</Glass>
      </div>
      <div className="in" key={i} style={{ position: 'absolute', left: 10, right: 10, bottom: 10, background: 'var(--card)', borderRadius: 34, padding: '18px 18px 22px', zIndex: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 54, height: 54, borderRadius: 27, background: 'var(--act)', color: 'var(--on-act)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ico name={S.ic} size={24} stroke={2.2} /></div>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}><span className="big" style={{ fontSize: 60 }}>{S.d}</span><span className="big-u" style={{ paddingTop: 6 }}>m</span></div>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'right' }}><div className="c">남은 시간</div><div className="nw" style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>{['4분', '2분', '도착'][i]}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
          <NaruMark size={32} />
          <div><div className="h2">{S.t}</div><div className="s">{S.s}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="btn btn-line" style={{ flex: 1 }} onClick={() => go('kCall')}>나루 부르기</button>
          <button className="btn btn-act" style={{ flex: 1.4 }} onClick={() => i < 2 ? set({ g: i + 1 }) : (set({ g: 0 }), go('kCall'))}>{i < 2 ? '다음' : '여기서 기다리기'}</button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { KHome, KSim, KPlan, SWalk, KAlert, KGuide, Dock, Over, Glass, TopScrim });
