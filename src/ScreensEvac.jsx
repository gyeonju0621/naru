// NARU · 대피 화면 (2026-11-23 공공 서비스판 · 정리)
// 갈 곳 = 안전한 곳: 입구 밖(물이 들기 전에) 또는 레벨에서 잰 높은 건물(물이 들면). '나가지 않아요'는 없다.
// 색 판 = 지금의 상태: 평소 · 연습 = 파랑('연습 · 실제 아님' 표), 실제 경보 = 빨강. 판 위의 글은 흰색 · 본문 크기 이상.
// 배경데이터가 먼저: 길 · 물 화면은 원본 렌더가 화면 가득, 그 위에 색 판 하나와 길 · 위험 · 거리만.
// 실제 경보의 말은 '…세요', 연습은 '…요'. 길이 막히면 '다른 곳으로'(막다른 화면이 없다).
// 자리: 3D 장면 화면 = 판(위) · 단추(아래)가 장면 위에 뜬다 / 그 밖의 화면 = 머리 → 몸(스크롤) → 발(단추) → 탭.
// 판단은 그대로(Market.jsx decide).

const eGait = st => st.walk || 'aid';
const eDrill = st => st.mode === 'drill';
const eFlow = st => (eDrill(st) && st.flow ? st.flow : MARKET.water.flow);
const eLevel = st => (eDrill(st) ? WATER_BANDS[Math.min(st.lv ?? 0, WATER_BANDS.length - 1)].m : 0);
const eDecide = st => decide(eGait(st), minutesUntil(eLevel(st)), eFlow(st));
const eSafe = st => { const D0 = decide(eGait(st), 0); return D0.list.find(s => s.id === st.dest && s.ok) || D0.best || MARKET.safe[0]; };
const manhole = () => MARKET.hazards.find(z => z.kind === 'manhole');
const GPICT = { walk: 'walk', aid: 'walker', wheel: 'wheel' };
// 큰 숫자: 숫자는 굵게, 단위는 본문 크기
const Num = ({ v, u, ink, on }) => <span className={'ar-n' + (ink ? ' ink' : '') + (on ? ' on' : '')}><b>{v}</b><i>{u}</i></span>;
// 가는 길 조심할 곳으로 (실제 경보 · 연습의 첫 화면, 단추 줄의 맨 위)
const RiskPill = ({ n, onClick }) => (
  <button className="ar-risk" onClick={onClick}><span className="ic"><Ico name="triangle-alert" size={20} stroke={2.2} /></span>가는 길 조심할 곳 {n}곳<span className="gt"><Ico name="chevron-right" size={20} stroke={2} /></span></button>
);

// 작은 사진은 2048 사본(assets/pano/lo, 원본에서 줄인 사본)으로: 사진마다 4096을 풀지 않게
const loSrc = src => (src && src.indexOf('/lo/') < 0 && PANO.have && PANO.have.has(src.split('/').pop()) ? src.replace(/([^/]+)$/, 'lo/$1') : src);
// 갈 곳 · 도착한 곳의 실제 모습: 렌더를 그쪽으로 돌려 본 한 장 (2026-11-22 실제 렌더로 잰 시선)
//   입구 = P01에서 '1913 송정역시장' 아치 쪽(yaw 350) · 건물 = 문 앞 마지막 걸음 자리에서 문 쪽
const PLACE_VIEW = { s0: { p: 'P01', yaw: 350, pitch: 14, vfov: 54 } };
const placeView = safe => {
  if (!safe) return null;
  if (safe.tall && window.walkPlan) { const pl = walkPlan(safe); if (pl) return { p: pl.to, yaw: wYaw(pl.face), pitch: 12, vfov: 62 }; }
  return PLACE_VIEW[safe.id] || null;
};
function PlaceShot({ safe, eye = 140, w = '100%', h = 112, tight, children }) {
  // tight = 목록의 작은 사진: 간판 쪽으로 더 바짝(48px에서도 아치 · 간판이 보이게)
  const v0 = placeView(safe), v = v0 && tight ? { ...v0, vfov: 36, pitch: v0.pitch + 3 } : v0, s = useSlot(v ? v.p : 'P01', eye, 0, false), real = !!s.src && !PANO.test;
  const src = real ? loSrc(s.src) : s.src;
  if (!v) return null;
  return (
    <div className="rk-shot" aria-hidden={children ? undefined : true} style={{ width: w, height: h }}>
      {s.src ? <div style={{ position: 'absolute', inset: 0, filter: real ? AR_GRADE : undefined }}><PanoView src={src} yaw0={v.yaw} pitch0={v.pitch} vfov={v.vfov} interactive={false} testTag={false} /></div>
        : <div className="rk-none"><Ico name="image" size={22} stroke={1.8} /></div>}
      {children}
    </div>
  );
}
// 도착한 뒤(실제 경보): 판 아래 바탕에 등불 든 나루 + 그곳의 실제 모습 (나루는 빨간 판 위에 두지 않는다)
const Arrived = ({ pose, safe }) => (
  <div className="ar-in arr">
    <Naru pose={pose} h={placeView(safe) ? 128 : 180} float style={{ position: 'relative' }} />
    {placeView(safe) && <div className="ar-card" style={{ alignSelf: 'stretch', padding: 8 }}><PlaceShot safe={safe} h={148}><span className="ar-mlab" style={{ left: 8, bottom: 8 }}><Ico name="map-pin" size={16} stroke={2.2} />여기 · {placeShort(safe)}</span></PlaceShot></div>}
  </div>
);
// 안전한 곳 한 줄 (대피 탭 · 경보 중 고르기 · 다른 곳으로)
const PlaceRow = ({ s, real, on, ok = true, sub, dist, tag, onClick }) => (
  <button className={'ar-row' + (real ? ' real' : '') + (on ? ' on' : '') + (ok ? '' : ' off')} aria-disabled={!ok} aria-pressed={on == null ? undefined : !!on} onClick={() => ok && onClick && onClick(s)}>
    <span className="ic">{placeView(s) ? <PlaceShot safe={s} w={48} h={48} tight /> : <Ico name={s.outside ? 'train-front' : s.tall ? 'building-2' : 'door-open'} size={24} stroke={2} />}</span>
    <span className="tx"><span className="nm">{placeName(s)}</span><span className="sb">{tag ? <><b>{tag}</b> · </> : null}{sub}</span></span>
    <span className="rt">{dist}<i>m</i></span>
  </button>
);

