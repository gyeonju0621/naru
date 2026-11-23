// NARU · 직접 걸어 보는 골목 (2026-11-23)
// 언리얼 원본 렌더(1m마다 뽑은 360° 장면) 위에서 고개를 돌리고(끌기 · 화살표 키 · 폰 돌리기) 길을 따라 걸어 본다.
// 걸음 사이: 바닥과 양쪽 가게 벽을 판으로 두고, 앞뒤 두 장면을 지금 선 자리에서 다시 비춰 섞는다(시차가 맞게).
// 길(민트 빛줄)과 위험(빨강 = 빠짐 · 감전 · 찻길, 주황 = 턱 · 미끄럼 · 떠내려옴)은 레벨에서 잰 세계 좌표에 붙어 있어
// 어디를 보든 · 어디로 걷든 제자리에 있다. 렌더 파일은 손대지 않는다(겹친 것은 화면의 층).
//
// 좌표(앱): x = 들어가는 방향 오른쪽 + (m) · y = 입구(P01)에서 골목 안쪽으로 (m) · z = 골목 바닥에서 위로 (m)
// 장면의 yaw 0 = 골목 안쪽(+y)에서 0.2° 오른쪽(렌더 카메라 base_yaw −89.8°), yaw 180 = 입구 쪽

const W_OFF = 0.2 * Math.PI / 180;                        // 렌더 앞면과 세계 +y 사이 (base_yaw −89.8°)
const W_WALLS = { xL: -6.0, xR: 4.3, top: 7.5 };          // 골목 판: 타일 바닥(−5.85 ~ 4.15m)의 양쪽 가게 앞, 처마 높이
const W_COL = {                                           // 위험 표시 색 (가장 위험한 것 = 빨강, 조심 = 주황), 길 = 민트 빛줄
  red: [0.91, 0.24, 0.12], amber: [1.0, 0.70, 0.10], route: [0.20, 0.80, 0.47],
};
const WALK = (() => {
  const src = (window.NARU_WALK && window.NARU_WALK.points) || [];
  const pts = src.map(p => ({ ...p })); let c = 0;
  pts.forEach((p, i) => { if (i) c += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y); p.s = c; });
  return { pts, len: c, at: id => pts.findIndex(p => p.id === id) };
})();
// 세계의 한 점(앞 · 오른쪽 · 위)을 카메라(c) 기준 장면 좌표로: [오른쪽, 위, 앞]
const wLocal = (c, x, y, z) => { const dx = x - c.x, dy = y - c.y; return [dx * Math.cos(W_OFF) - dy * Math.sin(W_OFF), z - c.z, dx * Math.sin(W_OFF) + dy * Math.cos(W_OFF)]; };
// 세계 방위(+y에서 +x 쪽으로, 도) → 장면 yaw
const wYaw = bearingDeg => bearingDeg - 0.2;
const wBearing = (dx, dy) => Math.atan2(dx, dy) * 180 / Math.PI;
// 장면 좌표 → 화면 (PanoView와 같은 카메라)
function wProject(l, yaw, pitch, vfov, W, H) {
  const yw = yaw * Math.PI / 180, pt = pitch * Math.PI / 180, tan = Math.tan(vfov * Math.PI / 360);
  const x1 = l[0] * Math.cos(yw) - l[2] * Math.sin(yw), z1 = l[0] * Math.sin(yw) + l[2] * Math.cos(yw);
  const y2 = l[1] * Math.cos(pt) - z1 * Math.sin(pt), z2 = l[1] * Math.sin(pt) + z1 * Math.cos(pt);
  if (z2 < 0.05) return null;
  return [(x1 / z2 / (tan * W / H) * 0.5 + 0.5) * W, (0.5 - y2 / z2 / tan * 0.5) * H, z2];
}
const wNorm = a => ((a % 360) + 540) % 360 - 180;
function wCam(l, yaw, pitch) {
  const yw = yaw * Math.PI / 180, pt = pitch * Math.PI / 180;
  const x1 = l[0] * Math.cos(yw) - l[2] * Math.sin(yw), z1 = l[0] * Math.sin(yw) + l[2] * Math.cos(yw);
  return [x1, l[1] * Math.cos(pt) - z1 * Math.sin(pt), l[1] * Math.sin(pt) + z1 * Math.cos(pt)];
}
const wScr = (c, vfov, W, H) => { const tan = Math.tan(vfov * Math.PI / 360); return [(c[0] / c[2] / (tan * W / H) * 0.5 + 0.5) * W, (0.5 - c[1] / c[2] / tan * 0.5) * H]; };

// 장면 파일: 1m 걸음 장면(W..) · 지점(P01~P03). 걷는 동안은 2048 사본(lo), 멈추면 4096
const wName = (id, eye, w = 0) => 'songjeong_' + id + '_eye' + eye + '_w' + String(w).padStart(3, '0') + '.jpg';
function wHave(id, eye, w = 0) { return !!PANO.have && PANO.have.has(wName(id, eye, w)); }
function wEye(id, eye, w = 0) {                         // 같은 자리 · 같은 물에서 가장 가까운 눈높이
  let best = null; [160, 140, 120].forEach(e => { if (wHave(id, e, w) && (best == null || Math.abs(e - eye) < Math.abs(best - eye))) best = e; });
  return best;
}
const wSrc = (id, eye, w = 0, lo) => PANO.dir + (lo && !PANO.test ? 'lo/' : '') + wName(id, eye, w);

// ── 위험 (MARKET.risks + 가게 턱) → 3D 모양. 모양은 레벨 액터의 경계 상자(assets/market/risks3d.js) 그대로
const R3 = window.NARU_RISKS3D || { shapes: {}, sill: null };
const SEV = { manhole: 'red', power: 'red', road: 'red', sill: 'amber', oil: 'amber', float: 'amber' };
function wHazards(list) {
  const out = [];
  (list || []).forEach(r => {
    const col = SEV[r.kind] || 'amber';
    const shapes = r.kind === 'sill' ? (R3.sill ? [R3.sill] : []) : (R3.shapes[r.id] || []);
    shapes.forEach((s, k) => out.push({ id: r.id, k, kind: r.kind, col, s, r }));
  });
  return out;
}
// 모양의 대표점(이름표 자리)과 바닥 자리
function wShapeAnchor(s) {
  if (s.t === 'box' || s.t === 'sill') return { x: (s.b[0] + s.b[3]) / 2, y: (s.b[1] + s.b[4]) / 2, z: s.b[5] + 0.25, fx: (s.b[0] + s.b[3]) / 2, fy: (s.b[1] + s.b[4]) / 2 };
  if (s.t === 'band') return { x: (s.b[0] + s.b[2]) / 2, y: (s.b[1] + s.b[3]) / 2, z: 0.6, fx: (s.b[0] + s.b[2]) / 2, fy: (s.b[1] + s.b[3]) / 2 };
  if (s.t === 'pole') return { x: s.x, y: s.y, z: Math.min(2.4, s.h), fx: s.x, fy: s.y };
  return { x: s.x, y: s.y, z: 0.55, fx: s.x, fy: s.y };
}

