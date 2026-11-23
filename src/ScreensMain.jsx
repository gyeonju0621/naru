// NARU · 홈(스크롤) · 알림함 · 지도 탭 (2026-11-23 공공 서비스판 · 정리)
// 그녀의 말: "홈 화면에도 스크롤 · 정보를 더 · 지도를 넣어서 지금 홍수는 어떤 지역에 몇 정도 있다, 아니면 위험 지역 … 다 이유가 있어야 해"
// 홈의 차례와 이유 (조사: KRDS 방문 패턴 · 일본 도쿄 방재 앱 · GOV.UK · 영국 환경청 · NIST 경보 연구)
//   ① 파란 판 = 지금 상태(단계 · 한 문장 · 출처와 시각) + 나루 — 첫 화면은 '여기 지금 위험한가'에 먼저 답한다
//   ② 안내 띠 — 한 줄, 닫을 수 없음(KRDS 긴급 공지 패턴). 평소엔 '안내', 경보 때는 화면 전체가 빨간 판으로 바뀐다
//   ③ 경보가 오면 나는 — 두 갈래(물이 들기 전 = 밖, 물이 들면 = 가장 가까운 높은 건물 위층: 영국 · 일본 공식 권고)
//      느린 걸음은 한 단계 일찍(일본 '고령자 등 대피' 단계를 따름)
//   ④ 우리 시장 지도 — 배경데이터를 위에서 본 원본 렌더 위에 안전한 곳 · 위험 · 내 가게. 곁에 글 목록(지도만보다 글이 더 잘 읽힘)
//   ⑤ 황룡강 장록교 수위 — 가장 가까운 공식 홍수특보 관측소, 공식 4단계(관심 · 주의 · 경계 · 심각)
//   ⑥ 이 동네의 기록 — 실제 날짜 · 숫자 (시장이 잠겼다고는 말하지 않는다)
//   ⑦ 대피소 주의 — 근처 민방위 대피소는 모두 지하 → 홍수 때 들어가면 안 된다
//   ⑧ 배우기 · 연습 — 평소에 같은 앱으로 익혀 둔다   ⑨ 긴급 연락 119 · 112
// 값: 지명 · 관측소 · 기준 수위 · 기록 = 공식 출처(영산강홍수통제소 · 광주지방기상청 · 광산구). 지금 수위 · 강수량 = 예시(실시간 연동 전).

const LOCAL = {
  dong: '광산구 송정동',
  gauge: { name: '장록교', river: '황룡강', where: '광산구 도산동', code: '5002690', lv: [5.0, 7.5, 8.5, 9.0], now: 3.1, nowAlert: 7.9, top: 10, src: '영산강홍수통제소 · 10분마다 관측' },
  hist: [
    { dt: '2025년 7월 17일', tx: <>광주에 하루 <b>426.4mm</b> — 1939년 관측을 시작한 뒤 가장 많은 비.<br />장록교 <b>홍수경보</b> 18:40</> },
    { dt: '2023년 7월 24일', tx: <>장록교 <b>홍수주의보</b><br />강가 마을 주민 123명이 미리 대피</> },
    { dt: '2020년 8월 8일', tx: <>장록교 <b>홍수경보</b> 04:30<br />광산구에 이틀 동안 366mm</> },
  ],
  histSrc: '광주지방기상청 · 영산강홍수통제소',
  shelters: ['광주송정역 지하 · 광산구청 지하 1층', '근처 아파트 지하주차장'],
};
// 위기 단계 (홍수 정보 4단계) — 색은 단계 표시에만, 늘 글과 함께
const LVL = [['평상', 'var(--lv-0)'], ['관심', 'var(--lv-1)'], ['주의', 'var(--lv-2)'], ['경계', 'var(--lv-3)'], ['심각', 'var(--lv-4)']];
const LV_HEX = ['#0B78CB', '#FFB114', '#EA6901', '#D93131'];
const gaugeLv = m => { const L = LOCAL.gauge.lv; return m >= L[3] ? 4 : m >= L[2] ? 3 : m >= L[1] ? 2 : m >= L[0] ? 1 : 0; };
// 지금 자리(글로): 119 신고 · 다른 곳 고르기에서 같은 말로
const hereY = st => { const p = st && st.detourAt && WALK.at(st.detourAt) >= 0 ? WALK.pts[WALK.at(st.detourAt)] : null; return Math.round(p ? p.y : WALK.pts[0] ? WALK.pts[0].y : MARKET.home.y); };   // 가게 문(W00) = 입구에서 63m

