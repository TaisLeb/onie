"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sensual flowing-liquid WebGL background (domain-warped fbm noise).
 * Gracefully degrades to the CSS gradient `.hero__fallback` when:
 *   - WebGL is unavailable / context creation fails
 *   - the user prefers reduced motion
 *   - three.js fails to load for any reason
 * Lesson learned: guard every optional/WebGL feature so it can never
 * crash the page, and surface failures to the console rather than the UI.
 */
export default function Liquid() {
  const mountRef = useRef(null);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return; // keep the static fallback

    // quick capability probe before loading three
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

    let renderer, scene, camera, material, mesh, raf, ro;
    let disposed = false;
    const mount = mountRef.current;

    const start = (THREE) => {
      if (disposed || !mount) return;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
      } catch (err) {
        console.warn("[Liquid] WebGL renderer failed, using fallback:", err);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uScroll: { value: 0 },
      };

      material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
      });
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(mesh);

      setWebgl(true); // reveal canvas, gently fade out fallback via CSS opacity

      const target = { x: 0.5, y: 0.5 };
      const onMove = (e) => {
        const t = e.touches ? e.touches[0] : e;
        target.x = t.clientX / window.innerWidth;
        target.y = 1 - t.clientY / window.innerHeight;
      };
      const onScroll = () => {
        const max = document.body.scrollHeight - window.innerHeight;
        uniforms.uScroll.value = max > 0 ? window.scrollY / max : 0;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
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
      const loop = () => {
        raf = requestAnimationFrame(loop);
        uniforms.uTime.value = (performance.now() - t0) / 1000;
        // ease mouse toward target
        uniforms.uMouse.value.x +=
          (target.x - uniforms.uMouse.value.x) * 0.045;
        uniforms.uMouse.value.y +=
          (target.y - uniforms.uMouse.value.y) * 0.045;
        renderer.render(scene, camera);
      };
      loop();

      mount._cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("scroll", onScroll);
        ro && ro.disconnect();
        cancelAnimationFrame(raf);
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
      if (mount && mount._cleanup) mount._cleanup();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="hero__canvas"
      style={{
        opacity: webgl ? 1 : 0,
        transition: "opacity 1.2s ease",
      }}
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
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uScroll;

  /*
    Soft glow-field: a sum of slowly drifting gaussian light pools, the
    living version of Onie's signature lilac gradient smear. No fbm, no
    domain warp — a different algorithm and a different, airy look from
    the Unfold marble. Rendered as luminous lilac blooms over butter cream.
  */
  float blob(vec2 uv, vec2 c, float r){
    float d = distance(uv, c);
    return exp(-(d * d) / r);
  }

  void main(){
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = uv;
    p.x *= aspect;

    float t = uTime * 0.16;

    // drifting lilac glow pools (smaller/leaner so butter shows around them)
    float f = 0.0;
    f += blob(p, vec2(aspect * (0.30 + 0.06 * sin(t * 0.7)),
                      0.64 + 0.05 * cos(t * 0.5)), 0.12);
    f += blob(p, vec2(aspect * (0.72 + 0.05 * cos(t * 0.6)),
                      0.38 + 0.06 * sin(t * 0.8)), 0.10) * 0.9;
    f += blob(p, vec2(aspect * (0.52 + 0.08 * sin(t * 0.4 + 1.7)),
                      0.28 + 0.04 * cos(t * 0.9)), 0.075) * 0.8;
    f += blob(p, vec2(aspect * (0.16 + 0.05 * cos(t * 0.5 + 2.1)),
                      0.18 + 0.05 * sin(t * 0.6)), 0.07) * 0.7;
    f += blob(p, vec2(aspect * (0.86 + 0.04 * sin(t * 0.7 + 0.6)),
                      0.80 + 0.04 * cos(t * 0.4)), 0.075) * 0.7;

    // pointer-led bloom
    vec2 m = uMouse; m.x *= aspect;
    f += blob(p, m, 0.09) * 0.9;

    // gentle large-scale shimmer so pools breathe, not static
    f *= 1.0 + 0.06 * sin(uv.x * 5.0 + t * 2.0) * sin(uv.y * 4.0 - t * 1.3);

    // ---- light palette ----
    vec3 butter = vec3(0.945, 0.925, 0.713); // #f1ecb6
    vec3 cream  = vec3(0.984, 0.972, 0.905); // #fbf8e7
    vec3 lilac  = vec3(0.686, 0.561, 0.843); // #af8fd7  signature
    vec3 lilacHi = vec3(0.835, 0.745, 0.953); // bright core
    vec3 violet = vec3(0.478, 0.322, 0.753); // deeper accent

    // base keeps butter dominant (warm yellow shows around the glow pools)
    vec3 base = mix(butter, cream, smoothstep(0.15, 1.05, uv.y * 0.7 + 0.15));

    float v = clamp(f, 0.0, 1.6);
    vec3 col = base;
    // warm transition: butter -> soft peachy-butter -> lilac, so yellow and
    // lilac meet rather than lilac flooding the whole frame
    col = mix(col, mix(butter, lilac, 0.5), smoothstep(0.12, 0.45, v));
    col = mix(col, lilac, smoothstep(0.40, 0.95, v));
    col = mix(col, lilacHi, smoothstep(0.85, 1.25, v));
    // a touch of deeper violet only in the densest cores for richness
    col = mix(col, violet, smoothstep(1.15, 1.55, v) * 0.3);

    // soft scroll shift toward lilac as you move down
    col = mix(col, lilac, uScroll * 0.1);

    // faint vignette to seat the type
    float vig = smoothstep(1.35, 0.35, length(uv - vec2(0.5, 0.55)));
    col *= 0.96 + 0.04 * vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;
