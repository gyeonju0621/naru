// NARU · 모식도 — 3D 배경데이터(1913 송정역시장 레벨)에서 뽑은 값으로 그리는 도식 지도와 대피 판단
// 데이터는 window.NARU_MARKET(레벨 추출 결과, assets/market/market.js)이 있으면 그것을 쓰고, 없으면 아래 값을 쓴다.
// 좌표: y = 입구 아치(P01)에서 골목 안쪽으로 잰 거리(m), x = 골목 가운데에서 좌(-)·우(+) (들어가는 방향 기준, m)
//
// 실측 (11/13 멘토링에서 레벨로 확인): 지점 P01 입구 → P02 27.8m → P03 34.6m (합 62.4m), 바닥 평탄(Z 2cm),
//   P02 바닥 맨홀, P03 가게 앞 나무 턱, 간판 '태현식품'(P01) · '송정생고기'(P02)
// 예시 (레벨 추출 전): 건물 칸의 크기와 개수, 층수, 계단 수, 걷는 속도, 물 시간표, 역까지 거리. example: true 로 표시한다.

const MARKET_EXAMPLE = {
  source: 'example',
  place: '1913 송정역시장',
  alley: { length: 66, width: 4 },
  points: [{ id: 'P01', label: '입구', y: 0 }, { id: 'P02', label: '골목', y: 27.8 }, { id: 'P03', label: '안쪽', y: 62.4 }],
  buildings: [
    { id: 'L1', side: 'L', y0: 1, y1: 8, floors: 1, name: '태현식품' },
    { id: 'L2', side: 'L', y0: 8, y1: 15, floors: 1 },
    { id: 'L3', side: 'L', y0: 15, y1: 24, floors: 1 },
    { id: 'L4', side: 'L', y0: 24, y1: 33, floors: 1 },
    { id: 'L5', side: 'L', y0: 33, y1: 41, floors: 1 },
    { id: 'L6', side: 'L', y0: 41, y1: 52, floors: 1 },
    { id: 'L7', side: 'L', y0: 52, y1: 60, floors: 1 },
    { id: 'L8', side: 'L', y0: 60, y1: 67, floors: 1 },
    { id: 'R1', side: 'R', y0: 1, y1: 9, floors: 1 },
    { id: 'R2', side: 'R', y0: 9, y1: 18, floors: 1 },
    { id: 'R3', side: 'R', y0: 18, y1: 24, floors: 1 },
    { id: 'R4', side: 'R', y0: 24, y1: 33, floors: 2, name: '송정생고기' },
    { id: 'R5', side: 'R', y0: 33, y1: 46, floors: 1 },
    { id: 'R6', side: 'R', y0: 46, y1: 55, floors: 1 },
    { id: 'R7', side: 'R', y0: 55, y1: 67, floors: 1 },
  ],
  // 갈 곳 = 안전한 곳 (11/23 그녀의 말: '나루 타는 곳'이라고 정하지 말고 안전한 곳으로 나오는 것이 목적, '가장 높은 곳이 어딘데?')
  //   밖으로: 입구를 지나 골목 밖 — 물이 들어오기 전에 닿을 때.  위로: 레벨에서 잰 2층 이상 건물의 문 — 물이 차도 가장 가까운 곳으로.
  //   높은 건물: 높이 · 문 자리 = 레벨 액터(C:\NARU\out\level_dump.json, 읽기만). 이름 = 렌더에 보이는 간판 · 생김새. 안의 계단 자리는 레벨에 없어 예시
  safe: [
    { id: 's0', name: '입구 밖 안전한 곳', short: '입구 밖', exit: true, door: 0, access: 'ramp' },
    { id: 's2', name: '회색 모퉁이 건물', short: '회색 모퉁이 건물', tall: true, floors: 2, h: 11.7, door: 49.5, doorX: -6.0, access: 'stairs', src: '05_Building_SM_05_Building(높이 11.7m) · SM_05_Door' },
    { id: 's4', name: '영명국밥 건물', short: '영명국밥 건물', tall: true, floors: 2, h: 7.8, door: 22.6, doorX: -5.8, access: 'stairs', src: 'SM_03_Building_SM_03_Building02(높이 7.8m) · SM_03_Door' },
    { id: 's5', name: '크림색 모퉁이 건물', short: '크림색 모퉁이 건물', tall: true, floors: 3, h: 11.5, door: 9.9, doorX: 3.4, access: 'stairs', src: 'SM_14_Hyeondae_Guk_SM_14_Wall(높이 11.5m) · SM_14_Door' },
    { id: 's3', name: '광주송정역 대합실', short: '광주송정역 대합실', outside: true, door: 0, extra: 258, height: 7, access: 'lift', example: true },
  ],
  home: { building: 'L8', y: 62.4, label: '가게' },
  // 가는 길에서 만나는 것. 자리는 실측, 좌우는 아직 확인 전이라 말하지 않는다
  hazards: [
    // 가게 턱: 레벨의 SM_06_Building_SM_06_Platform(가게 앞 나무 마루) 앞 끝. 마루 윗면이 골목 바닥보다 21cm 높다 (2026-11-23 추출)
    { id: 'h2', kind: 'sill', x: -4.7, y: 62.85, label: '가게 턱', why: '바퀴가 걸려요', act: '가게 턱을 천천히 내려와요.', gaits: ['aid', 'wheel'] },
    // P02 맨홀: 레벨의 데칼 MI_Round_Manhole_Cover(2) 자리 그대로 (2026-11-22 추출)
    { id: 'h1', kind: 'manhole', x: 1.5, y: 28.3, label: '맨홀', why: '물이 차면 안 보여요', act: '맨홀을 비켜 가요.', gaits: ['walk', 'aid', 'wheel'] },
  ],
  // 레벨에서 찾은 '조심할 곳' (2026-11-22, C:\NARU\out\level_dump.json — 액터 이름과 자리 그대로, 지어낸 것 없음)
  //   kind: manhole 맨홀 뚜껑 · power 전봇대/전기함 · float 물에 뜨는 물건 · oil 기름 얼룩 · road 찻길
  //   y = 입구에서 잰 거리(m) · x = 들어가는 방향의 오른쪽(+) m · z = 물건 높이(cm, 사진 각도) · src = 레벨 액터
  risks: [
    // 가게 문 앞 나무 마루의 턱 (높이 21cm): 가게에서 나오자마자 발밑. 3D 모양 = assets/market/risks3d.js 의 sill
    { id: 'r0', kind: 'sill', y: 62.85, x: -4.7, z: 21, label: '가게 턱', src: 'SM_06_Building_SM_06_Platform (앞 끝)' },
    { id: 'r1', kind: 'manhole', y: 54.5, x: -3.0, z: 0, src: 'MI_Round_Manhole_Cover 4' },
    { id: 'r2', kind: 'float', y: 44.6, x: 3.4, z: 120, label: '플라스틱 통 · 상자', src: 'SM_PlasticContainer ×20 · SM_CardboardBox ×9' },
    { id: 'r3', kind: 'power', y: 43.2, x: -4.3, z: 160, label: '전봇대 · 전기함', src: 'SM_12_ElecPole_SM_TelePole_5 · SM_PowerBox_6 · 7 · SM_Wires_3' },
    { id: 'r4', kind: 'manhole', y: 39.9, x: -3.8, z: 0, src: 'MI_Round_Manhole_Cover 3' },
    { id: 'r5', kind: 'oil', y: 40.4, x: -6.2, z: 0, src: 'MI_Oil_Stain · MI_Oily_Rag 2' },
    { id: 'r6', kind: 'power', y: 38.2, x: 4.2, z: 200, label: '전봇대', src: 'SM_12_ElecPole_SM_TelePole_4' },
    { id: 'r7', kind: 'oil', y: 31.3, x: 4.1, z: 0, src: 'MI_Oily_Rag' },
    { id: 'r8', kind: 'manhole', y: 28.3, x: 1.5, z: 0, src: 'MI_Round_Manhole_Cover 2' },
    { id: 'r9', kind: 'power', y: 20.8, x: 4.4, z: 181, label: '전기함', src: 'SM_PowerBox_3 · SM_Wires_1 · SM_PowerPipe ×3' },
    { id: 'r10', kind: 'power', y: 13.9, x: 5.6, z: 170, label: '전기함', src: 'SM_PowerBox_4 · 5 · SM_PowerPipe ×4' },
    { id: 'r11', kind: 'power', y: 7.8, x: -5.8, z: 140, label: '전봇대 · 전기함', src: 'SM_12_ElecPole_SM_TelePole_3 · SM_PowerBox_1' },
    { id: 'r12', kind: 'road', y: -4.8, x: 0, z: 0, src: 'MI_Painted_Pedestrian_Crossing_Lines ×2' },
    // 바닥에 선 전기 제품: 물이 30~50cm만 차도 닿는다 (자리 = 물건의 경계 상자 가운데)
    { id: 'r13', kind: 'power', y: 25.0, x: -5.2, z: 60, label: '가게 앞 냉동고', src: 'SM_03_Building_SM_03_Freezer · SM_Freezer02' },
    { id: 'r14', kind: 'power', y: 8.2, x: 3.6, z: 70, label: '가게 앞 냉동고', src: 'SM_14_Hyeondae_Guk_SM_14_Freezer' },
  ],
  // 렌더에 맞춘 시선 (2026-11-22, 실제 렌더를 앱의 카메라로 다시 비춰 잼). 문 앞 단계는 입구 쪽(yaw 180)이 아니라 문 쪽을 본다.
  //   path · pin · ring 은 그 시선의 [X(오른쪽 +, m), d(앞으로, m)]
  views: {},
  // 물 (예시 시나리오): 경보 뒤 몇 분에 몇 m. 물은 경보 8분 뒤부터 골목에 들어온다 — 경보 순간에 떠난 사람은 누구든 물이 들기 전에 닿는다
  //   (보행보조차로 입구까지 3.5분). 렌더가 낮 장면이라 시각도 낮이다.
  // rain = 그 시각의 강수량(mm/시간, 예시). 실제 서비스라면 실시간 강수량이 들어와 위험한지 아닌지를 먼저 가른다
  water: { calm: '14:00', alert: '15:40', steps: [[0, 0], [8, 0], [12, .3], [25, .5], [50, 1]], flow: 'fast', rain: { calm: 2, alert: 60 } },
  naru: { eta: 6, gate: 2 },
};
// 레벨에 없는 값(물 시나리오 · 나루)은 예시가 받친다. buildings · safe · home · hazards · points · alley 는 반드시 한 세트로 넣는다
const MARKET = { ...MARKET_EXAMPLE, ...(window.NARU_MARKET || {}) };

