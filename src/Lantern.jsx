// NARU · 함께 쓰는 작은 부품: 낮 · 밤의 시각, 작은 아이콘, 배경데이터 렌더 자리(useSlot)
// (11/21 '등불 이야기' 판의 무대 · 나루 차 · 이야기 카드는 화면에서 빠진 뒤 11/23에 이 파일에서도 뺐다.
//  그때의 파일은 src/archive/Lantern.pre-clean-1123.jsx 와 src/archive/*.lantern-1121.jsx 에 그대로 있다.)

// ── 시각: 낮과 밤 (라이트 모드 = 낮, 다크 모드 = 밤)
const ltTime = night => (night ? { calm: '21:00', alert: '22:40', day: '6월 20일 토요일' } : { calm: MARKET.water.calm, alert: MARKET.water.alert, day: '6월 20일 토요일' });
// 작은 아이콘 (선 굵기 하나)
const LIc = ({ k, size = 16, style }) => {
  const P = { stroke: 'currentColor', fill: 'none', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true" style={{ display: 'block', flex: 'none', ...style }}>
      {k === 'pin' && <><path d="M9 16.5s5.2-4.8 5.2-9a5.2 5.2 0 0 0-10.4 0c0 4.2 5.2 9 5.2 9z" {...P} /><circle cx="9" cy="7.4" r="1.9" fill="currentColor" /></>}
      {k === 'rain1' && <><path d="M5.4 10.4h8a3.3 3.3 0 0 0 .3-6.6A4.6 4.6 0 0 0 5 4.8a2.9 2.9 0 0 0 .4 5.6z" {...P} /><path d="M9.2 13l-.6 2.2" {...P} /></>}
      {k === 'rain3' && <><path d="M5.4 10.4h8a3.3 3.3 0 0 0 .3-6.6A4.6 4.6 0 0 0 5 4.8a2.9 2.9 0 0 0 .4 5.6z" {...P} /><path d="M5.8 13l-.8 2.6M9.6 13l-.8 2.6M13.4 13l-.8 2.6" {...P} /></>}
      {k === 'flow' && <><path d="M1.5 5h9M3.5 9h11M1.5 13h7" {...P} strokeWidth="2" /><path d="M13 2.6 17 9l-4 6.4" {...P} strokeWidth="2" /></>}
      {k === 'slow' && <path d="M1.5 9c2.4-3 4.8-3 7.2 0s4.8 3 7.2 0" {...P} strokeWidth="2" />}
      {k === 'stairs' && <path d="M2 15h4v-4h4V7h4V3" {...P} />}
      {k === 'speak' && <><path d="M2.5 7v4h3l4 3.4V3.6l-4 3.4z" fill="currentColor" /><path d="M12.4 6.2a4 4 0 0 1 0 5.6M14.6 4.2a7 7 0 0 1 0 9.6" {...P} strokeWidth="1.5" /></>}
      {k === 'up' && <path d="M9 16V3M3.6 8.2 9 2.6l5.4 5.6" {...P} strokeWidth="2.4" />}
    </svg>
  );
};

// ── 배경데이터 자리: 언리얼 렌더(원본 그대로, 덧그리지 않음)가 들어갈 곳.
//    렌더가 없으면 아무것도 그리지 않는다(화면에서는 빼 둠). 화면 목록의 '배경데이터 자리 보기'(?slots=1)를 켜면
//    점선 상자로 자리와 들어갈 장면(지점 · 눈높이 · 수위)을 보여 준다. 밤 모드는 밤 렌더(_night)가 있으면 그것, 없으면 낮 렌더.
const SlotCtx = React.createContext(false);
function useSlot(p, eye = 140, w = 0, night) {
  const ready = usePanoReady(), show = React.useContext(SlotCtx);
  let src = null, dayOnly = false;
  const k = ready ? PANO.pick(p, eye, w) : null;
  if (k) {
    const nn = k.src.replace('.jpg', '_night.jpg');
    if (night && PANO.have.has(nn.split('/').pop())) src = nn; else { src = k.src; dayOnly = !!night; }
  }
  return { p, eye: k ? k.eye : eye, w, src, show, on: !!src || show, dayOnly };
}
Object.assign(window, { ltTime, LIc, SlotCtx, useSlot });
