// NARU · 아래에서 올라오는 판들 (2026-11-23) — 누르면 무슨 일이 일어나는지 먼저 보여 주고, 한 번 더 확인받는다
//   call  = 119 · 112에 전화 (지금 있는 곳을 글로 보여 준다 — 전화에서 그대로 읽으면 된다). 시제품: 실제로 걸지 않는다
//   sms   = 문자로 119 신고 (말하기 어려울 때) — 보낼 글을 미리 보여 준다. 시제품: 보내지 않는다
//   terms = 약관 보기 (하나 또는 전부)      about = 나루 소개      reset = 처음 설정 다시 하기
// 지금 있는 곳은 한 줄에 한 가지씩(시장 · 자리 · 걸음): 읽다가 줄이 엉뚱한 데서 끊기지 않게.
//   안전한 곳에 닿은 뒤에는 가게가 아니라 그 닿은 곳을 말한다.
// 연습에서 연 판은 제목에 '(연습)'을 달고 빨간 단추를 쓰지 않는다(단추 글은 한 줄에 들게 그대로). 빨간 '걸기 · 보내기'는 실제 경보에서만.
function Overlay({ ov, close, toast, st, reset }) {
  if (!ov) return null;
  const g = eGait(st), drill = eDrill(st), real = !!st.alert && !drill, P = drill ? ' (연습)' : '';
  const place = MARKET.place.replace(/ /g, ' ');
  const at = real && st.arrived ? MARKET.safe.find(s => s.id === st.arrived) : null;
  const lines = at ? (at.outside ? at.name.split(' ') : [place, at.exit ? '입구 밖 · 간판 아치 앞' : placeName(at)])   // 역은 '광주송정역' / '대합실'
    : hereY(st) < 1 ? [place, '입구 밖 · 간판 아치 앞'] : [`${place} 골목 안`, `입구에서 ${hereY(st)}m 안쪽`];
  const aid = g === 'aid' ? '보행보조차를 써서 혼자 움직이기 어려워요' : g === 'wheel' ? '휠체어를 써서 혼자 움직이기 어려워요' : '';
  if (ov.k === 'call') {
    const n = ov.n || '119';
    return (
      <Sheet title={`${n}에 전화할까요?${P}`} onClose={close}
        foot={<><button className="ar-btn sec" onClick={close}>취소</button><button className={'ar-btn' + (real && n === '119' ? ' call' : '')} onClick={() => { close(); toast('시연 화면이라 실제로 전화를 걸지 않아요'); }}><Ico name="phone" size={20} stroke={2.2} />전화 걸기</button></>}>
        <p>{n === '119' ? '구조 · 구급 · 화재 신고예요.' : '경찰 신고예요.'}<br />{real ? '연결되면 지금 있는 곳을 이렇게 말하세요.' : '연결되면 지금 있는 곳을 이렇게 말해요.'}</p>
        <div className="where" style={{ marginTop: 12 }}><Ico name="map-pin" size={20} stroke={2.2} /><span>{lines.map(l => <b key={l}>{l}</b>)}{aid ? <span className="ln">{aid}</span> : null}</span></div>
      </Sheet>
    );
  }
  if (ov.k === 'sms') {
    return (
      <Sheet title={`문자로 119에 신고할까요?${P}`} onClose={close}
        foot={<><button className="ar-btn sec" onClick={close}>취소</button><button className={'ar-btn' + (real ? ' call' : '')} onClick={() => { close(); toast('시연 화면이라 실제로 문자를 보내지 않아요'); }}><Ico name="send" size={20} stroke={2.2} />문자 보내기</button></>}>
        <p>{real ? '말하기 어려울 때 쓰세요.' : '말하기 어려울 때 써요.'} 아래 글이 119로 가요.</p>
        <div className="where" style={{ marginTop: 12 }}><Ico name="message-square" size={20} stroke={2.2} /><span><b>도움이 필요해요</b><span className="ln">위치: 광주 {LOCAL.dong}</span>{lines.map(l => <span key={l} className="ln">{l}</span>)}{aid ? <span className="ln">{aid}.</span> : null}</span></div>
      </Sheet>
    );
  }
  if (ov.k === 'terms') {
    const list = ov.all ? TERMS : TERMS.filter(t => t.k === ov.id);
    return (
      <Sheet title={ov.all ? '약관 · 개인정보' : (list[0] || {}).t} onClose={close} foot={<button className="ar-btn" onClick={close}>확인</button>}>
        {list.map(t => <React.Fragment key={t.k}>
          {ov.all && <h3 style={{ color: 'var(--brand-ink)' }}>{t.need ? '필수' : '선택'} · {t.t}</h3>}
          {t.body.map(([h, p]) => <React.Fragment key={h}><h3>{h}</h3><p>{p}</p></React.Fragment>)}
        </React.Fragment>)}
        <p className="au-demo"><Ico name="info" size={15} stroke={2} /><span>요약이에요. 실제 약관 전문이 아니에요.</span></p>
      </Sheet>
    );
  }
  if (ov.k === 'about') {
    return (
      <Sheet title="나루 소개" onClose={close} foot={<button className="ar-btn" onClick={close}>확인</button>}>
        <h3>무엇인가요</h3>
        <p>1913 송정역시장 골목의 호우 · 홍수 대피를 돕는 앱이에요.</p>
        <h3>골목 장면</h3>
        <p>공모전에서 받은 <span className="nw">시장 3D 자료(배경데이터)를</span> 고치지 않고 그대로 찍은 그림이에요. <span className="nw">길 · 조심할 곳 · 거리는</span> 그 자료에서 잰 자리에 그렸어요.</p>
        <h3>화면과 자료</h3>
        <p>화면은 정부 누리집의 디자인 기준(KRDS)을 따랐어요. 정부의 공식 서비스는 아니에요. 기준과 기록은 영산강홍수통제소, 기상청, 광산구, 행정안전부 국민행동요령에서 가져왔어요.</p>
        <h3>버전</h3>
        <p>버전 0.9 · 언리얼 엔진 5.2.1로 찍었어요.</p>
      </Sheet>
    );
  }
  if (ov.k === 'reset') {
    return (
      <Sheet title="처음 설정을 다시 할까요?" onClose={close}
        foot={<><button className="ar-btn sec" onClick={close}>취소</button><button className="ar-btn" onClick={reset}>다시 하기</button></>}>
        <p>이 휴대폰에 저장한 걸음, 글자 크기, <span className="nw">내 대피 카드</span>가 지워져요. 처음 화면부터 다시 시작해요.</p>
      </Sheet>
    );
  }
  return null;
}
// 짧은 알림: 자리를 늘 두고 글만 바꾼다(화면 읽기 프로그램이 새 글을 읽게)
const Toast = ({ text }) => <div className="ov-toast" role="status" hidden={!text}><Ico name="info" size={20} stroke={2.2} /><span>{text}</span></div>;

Object.assign(window, { Overlay, Toast });
