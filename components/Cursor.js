"use client";

import { useEffect, useRef } from "react";

/**
 * Liquid lilac glow cursor. The glow eases toward the pointer and
 * stretches along its direction of travel (velocity squish), giving a
 * dewy, organic feel that matches Onie's branding — and is distinct from
 * the blend-mode ring cursor used elsewhere. Pointer/fine devices only.
 */
export default function Cursor() {
  const ref = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    const el = ref.current;
    if (!el) return;
    document.body.classList.add("has-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let gx = mx;
    let gy = my;
    let px = gx;
    let py = gy;
    let size = 48;
    let targetSize = 48;
    let raf;

    const move = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const loop = () => {
      // ease position
      gx += (mx - gx) * 0.2;
      gy += (my - gy) * 0.2;
      // ease size (hover grows the glow)
      size += (targetSize - size) * 0.18;

      // velocity -> direction + stretch
      const vx = gx - px;
      const vy = gy - py;
      px = gx;
      py = gy;
      const speed = Math.min(Math.hypot(vx, vy), 70);
      const stretch = Math.min(speed * 0.012, 0.42);
      const angle = (Math.atan2(vy, vx) * 180) / Math.PI;
      const half = size / 2;

      el.style.width = size + "px";
      el.style.height = size + "px";
      el.style.transform =
        `translate(${gx - half}px, ${gy - half}px) ` +
        `rotate(${angle}deg) scale(${1 + stretch}, ${1 - stretch})`;

      raf = requestAnimationFrame(loop);
    };
    loop();

    const over = (e) => {
      if (e.target.closest("a, button, [data-magnetic], input")) {
        el.classList.add("is-hover");
        targetSize = 84;
      }
    };
    const out = (e) => {
      if (e.target.closest("a, button, [data-magnetic], input")) {
        el.classList.remove("is-hover");
        targetSize = 48;
      }
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <span className="cursor__core" />
    </div>
  );
}
