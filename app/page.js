import Link from "next/link";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import Motion from "@/components/Motion";
import Cursor from "@/components/Cursor";
import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
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
            <a href="#products" className="btn" data-magnetic="0.4">
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
            <span className="spotlight__bg" aria-hidden="true" />
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
                    data-magnetic="0.4"
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

        {/* ---------- story ---------- */}
        <section className="section wrap story" id="story">
          <div className="story__media" data-reveal="fade">
            <img
              className="story__photo"
              src="/img/story-woman.jpg"
              alt="Woman applying Onie Beauty cream"
              loading="lazy"
            />
          </div>
          <div className="story__copy">
            <p className="eyebrow" data-reveal="fade">
              The story of Onie Beauty
            </p>
            <h2 className="story__title" data-reveal="lines">
              <span className="reveal-line">
                <span>It all started</span>
              </span>
              <span className="reveal-line">
                <span>
                  with a passion for
                </span>
              </span>
              <span className="reveal-line">
                <span>
                  <em>healthy living</em>
                </span>
              </span>
            </h2>
            <p className="story__body" data-reveal="fade" data-delay="0.1">
              We wanted to create the healthiest cosmetic brand out there — one
              that simply highlights the natural beauty each of us possesses.
              Cosmetics without chemical elements that cultivate dependency.
              Just organic, biodynamic, powerful ingredients that are potent at
              doing their job.
            </p>
            <p className="story__sign" data-reveal="fade" data-delay="0.15">
              — Maria &amp; Claire, founders
            </p>
          </div>
        </section>

        {/* ---------- quote ---------- */}
        <section className="quote wrap">
          <p className="quote__mark display" aria-hidden="true">
            &ldquo;
          </p>
          <p className="quote__text" data-reveal="fade">
            Natural beauty allows for a more authentic expression. It&rsquo;s
            when you feel simply great about being you.
          </p>
        </section>

        {/* ---------- newsletter ---------- */}
        <Newsletter />
      </main>

      <Footer />
    </>
  );
}
