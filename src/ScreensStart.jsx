// NARU · 처음 열 때 (2026-11-23 정리)
// 시작(파란 판 + 나루) → [처음: 권한 · 시작 · 약관 · 본인 확인 · 내 정보 (ScreensAuth)] → 준비 끝(내 대피 카드) → 홈.
// 다시 열 때는 시작 → 연결 중 → 홈. 잠금 화면 경보 알림.
// 브랜드 색이 화면을 차지하는 순간은 셋뿐: 시작 · 연결 · 연습을 마쳤을 때 (3D 나루가 한 명).
// ?ui={"still":1} 이면 저절로 넘어가지 않는다(캡처용, bare=1이면 기본). ?ui={"load":1} = 연결 중 두 번째 줄

// ─ 0. 시작: 파란 판 · 나루 · 로고 · 한 줄
function ESplash({ go, st = {}, ui = {} }) {
  const next = () => go(st.onboarded ? 'eLoad' : 'ePerm');
  React.useEffect(() => { if (ui.still) return; const t = setTimeout(next, 1500); return () => clearTimeout(t); }, []);
  return (
    <Page>
      <button className="ar-band fill sp" onClick={next} aria-label="나루 시작">
        <DropWm w={440} style={{ left: -32, top: 116 }} />
        <span className="sp-mid ar-in">
          <Naru pose="idle" h={200} float style={{ position: 'relative' }} />
          <span className="sp-logo"><Logo h={30} /></span>
          <span className="sp-tag">물이 오기 전에, 안전한 곳으로</span>
        </span>
        <span className="sp-foot">{MARKET.place} · 호우 대피 길잡이</span>
      </button>
    </Page>
  );
}

// ─ 1. 연결 중 (다시 열 때): 판(문장 + 등불 든 나루) · 확인 목록 (내 자리 → 비 소식 → 안전한 곳)
const LOAD = [
  { ic: 'map-pin', k: '내 자리', v: `${MARKET.place} · 골목 안쪽` },
  { ic: 'cloud-rain', k: '비 소식', v: '호우 특보 없음', ex: true },
  { ic: 'building-2', k: '안전한 곳', v: `입구 밖 · 높은 건물 ${MARKET.safe.filter(s => s.tall).length}곳` },
];
function ELoad({ go, st, ui = {} }) {
  const [k, setK] = React.useState(Math.max(0, Math.min(LOAD.length, ui.load ?? 0)));
  const done = k >= LOAD.length;
  React.useEffect(() => {
    if (ui.still) return;
    const t = setTimeout(() => (done ? go(st.onboarded ? 'eNow' : 'ePerm') : setK(k + 1)), done ? 900 : 950);
    return () => clearTimeout(t);
  }, [k]);
  return (
    <Page>
      <Band fill left={<span className="logo"><Logo h={17} /></span>} wm={<DropWm w={300} style={{ right: -64, top: 190 }} />}>
        <div className="ar-in" key={done ? 'd' : 'l'} role="status">
          <h1 className="ar-h1">{done ? <>나루와<br /><b>연결됐어요</b></> : <>나루와<br /><b>연결하고 있어요</b></>}</h1>
          <p className="ar-b2">{done ? '이제 나루가 먼저 알려 드릴게요' : '잠깐이면 돼요'}</p>
        </div>
        <Naru pose="lantern" h={150} float style={{ right: 28, bottom: 28 }} />
      </Band>
      <div className="pg-body" style={{ flex: 'none' }}>
        <div className="ar-card list">
          {LOAD.map((r, i) => {
            const ok = i < k, now = i === k, wait = !ok && !now;
            // 기다리는 줄도 글은 그대로 읽히게(어르신 대비): 흐리게 하지 않고 아이콘만 옅게, 상태는 빈 고리로
            return <div key={r.k} className="ar-li" style={{ cursor: 'default' }}>
              <span className="ar-gt" style={{ opacity: wait ? .55 : 1 }}><Ico name={r.ic} size={22} stroke={2} /></span>
              <span className="tx"><span className="s">{r.k}</span><span className="t">{r.v}{r.ex && <ArEx />}</span></span>
              <span className={'ld-st' + (ok ? ' ok' : '')} role="img" aria-label={ok ? '확인됨' : now ? '확인 중' : '기다리는 중'}>{ok ? <Ico name="check" size={16} stroke={3} /> : now ? <i /> : null}</span>
            </div>;
          })}
        </div>
      </div>
    </Page>
  );
}