// 걸음: 빠르기(m/s, 예시) · 눈높이(cm, 파노라마 렌더와 같은 값) · 못 가게 되는 물 높이(m, 예시) · 계단
const GAITS = {
  walk: { name: '걸어서', by: '걸어서', v: 1.1, eye: 160, stop: .5, stairs: true },
  aid: { name: '보행보조차', by: '보행보조차로', v: .3, eye: 140, stop: .3, stairs: false },
  wheel: { name: '휠체어', by: '휠체어로', v: .5, eye: 120, stop: .3, stairs: false },
};
// 물 높이의 뜻. 언리얼에서 실제로 렌더한 수위 0 · 30 · 50 · 100cm와 같은 네 단계
const WATER_BANDS = [
  { m: 0, body: '물 없음', mean: '지금 움직이면 가장 안전해요' },
  { m: .3, body: '종아리', mean: '흙탕물에 바닥이 안 보여요' },
  { m: .5, body: '무릎', mean: '문이 안 열려요' },
  { m: 1, body: '허리', mean: '서 있기 어려워요' },
];
const bandOf = m => WATER_BANDS.reduce((a, b) => (m + 1e-6 >= b.m ? b : a), WATER_BANDS[0]);
// 몸에 닿는 높이의 말: 앉아서 가는 휠체어는 100cm가 가슴 높이다(서 있는 사람은 허리). 렌더의 물 높이는 같다
const bodyFor = (b, gait) => (gait === 'wheel' && b.m >= 1 ? '가슴' : b.body);
// 물살이 빠르면 한 단계 깊게 읽는다
const deeper = (m, fast) => (m > 0 && fast ? (WATER_BANDS.find(b => b.m > m + 1e-6) || WATER_BANDS[WATER_BANDS.length - 1]).m : m);
// '송정생고기 2층' + 으로 / '입구' + 로
const ro = s => { const c = s.charCodeAt(s.length - 1) - 0xAC00, j = c >= 0 && c < 11172 ? c % 28 : 0; return s + (j === 0 || j === 8 ? '로' : '으로'); };
// 경보 뒤 t분의 물 높이, 그리고 물이 h(m)에 닿기까지 남은 분
function waterAt(t, W = MARKET.water) {
  const s = W.steps; if (t <= s[0][0]) return s[0][1];
  for (let i = 1; i < s.length; i++) if (t <= s[i][0]) return s[i - 1][1] + (s[i][1] - s[i - 1][1]) * (t - s[i - 1][0]) / (s[i][0] - s[i - 1][0]);
  return s[s.length - 1][1];
}
function minutesUntil(h, t = 0, W = MARKET.water) {
  const s = W.steps;
  for (let i = 1; i < s.length; i++) if (s[i][1] >= h) { const a = s[i - 1], b = s[i]; const at = a[0] + (b[0] - a[0]) * (h - a[1]) / Math.max(1e-6, b[1] - a[1]); return Math.max(0, at - t); }
  return Infinity;
}
const buildingOf = id => MARKET.buildings.find(b => b.id === id);
// 내 자리(y)에서 갈 곳까지 골목을 따라 걷는 거리(m). 골목 안은 지점 좌표로 잰 값이다
// 내 가게(문 앞 나무 마루)에서 나설 때는 걷는 길(1m마다 렌더한 자리)을 따라 잰 거리 — 길 안내 화면의 'N m 남음'과 같은 값
function distTo(safe, fromY = MARKET.home.y) {
  const w = fromY >= MARKET.home.y - .1 && window.walkDist ? window.walkDist(safe) : null;
  return (w != null ? w : Math.abs(fromY - safe.door)) + (safe.extra || 0);
}
// 갈 곳 부르는 말
const placeName = s => (s.exit ? '입구 밖 안전한 곳' : s.tall ? `${s.short} ${s.floors}층` : s.name);
const placeShort = s => (s.exit ? '입구 밖' : s.tall ? s.short : s.outside ? '역 대합실' : s.short);
// 나루의 눈: 걸음 · 지금 자리 · 물 시간표 · 물살로 '어디로' 하나를 고른다. '나가지 않아요'는 없다 — 늘 갈 곳이 있다 (11/23)
//   go = 물이 들어오기 전에 내 걸음으로 입구 밖까지 닿는다 → 입구 밖 안전한 곳으로
//   up = 늦었거나 물이 이미 찼다 → 가장 가까운 높은 건물(레벨에서 잰 2층 이상)의 문으로, 가는 길의 위험을 미리 알려 주며
//   길이 막혔거나 힘들면 길 안내의 '다른 곳으로' — 지금 선 자리에서 가까운 다른 안전한 곳 · 그래도 어려우면 119
function decide(gait = 'aid', t = 0, flow = MARKET.water.flow, fromY = MARKET.home.y) {
  const g = GAITS[gait], fast = flow === 'fast', now = Math.round(waterAt(t) * 1000) / 1000, eff = deeper(now, fast), left = minutesUntil(g.stop, t);
  // 밖으로 가는 마감 = 골목에 물이 들어오는 때(예시 시나리오 8분). 역처럼 입구 밖으로 더 가는 곳도 골목을 빠져나오는 시간으로 본다
  const wet = minutesUntil(1e-3, t);
  const list = MARKET.safe.map(s => {
    const d = distTo(s, fromY), min = d / g.v / 60 + (s.tall ? 1 : 0), out = !!(s.exit || s.outside);
    const alley = out ? (d - (s.extra || 0)) / g.v / 60 : min;                // 골목 안을 걷는 시간
    const intime = out ? now <= 0 && alley + 2 <= wet : true;                 // 높은 건물은 물이 차도 간다
    const help = !!s.tall && !g.stairs;                                        // 계단은 도움을 받아
    return { ...s, dist: Math.round(d), raw: min, min: Math.max(1, Math.ceil(min)), ok: true, intime, help, why: !intime ? '물이 먼저 와요' : '' };
  });
  const exit = list.filter(s => s.exit && s.intime).sort((a, b) => a.dist - b.dist)[0];
  const tall = list.filter(s => s.tall).sort((a, b) => a.dist - b.dist)[0];
  const best = exit || tall || list[0];
  const order = [best].concat(list.filter(s => s !== best).sort((a, b) => b.intime - a.intime || a.dist - b.dist)).filter(Boolean);
  // 물이 내 걸음의 '못 가는 높이'(예시)에 닿았으면(물살이 빠르면 한 단계 깊게): 갈 곳은 그대로 말하고, 혼자 걷지 말고 도움을 받아 간다
  const lim = now > 0 && eff + 1e-6 >= g.stop;
  return { gait, fast, now, eff, lim, left: Math.round(left), wet: Math.max(0, Math.round(wet)), list: order, best, act: exit ? 'go' : lim ? 'help' : 'up', naru: MARKET.naru.eta };
}
// 입구 밖에 닿은 뒤 물이 들면: 그 자리(입구)에서 가장 가까운 높은 건물. 거리는 다른 화면과 같게 걷는 길로 잰다(걸음 자리가 없으면 곧은 거리)
function upNear(y = 0, x = 0) {
  const far = s => { const pl = window.walkPlan && WALK.pts.length && WALK.at('P01') >= 0 ? walkPlan(s, 'P01') : null; return pl ? routeLen(walkRoute(pl)) : Math.hypot((s.doorX || 0) - x, s.door - y); };
  return MARKET.safe.filter(s => s.tall).map(s => ({ ...s, dist: Math.round(far(s)) })).sort((a, b) => a.dist - b.dist)[0] || null;
}
// ── 조심할 곳 (레벨에서 찾은 것, MARKET.risks). 말: 실제 경보 act[0] '…세요' · 평소 · 연습 act[1] '…요'
const RISK_KIND = {
  sill: { label: '가게 턱', icon: 'arrow-down-to-line', why: '바퀴가 걸려요', act: ['가게 턱을 천천히 내려오세요', '가게 턱을 천천히 내려와요'] },
  manhole: { label: '맨홀', icon: 'circle-dot', why: '물에 잠기면 안 보이고, 뚜껑이 들릴 수 있어요', act: ['맨홀은 비켜 가세요', '맨홀은 비켜 가요'] },
  power: { label: '전봇대 · 전기함 · 냉동고', icon: 'zap', why: '물에 닿으면 감전될 수 있어요', act: ['멀리 떨어져 가세요', '멀리 떨어져 가요'] },
  float: { label: '떠내려올 물건', icon: 'package', why: '물이 차면 떠서 부딪혀요', act: ['천천히, 앞을 보며 가세요', '천천히, 앞을 보며 가요'] },
  oil: { label: '기름 얼룩', icon: 'droplets', why: '젖으면 미끄러워요', act: ['밟지 말고 비켜 가세요', '밟지 말고 비켜 가요'] },
  road: { label: '입구 밖 찻길', icon: 'car', why: '물이 차도 차가 다녀요', act: ['찻길 앞에서 멈추세요', '찻길 앞에서 멈춰요'] },
};
const RISK_ORDER = ['sill', 'manhole', 'power', 'float', 'oil', 'road'];
// 걸어 나갈 때(입구를 볼 때)의 왼쪽 · 오른쪽. x 는 들어가는 방향 기준이라 반대가 된다
const riskSide = x => (x > 1 ? '왼쪽' : x < -1 ? '오른쪽' : '가운데');
// 갈 곳까지 가는 길에서 만나는 조심할 곳 (만나는 순서). 입구 밖으로 갈 때는 아치 밖 찻길까지, 높은 건물이면 그 문 바로 옆(냉동고 등)까지
function risksOn(safe, fromY = MARKET.home.y) {
  const to = safe ? safe.door : 0, gate = !safe || !!safe.exit || !!safe.outside;
  // 가게 턱은 가게에서 나올 때(내 자리 = 가게)만, 늘 맨 처음 · 발밑
  const home = fromY >= MARKET.home.y - .1;
  const atDoor = r => !!(safe && safe.tall) && Math.hypot(r.x - (safe.doorX || 0), r.y - safe.door) < 2.5;
  const back = !gate && to > fromY;                       // 가게 쪽으로 되돌아가는 길(다른 곳으로 바꿨을 때)
  return (MARKET.risks || []).filter(r => (r.kind === 'sill' ? home : back ? (r.y > fromY + .3 && r.y < to + .6) || atDoor(r) : r.y < fromY - .3 && (r.y > to - .6 || (gate && r.kind === 'road') || atDoor(r))))
    .map(r => { const K = RISK_KIND[r.kind]; const cross = r.kind === 'road' && safe && safe.outside;   // 역으로 갈 때는 찻길을 건넌다
      return { ...K, ...r, label: r.label || K.label, act: cross ? ['찻길은 건널목으로 건너세요', '찻길은 건널목으로 건너요'] : K.act, d: r.kind === 'sill' ? 1 : Math.max(1, Math.round(Math.abs(fromY - r.y))), side: r.kind === 'sill' ? '발밑' : riskSide(back ? -r.x : r.x) }; })
    .sort((a, b) => (back ? a.y - b.y : b.y - a.y));
}
// 같은 종류끼리 한 줄로 (가장 먼저 만나는 것이 대표): [{ kind, items, first }]
function riskGroups(list) {
  const g = {}; list.forEach(r => { (g[r.kind] = g[r.kind] || []).push(r); });
  return Object.keys(g).map(k => ({ kind: k, items: g[k], first: g[k][0] })).sort((a, b) => a.first.d - b.first.d);
}
// 조심할 곳을 렌더로 보는 시선: 그곳보다 안쪽(같거나 뒤)의 가장 가까운 지점에서 그쪽을 본다. yaw 180 = 입구 쪽
function riskView(r, eye = 140) {
  const P = MARKET.points.filter(p => p.y >= r.y - .6).sort((a, b) => a.y - b.y)[0] || MARKET.points[0];
  const dy = P.y - r.y, dx = r.x, dist = Math.max(.8, Math.hypot(dx, dy));
  const yaw = ((180 - Math.atan2(dx, dy) * 180 / Math.PI) + 360) % 360;
  const pitch = -Math.atan2(eye / 100 - (r.z || 0) / 100, dist) * 180 / Math.PI;
  return { p: P.id, dist, yaw, pitch, vfov: Math.max(22, Math.min(64, 2 * Math.atan(1.8 / dist) * 180 / Math.PI)) };
}
// 내 대피 카드의 한 문장: 언제 · 어떻게 · 어디로. id = 연습에서 실제로 걸어 본 곳(갈 수 있는 곳일 때만), 없으면 가장 가까운 갈 수 있는 곳
function cardLine(gait, id) {   // 11/23: 어디로만 (입구 밖 · 높은 건물 층). 높은 건물을 걸어 봤으면 그건 '물이 차면' 갈 곳
  const D = decide(gait, 0), b = D.list.find(s => s.id === id && s.intime) || D.best;
  if (!b) return '경보가 오면 바로 안전한 곳으로 가요';
  return b.exit ? '경보가 오면 바로 입구 밖으로 나가요' : b.tall ? `물이 들면 ${b.short} ${b.floors || 2}층으로 올라가요` : `경보가 오면 ${ro(placeShort(b))} 가요`;
}
// 내 대피 카드의 둘째 줄: 물이 차면 갈 곳 = 가장 가까운 높은 건물 (거리는 가게 문에서 걷는 길)
function upLine(gait) {
  const t = decide(gait, minutesUntil(.3)).best;
  return t && t.tall ? `물이 들면 ${t.short} ${t.floors || 2}층 · ${t.dist}m` : null;
}

Object.assign(window, { MARKET, GAITS, WATER_BANDS, bandOf, deeper, ro, waterAt, minutesUntil, distTo, placeName, placeShort, decide, cardLine, upLine, upNear, buildingOf, RISK_KIND, RISK_ORDER, riskSide, risksOn, riskGroups, riskView });
