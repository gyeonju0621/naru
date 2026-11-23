// NARU · 360° 파노라마 뷰어
// 언리얼(UE 5.2.1 · 시퀀서 + MRQ · 6면 큐브맵)에서 뽑아 합친 equirect JPG를 그대로 보여 준다.
// 파일 규칙(11/13 멘토링 기준표):  assets/pano/songjeong_P02_eye160_w030.jpg   지점 · 눈높이(cm) · 수위(cm)
// 원형 유지: 원본 렌더 파일은 그대로 둔다. 모식 보기(dim)와 길 리본·표지는 화면에서만 덮는 층이고, '원본 보기'로 걷힌다.

const PANO = (() => {
  const q = new URLSearchParams(location.search);
  const test = q.get('pano') === 'test';          // ?pano=test → 그려 만든 시험 장면 (배경데이터 아님)
  return {
    test,
    dev: q.get('panodev') === '1',                // ?panodev=1 → 누른 곳의 방향(yaw, pitch)을 보여 준다 (표지 좌표 잡기용)
    dir: test ? 'assets/pano-test/' : 'assets/pano/',
    points: [['P01', '입구'], ['P02', '골목'], ['P03', '안쪽']],
    eyes: [160, 140, 120],                        // 걸어서 · 보행보조차 · 휠체어
    waters: [0, 30, 50, 100],                     // cm, 지점 바닥 기준. 0 = 원본 그대로
    scenePoint: { crosswalk: 'P01', corner: 'P02', plaza: 'P03', gate: 'P01' },
    walkEye: { walk: 160, aid: 140, wheel: 120 },
    hotspots: {},                                 // 지점별 표지: { P02: [{ yaw: 12, pitch: -24, label: '맨홀', amber: true }] }
    ready: null,                                  // null 확인 중 · true 있음 · false 없음(모식 지도만 보여 줌)
    have: null,                                   // 지금 폴더에 있는 파일 이름들(Set). 36장을 다 뽑지 않아도 앱이 돌게 한다
    name(p, e, w) { return 'songjeong_' + p + '_eye' + e + '_w' + String(w).padStart(3, '0') + '.jpg'; },
    // 같은 지점 · 같은 수위에서 눈높이가 가장 가까운 장면을 고른다 (다른 지점이나 다른 수위의 장면으로 바꿔 보여 주지는 않는다)
    pick(p, e, w) {
      if (!this.have) return { eye: e, src: this.dir + this.name(p, e, w) };
      let best = null;
      this.eyes.forEach(x => { if (this.have.has(this.name(p, x, w)) && (best == null || Math.abs(x - e) < Math.abs(best - e))) best = x; });
      return best == null ? null : { eye: best, src: this.dir + this.name(p, best, w) };
    },
    file(p, e, w) { const k = this.pick(p, e, w); return k ? k.src : this.dir + this.name(p, e, w); },
    has(p, w) { return !!this.have && !!this.pick(p, 140, w || 0); },
    waterOf(m) { const cm = (m || 0) * 100; return this.waters.reduce((a, b) => (Math.abs(b - cm) < Math.abs(a - cm) ? b : a)); },
  };
})();
// 어떤 장면이 있는지: assets/pano/list.js (렌더 도우미가 써 주는 목록)만 본다. 손으로 복사했으면 naru_run.ps1 list 를 돌린다.
// 시험 장면(pano-test)은 36장이 다 있다.
(() => {
  const all = [], day = [];
  // 밤 렌더(레벨에 밤 조명이 원래 있을 때만): 같은 이름 끝에 _night  예) songjeong_P03_eye140_w030_night.jpg
  PANO.points.forEach(([p]) => PANO.eyes.forEach(e => PANO.waters.forEach(w => { const n = PANO.name(p, e, w); day.push(n); all.push(n, n.replace('.jpg', '_night.jpg')); })));
  const done = names => { PANO.have = new Set(names); PANO.ready = names.length > 0; window.dispatchEvent(new Event('naru-pano')); };
  // 지점 P01~P03 + 1m 걸음 장면 W00~W99 (11/23, 직접 걸어 보기) — 같은 파일 규칙
  const walk = n => /^songjeong_W\d\d_eye(120|140|160)_w(000|030|050|100)\.jpg$/.test(n);   // 물 찬 걸음 장면(가게 문 → 높은 건물)도
  const listed = !PANO.test && Array.isArray(window.NARU_PANOS) ? window.NARU_PANOS.filter(n => all.includes(n) || walk(n)) : [];
  done(PANO.test ? day : listed);          // 목록(list.js)에 적힌 장면만 쓴다. 파일을 넣고 목록을 안 쓴 상태로 '전부 있음'이라 짐작하지 않는다
})();

