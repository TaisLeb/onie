"use client";

import { useEffect, useRef, useState } from "react";

/** Intro loader: wordmark reveal + progress, then lifts away. */
export default function Loader() {
  const root = useRef(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let timeline;
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      window.dispatchEvent(new Event("onie:loaded"));
      setGone(true);
    };

    if (reduce) {
      finish();
      return;
    }

    document.body.style.overflow = "hidden";

    import("gsap").then((mod) => {
      if (cancelled) return;
      const gsap = mod.default || mod;
      const el = root.current;
      if (!el) {
        finish();
        return;
      }
      const letters = el.querySelectorAll(".loader__word span");
      const bar = el.querySelector(".loader__bar");
      const count = el.querySelector(".loader__count");
      const counter = { v: 0 };

      timeline = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          finish();
        },
      });

      timeline
        .set(letters, { yPercent: 110 })
        .to(letters, {
          yPercent: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.05,
        })
        .to(
          bar,
          { width: "100%", duration: 1.5, ease: "power2.inOut" },
          0.1
        )
        .to(
          counter,
          {
            v: 100,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
              if (count) count.textContent = Math.round(counter.v) + "%";
            },
          },
          0.1
        )
        .to(letters, {
          yPercent: -110,
          duration: 0.7,
          ease: "power3.in",
          stagger: 0.03,
        })
        .to(el, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "-=0.2");
    });

    return () => {
      cancelled = true;
      document.body.style.overflow = "";
      timeline && timeline.kill();
    };
  }, []);

  if (gone) return null;

  return (
    <div className="loader" ref={root}>
      <div className="loader__inner">
        <div className="loader__word">
          {"onie".split("").map((c, i) => (
            <span key={i}>{c}</span>
          ))}
          <span>&nbsp;</span>
          {"beauty".split("").map((c, i) => (
            <span key={`b${i}`}>{c}</span>
          ))}
        </div>
        <div className="loader__count">0%</div>
      </div>
      <div className="loader__bar" />
    </div>
  );
}