// ─ 2. 준비 끝: 내 대피 카드 한 장 + 단추 둘 (나루 시작하기 · 대피 연습 해 보기)
function EStart({ go, st, set, night }) {
  const g = eGait(st), b = decide(g, 0).best;
  // 대피 연습 = 실제와 같은 차례(경보 화면 → 길 → 도착)를 파란 판으로
  const done = drill => { set({ ob: 0, onboarded: 1, alert: 0, arrived: null, mode: drill ? 'drill' : 'real', lv: 0, flow: null, step: 0, at: null, from: drill ? 'now' : null }); go('eNow'); };
  return (
    <Page>
      <AuTop onBack={() => go('eProfile')} step={auN(st) - 1} n={auN(st)} />
      <AuHead title={<><b>준비됐어요</b></>} sub="경보가 오면 이 카드대로 알려 드려요" />
      <Body>
        <div className="ar-card bl ar-in">
          <span className="ar-c" style={{ display: 'block' }}>내 대피 카드 · {GAITS[g].name}</span>
          <p className="ar-t1" style={{ marginTop: 4, textWrap: 'balance' }}>{cardLine(g)}</p>
          {b && <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0 10px', marginTop: 12 }}><Num v={b.dist} u="m" on /><span className="ar-b2">{GAITS[g].by} {b.min}분<ArEx /></span></div>}
          {b && b.exit && upLine(g) && <p className="ar-flow"><Ico name="building-2" size={18} stroke={2} />{upLine(g)}</p>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}><Naru pose="cheer" h={148} float style={{ position: 'relative' }} /></div>
      </Body>
      <Foot>
        {/* 주 단추는 앞 단계의 '다음' · '확인'과 같은 자리(맨 아래) */}
        <button className="ar-btn text" onClick={() => done(true)}>대피 연습 해 보기</button>
        <button className="ar-btn" onClick={() => done(false)}>나루 시작하기</button>
      </Foot>
    </Page>
  );
}

// ─ 3. 경보 알림 (잠금 화면): 시계보다 할 일이 크다. 보낸 곳(기상청 · 동네) → 할 일 → 거리
function ELock({ go, st, set, night }) {
  const g = eGait(st), D = decide(g, 0), b = D.best, T = ltTime(night);
  const open = () => { set({ alert: 1, alertSaid: 0, arrived: null, mode: 'real', step: 0, at: null, here: 0, rkFocus: null, from: null, rk: null, rkMode: null, walkS: null, walkFrom: null, detourAt: null }); go('eNow'); };
  const wall = night ? 'linear-gradient(180deg,#0B0C0E 0%,#131A2A 60%,#16213A 100%)' : 'linear-gradient(180deg,#F4F5F6 0%,#E4ECFB 60%,#D2E0F8 100%)';   // 잠금 화면 바탕: 흰 회색 → 옅은 파랑 (KRDS 회색 · 주 색 계열)
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: wall }} /><div className="ar-rain" />
      <div className="lk-clock"><div className="d">{T.day}</div><div className="t">{T.alert}</div></div>
      <button onClick={open} aria-label={'나루 실제 경보. ' + (b ? (b.exit ? '입구 밖으로 나가세요' : `${b.short} ${b.floors}층으로 가세요`) : '안전한 곳으로 가세요') + '. 눌러서 길 안내 열기'} className="ar-card lk-card ar-in">
        <div className="hd"><NaruAvatar s={28} style={{ borderRadius: 6 }} /><b>나루</b><RealChip /><span style={{ flex: 1 }} /><span className="ar-c">지금</span></div>
        <div className="src">기상청 호우경보 · {LOCAL.dong}</div>
        <div className="ar-h1">{b ? (b.exit ? <><b>입구 밖</b>으로 나가세요</> : <><b>{b.short} {b.floors}층</b>으로 가세요</>) : <><b>안전한 곳</b>으로 가세요</>}</div>
        {/* 잰 값(거리)은 그대로, 예시 값(물 시간)은 한 줄에 예시 하나로 */}
        <div className="ar-b">안전한 곳까지 {b ? b.dist : '-'}m · {D.wet}분 뒤 골목에 물<ArEx /></div>
        <div className="open"><span>눌러서 길 안내 열기</span><Ico name="chevron-right" size={20} stroke={2.2} /></div>
      </button>
    </>
  );
}

Object.assign(window, { ESplash, ELoad, EStart, ELock });
