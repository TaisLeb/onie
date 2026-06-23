"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero background: a soft lilac glow-field with a portrait on the right that
 * the cursor permanently reveals (scratch-to-reveal). The reveal mask is
 * accumulated in a ping-pong render target so painted areas stay revealed.
 * No-cursor devices get a slow auto-reveal sweep. Falls back to the CSS
 * gradient + static portrait (`.hero__portrait`) when WebGL is unavailable.
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

    let renderer, camera, ro, io, raf;
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
      let w = mount.clientWidth || window.innerWidth;
      let h = mount.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      mount.appendChild(renderer.domElement);

      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const quad = new THREE.PlaneGeometry(2, 2);

      // ---- ping-pong render targets for the persistent reveal mask ----
      const rtOpts = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
        stencilBuffer: false,
      };
      const mw = () => Math.max(256, Math.floor(w * 0.6));
      const mh = () => Math.max(256, Math.floor(h * 0.6));
      let rtA = new THREE.WebGLRenderTarget(mw(), mh(), rtOpts);
      let rtB = new THREE.WebGLRenderTarget(mw(), mh(), rtOpts);
      const clearRT = (rt) => {
        renderer.setRenderTarget(rt);
        renderer.setClearColor(0x000000, 1);
        renderer.clear();
      };
      clearRT(rtA);
      clearRT(rtB);
      renderer.setRenderTarget(null);

      // paint pass — accumulate the brush into the previous mask (max = stays)
      const paintMat = new THREE.ShaderMaterial({
        uniforms: {
          uPrev: { value: null },
          uMouse: { value: new THREE.Vector2(0.74, 0.55) },
          uPrevMouse: { value: new THREE.Vector2(0.74, 0.55) },
          uAspect: { value: w / h },
          uRadius: { value: 0.14 },
        },
        vertexShader: VERT,
        fragmentShader: PAINT,
      });
      const paintScene = new THREE.Scene();
      paintScene.add(new THREE.Mesh(quad, paintMat));

      // display pass — glow + portrait revealed by the mask
      const trail = []; // unused; kept tiny for compatibility
      const dispMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: new THREE.Vector2(w, h) },
          uScroll: { value: 0 },
          uTex: { value: null },
          uImgAspect: { value: 0.75 },
          uReady: { value: 0 },
          uMask: { value: null },
        },
        vertexShader: VERT,
        fragmentShader: DISPLAY,
      });
      const mainScene = new THREE.Scene();
      mainScene.add(new THREE.Mesh(quad, dispMat));

      setWebgl(true);

      new THREE.TextureLoader().load(
        "/img/hero-face.jpg",
        (tex) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          dispMat.uniforms.uTex.value = tex;
          if (tex.image)
            dispMat.uniforms.uImgAspect.value =
              tex.image.width / tex.image.height;
          dispMat.uniforms.uReady.value = 1;
        },
        undefined,
        (err) => console.warn("[Liquid] portrait texture failed:", err)
      );

      // ---- pointer ----
      const canHover = window.matchMedia("(hover: hover)").matches;
      const target = { x: 0.74, y: 0.55 };
      const eased = { x: 0.74, y: 0.55 };
      const prev = { x: 0.74, y: 0.55 };
      let auto = true; // brief auto-reveal hint on load (and forever on touch)
      const onMove = (e) => {
        const t = e.touches ? e.touches[0] : e;
        target.x = t.clientX / window.innerWidth;
        target.y = 1 - t.clientY / window.innerHeight;
        auto = false;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("touchmove", onMove, { passive: true });
      // stop the auto hint on desktop after a few seconds even without movement
      const autoTimer = setTimeout(() => {
        if (canHover) auto = false;
      }, 3200);

      const onScroll = () => {
        const max = document.body.scrollHeight - window.innerHeight;
        dispMat.uniforms.uScroll.value = max > 0 ? window.scrollY / max : 0;
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      const onResize = () => {
        if (!mount) return;
        w = mount.clientWidth || window.innerWidth;
        h = mount.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        dispMat.uniforms.uRes.value.set(w, h);
        paintMat.uniforms.uAspect.value = w / h;
        rtA.setSize(mw(), mh());
        rtB.setSize(mw(), mh());
        clearRT(rtA);
        clearRT(rtB);
        renderer.setRenderTarget(null);
      };
      ro = new ResizeObserver(onResize);
      ro.observe(mount);

      const t0 = performance.now();
      let running = false;
      let firstRendered = false;

      const loop = () => {
        if (!running) return;
        raf = requestAnimationFrame(loop);
        const time = (performance.now() - t0) / 1000;
        dispMat.uniforms.uTime.value = time;

        if (auto) {
          target.x = 0.5 + 0.3 * Math.sin(time * 0.55);
          target.y = 0.5 + 0.32 * Math.sin(time * 0.4 + 1.3);
        }
        prev.x = eased.x;
        prev.y = eased.y;
        eased.x += (target.x - eased.x) * 0.14;
        eased.y += (target.y - eased.y) * 0.14;

        // paint pass: rtA(prev) -> rtB
        paintMat.uniforms.uPrev.value = rtA.texture;
        paintMat.uniforms.uPrevMouse.value.set(prev.x, prev.y);
        paintMat.uniforms.uMouse.value.set(eased.x, eased.y);
        renderer.setRenderTarget(rtB);
        renderer.render(paintScene, camera);
        renderer.setRenderTarget(null);
        const tmp = rtA;
        rtA = rtB;
        rtB = tmp;

        // display
        dispMat.uniforms.uMask.value = rtA.texture;
        renderer.render(mainScene, camera);

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
        clearTimeout(autoTimer);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("visibilitychange", onVis);
        io && io.disconnect();
        ro && ro.disconnect();
        stopLoop();
        if (dispMat.uniforms.uTex.value) dispMat.uniforms.uTex.value.dispose();
        rtA.dispose();
        rtB.dispose();
        quad.dispose();
        paintMat.dispose();
        dispMat.dispose();
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

/* accumulate the brush stroke into the previous mask (max keeps it revealed) */
const PAINT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPrev;
  uniform vec2 uMouse;
  uniform vec2 uPrevMouse;
  uniform float uAspect;
  uniform float uRadius;

  float segDist(vec2 p, vec2 a, vec2 b){
    vec2 pa = p - a, ba = b - a;
    float hh = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * hh);
  }

  void main(){
    vec2 p = vUv * vec2(uAspect, 1.0);
    vec2 a = uPrevMouse * vec2(uAspect, 1.0);
    vec2 b = uMouse * vec2(uAspect, 1.0);
    float d = segDist(p, a, b);
    float add = smoothstep(uRadius, uRadius * 0.35, d);
    float prev = texture2D(uPrev, vUv).r;
    gl_FragColor = vec4(vec3(max(prev, add)), 1.0);
  }
`;

const DISPLAY = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime, uScroll, uImgAspect, uReady;
  uniform vec2 uRes;
  uniform sampler2D uTex;
  uniform sampler2D uMask;

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

    // ---- lilac glow-field ----
    float f = 0.0;
    f += blob(p, vec2(aspect*(0.22+0.05*sin(t*0.7)), 0.64+0.05*cos(t*0.5)), 0.12);
    f += blob(p, vec2(aspect*(0.42+0.05*cos(t*0.6)), 0.40+0.06*sin(t*0.8)), 0.10) * 0.9;
    f += blob(p, vec2(aspect*(0.30+0.06*sin(t*0.4+1.7)), 0.26+0.04*cos(t*0.9)), 0.075) * 0.8;
    f += blob(p, vec2(aspect*(0.12+0.05*cos(t*0.5+2.1)), 0.20+0.05*sin(t*0.6)), 0.07) * 0.7;
    f *= 1.0 + 0.06 * sin(uv.x*5.0+t*2.0) * sin(uv.y*4.0-t*1.3);

    vec3 butter = vec3(0.945,0.925,0.713);
    vec3 cream  = vec3(0.984,0.972,0.905);
    vec3 lilac  = vec3(0.686,0.561,0.843);
    vec3 lilacHi= vec3(0.835,0.745,0.953);
    vec3 violet = vec3(0.478,0.322,0.753);
    vec3 base = mix(butter, cream, smoothstep(0.15, 1.05, uv.y*0.7+0.15));
    float v = clamp(f, 0.0, 1.6);
    vec3 glow = base;
    glow = mix(glow, mix(butter,lilac,0.5), smoothstep(0.12,0.45,v));
    glow = mix(glow, lilac, smoothstep(0.40,0.95,v));
    glow = mix(glow, lilacHi, smoothstep(0.85,1.25,v));
    glow = mix(glow, violet, smoothstep(1.15,1.55,v)*0.3);
    glow = mix(glow, lilac, uScroll*0.1);

    // ---- reveal from accumulated mask (full-bleed) ----
    float painted = texture2D(uMask, uv).r;
    float reveal = clamp(painted * uReady, 0.0, 1.0);

    // ---- portrait covers the whole hero (undistorted) ----
    vec2 puv = coverUv(uv, aspect, uImgAspect);
    vec3 portrait = texture2D(uTex, vec2(puv.x, puv.y)).rgb;

    float m = smoothstep(0.10, 0.5, reveal);
    vec3 col = mix(glow, portrait, m);

    // soft lilac sheen along the reveal edge so it melts into the glow
    float edge = smoothstep(0.08, 0.3, reveal) * (1.0 - smoothstep(0.42, 0.72, reveal));
    col += lilacHi * edge * 0.07;

    gl_FragColor = vec4(col, 1.0);
  }
`;
