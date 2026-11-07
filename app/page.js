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
      <Nav heroOverlay />

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
        </section>

        {/* ---------- meadow → portrait ---------- */}
        <section className="meadow" aria-label="Where it begins">
          <div className="meadow__stage">
            <figure className="meadow__field">
              {/* camera-move clip: plays through, box grows/shrinks on scroll */}
              <video
                className="meadow__video"
                poster="/img/meadow-poster.webp?v=2"
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
              >
                <source src="/video/meadow.webm?v=2" type="video/webm" />
                <source src="/video/meadow.mp4?v=2" type="video/mp4" />
              </video>
              {/* resting square: a separate side-view meadow loop, fades out as
                  the field grows to reveal the camera-move clip above */}
              <video
                className="meadow__square"
                poster="/img/meadow-square-poster.webp?v=1"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
              >
                <source src="/video/meadow-square.webm?v=1" type="video/webm" />
                <source src="/video/meadow-square.mp4?v=1" type="video/mp4" />
              </video>
              {/* docked card: a dedicated single-flower loop, shown once the
                  field shrinks to the little card on the left */}
              <video
                className="meadow__flower"
                poster="/img/meadow-flower-poster.webp?v=1"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
                data-hidden="true"
              >
                <source src="/video/meadow-flower.webm?v=1" type="video/webm" />
                <source src="/video/meadow-flower.mp4?v=1" type="video/mp4" />
              </video>
              <p className="meadow__line meadow__line--a">
                <span className="reveal-line">
                  <span>Everything we</span>
                </span>
                <span className="reveal-line">
                  <span>make…</span>
                </span>
              </p>
              <p className="meadow__line meadow__line--b">
                <span className="reveal-line">
                  <span>…starts in a field</span>
                </span>
                <span className="reveal-line">
                  <span>like this</span>
                </span>
              </p>
              <p className="meadow__line meadow__line--c">
                <span className="reveal-line">
                  <span>…and ends on your skin.</span>
                </span>
              </p>
            </figure>
            <figure className="meadow__portrait" aria-hidden="true">
              {/* draggable before / after reveal */}
              <div className="ba ba--card">
                <div className="ba__viewport">
                  {/* after (base, revealed on the right): redhead */}
                  <img className="ba__img ba__after" src="/img/ba-after.webp?v=1" alt="" loading="lazy" />
                  {/* before (clipped to the left): auburn portrait */}
                  <img className="ba__img ba__before" src="/img/meadow-portrait.webp?v=2" alt="" loading="lazy" />
                  <span className="ba__tag ba__tag--before">Before</span>
                  <span className="ba__tag ba__tag--after">After</span>
                  <div className="ba__divider">
                    <span className="ba__handle"><span aria-hidden="true">&#8596;</span></span>
                  </div>
                </div>
                <p className="ba__note">*results observed after 9 hours during clinical study on 45 participants</p>
                <ul className="ba__stats">
                  <li><span className="ba__stat-num">&#8722;22.8&#8201;%</span><span className="ba__stat-label">Forehead lines</span></li>
                  <li><span className="ba__stat-num">&#8722;18.4&#8201;%</span><span className="ba__stat-label">Crow&rsquo;s feet</span></li>
                  <li><span className="ba__stat-num">&#8722;24&#8201;%</span><span className="ba__stat-label">Pigmentation</span></li>
                  <li><span className="ba__stat-num">+20.5&#8201;%</span><span className="ba__stat-label">Skin elasticity</span></li>
                </ul>
              </div>
            </figure>
            <p className="meadow__caption meadow__caption--a">
              <span>Six field</span>
              <span>botanicals,</span>
            </p>
            <p className="meadow__caption meadow__caption--b">
              <span>48 hours of</span>
              <span>deep hydration.</span>
            </p>
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
              >
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

        {/* ---------- story (scroll-stacked slider) ---------- */}
        <section className="story" id="story">
          <div className="story__stage wrap">
            <h2 className="story__heading display">
              The story of<br />Onie Beauty
            </h2>
            <span className="story__count" aria-hidden="true">
              <em data-count>1</em>/3
            </span>

            <div className="story__marquee-clip" aria-hidden="true">
              <svg className="story__marquee cmq__svg" viewBox="0 0 1600 560" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <path
                    id="story-wave"
                    d="M -6800 280 Q -6375 160 -5950 280 Q -5525 400 -5100 280 Q -4675 160 -4250 280 Q -3825 400 -3400 280 Q -2975 160 -2550 280 Q -2125 400 -1700 280 Q -1275 160 -850 280 Q -425 400 0 280 Q 425 160 850 280 Q 1275 400 1700 280 Q 2125 160 2550 280 Q 2975 400 3400 280 Q 3825 160 4250 280 Q 4675 400 5100 280 Q 5525 160 5950 280 Q 6375 400 6800 280 Q 7225 160 7650 280 Q 8075 400 8500 280"
                    fill="none"
                  />
                </defs>
                <text className="cmq__text">
                  <textPath className="story__text-path cmq__text-path" href="#story-wave" startOffset="6600">
                    {Array.from({ length: 11 }, () => "healthy living").join("  ")}
                  </textPath>
                </text>
              </svg>
            </div>

            <div className="story__scene">
              <div className="story__media">
                <figure className="story__card is-active" data-card="1">
                  <img src="/img/slider-1.webp" alt="Maria and Claire, founders of Onie Beauty" loading="lazy" />
                  <figcaption className="story__cap">&mdash; Maria &amp; Claire, founders</figcaption>
                </figure>
                <figure className="story__card" data-card="2">
                  <img src="/img/slider-2.webp" alt="Natural botanical ingredients" loading="lazy" />
                  <figcaption className="story__cap">&mdash; Chosen for what they do</figcaption>
                </figure>
                <figure className="story__card" data-card="3">
                  <img src="/img/story-lavender-dropper-serum.webp" alt="Lavender dropper and golden serum in a skincare lab" loading="lazy" />
                  <figcaption className="story__cap">&mdash; Made to be used daily</figcaption>
                </figure>
              </div>

              <div className="story__copycol">
                <article className="story__copy is-active" data-copy="1">
                  <figure className="story__mobile-image">
                    <img src="/img/slider-1.webp" alt="Maria and Claire, founders of Onie Beauty" loading="lazy" />
                    <figcaption>— Maria &amp; Claire, founders</figcaption>
                  </figure>
                  <div className="story__text-block">
                    <h3 className="story__title display">
                      It all started with a passion for <em>healthy living</em>
                    </h3>
                    <p className="story__body">
                      We wanted to create the healthiest cosmetic brand out there —
                      one that simply highlights the natural beauty each of us
                      possesses. Cosmetics without chemical elements that cultivate
                      dependency. Just organic, biodynamic, powerful ingredients
                      that are potent at doing their job.
                    </p>
                  </div>
                </article>

                <article className="story__copy" data-copy="2">
                  <figure className="story__mobile-image">
                    <img src="/img/slider-2.webp" alt="Natural botanical ingredients" loading="lazy" />
                    <figcaption>— Chosen for what they do</figcaption>
                  </figure>
                  <div className="story__text-block">
                    <h3 className="story__title display">
                      Good things take root in <em>good places</em>
                    </h3>
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
                  </div>
                </article>

                <article className="story__copy" data-copy="3">
                  <figure className="story__mobile-image">
                    <img src="/img/story-lavender-dropper-serum.webp" alt="Lavender dropper and golden serum in a skincare lab" loading="lazy" />
                    <figcaption>— Made to be used daily</figcaption>
                  </figure>
                  <div className="story__text-block">
                    <h3 className="story__title display">
                      Nothing extra. <em>Everything considered.</em>
                    </h3>
                    <p className="story__body">
                      We believe skincare should feel as good as it is thoughtful.
                      That&rsquo;s why we focus on purposeful formulas, ingredients
                      that work beautifully together, and textures you&rsquo;ll
                      actually look forward to using.
                    </p>
                  </div>
                </article>
              </div>
            </div>

          </div>
        </section>

        <div className="story__cta" data-reveal="fade">
          <a href="/#products" className="btn btn--solid">
            <span>Shop the collection</span>
            <i className="btn__arrow" />
          </a>
        </div>

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

              <div className="stage" aria-hidden="true" data-reveal="fade">
                <div className="stage__product stage__product--video">
                  <video
                    className="stage__video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/img/featured-orange-poster.webp"
                  >
                    <source src="/video/featured-orange.webm" type="video/webm" />
                    <source src="/video/featured-orange.mp4" type="video/mp4" />
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
            ].map(([cls, n, p]) => {
              // two portraits are short product-demo videos, the rest are stills
              const video = {
                2: "portrait-auburn",
                4: "portrait-african",
                8: "portrait-arab",
                10: "portrait-latina",
              }[n];
              return (
                <span className={`scatter ${cls}`} key={cls} data-parallax={p}>
                  <span className="scatter__card">
                    {video ? (
                      <video
                        poster={`/img/${video}-poster.webp`}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      >
                        <source src={`/video/${video}.webm`} type="video/webm" />
                        <source src={`/video/${video}.mp4`} type="video/mp4" />
                      </video>
                    ) : (
                      <img src={`/img/scatter-${n}.webp`} alt="" loading="lazy" />
                    )}
                  </span>
                </span>
              );
            })}
          </div>
          <p className="quote__mark display" aria-hidden="true">
            &ldquo;
          </p>
          <p className="quote__text" data-reveal="fade">
            Natural beauty allows for a more{" "}
            <span className="glow">authentic</span>{" "}expression. It&rsquo;s
            when you feel simply great about being you.
          </p>
          <div className="quote__cta" data-reveal="fade">
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