// ─ 1. 지금: 평소 = 홈 · 실제 경보 = 장면 위의 빨간 판 · 연습 결과 = 장면(물) 위의 파란 판
// 경보 문장(소리로 읽을 글): 보낸 곳 → 할 일 → 거리
const alertSpeech = st => { const D = eDecide(st), b = D.best; return `${eDrill(st) ? '연습이에요.' : '기상청 호우경보.'} ${D.act === 'go' ? '입구 밖으로 나가' : `${b.short} ${b.floors}층으로 올라가`}${eDrill(st) ? '요' : '세요'}. 안전한 곳까지 ${b.dist}미터.`; };
function ENow({ go, st, set, night, ui = {}, pop, toast }) {
  const g = eGait(st), drill = eDrill(st), alert = !!st.alert || drill, T = ltTime(night);
  // 실제 경보가 열리면 그 경보에 한 번만: 소리로 읽고(내 정보 '소리로 읽기') 진동 · 빛(내 정보 '진동과 빛'). 캡처(still)에서는 쉬게
  //   다른 화면에 다녀와도 다시 울리지 않는다(st.alertSaid — 경보를 새로 받으면 지워진다)
  const realNow = !!st.alert && !drill && !st.arrived, [flash, setFlash] = React.useState(false);
  React.useEffect(() => {
    if (!realNow || ui.still || st.alertSaid) return;
    set({ alertSaid: 1 });
    if (st.voice !== false) naruSay(alertSpeech(st));
    if (st.buzz === false) return;
    try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate([400, 200, 400]); } catch (e) { }
    setFlash(true); const t = setTimeout(() => setFlash(false), 2600); return () => clearTimeout(t);
  }, [realNow]);
  if (!alert) return <EHome go={go} st={st} set={set} night={night} ui={ui} pop={pop} />;
  const D = eDecide(st), b = D.best, lvl = eLevel(st), help = D.act === 'help';
  // 연습을 닫는다 (연습은 실제 경보를 끄지 않는다)
  const quit = () => { set({ mode: 'real', step: 0, at: null, wfrom: null, drilled: drill ? (st.drilled || 0) + 1 : st.drilled }); go(st.from === 'find' ? 'eFind' : 'eNow'); };
  const toGuide = more => { set({ dest: b.id, step: 0, at: null, rkFocus: null, rkMode: null, walkS: null, walkFrom: null, detourAt: null, ...(more || {}) }); go('eGuide'); };
  const toRisk = () => { set({ dest: b.id, rk: 'eNow' }); go('eRisk'); };
  if (drill) {
    const title = D.act === 'go' ? <><b>입구 밖</b>으로 나가요</> : <><b>{b.short} {b.floors}층</b>으로 올라가요</>;
    // 물이 내 걸음의 못 가는 높이(예시)에 닿았으면: 갈 곳은 그대로, 혼자 걷지 말고 도움을 받아 (도움 받기 · 다른 곳 화면으로)
    const sub = help ? <>안전한 곳까지 {b.dist}m · 도움을 받아 가요<br />{D.fast ? `물살이 빨라 ${GAITS[g].by}는 더 위험해요` : `${GAITS[g].by}는 혼자 못 가는 물이에요`}<ArEx /></>
      : `안전한 곳까지 ${b.dist}m` + (D.act === 'up' && b.help ? ' · 계단은 도움을 받아요' : '');
    return (
      <>
        <AlertScene safe={b} g={g} w={Math.round(lvl * 100)} />
        <Band over round left={<><ArBack on icon="x" label="연습 닫기" onClick={quit} /><PracChip on /></>} right={st.voice !== false ? <Replay on text={alertSpeech(st)} toast={toast} /> : null}>
          <div className="ar-in">
            <h1 className="ar-h1">{title}</h1>
            <p className="ar-b2">{sub}</p>
            <p className="ar-flow"><LIc k={lvl && D.fast ? 'flow' : 'slow'} size={18} />{lvl ? `물이 ${bodyFor(bandOf(lvl), g)}까지 찼다면 · 물살 ${D.fast ? '빠름' : '느림'}` : '물이 들기 전이라면'}</p>
          </div>
        </Band>
        <div className="ar-btns">
          <RiskPill n={risksOn(b).length} onClick={toRisk} />
          {/* 도움이 필요한 물: 물 높이 화면과 같은 짝(길 미리 걷기 · 도움 요청)을 한 줄에 — 단추가 네 줄이 되어 장면과 알림을 가리지 않게 */}
          {help ? <div style={{ display: 'flex', gap: 8 }}>
            <button className="ar-btn sec flex0" onClick={() => toGuide({ from: 'drill' })}><Ico name="footprints" size={20} stroke={2.2} />길 미리 걷기</button>
            <button className="ar-btn" style={{ flex: 1, width: 'auto' }} onClick={() => { set({ detourAt: 'W00', detourFrom: 'now' }); go('eDetour'); }}>도움 요청</button>
          </div> : <button className="ar-btn" onClick={() => toGuide({ from: 'drill' })}><Ico name="footprints" size={20} stroke={2.2} />길 미리 걷기</button>}
          <button className="ar-btn sec" onClick={() => { set({ wfrom: 'drill' }); go('eWater'); }}>물 높이 바꾸기</button>
        </div>
      </>
    );
  }
  // 실제 경보 · 안전한 곳에 닿은 뒤: 나루 한 명 · 지금 할 일 한 문장
  if (st.arrived) {
    const at = MARKET.safe.find(s => s.id === st.arrived);
    const u = at && at.exit ? upNear(0) : null;      // 입구 밖: 물이 들면 갈 가장 가까운 높은 건물
    const say1 = u ? '찻길에서 떨어져 기다리세요' : '물이 빠질 때까지 여기 계세요';
    // 물이 들면 갈 길: 입구(P01)에서 그 건물 문까지 다시 안내한다 (막다른 화면이 없게)
    const toUp = () => { set({ dest: u.id, walkFrom: 'P01', walkS: null, arrived: null, from: 'wait', waitAt: at.id, rkFocus: null, rkMode: null, detourAt: null, detourFrom: null }); go('eGuide'); };
    return (
      <Page>
        <Band tone="real" round left={<RealChip on />} right={st.voice !== false ? <Replay on text={u ? `${say1}. 물이 들면 ${u.short} ${u.floors}층으로 가세요. ${u.dist}미터.` : say1} toast={toast} /> : null}>
          <div className="ar-in">
            <p className="ar-c">{at ? placeName(at) : '안전한 곳에 있어요'}</p>
            <h1 className="ar-h1">{u ? <>찻길에서 떨어져 <b>기다리세요</b></> : <>물이 빠질 때까지 <b>여기</b> 계세요</>}</h1>
            <p className="ar-b2">{u ? <>물이 들면<br />{u.short} {u.floors}층으로 가세요 · {u.dist}m</> : '경보가 끝나면 알려 드릴게요'}</p>
          </div>
        </Band>
        <Body><Arrived pose="lantern" safe={at} /></Body>
        {u ? <Foot row><button className="ar-btn danger flex0" onClick={() => pop && pop({ k: 'call', n: '119' })}><Ico name="phone" size={20} stroke={2.2} />119</button><button className="ar-btn sec" onClick={toUp}>물이 들면 높은 건물로</button></Foot>
          : <Foot><button className="ar-btn danger" onClick={() => pop && pop({ k: 'call', n: '119' })}><Ico name="phone" size={20} stroke={2.2} />119에 전화</button></Foot>}
      </Page>
    );
  }
  // 실제 경보: 보낸 곳 → 할 일 한 문장 → 거리 → 가게 1분. 바닥에 초록 길 · 단추
  const title = D.act === 'go' ? <><b>입구 밖</b>으로 나가세요</> : <><b>{b.short} {b.floors}층</b>으로 올라가세요</>;
  const more = help ? <><br />{GAITS[g].by}는 혼자 못 가요 · 도움을 받으세요</> : D.act === 'up' && b.help ? ' · 계단은 도움을 받으세요' : '';
  return (
    <>
      <AlertScene safe={b} g={g} />
      <Band tone="real" over round className={flash ? 'flash' : ''} left={<RealChip on />} right={st.voice !== false ? <Replay on text={alertSpeech(st)} toast={toast} /> : null}>
        <div className="ar-in" role="alert">
          <p className="ar-c al-src"><Ico name="megaphone" size={16} stroke={2.2} /><span><span className="nw">기상청 호우경보 ·</span> <span className="nw">{LOCAL.dong} · {T.alert}<ArEx /></span></span></p>
          <h1 className="ar-h1">{title}</h1>
          <p className="ar-b2">안전한 곳까지 {b.dist}m{more}</p>
          <p className="ar-flow"><Ico name="store" size={18} stroke={2.2} /><span><span className="nw">나가기 전 1분 ·</span> <span className="nw">전기 끄고 문만 잠그세요</span></span></p>
        </div>
      </Band>
      <div className="ar-btns">
        <RiskPill n={risksOn(b).length} onClick={toRisk} />
        <button className="ar-btn" onClick={() => toGuide({ from: null })}><Ico name="navigation-2" size={20} stroke={2.2} />길 안내 시작</button>
        <button className="ar-btn sec" onClick={() => { set({ detourAt: 'W00', detourFrom: 'now' }); go('eDetour'); }}>다른 곳으로</button>
      </div>
    </>
  );
}

