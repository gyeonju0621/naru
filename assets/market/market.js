// NARU · 모식도 데이터 (레벨에서 뽑은 값이 들어갈 자리)
//
// 지금은 비어 있습니다. 비어 있으면 앱은 src/Market.jsx 의 예시 값(MARKET_EXAMPLE)으로 그립니다.
// 언리얼에서 naru-pipeline/ue/naru_dump_level.py 로 뽑은 level_dump.json 을 정리해 아래 형식으로 채우면
// 앱이 예시 대신 이 값을 씁니다. 원본 레벨 파일은 읽기만 하고 고치지 않습니다.
//
// buildings · safe · home · hazards · points · alley 는 서로 맞물리므로 반드시 한 세트로 넣습니다.
// 물 시간표(water)와 나루(naru)는 레벨에 없는 값이라, 넣지 않으면 예시가 그대로 쓰입니다.
//
// window.NARU_MARKET = {
//   source: 'level',                                   // 'level' = 레벨에서 뽑은 값
//   place: '1913 송정역시장',
//   alley: { length: 66, width: 4 },                   // m
//   points: [{ id: 'P01', label: '입구', y: 0 }, { id: 'P02', label: '골목', y: 27.8 }, { id: 'P03', label: '안쪽', y: 62.4 }],
//   buildings: [{ id: 'L1', side: 'L', y0: 1, y1: 8, floors: 1, name: '태현식품' }],   // side = 들어가는 방향 기준 좌(L) · 우(R)
//   safe: [{ id: 's0', name: '입구 밖 안전한 곳', short: '입구 밖', exit: true, door: 0, access: 'ramp' },
//          // 높은 건물: 레벨 액터에서 잰 높이(h) · 문 자리(door = 입구에서 m, doorX = 골목 가운데에서 m). 층수는 겉모습으로 정한 값
//          { id: 's2', name: '회색 모퉁이 건물', short: '회색 모퉁이 건물', tall: true, floors: 2, h: 11.7, door: 49.5, doorX: -6.0, access: 'stairs' }],
//   home: { building: 'L8', y: 62.4, label: '가게' },
//   hazards: [{ id: 'h1', kind: 'manhole', x: .5, y: 27.8, label: '맨홀', why: '물이 차면 안 보여요', act: '맨홀을 비켜 가요.', gaits: ['walk', 'aid', 'wheel'] }],
// };
