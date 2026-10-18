"use client";

import { useEffect } from "react";

// Keep the background moving more slowly than the page while the hero leaves
// the viewport. The static portrait uses the same offset as the WebGL canvas.
export default function HeroParallax() {
  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    const update = () => {
      frame = 0;
      const box = hero.getBoundingClientRect();
      const travel = reducedMotion ? 0 : Math.min(Math.max(-box.top, 0), box.height) * 0.16;
      hero.style.setProperty("--hero-parallax-y", `${travel}px`);

    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      hero.style.removeProperty("--hero-parallax-y");
    };
  }, []);

  return null;
}