// ─ 2. 대피 (평소 탭): 안전한 곳을 가까운 순서로 — 누르면 그 길을 미리 걷는다 / 경보 중: 다른 곳 고르기
function EFind({ go, st, set, night, ui = {}, pop }) {
  const g = eGait(st), D = eDecide(st);
  // 실제 경보 중에는 '다른 곳으로' 화면 하나로 (고르면 바로 안내 · 119도 거기서)
  if (st.alert && !eDrill(st)) return <EDetour go={go} st={{ ...st, detourFrom: st.detourFrom || 'now' }} set={set} pop={pop} ui={ui} />;
  const can = s => s.intime;
  const near = [...D.list].sort((a, b) => a.dist - b.dist);
  const up = decide(g, minutesUntil(.3)).best;                // 물이 들면 갈 곳 (가장 가까운 높은 건물)
  const tagOf = s => (s.exit ? '물이 들기 전' : up && s.id === up.id ? '물이 들면' : null);
  const subOf = s => (!can(s) ? '물이 먼저 와요' : s.tall ? `높이 ${s.h}m` : s.exit ? '골목 밖으로' : <>입구 밖으로 {s.extra}m 더<ArEx /></>);
  const walk = s => walkTo(s, set, go, 'find');
  return (
    <Page>
      <div className="sb-fill" />
      <Body flush scroll={ui.scroll}>
      <Band left={<span className="tt">대피</span>} right={<button className="ar-pill go" aria-label={`내 걸음: ${GAITS[g].name}. 바꾸기`} onClick={() => go('ePlan')}><Picto name={GPICT[g]} size={20} color="#0B50D0" />{GAITS[g].name}<Ico name="chevron-right" size={16} stroke={2.4} /></button>} wm={<DropWm w={240} style={{ right: -56, top: 44 }} />}>
        <div className="ar-in">
          <h1 className="ar-h1">{D.best.exit ? <>경보가 오면 바로 <b>입구 밖</b>으로 나가요</> : <>경보가 오면 <b>{placeShort(D.best)}</b>{ro(placeShort(D.best)).slice(placeShort(D.best).length)} 가요</>}</h1>
          <p className="ar-b2">안전한 곳을 누르면 그 길을 미리 걸어 봐요</p>
        </div>
      </Band>
      <div className="pg-pad">
        {D.best && <button className="ar-card key fd-hero" onClick={() => walk(D.best)} aria-label={`${placeName(D.best)}까지 길 미리 걷기`}>
          <div className="ar-thumb"><ThumbScene safe={D.best} g={g} /><span className="play"><Ico name="footprints" size={16} stroke={2.4} />길 미리 걷기</span></div>
        </button>}
        <h2 className="ar-sec">안전한 곳 · 가까운 순서</h2>
        {near.map(s => <PlaceRow key={s.id} s={s} ok={can(s)} tag={can(s) ? tagOf(s) : null} sub={subOf(s)} dist={s.dist} onClick={walk} />)}
        <p className="au-note">거리는 가게 문에서 걷는 길로 잰 값이에요.</p>
      </div>
      </Body>
      <ArNav go={go} cur="eFind" set={set} />
    </Page>
  );
}

