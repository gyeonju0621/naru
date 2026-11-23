// NARU v9.2 · '나루와 할 수 있는 것' 나머지 화면 — 대피 연습 · 장소 · 도움 요청 · 설정 · 마스코트

const Page = ({ children, top = 102 }) => <div className="in" style={{ position: 'absolute', top, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden', padding: '0 20px 34px' }}>{children}</div>;
const Say = ({ text, sub, mood, size = 52 }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <Mascot size={size} mood={mood} />
    <div><div className="h2" style={{ textWrap: 'pretty' }}>{text}</div>{sub && <div className="s">{sub}</div>}</div>
  </div>
);

// 대피 연습 — 실제 경보와 같은 흐름을 '연습' 띠를 달고
function KDrill({ go, st, set }) {
  const done = st.drill || 0;
  const steps = [['bell-ring', '경보를 받아요', 'HAND가 세 번 진동해요'], ['route', '계획 A 길을 따라가요', '승강장 A까지 7분'], ['bus', '나루를 불러요', '길게 눌러 부르기'], ['ticket', 'PASS를 대요', '문 옆 링']];
  return (
    <>
      <Top title="대피 연습" onBack={() => go('kHome')} />
      <Page>
        <Say text="한 달에 한 번, 같이 연습해요." sub="실제 나루는 오지 않아요" />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '22px 2px 14px' }}>
          <Big v={done} u="/ 4" delta="이번 달 연습" />
          <Side v="7" u="분" label="지난 기록" tone="var(--fg1)" />
        </div>
        <Card pad="0 16px">
          {steps.map(([ic, t, s], i) => (
            <Row key={t} icon={i < done ? 'check' : ic} title={t} sub={s} last={i === steps.length - 1}
              right={i < done ? <span className="c" style={{ color: 'var(--jade)', fontWeight: 600 }}>완료</span> : i === done ? <span className="pill" style={{ height: 24 }}>지금</span> : null} />
          ))}
        </Card>
        <button className="btn btn-act" style={{ width: '100%', marginTop: 16 }} onClick={() => set({ drill: done < 4 ? done + 1 : 0 })}>{done === 0 ? '연습 시작' : done < 4 ? '다음 단계' : '다시 하기'}</button>
      </Page>
    </>
  );
}

// 장소 — 3D 데이터가 있는 곳이 곧 장소 목록
function KPlaces({ go }) {
  // 제공 배경데이터 목록(15곳)에 실제로 있는 이름만 쓴다. 광주송정역·양동시장은 목록에 없다
  const P = [['1913 송정역시장', '광주 1차 · 3D 레벨', '내 장소', true], ['광주 1호선 지하철 내부', '광주 2차 · ICVFX', '준비 중'], ['호랑가시나무길', '광주 2차 · ICVFX', '준비 중']];
  return (
    <>
      <Top title="장소" onBack={() => go('kHome')} right={<IconBtn icon="search" label="찾기" />} />
      <Page>
        <Say text="3D 데이터가 있는 곳이면 어디서든 같아요." sub="미리 받아 두면 인터넷 없이도 길을 보여 줘요" />
        <div className="lb" style={{ margin: '22px 4px 8px' }}>쓸 수 있는 장소</div>
        <Card pad="0 16px">
          {P.map(([n, s, r, on], i) => (
            <Row key={n} icon={on ? 'map-pin-check' : 'map-pin'} title={n} sub={s} last={i === P.length - 1}
              right={<span className="c nw" style={{ color: on ? 'var(--jade)' : 'var(--fg2)', fontWeight: 600 }}>{r}</span>} onClick={on ? () => go('kSim') : undefined} />
          ))}
        </Card>
        <div className="s" style={{ marginTop: 12, padding: '0 4px' }}>장소 목록은 제공되는 배경데이터 목록을 따라요.</div>
      </Page>
    </>
  );
}