function usePanoReady() {
  const [r, setR] = React.useState(PANO.ready);
  React.useEffect(() => {
    const f = () => setR(PANO.ready);
    window.addEventListener('naru-pano', f); f();
    return () => window.removeEventListener('naru-pano', f);
  }, []);
  return r === true;
}

const PANO_VS = 'attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }';
const PANO_FS = `
precision highp float;
varying vec2 v;
uniform sampler2D uA, uB;
uniform float uMix, uYaw, uPitch, uTan, uAspect, uRibbon, uH, uTime, uDim;
uniform vec4 uFocus;                                   // 모식 보기에서 또렷이 남길 곳: 방향(yaw) · 반폭 · 높이(pitch) · 반높이 (rad)
const float PI = 3.14159265358979;
vec3 look(vec2 uv) {
  vec3 d = normalize(vec3((uv.x * 2. - 1.) * uAspect * uTan, (uv.y * 2. - 1.) * uTan, 1.));
  float cp = cos(uPitch), sp = sin(uPitch), cy = cos(uYaw), sy = sin(uYaw);
  d = vec3(d.x, d.y * cp + d.z * sp, -d.y * sp + d.z * cp);
  return vec3(d.x * cy + d.z * sy, d.y, -d.x * sy + d.z * cy);
}
void main() {
  vec3 d = look(v);
  float lon = atan(d.x, d.z), lat = asin(clamp(d.y, -1., 1.));
  vec2 uv = vec2(lon / (2. * PI) + .5, .5 - lat / PI);
  vec3 c = mix(texture2D(uA, uv).rgb, texture2D(uB, uv).rgb, uMix);
  if (uDim > .001) {                                     // 모식 보기: 원본 렌더는 그대로 두고, 볼 필요 없는 곳만 화면에서 흐리게 덮는다
    float inside = 0., rim = 0.;
    if (uFocus.y > 0.) {
      float dl = abs(atan(sin(lon - uFocus.x), cos(lon - uFocus.x))), dp = abs(lat - uFocus.z);
      inside = (1. - smoothstep(uFocus.y - .006, uFocus.y, dl)) * (1. - smoothstep(uFocus.w - .006, uFocus.w, dp));
      float inner = (1. - smoothstep(uFocus.y - .024, uFocus.y - .018, dl)) * (1. - smoothstep(uFocus.w - .024, uFocus.w - .018, dp));
      rim = inside * (1. - inner);
    }
    float g = dot(c, vec3(.299, .587, .114));
    c = mix(c, mix(vec3(g), vec3(.94, .93, .91), .4), uDim * (1. - inside));
    c = mix(c, vec3(.18, .49, .41), rim * uDim);
  }
  if (abs(uRibbon) > .5 && d.y < -.03) {
    vec2 g = d.xz * (uH / -d.y) * (uRibbon < 0. ? -1. : 1.);   // 바닥(또는 수면) 위의 점, m: x 오른쪽 · y 앞 (uRibbon -1 = 뒤쪽, 곧 입구 쪽으로 가는 길)
    float edge = 1. - smoothstep(.56, .62, abs(g.x));
    float span = smoothstep(.5, 1.1, g.y) * (1. - smoothstep(22., 34., g.y));
    float a = edge * span;
    vec3 jade = mix(vec3(.18, .49, .41), vec3(.56, .84, .75), smoothstep(2., 22., g.y));
    float rim = smoothstep(.50, .56, abs(g.x)) * a;
    float k = fract((g.y + abs(g.x) * .9) / 3.2 - uTime * .22);   // 화살 끝이 가는 쪽(앞)을 향한다
    float chev = (1. - smoothstep(.0, .05, abs(k - .5) - .045)) * (1. - smoothstep(.30, .42, abs(g.x))) * span;
    c = mix(c, jade, a * .78);
    c = mix(c, vec3(1.), max(rim * .85, chev * (.55 + .45 * sin(uTime * 3.14159))));
  }
  gl_FragColor = vec4(c, 1.);
}`;