// ─ 3. 길 안내 = 직접 걷기: ScreensWalk.jsx 의 EGuide

// ─ 4. 도착: 나루 한 명 · 여기서 할 일 한 문장 · 단추 하나. 연습을 마치면 파란 판 전체에서 나루가 반긴다
function EArrive({ go, st, set, night, toast }) {
  const drill = eDrill(st), g = eGait(st), D = decide(g, 0), safe = eSafe(st);
  const mine = D.list.find(s => s.id === safe.id) || { min: 1, dist: 0 };
  const finishDrill = () => { set({ mode: 'real', step: 0, at: null, wfrom: null, drilled: (st.drilled || 0) + 1, rkFocus: null, from: null, rkMode: null, walkS: null, walkFrom: null, detourAt: null }); go('eNow'); };
  const help = safe.tall && !GAITS[g].stairs, u = safe.exit ? upNear(0) : null;
  // 입구 밖: 기다리되 물이 들면 갈 곳을 이름과 거리로 · 높은 건물: 문 앞에서 위층으로(건물 안 계단은 레벨에 없어 예시)
  const sign = safe.exit ? { t: <>찻길에서 떨어져 <b>기다리세요</b></>, v: '찻길에서 떨어져 기다리세요', s: u ? <>물이 들면<br />{u.short} {u.floors}층으로 가세요 · {u.dist}m</> : '입구 밖 안전한 곳이에요' }
    : safe.tall ? { t: <><b>{safe.floors}층</b>으로 올라가세요</>, v: `${safe.floors}층으로 올라가세요`, s: <>건물 안 계단{help ? ' · 도움을 받아 오르세요' : ''}<ArEx /></> }
    : { t: <><b>승강기</b>로 올라가세요</>, v: '승강기로 올라가세요', s: <>물이 빠질 때까지 대합실에 계세요<ArEx /></> };
  if (drill) return (
    <Page style={{ background: 'var(--band)' }}>
      <Band fill left={<PracChip on />} wm={<DropWm w={430} style={{ left: -28, top: 96, WebkitMaskImage: 'linear-gradient(#000 50%, transparent 62%)', maskImage: 'linear-gradient(#000 50%, transparent 62%)' }} />}>
        <div className="ar-in dn-mid">
          <Naru pose="cheer" h={172} float style={{ position: 'relative' }} />
          <h1 className="ar-d">잘했어요</h1>
          <p className="ar-b">{placeShort(safe)}까지 미리 걸어 봤어요</p>
        </div>
      </Band>
      <Foot clear>
        <div className="ar-card">
          <span className="ar-label">내 대피 카드 · {GAITS[g].name}</span>
          <p className="ar-t1" style={{ textWrap: 'balance' }}>{cardLine(g, safe.id)}</p>
          <p className="ar-b2" style={{ marginTop: 4 }}>{safe.exit ? <>물보다 {Math.max(0, D.wet - mine.min)}분 먼저 도착해요<ArEx /></> : <>가게 문에서 {mine.dist}m · 가는 길 조심할 곳 {risksOn(safe).length}곳{safe.example ? <ArEx /> : null}</>}</p>
        </div>
        <button className="ar-btn white" onClick={finishDrill}>연습 마치기</button>
      </Foot>
    </Page>
  );
  return (
    <Page>
      <Band tone="real" round left={<RealChip on />} right={st.voice !== false ? <Replay on text={sign.v} toast={toast} /> : null}>
        <div className="ar-in">
          <p className="ar-c">도착했어요 · {safe.tall ? safe.short : placeName(safe)}</p>
          <h1 className="ar-h1">{sign.t}</h1>
          <p className="ar-b2">{sign.s}</p>
        </div>
      </Band>
      <Body><Arrived pose="lantern" safe={safe} /></Body>
      <Foot><button className="ar-btn" onClick={() => { set({ arrived: safe.id, step: 0, at: null }); go('eNow'); }}>{safe.tall ? `${safe.floors}층에 올라왔어요` : '확인'}</button></Foot>
    </Page>
  );
}

