"use client";

import { useEffect } from "react";

/**
 * Central motion controller:
 *  - Lenis smooth scroll, synced to the GSAP ticker + ScrollTrigger
 *  - declarative reveals via data-attributes:
 *      [data-reveal="lines"]   -> .reveal-line > span slide up
 *      [data-reveal="fade"]    -> fade + rise
 *      [data-reveal="stagger"] -> children rise in sequence
 *      [data-parallax="0.2"]   -> scroll parallax (yPercent)
 *      [data-magnetic]         -> pointer-follow on hover
 * Reduced-motion: everything is shown instantly, no smooth scroll.
 */
export default function Motion() {
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let lenis;
    let ctx;
    let cleanupFns = [];

    let mounted = true;

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      reduce ? Promise.resolve(null) : import("lenis"),
    ])
      .then(([gsapMod, stMod, lenisMod]) => {
        if (!mounted) return;
        const gsap = gsapMod.default || gsapMod;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
        gsap.registerPlugin(ScrollTrigger);

        // ---- smooth scroll ----
        if (!reduce && lenisMod) {
          const Lenis = lenisMod.default || lenisMod;
          lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
          });
          lenis.on("scroll", ScrollTrigger.update);
          gsap.ticker.add((time) => lenis.raf(time * 1000));
          gsap.ticker.lagSmoothing(0);
          if (typeof window !== "undefined") window.__lenis = lenis;
        }

        ctx = gsap.context(() => {
          // ---- line reveals ----
          gsap.utils.toArray("[data-reveal='lines']").forEach((el) => {
            const spans = el.querySelectorAll(".reveal-line > span");
            gsap.set(spans, { yPercent: 115 });
            ScrollTrigger.create({
              trigger: el,
              start: "top 85%",
              once: true,
              onEnter: () =>
                gsap.to(spans, {
                  yPercent: 0,
                  duration: 1.1,
                  ease: "power4.out",
                  stagger: 0.08,
                }),
            });
          });

          // ---- fade / rise ----
          gsap.utils.toArray("[data-reveal='fade']").forEach((el) => {
            gsap.set(el, { autoAlpha: 0, y: 40 });
            ScrollTrigger.create({
              trigger: el,
              start: "top 88%",
              once: true,
              onEnter: () =>
                gsap.to(el, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 1,
                  ease: "power3.out",
                  delay: parseFloat(el.dataset.delay || 0),
                }),
            });
          });

          // ---- staggered children ----
          gsap.utils.toArray("[data-reveal='stagger']").forEach((el) => {
            const kids = el.children;
            gsap.set(kids, { autoAlpha: 0, y: 50 });
            ScrollTrigger.create({
              trigger: el,
              start: "top 82%",
              once: true,
              onEnter: () =>
                gsap.to(kids, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.9,
                  ease: "power3.out",
                  stagger: 0.12,
                }),
            });
          });

          // ---- parallax ----
          gsap.utils.toArray("[data-parallax]").forEach((el) => {
            const amt = parseFloat(el.dataset.parallax) || 0.15;
            gsap.to(el, {
              yPercent: -amt * 100,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            });
          });

          // ---- horizontal drift on footer wordmark ----
          const wm = document.querySelector("[data-drift]");
          if (wm) {
            gsap.fromTo(
              wm,
              { xPercent: -4 },
              {
                xPercent: 4,
                ease: "none",
                scrollTrigger: {
                  trigger: wm,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              }
            );
          }
        });

        // ---- magnetic buttons (skip on touch / reduced) ----
        const canHover = window.matchMedia("(hover: hover)").matches;
        if (canHover && !reduce) {
          document.querySelectorAll("[data-magnetic]").forEach((el) => {
            const strength = parseFloat(el.dataset.magnetic) || 0.35;
            const onMove = (e) => {
              const r = el.getBoundingClientRect();
              const x = e.clientX - (r.left + r.width / 2);
              const y = e.clientY - (r.top + r.height / 2);
              gsap.to(el, {
                x: x * strength,
                y: y * strength,
                duration: 0.6,
                ease: "power3.out",
              });
            };
            const onLeave = () =>
              gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.4)",
              });
            el.addEventListener("pointermove", onMove);
            el.addEventListener("pointerleave", onLeave);
            cleanupFns.push(() => {
              el.removeEventListener("pointermove", onMove);
              el.removeEventListener("pointerleave", onLeave);
            });
          });
        }

        // pause the featured video while it's off-screen (saves decode cost)
        const video = document.querySelector(".stage__video");
        if (video) {
          const vio = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                video.play && video.play().catch(() => {});
              } else {
                video.pause && video.pause();
              }
            },
            { threshold: 0.1 }
          );
          vio.observe(video);
          cleanupFns.push(() => vio.disconnect());
        }

        // refresh once fonts/layout settle
        requestAnimationFrame(() => ScrollTrigger.refresh());
        const onLoaded = () => ScrollTrigger.refresh();
        window.addEventListener("onie:loaded", onLoaded);
        cleanupFns.push(() =>
          window.removeEventListener("onie:loaded", onLoaded)
        );
      })
      .catch((err) => {
        console.warn("[Motion] init failed (content still visible):", err);
      });

    return () => {
      mounted = false;
      cleanupFns.forEach((fn) => fn());
      ctx && ctx.revert();
      lenis && lenis.destroy();
    };
  }, []);

  return null;
}
