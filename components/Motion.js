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

    // ---- hide the nav on scroll-down, reveal it on scroll-up ----
    const nav = document.querySelector(".nav");
    if (nav) {
      let lastY = window.scrollY;
      let ticking = false;
      const onNavScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const diff = y - lastY;
          if (nav.classList.contains("nav--open") || y < 80) {
            nav.classList.remove("nav--hidden"); // always visible near the top
          } else if (diff > 6) {
            nav.classList.add("nav--hidden"); // scrolling down
          } else if (diff < -6) {
            nav.classList.remove("nav--hidden"); // scrolling up
          }
          lastY = y;
          ticking = false;
        });
      };
      window.addEventListener("scroll", onNavScroll, { passive: true });
      cleanupFns.push(() =>
        window.removeEventListener("scroll", onNavScroll)
      );
    }

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
              if (el.closest('[aria-hidden="true"], [data-reveal="lines"], .cmq, .meadow, .story__copy, .story__cap, .products__grid, .blog__body, .cart__items, .cart__empty, .cart__lines, .cart__total, .news__form, .news__note')) return;
              if (el.querySelector("input, button, a, svg")) return;
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

          // Story copy is shown by the slide controller, so its lines wait for
          // their own image instead of firing with the other text on the page.
          const storyRevealed = new Set();
          const storyCopies = gsap.utils.toArray(".story__copy");
          const storyTextSplits = storyCopies.map((copy, index) => {
            if (!SplitText) return [];
            return [...copy.querySelectorAll(".story__title, .story__body")].map((el) => {
              const split = SplitText.create(el, {
                type: "lines",
                mask: "lines",
                linesClass: "site-reveal-line",
                autoSplit: true,
                onSplit: ({ lines }) => {
                  gsap.set(lines, { yPercent: storyRevealed.has(index) ? 0 : 115 });
                },
              });
              splitTexts.push(split);
              return split;
            });
          });
          const storyLines = (index) =>
            storyTextSplits[index]?.flatMap((split) => split.lines) || [];

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
            // Keep the quote CTA's CSS centering transform intact.
            const opacityOnly = el.classList.contains("quote__cta");
            gsap.set(el, opacityOnly ? { autoAlpha: 0 } : { autoAlpha: 0, y: 40 });
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
                    ...(opacityOnly ? {} : { y: 0 }),
                    duration: 1,
                    ease: "power3.out",
                    delay: parseFloat(el.dataset.delay || 0),
                    onComplete: () => {
                      if (el.classList.contains("btn")) gsap.set(el, { clearProps: "transform" });
                    },
                  }),
              });
            if (document.readyState === "complete") create();
            else window.addEventListener("load", create, { once: true });
          });

          // ---- staggered children ----
          gsap.utils.toArray("[data-reveal='stagger']").forEach((el) => {
            if (reduce) return;
            const kids = [...el.children];
            gsap.set(kids, { autoAlpha: 0, y: 50 });
            if (el.classList.contains("products__grid")) {
              const revealed = new Set();
              const cardSplits = kids.map((card, index) => {
                if (!SplitText) return [];
                return [...card.querySelectorAll(".card__name, .card__tag, .card__desc")].map((textEl) => {
                  const split = SplitText.create(textEl, {
                    type: "lines", mask: "lines", autoSplit: true,
                    linesClass: "site-reveal-line",
                    onSplit: ({ lines }) => {
                      gsap.set(lines, { yPercent: revealed.has(index) ? 0 : 115 });
                    },
                  });
                  splitTexts.push(split);
                  return split;
                });
              });
              ScrollTrigger.create({
                trigger: el, start: "top 82%", once: true,
                onEnter: () => {
                  const timeline = gsap.timeline();
                  kids.forEach((card, index) => {
                    const at = index * 0.32;
                    revealed.add(index);
                    timeline.to(card, {
                      autoAlpha: 1, y: 0, duration: 0.86, ease: "power3.out",
                      clearProps: "transform",
                    }, at);
                    const lines = cardSplits[index].flatMap((split) => split.lines);
                    if (lines.length) timeline.to(lines, {
                      yPercent: 0, duration: 0.72, stagger: 0.06,
                      ease: "power4.out",
                    }, at + 0.18);
                  });
                },
              });
              return;
            }
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
          const storyMedia = gsap.matchMedia();
          cleanupFns.push(() => storyMedia.revert());
          storyMedia.add("(max-width: 880px) and (prefers-reduced-motion: no-preference)", () => {
            if (!storyEl) return;
            const observer = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const copy = entry.target;
                const index = storyCopies.indexOf(copy);
                observer.unobserve(copy);
                if (index < 0) return;
                storyRevealed.add(index);
                const image = copy.querySelector(".story__mobile-image");
                const textBlock = copy.querySelector(".story__text-block");
                const timeline = gsap.timeline();
                timeline.to(image, {
                  autoAlpha: 1, y: 0, duration: 0.72, ease: "power3.out",
                });
                timeline.to(textBlock, {
                  autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out",
                }, ">-0.04");
                const lines = storyLines(index);
                if (lines.length) timeline.to(lines, {
                  yPercent: 0, duration: 0.8, stagger: 0.08, ease: "power4.out",
                }, "<");
              });
            }, { threshold: 0.45 });
            storyCopies.forEach((copy) => {
              gsap.set(copy.querySelectorAll(".story__mobile-image, .story__text-block"), {
                autoAlpha: 0, y: 28,
              });
              observer.observe(copy);
            });
            return () => observer.disconnect();
          });
          storyMedia.add({
            desktop: "(min-width: 881px)",
            motion: "(prefers-reduced-motion: no-preference)",
          }, (ctx) => {
            if (!ctx.conditions.desktop) return;
            if (!storyEl || cards.length !== 3) return;
            const countEl = storyEl.querySelector("[data-count]");
            const wave = storyEl.querySelector("#story-wave");
            const marquee = storyEl.querySelector(".story__marquee");
            const textPath = storyEl.querySelector(".story__text-path");
            const phraseLength = "healthy living  ".length;
            const moveMarquee = (progress) => {
              if (!wave || !marquee || !textPath) return;
              const start = wave.getTotalLength() * 8 / 18 - 300;
              const phraseWidth = marquee.querySelector(".cmq__text").getSubStringLength(0, phraseLength);
              const distance = Math.max(marquee.viewBox.baseVal.width, marquee.viewBox.baseVal.width * 3 - phraseWidth);
              textPath.setAttribute("startOffset", String(start - distance * progress));
            };
            let current = -1;
            let storyEntered = false;
            const desktopRevealed = new Set();
            if (ctx.conditions.motion) {
              gsap.set(cards, { autoAlpha: 0, y: 32 });
              gsap.set(copies, { autoAlpha: 0, y: 36 });
            }
            const revealSlide = (i) => {
              if (!ctx.conditions.motion || desktopRevealed.has(i)) return;
              desktopRevealed.add(i);
              storyRevealed.add(i);
              const timeline = gsap.timeline();
              timeline.to(cards[i], {
                autoAlpha: 1, y: 0, duration: 0.76, ease: "power3.out",
                clearProps: "opacity,visibility,transform",
              });
              timeline.to(copies[i], {
                autoAlpha: 1, y: 0, duration: 0.72, ease: "power3.out",
                clearProps: "opacity,visibility,transform",
              }, ">-0.03");
              const lines = storyLines(i);
              if (lines.length) timeline.to(lines, {
                yPercent: 0, duration: 0.8, stagger: 0.08, ease: "power4.out",
              }, "<0.1");
            };
            // Crossfade slides, with each new image entering before its copy.
            const setSlide = (i) => {
              if (i === current) return;
              current = i;
              cards.forEach((c, k) => {
                c.classList.toggle("is-active", k === i);
                copies[k].classList.toggle("is-active", k === i);
                if (k !== i && desktopRevealed.has(k)) {
                  gsap.killTweensOf([c, copies[k]]);
                  gsap.set([c, copies[k]], { clearProps: "opacity,visibility,transform" });
                  gsap.set(storyLines(k), { yPercent: 0 });
                }
              });
              if (countEl) countEl.textContent = String(i + 1);
              if (storyEntered) revealSlide(i);
            };
            setSlide(0);
            moveMarquee(0);
            if (ctx.conditions.motion) ScrollTrigger.create({
              trigger: storyEl,
              start: "top 82%",
              once: true,
              onEnter: () => {
                storyEntered = true;
                revealSlide(current);
              },
            });

            const onUpdate = (self) => {
              const p = self.progress;
              setSlide(p < 0.34 ? 0 : p < 0.68 ? 1 : 2);
              moveMarquee(p);
            };
            const stage = storyEl.querySelector(".story__stage");
            // With motion, pin the whole stage (heading + slides locked together)
            // so the title never scrolls off while a slide is on screen. The pin
            // owns the scroll distance, so there is no sticky "tail". Reduced
            // motion keeps the plain sticky scrub as a fallback.
            ScrollTrigger.create(
              ctx.conditions.motion && stage
                ? {
                    trigger: stage,
                    start: "top top",
                    end: () => "+=" + window.innerHeight * 2,
                    pin: stage,
                    pinSpacing: true,
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                    onUpdate,
                  }
                : {
                    trigger: storyEl,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.6,
                    onUpdate,
                  }
            );
          });

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

          // ---- meadow: full card shrinks left, portrait fades in right ----
          const meadow = document.querySelector(".meadow");
          if (meadow) {
            // ---- draggable before / after reveal in the portrait card ----
            const baEl = meadow.querySelector(".meadow__portrait .ba");
            if (baEl) {
              const baViewport = baEl.querySelector(".ba__viewport") || baEl;
              let pos = 55;
              const apply = () => baEl.style.setProperty("--pos", pos + "%");
              apply();
              let dragging = false;
              const setFromX = (x) => {
                const r = baViewport.getBoundingClientRect();
                pos = Math.max(2, Math.min(98, ((x - r.left) / r.width) * 100));
                apply();
              };
              const down = (e) => {
                dragging = true;
                baEl.classList.add("is-dragging");
                setFromX(e.clientX);
                e.preventDefault();
              };
              const moveBA = (e) => dragging && setFromX(e.clientX);
              const upBA = () => {
                dragging = false;
                baEl.classList.remove("is-dragging");
              };
              baViewport.addEventListener("pointerdown", down);
              window.addEventListener("pointermove", moveBA, { passive: true });
              window.addEventListener("pointerup", upBA);
              cleanupFns.push(() => {
                baViewport.removeEventListener("pointerdown", down);
                window.removeEventListener("pointermove", moveBA);
                window.removeEventListener("pointerup", upBA);
              });
            }

            const media = gsap.matchMedia();
            cleanupFns.push(() => media.revert());
            media.add(
              "(min-width: 881px) and (prefers-reduced-motion: no-preference)",
              () => {
                const stage = meadow.querySelector(".meadow__stage");
                const field = meadow.querySelector(".meadow__field");
                const portrait = meadow.querySelector(".meadow__portrait");
                const caps = [
                  meadow.querySelector(".meadow__caption--a"),
                  meadow.querySelector(".meadow__caption--b"),
                ].filter(Boolean);
                const lineAEl = meadow.querySelector(".meadow__line--a");
                const lineBEl = meadow.querySelector(".meadow__line--b");
                const lineCEl = meadow.querySelector(".meadow__line--c");
                const linesA = meadow.querySelectorAll(".meadow__line--a .reveal-line > span");
                const linesB = meadow.querySelectorAll(".meadow__line--b .reveal-line > span");
                const linesC = meadow.querySelectorAll(".meadow__line--c .reveal-line > span");
                const video = meadow.querySelector(".meadow__video");
                const squareVideo = meadow.querySelector(".meadow__square");
                const flowerVideo = meadow.querySelector(".meadow__flower");
                if (!stage || !field || !portrait || !video) return;

                // left edge of grid column 2, tracking the centred max-1480
                // container so the docked card lines up with the layout grid
                // (matches the CSS calc used by the caption) at any width
                const gridColW = () => {
                  const vw = window.innerWidth;
                  const content = Math.min(vw, 1480);
                  const rootFs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
                  const gutter = Math.max(1.25 * rootFs, Math.min(0.03125 * vw, 4.5 * rootFs));
                  return (content - 2 * gutter - 11 * 24) / 12;
                };
                const col2Left = () => {
                  const vw = window.innerWidth;
                  const side = Math.max((vw - 1480) / 2, 0);
                  const rootFs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
                  const gutter = Math.max(1.25 * rootFs, Math.min(0.03125 * vw, 4.5 * rootFs));
                  return side + gutter + gridColW() + 24;
                };

                // three resting states: a small centred square, the full-viewport
                // video, then a small card parked just right of grid column 2
                // (col2 + 3vw from the composition shift, nudged a further 0.5 column right)
                const cardLeft = () => col2Left() + 0.03 * window.innerWidth + 0.5 * gridColW();
                const SQUARE = { top: "10vh", left: "42vw", width: "16vw", height: "26vh", borderRadius: 18 };
                const FULL = { top: "0vh", left: "0vw", width: "100vw", height: "100vh", borderRadius: 0 };
                const CARD = { top: "29vh", left: cardLeft() + "px", width: "22vw", height: "50vh", borderRadius: 24 };

                // set start states up front so nothing flashes before scrub
                gsap.set(field, SQUARE);
                gsap.set(portrait, { autoAlpha: 0, xPercent: 14 });
                if (caps.length) gsap.set(caps, { autoAlpha: 0, y: 24 });
                // containers visible; each masked line parked below its clip
                gsap.set([lineAEl, lineBEl], { autoAlpha: 1, y: 0 });
                // centred third line keeps its own translate via xPercent/yPercent
                if (lineCEl) gsap.set(lineCEl, { autoAlpha: 1, xPercent: -50, yPercent: -50, y: 0 });
                gsap.set([...linesA, ...linesB, ...linesC], { yPercent: 115 });

                // ---- meadow: three states tied to scroll, each showing its own
                // clip:
                //   • square at rest  -> the side-view meadow loop (square clip)
                //   • square enlarges -> the camera-move clip plays through once
                //   • docked to card  -> a dedicated single-flower loop
                let mode = "head", playRAF = 0;

                video.loop = false; // the camera-move clip is driven manually
                video.currentTime = 0;
                // resting state shows the square clip, hides the flower clip
                if (squareVideo) squareVideo.dataset.hidden = "false";
                if (flowerVideo) flowerVideo.dataset.hidden = "true";

                // Keep the camera-move clip in step with the mode. Driven by BOTH a
                // rAF loop (smooth) and the clip's own timeupdate/ended events (a
                // backstop, so it behaves even if rAF is throttled).
                const enforce = () => {
                  if (mode === "play") {
                    // main clip runs forward once, then holds its last frame
                    if (!video.ended && video.paused) video.play?.().catch(() => {});
                  } else {
                    // head: parked at the first frame; tail: the flower clip
                    // covers the card, so the camera-move clip just rests
                    if (!video.paused) video.pause();
                    if (mode === "head" && video.currentTime > 0.05) video.currentTime = 0;
                  }
                };
                const tick = () => { playRAF = requestAnimationFrame(tick); enforce(); };
                video.addEventListener("timeupdate", enforce);
                video.addEventListener("ended", enforce);

                const setMode = (next) => {
                  if (next === mode) return;
                  const prev = mode;
                  mode = next;
                  // the square has started to enlarge -> play the main clip from
                  // the very top, once, straight through
                  if (next === "play" && prev === "head") video.currentTime = 0;
                  // square clip shows only at rest; flower clip only once docked
                  if (squareVideo) squareVideo.dataset.hidden = next === "head" ? "false" : "true";
                  if (flowerVideo) flowerVideo.dataset.hidden = next === "tail" ? "false" : "true";
                  enforce();
                };

                const tl = gsap.timeline({
                  scrollTrigger: {
                    trigger: meadow,
                    start: "top top",
                    end: "bottom bottom",
                    pin: stage,
                    pinSpacing: false,
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                      const p = self.progress;
                      if (p >= 0.9) setMode("tail");
                      else if (p <= 0.05) setMode("head");
                      else setMode("play");
                    },
                  },
                });
                cleanupFns.push(() => {
                  cancelAnimationFrame(playRAF); playRAF = 0;
                  video.removeEventListener("timeupdate", enforce);
                  video.removeEventListener("ended", enforce);
                });
                tick();

                // 1) grow: small square -> full-viewport video (same range as the
                // camera move, so the perspective travels as the square enlarges)
                tl.fromTo(field, SQUARE, { ...FULL, ease: "power2.inOut", duration: 0.3 }, 0);
                // 2) left line reveals first, line by line
                tl.to(linesA, { yPercent: 0, ease: "power4.out", stagger: 0.09, duration: 0.1 }, 0.34);
                // 3) right line reveals on further scroll
                tl.to(linesB, { yPercent: 0, ease: "power4.out", stagger: 0.09, duration: 0.1 }, 0.46);
                // 4) the first two lines scroll up and exit the top…
                tl.to([lineAEl, lineBEl], { y: "-130vh", ease: "power1.in", duration: 0.12 }, 0.54);
                // 4b) …then the centred closing line reveals on its own
                tl.to(linesC, { yPercent: 0, ease: "power4.out", duration: 0.1 }, 0.68);
                // 4c) …and it too exits up before the shrink
                tl.to(lineCEl, { y: "-130vh", ease: "power1.in", duration: 0.09 }, 0.80);
                // 5) then shrink to the small card parked lower-left
                tl.to(field, { ...CARD, ease: "power2.inOut", duration: 0.08 }, 0.86);
                // 6) portrait eases in on the right as the field settles small
                tl.to(
                  portrait,
                  { autoAlpha: 1, xPercent: 0, ease: "power2.out", duration: 0.1 },
                  0.9
                );
                // 7) short copy fades in alongside the portrait
                if (caps.length)
                  tl.to(
                    caps,
                    { autoAlpha: 1, y: 0, ease: "power2.out", stagger: 0.08, duration: 0.09 },
                    0.92
                  );
                // 8) once docked, both cards drift up as you keep scrolling — the
                // same scroll-linked vertical parallax used in the quote section.
                // The foreground portrait travels faster than the little flower
                // card, and the caption words stay put as the fixed reference.
                tl.to(field, { yPercent: -9, ease: "none", duration: 0.26 }, 1.02);
                tl.to(portrait, { yPercent: -20, ease: "none", duration: 0.26 }, 1.02);

                return () => { cancelAnimationFrame(playRAF); playRAF = 0; };
              }
            );
          }

          // The mobile meadow uses a static layout; reveal its captions and
          // comparison portrait without touching the desktop scroll sequence.
          const meadowMobile = gsap.matchMedia();
          cleanupFns.push(() => meadowMobile.revert());
          meadowMobile.add("(max-width: 880px) and (prefers-reduced-motion: no-preference)", () => {
            const meadow = document.querySelector(".meadow");
            if (!meadow) return;
            meadow.querySelectorAll(".meadow__caption").forEach((caption) => {
              const lines = caption.querySelectorAll("span");
              gsap.from(lines, {
                autoAlpha: 0, y: 32, duration: 0.8, stagger: 0.12,
                ease: "power3.out",
                scrollTrigger: { trigger: caption, start: "top 85%", once: true },
              });
            });
            const portrait = meadow.querySelector(".meadow__portrait");
            if (portrait) gsap.from(portrait, {
              autoAlpha: 0, y: 40, duration: 0.9, ease: "power3.out",
              scrollTrigger: { trigger: portrait, start: "top 85%", once: true },
            });
          });

          // Reveal the quote gallery inside its parallax wrappers so their
          // scroll-linked positions remain unchanged.
          const quote = document.querySelector(".quote");
          if (quote && !reduce) {
            const cards = quote.querySelectorAll(".scatter__card");
            const images = quote.querySelectorAll(".scatter__card > img, .scatter__card > video");
            gsap.set(cards, { autoAlpha: 0 });
            gsap.set(images, { scale: 0.92 });
            ScrollTrigger.create({
              trigger: quote,
              start: "top 80%",
              once: true,
              onEnter: () => {
                gsap.to(cards, {
                  autoAlpha: 1, duration: 0.75, stagger: 0.07,
                  ease: "power3.out",
                });
                gsap.to(images, {
                  scale: 1, duration: 0.75, stagger: 0.07,
                  ease: "power3.out",
                });
              },
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