// ─ 5. 물 높이 (연습 · 장면에서 재기): 그 물 높이의 골목 · 몸 높이를 재는 자 · 할 일 한 문장
function EWater({ go, st, set, night }) {
  const g = eGait(st), i = Math.min(st.lv ?? 0, WATER_BANDS.length - 1), B = WATER_BANDS[i];
  const fast = (st.flow || MARKET.water.flow) === 'fast', eff = deeper(B.m, fast), D = decide(g, minutesUntil(B.m), fast ? 'fast' : 'slow'), stop = GAITS[g].stop;
  const eye = GAITS[g].eye, help = D.act === 'help';
  const next = () => { if (D.best) { set({ mode: 'drill', dest: D.best.id, step: 0, at: null, from: 'water', rkFocus: null, rkMode: null, walkS: null, walkFrom: null, detourAt: null }); go('eGuide'); } else { set({ mode: 'drill', step: 0, at: null, from: 'water' }); go('eNow'); } };
  const close = () => { set({ mode: 'real', at: null, wfrom: null }); go(st.from === 'find' ? 'eFind' : 'eNow'); };
  // 연습 경보에서 '물 높이 바꾸기'로 왔으면: 뒤로 = 그 물 높이의 연습 경보로
  const fromDrill = st.wfrom === 'drill', toDrill = () => { set({ mode: 'drill', from: 'now' }); go('eNow'); };
  // 물이 차도 '나가지 않아요'가 아니라 어디로: 가장 가까운 높은 건물(레벨에서 잰 층) · 그 거리 · 가는 길의 위험
  const title = D.act === 'go' ? <>경보가 오면 바로 <b>입구 밖</b>으로 나가요</> : <><b>{D.best.short} {D.best.floors}층</b>으로 올라가요</>;
  // 못 가는 높이(예시)의 표는 장면 속 이름표가 달고 있다(화면에 하나)
  const sub = D.act === 'go' ? '물이 들기 전에 골목 밖으로'
    : help ? <>안전한 곳까지 {D.best.dist}m · 도움을 받아 가요<br />{fast ? `물살이 빨라 ${GAITS[g].by}는 더 위험해요` : `${GAITS[g].by}는 혼자 못 가는 물이에요`}</>
    : `안전한 곳까지 ${D.best.dist}m · 조심할 곳 ${risksOn(D.best).length}곳` + (fast && eff > B.m ? ` · 물살이 빨라 ${bandOf(eff).body}만큼 위험해요` : '') + (D.best.help ? ' · 계단은 도움을 받아요' : '');
  const toHelp = () => { set({ mode: 'drill', detourAt: 'W00', detourFrom: 'water' }); go('eDetour'); };
  return (
    <>
      <WaterScene B={B} g={g} eye={eye} stop={stop} />
      <Band over round left={<>{fromDrill ? <ArBack on onClick={toDrill} /> : <ArBack on icon="x" label="연습 닫기" onClick={close} />}<PracChip on /></>}>
        <div className="ar-in" key={i + (fast ? 'f' : 's')}>
          <h1 className="ar-h1">{title}</h1>
          <p className="ar-b2">{sub}</p>
        </div>
      </Band>
      <div className="ar-pane">
        <span className="ar-label" id="wt-q">물이 어디까지 차면?</span>
        <div className="ar-seg" role="group" aria-labelledby="wt-q">{WATER_BANDS.map((x, k) => <button key={k} aria-pressed={k === i} onClick={() => set({ lv: k })}>{bodyFor(x, g)}</button>)}</div>
        <div className="ar-seg" role="group" aria-label="물살">{[['slow', '느림'], ['fast', '빠름']].map(([k, l]) => <button key={k} disabled={i === 0} aria-pressed={i > 0 && (fast ? 'fast' : 'slow') === k} onClick={() => set({ flow: k })}><LIc k={k === 'fast' ? 'flow' : 'slow'} size={18} />물살 {l}</button>)}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {help ? <>
            <button className="ar-btn sec flex0" onClick={next}><Ico name="footprints" size={20} stroke={2.2} />길 미리 걷기</button>
            <button className="ar-btn" style={{ flex: 1, width: 'auto' }} onClick={toHelp}>도움 요청</button>
          </> : <button className="ar-btn" style={{ flex: 1, width: 'auto' }} onClick={next}><Ico name="footprints" size={20} stroke={2.2} />길 미리 걷기</button>}
        </div>
      </div>
    </>
  );
}

// 켜고 끄는 줄: 줄 전체가 단추
const SwitchRow = ({ icon, title, sub, on, onClick }) => (
  <button className="ar-li" role="switch" aria-checked={!!on} onClick={onClick}>
    <span className="ar-gt"><Ico name={icon} size={22} stroke={2} /></span>
    <span className="tx"><span className="t">{title}</span><span className="s">{sub}</span></span>
    <ArTog on={on} />
  </button>
);
// 넘어가는 줄 (글 한 줄 + 오른쪽 화살표)
const LinkRow = ({ title, value, onClick }) => (
  <button className="ar-li sm" onClick={onClick}><span className="tx"><span className="t">{title}</span></span>{value ? <span className="v">{value}</span> : null}<span className="gt"><Ico name="chevron-right" size={20} stroke={2} /></span></button>
);

