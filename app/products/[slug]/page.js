import Link from "next/link";
import { notFound } from "next/navigation";
import Motion from "@/components/Motion";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductBuy from "@/components/ProductBuy";
import { PRODUCTS, getProduct } from "@/lib/products";

// fictional reviews — this is a portfolio concept site, not a real brand
const REVIEWS = [
  {
    quote: "My skin has never felt this soft. This is my whole evening ritual now.",
    author: "Amara L.",
    handle: "verified buyer",
    stars: 5,
  },
  {
    quote: "Finally a clean formula that actually does something. The glow is real.",
    author: "Priya S.",
    handle: "@priya.does.skincare",
    stars: 5,
  },
  {
    quote: "Woke up my dull winter skin in about a week. I'm genuinely impressed.",
    author: "Noa R.",
    handle: "verified buyer",
    stars: 4,
  },
  {
    quote: "Lightweight, no sticky residue, sinks right in. Perfect under makeup.",
    author: "Camille D.",
    handle: "verified buyer",
    stars: 5,
  },
  {
    quote: "Packaging, texture, results — everything about it feels considered.",
    author: "Jordan M.",
    handle: "@jordanmakes",
    stars: 5,
  },
  {
    quote: "Came for the aesthetic, stayed for what it did to my skin barrier.",
    author: "Lena K.",
    handle: "verified buyer",
    stars: 5,
  },
  {
    quote: "Three weeks in and my texture is the smoothest it's been in years.",
    author: "Sofia T.",
    handle: "verified buyer",
    stars: 5,
  },
  {
    quote: "I'm obsessed. It's the first thing I recommend to everyone now.",
    author: "Marcus B.",
    handle: "@marcusb",
    stars: 5,
  },
  {
    quote: "Gentle enough for my reactive skin — nothing has flared up once.",
    author: "Hana W.",
    handle: "verified buyer",
    stars: 5,
  },
  {
    quote: "A little goes such a long way. One jar has lasted me months.",
    author: "Elena V.",
    handle: "verified buyer",
    stars: 4,
  },
  {
    quote: "The texture is like silk and the scent is so subtle and clean.",
    author: "Rafael O.",
    handle: "@raf.o",
    stars: 5,
  },
  {
    quote: "My dermatologist actually approved of it — that never happens.",
    author: "Yuki N.",
    handle: "verified buyer",
    stars: 5,
  },
];

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return {
    title: `${p.product} — Onie Beauty`,
    description: p.desc,
    openGraph: { title: `${p.product} — Onie Beauty`, description: p.desc },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();

  return (
    <>
      <Cursor />
      <Motion />
      <Nav />

      <main className="pdp">
        {/* ---------- tabs ---------- */}
        <nav className="pdp__tabs wrap" aria-label="Products">
          {PRODUCTS.map((t) => (
            <Link
              key={t.slug}
              href={`/products/${t.slug}`}
              className={`pdp__tab${t.slug === p.slug ? " is-active" : ""}`}
            >
              {t.name}
            </Link>
          ))}
        </nav>

        {/* ---------- detail ---------- */}
        <section className="pdp__detail wrap">
          <div className="pdp__media" data-reveal="fade">
            <span className="pdp__glow" style={{ "--c1": p.c1 }} />
            <img
              className="pdp__product"
              src={p.img}
              alt={`Onie Beauty ${p.product}`}
            />
            <img
              className="pdp__hover"
              src="/img/cream-jar-open.webp"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
          </div>

          <div className="pdp__info">
            <p className="eyebrow pdp__cat" data-reveal="fade">
              {p.name} · {p.tag}
            </p>
            <h1 className="pdp__title display" data-reveal="fade" data-delay="0.05">
              {p.product}
            </h1>
            <p className="pdp__size" data-reveal="fade" data-delay="0.1">
              {p.size}
            </p>
            <p className="pdp__desc" data-reveal="fade" data-delay="0.12">
              {p.desc}
            </p>

            <div className="pdp__ing" data-reveal="fade" data-delay="0.16">
              <p className="pdp__ing-label">Key ingredients</p>
              <ul className="pdp__ing-list">
                {p.ingredients.map((ing) => (
                  <li key={ing}>{ing}</li>
                ))}
              </ul>
            </div>

            <div className="pdp__foot" data-reveal="fade" data-delay="0.2">
              <span className="pdp__price">{p.price}</span>
              <ProductBuy
                slug={p.slug}
                name={p.name}
                product={p.product}
                price={p.price}
                img={p.img}
              />
            </div>
          </div>
        </section>

        {/* ---------- editorial ---------- */}
        <section className="section wrap pdp__ed">
          <div className="pdp__ed-stage" data-reveal="fade">
            <div className="pdp__ed-photo" data-parallax="0.04">
              <img
                src="/img/story-woman.jpg"
                alt="Onie Beauty ritual"
                loading="lazy"
              />
            </div>
            <div className="pdp__ed-swatch" data-parallax="0.42">
              <img src="/img/mint-swatch.webp" alt="" loading="lazy" />
            </div>
            <span className="pdp__ed-ings" aria-hidden="true" data-parallax="0.24">
              <img className="ei ei--1" src={p.behind[1]} alt="" loading="lazy" />
              <img className="ei ei--2" src={p.behind[2]} alt="" loading="lazy" />
              <img className="ei ei--3" src={p.behind[0]} alt="" loading="lazy" />
            </span>
          </div>

          <div className="pdp__ed-copy">
            <h2 className="pdp__ed-title display" data-reveal="lines">
              {p.editorial.title.map((line, i) => (
                <span className="reveal-line" key={i}>
                  <span>
                    {i === p.editorial.title.length - 1 ? (
                      <>
                        {line.split(" ").slice(0, -1).join(" ")}{" "}
                        <em>{line.split(" ").slice(-1)}</em>
                      </>
                    ) : (
                      line
                    )}
                  </span>
                </span>
              ))}
            </h2>
            <p className="pdp__ed-body" data-reveal="fade" data-delay="0.1">
              {p.editorial.body}
            </p>
            <Link
              href="/#products"
              className="btn pdp__ed-cta"

              data-reveal="fade"
              data-delay="0.15"
            >
              <span>Shop all products</span>
              <i className="btn__arrow" />
            </Link>
          </div>
        </section>

        {/* ---------- running marquee ---------- */}
        <section className="cmq" aria-label={p.tag}>
          <span className="cmq__blob" aria-hidden="true" />
          <svg
            className="cmq__svg"
            viewBox="0 0 3000 320"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <path
                id={`cmqwave-${p.slug}`}
                d="M0,210 C250,138 500,138 760,210 S1270,282 1520,210 S2030,138 2280,210 S2790,282 3000,210"
                fill="none"
              />
            </defs>
            <text className="cmq__text">
              <textPath href={`#cmqwave-${p.slug}`} startOffset="0">
                {Array.from({ length: 7 }, () => p.tag).join("  ")}
              </textPath>
            </text>
          </svg>
        </section>

        {/* ---------- reviews ---------- */}
        <section className="reviews">
          <h2 className="reviews__title">Reviews</h2>
          <div className="reviews__track">
            {REVIEWS.map((r, i) => (
              <figure className={`rev rev--${i + 1}`} key={i}>
                <div
                  className="rev__stars"
                  aria-label={`${r.stars} out of 5 stars`}
                >
                  {"★".repeat(r.stars)}
                  {"☆".repeat(5 - r.stars)}
                </div>
                <blockquote className="rev__quote">{r.quote}</blockquote>
                <figcaption className="rev__author">
                  {r.author}
                  <span>{r.handle}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
