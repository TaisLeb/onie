"use client";

import { useEffect, useState } from "react";

const CATEGORIES = [
  {
    id: "recipes",
    label: "Organic beauty recipes",
    posts: [
      {
        img: "/img/blog-1.jpg",
        title: "Mood-lifting, skin-brightening, youth-boosting chocolate facial mask",
        author: "Naomi Lesaka",
        date: "January, 2023",
        excerpt:
          "This mask is the go-to if you're looking to brighten your skin, boost skin tone and reduce the visibility of fine lines.",
      },
      {
        img: "/img/blog-2.jpg",
        title: "How you can use avocado for your morning beauty routine",
        author: "Jordin Elliot",
        date: "January, 2023",
        excerpt:
          "Whipped, mashed or simply sliced — a few gentle ways to fold nature's butter into your morning ritual for softer, calmer skin.",
      },
      {
        img: "/img/blog-3.jpg",
        title: "One ingredient to use daily to take 7 years off your skin",
        author: "Alana Green",
        date: "March, 2023",
        excerpt:
          "The humble hero that quietly does the work of a dozen serums — and exactly how to layer it for a lit-from-within finish.",
      },
      {
        img: "/img/blog-4.jpg",
        title: "The basics of any organic skin mask: the ‘what’, the ‘how’, the ‘why’",
        author: "Naomi Lesaka",
        date: "February, 2023",
        excerpt:
          "A gentle primer on masking with real, living ingredients — what to reach for, how often, and why your skin will thank you.",
      },
      {
        img: "/img/ing-cacao.jpg",
        title: "The ancient cacao ritual your tired skin has been craving",
        author: "Maya Rivera",
        date: "April, 2023",
        excerpt:
          "Raw cacao is rich in antioxidants and magnesium — here's how to turn a spoonful into a five-minute glow treatment.",
      },
      {
        img: "/img/ing-papaya.jpg",
        title: "Papaya enzymes: nature’s softest way to exfoliate",
        author: "Jordin Elliot",
        date: "May, 2023",
        excerpt:
          "Forget grainy scrubs — papaya's papain gently dissolves dullness so fresh, even-toned skin can shine through.",
      },
    ],
  },
  {
    id: "makeup",
    label: "Make-up tips",
    posts: [
      {
        img: "/img/story-woman.jpg",
        title: "A five-minute glow for bare, no-makeup days",
        author: "Maya Rivera",
        date: "April, 2023",
        excerpt:
          "The tiny edit that makes skincare look like makeup — a dab, a press and a healthy sheen that reads as simply ‘you’.",
      },
      {
        img: "/img/model-face-sm.png",
        title: "How to make your base last from sunrise to last light",
        author: "Jordin Elliot",
        date: "April, 2023",
        excerpt:
          "Prep, press and set — the order of operations that keeps a natural base looking fresh well past golden hour.",
      },
      {
        img: "/img/cream-swatch.png",
        title: "The dewy-skin base every routine has been missing",
        author: "Alana Green",
        date: "May, 2023",
        excerpt:
          "Why the right cream is the only ‘primer’ you need, and the two-finger technique that gives that glass-skin glow.",
      },
    ],
  },
];

const INITIAL = 4;

export default function BlogClient() {
  const [active, setActive] = useState(CATEGORIES[0].id);
  const [showAll, setShowAll] = useState(false);

  const cat = CATEGORIES.find((c) => c.id === active);
  const posts = showAll ? cat.posts : cat.posts.slice(0, INITIAL);
  const hasMore = cat.posts.length > INITIAL;

  // Blog posts change when a category or the article count changes, so give
  // their text the same masked line entrance as the static page copy.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let activeEffect = true;
    const splits = [];
    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("gsap/SplitText"),
    ]).then(([gsapMod, stMod, splitMod]) => {
      if (!activeEffect) return;
      const gsap = gsapMod.default || gsapMod;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      const SplitText = splitMod.SplitText || splitMod.default;
      gsap.registerPlugin(ScrollTrigger, SplitText);
      document.querySelectorAll(".blog__list .post__title, .blog__list .post__meta, .blog__list .post__excerpt, .blog__list .post__read").forEach((el) => {
        splits.push(SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "site-reveal-line",
          autoSplit: true,
          onSplit: ({ lines }) => gsap.from(lines, {
            yPercent: 115,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }),
        }));
      });
      ScrollTrigger.refresh();
    });
    return () => {
      activeEffect = false;
      splits.forEach((split) => split.revert());
    };
  }, [active, showAll]);

  const switchCat = (id) => {
    setActive(id);
    setShowAll(false);
  };

  return (
    <div className="blog__body wrap">
      <div className="blog__tabs">
        {CATEGORIES.map((c, i) => (
          <button
            key={c.id}
            className={`blog__tab${c.id === active ? " is-active" : ""}`}
            onClick={() => switchCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="blog__list">
        {posts.map((p) => (
          <article className="post" key={p.title}>
            <div className="post__media">
              <img src={p.img} alt={p.title} loading="lazy" />
            </div>
            <div className="post__body">
              <h2 className="post__title">{p.title}</h2>
              <p className="post__meta">
                <span className="post__author">by {p.author}</span>
                <span className="post__div" aria-hidden="true">
                  |
                </span>
                <span>{p.date}</span>
              </p>
              <p className="post__excerpt">{p.excerpt}</p>
              <span className="post__read">
                Read article <i className="btn__arrow" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {hasMore && !showAll && (
        <div className="blog__more">
          <button className="btn" onClick={() => setShowAll(true)}>
            <span>More articles</span>
            <i className="btn__arrow" />
          </button>
        </div>
      )}
    </div>
  );
}
