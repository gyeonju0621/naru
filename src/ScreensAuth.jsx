// NARU · 처음 열 때 — 권한 안내 · 시작(로그인 고르기) · 약관 동의 · 본인 확인 · 내 정보 (2026-11-23)
// 그녀의 말: "로그인 화면이나 그런 것도 다 만들어 줘 … 다 이유가 있어야 해"
// 이유:
//   ① 재난 정보(경보 · 지도 · 행동요령 · 안전한 곳)는 로그인 없이 바로 — 위급할 때 가입 화면이 막으면 안 된다.
//      로그인은 '내 대피 카드'(걸음 · 가게 자리)를 다른 휴대폰에서도 쓰려는 사람만 고른다.
//   ② 권한은 필수 · 선택을 나눠 왜 필요한지 한 줄씩(앱 접근 권한 고지). 선택은 안 해도 앱이 돈다.
//   ③ 약관은 필수와 선택을 나누고, 무엇을 모으는지 줄마다 적는다. '전체 동의'는 한 번에. '보기'는 그 약관을 판으로 연다.
//   ④ 본인 확인은 휴대폰 번호 한 가지(어르신이 가장 익숙한 방법) + 인증서. 시제품이라 실제로 보내거나 확인하지 않는다.
//   ⑤ 내 정보 = 대피 판단에 쓰는 것만: 어떻게 다니는지(길 · 속도 · 계단), 글자 크기, 자주 있는 곳.
//   정부 상징 · 기관 로고는 넣지 않는다(공식 정부 서비스처럼 보이면 안 된다).
// 자리: 머리(뒤로 · 단계 막대) → 한 문장(24) + 한 줄(17) → 몸(스크롤) → 발(단추 하나). 글자를 키워도 겹치지 않는다.

// 단계 막대: 약관 → (본인 확인) → 내 정보 → 준비 끝. 로그인 없이 시작하면 본인 확인이 없어 3단계
const auGuest = st => st.auth === 'guest' || !st.auth;
const auN = st => (auGuest(st) ? 3 : 4);
// 머리의 높이는 단계 막대가 없어도 같다(권한 안내 · 내 정보에서 온 본인 확인): 한 문장이 늘 같은 자리에서 시작한다
const AuTop = ({ onBack, step, n = 4 }) => (
  <div className="pg-top" style={{ minHeight: 'calc(var(--top) + 56px)' }}>
    <div className="bar">{onBack ? <ArBack onClick={onBack} /> : <span className="au-mark"><Logo h={17} /></span>}</div>
    {step != null && <div className="ar-steps" role="progressbar" aria-valuemin={1} aria-valuemax={n} aria-valuenow={step + 1} aria-label={`처음 설정 ${n}단계 중 ${step + 1}단계`}>{Array.from({ length: n }, (_, k) => <i key={k} className={k <= step ? 'on' : ''} />)}</div>}
  </div>
);
const AuHead = ({ title, sub }) => (
  <div className="pg-head ar-in">
    <h1 className="ar-h1">{title}</h1>
    {sub && <p className="ar-b">{sub}</p>}
  </div>
);
const Demo = ({ children = '시연 화면이라 실제로 보내거나 확인하지 않아요' }) => <p className="au-demo"><Ico name="info" size={15} stroke={2} /><span>{children}</span></p>;

// ─ 1. 앱 접근 권한 안내 (처음 한 번)
const PERMS = [
  { k: 'loc', need: true, ic: 'map-pin', t: '위치', s: '가장 가까운 안전한 곳과 길을 찾아요' },
  { k: 'noti', need: true, ic: 'bell-ring', t: '알림', s: '호우 · 홍수 경보를 바로 알려요' },
  { k: 'tel', need: false, ic: 'phone', t: '전화', s: '앱에서 119에 바로 걸 수 있어요' },
];
function EPerm({ go }) {
  return (
    <Page>
      <AuTop />
      <AuHead title={<>나루가 쓰는 <b>권한</b>이에요</>} sub="왜 필요한지 하나씩 알려 드려요" />
      <Body>
        {[true, false].map(need => <React.Fragment key={String(need)}>
          <h2 className="au-sec">{need ? '꼭 필요해요' : '골라서 허용해요'}</h2>
          <div className="ar-card list">
            {PERMS.filter(p => p.need === need).map(p => <div key={p.k} className="ar-li" style={{ cursor: 'default' }}>
              <span className="ar-gt"><Ico name={p.ic} size={22} stroke={2} /></span>
              <span className="tx"><span className="t">{p.t}</span><span className="s">{p.s}</span></span>
            </div>)}
          </div>
        </React.Fragment>)}
        <p className="au-note">골라서 허용하는 권한은 허용하지 않아도 나루를 쓸 수 있어요. 휴대폰 설정에서 언제든 바꿀 수 있어요.</p>
      </Body>
      <Foot><button className="ar-btn" onClick={() => go('eWelcome')}>확인</button></Foot>
    </Page>
  );
}

