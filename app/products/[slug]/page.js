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
    quote: "My skin has never felt this soft. I take a little extra time applying it after a long day, and that quiet moment has become my favourite part of the evening. Such a lovely ritual.",
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
    quote: "Woke up my dull winter skin in about a week. I love the light texture, and a little is all I need each morning.",
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
    quote: "From the first unboxing to the last little scoop, every detail feels thoughtful. The texture is beautiful, the packaging looks lovely on my shelf, and I always look forward to using it.",
    author: "Jordan M.",
    handle: "@jordanmakes",
    stars: 5,
  },
  {
    quote: "Came for the aesthetic, stayed for the soft finish. It fits so easily into my evening routine that I never skip it now.",
    author: "Lena K.",
    handle: "verified buyer",
    stars: 5,
  },
  {
    quote: "Three weeks in and my skin feels so much smoother. I used to rush through my routine, but now I actually enjoy those few minutes to myself. It is a small everyday treat that feels special.",
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
    quote: "I like to keep my skincare simple, and this fits right in. A soft texture, a gentle finish, and no complicated extra steps.",
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
    quote: "The texture is like silk and the scent is so subtle. It melts in beautifully without that heavy feeling, even when I layer it with the rest of my routine. Already planning my next order.",
    author: "Rafael O.",
    handle: "@raf.o",
    stars: 5,
  },
  {
    quote: "I was looking for something simple that I would enjoy using every day. This has earned a permanent place beside my sink.",
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
          <div className={`pdp__media pdp__media--${p.slug}`} data-reveal="fade">
            <span className="pdp__glow" style={{ "--c1": p.c1 }} />
            <img
              className="pdp__product"
              src={p.img}
              alt={`Onie Beauty ${p.product}`}
            />
            {p.slug === "nourish" && (
              <img
                className="pdp__hover"
                src="/img/cream-jar-open.webp"
                alt=""
                aria-hidden="true"
                loading="lazy"
              />
            )}
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

            <div id="buy-product" className="pdp__foot" data-reveal="fade" data-delay="0.2">
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
          <div className="pdp__ed-stage" data-reveal="fade">
            <div className="pdp__ed-photo" data-parallax="0.04">
              <img
                src="/img/story-woman.jpg"
                alt="Onie Beauty ritual"
                loading="lazy"
              />
            </div>
            {p.slug === "nourish" && (
              <div className="pdp__ed-swatch" data-parallax="0.42">
                <img src="/img/mint-swatch.webp" alt="" loading="lazy" />
              </div>
            )}
            <span className="pdp__ed-ings" aria-hidden="true" data-parallax="0.24">
              <img className="ei ei--1" src={p.behind[1]} alt="" loading="lazy" />
              <img className="ei ei--2" src={p.behind[2]} alt="" loading="lazy" />
              <img className="ei ei--3" src={p.behind[0]} alt="" loading="lazy" />
            </span>
          </div>

        </section>

        {/* ---------- running marquee ---------- */}
        <section className="cmq" aria-labelledby={`cmq-title-${p.slug}`}>
          <div className="cmq__stage">
            <span className="cmq__blob" aria-hidden="true" />
            <h2 id={`cmq-title-${p.slug}`} className="sr-only">{p.tag.toLowerCase()}</h2>
            <svg
              className="cmq__svg"
              viewBox="0 0 1600 560"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <path
                  id={`cmqwave-${p.slug}`}
                  d="M -6800 280 Q -6375 160 -5950 280 Q -5525 400 -5100 280 Q -4675 160 -4250 280 Q -3825 400 -3400 280 Q -2975 160 -2550 280 Q -2125 400 -1700 280 Q -1275 160 -850 280 Q -425 400 0 280 Q 425 160 850 280 Q 1275 400 1700 280 Q 2125 160 2550 280 Q 2975 400 3400 280 Q 3825 160 4250 280 Q 4675 400 5100 280 Q 5525 160 5950 280 Q 6375 400 6800 280 Q 7225 160 7650 280 Q 8075 400 8500 280"
                  fill="none"
                />
              </defs>
              <text className="cmq__text">
                <textPath className="cmq__text-path" href={`#cmqwave-${p.slug}`} startOffset="6600">
                  {Array.from({ length: 11 }, () => p.tag.toLowerCase()).join("  ")}
                </textPath>
              </text>
            </svg>
            <p className="cmq__fallback" aria-hidden="true">{p.tag.toLowerCase()}</p>
          </div>
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
        <div className="reviews__outro">
          <Link href="#buy-product" className="btn reviews__cta">
            <span>Shop {p.name}</span>
            <i className="btn__arrow" aria-hidden="true" />
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
