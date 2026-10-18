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
    const splitTexts = [];

    let mounted = true;

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      reduce ? Promise.resolve(null) : import("lenis"),
      reduce ? Promise.resolve(null) : import("gsap/SplitText"),
    ])
      .then(([gsapMod, stMod, lenisMod, splitMod]) => {
        if (!mounted) return;
        const gsap = gsapMod.default || gsapMod;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
        gsap.registerPlugin(ScrollTrigger);
        const SplitText = splitMod && (splitMod.SplitText || splitMod.default);
        if (SplitText) gsap.registerPlugin(SplitText);

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
          // Extend the masked line entrance used by "Signature products" to
          // static page copy. Keep existing reveals and interactive/dynamic
          // regions intact so their own motion and React updates still work.
          const splitTargets = new Set();
          const storyDesktop = window.innerWidth > 880;
          const storyCopyTweens = new Map();
          const revealedStoryCopies = new Set();
          const revealStoryCopy = (copy) => {
            if (!copy || revealedStoryCopies.has(copy)) return;
            revealedStoryCopies.add(copy);
            copy.querySelectorAll("h2, p").forEach((el) => storyCopyTweens.get(el)?.play());
          };
          if (SplitText) {
            const selector = [
              "main h1", "main h2", "main h3", "main p",
              "main blockquote", "main figcaption", "main li", "main legend",
              "main .eyebrow", "main .pdp__tab", "main .pdp__price",
              ".nav__link:not(.nav__cart)", ".footer__nav a",
              ".footer__wordmark", ".footer__legal span",
            ].join(", ");
            document.querySelectorAll(selector).forEach((el) => {
              if (!el.textContent.trim()) return;
              if (el.closest('[aria-hidden="true"], [data-reveal="lines"], .cmq, .blog__body, .cart__items, .cart__empty, .cart__lines, .cart__total, .news__form, .news__note')) return;
              if (el.querySelector("input, button, a, svg")) return;
              const storyCopy = el.closest(".story__copy");
              if (storyCopy && !storyDesktop && !storyCopy.classList.contains("is-active")) return;
              splitTargets.add(el);
              const split = SplitText.create(el, {
                type: "lines",
                mask: "lines",
                linesClass: "site-reveal-line",
                autoSplit: true,
                onSplit: ({ lines }) => {
                  const entrance = {
                    yPercent: 115,
                    duration: 1.1,
                    ease: "power4.out",
                    stagger: 0.08,
                  };
                  if (storyCopy && storyDesktop) {
                    const tween = gsap.from(lines, { ...entrance, paused: true });
                    storyCopyTweens.set(el, tween);
                    if (revealedStoryCopies.has(storyCopy)) tween.progress(1);
                    return tween;
                  }
                  return gsap.from(lines, {
                    ...entrance,
                    scrollTrigger: {
                      trigger: el,
                      start: "top 88%",
                      once: true,
                    },
                  });
                },
              });
              splitTexts.push(split);
            });
          }

          // Observe stable text blocks rather than inline glow spans: SplitText
          // can recreate those spans when fonts load or lines reflow.
          const glowBlocks = document.querySelectorAll(
            ".manifesto__text, .quote__text, .about__quote-text"
          );
          if (glowBlocks.length) {
            const gio = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("glow-revealed");
                  gio.unobserve(entry.target);
                }
              });
            }, { threshold: 0.6 });
            glowBlocks.forEach((block) => gio.observe(block));
            cleanupFns.push(() => gio.disconnect());
          }

          // ---- line reveals ----
          gsap.utils.toArray("[data-reveal='lines']").forEach((el) => {
            if (reduce) return;
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
            if (reduce || splitTargets.has(el)) return;
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
            if (reduce) return;
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
          if (storyEl && cards.length === 3 && storyDesktop) {
            ScrollTrigger.create({
              trigger: storyEl,
              start: "top 85%",
              once: true,
              onEnter: () => revealStoryCopy(copies[0]),
            });
            gsap.set(cards, { opacity: 1 });
            // cards 2 & 3 start parked below the clip, then slide up (fully
            // opaque — no fade) into their fanned resting spots
            gsap.set([cards[1], cards[2]], { yPercent: 135 });
            gsap.set(copies, { opacity: 0 });
            gsap.set(copies[0], { opacity: 1 });

            const stl = gsap.timeline({
              scrollTrigger: {
                trigger: ".story",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.6,
                onUpdate: (self) => {
                  if (self.progress >= 0.30) revealStoryCopy(copies[1]);
                  if (self.progress >= 0.86) revealStoryCopy(copies[2]);
                },
              },
            });
            // segment 1: card 2 slides up into the fan, copy 1 → copy 2
            stl.to(cards[1], { yPercent: 0, ease: "none", duration: 0.65 }, 0);
            stl.to(copies[0], { opacity: 0, ease: "none", duration: 0.25 }, 0.2);
            stl.to(copies[1], { opacity: 1, ease: "none", duration: 0.25 }, 0.55);
            // segment 2: card 3 slides up into the fan, copy 2 → copy 3
            stl.to(cards[2], { yPercent: 0, ease: "none", duration: 0.65 }, 1);
            stl.to(copies[1], { opacity: 0, ease: "none", duration: 0.25 }, 1.2);
            stl.to(copies[2], { opacity: 1, ease: "none", duration: 0.25 }, 1.55);
          }

          // Keep the wave fixed; scroll moves the glyphs along its SVG path.
          const cmq = document.querySelector(".cmq");
          if (cmq) {
            const media = gsap.matchMedia();
            cleanupFns.push(() => media.revert());
            media.add("(min-width: 881px) and (prefers-reduced-motion: no-preference)", () => {
              const stage = cmq.querySelector(".cmq__stage");
              const svg = cmq.querySelector(".cmq__svg");
              const wave = cmq.querySelector("path");
              const textPath = cmq.querySelector(".cmq__text-path");
              const blob = cmq.querySelector(".cmq__blob");
              // Eight of the eighteen equal wave segments are left of x=0.
              // Keep all distances in SVG units, independent of viewport size.
              const startOffset = () => wave.getTotalLength() * 8 / 18 - 300;
              const phraseLength = textPath.textContent.trim().split("  ")[0].length + 2;
              // Trim one complete phrase from the visible travel, not just the offscreen strip.
              const endOffset = () => {
                const phraseWidth = cmq.querySelector(".cmq__text").getSubStringLength(0, phraseLength);
                const distance = Math.max(svg.viewBox.baseVal.width, svg.viewBox.baseVal.width * 3 - phraseWidth);
                return startOffset() - distance;
              };
              const timeline = gsap.timeline({
                scrollTrigger: {
                  trigger: cmq,
                  start: "top top",
                  end: "bottom bottom",
                  pin: stage,
                  pinSpacing: false,
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              });
              timeline.fromTo(textPath,
                { attr: { startOffset } },
                { attr: { startOffset: endOffset }, ease: "none", duration: 1 },
                0
              );
              timeline.fromTo(blob,
                { autoAlpha: 0, scale: 0.6 },
                { autoAlpha: 1, scale: 1, ease: "power2.out", duration: 0.5 },
                0.5
              );
            });
          }

          // Animate each glass card directly, leaving its ancestors untransformed
          // so the sticky title remains visible through the backdrop filter.
          const reviews = document.querySelector(".reviews");
          if (reviews) {
            const media = gsap.matchMedia();
            cleanupFns.push(() => media.revert());
            media.add("(min-width: 881px)", () => {
              const title = reviews.querySelector(".reviews__title");
              const lastCard = reviews.querySelector(".rev:last-child");
              if (!title || !lastCard) return;
              // Sticky must release at the section boundary. Hide the title while
              // it is still centred, just after the final card passes behind it.
              gsap.fromTo(title, { opacity: 1 }, {
                opacity: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: reviews,
                  start: () => `${lastCard.offsetTop + lastCard.offsetHeight} 55%`,
                  end: () => `${lastCard.offsetTop + lastCard.offsetHeight} 35%`,
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              });
            });
            media.add({
              desktop: "(min-width: 881px)",
              motion: "(prefers-reduced-motion: no-preference)",
            }, ({ conditions }) => {
              if (!conditions.motion) return;
              const travel = [0.12, 0.30, 0.18, 0.36, 0.22, 0.28];
              reviews.querySelectorAll(".rev").forEach((card, index) => {
                const distance = () => window.innerHeight * travel[index % travel.length]
                  * (conditions.desktop ? 1 : 0.22);
                const timeline = gsap.timeline({
                  scrollTrigger: {
                    trigger: reviews,
                    // offsetTop measures the stable layout slot, ignoring animated y.
                    start: () => `${card.offsetTop} bottom`,
                    end: () => `${card.offsetTop + card.offsetHeight} top`,
                    scrub: true,
                    invalidateOnRefresh: true,
                  },
                });
                timeline.fromTo(card,
                  { y: distance, autoAlpha: 0 },
                  { y: () => -distance(), force3D: false, ease: "none", duration: 1 },
                  0
                );
                timeline.to(card,
                  { autoAlpha: 1, ease: "power1.out", duration: 0.18 },
                  0
                );
              });
            });
          }

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
        requestAnimationFrame(() => { if (mounted) ScrollTrigger.refresh(); });
        document.fonts.ready.then(() => { if (mounted) ScrollTrigger.refresh(); });
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
      splitTexts.forEach((split) => split.revert());
      lenis && lenis.destroy();
    };
  }, []);

  return null;
}
