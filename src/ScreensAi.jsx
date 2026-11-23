// NARU v9.5 · AI 나루 (시리처럼 묻는 화면) · 차 안 크게 보기

// ── AI 나루 — 마스코트를 '대화의 주인공'으로 쓰는 유일한 화면
const ASK = [
  { q: '지금 나가도 될까요?', a: '지금은 나가지 않는 게 좋아요.', why: '집 앞 물이 0.1m로 발목 높이예요. 12분 뒤 0.5m가 될 것으로 보여요.', src: ['HOME PLATE · 1분 전', '3D 레벨 수위 예측', '재난문자 23:01'] },
  { q: '휠체어로 지나갈 수 있나요?', a: '승강장 A까지 갈 수 있어요.', why: '시장길 가운데 문턱 12cm만 피하면 돼요. 폭은 3.1m로 넉넉해요.', src: ['3D 레벨 · 폭 3.1m', '문턱 높이 12cm'] },
  { q: '무엇을 챙겨야 해요?', a: '세 가지면 충분해요.', why: '휴대폰, NARU PASS, KEEPER 키트예요. KEEPER는 현관 옆에 있어요.', src: ['내 대비 계획 A', '현관 옆 KEEPER 위치'] },
];
function KAi({ go, ui }) {
  const [i, setI] = React.useState(ui && Number.isInteger(ui.ai) && ASK[ui.ai] ? ui.ai : -1);
  return (
    <>
      <Top title="AI 나루" onBack={() => go('kHome')} right={<IconBtn icon="history" label="지난 대화" />} />
      <div className="in" style={{ position: 'absolute', top: 104, left: 0, right: 0, bottom: 108, overflowY: 'auto', overflowX: 'hidden', padding: '0 20px' }}>
        {i < 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 12 }}>
            <div style={{ position: 'relative', height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: 210, height: 210, borderRadius: '50%', background: 'radial-gradient(closest-side, var(--amber-soft), transparent)' }} />
              <img src="assets/mascot/m-guide.png" alt="" style={{ position: 'relative', height: 180, animation: 'n9bob 4.6s ease-in-out infinite' }} />
            </div>
            <div className="h1" style={{ marginTop: 10 }}>무엇이든 물어보세요.</div>
            <div className="s" style={{ marginTop: 6, lineHeight: 1.6 }}>3D 데이터와 우리 집 수위를 보고<br />이 사람에게 맞는 답을 드려요.</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '6px 0 16px' }}>
              <div style={{ maxWidth: '84%', background: 'var(--act)', color: 'var(--on-act)', borderRadius: '20px 20px 6px 20px', padding: '12px 16px', fontSize: 14.5, fontWeight: 500 }}>{ASK[i].q}</div>
            </div>
            <div className="in" style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <NaruMark size={34} alert={i === 0} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 650, letterSpacing: '-.025em', lineHeight: 1.4 }}>{ASK[i].a}</div>
                <div className="b" style={{ fontSize: 14, marginTop: 6 }}>{ASK[i].why}</div>
                <div style={{ marginTop: 12, background: 'var(--tray)', borderRadius: 16, padding: '10px 13px' }}>
                  <div className="lb" style={{ fontSize: 10 }}>근거</div>
                  {ASK[i].src.map((s, k) => <div key={s} style={{ display: 'flex', gap: 7, alignItems: 'center', marginTop: k ? 5 : 7 }}><i style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--jade)' }} /><span className="c" style={{ color: 'var(--fg2)', fontSize: 12 }}>{s}</span></div>)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 26 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingBottom: 10 }}>
          {ASK.map((a, k) => <button key={a.q} className={'pill' + (k === i ? ' on' : ' mute')} style={{ height: 34, fontSize: 12.5, padding: '0 12px' }} onClick={() => setI(k)}>{a.q}</button>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 54, background: 'var(--card)', borderRadius: 27, padding: '0 8px 0 18px', boxShadow: '0 0 0 1px var(--line)' }}>
          <span className="s" style={{ flex: 1, color: 'var(--fg4)' }}>나루에게 물어보기</span>
          <span style={{ width: 38, height: 38, borderRadius: 19, background: 'var(--act)', color: 'var(--on-act)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico name="mic" size={17} /></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
          <button onClick={() => go('kSOS')} className="c" style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--fg2)', fontWeight: 600 }}>119 전화</button>
          <button onClick={() => go('kFamily')} className="c" style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--fg2)', fontWeight: 600 }}>가족에게 알리기</button>
        </div>
      </div>
    </>
  );
}

// ── 차 안 크게 보기 — 나루 실내 CCTV + 좌석·주행 정보
function KInside({ go }) {
  return (
    <>
      <Top title="차 안" onBack={() => go('kCall')} right={<IconBtn icon="volume-2" label="소리" />} />
      <div className="in" style={{ position: 'absolute', top: 104, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ position: 'relative' }}>
          <img src="assets/scene/shuttle-cctv.png" alt="나루 실내" style={{ width: '100%', display: 'block', filter: 'saturate(.75) contrast(1.04)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px 3px)', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', left: 12, top: 12, display: 'flex', alignItems: 'center', gap: 5, height: 24, padding: '0 9px', borderRadius: 12, background: 'rgba(23,24,27,.6)', color: '#fff', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em' }}>
            <i className="breath" style={{ width: 6, height: 6, borderRadius: 3, background: '#ff5a4d' }} />실내 CAM 1
          </span>
          <span style={{ position: 'absolute', right: 12, top: 12, height: 24, padding: '0 9px', borderRadius: 12, background: 'rgba(23,24,27,.55)', color: '#fff', fontSize: 10.5, display: 'flex', alignItems: 'center', fontVariantNumeric: 'tabular-nums' }}>23:19:41</span>
        </div>
        <div style={{ padding: '16px 20px 34px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ico name="check" size={16} stroke={2.4} style={{ color: 'var(--jade)' }} />
            <span style={{ fontSize: 17, fontWeight: 650 }}>안전벨트 착용 확인</span>
          </div>
          <div className="s" style={{ marginTop: 4 }}>보조기 자리 2-B · 나루지기 김도현 동승</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {[['빠르기', '19', 'km/h'], ['남은 시간', '6', '분'], ['다음', '좌회전', '']].map(([l, v, u]) => (
              <div key={l} style={{ flex: 1, background: 'var(--card)', borderRadius: 20, padding: '13px 14px', boxShadow: '0 0 0 1px var(--line)' }}>
                <div className="c">{l}</div>
                <div style={{ marginTop: 4, fontSize: 21, fontWeight: 300, letterSpacing: '-.03em' }}>{v}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg3)', marginLeft: 2 }}>{u}</span></div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-line" style={{ flex: 1 }} onClick={() => go('kAi')}>AI 나루에게 묻기</button>
            <button className="btn btn-act" style={{ flex: 1 }} onClick={() => go('kSafe')}>안전 화면</button>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { KAi, KInside });