// ─ 강 수위: 지금 값 · 0 ~ 10m 막대 · 공식 기준 넷
function GaugeCard({ m, ex = true }) {
  const G = LOCAL.gauge, pc = v => (v / G.top * 100).toFixed(1) + '%', lv = gaugeLv(m);
  const bg = `linear-gradient(90deg,var(--line2) 0 ${pc(G.lv[0])},${LV_HEX[0]} ${pc(G.lv[0])} ${pc(G.lv[1])},${LV_HEX[1]} ${pc(G.lv[1])} ${pc(G.lv[2])},${LV_HEX[2]} ${pc(G.lv[2])} ${pc(G.lv[3])},${LV_HEX[3]} ${pc(G.lv[3])} 100%)`;
  return (
    <div className="ar-card">
      <div className="gg-now"><b>{m.toFixed(1)}<i>m</i></b><span className="w">{G.name} · 지금{ex && <ArEx />}</span><span className={'lv-chip c' + lv}>{LVL[lv][0]}</span></div>
      <div className="gg-bar" style={{ background: bg }} role="img" aria-label={`수위 ${m.toFixed(1)}m. 기준: 관심 ${G.lv[0]}m, 주의 ${G.lv[1]}m, 경계 ${G.lv[2]}m, 심각 ${G.lv[3]}m`}>
        <i className="me" style={{ left: pc(Math.min(G.top, m)) }} />
      </div>
      <div className="gg-key">{G.lv.map((v, k) => <span key={v}><i style={{ background: LV_HEX[k] }} />{LVL[k + 1][0]} <b>{v.toFixed(1)}m</b></span>)}</div>
      <p className="ar-src"><Ico name="radio-tower" size={16} stroke={2} /><span>{G.where} · 시장에서 가장 가까운 공식 관측소 · {G.src}</span></p>
    </div>
  );
}

// 지도에 보일 안전한 곳: 입구 밖 + 높은 건물(가까운 순서) — 번호는 목록과 지도가 같다
const mapPlaces = D => { const tall = D.list.filter(s => s.tall).sort((a, b) => a.dist - b.dist); return [D.list.find(s => s.exit), ...tall].filter(Boolean).map((s, k) => ({ ...s, num: k + 1 })); };
// 대피 연습: 실제와 같은 차례(경보 화면 → 길 → 도착)를 파란 판으로. 물이 들기 전(물 없음)부터
const startDrill = (set, go) => { set({ mode: 'drill', lv: 0, flow: null, step: 0, at: null, from: 'now', wfrom: null, dest: null, sel: null, rkFocus: null, rkMode: null, walkS: null, walkFrom: null, detourAt: null, detourFrom: null }); go('eNow'); };
const walkTo = (s, set, go, from = 'now', lv = 0) => { if (!s) return; set({ mode: 'drill', dest: s.id, step: 0, lv, flow: null, at: null, from, rkFocus: null, rkMode: null, walkS: null, walkFrom: null, detourAt: null }); go('eGuide'); };