// src: 파노라마 파일 · yaw0/pitch0: 처음 보는 방향(도, 오른쪽·위가 +) · h: 눈에서 바닥(물이 있으면 수면)까지 m
// dim: 0 = 원본 그대로 · 1 = 모식 보기(focus 밖을 흐리게) · focus: { yaw, pitch, w, h } 도
// interactive = false: 끌거나 키로 돌리지 않는다 (AR 화면 · 썸네일: 겹친 길과 이름표가 렌더와 어긋나지 않게)
function PanoView({ src, yaw0 = 0, pitch0 = -8, vfov = 86, ribbon = false, h = 1.6, drift = false, spots = [], dim = 0, focus = null, onYaw, onFail, interactive = true, testTag = true }) {
  const box = React.useRef(null), cv = React.useRef(null), spotBox = React.useRef(null);
  const S = React.useRef({ yaw: yaw0, pitch: pitch0, mix: 0, a: null, b: null, cache: new Map(), drag: null, raf: 0, t0: 0, dirty: true, gl: null, u: {}, src: null, dead: false, dimNow: dim }).current;
  const [pick, setPick] = React.useState(null);
  S.ribbon = ribbon; S.h = h; S.vfov = vfov; S.spots = spots; S.onYaw = onYaw; S.drift = drift; S.dim = dim; S.focus = focus;
  React.useEffect(() => { S.yaw = yaw0; S.pitch = pitch0; S.dirty = true; }, [yaw0, pitch0]);
  React.useEffect(() => { S.dirty = true; }, [dim, focus && focus.yaw, focus && focus.pitch, focus && focus.w, focus && focus.h, ribbon, h, vfov]);

  React.useEffect(() => {
    const canvas = cv.current;
    const gl = canvas.getContext('webgl2', { antialias: false }) || canvas.getContext('webgl', { antialias: false });
    if (!gl) { onFail && onFail(); return; }
    S.gl = gl; S.dead = false;
    const sh = (type, code) => { const s = gl.createShader(type); gl.shaderSource(s, code); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, PANO_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, PANO_FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { onFail && onFail(); return; }
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['uA', 'uB', 'uMix', 'uYaw', 'uPitch', 'uTan', 'uAspect', 'uRibbon', 'uH', 'uTime', 'uDim', 'uFocus'].forEach(n => { S.u[n] = gl.getUniformLocation(pr, n); });
    gl.uniform1i(S.u.uA, 0); gl.uniform1i(S.u.uB, 1);
    const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    S.t0 = performance.now();

    const place = () => {                                   // 표지를 보는 방향에 맞춰 옮긴다
      const el = spotBox.current; if (!el) return;
      const W = canvas.clientWidth, H = canvas.clientHeight, tan = Math.tan(S.vfov * Math.PI / 360);
      const yw = S.yaw * Math.PI / 180, pt = S.pitch * Math.PI / 180;
      Array.from(el.children).forEach((node, i) => {
        const sp = S.spots[i]; if (!sp) return;
        const a = sp.yaw * Math.PI / 180, b = sp.pitch * Math.PI / 180;
        let x = Math.cos(b) * Math.sin(a), y = Math.sin(b), z = Math.cos(b) * Math.cos(a);
        const x1 = x * Math.cos(yw) - z * Math.sin(yw), z1 = x * Math.sin(yw) + z * Math.cos(yw);
        const y2 = y * Math.cos(pt) - z1 * Math.sin(pt), z2 = y * Math.sin(pt) + z1 * Math.cos(pt);
        const on = z2 > .05;
        node.style.display = on ? 'flex' : 'none';
        if (on) node.style.transform = `translate(${(x1 / z2 / (tan * W / H) * .5 + .5) * W}px, ${(.5 - y2 / z2 / tan * .5) * H}px) translate(-50%, -100%)`;
      });
    };
    const frame = now => {
      if (S.dead) return;
      S.raf = requestAnimationFrame(frame);
      const dpr = Math.min(window.devicePixelRatio || 1, 2), W = Math.round(canvas.clientWidth * dpr), H = Math.round(canvas.clientHeight * dpr);
      if (W && H && (canvas.width !== W || canvas.height !== H)) { canvas.width = W; canvas.height = H; S.dirty = true; }
      if (S.b && S.mix < 1) { S.mix = Math.min(1, S.mix + (still ? 1 : .055)); S.dirty = true; if (S.mix >= 1) { S.a = S.b; S.b = null; S.mix = 0; } }
      if (Math.abs(S.dim - S.dimNow) > .004) { S.dimNow = still ? S.dim : S.dimNow + (S.dim - S.dimNow) * .16; S.dirty = true; } else S.dimNow = S.dim;
      const moving = !still && (S.ribbon || (S.drift && !S.drag));
      if (!S.a || !(S.dirty || moving)) return;
      S.dirty = false;
      const fo = S.focus, rad = Math.PI / 180;
      gl.uniform1f(S.u.uDim, S.dimNow);
      gl.uniform4f(S.u.uFocus, fo ? fo.yaw * rad : 0, fo ? fo.w * rad / 2 : 0, fo ? fo.pitch * rad : 0, fo ? fo.h * rad / 2 : 0);
      const t = (now - S.t0) / 1000, sway = S.drift && !S.drag && !still ? Math.sin(t / 3) * 5 : 0;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, S.a);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, S.b || S.a);
      gl.uniform1f(S.u.uMix, S.b ? S.mix : 0);
      gl.uniform1f(S.u.uYaw, (S.yaw + sway) * Math.PI / 180); gl.uniform1f(S.u.uPitch, S.pitch * Math.PI / 180);
      gl.uniform1f(S.u.uTan, Math.tan(S.vfov * Math.PI / 360)); gl.uniform1f(S.u.uAspect, canvas.width / canvas.height);
      gl.uniform1f(S.u.uRibbon, S.ribbon ? (S.ribbon < 0 ? -1 : 1) : 0); gl.uniform1f(S.u.uH, Math.max(.2, S.h)); gl.uniform1f(S.u.uTime, still ? 0 : t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      place();
    };
    S.raf = requestAnimationFrame(frame);
    return () => { S.dead = true; cancelAnimationFrame(S.raf); S.cache.forEach(tex => gl.deleteTexture(tex)); S.cache.clear(); S.a = S.b = null; S.src = null; const lose = gl.getExtension('WEBGL_lose_context'); lose && lose.loseContext(); };
  }, []);

  React.useEffect(() => {                                  // 이미지가 바뀌면 보던 방향 그대로 겹쳐 넘긴다
    const gl = S.gl; if (!gl || !src) return;
    S.src = src;
    const show = tex => { if (S.src !== src) return; if (!S.a) { S.a = tex; } else if (tex !== S.a) { S.b = tex; S.mix = 0; } S.dirty = true; };
    if (S.cache.has(src)) { show(S.cache.get(src)); return; }
    const im = new Image();
    im.onload = () => {
      if (S.dead) return;
      let source = im;
      const max = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const pot = n => (n & (n - 1)) === 0;
      const gl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
      if (im.width > max || (!gl2 && !(pot(im.width) && pot(im.height)))) {   // 너무 크거나 2의 거듭제곱이 아니면 맞춰 줄인다
        const w = Math.min(max, 4096), c = document.createElement('canvas'); c.width = w; c.height = w / 2;
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); source = c;
      }
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      S.cache.set(src, tex);
      if (S.cache.size > 6) { const old = Array.from(S.cache.keys()).find(k => S.cache.get(k) !== S.a && S.cache.get(k) !== S.b && k !== src); if (old) { gl.deleteTexture(S.cache.get(old)); S.cache.delete(old); } }
      show(tex);
    };
    im.onerror = () => { if (S.src === src) onFail && onFail(); };   // 못 불러오면 앞 장면을 그 이름표 아래 남겨 두지 않고 알린다
    im.src = src;
  }, [src]);

  const down = e => { S.drag = { x: e.clientX, y: e.clientY, yaw: S.yaw, pitch: S.pitch, moved: false }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {} };
  const move = e => {
    const d = S.drag; if (!d) return;
    const k = S.vfov / (cv.current.clientHeight || 1);
    if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 4) d.moved = true;
    S.yaw = d.yaw - (e.clientX - d.x) * k; S.pitch = Math.max(-70, Math.min(70, d.pitch + (e.clientY - d.y) * k));
    S.dirty = true; S.onYaw && S.onYaw(S.yaw);
  };
  const up = e => {
    const d = S.drag; S.drag = null;
    if (PANO.dev && d && !d.moved) {                       // 누른 화면 위치 → 장면 속 방향
      const r = cv.current.getBoundingClientRect(), tan = Math.tan(S.vfov * Math.PI / 360);
      let x = ((e.clientX - r.left) / r.width * 2 - 1) * (r.width / r.height) * tan, y = (1 - (e.clientY - r.top) / r.height * 2) * tan, z = 1;
      const n = Math.hypot(x, y, z); x /= n; y /= n; z /= n;
      const pt = S.pitch * Math.PI / 180, yw = S.yaw * Math.PI / 180;
      const y1 = y * Math.cos(pt) + z * Math.sin(pt), z1 = -y * Math.sin(pt) + z * Math.cos(pt);
      const x2 = x * Math.cos(yw) + z1 * Math.sin(yw), z2 = -x * Math.sin(yw) + z1 * Math.cos(yw);
      setPick({ yaw: Math.round(Math.atan2(x2, z2) * 1800 / Math.PI) / 10, pitch: Math.round(Math.asin(y1) * 1800 / Math.PI) / 10 });
    }
  };
  const key = e => {
    const step = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, 6], ArrowDown: [0, -6] }[e.key]; if (!step) return;
    e.preventDefault(); S.yaw += step[0]; S.pitch = Math.max(-70, Math.min(70, S.pitch + step[1])); S.dirty = true; S.onYaw && S.onYaw(S.yaw);
  };
  return (
    <div ref={box} {...(interactive ? { tabIndex: 0, 'aria-label': '360도 장면. 끌거나 화살표 키로 둘러볼 수 있어요', onKeyDown: key, onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up } : { 'aria-label': '1913 송정역시장 골목 장면' })} role="img"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', cursor: interactive ? 'grab' : 'default', touchAction: interactive ? 'none' : 'auto', pointerEvents: interactive ? 'auto' : 'none', outline: 'none', background: 'var(--disc, #E9E5DE)' }}>
      <canvas ref={cv} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
      <div ref={spotBox} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {spots.map(sp => (
          <div key={sp.label} style={{ position: 'absolute', left: 0, top: 0, display: 'none', flexDirection: 'column', alignItems: 'center' }}>
            <span className="nw" style={{ height: 34, padding: '0 15px', borderRadius: 17, display: 'flex', alignItems: 'center', gap: 7, fontSize: 15, fontWeight: 650, background: sp.dark ? '#17181B' : 'rgba(255,255,255,.95)', color: sp.dark ? '#fff' : '#17181B', boxShadow: '0 8px 18px -10px rgba(0,0,0,.45)' }}>
              {sp.amber && <i style={{ width: 7, height: 7, borderRadius: 4, background: '#EE9A2E', boxShadow: '0 0 0 3px rgba(238,154,46,.25)' }} />}{sp.label}
            </span>
            <i style={{ width: 1.5, height: 26, background: 'rgba(255,255,255,.95)' }} /><i style={{ width: 9, height: 9, borderRadius: 5, background: '#fff' }} />
          </div>
        ))}
      </div>
      {PANO.test && testTag && <span style={{ position: 'absolute', right: 12, top: 300, zIndex: 5, height: 22, padding: '0 8px', borderRadius: 6, display: 'flex', alignItems: 'center', background: 'rgba(23,24,27,.72)', color: '#fff', fontSize: 10.5, fontWeight: 600, pointerEvents: 'none' }}>시험 장면 · 배경데이터 아님</span>}
      {PANO.dev && pick && <span style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 5, height: 24, padding: '0 9px', borderRadius: 6, display: 'flex', alignItems: 'center', background: '#17181B', color: '#fff', fontSize: 11.5, fontVariantNumeric: 'tabular-nums' }}>{`{ yaw: ${pick.yaw}, pitch: ${pick.pitch} }`}</span>}
    </div>
  );
}

Object.assign(window, { PANO, PanoView, usePanoReady });