const WV_VS = 'attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }';
const WV_MR = 20, WV_MM = 10;          // 셰이더의 반복을 줄여 가볍게 (길은 RDP로 몇 점, 위험은 가까운 앞쪽 10개)
const WV_FS = `
precision highp float;
varying vec2 v;
uniform sampler2D uA, uB;
uniform float uMix, uMove, uYaw, uPitch, uTan, uAspect, uTime, uFloor, uOver, uDim, uIn;
uniform vec3 uPA, uPB;
uniform vec4 uWall;                         // cos, sin (장면 → 세계 x), 왼쪽 벽까지, 오른쪽 벽까지 (m, 카메라 기준)
uniform float uWallTop;
uniform vec4 uDeck;                         // 마루(가게 문 앞): 윗면까지(m, 카메라 기준) · 마루 앞 끝 x까지 · 켜짐
uniform vec2 uR[${WV_MR}];
uniform float uRN, uRS, uRW;
uniform vec3 uRCol;
uniform vec4 uM[${WV_MM}], uMB[${WV_MM}], uMC[${WV_MM}];
uniform float uMN;
const float PI = 3.14159265358979;
vec3 look(vec2 uv) {
  vec3 d = normalize(vec3((uv.x * 2. - 1.) * uAspect * uTan, (uv.y * 2. - 1.) * uTan, 1.));
  float cp = cos(uPitch), sp = sin(uPitch), cy = cos(uYaw), sy = sin(uYaw);
  d = vec3(d.x, d.y * cp + d.z * sp, -d.y * sp + d.z * cp);
  return vec3(d.x * cy + d.z * sy, d.y, -d.x * sy + d.z * cy);
}
vec2 eq(vec3 d) { return vec2(atan(d.x, d.z) / (2. * PI) + .5, .5 - asin(clamp(d.y, -1., 1.)) / PI); }
float hitProxy(vec3 d) {
  float t = 1e9;
  if (d.y < -1e-4) t = (uFloor + uRW) / d.y;          // 바닥(물이 찼으면 물낯)
  float nd = d.x * uWall.x + d.z * uWall.y;
  if (nd < -1e-4) { float tw = uWall.z / nd; if (tw > 0. && d.y * tw < uWallTop) t = min(t, tw); }
  if (nd > 1e-4) { float tw = uWall.w / nd; if (tw > 0. && d.y * tw < uWallTop) t = min(t, tw); }
  if (uDeck.z > .5 && d.y < -1e-4) { float td = uDeck.x / d.y; if (td > 0. && td < t && nd * td < uDeck.y) t = td; }
  return t;
}
void main() {
  vec3 d = look(v);
  vec3 c;
  if (uMove > .5) {
    float t = hitProxy(d);
    vec3 dA = d, dB = d;
    if (t < 1e8) { vec3 q = d * t; dA = normalize(q - uPA); dB = normalize(q - uPB); }
    c = mix(texture2D(uA, eq(dA)).rgb, texture2D(uB, eq(dB)).rgb, uMix);
  } else {
    vec2 uv = eq(d);
    c = mix(texture2D(uA, uv).rgb, texture2D(uB, uv).rgb, uMix);
  }
  if (uDim > .001) { float g = dot(c, vec3(.299, .587, .114)); c = mix(c, vec3(g) * .55 + .2, uDim); }
  if (uOver < .5) { gl_FragColor = vec4(mix(vec3(.91, .9, .87), c, uIn), 1.); return; }

  // 바닥(또는 물낯) 위의 점
  float tf = d.y < -1e-4 ? (uFloor + uRW) / d.y : 1e9;
  vec2 G = d.xz * tf;
  float near = length(G);
  float aa = .006 * tf + .012;
  // 길: 민트 빛줄 (발밑은 부드럽게 사라지고, 멀리 갈수록 옅게) + 흰 갈매기표
  if (uRN > 1.5 && tf < 80.) {
    float best = 1e9, sB = 0., lat = 0., acc = 0.;
    for (int i = 0; i < ${WV_MR - 1}; i++) {
      if (float(i) >= uRN - 1.) break;
      vec2 a = uR[i], b = uR[i + 1], ab = b - a; float L = length(ab);
      float h = clamp(dot(G - a, ab) / max(L * L, 1e-6), 0., 1.);
      vec2 q = a + ab * h; float dd = length(G - q);
      if (dd < best) { best = dd; sB = acc + h * L; lat = (ab.x * (G.y - a.y) - ab.y * (G.x - a.x)) / max(L, 1e-6); }
      acc += L;
    }
    // 빛줄: 가운데 민트 띠(폭 0.56m) + 바깥으로 번지는 빛 + 흰 갈매기표 (NARU GAUGE의 빛줄처럼)
    float hw = .28;
    float fade = smoothstep(.9, 2.6, near) * (1. - smoothstep(26., 42., near));
    float a = (1. - smoothstep(hw - aa, hw + aa, best)) * fade;
    float glow = (1. - smoothstep(hw, hw + .34 + aa, best)) * fade;
    float sh = (1. - smoothstep(hw + .2, hw + .42 + aa, best)) * (1. - glow) * fade;
    c = mix(c, c * .7, sh * .35);
    c = mix(c, mix(c, uRCol, .55) + uRCol * .12, glow * (1. - a) * .55);
    vec3 core = mix(uRCol, vec3(1.), .18);
    float k = fract((sB + uRS + abs(lat) * 1.1) / 2.4 - uTime * .32);   // 갈매기표 끝이 갈 곳 쪽
    float chev = (1. - smoothstep(0., .045 + aa * .5, abs(k - .5) - .045)) * (1. - smoothstep(.17, .24, abs(lat))) * a;
    c = mix(c, core, a * .82);
    c = mix(c, vec3(1.), chev * .95);
  }
  // 위험 표시
  for (int i = 0; i < ${WV_MM}; i++) {
    if (float(i) >= uMN) break;
    vec4 m = uM[i], mb = uMB[i], mc = uMC[i];
    vec3 col = mc.rgb; float pulse = mc.a > 1.5 ? 1. : mc.a * (.5 + .5 * sin(uTime * 5.2));   // 2 = 멈춰 있을 때 짚은 위험(늘 진하게)
    float ty = m.x;
    if (ty < 3.5) {                                   // 바닥: 1 고리(맨홀) · 2 얼룩 · 3 띠(찻길)
      if (tf > 60.) continue;
      float inA = 0., edge = 0.;
      if (ty < 1.5) { float r = length(G - m.yz); inA = 1. - smoothstep(m.w - aa, m.w + aa, r); edge = 1. - smoothstep(.05, .05 + aa * 1.5, abs(r - m.w - .04)); }
      else if (ty < 2.5) { float r = length(G - m.yz); inA = 1. - smoothstep(m.w - aa * 2., m.w + aa * 2., r);
        float ang = atan(G.y - m.z, G.x - m.y); edge = (1. - smoothstep(.04, .04 + aa * 1.5, abs(r - m.w))) * step(.5, fract(ang * 3.)); }
      else { vec2 lo = m.yz, hi = mb.xy; vec2 q = clamp(G, lo, hi); float out_ = length(G - q);
        inA = 1. - smoothstep(0., aa, out_); edge = inA * step(.5, fract(((G.x - lo.x) + (G.y - lo.y)) * 1.6)); }
      c = mix(c, col, inA * (.26 + .22 * pulse));
      c = mix(c, mix(col, vec3(1.), .18), edge * .95);
    } else if (ty < 4.5) {                            // 4 상자 (전기함 · 냉동고 · 쌓인 통 · 가게 턱)
      vec3 bmin = m.yzw, bmax = mb.xyz;
      vec3 dd = d + sign(d) * 1e-6 + vec3(equal(d, vec3(0.))) * 1e-6;
      vec3 inv = 1. / dd, t0 = bmin * inv, t1 = bmax * inv, tmn = min(t0, t1), tmx = max(t0, t1);
      float tn = max(max(tmn.x, tmn.y), tmn.z), tx = min(min(tmx.x, tmx.y), tmx.z);
      if (tx > max(tn, 0.) && tn > .2) {
        vec3 p = d * tn; float w = .012 * tn + .012;
        vec3 e3 = min(p - bmin, bmax - p);
        float e = tmn.x >= tmn.y && tmn.x >= tmn.z ? min(e3.y, e3.z) : tmn.y >= tmn.z ? min(e3.x, e3.z) : min(e3.x, e3.y);
        c = mix(c, col, .2 + .2 * pulse);
        c = mix(c, mix(col, vec3(1.), .25), (1. - smoothstep(w * .6, w, e)) * .95);
      }
    } else {                                          // 5 기둥 (전봇대)
      vec2 cc = m.yz; float r = m.w;
      float A = dot(d.xz, d.xz), B = -2. * dot(d.xz, cc), C = dot(cc, cc) - r * r, D = B * B - 4. * A * C;
      if (D > 0. && A > 1e-6) {
        float t = (-B - sqrt(D)) / (2. * A), y = d.y * t;
        if (t > .2 && y > mb.x && y < mb.y) {
          vec2 dn = normalize(d.xz); float perp = abs(dn.x * cc.y - dn.y * cc.x);
          float rimc = smoothstep(.5 * r, .92 * r, perp);
          c = mix(c, col, .3 + .2 * pulse);
          c = mix(c, mix(col, vec3(1.), .25), max(rimc, 1. - smoothstep(.0, .05 + .01 * t, mb.y - y)) * .9);
        }
      }
    }
  }
  gl_FragColor = vec4(mix(vec3(.91, .9, .87), c, uIn), 1.);
}`;