// ─ 6. 내 정보: 나 · 내 대피 카드 · 글자와 화면 · 걸음 · 알림 · 계정
function EPlan({ go, st, set, night, ui = {}, pop, toast }) {
  const g = eGait(st), b = decide(g, 0).best, T = (k, d) => (st[k] ?? d), logged = !!st.loggedIn;
  const edu = !!(st.terms && st.terms.edu);                  // 연습 · 안내 알림은 약관의 선택 동의와 같은 것
  const row = (icon, title, sub, k, d = true) => <SwitchRow key={k} icon={icon} title={title} sub={sub} on={T(k, d)} onClick={() => set({ [k]: !T(k, d) })} />;
  return (
    <Page>
      <div className="sb-fill" />
      <Body flush scroll={ui.scroll}>
      <Band left={<h1 className="tt">내 정보</h1>} wm={<DropWm w={220} style={{ right: -60, top: 44 }} />}>
        <div className="pf">
          <span className="ar-face" />
          <div><p className="ar-t1">박순례 님</p><p className="ar-b2">{MARKET.place}에서 40년</p></div>
        </div>
      </Band>
      <div className="pg-pad">
        <div className="ar-card key">
          <span className="ar-label">내 대피 카드 · {GAITS[g].name}</span>
          <p className="ar-t1" style={{ textWrap: 'balance' }}>{cardLine(g)}</p>
          {b && <p className="ar-b2" style={{ marginTop: 4 }}>{b.dist}m · {GAITS[g].by} {b.min}분<ArEx /></p>}
          {b && b.exit && upLine(g) && <p className="ar-src" style={{ color: 'var(--ink2)' }}><Ico name="building-2" size={16} stroke={2} /><span>{upLine(g)}</span></p>}
        </div>

        <h2 className="ar-sec">글자 크기</h2>
        <FsStep st={st} set={set} />
        <div className="ar-card list" style={{ marginTop: 8 }}>{row('contrast', '선명한 화면', '글자와 선을 더 진하게', 'hc', false)}</div>

        <h2 className="ar-sec">어떻게 다니세요?</h2>
        <div className="ar-opt3" role="radiogroup" aria-label="내 걸음" onKeyDown={radioKeys}>{Object.entries(GAITS).map(([k, v]) => { const on = k === g;
          return <button key={k} role="radio" aria-checked={on} tabIndex={on ? 0 : -1} onClick={() => set({ walk: k, sel: null })}><Picto name={GPICT[k]} size={32} color={on ? 'var(--brand-ink)' : 'var(--ink3)'} />{v.name}</button>; })}</div>

        <h2 className="ar-sec">이렇게 알려요</h2>
        <div className="ar-card list">
          {row('volume-2', '소리로 읽기', '경보와 길 안내를 소리로 읽어 드려요', 'voice')}
          {row('vibrate', '진동과 빛', '경보를 소리 없이도 알 수 있어요', 'buzz')}
          <SwitchRow icon="bell" title="날씨 · 연습 · 안내 알림" sub="비 소식과 연습 때를 알려요" on={T('tell', edu)} onClick={() => { const v = !T('tell', edu); set({ tell: v, terms: { ...(st.terms || {}), edu: v } }); }} />
        </div>

        <h2 className="ar-sec">계정</h2>
        <div className="ar-card list">
          <div className="ar-li" style={{ cursor: 'default' }}>
            <span className="ar-gt"><Ico name={logged ? 'user-round-check' : 'user-round'} size={22} stroke={2} /></span>
            <span className="tx"><span className="t">{logged ? (st.auth === 'simple' ? '인증서로 로그인했어요' : '휴대폰 번호로 로그인했어요') : '로그인 없이 쓰고 있어요'}</span><span className="s">{logged ? '다른 휴대폰에서도 볼 수 있어요' : '이 휴대폰에만 저장돼요'}</span></span>
          </div>
          {logged ? <LinkRow title="로그아웃" onClick={() => { set({ loggedIn: 0, auth: 'guest' }); toast && toast('로그아웃했어요'); }} />
            : <LinkRow title="로그인하고 내 대피 카드 저장" onClick={() => { set({ auth: 'phone', relog: 1 }); go('eVerify'); }} />}
          <LinkRow title="약관 · 개인정보" onClick={() => pop && pop({ k: 'terms', id: 'svc', all: 1 })} />
          <LinkRow title="나루 소개" value="시제품 0.9" onClick={() => pop && pop({ k: 'about' })} />
          <LinkRow title="처음 설정 다시 하기" onClick={() => pop && pop({ k: 'reset' })} />
        </div>
      </div>
      </Body>
      <ArNav go={go} cur="ePlan" set={set} />
    </Page>
  );
}

