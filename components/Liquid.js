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
        uImgAspect: { value: 1.3 },
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
        "/img/hero-face.webp",
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
  vec2 coverUv(vec2 uv, float boxA, float imgA){
    vec2 r = uv - 0.5;
    if (boxA > imgA) r.y *= imgA / boxA; else r.x *= boxA / imgA;
    return r + 0.5;
  }

  void main(){
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = uv; p.x *= aspect;
    float t = uTime * 0.16;

    // ---- lilac glow-field spread across the whole hero + pointer bloom ----
    float f = 0.0;
    f += blob(p, vec2(aspect*(0.20+0.05*sin(t*0.7)), 0.64+0.05*cos(t*0.5)), 0.13);
    f += blob(p, vec2(aspect*(0.40+0.05*cos(t*0.6)), 0.40+0.06*sin(t*0.8)), 0.11) * 0.9;
    f += blob(p, vec2(aspect*(0.30+0.06*sin(t*0.4+1.7)), 0.26+0.04*cos(t*0.9)), 0.08) * 0.8;
    f += blob(p, vec2(aspect*(0.12+0.05*cos(t*0.5+2.1)), 0.20+0.05*sin(t*0.6)), 0.07) * 0.7;
    // right-side blooms so the glow also animates behind the portrait cutout
    f += blob(p, vec2(aspect*(0.66+0.06*sin(t*0.5+3.0)), 0.52+0.06*cos(t*0.7)), 0.12) * 0.85;
    f += blob(p, vec2(aspect*(0.84+0.05*cos(t*0.6+1.0)), 0.70+0.05*sin(t*0.5)), 0.10) * 0.8;
    f += blob(p, vec2(aspect*(0.74+0.06*sin(t*0.45+0.4)), 0.28+0.05*cos(t*0.85)), 0.085) * 0.75;
    vec2 m = uMouse; m.x *= aspect;
    f += blob(p, m, 0.05) * 0.55;
    f *= 1.0 + 0.06 * sin(uv.x*5.0+t*2.0) * sin(uv.y*4.0-t*1.3);

    vec3 butter = vec3(0.945,0.925,0.713);
    vec3 cream  = vec3(0.984,0.972,0.905);
    vec3 lilac  = vec3(0.686,0.561,0.843);
    vec3 lilacHi= vec3(0.835,0.745,0.953);
    vec3 violet = vec3(0.478,0.322,0.753);
    vec3 baseC = mix(butter, cream, smoothstep(0.15, 1.05, uv.y*0.7+0.15));
    float v = clamp(f, 0.0, 1.6);
    vec3 glow = baseC;
    glow = mix(glow, mix(butter,lilac,0.5), smoothstep(0.12,0.45,v));
    glow = mix(glow, lilac, smoothstep(0.40,0.95,v));
    glow = mix(glow, lilacHi, smoothstep(0.85,1.25,v));
    glow = mix(glow, violet, smoothstep(1.15,1.55,v)*0.3);
    glow = mix(glow, lilac, uScroll*0.1);

    // ---- portrait composited on the right (adaptive split) ----
    float rx0 = mix(0.06, 0.40, smoothstep(0.85, 1.35, aspect));
    vec2 local = vec2((uv.x - rx0) / (1.0 - rx0), uv.y);
    float regAsp = ((1.0 - rx0) * uRes.x) / uRes.y;
    vec2 puv = coverUv(local, regAsp, uImgAspect);
    vec4 tex = texture2D(uTex, vec2(puv.x, puv.y));
    float gate = smoothstep(rx0 - 0.05, rx0 + 0.07, uv.x);
    float a = clamp(tex.a * gate * uReady, 0.0, 1.0);

    // ---- "glowing skin" light effect on her face ----
    vec3 her = tex.rgb;
    float lum = dot(her, vec3(0.299, 0.587, 0.114));
    // diagonal light sweep travelling across her skin (matched to bg speed)
    float phase = fract(uTime * 0.16);
    float bandCoord = uv.x * 0.55 + (1.0 - uv.y) * 0.45;
    float sweep = exp(-pow((bandCoord - (phase * 1.8 - 0.4)) * 5.0, 2.0));
    // dewy highlight shimmer, gently pulsing on the brightest skin
    float hi = smoothstep(0.5, 0.92, lum);
    her += her * sweep * (0.14 + 0.18 * lum);                 // subtle sweep, more on highlights
    her += vec3(1.0, 0.98, 0.94) * hi * (0.05 + 0.03 * sin(uTime * 2.0)); // gentle dewy glow
    her += vec3(0.83, 0.74, 0.95) * sweep * hi * 0.08;        // faint lilac iridescence in the sweep

    // soft radiant glow that follows the cursor across her skin (subtle)
    vec2 mm = uMouse;
    float md = distance(vec2(uv.x * aspect, uv.y), vec2(mm.x * aspect, mm.y));
    float mouseGlow = exp(-md * md / 0.024);
    her += her * mouseGlow * (0.12 + 0.13 * lum);             // gently lift skin under the cursor
    her += vec3(1.0, 0.98, 0.94) * hi * mouseGlow * 0.09;     // soft dewy highlight
    her += vec3(0.83, 0.74, 0.95) * mouseGlow * 0.05;         // faint lilac iridescence

    vec3 col = mix(glow, her, a);

    // soft outer aura around her, echoing the radiance into the glow
    col += vec3(0.86, 0.78, 0.96) * a * (1.0 - a) * (0.12 + 0.08 * sweep);

    gl_FragColor = vec4(col, 1.0);
  }
`;