// 길 점 줄이기 (Ramer–Douglas–Peucker): 곧은 골목은 몇 점으로, 꺾이는 곳(가게 문 앞)은 그대로. 끝 점은 늘 남긴다
function wRdpMask(P, tol) {
  const keep = P.map(() => false); if (!P.length) return keep;
  keep[0] = keep[P.length - 1] = true;
  const st = [[0, P.length - 1]];
  while (st.length) {
    const [a, b] = st.pop(); let md = -1, mi = -1;
    const ax = P[a][0], ay = P[a][1], bx = P[b][0], by = P[b][1], L = Math.hypot(bx - ax, by - ay) || 1e-9;
    for (let i = a + 1; i < b; i++) { const d = Math.abs((bx - ax) * (ay - P[i][1]) - (ax - P[i][0]) * (by - ay)) / L; if (d > md) { md = d; mi = i; } }
    if (md > tol) { keep[mi] = true; st.push([a, mi], [mi, b]); }
  }
  return keep;
}

// ── 텍스처: 걷는 동안 끊기지 않게 미리 읽는다. 풀기(decode)는 화면 밖에서, 올리기(upload)는 띠 하나씩
//   한 장(2048 × 1024 = 8MB)을 한 프레임에 올리면 폰에서 그 프레임이 길어진다 → 256줄 띠(2MB)로 나눠 한 프레임에 하나씩
const WV_BM = { premultiplyAlpha: 'none', colorSpaceConversion: 'none' };   // 불투명 JPEG: 결과는 같고, 올릴 때 빠른 길을 탄다
const wvClose = b => { try { b && b.close && b.close(); } catch (e) {} };
function wvDecode(src) {
  if (window.createImageBitmap && window.fetch) return fetch(src).then(r => { if (!r.ok) throw new Error(src); return r.blob(); })
    .then(b => createImageBitmap(b, WV_BM).catch(() => createImageBitmap(b)))
    .then(bm => {
      const n = bm.height >= 512 && bm.height % 256 === 0 ? bm.height / 256 : 1;
      const w = bm.width, h = bm.height;                  // 닫기 전에 잰다(닫힌 그림은 크기가 0)
      if (n <= 1) return { w, h, parts: [bm] };
      return Promise.all(Array.from({ length: n }, (_, k) => createImageBitmap(bm, 0, k * 256, w, 256, WV_BM).catch(() => createImageBitmap(bm, 0, k * 256, w, 256))))
        .then(parts => { wvClose(bm); return { w, h, parts }; }, () => ({ w, h, parts: [bm] }));
    });
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res({ w: im.width, h: im.height, parts: [im] }); im.onerror = () => rej(new Error(src)); im.src = src; });
}
function wvFree(gl, q) { if (q.tex) try { gl.deleteTexture(q.tex); } catch (e) {} (q.parts || []).forEach(wvClose); q.tex = null; }
// 첫 걸음: 빈 텍스처 자리 잡기(이 프레임은 이것만). 이 폰이 못 받는 크기면 줄여서 한 번에 올리고 끝
function wvTexStart(gl, q) {
  const max = gl.getParameter(gl.MAX_TEXTURE_SIZE), gl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
  const pot = n => (n & (n - 1)) === 0;
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  q.tex = tex; q.k = 0; q.y = 0;
  if (q.w > max || (!gl2 && !(pot(q.w) && pot(q.h)))) {
    const w = Math.min(max, 4096), c = document.createElement('canvas'); c.width = w; c.height = w / 2;
    const cx = c.getContext('2d'), sc = c.height / q.h; let y = 0;
    q.parts.forEach(p => { cx.drawImage(p, 0, y * sc, c.width, p.height * sc); y += p.height; wvClose(p); });
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    q.done = true; return;
  }
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, q.w, q.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
}
// 띠 하나 올리기. 다 올렸으면 true
function wvTexStep(gl, q) {
  if (q.done) return true;
  const p = q.parts[q.k];
  gl.bindTexture(gl.TEXTURE_2D, q.tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, q.y, gl.RGBA, gl.UNSIGNED_BYTE, p);
  q.y += p.height; wvClose(p); q.k++;
  return q.k >= q.parts.length;
}

