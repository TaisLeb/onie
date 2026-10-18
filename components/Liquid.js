"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero background: a living lilac glow-field with the (transparent-cutout)
 * portrait composited on the right, feathered into the glow. The pointer
 * gently blooms the glow. Falls back to the CSS gradient + static portrait
 * (`.hero__portrait`) when WebGL is unavailable.
 */
export default function Liquid() {
  const mountRef = useRef(null);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    let supported = false;
    try {
      const test = document.createElement("canvas");
      supported = !!(
        window.WebGLRenderingContext &&
        (test.getContext("webgl") || test.getContext("experimental-webgl"))
      );
    } catch {
      supported = false;
    }
    if (!supported) return;

    let renderer, scene, camera, material, mesh, raf, ro, io;
    let disposed = false;
    const mount = mountRef.current;

    const start = (THREE) => {
      if (disposed || !mount) return;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          failIfMajorPerformanceCaveat: false,
        });
      } catch (err) {
        console.warn("[Liquid] WebGL renderer failed, using fallback:", err);
        return;
      }
      const glctx = renderer.getContext();
      if (!glctx || glctx.isContextLost()) {
        console.warn("[Liquid] WebGL context unavailable, using fallback");
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      mount.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const uniforms = {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(w, h) },
        uScroll: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.3, 0.55) },
        uTex: { value: null },
        uImgAspect: { value: 1.333 },
        uReady: { value: 0 },
      };

      material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
      });
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(mesh);

      setWebgl(true);

      new THREE.TextureLoader().load(
        "/img/onie-hero-cutout.webp",
        (tex) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          uniforms.uTex.value = tex;
          if (tex.image)
            uniforms.uImgAspect.value = tex.image.width / tex.image.height;
          uniforms.uReady.value = 1;
        },
        undefined,
        (err) => console.warn("[Liquid] portrait texture failed:", err)
      );

      // ---- pointer glow bloom ----
      const target = { x: 0.3, y: 0.55 };
      const eased = { x: 0.3, y: 0.55 };
      const onMove = (e) => {
        const t = e.touches ? e.touches[0] : e;
        target.x = t.clientX / window.innerWidth;
        target.y = 1 - t.clientY / window.innerHeight;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      const onScroll = () => {
        const max = document.body.scrollHeight - window.innerHeight;
        uniforms.uScroll.value = max > 0 ? window.scrollY / max : 0;
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      const onResize = () => {
        if (!mount) return;
        const nw = mount.clientWidth || window.innerWidth;
        const nh = mount.clientHeight || window.innerHeight;
        renderer.setSize(nw, nh, false);
        uniforms.uRes.value.set(nw, nh);
      };
      ro = new ResizeObserver(onResize);
      ro.observe(mount);

      const t0 = performance.now();
      let running = false;
      let firstRendered = false;

      const loop = () => {
        if (!running) return;
        raf = requestAnimationFrame(loop);
        uniforms.uTime.value = (performance.now() - t0) / 1000;
        eased.x += (target.x - eased.x) * 0.12;
        eased.y += (target.y - eased.y) * 0.12;
        uniforms.uMouse.value.set(eased.x, eased.y);
        renderer.render(scene, camera);
        if (!firstRendered) {
          firstRendered = true;
          document.documentElement.classList.add("webgl-on");
        }
      };
      const startLoop = () => {
        if (running) return;
        running = true;
        raf = requestAnimationFrame(loop);
      };
      const stopLoop = () => {
        running = false;
        cancelAnimationFrame(raf);
      };
      mount._stop = stopLoop;

      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !document.hidden) startLoop();
          else stopLoop();
        },
        { threshold: 0 }
      );
      io.observe(mount);
      const onVis = () => {
        if (document.hidden) stopLoop();
        else if (mount.getBoundingClientRect().bottom > 0) startLoop();
      };
      document.addEventListener("visibilitychange", onVis);

      renderer.domElement.addEventListener("webglcontextlost", (e) => {
        e.preventDefault();
        console.warn("[Liquid] context lost → fallback");
        document.documentElement.classList.remove("webgl-on");
        setWebgl(false);
        stopLoop();
      });

      startLoop();

      mount._cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("visibilitychange", onVis);
        io && io.disconnect();
        ro && ro.disconnect();
        stopLoop();
        if (uniforms.uTex.value) uniforms.uTex.value.dispose();
        mesh && mesh.geometry.dispose();
        material && material.dispose();
        renderer && renderer.dispose();
        if (renderer && renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    };

    import("three")
      .then((THREE) => start(THREE))
      .catch((err) => {
        console.warn("[Liquid] three.js failed to load, using fallback:", err);
      });

    return () => {
      disposed = true;
      document.documentElement.classList.remove("webgl-on");
      if (mount && mount._cleanup) mount._cleanup();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="hero__canvas"
      style={{ opacity: webgl ? 1 : 0, transition: "opacity 1.2s ease" }}
      aria-hidden="true"
    />
  );
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime, uScroll, uImgAspect, uReady;
  uniform vec2 uRes, uMouse;
  uniform sampler2D uTex;

  float blob(vec2 uv, vec2 c, float r){ float d = distance(uv,c); return exp(-(d*d)/r); }
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  vec2 coverUv(vec2 uv, float boxA, float imgA){
    vec2 r = uv - 0.5;
    if (boxA > imgA) r.y *= imgA / boxA; else r.x *= boxA / imgA;
    return r + 0.5;
  }

  void main(){
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = uv; p.x *= aspect;
    float t = uTime * 1.15;  // background motion clock (faster, clearly perceptible)

    // ---- drifting lilac light-pools behind her (travel noticeably) ----
    float f = 0.0;
    f += blob(p, vec2(aspect*(0.22 + 0.16*sin(t*0.50)),       0.55 + 0.18*cos(t*0.40)), 0.17);
    f += blob(p, vec2(aspect*(0.10 + 0.14*cos(t*0.45 + 1.0)), 0.28 + 0.16*sin(t*0.55)), 0.14) * 0.9;
    f += blob(p, vec2(aspect*(0.30 + 0.15*sin(t*0.40 + 2.0)), 0.82 + 0.13*cos(t*0.50)), 0.13) * 0.85;
    f += blob(p, vec2(aspect*(0.86 + 0.13*cos(t*0.48)),       0.42 + 0.17*sin(t*0.44)), 0.15) * 0.85;
    f += blob(p, vec2(aspect*(0.72 + 0.15*sin(t*0.42 + 0.5)), 0.80 + 0.14*cos(t*0.60)), 0.13) * 0.8;
    vec2 m = uMouse; m.x *= aspect;
    f += blob(p, m, 0.06) * 0.5;

    float v = clamp(f, 0.0, 1.6);

    // ================= animated lavender BACKGROUND =================
    // her cut-out sits on top of this; the field drifts behind her, echoing
    // the soft lilac studio backdrop but alive.
    vec3 lavMid  = vec3(0.66, 0.55, 0.79);
    vec3 lavHi   = vec3(0.87, 0.80, 0.93);
    vec3 lavDeep = vec3(0.47, 0.35, 0.66);
    vec3 bg = mix(lavDeep, lavMid, smoothstep(-0.10, 0.90, uv.y)); // soft vertical base
    bg = mix(bg, lavHi, smoothstep(0.10, 0.95, v) * 0.7);          // gentle drifting pools

    // dappled light slowly drifting across the lavender (like sun through
    // leaves) — the main, clearly-visible background motion.
    float d1 = sin(uv.x * 4.0 + t * 0.9 + sin(uv.y * 3.5 + t * 0.6) * 2.5);
    float d2 = sin(uv.y * 4.5 - t * 0.7 + cos(uv.x * 4.0 - t * 0.5) * 2.2);
    float dap = 0.5 + 0.5 * (d1 * 0.55 + d2 * 0.45);
    dap = smoothstep(0.18, 0.9, dap);                              // crisper dapples
    bg = mix(bg, lavDeep, (1.0 - dap) * 0.30);                     // drifting shadows
    bg = mix(bg, lavHi,   dap * 0.20);                             // drifting light

    // ---- iridescent prism rays (soft pastel suncatcher) ----
    // soft diagonal spectral streaks flow in from the left, gently warped so
    // they drift like refracted light; each band carries a different hue.
    // flowing, water-like domain warp (layered sines → organic ribbons that
    // bend and drift rather than straight lines)
    // layered, strongly-warped flow so the shapes read as organic liquid
    // forms rather than straight bands
    float w1 = sin(uv.x * 2.8 + t * 0.55 + sin(uv.y * 2.4 - t * 0.38) * 2.6);
    float w2 = sin(uv.y * 3.2 - t * 0.48 + cos(uv.x * 2.1 + t * 0.34) * 2.4);
    float w3 = sin((uv.x + uv.y) * 2.0 + t * 0.30 + sin(uv.x * 2.7 - uv.y * 1.8) * 2.2);
    float w4 = sin((uv.x - uv.y) * 2.6 - t * 0.26 + cos(uv.y * 3.1 + t * 0.2) * 2.0);
    float flow = w1 * 0.42 + w2 * 0.28 + w3 * 0.18 + w4 * 0.12;    // richly warped flow field
    float rayCoord = (uv.x * 0.5 - uv.y * 0.4) * 3.0 + flow * 6.0; // flow dominates → organic shapes
    float ray = 0.5 + 0.5 * sin(rayCoord);                        // curvy, liquid ribbons
    ray = pow(ray, 2.4);                                          // defined, soft-edged forms
    // spectral colour cycles along the ribbons (rainbow separation)
    vec3 spectrum = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + rayCoord * 0.42 + t * 0.1));
    spectrum = mix(vec3(0.97, 0.95, 1.0), spectrum, 0.78);        // saturated but still pastel
    float irMask = ray * 0.72;                                    // ribbon intensity (knob)
    irMask *= smoothstep(1.25, -0.1, uv.x);                       // strongest on the left, fading across
    bg = 1.0 - (1.0 - bg) * (1.0 - spectrum * irMask);            // screen-blend the spectral light

    bg = mix(bg, lavDeep, uScroll * 0.06);

    // ================= foreground: her transparent cut-out ===========
    vec2 puv = coverUv(uv, aspect, uImgAspect);
    vec4 tex = texture2D(uTex, vec2(puv.x, puv.y));
    float ready = uReady;
    float a = clamp(tex.a, 0.0, 1.0) * ready;                     // her silhouette (alpha)
    vec3 her = tex.rgb;
    float lum = dot(her, vec3(0.299, 0.587, 0.114));

    // tame her high-key exposure so skin reads with depth, not washed-out
    vec3 herCol = her * 0.82;
    herCol = pow(clamp(herCol, 0.0, 1.0), vec3(1.10));

    // ---- ONE soft highlight that travels continuously across her ----
    float phase = fract(uTime * 0.09);
    float bandCoord = uv.x * 0.5 + (1.0 - uv.y) * 0.5;
    float sweep = exp(-pow((bandCoord - (phase * 2.0 - 0.5)) * 3.0, 2.0));
    float room = mix(0.5, 1.0, smoothstep(0.97, 0.45, lum));
    sweep *= room;
    herCol += herCol * sweep * 0.15;                             // lift in her own tones
    herCol += vec3(0.82, 0.72, 0.96) * sweep * 0.04;             // faint lilac in the light

    // ---- soft radiant glow that follows the cursor across her skin ----
    float md = distance(vec2(uv.x * aspect, uv.y), vec2(uMouse.x * aspect, uMouse.y));
    float mouseGlow = exp(-md * md / 0.022);
    float mroom = mix(0.55, 1.0, smoothstep(0.97, 0.45, lum));
    mouseGlow *= mroom;
    herCol += herCol * mouseGlow * 0.18;                         // gentle lift under the cursor
    herCol += vec3(0.90, 0.83, 0.98) * mouseGlow * 0.05;         // soft lilac-dewy bloom

    // ---- "freshly moisturised" dewy sheen inside the cursor pool ----
    float hiSkin = smoothstep(0.55, 0.92, lum);                  // the brightest skin high points
    // glossy specular bloom — skin looks wet/plumped where light catches
    herCol += vec3(1.0, 0.985, 0.95) * mouseGlow * hiSkin * 0.25;
    // whisper of pearly iridescence in the shine (luxe balm, not plain gloss)
    vec3 pearl = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + lum * 2.0 + uTime * 0.2));
    herCol += pearl * mouseGlow * hiSkin * 0.03;

    // ================= composite her over the moving field ===========
    vec3 col = mix(bg, herCol, a);

    // ---- subtle veil behind the heading (left) for text contrast ----
    // only lifts the DARK areas (e.g. hair) toward a soft lilac so the dark
    // navy heading stays legible; bright areas are left untouched.
    float veil = (1.0 - smoothstep(0.52, 0.82, uv.x)) * 0.192 * ready;
    col = mix(col, max(col, vec3(0.88, 0.83, 0.92)), veil);

    gl_FragColor = vec4(col, 1.0);
  }
`;
