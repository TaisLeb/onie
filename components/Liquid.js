"use client";

import { useEffect, useRef, useState } from "react";
import { RIPPLE_SIM_FRAG } from "../lib/waterRipple";

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
    // The phone composition uses a deliberate close crop of the static portrait.
    if (reduce || window.matchMedia("(max-width: 720px)").matches) return;

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

    let renderer, scene, camera, material, mesh, raf, ro, io, ripple;
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
        uBg: { value: null },
        uBgAspect: { value: 1.586 },
        uBgReady: { value: 0 },
        uSim: { value: null },
        uSimTexel: { value: new THREE.Vector2(1 / 256, 1 / 256) },
        uRippleReady: { value: 0 },
      };

      material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
      });
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(mesh);

      // The Quench heightfield runs separately; only the lilac background
      // samples it. The portrait texture keeps its original, undistorted UVs.
      if (renderer.capabilities.isWebGL2) {
        const size = 256;
        const rtOpts = {
          type: THREE.HalfFloatType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          depthBuffer: false,
          stencilBuffer: false,
        };
        const simMat = new THREE.ShaderMaterial({
          uniforms: {
            uPrev: { value: null },
            uTexel: { value: new THREE.Vector2(1 / size, 1 / size) },
            uDamping: { value: 0.982 },
            uMouse: { value: new THREE.Vector2(-9, -9) },
            uMousePrev: { value: new THREE.Vector2(-9, -9) },
            uInject: { value: 0 },
            uRad2: { value: 0.0016 },
          },
          vertexShader: VERT,
          fragmentShader: RIPPLE_SIM_FRAG,
        });
        const simScene = new THREE.Scene();
        const simMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMat);
        simScene.add(simMesh);
        ripple = {
          a: new THREE.WebGLRenderTarget(size, size, rtOpts),
          b: new THREE.WebGLRenderTarget(size, size, rtOpts),
          mat: simMat,
          mesh: simMesh,
          scene: simScene,
          target: new THREE.Vector2(-9, -9),
          prev: new THREE.Vector2(-9, -9),
          inject: 0,
        };
        uniforms.uRippleReady.value = 1;
      }

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

      new THREE.TextureLoader().load(
        "/img/hero-dream.webp",
        (tex) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          uniforms.uBg.value = tex;
          if (tex.image)
            uniforms.uBgAspect.value = tex.image.width / tex.image.height;
          uniforms.uBgReady.value = 1;
        },
        undefined,
        (err) => console.warn("[Liquid] background texture failed:", err)
      );

      // ---- pointer glow bloom ----
      const target = { x: 0.3, y: 0.55 };
      const eased = { x: 0.3, y: 0.55 };
      const onMove = (e) => {
        const t = e.touches ? e.touches[0] : e;
        target.x = t.clientX / window.innerWidth;
        target.y = 1 - t.clientY / window.innerHeight;
        if (ripple) {
          const r = mount.getBoundingClientRect();
          const nx = (t.clientX - r.left) / r.width;
          const ny = 1 - (t.clientY - r.top) / r.height;
          if (nx < 0 || nx > 1 || ny < 0 || ny > 1) {
            ripple.target.set(-9, -9);
          } else {
            if (ripple.target.x > -1) {
              const d = Math.hypot(nx - ripple.target.x, ny - ripple.target.y);
              ripple.inject = Math.min(1.2, ripple.inject + d * 14);
            }
            ripple.prev.copy(ripple.target);
            ripple.target.set(nx, ny);
          }
        }
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
        if (ripple) {
          const sim = ripple.mat.uniforms;
          sim.uPrev.value = ripple.a.texture;
          sim.uMouse.value.copy(ripple.target);
          sim.uMousePrev.value.copy(ripple.prev.x > -1 ? ripple.prev : ripple.target);
          sim.uInject.value = ripple.target.x > -1 ? ripple.inject : 0;
          renderer.setRenderTarget(ripple.b);
          renderer.render(ripple.scene, camera);
          renderer.setRenderTarget(null);
          const old = ripple.a;
          ripple.a = ripple.b;
          ripple.b = old;
          uniforms.uSim.value = ripple.a.texture;
          ripple.prev.copy(ripple.target);
          ripple.inject *= 0.6;
        }
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
        if (uniforms.uBg.value) uniforms.uBg.value.dispose();
        if (ripple) {
          ripple.a.dispose();
          ripple.b.dispose();
          ripple.mesh.geometry.dispose();
          ripple.mat.dispose();
        }
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
  uniform float uTime, uScroll, uImgAspect, uReady, uBgAspect, uBgReady, uRippleReady;
  uniform vec2 uRes, uMouse, uSimTexel;
  uniform sampler2D uTex, uBg, uSim;

  float blob(vec2 uv, vec2 c, float r){ float d = distance(uv,c); return exp(-(d*d)/r); }
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x),
               mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i=0;i<4;i++){ v += a*noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }
  vec2 coverUv(vec2 uv, float boxA, float imgA){
    vec2 r = uv - 0.5;
    if (boxA > imgA) r.y *= imgA / boxA; else r.x *= boxA / imgA;
    return r + 0.5;
  }

  void main(){
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = uv; p.x *= aspect;
    vec2 m = uMouse; m.x *= aspect;

    // ================= BACKGROUND: purple-dream gradient image =======
    // The Quench ripple normals and slow flow refract only the lilac image.
    // Her cut-out is sampled separately below, with untouched coordinates.
    vec2 buv = coverUv(uv, aspect, uBgAspect);
    vec3 waterN = vec3(0.0, 0.0, 1.0);
    vec2 liquidOffset = vec2(0.0);
    if (uRippleReady > 0.5) {
      float hL = texture2D(uSim, uv - vec2(uSimTexel.x,0.0)).r;
      float hR = texture2D(uSim, uv + vec2(uSimTexel.x,0.0)).r;
      float hD = texture2D(uSim, uv - vec2(0.0,uSimTexel.y)).r;
      float hU = texture2D(uSim, uv + vec2(0.0,uSimTexel.y)).r;
      waterN = normalize(vec3(hL-hR, hD-hU, 0.28));
      vec2 fuv = vec2(uv.x * aspect, uv.y) * 1.6;
      float flow = fbm(fuv + vec2(uTime * 0.02, uTime * 0.015));
      flow += 0.25 * fbm(fuv * 2.0 - uTime * 0.01);
      liquidOffset = waterN.xy * 0.025
        + vec2(flow - 0.48, fbm(fuv + 9.0 + uTime * 0.012) - 0.48) * 0.018;
    }
    vec3 bgImg = texture2D(uBg, buv + liquidOffset).rgb;
    vec3 bg = mix(vec3(0.74, 0.65, 0.84), bgImg, uBgReady); // lilac until loaded
    if (uRippleReady > 0.5) {
      float refr = (waterN.x + waterN.y) * 0.5;
      bg += vec3(0.16, 0.12, 0.19) * refr;
      float spec = pow(max(dot(waterN, normalize(vec3(0.5,0.6,0.8))), 0.0), 16.0);
      bg += vec3(1.0, 0.98, 1.0) * spec * 0.18;
    }
    bg += (bg) * blob(p, m, 0.10) * 0.12;                   // soft cursor lift
    bg = mix(bg, bg * 0.9, uScroll * 0.12);                 // settle slightly on scroll

    // ================= foreground: her transparent cut-out ===========
    vec2 puv = coverUv(uv, aspect, uImgAspect);
    puv.y -= 0.05; // crop more from the top, revealing more of the lower portrait
    vec4 tex = texture2D(uTex, vec2(puv.x, puv.y));
    float ready = uReady;
    float a = clamp(tex.a, 0.0, 1.0) * ready;                     // her silhouette (alpha)
    vec3 her = tex.rgb;
    float lum = dot(her, vec3(0.299, 0.587, 0.114));

    // show her at her true exposure — no dimming, no wash
    vec3 herCol = clamp(her, 0.0, 1.0);

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

    gl_FragColor = vec4(col, 1.0);
  }
`;
