// NARU v9 · 공용 부품 — "한 장의 백자"
// 원칙: 한 화면 = 큰 숫자 하나 + 가운데 사물 하나(달 원반 위) + 한 줄.

const IMG = k => 'assets/devices/' + k + '.jpg';
const SCN = k => 'assets/songjeong/sj-' + k + '.png';

const Ico = ({ name, size = 20, stroke = 1.6, style }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = '';
    const i = document.createElement('i');
    i.setAttribute('data-lucide', name);
    ref.current.appendChild(i);
    window.lucide.createIcons({ attrs: { width: size, height: size, 'stroke-width': stroke } });
  }, [name, size, stroke]);
  return <span ref={ref} aria-hidden="true" style={{ display: 'inline-flex', width: size, height: size, flexShrink: 0, ...style }} />;
};

// 워드마크 v9 — 획을 4배로 키우고 A의 꼭짓점 아래에 호박 신호 한 점. 둥근 끝(백자 곡선).
const Logo = ({ h = 14, color = 'currentColor', dot = true }) => (
  <svg viewBox="0 0 156 34" height={h} fill="none" aria-label="NARU" style={{ display: 'block', overflow: 'visible' }}>
    <g stroke={color} strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 31V4l22 27V4" /><path d="M44 31L57.5 4L71 31" />
      <path d="M90 31V4h11.5a8.5 8.5 0 0 1 0 17H90M102 21l10 10" /><path d="M130 4v15.5a11 11 0 0 0 22 0V4" />
    </g>
    {dot && <circle cx="57.5" cy="24" r="3.6" fill="#FFB114" />}
  </svg>
);

