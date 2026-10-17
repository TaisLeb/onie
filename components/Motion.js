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

    // ---- iridescent word hover: the colour pools at the cursor and flows
    // across the word like liquid paint as the mouse moves ----
    document.querySelectorAll(".hero__title .word").forEach((word) => {
      const onWordMove = (e) => {
        const r = word.getBoundingClientRect();
        word.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        word.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      };
      word.addEventListener("pointermove", onWordMove, { passive: true });
      cleanupFns.push(() => word.removeEventListener("pointermove", onWordMove));
    });

    // ---- draw the .glow highlights in (left→right) when they enter view ----
    const glows = document.querySelectorAll(".glow");
    if (glows.length) {
      const gio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-drawn");
              gio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      glows.forEach((g) => gio.observe(g));
      cleanupFns.push(() => gio.disconnect());
    }

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
            // hide immediately (covered by the loader — no flash)…
            gsap.set(el, { autoAlpha: 0, y: 40 });
            // …but only arm the scroll trigger once the layout has settled, so
            // near-top sections (e.g. the manifesto) don't fire while the hero
            // is still sizing behind the loader.
            const create = () =>
              ScrollTrigger.create({
                trigger: el,
                start: "top 95%",
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
            if (document.readyState === "complete") create();
            else window.addEventListener("load", create, { once: true });
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

          // ---- story: scroll-stacked slider ----
          const storyEl = document.querySelector(".story");
          const cards = gsap.utils.toArray(".story__card");
          const copies = gsap.utils.toArray(".story__copy");
          if (storyEl && cards.length === 3 && window.innerWidth > 880) {
            gsap.set(cards, { opacity: 1 });
            // cards 2 & 3 start parked below the clip, then slide up (fully
            // opaque — no fade) into their fanned resting spots
            gsap.set([cards[1], cards[2]], { yPercent: 118 });
            gsap.set(copies, { opacity: 0 });
            gsap.set(copies[0], { opacity: 1 });

            const stl = gsap.timeline({
              scrollTrigger: {
                trigger: ".story",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.6,
              },
            });
            // segment 1: card 2 slides up into the fan, copy 1 → copy 2
            stl.to(cards[1], { yPercent: 0, ease: "none", duration: 1 }, 0);
            stl.to(copies[0], { opacity: 0, ease: "none", duration: 0.25 }, 0.2);
            stl.to(copies[1], { opacity: 1, ease: "none", duration: 0.25 }, 0.55);
            // segment 2: card 3 slides up into the fan, copy 2 → copy 3
            stl.to(cards[2], { yPercent: 0, ease: "none", duration: 1 }, 1);
            stl.to(copies[1], { opacity: 0, ease: "none", duration: 0.25 }, 1.2);
            stl.to(copies[2], { opacity: 1, ease: "none", duration: 0.25 }, 1.55);
          }

          // ---- full-viewport running marquee (pin + scrub) ----
          // scroll ~2 viewports: the whole time the marquee runs; the lilac
          // gradient blob fades/scales in during the 2nd half.
          const cmq = document.querySelector(".cmq");
          if (cmq && window.innerWidth > 880) {
            const svg = cmq.querySelector(".cmq__svg");
            const blob = cmq.querySelector(".cmq__blob");
            gsap.set(blob, { autoAlpha: 0, scale: 0.6 });
            const mtl = gsap.timeline({
              scrollTrigger: {
                trigger: cmq,
                start: "top top",
                end: "+=200%",
                pin: true,
                scrub: 0.6,
              },
            });
            // marquee runs across the full scroll
            mtl.fromTo(
              svg,
              { xPercent: 0 },
              { xPercent: -66, ease: "none", duration: 1 },
              0
            );
            // blob appears only in the 2nd half
            mtl.to(
              blob,
              { autoAlpha: 1, scale: 1, ease: "power2.out", duration: 0.5 },
              0.5
            );
          }

          // (reviews section is now pure CSS: sticky centred title + cards in
          // normal flow — no transform, so the frosted-glass blur works.)

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