// ─ 우리 시장 지도 (홈의 카드): 골목 그대로 세로로 긴 지도 + 번호 목록 (지도만으로 말하지 않는다)
function MapCard({ g, go, set }) {
  const D = decide(g, 0), W = decide(g, minutesUntil(.3));
  const places = React.useMemo(() => mapPlaces(D), [g]);
  const exit = places[0], up = W.best;
  return (
    <div className="ar-card mp-card">
      <div className="mp-top">
        <TopMap className="mp-strip" view={[610, 175, 440, 1330]} fit="slice" mk={2.9} labels="num" dest={exit} places={places} risks={risksOn(exit).filter(r => r.kind !== 'road')} title="1913 송정역시장을 위에서 본 지도. 위쪽이 입구, 아래쪽이 내 가게" />
        <div className="mp-side">
          <p className="ar-c">위쪽이 입구예요</p>
          <div className="mp-list">
            {places.map(s => <button key={s.id} onClick={() => walkTo(s, set, go, 'now', s.tall ? 1 : 0)}>
              <span className="no">{s.num}</span>
              <span className="nm">{s.exit ? '입구 밖' : `${s.short} ${s.floors}층`}<small>{s.dist}m · {s.exit ? '물이 들기 전' : s.id === (up && up.id) ? '물이 들면' : `높이 ${s.h}m`}</small></span>
            </button>)}
          </div>
        </div>
      </div>
      <div className="mp-legend">
        <span><i style={{ background: 'var(--map-safe)' }} />안전한 곳 · 길</span>
        <span><i style={{ width: 10, height: 10, margin: 2, background: '#1E2124', boxShadow: '0 0 0 1.5px #fff, 0 0 0 2.5px var(--line2)' }} />내 가게</span>
        <span><i className="hz-k red" style={{ borderRadius: 0 }} />빠짐 · 감전</span>
        <span><i className="hz-k" />걸림 · 미끄럼 등</span>
      </div>
      <p className="ar-src"><Ico name="layers" size={16} stroke={2} /><span>배경데이터를 45m 위에서 내려다본 그림<br />길과 표시의 자리는 거기서 잰 값이에요</span></p>
    </div>
  );
}