// 마스코트 '나루' — 등불을 든 길잡이 (백자 유백 + 청화 물결). 표정 = mood
const POSE = { calm: 'm-wave', guide: 'm-guide', alert: 'm-alert', happy: 'm-happy' };
const Mascot = ({ size = 56, mood = 'calm', style, bare, pose }) => (
  <div aria-label="나루" style={{ width: size, height: size, borderRadius: bare ? 0 : '50%', flexShrink: 0, background: bare ? 'transparent' : 'var(--tray)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative', overflow: 'visible', ...style }}>
    <img src={'assets/mascot/' + (pose || POSE[mood] || 'm-wave') + '.png'} alt=""
      style={{ height: bare ? '100%' : '88%', width: 'auto', maxWidth: '100%', objectFit: 'contain', objectPosition: '50% 100%', animation: mood === 'alert' ? 'n9bob .9s ease-in-out infinite' : 'n9bob 3.6s ease-in-out infinite' }} />
    {mood === 'alert' && <i className="breath" style={{ position: 'absolute', right: 0, top: 0, width: 10, height: 10, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 0 3px var(--amber-soft)' }} />}
  </div>
);

// 나루 마크 — 카드·시트에 들어가는 작은 표식. 물결 두 줄 + 한 점(등불)
const NaruMark = ({ size = 40, alert, style }) => (
  <span aria-hidden="true" style={{ width: size, height: size, borderRadius: size * .32, background: 'var(--tray)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style }}>
    <svg viewBox="0 0 24 24" width={size * .64} height={size * .64} fill="none">
      <path d="M2.5 14.5c2.4-2.6 4.6-2.6 7 0s4.6 2.6 7 0 3.6-2.4 5-1" stroke="var(--jade)" strokeWidth="2" strokeLinecap="round" />
      <path d="M2.5 19c2.4-2.6 4.6-2.6 7 0s4.6 2.6 7 0 3.6-2.4 5-1" stroke="var(--jade)" strokeWidth="2" strokeLinecap="round" opacity=".45" />
      <circle cx="12" cy="7.2" r="2.7" fill={alert ? 'var(--amber)' : 'var(--fg1)'} />
    </svg>
  </span>
);

// 누끼 제품 — 원 없이 그대로 떠 있게. 바닥 그림자 + 은은한 빛무리
const CUT = k => 'assets/cutout/m-' + k + '.png';
const Float = ({ k, h = 240, glow, water = 0, children, tilt = 0 }) => (
  <div style={{ position: 'relative', height: h + 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
    <div style={{ position: 'absolute', left: '50%', top: '46%', width: h * 1.05, height: h * 1.05, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: glow ? 'radial-gradient(closest-side, var(--amber-soft), transparent)' : 'radial-gradient(closest-side, color-mix(in oklab, var(--card) 85%, transparent), transparent)', pointerEvents: 'none' }} />
    <img src={CUT(k)} alt="" style={{ position: 'relative', height: h, maxWidth: '100%', objectFit: 'contain', objectPosition: '50% 100%', animation: 'n9bob 5s ease-in-out infinite', transform: `rotate(${tilt}deg)`, filter: 'drop-shadow(0 14px 14px rgba(30,26,20,.10))' }} />
    <div style={{ width: h * .34, height: 10, marginTop: 2, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(30,26,20,.18), transparent)' }} />
    {children}
  </div>
);

// 폰 — 한 장의 흰 판. 베젤은 얇게, 목업 장식 최소.
const Phone = ({ dark, children, label, time, skin, barInk }) => (
  <div className={'n9' + (skin ? ' ' + skin : '') + (dark ? ' dk' : '')} data-screen-label={label} style={{ width: 375, height: 780, borderRadius: 46, overflow: 'hidden', position: 'relative', flexShrink: 0, boxShadow: dark ? '0 0 0 1px rgba(255,255,255,.06), 0 40px 80px -40px rgba(0,0,0,.5)' : '0 0 0 1px rgba(23,24,27,.06), 0 40px 80px -40px rgba(40,34,26,.35)' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 30px 0', fontSize: 15, fontWeight: 700, zIndex: 50, pointerEvents: 'none', color: barInk }}>
      <span>{time || '9:41'}</span>
      <span style={{ display: 'flex', gap: 5 }}><Ico name="signal" size={15} stroke={2.2} /><Ico name="wifi" size={15} stroke={2.2} /><Ico name="battery-full" size={18} stroke={1.8} /></span>
    </div>
    <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
  </div>
);

// 머리줄 — 왼쪽 날짜/제목 ▾, 오른쪽 아이콘
const Top = ({ title, onTitle, onBack, right }) => (
  <div style={{ position: 'absolute', top: 54, left: 0, right: 0, height: 44, display: 'flex', alignItems: 'center', padding: '0 14px 0 ' + (onBack ? 10 : 22) + 'px', gap: 6, zIndex: 20 }}>
    {onBack && <IconBtn icon="chevron-left" label="뒤로" onClick={onBack} />}
    <button onClick={onTitle} style={{ border: 0, background: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 3, fontSize: 16, fontWeight: 600, cursor: onTitle ? 'pointer' : 'default', letterSpacing: '-.02em' }}>
      {title}{onTitle && <Ico name="chevron-down" size={16} stroke={2} />}
    </button>
    <div style={{ flex: 1 }} />
    {right}
  </div>
);
const IconBtn = ({ icon, label, onClick, size = 22 }) => (
  <button onClick={onClick} aria-label={label} style={{ width: 40, height: 40, border: 0, background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: 20 }}><Ico name={icon} size={size} /></button>
);

// 큰 숫자 — 가는 200, 단위는 작게. 옆에 작은 보조 값.
const Big = ({ v, u, delta, under, style }) => (
  <div style={style}>
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <span className="big">{v}</span>
      <span style={{ display: 'flex', flexDirection: 'column', marginLeft: 6, paddingTop: 8, gap: 2 }}>
        {delta && <span className="s nw" style={{ color: 'var(--fg2)' }}>{delta}</span>}
        <span className="big-u nw" style={{ marginLeft: 0 }}>{u}</span>
      </span>
    </div>
    {under && <div style={{ marginTop: 10, display: 'inline-flex', gap: 10, alignItems: 'center', height: 24, padding: '0 9px', borderRadius: 8, background: 'var(--card)', boxShadow: '0 0 0 1px var(--line)', fontSize: 11.5, fontWeight: 500, color: 'var(--fg2)', whiteSpace: 'nowrap' }}>{under}</div>}
  </div>
);

// 위치·상태 한 줄 — 가운데 정렬
const Place = ({ icon = 'navigation', where, state, time, stateTone }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14.5 }}>
      <Ico name={icon} size={14} stroke={2} style={{ transform: icon === 'navigation' ? 'rotate(0deg)' : 'none' }} />
      <span style={{ color: 'var(--fg2)' }}>{where}<b style={{ fontWeight: 650, color: stateTone || 'var(--fg1)', marginLeft: /^[은는이가에로을를의]/.test(state || '') ? 0 : 5 }}>{state}</b></span>
    </div>
    {time && <div className="c" style={{ marginTop: 3 }}>{time}</div>}
  </div>
);

// 달 원반 위의 사물 — 모든 기기·셔틀·장면이 같은 무대 위에 선다
function Stage({ src, size = 236, water = 0, rings, ringTone = 'line', glow, children, pos = '50% 50%', zoom = 1, top }) {
  return (
    <div style={{ position: 'relative', width: size, height: size + 26, margin: '0 auto' }}>
      <div style={{ position: 'absolute', left: '50%', bottom: 0, width: size * .66, height: 20, marginLeft: -size * .33, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(30,26,20,.20), transparent)' }} />
      {rings && [0, 1, 2].map(i => (
        <div key={i} style={{ position: 'absolute', left: 0, top: 0, width: size, height: size, borderRadius: '50%', border: '1px solid ' + (ringTone === 'amber' ? 'var(--amber)' : ringTone === 'jade' ? 'var(--jade)' : 'var(--line2)'), animation: `n9ring 2.4s ease-out ${i * .8}s infinite`, pointerEvents: 'none' }} />
      ))}
      <div style={{ position: 'absolute', left: 0, top: 0, width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: 'var(--disc)', boxShadow: glow ? '0 0 0 6px var(--amber-soft), 0 24px 40px -26px rgba(30,26,20,.5)' : 'inset 0 -14px 30px rgba(30,26,20,.05), 0 24px 40px -28px rgba(30,26,20,.45)' }}>
        {top ? top : <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${zoom})`, display: 'block' }} />}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.max(0, water) * 100 + '%', background: 'linear-gradient(180deg, rgba(143,214,191,.55), rgba(46,125,105,.62))', borderTop: water > 0 ? '2px solid rgba(255,255,255,.9)' : 0, transition: 'height 1.4s cubic-bezier(.22,.7,.2,1)' }} />
      </div>
      {children}
    </div>
  );
}

// 사물 옆에 뜨는 작은 표시 — 동그란 먹 점 + 짧은 말
const Mark = ({ x, y, icon, label, tone = 'ink', right }) => {
  const bg = tone === 'amber' ? 'var(--amber)' : tone === 'jade' ? 'var(--jade)' : 'var(--fg1)';
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 6, flexDirection: right ? 'row-reverse' : 'row', pointerEvents: 'none', zIndex: 3 }}>
      <span style={{ width: 26, height: 26, borderRadius: 13, background: bg, color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px var(--bg)' }}><Ico name={icon} size={13} stroke={2.4} /></span>
      {label && <span className="nw" style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg2)', background: 'var(--bg)', padding: '2px 6px', borderRadius: 8 }}>{label}</span>}
    </div>
  );
};

// 오른쪽 아래 보조 숫자 — W의 '강수량' 자리
const Side = ({ v, u, label, tone = 'var(--jade-num)', style }) => (
  <div style={{ textAlign: 'right', ...style }}>
    <div style={{ fontSize: 44, fontWeight: 200, letterSpacing: '-.05em', lineHeight: 1, color: tone, fontVariantNumeric: 'tabular-nums' }}>{v}<span style={{ fontSize: 15, fontWeight: 400, marginLeft: 2 }}>{u}</span></div>
    <div className="c" style={{ marginTop: 4 }}>{label}</div>
  </div>
);

// 하단 — 세 개뿐: 왼쪽 KIT · 가운데 더보기 · 오른쪽 나
const Bottom = ({ go, onMore, mid = '더보기', left = ['sparkles', 'kAi', 'AI 나루'], right = ['circle-user', 'kFamily', '가족·나'] }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 18, height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', zIndex: 30 }}>
    <IconBtn icon={left[0]} label={left[2]} onClick={() => go(left[1])} />
    <button onClick={onMore} style={{ border: 0, background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: 6 }}>
      <span className="c" style={{ color: 'var(--fg2)' }}>{mid}</span>
      <Ico name="chevron-down" size={14} stroke={2} style={{ color: 'var(--fg3)' }} />
    </button>
    <IconBtn icon={right[0]} label={right[2]} onClick={() => go(right[1])} />
  </div>
);

// 흰 판 — 정보 묶음
const Card = ({ children, style, pad = '4px 18px' }) => (
  <div style={{ background: 'var(--card)', borderRadius: 24, padding: pad, boxShadow: '0 0 0 1px var(--line)', ...style }}>{children}</div>
);
const Row = ({ icon, title, sub, right, onClick, last }) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, padding: '10px 0', borderBottom: last ? 0 : '1px solid var(--line)', cursor: onClick ? 'pointer' : 'default' }}>
    {icon && <Ico name={icon} size={19} style={{ color: 'var(--fg2)' }} />}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 15, fontWeight: 500 }}>{title}</div>
      {sub && <div className="s">{sub}</div>}
    </div>
    {right}
  </div>
);
const Toggle = ({ on, onClick }) => (
  <button onClick={onClick} aria-pressed={!!on} style={{ width: 46, height: 28, borderRadius: 14, border: 0, padding: 3, cursor: 'pointer', background: on ? 'var(--act)' : 'var(--line2)', flexShrink: 0 }}>
    <span style={{ display: 'block', width: 22, height: 22, borderRadius: 11, background: on ? 'var(--on-act)' : 'var(--card)', transform: on ? 'translateX(18px)' : 'none', transition: 'transform .2s' }} />
  </button>
);
const Ex = () => <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg3)', border: '1px solid var(--line2)', borderRadius: 4, padding: '0 4px', marginLeft: 6, verticalAlign: 2, whiteSpace: 'nowrap' }}>예시</span>;

// 길게 누르기 — 원형 진행
function Hold({ label = '길게 눌러 부르기', onDone, size = 92 }) {
  const [p, setP] = React.useState(0);
  const t = React.useRef(null);
  const start = () => { clearInterval(t.current); const t0 = Date.now(); t.current = setInterval(() => { const q = Math.min(1, (Date.now() - t0) / 1200); setP(q); if (q >= 1) { clearInterval(t.current); onDone && onDone(); } }, 30); };
  const stop = () => { clearInterval(t.current); if (p < 1) setP(0); };
  const r = size / 2 - 3, C = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <button onPointerDown={e => { try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {} start(); }} onPointerUp={stop} onPointerCancel={stop} onContextMenu={e => e.preventDefault()} onClick={e => e.detail === 0 && onDone && onDone()} aria-label={label}
        style={{ position: 'relative', width: size, height: size, borderRadius: '50%', border: 0, cursor: 'pointer', background: 'var(--act)', color: 'var(--on-act)', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
        <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--amber)" strokeWidth="3" strokeDasharray={`${C * p} ${C}`} strokeLinecap="round" opacity={p > 0 ? 1 : 0} /></svg>
        <span className="dot breath" />
      </button>
      <span className="s nw" style={{ color: 'var(--fg2)' }}>{label}</span>
    </div>
  );
}

// 더보기 시트
const MORE = [['layers', '미리 겪기', 'kSim'], ['route', '대비 계획', 'kPlan'], ['footprints', '내 걸음', 'sWalk'], ['message-circle', 'AI 나루', 'kAi'], ['bus', '나루 부르기', 'kCall'], ['siren', '대피 연습', 'kDrill'], ['map-pinned', '장소', 'kPlaces'], ['bell', '알림', 'kInbox'], ['life-buoy', '도움 요청', 'kSOS'], ['settings', '설정', 'kSettings']];
function MoreSheet({ open, close, go }) {
  if (!open) return null;
  return (
    <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,12,.28)', zIndex: 60 }}>
      <div onClick={e => e.stopPropagation()} className="in" style={{ position: 'absolute', left: 8, right: 8, bottom: 8, background: 'var(--card)', borderRadius: 36, padding: '12px 20px 30px' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line2)', margin: '0 auto 18px' }} />
        <div className="lb" style={{ marginBottom: 14 }}>나루와 할 수 있는 것</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', rowGap: 18 }}>
          {MORE.map(([ic, l, k]) => (
            <button key={l} onClick={() => { close(); go(k); }} style={{ border: 0, background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 52, height: 52, borderRadius: 26, background: 'var(--tray)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico name={ic} size={21} /></span>
              <span className="nw" style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg2)' }}>{l}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NaruMark, Float, CUT, Mascot, IMG, SCN, Ico, Logo, Phone, Top, IconBtn, Big, Place, Stage, Mark, Side, Bottom, Card, Row, Toggle, Ex, Hold, MoreSheet });