// ─ 2. 시작: 로그인 없이(먼저) · 휴대폰 번호 · 인증서
function EWelcome({ go, set }) {
  const pick = how => { set({ auth: how, loggedIn: 0 }); go('eTerms'); };
  return (
    <Page>
      <div className="au-hero">
        <Naru pose="idle" h={148} float />
        <span className="au-logo"><Logo h={26} /></span>
        <p className="au-tag">물이 오기 전에, 안전한 곳으로</p>
        <p className="au-area"><Ico name="map-pin" size={15} stroke={2.2} />광주 {LOCAL.dong.split(' ')[0]} · {MARKET.place}</p>
      </div>
      <Foot clear>
        <button className="ar-btn" onClick={() => pick('guest')}>로그인 없이 시작하기</button>
        <p className="au-why">경보 · 지도 · 행동요령은 로그인 없이 볼 수 있어요</p>
        <div className="au-or"><i />다른 휴대폰에서도 내 카드를 보려면<i /></div>
        <div className="au-two">
          <button className="ar-btn sec" onClick={() => pick('phone')}><Ico name="smartphone" size={20} stroke={2} />휴대폰 번호</button>
          <button className="ar-btn sec" onClick={() => pick('simple')}><Ico name="shield-check" size={20} stroke={2} />인증서</button>
        </div>
        <Demo>시연 화면이라 실제 로그인은 하지 않아요</Demo>
      </Foot>
    </Page>
  );
}

// ─ 3. 약관 동의: 전체 동의 · 필수 셋 · 선택 하나 (무엇을 모으는지 줄마다)
const TERMS = [
  { k: 'svc', need: true, t: '서비스 이용약관', s: '나루를 쓰는 데 필요한 약속',
    body: [['무엇을 하는 서비스인가요?', '나루는 1913 송정역시장 골목의 호우 · 홍수 대피를 돕는 앱이에요. 경보가 오면 가장 가까운 안전한 곳과 가는 길을 알려 드리고, 평소에는 그 길을 미리 걸어 볼 수 있어요.'],
      ['꼭 알아 두세요', '실제 재난 때는 재난문자와 119의 안내를 먼저 따르세요.'],
      ['그만 쓰고 싶을 때', '내 정보에서 언제든 처음 상태로 되돌릴 수 있어요. 되돌리면 이 휴대폰에 저장한 내 대피 카드가 지워져요.']] },
  { k: 'pi', need: true, t: '개인정보 수집 · 이용', s: '걸음 · 글자 크기 · 자주 있는 곳, 로그인하면 이름 · 휴대폰 번호',
    body: [['모으는 것', '걸음(걸어서 · 보행보조차 · 휠체어), 글자 크기, 자주 있는 곳(가게 자리). 로그인하면 이름과 휴대폰 번호도요.'],
      ['어디에 쓰나요?', '내 걸음으로 갈 수 있는 안전한 곳과 걸리는 시간을 계산하는 데만 써요.'],
      ['언제까지', '로그인 없이 쓰면 이 휴대폰에만 저장돼요. 로그인했으면 탈퇴할 때 바로 지워요.']] },
  { k: 'loc', need: true, t: '위치기반서비스 이용약관', s: '지금 있는 곳 — 길 안내에만 쓰고 저장하지 않아요',
    body: [['모으는 것', '길 안내를 켠 동안의 지금 위치.'],
      ['어디에 쓰나요?', '지금 선 자리에서 가장 가까운 안전한 곳과 길을 찾는 데만 써요. 119 신고 화면에 지금 자리를 글로 보여 드려요.'],
      ['저장하나요?', '아니요. 화면을 닫으면 위치를 남기지 않아요.']] },
  { k: 'edu', need: false, t: '대비 교육 · 연습 알림', s: '장마철 전에 연습을 알려 드려요',
    body: [['무엇을 받나요?', '장마철이 오기 전 대피 연습 안내, 우리 동네 행동요령 소식을 알림으로 받아요.'],
      ['안 받아도 되나요?', '네. 동의하지 않아도 경보와 길 안내는 그대로 받아요. 내 정보에서 언제든 바꿀 수 있어요.']] },
];
const Chk = ({ on, big }) => <span className={'au-chk' + (on ? ' on' : '') + (big ? ' big' : '')} aria-hidden="true">{on && <Ico name="check" size={big ? 18 : 15} stroke={3} />}</span>;
function ETerms({ go, st, set, pop }) {
  const [c, setC] = React.useState(() => ({ ...(st.terms || {}) }));
  const all = TERMS.every(t => c[t.k]), ok = TERMS.filter(t => t.need).every(t => c[t.k]);
  const toggleAll = () => setC(all ? {} : Object.fromEntries(TERMS.map(t => [t.k, true])));
  const next = () => { set({ terms: c }); go(auGuest(st) ? 'eProfile' : 'eVerify'); };
  return (
    <Page>
      <AuTop onBack={() => go('eWelcome')} step={0} n={auN(st)} />
      <AuHead title={<>약관에 <b>동의</b>해 주세요</>} sub="필수 약관에 동의해야 시작할 수 있어요" />
      <Body>
        <button className={'au-all' + (all ? ' on' : '')} role="checkbox" aria-checked={all} onClick={toggleAll}><Chk on={all} big /><span>모두 동의합니다</span></button>
        <div className="ar-card list" style={{ marginTop: 12 }}>
          {TERMS.map(t => <div key={t.k} className="au-term">
            <button role="checkbox" aria-checked={!!c[t.k]} onClick={() => setC(o => ({ ...o, [t.k]: !o[t.k] }))}>
              <Chk on={!!c[t.k]} /><span className="tx"><span className="t"><em className={t.need ? '' : 'opt'}>{t.need ? '필수' : '선택'}</em>{t.t}</span><span className="s">{t.s}</span></span>
            </button>
            <button className="au-view" aria-label={t.t + ' 보기'} onClick={() => pop && pop({ k: 'terms', id: t.k })}>보기<Ico name="chevron-right" size={18} stroke={2} /></button>
          </div>)}
        </div>
      </Body>
      <Foot><button className="ar-btn" disabled={!ok} onClick={next}>{ok ? '동의하고 계속' : '필수 약관에 동의해 주세요'}</button></Foot>
    </Page>
  );
}