// ─ 홈 (평소)
function EHome({ go, st, set, night, ui = {}, pop }) {
  const g = eGait(st), D0 = decide(g, 0), b0 = D0.best, up = decide(g, minutesUntil(.3)).best, slow = !GAITS[g].stairs;
  const toWater = () => { set({ mode: 'drill', lv: 1, flow: null, step: 0, at: null, from: 'now', wfrom: null }); go('eWater'); };
  const unread = st.notiRead ? 0 : notiState(st).n;
  return (
    <Page>
      <div className="sb-fill" />
      <Body flush scroll={ui.scroll}>
        <Band className="hm-hero" left={<span className="logo"><Logo h={17} /></span>}
          right={<>
            <button className="ar-ib on" aria-label={unread ? `알림 ${unread}개` : '알림'} onClick={() => { set({ notiRead: 1 }); go('eNoti'); }}><Ico name="bell" size={22} stroke={2} />{unread ? <i className="dot" /> : null}</button>
            <button className="ar-ib on" aria-label="글자 크기 · 화면 설정" onClick={() => go('ePlan')}><span className="ga" aria-hidden="true"><i>가</i>가</span></button>
          </>}>
          <div className="bd">
            <p className="place"><Ico name="map-pin" size={15} stroke={2.2} />{LOCAL.dong} · {MARKET.place}</p>
            <p className="state"><span className="lv-chip c0">평상</span><span>호우 특보 없음<ArEx /></span></p>
            <h1 className="ar-h1">지금은<br /><b>대피하지 않아도 돼요</b></h1>
            <p className="when"><span className="nw">{ltTime(night).calm} 기준 ·</span> <span className="nw">기상청 · 영산강홍수통제소</span></p>
          </div>
          <Naru pose="idle" h={112} float />
        </Band>
        {/* 안내 띠 (평소엔 '안내') — 닫을 수 없고 한 줄, 띠 전체가 그 일로 가는 링크 */}
        <button className="hm-crit" onClick={() => startDrill(set, go)}><span className="bd">안내</span><span className="tx">장마 전에 대피를 연습해 둬요</span><Ico name="chevron-right" size={20} stroke={2.2} /></button>

        <div className="hm-body">
          <h2 className="ar-sec">경보가 오면 나는</h2>
          <div className="ar-card pl-card">
            {b0 && <div className="pl-row"><span className="tx"><span className="k">물이 들기 전</span><span className="v">{b0.exit ? '입구 밖으로 나가요' : `${ro(placeShort(b0))} 가요`}</span>{b0.exit && <span className="s">골목 밖 · 찻길에서 떨어져요</span>}</span><span className="m">{b0.dist}<i>m</i></span></div>}
            {up && up.tall && <div className="pl-row"><span className="tx"><span className="k">물이 들면</span><span className="v">{up.short} {up.floors}층</span><span className="s">가장 가까운 높은 건물 · 높이 {up.h}m</span></span><span className="m">{up.dist}<i>m</i></span></div>}
            {slow && <p className="ar-note"><Ico name="clock-alert" size={18} stroke={2} /><span><b>{GAITS[g].name}</b>는 한 단계 일찍 나서요.<br />호우주의보나 강 수위 '주의'면 바로요.</span></p>}
            <div className="pl-btns"><button className="ar-btn sec flex0" onClick={() => go('eMap')}>지도</button><button className="ar-btn" onClick={() => walkTo(b0, set, go)}><Ico name="footprints" size={20} stroke={2.2} />길 미리 걷기</button></div>
          </div>

          <div className="ar-sec"><h2>우리 시장 지도</h2><button className="ar-link" onClick={() => go('eMap')}>크게 보기<Ico name="chevron-right" size={18} stroke={2.2} /></button></div>
          <MapCard g={g} go={go} set={set} />

          <h2 className="ar-sec">황룡강 수위</h2>
          <GaugeCard m={LOCAL.gauge.now} />

          <h2 className="ar-sec">이 동네의 기록</h2>
          <div className="ar-card hs-card">
            {LOCAL.hist.map(h => <div key={h.dt} className="hs-row"><span className="dt">{h.dt}</span><span className="tx">{h.tx}</span></div>)}
            <p className="ar-note"><Ico name="info" size={18} stroke={2} /><span>시장 골목이 잠겼다는 기록은 없어요. 다만 바닥이 평평해서(높이 차 2cm) 물이 들면 골목 전체가 함께 잠겨요.</span></p>
            <p className="ar-src"><Ico name="file-text" size={16} stroke={2} /><span>{LOCAL.histSrc}</span></p>
          </div>

          <h2 className="ar-sec">대피소, 이것만은</h2>
          <div className="ar-card sh-warn">
            <span className="ic"><Ico name="octagon-alert" size={24} stroke={2} /></span>
            <span className="tx"><span className="t">근처 대피소는 모두 지하예요.<br />홍수 때는 들어가면 안 돼요</span>
              <span className="s">{LOCAL.shelters[0]}<br />{LOCAL.shelters[1]}</span>
              <span className="s">민방위(공습) 대피소라 물이 들면 가장 먼저 잠겨요. 홍수 때는 위층으로 가요.</span>
              <span className="ar-src"><Ico name="file-text" size={16} stroke={2} /><span>광산구 민방위 대피시설 목록</span></span></span>
          </div>

          <h2 className="ar-sec">배우기 · 연습</h2>
          <div className="lr-grid">
            <button className="lr-tile" onClick={toWater}><span className="ic"><Ico name="waves" size={24} stroke={2} /></span><span><span className="t">물 높이 체험</span><span className="s">물이 찬 골목 보기</span></span></button>
            <button className="lr-tile" onClick={() => walkTo(b0, set, go)}><span className="ic"><Ico name="footprints" size={24} stroke={2} /></span><span><span className="t">길 미리 걷기</span><span className="s">가게에서 입구까지</span></span></button>
            <button className="lr-tile" onClick={() => { set({ rk: 'eNow', dest: b0 && b0.id }); go('eRisk'); }}><span className="ic"><Ico name="triangle-alert" size={24} stroke={2} /></span><span><span className="t">조심할 곳</span><span className="s">맨홀 · 전기함 · 턱</span></span></button>
            <button className="lr-tile" onClick={() => go('eLearn')}><span className="ic"><Ico name="book-open" size={24} stroke={2} /></span><span><span className="t">행동요령</span><span className="s">비 오기 전 · 올 때 · 뒤</span></span></button>
          </div>

          <h2 className="ar-sec">긴급 연락</h2>
          <div className="cl-row">
            <button className="red" onClick={() => pop && pop({ k: 'call', n: '119' })}><b>119</b><span>구조 · 구급 · 화재</span></button>
            <button onClick={() => pop && pop({ k: 'call', n: '112' })}><b>112</b><span>경찰</span></button>
          </div>
          <p className="hm-foot">나루는 정부의 공식 서비스가 아니에요. '예시'가 붙은 값은 실제 상황이 아니에요.</p>
        </div>
      </Body>
      <ArNav go={go} cur="eNow" set={set} />
    </Page>
  );
}