// ─ 7. 배우기 (안전 교육): 세 가지 · 행동요령 · 특보 기준 · 물 높이 읽기(수표 눈금) · 우리 시장 조심할 곳(배경데이터)
function Supyo({ stop }) {
  const id = 'sp' + String(React.useId()).replace(/[^\w-]/g, '');
  const H = 148, top = 6, m2y = m => top + H - (m / 1.2) * H;
  return (
    <svg width="58" height="160" viewBox="0 0 58 160" aria-hidden="true" style={{ flex: 'none', display: 'block' }}>
      <defs><linearGradient id={id} x1="0" x2="1"><stop offset="0" stopColor="#DCDFE3" /><stop offset="1" stopColor="#B1B8BE" /></linearGradient><clipPath id={id + 'c'}><rect x="15" y={top} width="28" height={H} rx="6" /></clipPath></defs>
      <rect x="15" y={top} width="28" height={H} rx="6" fill={`url(#${id})`} />
      <rect x="15" y={m2y(stop)} width="28" height={top + H - m2y(stop)} rx="0" fill="#256EF4" opacity=".3" clipPath={`url(#${id}c)`} />
      {Array.from({ length: 11 }, (_, k) => k + 1).map(k => <line key={k} x1="19" x2={k % 5 === 0 ? 39 : 31} y1={m2y(k * .1)} y2={m2y(k * .1)} stroke="#58616A" strokeWidth="1.2" />)}
      {[.3, .5, 1].map(m => <line key={m} x1="8" x2="50" y1={m2y(m)} y2={m2y(m)} style={{ stroke: 'var(--brand-ink)' }} strokeWidth="2" strokeDasharray="4 3" />)}
    </svg>
  );
}
const PHASES = [
  ['비 오기 전', 'cloud', ['우리 가게에서 가장 가까운 높은 건물 알아 두기', '걸음이 느리면 호우주의보 때 먼저 나서기로 정해 두기', '약 · 신분증처럼 챙길 것 정해 두기']],
  ['비가 많이 올 때', 'cloud-rain', ['지하 공간에서 바로 나오기', '맨홀 · 전봇대 · 전기함에서 멀리 떨어지기', '물이 무릎(약 50cm)에 닿으면 걷지 말고 가까운 건물 위층으로 가기', '물살이 있으면 15cm 물에도 넘어지니 조심하기']],
  ['비가 그친 뒤', 'sun', ['전기 · 가스를 점검하기 전에는 가게에 들어가지 않기', '젖은 손으로 전기를 만지지 않기']],
];
const RULES = [['c2', '호우주의보', '3시간에 60mm 또는 12시간에 110mm가 예상될 때'], ['c4', '호우경보', '3시간에 90mm 또는 12시간에 180mm가 예상될 때'], ['c4', '호우 긴급재난문자', <>1시간 50mm와 3시간 90mm가 함께일 때, 또는 1시간 72mm일 때<br />기상청이 동네(읍면동)⁠마다 바로 보내요</>]];
function ELearn({ go, st, set, night, ui = {} }) {
  const g = eGait(st), stop = GAITS[g].stop;
  const step = (n, t, s) => <div className="ar-lstep" key={n}><span className="no">{n}</span><span className="tx"><span className="t">{t}</span><span className="s">{s}</span></span></div>;
  const safe0 = decide(g, 0).best || MARKET.safe[0], first = [.3, .5, 1].find(m => m >= stop - .001), T2 = decide(g, minutesUntil(.3)).best;
  return (
    <Page>
      <div className="sb-fill" />
      <Body flush scroll={ui.scroll}>
      <Band className="lr-hero" left={<span className="tt">배우기</span>} wm={<DropWm w={240} style={{ right: -70, top: 44 }} />}>
        <div className="ar-in">
          <h1 className="ar-h1">물이 오면,<br /><b>세 가지</b>만 기억해요</h1>
          <p className="ar-b2">나루와 미리 배워 둬요</p>
        </div>
        <Naru pose="supyo" h={120} float style={{ right: 12, bottom: 16 }} />
      </Band>
      <div className="pg-pad">
        <div className="ar-card list">
          {step(1, '경보가 오면 바로 나가요', '물이 들기 전에 입구 밖으로')}
          {step(2, '물이 들면 높은 건물로', T2 ? `${T2.short} ${T2.floors}층 · ${T2.dist}m` : '가장 가까운 2층 건물로')}
          {step(3, '길이 막히면 다른 안전한 곳으로', '그래도 어려우면 119')}
        </div>

        <h2 className="ar-sec">행동요령</h2>
        <div className="ar-card lr-phase">
          {PHASES.map(([t, ic, items]) => <div key={t} className="ph">
            <h3 className="pt"><Ico name={ic} size={18} stroke={2} />{t}</h3>
            <ul>{items.map(x => <li key={x}>{x}</li>)}</ul>
          </div>)}
          <p className="ar-src"><Ico name="file-text" size={16} stroke={2} /><span>국민행동요령(호우 · 홍수) · 행정안전부</span></p>
        </div>

        <h2 className="ar-sec">비가 얼마나 오면 경보일까요</h2>
        <div className="ar-card lr-rule">
          {RULES.map(([c, n, s]) => <div key={n} className="rl"><span className={'lv-chip ' + c}>{n}</span><span className="s">{s}</span></div>)}
          <p className="ar-src"><Ico name="file-text" size={16} stroke={2} /><span>기상청 특보 기준</span></p>
        </div>

        <h2 className="ar-sec">{GAITS[g].by} 갈 때 물 높이</h2>
        <div className="ar-card ar-gauge">
          <Supyo stop={stop} />
          {/* 이름은 수표 그림의 눈금 높이에 맞춘다(Supyo와 같은 자: 위 6px · 148px = 1.2m) */}
          <div className="lv">{[['허리', 1], ['무릎', .5], ['종아리', .3]].map(([b, m]) => <div key={b} style={{ top: 6 + 148 - (m / 1.2) * 148 }}><b>{bodyFor({ m, body: b }, g)}</b><span>{Math.round(m * 100)}cm</span>{m === first && <em className={m <= .3 ? 'dn' : 'up'}>여기부터 혼자 못 가요<ArEx /></em>}</div>)}</div>
        </div>

        <div className="ar-sec"><h2>우리 시장 조심할 곳</h2><button className="ar-link" onClick={() => { set({ rk: 'eLearn', dest: safe0.id }); go('eRisk'); }}>전부 보기<Ico name="chevron-right" size={18} stroke={2.2} /></button></div>
        <div className="rk-grid">
          {riskGroups(risksOn(safe0)).filter(G => G.kind !== 'road').slice(0, 4).map(G => <div key={G.kind} className="ar-spot">
            <RiskShot r={G.first} eye={GAITS[g].eye} w="100%" h={112} />
            <b>{riskTile(G)}</b><span>{G.first.kind === 'sill' ? (g === 'walk' ? '발이 걸리기 쉬워요' : '바퀴가 걸려요') : G.first.why}</span>
          </div>)}
        </div>

        <h2 className="ar-sec">옛사람의 물 재기</h2>
        <div className="ar-card">
          <p className="ar-t3">측우기로 비를, 수표로 물 높이를</p>
          <p className="ar-b2" style={{ marginTop: 4 }}>세종 때부터 측우기로 비를, 수표(물 높이를 재는 돌기둥)로 강물을 재어 미리 대비했어요. 나루도 같은 일을 해요.</p>
        </div>
      </div>
      </Body>
      <ArNav go={go} cur="eLearn" set={set} />
    </Page>
  );
}

