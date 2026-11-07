"use client";

import { useEffect, useRef } from "react";
import { RIPPLE_SIM_FRAG } from "../lib/waterRipple";

/**
 * Subtle interactive water surface for the Featured Product lilac panel.
 * Follows the ripple-simulation architecture: a damped wave-equation
 * heightfield in ping-pong half-float render targets (interactive ripples on
 * pointer move) + a slow procedural base flow, composited to a gentle lilac
 * refraction so the copy stays fully readable. Pauses off-screen / hidden /
 * reduced-motion. Falls back to the CSS lilac background if WebGL2 is absent.
 */
export default function Water() {
  const mountRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mount = mountRef.current;
    const host = mount && mount.parentElement; // the .spotlight panel
    if (!mount || !host) return;

    let renderer, rtA, rtB, simScene, dispScene, simCam, simMat, dispMat, dispMesh, simMesh;
    let raf, ro, io, disposed = false, running = false;

    const start = (THREE) => {
      if (disposed) return;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch (e) {
        return;
      }
      if (!renderer.capabilities.isWebGL2) {
        renderer.dispose();
        return; // keep the static CSS lilac background
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      let w = host.clientWidth || 800;
      let h = host.clientHeight || 500;
      renderer.setSize(w, h, false);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      const SIM = 256;
      const rtOpts = {
        type: THREE.HalfFloatType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
        stencilBuffer: false,
      };
      rtA = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts);
      rtB = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts);

      simCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const quad = new THREE.PlaneGeometry(2, 2);

      simMat = new THREE.ShaderMaterial({
        uniforms: {
          uPrev: { value: null },
          uTexel: { value: new THREE.Vector2(1 / SIM, 1 / SIM) },
          uDamping: { value: 0.982 },
          uMouse: { value: new THREE.Vector2(-9, -9) },
          uMousePrev: { value: new THREE.Vector2(-9, -9) },
          uInject: { value: 0 },
          uRad2: { value: 0.0016 },
        },
        vertexShader: VERT,
        fragmentShader: RIPPLE_SIM_FRAG,
      });
      simMesh = new THREE.Mesh(quad, simMat);
      simScene = new THREE.Scene();
      simScene.add(simMesh);

      dispMat = new THREE.ShaderMaterial({
        uniforms: {
          uSim: { value: null },
          uTexel: { value: new THREE.Vector2(1 / SIM, 1 / SIM) },
          uTime: { value: 0 },
          uAspect: { value: w / h },
        },
        vertexShader: VERT,
        fragmentShader: DISP_FRAG,
      });
      dispMesh = new THREE.Mesh(quad, dispMat);
      dispScene = new THREE.Scene();
      dispScene.add(dispMesh);

      // ---- pointer (relative to the panel) + velocity-scaled injection ----
      const target = new THREE.Vector2(-9, -9);
      const prev = new THREE.Vector2(-9, -9);
      let inject = 0;
      const onMove = (e) => {
        const r = host.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width;
        const ny = 1 - (e.clientY - r.top) / r.height;
        if (target.x > -1) {
          const d = Math.hypot(nx - target.x, ny - target.y);
          inject = Math.min(1.2, inject + d * 14.0);
        }
        prev.copy(target);
        target.set(nx, ny);
      };
      const onLeave = () => target.set(-9, -9);
      host.addEventListener("pointermove", onMove, { passive: true });
      host.addEventListener("pointerleave", onLeave, { passive: true });

      const onResize = () => {
        w = host.clientWidth || w;
        h = host.clientHeight || h;
        renderer.setSize(w, h, false);
        dispMat.uniforms.uAspect.value = w / h;
      };
      ro = new ResizeObserver(onResize);
      ro.observe(host);

      const t0 = performance.now();
      const step = () => {
        // advance the heightfield (fixed single step / frame)
        simMat.uniforms.uPrev.value = rtA.texture;
        simMat.uniforms.uMouse.value.copy(target);
        simMat.uniforms.uMousePrev.value.copy(prev.x > -1 ? prev : target);
        simMat.uniforms.uInject.value = target.x > -1 ? inject : 0;
        renderer.setRenderTarget(rtB);
        renderer.render(simScene, simCam);
        renderer.setRenderTarget(null);
        const tmp = rtA; rtA = rtB; rtB = tmp;
        prev.copy(target);
        inject *= 0.6; // injection decays quickly when the pointer stops
      };

      const loop = () => {
        if (!running) return;
        raf = requestAnimationFrame(loop);
        step();
        dispMat.uniforms.uSim.value = rtA.texture;
        dispMat.uniforms.uTime.value = (performance.now() - t0) / 1000;
        renderer.render(dispScene, simCam);
      };
      const startLoop = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
      const stopLoop = () => { running = false; cancelAnimationFrame(raf); };

      if (reduce) {
        // single static frame, no motion / injection
        dispMat.uniforms.uSim.value = rtA.texture;
        renderer.render(dispScene, simCam);
      }

      io = new IntersectionObserver(
        ([en]) => { if (en.isIntersecting && !document.hidden) startLoop(); else stopLoop(); },
        { threshold: 0 }
      );
      io.observe(host);
      const onVis = () => { if (document.hidden) stopLoop(); else if (host.getBoundingClientRect().bottom > 0) startLoop(); };
      document.addEventListener("visibilitychange", onVis);

      renderer.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); stopLoop(); });

      mount._cleanup = () => {
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
        document.removeEventListener("visibilitychange", onVis);
        io && io.disconnect();
        ro && ro.disconnect();
        stopLoop();
        rtA && rtA.dispose();
        rtB && rtB.dispose();
        quad.dispose();
        simMat && simMat.dispose();
        dispMat && dispMat.dispose();
        renderer && renderer.dispose();
        if (renderer && renderer.domElement && renderer.domElement.parentNode)
          renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
    };

    import("three").then((THREE) => start(THREE)).catch(() => {});

    return () => { disposed = true; if (mount && mount._cleanup) mount._cleanup(); };
  }, []);

  return <div ref={mountRef} className="spotlight__bg water" aria-hidden="true" />;
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
`;

const DISP_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uSim;
  uniform vec2 uTexel;
  uniform float uTime, uAspect;

  // cheap value-noise fbm for the slow base flow
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i=0;i<4;i++){ v += a*noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main(){
    // ripple normals from the heightfield
    float hL = texture2D(uSim, vUv - vec2(uTexel.x,0.0)).r;
    float hR = texture2D(uSim, vUv + vec2(uTexel.x,0.0)).r;
    float hD = texture2D(uSim, vUv - vec2(0.0,uTexel.y)).r;
    float hU = texture2D(uSim, vUv + vec2(0.0,uTexel.y)).r;
    vec3 n = normalize(vec3(hL - hR, hD - hU, 0.28));

    // slow base flow (gentle lilac fields drifting over seconds)
    vec2 fuv = vec2(vUv.x * uAspect, vUv.y) * 1.6;
    float flow = fbm(fuv + vec2(uTime * 0.02, uTime * 0.015));
    flow += 0.25 * fbm(fuv * 2.0 - uTime * 0.01);

    // lilac palette (kept close in value so the copy stays readable)
    vec3 lilacLo = vec3(202.0, 169.0, 246.0) / 255.0;  // #CAA9F6
    vec3 lilacMid= vec3(211.0, 182.0, 251.0) / 255.0;  // #D3B6FB
    vec3 lilacHi = vec3(220.0, 192.0, 255.0) / 255.0;  // #DCC0FF
    vec3 col = mix(lilacLo, lilacMid, smoothstep(0.2, 0.8, flow));
    col = mix(col, lilacHi, smoothstep(0.7, 1.05, flow) * 0.5);

    // refraction + crest sheen from the ripples — subtle but perceptible
    float refr = (n.x + n.y) * 0.5;
    col += vec3(0.16, 0.12, 0.19) * refr;                 // gentle light/dark from slopes
    float spec = pow(max(dot(n, normalize(vec3(0.5,0.6,0.8))), 0.0), 16.0);
    col += vec3(1.0, 0.98, 1.0) * spec * 0.18;            // faint caustic highlight on crests

    gl_FragColor = vec4(col, 1.0);
  }
`;