// ─ 알림함: 받은 알림을 새 것부터. 경보 알림은 맨 위에 빨간 표와 함께
// 알림함에 무엇이 있나 (홈의 종 표시도 같은 셈을 쓴다): 날씨 · 연습 · 안내 알림은 내 정보에서 끌 수 있다(약관의 선택 동의와 같은 것). 경보 알림은 늘 온다
const notiState = st => {
  const real = !!st.alert && st.mode !== 'drill', more = st.tell ?? !!(st.terms && st.terms.edu), past = !real && !!st.lastAlert;
  return { real, more, past, n: (real || past ? 1 : 0) + (more ? (real || past ? 1 : 2) : 0) };   // n = 새 알림(점이 붙는 줄)의 수
};
function ENoti({ go, st, set, night }) {
  const { real, more, past } = notiState(st), T = ltTime(night);
  const items = [
    real && { red: true, ic: 'siren', k: '실제 경보', when: T.alert, t: `호우경보 · ${LOCAL.dong}`, s: '눌러서 길 안내 열기', on: () => go('eNow'), nw: true, ex: true },
    // 끝난 경보도 알림함에 남는다(경보가 끝나면 사라지던 것을 고침)
    past && { ic: 'siren', k: '지난 경보', when: T.alert, t: `호우경보 · ${LOCAL.dong}`, s: '경보가 끝났어요', ex: true, nw: true },
    more && { ic: 'cloud-rain', k: '날씨', when: '오늘 09:00', t: '오늘 밤 비 소식이 있어요', s: '예상 강수량 20~60mm · 호우 특보는 아직 없어요', ex: !real && !past, nw: !real && !past },
    more && { ic: 'footprints', k: '연습', when: '어제', t: '장마 전에 대피를 연습해 둬요', s: '우리 시장 골목을 미리 걸어 봐요', on: () => startDrill(set, go), nw: true },
    more && { ic: 'megaphone', k: '안내', when: '3일 전', t: '내 대피 카드가 만들어졌어요', s: '걸음이 바뀌면 내 정보에서 고쳐요', on: () => go('ePlan') },
  ].filter(Boolean);
  return (
    <Page>
      <Band thin tone={real ? 'real' : 'brand'} left={<><ArBack on onClick={() => go('eNow')} />{real && <RealChip on />}<h1 className="tt">알림</h1></>} />
      <Body>
        {items.map(n => { const R = n.on ? 'button' : 'div';   // 누를 일이 없는 알림은 단추가 아니다
          return <R key={n.t} className={'nt-row' + (n.red ? ' red' : '')} onClick={n.on || undefined}>
            <span className="ar-gt"><Ico name={n.ic} size={22} stroke={2} /></span>
            <span className="tx"><span className="k"><b>{n.k}</b>{n.when}{n.nw && <i className="nw-dot" role="img" aria-label="새 알림" />}</span><span className="t">{n.t}{n.ex && <ArEx />}</span><span className="s">{n.s}</span></span>
          </R>; })}
        {!items.length && <div className="ar-card"><p className="ar-t3">새 알림이 없어요</p><p className="ar-b2" style={{ marginTop: 4 }}>경보가 오면 여기에도 남아요</p></div>}
        <p className="au-note">{more ? '경보 알림은 끌 수 없어요. 날씨 · 연습 · 안내 알림은 내 정보에서 바꿀 수 있어요.' : '날씨 · 연습 · 안내 알림을 꺼 두었어요. 경보 알림은 늘 와요. 내 정보에서 다시 켤 수 있어요.'}</p>
      </Body>
    </Page>
  );
}

