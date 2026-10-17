import Link from "next/link";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import Motion from "@/components/Motion";
import Cursor from "@/components/Cursor";
import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Water from "@/components/Water";
import { PRODUCTS } from "@/lib/products";

export default function Home() {
  return (
    <>
      <Loader />
      <Cursor />
      <Motion />
      <Nav />

      <main>
        <Hero />

        {/* ---------- manifesto ---------- */}
        <section className="manifesto wrap">
          <p className="manifesto__text display" data-reveal="fade">
            Our products are designed to bring out the best in you and to{" "}
            <em>
              <span className="glow">highlight</span>
            </em>{" "}
            your natural beauty.
          </p>
          <div className="manifesto__cta" data-reveal="fade" data-delay="0.1">
            <a href="#products" className="btn">
              <span>Shop products</span>
              <i className="btn__arrow" />
            </a>
          </div>
        </section>

        {/* ---------- products ---------- */}
        <section className="section wrap" id="products">
          <div className="products__head">
            <h2
              className="products__title display"
              data-reveal="lines"
            >
              <span className="reveal-line">
                <span>Signature</span>
              </span>
              <span className="reveal-line">
                <span>
                  <em style={{ fontStyle: "italic" }}>products</em>
                </span>
              </span>
            </h2>
            <span className="eyebrow" data-reveal="fade">
              Three steps to glow
            </span>
          </div>

          <div className="products__grid" data-reveal="stagger">
            {PRODUCTS.map((p) => (
              <Link
                href={`/products/${p.slug}`}
                className={`card card--${p.slug}`}
                key={p.slug}
                style={{ "--c1": p.c1 }}
              >
                <span className="card__glow" />
                <div className="card__top">
                  <h3 className="card__name">{p.name}</h3>
                  <p className="card__tag">{p.tag}</p>
                </div>
                <div className="card__viz">
                  <span className="card__behind" aria-hidden="true">
                    <img className="b b--smear" src={p.behind[0]} alt="" loading="lazy" />
                    <img className="b b--a" src={p.behind[1]} alt="" loading="lazy" />
                    <img className="b b--b" src={p.behind[2]} alt="" loading="lazy" />
                  </span>
                  <img
                    className="card__product"
                    src={p.img}
                    alt={`Onie Beauty ${p.name}`}
                    loading="lazy"
                  />
                </div>
                <div className="card__bottom">
                  <p className="card__desc">{p.cardDesc}</p>
                  <span className="card__add">
                    View product <span className="plus" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------- spotlight ---------- */}
        <section className="section wrap">
          <div className="spotlight">
            <Water />
            <div className="spotlight__inner">
              <div className="spotlight__copy">
                <p className="spotlight__eyebrow eyebrow" data-reveal="fade">
                  Featured · Purify
                </p>
                <h2 className="spotlight__title" data-reveal="lines">
                  <span className="reveal-line">
                    <span>Quench the</span>
                  </span>
                  <span className="reveal-line">
                    <span>
                      thirst of your skin
                    </span>
                  </span>
                  <span className="reveal-line">
                    <span>
                      with <em>nature&rsquo;s</em> best
                    </span>
                  </span>
                </h2>
                <p className="spotlight__desc" data-reveal="fade" data-delay="0.1">
                  Hydra-repair day cream. A luscious touch of hydrating mixture
                  that quenches the thirst of your skin. Apply daily to see the
                  best results.
                </p>
                <div className="spotlight__meta" data-reveal="fade" data-delay="0.15">
                  <div>
                    <p className="k">Size</p>
                    <p className="v">65ml / 2.2oz</p>
                  </div>
                  <div>
                    <p className="k">Key ingredients</p>
                    <p className="v" style={{ fontSize: "1rem", maxWidth: "22ch" }}>
                      Orange peel, mint, cucumber, aloe, white turmeric, sweet
                      fennel
                    </p>
                  </div>
                </div>
                <div className="spotlight__cta" data-reveal="fade" data-delay="0.2">
                  <span className="spotlight__price">$45.00</span>
                  <Link
                    href="/products/purify"
                    className="btn btn--solid"

                  >
                    <span>View product</span>
                    <i className="btn__arrow" />
                  </Link>
                </div>
              </div>

              <div className="stage" aria-hidden="true">
                <div className="stage__product stage__product--video">
                  <video
                    className="stage__video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/img/featured-poster.jpg"
                  >
                    <source src="/video/featured.mp4" type="video/mp4" />
                    {/* fallback for browsers that can't play the video */}
                    <img
                      src="/img/cream-tube.png"
                      alt="Onie Beauty Hydra-repair day cream"
                    />
                  </video>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- story (scroll-stacked slider) ---------- */}
        <section className="story" id="story">
          <div className="story__stage wrap">
            <div className="story__media">
              <div className="story__card" data-card="1">
                <img src="/img/slider-1.webp" alt="Maria and Claire, founders of Onie Beauty" loading="lazy" />
              </div>
              <div className="story__card" data-card="2">
                <img src="/img/slider-2.webp" alt="Natural botanical ingredients" loading="lazy" />
              </div>
              <div className="story__card" data-card="3">
                <img src="/img/slider-3.webp" alt="Onie Beauty creams and botanicals" loading="lazy" />
              </div>
            </div>

            <div className="story__copycol">
              <article className="story__copy is-active" data-copy="1">
                <p className="eyebrow">The story of Onie Beauty</p>
                <h2 className="story__title">
                  It all started<br />with a passion for{" "}
                  <em>healthy living</em>
                </h2>
                <p className="story__body">
                  We wanted to create the healthiest cosmetic brand out there —
                  one that simply highlights the natural beauty each of us
                  possesses. Cosmetics without chemical elements that cultivate
                  dependency. Just organic, biodynamic, powerful ingredients
                  that are potent at doing their job.
                </p>
                <p className="story__sign">— Maria &amp; Claire, founders</p>
              </article>

              <article className="story__copy" data-copy="2">
                <p className="eyebrow">The story of Onie Beauty</p>
                <h2 className="story__title">
                  Good things take root<br />in <em>good places</em>
                </h2>
                <p className="story__body">
                  Nature has always been our starting point. From soothing
                  botanicals to nourishing plant oils, we choose ingredients for
                  what they bring to your skin, not just how lovely they sound on
                  a label.
                </p>
                <p className="story__body">
                  Every ingredient has a reason to be here. And if it
                  doesn&rsquo;t? It doesn&rsquo;t make the cut.
                </p>
              </article>

              <article className="story__copy" data-copy="3">
                <span className="story__cta-glow" aria-hidden="true" />
                <p className="eyebrow">The story of Onie Beauty</p>
                <h2 className="story__title">
                  Nothing extra.<br />
                  <em>Everything considered.</em>
                </h2>
                <p className="story__body">
                  We believe skincare should feel as good as it is thoughtful.
                  That&rsquo;s why we focus on purposeful formulas, ingredients
                  that work beautifully together, and textures you&rsquo;ll
                  actually look forward to using.
                </p>
                <p className="story__body">
                  No complicated routines. No chasing perfection. Just good
                  skincare that lets your natural beauty do its thing.
                </p>
                <div className="story__cta">
                  <a href="/#products" className="btn btn--solid">
                    <span>Shop the collection</span>
                    <i className="btn__arrow" />
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ---------- quote ---------- */}
        <section className="quote wrap">
          <div className="quote__scatter" aria-hidden="true">
            {[
              ["s1", 2, 0.1],
              ["s2", 6, 0.08],
              ["s3", "saffron", 0.15],
              ["s4", 3, 0.1],
              ["s6", 4, 0.12],
              ["s7", 8, 0.16],
              ["s9", "mint", 0.09],
              ["s10", 13, 0.07],
              ["s11", 10, 0.14],
              ["s12", 12, 0.11],
              ["s13", 11, 0.1],
            ].map(([cls, n, p]) => (
              <span className={`scatter ${cls}`} key={cls} data-parallax={p}>
                <span className="scatter__card">
                  <img src={`/img/scatter-${n}.webp`} alt="" loading="lazy" />
                </span>
              </span>
            ))}
          </div>
          <p className="quote__mark display" aria-hidden="true">
            &ldquo;
          </p>
          <p className="quote__text" data-reveal="fade">
            Natural beauty allows for a more{" "}
            <span className="glow">authentic</span>{" "}expression. It&rsquo;s
            when you feel simply great about being you.
          </p>
          <div className="quote__cta">
            <a href="/#products" className="btn btn--solid">
              <span>Shop the collection</span>
              <i className="btn__arrow" />
            </a>
          </div>
        </section>

        {/* ---------- newsletter ---------- */}
        <Newsletter />
      </main>

      <Footer />
    </>
  );
}