// ── WorldView: 한 자리에 서서 둘러보거나(at), 길을 따라 걷는다(walk)
//   at = { id, eye, w } 또는 walk = { from, to, eye } (WALK 순서의 id) · route = 세계 바닥 점들 [[x,y]...] (끝 = 갈 곳)
//   hazards = wHazards(...) · pins = [{ key, x, y, z, el(dist) }] · yaw0 · pitch0 · vfov · interactive · grade
//   ctl(ref) = { play(), pause(), toggle(), face(bearing), follow(), state() } · onProgress({ s, len, i, playing, cam, yaw, follow }) · onArrive()
function WorldView({ at, walk, route, hazards = [], pins = [], lines = [], yaw0 = 180, pitch0 = -8, vfov = 90, interactive = true, grade = true, emph = null,
  playing = false, speed = 1.25, ctl, onProgress, onArrive, onFail, startS = null, dim = 0, hold = false, padTop = 8, padBottom = 4, label = '1913 송정역시장 골목' }) {
  const cv = React.useRef(null), pinBox = React.useRef(null), box = React.useRef(null), lineBox = React.useRef(null), dbgEl = React.useRef(null);
  const S = React.useRef(null);
  if (!S.current) S.current = { yaw: yaw0, pitch: pitch0, cache: new Map(), loading: new Map(), dead: false, s: 0, u: 0, i: 0, play: false, follow: true, drag: null, last: 0, t0: 0, gl: null, u_: {}, prog: 0, hiTimer: 0, hi: null, gyro: null, fadeHi: 0 };
  const T = S.current;
  T.props = { at, walk, route, hazards, pins, lines, vfov, speed, onProgress, onArrive, onFail, emph, dim, grade, hold, padTop, padBottom, interactive };
  T.deck = (window.NARU_RISKS3D && NARU_RISKS3D.sill && NARU_RISKS3D.sill.deck) ? { top: NARU_RISKS3D.sill.deck[5], edge: NARU_RISKS3D.sill.deck[3], wall: -6.36 } : null;
  const [ready, setReady] = React.useState(false), [gen, setGen] = React.useState(0);

  // 걸을 길(WALK 순서에서 잘라 낸 것)
  const path = React.useMemo(() => {
    if (!walk) return null;
    const a = WALK.at(walk.from), b = WALK.at(walk.to);
    if (a < 0 || b < 0) return null;
    const seg = a <= b ? WALK.pts.slice(a, b + 1) : WALK.pts.slice(b, a + 1).reverse();
    let c = 0; return seg.map((p, i) => { if (i) c += Math.hypot(p.x - seg[i - 1].x, p.y - seg[i - 1].y); return { ...p, s: c }; });
  }, [walk && walk.from, walk && walk.to]);
  T.path = path;
  const eye = (walk && walk.eye) || (at && at.eye) || 140;
  T.eye = eye;
  React.useEffect(() => { T.play = !!playing && !!path; if (T.play) T.hi = null; }, [playing, path]);
  React.useEffect(() => { if (startS != null && path && !T.play) { T.s = Math.max(0, Math.min(path[path.length - 1].s, startS)); T.hi = null; } }, [startS, path]);
  React.useEffect(() => { T.home = { yaw: yaw0, pitch: pitch0 }; if (T.play) return; T.yaw = yaw0; T.pitch = pitch0; if (T.gyro) T.gyro.ref = null; }, [yaw0, pitch0]);
  React.useEffect(() => () => { if (T.gyro) { window.removeEventListener('deviceorientation', T.gyro.fn); T.gyro = null; } }, []);   // 폰 돌리기: 화면을 떠나면 센서를 놓는다

  // 자리 → 장면 id · 눈높이 · 카메라 위치
  const nodeCam = p => ({ x: p.x, y: p.y, z: (p.floor || .02) - .02 + T.eye / 100 });
  const keyOf = (id, w, lo) => { const e = wEye(id, T.eye, w); return e == null ? null : wSrc(id, e, w, lo); };

  React.useEffect(() => {
    const canvas = cv.current;
    const gl = canvas.getContext('webgl2', { antialias: false }) || canvas.getContext('webgl', { antialias: false });
    if (!gl) { onFail && onFail(); return; }
    (T.upq || []).forEach(q => (q.parts || []).forEach(wvClose));
    T.gl = gl; T.dead = false; T.lost = false; T.gen = gen; T.cache = new Map(); T.loading = new Map(); T.bad = new Map(); T.readyNow = false; T.sig = null; T.propsSeen = null;
    // 폰이 GPU를 거둬 가면(앱 전환 · 메모리) 멈춰 있다가, 돌려주면 처음부터 다시 만든다
    const onLost = e => { e.preventDefault(); T.lost = true; };
    const onRestored = () => { setGen(g => g + 1); };   // T.lost는 새 효과가 푼다(그 사이 옛 고리가 옛 GL로 그리지 않게)
    canvas.addEventListener('webglcontextlost', onLost); canvas.addEventListener('webglcontextrestored', onRestored);
    const sh = (type, code) => { const s = gl.createShader(type); gl.shaderSource(s, code); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('NARU WorldView shader', gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, WV_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, WV_FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.warn('NARU WorldView link', gl.getProgramInfoLog(pr)); onFail && onFail(); return; }
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n);
    const u = T.u_ = {};
    ['uA', 'uB', 'uMix', 'uMove', 'uYaw', 'uPitch', 'uTan', 'uAspect', 'uTime', 'uFloor', 'uOver', 'uDim', 'uIn', 'uPA', 'uPB', 'uWall', 'uWallTop', 'uDeck', 'uRN', 'uRS', 'uRW', 'uRCol', 'uMN'].forEach(n => { u[n] = U(n); });
    u.uR = U('uR[0]'); u.uM = U('uM[0]'); u.uMB = U('uMB[0]'); u.uMC = U('uMC[0]');
    gl.uniform1i(u.uA, 0); gl.uniform1i(u.uB, 1);
    const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    T.t0 = performance.now(); T.last = T.t0;

    const tex = src => (src && T.cache.has(src) ? T.cache.get(src) : null);
    const myGen = gen;
    const want = (src, from) => {
      if (!src || T.cache.has(src) || T.loading.has(src)) return;
      if ((T.bad.get(src) || 0) > performance.now()) return;              // 실패한 장면은 3초 뒤에 다시
      T.loading.set(src, wvDecode(from || src).then(im => { if (T.dead || T.gen !== myGen) { im.parts.forEach(wvClose); return; } T.upq.push({ src, ...im }); })
        .catch(() => {
          if (T.gen !== myGen) return;
          T.loading.delete(src);
          if (!from && src.indexOf('/lo/') >= 0) { want(src, src.replace('/lo/', '/')); return; }   // 2048 사본이 없으면 4096 원본으로
          T.bad.set(src, performance.now() + 3000);
          if (!T.everDrawn && !T.failSent) { T.failSent = true; P0().onFail && P0().onFail(); }   // 첫 장면부터 못 그리면 바깥(예전 뷰어)으로
        }));
    };
    const P0 = () => T.props;
    T.upq = [];
    // 올리기: 지금 그릴 장면이 먼저, 그다음 올리다 만 것, 그다음 미리 읽은 것 — 한 프레임에 띠 하나
    //   걷는 동안에는 4096(멈춰 서서 고른 장면)을 올리지 않는다: 버리고, 다음에 멈추면 다시 읽는다
    const pump = need => {
      if (T.play) for (let k = T.upq.length - 1; k >= 0; k--) { const q = T.upq[k]; if (q.src.indexOf('/lo/') < 0 && need.indexOf(q.src) < 0) { T.upq.splice(k, 1); wvFree(gl, q); T.loading.delete(q.src); } }
      if (!T.upq.length) return false;
      let k = T.upq.findIndex(q => need.indexOf(q.src) >= 0); if (k < 0) k = T.upq.findIndex(q => q.tex); if (k < 0) k = 0;
      const q = T.upq[k];
      // 아직 아무것도 못 그렸거나 걸음이 이 장면을 기다리는 중이면 한 번에 (움직이는 것이 없어 끊김이 보이지 않는다)
      const urgent = need.indexOf(q.src) >= 0 && (!T.readyNow || T.stall);
      try {
        if (!q.tex) { wvTexStart(gl, q); if (!q.done && !urgent) return true; }
        let fin = wvTexStep(gl, q);
        while (!fin && urgent) fin = wvTexStep(gl, q);
        if (fin) { T.upq.splice(T.upq.indexOf(q), 1); T.cache.set(q.src, q.tex); T.bad.delete(q.src); T.loading.delete(q.src); trim(); }
      } catch (e) { T.upq.splice(T.upq.indexOf(q), 1); wvFree(gl, q); T.bad.set(q.src, performance.now() + 3000); T.loading.delete(q.src); }
      return true;
    };
    const trim = () => {
      const keep = new Set(T.keep || []);
      const keys = Array.from(T.cache.keys());
      if (keys.length <= 12) return;
      keys.filter(k => !keep.has(k)).slice(0, keys.length - 12).forEach(k => { gl.deleteTexture(T.cache.get(k)); T.cache.delete(k); });
    };
    T.want = want;

    const R = new Float32Array(WV_MR * 2), M = new Float32Array(WV_MM * 4), MB = new Float32Array(WV_MM * 4), MC = new Float32Array(WV_MM * 4);
    const frame = now => {
      if (T.dead) return;
      T.raf = requestAnimationFrame(frame);
      if (T.lost) return;
      const dt = Math.max(0, Math.min(.1, (now - T.last) / 1000)); T.last = Math.max(T.last, now);   // 시각이 거꾸로 오면(탭 전환 · 수동 프레임) 멈춰 있는다
      const P = T.props;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25), W = Math.round(canvas.clientWidth * dpr), H = Math.round(canvas.clientHeight * dpr);   // 폰 화면에 충분, 셰이더는 1/2.5
      if (!W || !H) return;
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; T.sig = null; }
      if (T.play) T.wt = (T.wt || 0) + dt;                    // 갈매기표 · 깜빡임은 걷는 동안만 움직인다(멈춰 있으면 다시 그리지 않는다)

      // ── 자리와 장면 고르기
      let cam, srcA, srcB = null, mix = 0, move = false, PA = null, PB = null, wlev = 0;
      const path = T.path;
      if (path && path.length > 1) {
        const end = path[path.length - 1].s;
        let i = 0; while (i < path.length - 2 && path[i + 1].s <= T.s) i++;
        const a = path[i], b = path[i + 1];
        const ww = (P.walk && P.walk.w) || 0;
        wlev = ww / 100;                                      // 물 찬 골목을 걸을 때: 길 · 위험 · 다시 비추기의 바닥 = 물낯
        const sa = keyOf(a.id, ww, true), sb = keyOf(b.id, ww, true);
        want(sa); want(sb); for (let k = 2; k <= 4; k++) if (path[i + k]) want(keyOf(path[i + k].id, ww, true));
        // 다음 장면이 아직이면 그 앞에서 기다린다
        T.stall = false;
        if (T.play) {
          const can = tex(sb) && tex(sa);
          T.dbg = { can: !!can, sa: sa && sa.slice(-24), sb: sb && sb.slice(-24), loaded: !!tex(sa) + '/' + !!tex(sb), dt: Math.round(dt * 1000) };
          let ns = can ? Math.min(end, T.s + P.speed * dt) : Math.min(T.s, a.s);   // 다음 장면이 아직이면 지금 자리(원본 한 장)에서 기다린다
          // 걸음 자리(b)를 넘어 다음 칸으로 들어가려면 그 칸의 먼 장면도 있어야 한다. 아직이면 b 위에 서서(원본 한 장) 기다린다
          const c = path[i + 2];
          if (can && c && ns > b.s && !tex(keyOf(c.id, ww, true))) { ns = b.s; T.stall = true; }
          T.s = Math.max(0, ns);
          T.stall = T.stall || !can;
          if (T.s >= end - 1e-3) { T.s = end; T.play = false; P.onArrive && P.onArrive(); }
        } else if (T.s > a.s + 1e-3 && T.s < b.s - 1e-3 && !T.drag && !P.hold) {
          // 멈추면 가까운 다음 자리까지 마저 걷는다 (한 장의 원본 장면 위에서 멈추게). 다음 장면이 없으면 앞 자리로
          T.s = tex(sa) && tex(sb) ? Math.min(b.s, T.s + Math.max(.6, P.speed) * dt * 1.4) : a.s;
        }
        let j = 0; while (j < path.length - 2 && path[j + 1].s <= T.s) j++;
        const A = path[j], B = path[j + 1]; T.i = j;
        const kA = keyOf(A.id, ww, true), kB = keyOf(B.id, ww, true);   // 지금 칸의 두 장면
        T.u = Math.max(0, Math.min(1, (T.s - A.s) / Math.max(1e-6, B.s - A.s)));
        if (T.u >= 1 - 1e-4 && j === path.length - 2) T.u = 1;
        const cA = nodeCam(A), cB = nodeCam(B);
        T.deckSeg = (A.floor || 0) > .1 || (B.floor || 0) > .1 ? 1 : 0;
        cam = { x: cA.x + (cB.x - cA.x) * T.u, y: cA.y + (cB.y - cA.y) * T.u, z: cA.z + (cB.z - cA.z) * T.u };
        if (T.u <= 1e-4 || T.u >= 1 - 1e-4) {
          const N = T.u >= 1 - 1e-4 ? B : A;
          const hi = keyOf(N.id, ww, false), loK = keyOf(N.id, ww, true);
          if (T.play || T.lastNode !== N.id) { T.lastNode = N.id; T.stillSince = now; }
          if (!T.play && now - (T.stillSince || now) > 1200) want(hi);    // 멈춰 선 지 1.2초 뒤에만 선명한 장면
          srcA = tex(hi) ? hi : loK;
          if (tex(hi) && T.hiFrom === loK && T.fadeHi < 1) { T.fadeHi = Math.min(1, T.fadeHi + (still ? 1 : dt * 4)); srcB = hi; srcA = loK; mix = T.fadeHi; }
          else if (!tex(hi)) { T.hiFrom = loK; T.fadeHi = 0; }
          cam = nodeCam(N);
        } else {
          T.hiFrom = null; T.fadeHi = 0;
          srcA = kA; srcB = kB; move = true; PA = cA; PB = cB;
          const k = T.u; mix = k * k * (3 - 2 * k);
        }
        T.keep = [kA, kB, sa, sb, keyOf(A.id, ww, false), keyOf(B.id, ww, false)];
        // 가는 쪽을 바라보기(따라가기)
        if (T.follow && !T.drag) {
          const ahead = Math.min(end, T.s + 2.4);
          let k2 = 0; while (k2 < path.length - 2 && path[k2 + 1].s <= ahead) k2++;
          const p0 = path[k2], p1 = path[k2 + 1], f = Math.max(0, Math.min(1, (ahead - p0.s) / Math.max(1e-6, p1.s - p0.s)));
          const tx = p0.x + (p1.x - p0.x) * f - cam.x, ty = p0.y + (p1.y - p0.y) * f - cam.y;
          if (Math.hypot(tx, ty) > .3 && T.play) { const goal = wYaw(wBearing(tx, ty)); T.yaw += wNorm(goal - T.yaw) * Math.min(1, dt * 2.2); }
        }
      } else if (P.at) {
        wlev = (P.at.w || 0) / 100;
        const p = WALK.pts[WALK.at(P.at.id)] || (MARKET.points.find(q => q.id === P.at.id) ? { id: P.at.id, x: 0, y: MARKET.points.find(q => q.id === P.at.id).y, floor: .02 } : null);
        if (!p) return;
        cam = nodeCam(p);
        const hi = keyOf(P.at.id, P.at.w || 0, P.interactive === false);   // 작은 카드(끌 수 없는 장면)는 2048 사본
        want(hi);
        if (tex(hi)) {
          if (T.atShown && T.atShown !== hi && tex(T.atShown)) {
            T.atFade = Math.min(1, (T.atFade || 0) + (still ? 1 : dt * 3.5));
            srcA = T.atShown; srcB = hi; mix = T.atFade;
            if (T.atFade >= 1) { T.atShown = hi; T.atFade = 0; srcA = hi; srcB = null; mix = 0; }
          } else { T.atShown = hi; T.atFade = 0; srcA = hi; }
        } else srcA = T.atShown && tex(T.atShown) ? T.atShown : hi;
        T.keep = [hi, T.atShown];
      }
      pump([srcA, srcB]);
      if (!srcA || !tex(srcA)) { if (T.readyNow) { T.readyNow = false; setReady(false); } return; }
      if (!T.readyNow) { T.readyNow = true; if (!T.inT) T.inT = now; T.everDrawn = true; setReady(true); }   // 나타나는 부드러움은 처음 한 번만
      if (srcB && !tex(srcB)) { srcB = null; mix = 0; move = false; }
      // 폰 돌리기
      if (T.gyro && T.gyro.on && T.gyro.a != null && !T.drag) {
        const g = T.gyro; if (g.ref == null) g.ref = { a: g.a, yaw: T.yaw, b: g.b, pitch: T.pitch };
        T.yaw = g.ref.yaw + wNorm(g.a - g.ref.a); T.pitch = Math.max(-70, Math.min(60, g.ref.pitch + (g.b - g.ref.b)));
      }
      T.cam = cam;
      const inFade = !still && T.inT && now - T.inT < 340;
      const sig = [srcA, srcB, mix.toFixed(3), cam.x.toFixed(3), cam.y.toFixed(3), cam.z.toFixed(3), T.yaw.toFixed(2), T.pitch.toFixed(2), W, H, T.play ? 1 : 0].join('|');
      const live = T.play || inFade || (P.emph && T.play);
      // 이름표가 아직 자리를 못 잡았으면(글꼴이 늦게 와 크기가 0이었을 때 등) 한 번 더 그린다
      const pinsLate = pinBox.current && (P.pins || []).length && !T.pinsOk && (T.pinTry = (T.pinTry || 0) + 1) < 240;
      if (sig === T.sig && !live && T.propsSeen === P && !pinsLate) {     // 바뀐 것이 없으면 다시 그리지 않는다(배터리 · 끊김)
        if (P.onProgress && now - T.prog > 250) { T.prog = now; P.onProgress({ s: T.s, len: path ? path[path.length - 1].s : 0, i: T.i, playing: T.play, cam, yaw: T.yaw, follow: T.follow, moving: move, stalled: !!T.stall }); }
        return;
      }
      T.sig = sig; T.propsSeen = P;

      // ── 그리기
      const rad = Math.PI / 180, t = (now - T.t0) / 1000;
      gl.viewport(0, 0, W, H);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex(srcA));
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, srcB ? tex(srcB) : tex(srcA));
      gl.uniform1f(u.uMix, srcB ? mix : 0); gl.uniform1f(u.uMove, move ? 1 : 0);
      gl.uniform1f(u.uYaw, T.yaw * rad); gl.uniform1f(u.uPitch, T.pitch * rad);
      gl.uniform1f(u.uTan, Math.tan(P.vfov * Math.PI / 360)); gl.uniform1f(u.uAspect, W / H); gl.uniform1f(u.uTime, still ? 0 : (T.wt || 0));
      gl.uniform1f(u.uFloor, -cam.z); gl.uniform1f(u.uRW, wlev); gl.uniform1f(u.uDim, P.dim || 0);
      gl.uniform1f(u.uIn, still ? 1 : Math.min(1, (now - (T.inT || now)) / 320));   // 처음 한 번 부드럽게 나타난다 (CSS 전환 대신: 캡처에서도 같게)
      if (move) { const a = wLocal(cam, PA.x, PA.y, PA.z), b = wLocal(cam, PB.x, PB.y, PB.z); gl.uniform3f(u.uPA, a[0], a[1], a[2]); gl.uniform3f(u.uPB, b[0], b[1], b[2]); }
      gl.uniform4f(u.uWall, Math.cos(W_OFF), Math.sin(W_OFF), W_WALLS.xL - cam.x, W_WALLS.xR - cam.x);
      gl.uniform1f(u.uWallTop, W_WALLS.top - cam.z);
      const dk = move && T.deck && (T.deckSeg || 0) > 0 && wlev < T.deck.top;
      gl.uniform4f(u.uDeck, dk ? T.deck.top - cam.z : 0, dk ? T.deck.edge - cam.x : 0, dk ? 1 : 0, 0);
      if (dk) gl.uniform4f(u.uWall, Math.cos(W_OFF), Math.sin(W_OFF), T.deck.wall - cam.x, W_WALLS.xR - cam.x);   // 마루 쪽 벽 = 가게 앞(레벨의 SM_6_MainBody1)
      // 길: 지금 자리에서 끝까지 (점 32개 안으로 줄인다)
      let rn = 0;
      const rt = P.route || [];
      if (rt.length > 1) {
        // 지금 자리에서 가장 가까운 길 위 점부터
        let bi = 0, bd = 1e9, bp = null, along = 0, acc = 0;
        for (let k = 0; k < rt.length - 1; k++) {
          const ax = rt[k][0], ay = rt[k][1], bx = rt[k + 1][0], by = rt[k + 1][1], L2 = (bx - ax) ** 2 + (by - ay) ** 2, L = Math.sqrt(L2);
          const h = Math.max(0, Math.min(1, ((cam.x - ax) * (bx - ax) + (cam.y - ay) * (by - ay)) / Math.max(1e-6, L2)));
          const qx = ax + (bx - ax) * h, qy = ay + (by - ay) * h, dd = Math.hypot(cam.x - qx, cam.y - qy);
          if (dd < bd - 1e-6) { bd = dd; bi = k; bp = [qx, qy]; along = acc + h * L; }
          acc += L;
        }
        if (T.rdpOf !== rt) { T.rdpOf = rt; T.rdp = wRdpMask(rt, .04); }
        let use = [bp].concat(rt.slice(bi + 1).filter((_, j) => T.rdp[bi + 1 + j]));
        if (use.length > WV_MR) { const keep = WV_MR - 2, st = (use.length - 2) / keep; use = [use[0]].concat(Array.from({ length: keep }, (_, k) => use[1 + Math.floor(k * st)]), [use[use.length - 1]]); }
        use.forEach((q, k) => { const l = wLocal(cam, q[0], q[1], 0); R[k * 2] = l[0]; R[k * 2 + 1] = l[2]; });
        rn = use.length;
        gl.uniform1f(u.uRS, along);
        T.along = along;
      }
      gl.uniform2fv(u.uR, R); gl.uniform1f(u.uRN, rn); gl.uniform3f(u.uRCol, W_COL.route[0], W_COL.route[1], W_COL.route[2]);
      // 위험: 가까운 것부터 14개
      const passed = o => o.h.r && o.h.r.s != null && T.along != null && rn > 1 && o.h.r.s < T.along - 2;   // 이미 지나온 것은 뒤로
      const hz = (P.hazards || []).map(h => ({ h, an: wShapeAnchor(h.s) })).map(o => ({ ...o, d: Math.hypot(o.an.fx - cam.x, o.an.fy - cam.y) })).filter(o => o.d < 34)
        .sort((a, b) => (a.d + (passed(a) ? 1000 : 0)) - (b.d + (passed(b) ? 1000 : 0))).slice(0, WV_MM);
      hz.forEach((o, k) => {
        const s = o.h.s, cl = W_COL[o.h.col] || W_COL.amber, em = P.emph && P.emph === o.h.id ? (T.play ? 1 : 2) : 0;
        let a = [0, 0, 0, 0], b = [0, 0, 0, 0];
        if (s.t === 'disc' || s.t === 'patch') { const l = wLocal(cam, s.x, s.y, 0); a = [s.t === 'disc' ? 1 : 2, l[0], l[2], s.r]; }
        else if (s.t === 'band') { const p = wLocal(cam, s.b[0], s.b[1], 0), q = wLocal(cam, s.b[2], s.b[3], 0); a = [3, Math.min(p[0], q[0]), Math.min(p[2], q[2]), 0]; b = [Math.max(p[0], q[0]), Math.max(p[2], q[2]), 0, 0]; }
        else if (s.t === 'box' || s.t === 'sill') { const p = wLocal(cam, s.b[0], s.b[1], s.b[2]), q = wLocal(cam, s.b[3], s.b[4], s.b[5]); a = [4, Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.min(p[2], q[2])]; b = [Math.max(p[0], q[0]), Math.max(p[1], q[1]), Math.max(p[2], q[2]), 0]; }
        else if (s.t === 'pole') { const l = wLocal(cam, s.x, s.y, 0); a = [5, l[0], l[2], s.r]; b = [-cam.z, s.h - cam.z, 0, 0]; }
        M.set(a, k * 4); MB.set(b, k * 4); MC.set([cl[0], cl[1], cl[2], em], k * 4);
      });
      gl.uniform4fv(u.uM, M); gl.uniform4fv(u.uMB, MB); gl.uniform4fv(u.uMC, MC); gl.uniform1f(u.uMN, hz.length);
      gl.uniform1f(u.uOver, rn > 1 || hz.length ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // ── 선 (물 높이 자 · 못 가는 높이): 세계의 두 점 → 화면, 눈 뒤로 넘어가는 쪽은 잘라 낸다
      const lb = lineBox.current;
      if (lb) {
        const cw = canvas.clientWidth, ch = canvas.clientHeight;
        Array.from(lb.children).forEach(node => {
          const L = (P.lines || []).find(q => q.key === node.dataset.k); if (!L) return;
          let a = wCam(wLocal(cam, L.a[0], L.a[1], L.a[2]), T.yaw, T.pitch), b = wCam(wLocal(cam, L.b[0], L.b[1], L.b[2]), T.yaw, T.pitch);
          const zn = .06;
          if (a[2] < zn && b[2] < zn) { node.style.display = 'none'; return; }
          if (a[2] < zn) { const t = (zn - a[2]) / (b[2] - a[2]); a = a.map((v, i) => v + (b[i] - v) * t); }
          if (b[2] < zn) { const t = (zn - b[2]) / (a[2] - b[2]); b = b.map((v, i) => v + (a[i] - v) * t); }
          const A = wScr(a, P.vfov, cw, ch), B = wScr(b, P.vfov, cw, ch);
          node.style.display = '';
          Array.from(node.children).forEach(ln => { ln.setAttribute('x1', A[0]); ln.setAttribute('y1', A[1]); ln.setAttribute('x2', B[0]); ln.setAttribute('y2', B[1]); });
        });
      }
      // ── 이름표 (DOM): 세계의 점 → 화면
      const el = pinBox.current;
      if (el) {
        const cw = canvas.clientWidth, ch = canvas.clientHeight, todo = [];
        Array.from(el.children).forEach(node => {
          const p = (P.pins || []).find(q => q.key === node.dataset.k); if (!p) return;
          const l = wLocal(cam, p.x, p.y, p.z), q = wProject(l, T.yaw, T.pitch, P.vfov, cw, ch);
          const dist = Math.hypot(p.x - cam.x, p.y - cam.y);
          const far = p.max != null && dist > p.max, near = p.min != null && dist < p.min;
          const inView = q && q[0] > -40 && q[0] < cw + 40 && q[1] > -20 && q[1] < ch + 60;
          const dEl = node.querySelector('[data-d]'); if (dEl) dEl.textContent = Math.max(1, Math.round(dist)) + 'm';
          if (p.edge && !inView && !far) {                // 화면 밖이면 가장자리에 방향만
            const rel = wNorm(wYaw(wBearing(p.x - cam.x, p.y - cam.y)) - T.yaw);
            node.dataset.edge = rel < 0 ? 'l' : 'r'; node.style.display = 'flex';
            const w = node.offsetWidth, h = node.offsetHeight;
            todo.push({ node, p, dist, w, h, L: rel < 0 ? 20 : cw - 20 - w, T: Math.max(P.padTop, ch * .44 - h / 2) });
          } else if (inView && !far && !near) {           // 이름표 상자 전체가 화면 안에 들도록 붙잡는다
            node.dataset.edge = ''; node.style.display = 'flex';
            const w = node.offsetWidth, h = node.offsetHeight, a = p.anchor, x = q[0], y = q[1];
            let L = a === 'r' ? x + 12 : a === 'l' ? x - 12 - w : x - w / 2, Tp = a === 'r' || a === 'l' ? y - h / 2 : a === 'dn' ? y + 8 : a === 'up' ? y - h - 8 : y - h;
            Tp += p.dy || 0;                               // 이름표가 선에 붙을 때 조금 비킨다
            todo.push({ node, p, dist, w, h, L: Math.max(20, Math.min(cw - 20 - w, L)), T: Math.max(P.padTop, Math.min(ch - P.padBottom - h, Tp)) });   // 판 · 단추 밑으로 숨지 않게
          } else node.style.display = 'none';
        });
        // 겹치지 않게: 갈 곳 → 다가오는 위험 → 나머지(가까운 것부터). 겹치면 아래로 비키고, 그래도 겹치면 숨긴다
        todo.sort((a, b) => (b.p.prio || 1) - (a.p.prio || 1) || a.dist - b.dist);
        const placed = [];
        const hit = r => placed.some(o => r.L < o.L + o.w + 4 && r.L + r.w + 4 > o.L && r.T < o.T + o.h + 4 && r.T + r.h + 4 > o.T);
        todo.forEach(r => {
          if (hit(r)) {                                    // 겹치면 아래로, 아래에 자리가 없으면(단추 · 판) 위로 비킨다 — 글자를 키워도 이름표가 사라지지 않게
            const col = placed.filter(o => r.L < o.L + o.w + 4 && r.L + r.w + 4 > o.L);
            const below = col.reduce((m, o) => Math.max(m, o.T + o.h + 6), r.T), above = col.reduce((m, o) => Math.min(m, o.T - r.h - 6), r.T);
            r.T = below;
            if (hit(r) || r.T + r.h > ch - P.padBottom) { r.T = above; if (r.T < P.padTop || hit(r)) r.T = below; }
          }
          if (hit(r) || r.T + r.h > ch - P.padBottom) { r.node.style.display = 'none'; return; }
          placed.push(r); r.node.style.transform = `translate(${r.L}px, ${r.T}px)`;
        });
        T.pinsOk = !todo.length || todo.every(r => r.w > 0 && r.h > 0);
      }
      if (PANO.dev && dbgEl.current) dbgEl.current.textContent = `s ${T.s.toFixed(2)} u ${T.u.toFixed(2)} i ${T.i} play ${T.play} ${JSON.stringify(T.dbg || {})} cache ${T.cache.size} loading ${T.loading.size} bad ${T.bad ? T.bad.size : 0}`;
      // ── 바깥에 알리기 (초당 8번)
      if (P.onProgress && now - T.prog > 250) {
        T.prog = now;
        P.onProgress({ s: T.s, len: path ? path[path.length - 1].s : 0, i: T.i, playing: T.play, cam, yaw: T.yaw, follow: T.follow, moving: move, stalled: !!T.stall });
      }
    };
    T.raf = requestAnimationFrame(frame);
    if (box.current) { box.current.__wv = T; if (PANO.dev) T.frame = frame; }   // 점검용 (?panodev=1: 상태 보기 · 프레임 손으로 돌리기)
    return () => {
      T.dead = true; cancelAnimationFrame(T.raf);
      canvas.removeEventListener('webglcontextlost', onLost); canvas.removeEventListener('webglcontextrestored', onRestored);
      if (!gl.isContextLost()) T.cache.forEach(tx => gl.deleteTexture(tx));
      (T.upq || []).forEach(q => wvFree(gl, q)); T.upq = [];
      T.cache.clear(); T.loading.clear();
    };
  }, [gen]);
  React.useEffect(() => () => { const gl = T.gl; if (gl && !gl.isContextLost()) { const lose = gl.getExtension('WEBGL_lose_context'); lose && lose.loseContext(); } }, []);

  // 바깥에서 다루기
  React.useImperativeHandle(ctl, () => ({
    play() { if (T.path) { T.play = true; } }, pause() { T.play = false; }, toggle() { T.play = !T.play; return T.play; },
    face(bearing, pitch) { T.yaw = wYaw(bearing); if (pitch != null) T.pitch = pitch; if (T.gyro) T.gyro.ref = null; },
    follow() { T.follow = true; if (T.gyro) T.gyro.ref = null; if (!T.path && T.home) { T.yaw = T.home.yaw; T.pitch = T.home.pitch; return; } if (T.path && T.cam) { const p = T.path, s = Math.min(p[p.length - 1].s, T.s + 2.4); let k = 0; while (k < p.length - 2 && p[k + 1].s <= s) k++; const a = p[k], b = p[k + 1]; const tx = b.x - T.cam.x, ty = b.y - T.cam.y; if (Math.hypot(tx, ty) > .2) T.yaw = wYaw(wBearing(tx, ty)); } },
    turn(d) { T.yaw += d; T.follow = false; if (T.gyro) T.gyro.ref = null; },
    gyro(on) {
      const stop = () => { if (T.gyro) { window.removeEventListener('deviceorientation', T.gyro.fn); T.gyro = null; } };
      if (!on) { stop(); return Promise.resolve(false); }
      // alpha는 폰을 왼쪽으로 돌릴수록 커진다 → -alpha = 오른쪽으로 돈 각. 화면도 같은 쪽으로 돈다
      const start = () => { stop(); const g = { on: true, a: null, b: 90, ref: null }; g.fn = e => { if (e.alpha == null) return; g.a = -e.alpha; g.b = e.beta == null ? 90 : e.beta; }; window.addEventListener('deviceorientation', g.fn); T.gyro = g; T.follow = false; return true; };
      const D = window.DeviceOrientationEvent;
      if (D && typeof D.requestPermission === 'function') return D.requestPermission().then(r => (r === 'granted' ? start() : false)).catch(() => false);
      return Promise.resolve(D ? start() : false);
    },
    state() { return { s: T.s, i: T.i, playing: T.play, yaw: T.yaw, cam: T.cam, follow: T.follow }; },
  }), []);

  const down = e => { if (!interactive || T.drag) return; T.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, yaw: T.yaw, pitch: T.pitch, moved: false }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {} };
  const move = e => {
    const d = T.drag; if (!d || e.pointerId !== d.id) return;
    if (!d.moved && Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 5) { d.moved = true; T.follow = false; }
    if (!d.moved) return;
    const k = T.props.vfov / (cv.current.clientHeight || 1);
    T.yaw = d.yaw - (e.clientX - d.x) * k; T.pitch = Math.max(-70, Math.min(60, d.pitch + (e.clientY - d.y) * k));
  };
  const up = e => { if (!T.drag || e.pointerId !== T.drag.id) return; if (T.drag.moved && T.gyro) T.gyro.ref = null; T.drag = null; };
  const key = e => {
    const st = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, 6], ArrowDown: [0, -6] }[e.key]; if (!st) return;
    e.preventDefault(); T.yaw += st[0]; T.pitch = Math.max(-70, Math.min(60, T.pitch + st[1])); T.follow = false; if (T.gyro) T.gyro.ref = null;
  };
  return (
    <div ref={box} className="wv" {...(interactive ? { tabIndex: 0, role: 'application', 'aria-label': label + '. 끌거나 화살표 키로 둘러볼 수 있어요', onKeyDown: key, onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up } : { role: 'img', 'aria-label': label })}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', cursor: interactive ? 'grab' : 'default', touchAction: interactive ? 'none' : 'auto', pointerEvents: interactive ? 'auto' : 'none', outline: 'none', background: 'var(--disc, #E9E5DE)' }}>
      <canvas ref={cv} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', filter: grade && !PANO.test ? AR_GRADE : undefined }} />
      <svg ref={lineBox} width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }} aria-hidden="true">
        {lines.map(L => <g key={L.key} data-k={L.key} style={{ display: 'none' }}>
          {L.halo !== false && <line stroke="#101412" strokeOpacity=".38" strokeWidth={(L.w || 2) + 2.5} strokeLinecap="round" strokeDasharray={L.dash || undefined} />}
          <line stroke={L.color || '#FFFFFF'} strokeWidth={L.w || 2} strokeLinecap="round" strokeDasharray={L.dash || undefined} />
        </g>)}
      </svg>
      <div ref={pinBox} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {pins.map(p => <div key={p.key} data-k={p.key} className={'wv-pin ' + (p.tone || '')} style={{ position: 'absolute', left: 0, top: 0, display: 'none' }}>{p.el}</div>)}
      </div>
      {PANO.test && <span className="ar-ph" style={{ right: 12, top: 300, left: 'auto' }}>시험 장면 · 배경데이터 아님</span>}
      {PANO.dev && <span ref={dbgEl} style={{ position: 'absolute', left: 8, right: 8, top: 260, zIndex: 80, padding: 6, background: 'rgba(0,0,0,.75)', color: '#fff', font: '11px/1.35 monospace', whiteSpace: 'pre-wrap' }} />}
    </div>
  );
}

Object.assign(window, { WALK, W_COL, wLocal, wYaw, wBearing, wProject, wNorm, wCam, wScr, wRdpMask, wHazards, wShapeAnchor, wHave, wEye, wSrc, wName, WorldView: React.memo(WorldView) });