// 도움 요청 — 마스코트 대신 바로 쓸 수 있는 세 갈래
function KSOS({ go }) {
  return (
    <>
      <Top title="도움 요청" onBack={() => go('kHome')} />
      <div className="in" style={{ position: 'absolute', top: 104, left: 20, right: 20, bottom: 30, overflowY: 'auto', overflowX: 'hidden' }}>
        <div className="h1" style={{ fontSize: 23 }}>지금 바로 도와드릴게요.</div>
        <div className="s" style={{ marginTop: 6 }}>인터넷이 끊겨도 문자로 위치를 보내요.</div>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '26px 0 22px' }}>
          <button onClick={() => go('kSafe')} aria-label="길게 눌러 도움 요청" style={{ width: 148, height: 148, borderRadius: 74, border: 0, cursor: 'pointer', background: 'var(--act)', color: 'var(--on-act)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 0 0 10px var(--tray), 0 0 0 11px var(--line)' }}>
            <Ico name="life-buoy" size={34} stroke={1.6} />
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.02em' }}>도움 요청</span>
          </button>
        </div>
        <div className="c" style={{ textAlign: 'center', marginBottom: 18 }}>누르면 가족과 운행 센터에 동시에 알려요</div>
        <Card pad="0 16px">
          <Row icon="phone" title="119" sub="바로 전화" right={<Ico name="chevron-right" size={16} />} />
          <Row icon="user" title="지우 · 손녀" sub="위치와 함께 문자 보내기" right={<Ico name="chevron-right" size={16} />} />
          <Row icon="headset" title="나루 운행 센터" sub="24시간 · 지금 대기 1명" last right={<Ico name="chevron-right" size={16} />} />
        </Card>
        <div className="lb" style={{ margin: '20px 4px 8px' }}>지금 상태</div>
        <Card pad="0 16px">
          <Row icon="battery-low" title="휴대폰 배터리" sub="23%" right={<Toggle on />} />
          <Row icon="signal" title="연결" sub="문자만 돼요 (LTE 끊김)" last right={<span className="c" style={{ color: 'var(--amber)', fontWeight: 700 }}>문자 모드</span>} />
        </Card>
      </div>
    </>
  );
}

// 설정
function KSettings({ go, st, set }) {
  const pose = st.pose || 'm-wave';
  return (
    <>
      <Top title="설정" onBack={() => go('kFamily')} />
      <Page>
        <div className="lb" style={{ margin: '4px 4px 8px' }}>나루의 표정</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['m-wave', '평소'], ['m-guide', '안내'], ['m-alert', '경보'], ['m-happy', '안심']].map(([k, l]) => (
            <button key={k} onClick={() => set({ pose: k })} style={{ flex: 1, border: 0, cursor: 'pointer', borderRadius: 20, padding: '10px 6px 8px', background: 'var(--card)', boxShadow: pose === k ? 'inset 0 0 0 1.5px var(--fg1)' : '0 0 0 1px var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <img src={'assets/mascot/' + k + '.png'} alt="" style={{ height: 62, objectFit: 'contain' }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg2)' }}>{l}</span>
            </button>
          ))}
        </div>
        <div className="lb" style={{ margin: '20px 4px 8px' }}>보기</div>
        <Card pad="0 16px">
          <Row icon="type" title="글자 크기" sub="기기 설정을 따라요" right={<Ico name="chevron-right" size={16} />} />
          <Row icon="contrast" title="진하게 보기" right={<Toggle />} />
          <Row icon="move-3d" title="3D 움직임 줄이기" sub="큐브맵을 멈춰 둬요" right={<Toggle />} last />
        </Card>
        <div className="lb" style={{ margin: '20px 4px 8px' }}>알림 · 정보</div>
        <Card pad="0 16px">
          <Row icon="bell" title="재난문자 연동" right={<Toggle on />} />
          <Row icon="map-pinned" title="위치 사용" sub="경보 중에만" right={<Toggle on />} />
          <Row icon="shield" title="개인정보" sub="걸음 정보는 이 휴대폰에만" last right={<Ico name="chevron-right" size={16} />} />
        </Card>
      </Page>
    </>
  );
}

Object.assign(window, { KDrill, KPlaces, KSOS, KSettings, Say, Page });