// ─ 4. 본인 확인 (휴대폰 번호 · 인증서) — 화면만: 보내거나 확인하지 않는다
const CERTS = [['민간인증서', 'shield-check'], ['금융인증서', 'landmark'], ['통신사 인증서', 'smartphone'], ['공동인증서', 'file-badge']];
function EVerify({ go, st, set, ui = {}, toast }) {
  const simple = st.auth === 'simple';
  const [sent, setSent] = React.useState(!!ui.sent);
  const [code, setCode] = React.useState(ui.sent ? '123456' : '');
  const [name, setName] = React.useState(ui.sent ? '박순례' : ''), [tel, setTel] = React.useState(ui.sent ? '010 0000 0000' : '');
  const telOk = tel.replace(/\D/g, '').length >= 10;
  const [sec, setSec] = React.useState(179);
  React.useEffect(() => { if (!sent || ui.still) return; const t = setInterval(() => setSec(v => Math.max(0, v - 1)), 1000); return () => clearInterval(t); }, [sent]);
  // 시연: 인증번호를 받으면 문자가 온 것처럼 잠시 뒤 채워 준다
  // 시제품: 번호를 비워 둔 채 누르면 보기 이름 · 번호를 채워 준다(시연이 한 번에 넘어가게). 적다 만 번호는 다시 묻는다
  const send = () => {
    const blank = !tel.trim();
    if (blank) { setTel('010 0000 0000'); if (!name.trim()) setName('박순례'); }
    else if (!telOk) return toast && toast('휴대폰 번호를 다시 확인해 주세요');
    setSent(true); setSec(179); if (!code) setTimeout(() => setCode('123456'), 900);
    toast && toast(blank ? '시연 화면이라 이름 · 번호 · 인증번호를 채워 드렸어요' : '시연 화면이라 인증번호를 채워 드렸어요');
  };
  // 내 정보에서 '로그인하기'로 왔으면(relog) 처음 설정을 다시 밟지 않고 내 정보로 돌아간다
  const relog = !!st.relog;
  const next = () => { if (relog) { set({ loggedIn: 1, relog: 0 }); toast && toast('로그인했어요'); go('ePlan'); } else { set({ loggedIn: 1 }); go('eProfile'); } };
  const ok = sent && code.length === 6 && !!name.trim() && sec > 0;
  return (
    <Page>
      <AuTop onBack={() => { if (relog) { set({ relog: 0 }); go('ePlan'); } else go('eTerms'); }} step={relog ? null : 1} n={4} />
      <AuHead title={simple ? <><b>인증서</b>로 확인해요</> : <><b>휴대폰 번호</b>로 확인해요</>} sub={simple ? '쓰고 있는 인증서를 골라 주세요' : '문자로 받은 인증번호를 넣으면 끝나요'} />
      <Body>
        {simple ? <>
          <div className="au-grid">{CERTS.map(([n, ic]) => <button key={n} className="au-tile" onClick={next}><span className="ic"><Ico name={ic} size={24} stroke={2} /></span>{n}</button>)}</div>
          <Demo>시연 화면이라 실제 인증 화면으로 넘어가지 않아요. 고르면 확인된 것으로 보고 넘어가요.</Demo>
        </> : <>
          <label className="au-field"><span className="lb">이름</span><input placeholder="이름을 입력해 주세요" autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></label>
          <label className="au-field"><span className="lb">휴대폰 번호</span>
            <span className="row"><input type="tel" placeholder="010 0000 0000" inputMode="numeric" autoComplete="tel" value={tel} onChange={e => setTel(e.target.value.replace(/[^\d ]/g, '').slice(0, 13))} />{sent && <button type="button" className="ar-btn sec flex0" onClick={send}>다시 받기</button>}</span></label>
          {sent && <label className="au-field"><span className="lb">인증번호 6자리 <em>{sec > 0 ? `남은 시간 ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` : '시간이 지났어요 · 다시 받아 주세요'}</em></span><input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="숫자 6자리" inputMode="numeric" autoComplete="one-time-code" /></label>}
          <Demo />
        </>}
      </Body>
      {/* 아래 큰 단추가 늘 다음 할 일: 번호를 받기 전에는 '인증번호 받기', 받은 뒤에는 '확인' */}
      {!simple && <Foot>{sent ? <button className="ar-btn" disabled={!ok} onClick={next}>{ok ? '확인' : !name.trim() ? '이름을 넣어 주세요' : sec <= 0 ? '시간이 지났어요' : '인증번호 6자리를 넣어 주세요'}</button>
        : <button className="ar-btn" onClick={send}>인증번호 받기</button>}</Foot>}
    </Page>
  );
}