// ─ 지도 탭: 우리 시장 지도 크게 — 겹 고르기 · 시간에 따른 물 높이(예시) · 그 길 미리 걷기
const MX_T = [[0, '경보 때'], [12, '12분 뒤'], [25, '25분 뒤'], [50, '50분 뒤']];
function EMap({ go, st, set, ui = {} }) {
  const g = eGait(st);
  const [t, setT] = React.useState(ui.t != null ? +ui.t : 0), [lay, setLay] = React.useState({ safe: true, risk: true, water: true });
  const water = waterAt(t), band = bandOf(water), D = decide(g, t);
  const [sel, setSel] = React.useState(null);
  const places = React.useMemo(() => mapPlaces(D), [g, t]);
  const dest = places.find(p => p.id === sel) || D.best;
  // 물이 든 뒤에는 밖으로 가는 곳을 고를 수 없다(지도의 표를 눌러도)
  const pickable = p => !((p.exit || p.outside) && D.act !== 'go');
  const nm = dest.exit ? '입구 밖' : `${dest.short} ${dest.floors}층`;
  const sc = React.useRef(null);
  // 처음엔 내 가게가 보이게(지금 있는 곳부터): 지도의 아래쪽
  React.useEffect(() => { const el = sc.current; if (el) el.scrollTop = ui.scroll != null ? +ui.scroll : el.scrollHeight; }, []);
  const guide = () => walkTo(dest, set, go, 'map', WATER_BANDS.indexOf(band));
  return (
    <Page>
      <Band thin left={<h1 className="tt">지도</h1>} right={<span className="mx-hint"><Ico name="arrow-up" size={18} stroke={2.4} />위쪽이 입구</span>} />
      <div className="mx-wrap">
        <div className="mx-map" ref={sc}>
          <TopMap view={[470, 110, 660, 1440]} fit="meet" mk={1.25} labels={true} dest={lay.safe ? dest : null} water={lay.water ? water : 0} places={lay.safe ? places : []} risks={lay.risk ? risksOn(MARKET.safe[0]).filter(r => r.kind !== 'road') : []} onPick={p => pickable(p) && setSel(p.id)} style={{ width: '100%', height: 818 }} />
        </div>
        <div className="mx-chips" role="group" aria-label="지도에 보일 것">{[['safe', '안전한 곳'], ['risk', '조심할 곳'], ['water', '물 높이']].map(([k, l]) => <button key={k} aria-pressed={!!lay[k]} onClick={() => setLay(o => ({ ...o, [k]: !o[k] }))}><Ico name={lay[k] ? 'check' : 'plus'} size={16} stroke={2.6} />{l}</button>)}</div>
        {lay.risk && <div className="mx-legend" aria-label="조심할 곳의 표"><span><i className="hz-k red" />빠짐 · 감전</span><span><i className="hz-k" />걸림 · 미끄럼 등</span></div>}
      </div>
      <div className="mx-sheet">
        <div className="mx-depth"><span className={'lv-chip c' + (water <= 0 ? 0 : water < .5 ? 2 : water < 1 ? 3 : 4)}>{water <= 0 ? '물 없음' : bodyFor(band, g)}</span><span>골목 물 높이 <b>{Math.round(water * 100)}cm</b><ArEx /></span></div>
        <div className="mx-time" role="group" aria-label="경보 뒤 시간">{MX_T.map(([v, l]) => <button key={v} aria-pressed={t === v} onClick={() => { setT(v); setSel(null); }}>{l}</button>)}</div>
        <p className="mx-say">{dest.exit ? <><b>{nm}</b>까지 {dest.dist}m · 물이 들기 전에 나가요</>
          : D.act === 'go' ? <><b>{nm}</b>까지 {dest.dist}m · 물이 들면 여기로 올라가요</>
          : <><b>{nm}</b>까지 {dest.dist}m · 물이 들었으니 위층으로{D.act === 'help' ? ' · 도움을 받아요' : ''}</>}</p>
        <button className="ar-btn" onClick={guide}><Ico name="footprints" size={20} stroke={2.2} />이 길 미리 걷기</button>
      </div>
      <ArNav go={go} cur="eMap" set={set} />
    </Page>
  );
}

Object.assign(window, { LOCAL, LVL, LV_HEX, gaugeLv, hereY, GaugeCard, MapCard, mapPlaces, walkTo, startDrill, notiState, EHome, ENoti, EMap });
