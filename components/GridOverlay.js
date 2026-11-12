"use client";

import { useEffect, useState } from "react";

/**
 * Dev layout-grid overlay. Toggle with the "G" key or the floating button.
 * Mirrors the site container (max-width + --gutter) with a 12-column grid so
 * you can check alignment. State persists per browser via localStorage.
 */
export default function GridOverlay({ columns = 12 }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      setOn(localStorage.getItem("gridOverlay") === "1");
    } catch {}

    const onKey = (e) => {
      const t = e.target;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return;
      if (
        (e.key === "g" || e.key === "G") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        setOn((v) => persist(!v));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const persist = (next) => {
    try {
      localStorage.setItem("gridOverlay", next ? "1" : "0");
    } catch {}
    return next;
  };

  // No visible button on the site — toggle the dev grid with the "G" key.
  if (!on) return null;
  return (
    <div className="grid-overlay" aria-hidden="true">
      <div className="grid-overlay__wrap">
        {Array.from({ length: columns }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
    </div>
  );
}