// ─ 5. 내 정보: 대피 판단에 쓰는 것만 (걸음 · 글자 크기 · 자주 있는 곳)
const GAIT_SUB = { walk: '계단을 오를 수 있어요', aid: '계단과 턱이 어려워요', wheel: '계단을 못 올라요' };
const GAIT_PIC = { walk: 'walk', aid: 'walker', wheel: 'wheel' };
function EProfile({ go, st, set }) {
  const g = eGait(st), b = decide(g, 0).best;
  return (
    <Page>
      <AuTop onBack={() => go(auGuest(st) ? 'eTerms' : 'eVerify')} step={auN(st) - 2} n={auN(st)} />
      <AuHead title={<>어떻게 <b>다니세요?</b></>} sub="걸음에 맞춰 갈 곳과 길이 달라져요" />
      <Body>
        <div role="radiogroup" aria-label="내 걸음" onKeyDown={radioKeys}>
          {Object.entries(GAITS).map(([k, v]) => { const on = k === g;
            return <button key={k} role="radio" aria-checked={on} tabIndex={on ? 0 : -1} className="ar-opt" onClick={() => set({ walk: k })}>
              <span className="ar-gt"><Picto name={GAIT_PIC[k]} size={28} color={on ? 'var(--on-pri)' : 'var(--ink)'} /></span>
              <span className="tx"><span className="ar-t3" style={{ display: 'block' }}>{v.name}</span><span className="ar-b2" style={{ display: 'block' }}>{GAIT_SUB[k]}</span></span>
              <span className="rd">{on && <Ico name="check" size={14} stroke={3} />}</span>
            </button>; })}
        </div>
        <h2 className="au-sec">글자 크기</h2>
        <FsStep st={st} set={set} />
        <h2 className="au-sec">자주 있는 곳</h2>
        <div className="ar-card list"><div className="ar-li" style={{ cursor: 'default' }}>
          <span className="ar-gt"><Ico name="store" size={22} stroke={2} /></span>
          <span className="tx"><span className="t">{MARKET.place} · 내 가게</span><span className="s">골목 안 · 입구에서 {hereY({})}m 안쪽{b ? <><br />{placeShort(b)}까지 {b.dist}m</> : null}</span></span>
        </div></div>
      </Body>
      <Foot><button className="ar-btn" onClick={() => { set({ ob: 2 }); go('eStart'); }}>다음</button></Foot>
    </Page>
  );
}

Object.assign(window, { EPerm, EWelcome, ETerms, EVerify, EProfile, AuTop, AuHead, Chk, Demo, TERMS, GAIT_SUB, GAIT_PIC, auGuest, auN });