// ─ 8. 가는 길 조심할 곳: 레벨에서 찾은 위험(MARKET.risks)을 만나는 순서대로 미리 알려 준다
//   실제 경보 = 빨간 판(…세요) · 평소 · 연습 = 파란 판(…요). 같은 종류는 한 줄(가장 먼저 만나는 것이 대표)
//   사진 = 실제 렌더를 그쪽으로 돌려 본 한 장, 가운데 고리가 그것. 렌더가 없으면 그림 표시(아이콘)
function RiskShot({ r, eye = 140, w = 96, h = 96 }) {
  const amber = (SEV_OF[r.kind] || 'amber') === 'amber';
  const v = riskView(r, eye), s = useSlot(v.p, eye, 0, false), real = !!s.src && !PANO.test;
  const far = !r.z && v.dist > 12;    // 12m보다 먼 바닥 무늬(기름 얼룩 등)는 사진에서 알아보기 어려워 그림 표시로
  return (
    <div className="rk-shot" aria-hidden="true" style={{ width: w, height: h }}>
      {s.src && !far ? <div style={{ position: 'absolute', inset: 0, filter: real ? AR_GRADE : undefined }}><PanoView src={real ? loSrc(s.src) : s.src} yaw0={v.yaw} pitch0={v.pitch} vfov={v.vfov} interactive={false} testTag={false} /></div>
        : <div className="rk-none soft"><Ico name={r.icon} size={28} stroke={1.8} /></div>}
      {s.src && !far && <span className={'rk-mark' + (r.z && r.kind !== 'sill' ? '' : ' flat') + (amber ? ' amber' : '')} />}
    </div>
  );
}
// 어디에: 길 안내의 판과 같은 말('12m 앞 왼쪽'). 여럿이면 처음 것의 자리 + 모두 몇 곳
const riskWhere = G => (G.first.kind === 'sill' ? '나오자마자 · 발밑' : `${G.first.d}m 앞` + (G.first.side === '앞' ? '' : ` ${G.first.side}`)) + (G.items.length > 1 ? `부터 ${G.items.length}곳` : '');
// 같은 종류가 여럿이면 그 길에 실제로 있는 것들의 이름만 모아서(전봇대 · 전기함 · 냉동고), 하나면 그것의 이름
const riskName = G => (G.items.length > 1
  ? [...new Set(G.items.flatMap(r => (r.label || RISK_KIND[r.kind].label).replace('가게 앞 ', '').split(' · ')))].join(' · ')
  : G.first.kind === 'sill' ? `가게 턱 ${sillCm()}cm` : G.first.label);
// 배우기의 작은 칸: 이름은 둘까지 + 몇 곳 (한 줄에 들게)
const riskTile = G => { const nm = riskName(G).split(' · '), n = G.items.length; return n > 1 ? `${nm.slice(0, 2).join(' · ')}${nm.length > 2 ? ' 등' : ''} ${n}곳` : riskName(G); };
function ERisk({ go, st, set, night, ui = {} }) {
  const g = eGait(st), drill = eDrill(st), real = !!st.alert && !drill, safe = eSafe(st), eye = GAITS[g].eye;
  // 거리 · 좌우는 길 안내와 같은 값: 가게 문에서 길을 따라 잰 거리, 걷는 쪽에서 본 왼쪽 · 오른쪽
  const wh = walkHazards(safe, g, walkRoute(walkPlan(safe))), byId = {}; wh.forEach(h => { byId[h.id] = h; });
  const list = risksOn(safe).map(r => (byId[r.id] && r.kind !== 'sill' ? { ...r, d: Math.max(1, Math.round(byId[r.id].s)), side: byId[r.id].side } : r));
  const groups = riskGroups(list), total = groups.reduce((n, G) => n + G.items.length, 0);
  const back = () => go(st.rk || 'eNow');
  // 줄을 누르면 그 자리 3.5m 앞에서 그쪽을 보고 선다 (실제 경보면 실제 경보 그대로, 평소면 연습으로)
  const look = G => { set({ dest: safe.id, rkFocus: G.first.id, from: 'risk', rkMode: st.mode || 'real', mode: real ? 'real' : 'drill', step: 0, lv: real || drill ? st.lv : 0, at: null, walkS: null, walkFrom: null, detourAt: null }); go('eGuide'); };
  return (
    <Page>
      <Band tone={real ? 'real' : 'brand'} round left={<><ArBack on onClick={back} />{real ? <RealChip on /> : drill ? <PracChip on /> : null}</>}>
        <div className="ar-in">
          <p className="ar-c">{ro(safe.short)} 가는 길 · {total}곳</p>
          <h1 className="ar-h1">가는 길에 <b>조심할 곳</b></h1>
          <p className="ar-b2">{real ? '우리 시장 골목에서 미리 찾아 둔 곳' : '우리 시장 골목에서 미리 찾아 둔 곳이에요'}</p>
        </div>
      </Band>
      <Body scroll={ui.scroll}>
        {groups.map(G => <button key={G.kind} className={'rk-row ' + (SEV_OF[G.kind] || 'amber')} onClick={() => look(G)}>
          <RiskShot r={G.first} eye={eye} />
          <div className="tx">
            <span className="k"><Ico name={G.first.icon} size={16} stroke={2.2} />{riskWhere(G)}</span>
            <span className="nm">{riskName(G)}</span>
            <span className="do">{real ? G.first.act[0] : G.first.act[1]}</span>
            <span className="why">{G.first.kind === 'sill' ? (g === 'walk' ? '발이 걸리기 쉬워요' : '바퀴가 걸려요') : G.first.why}</span>
            <span className="rk-go"><Ico name="footprints" size={16} stroke={2.2} />그 자리 걸어서 보기</span>
          </div>
        </button>)}
      </Body>
      <Foot>{real ? <button className="ar-btn" onClick={() => { set({ dest: safe.id, step: 0, at: null, walkS: null, walkFrom: null, detourAt: null, rkFocus: null, from: null }); go('eGuide'); }}><Ico name="navigation-2" size={20} stroke={2.2} />길 안내 시작</button>
        : <button className="ar-btn" onClick={back}>확인했어요</button>}</Foot>
    </Page>
  );
}

Object.assign(window, { ELearn, ENow, EFind, EArrive, EWater, EPlan, ERisk, RiskShot, eGait, eDrill, eDecide, eSafe, eLevel, SwitchRow, LinkRow, Num, RiskPill, PlaceShot, PlaceRow, placeView, Arrived, GPICT, riskName, riskWhere, riskTile, alertSpeech });
