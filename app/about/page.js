import Motion from "@/components/Motion";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "The Story of Onie Beauty — About",
  description:
    "It all started with a passion for healthy living. Meet Maria & Claire, and the organic, biodynamic ingredients that Mother Nature gifted us.",
};

export default function AboutPage() {
  return (
    <>
      <Cursor />
      <Motion />
      <Nav />

      <main className="about">
        {/* ---------- title ---------- */}
        <section className="about__intro wrap">
          <p className="eyebrow" data-reveal="fade">
            Our story
          </p>
          <h1 className="about__h1 display" data-reveal="fade" data-delay="0.05">
            The Story of Onie&nbsp;Beauty
          </h1>
        </section>

        {/* ---------- founders ---------- */}
        <section className="section wrap about__founders">
          <div className="about__fmedia" data-reveal="fade">
            <span className="about__accent" aria-hidden="true" />
            <figure className="fdr fdr--1">
              <img src="/img/founders-1.jpg" alt="Maria and Claire" loading="lazy" />
              <figcaption>Meet Maria &amp; Claire</figcaption>
            </figure>
            <figure className="fdr fdr--2">
              <img src="/img/founders-2.jpg" alt="Maria and Claire outdoors" loading="lazy" />
            </figure>
          </div>

          <div className="about__fcopy">
            <h2 className="about__h2 display" data-reveal="lines">
              <span className="reveal-line">
                <span>It all started</span>
              </span>
              <span className="reveal-line">
                <span>with a passion for</span>
              </span>
              <span className="reveal-line">
                <span>
                  <em>healthy living</em>
                </span>
              </span>
            </h2>
            <p className="about__body" data-reveal="fade" data-delay="0.1">
              We wanted to create the healthiest cosmetic brand out there — one
              that simply highlights the natural beauty each of us possesses. We
              believe every human is beautiful in their own unique way; all
              anyone needs is a skincare routine that illuminates it.
            </p>
            <p className="about__body" data-reveal="fade" data-delay="0.15">
              Cosmetics without chemical elements that, over time, cultivate a
              dependency. Just organic, powerful ingredients that Mother Nature
              gifted us.
            </p>
            <p className="about__sign" data-reveal="fade" data-delay="0.2">
              — Maria &amp; Claire, founders
            </p>
          </div>
        </section>

        {/* ---------- ingredients ---------- */}
        <section className="section wrap about__ing">
          <h2 className="about__h2 about__h2--center display" data-reveal="lines">
            <span className="reveal-line">
              <span>Just organic, powerful ingredients</span>
            </span>
            <span className="reveal-line">
              <span>
                that <em>Mother Nature</em> gifted us
              </span>
            </span>
          </h2>

          <div className="about__ig-grid" data-reveal="stagger">
            <span className="about__accent about__accent--2" aria-hidden="true" />
            <figure className="ig ig--1">
              <img src="/img/ing-cacao.jpg" alt="Cacao" loading="lazy" />
            </figure>
            <figure className="ig ig--2">
              <img src="/img/ing-passionfruit.jpg" alt="Passion fruit" loading="lazy" />
            </figure>
            <figure className="ig ig--3">
              <img src="/img/ing-blackberries.jpg" alt="Blackberries" loading="lazy" />
            </figure>
            <figure className="ig ig--4">
              <img src="/img/ing-papaya.jpg" alt="Papaya" loading="lazy" />
            </figure>
          </div>
        </section>

        {/* ---------- quote ---------- */}
        <section className="about__quote wrap">
          <p className="quote__mark display" aria-hidden="true">
            &ldquo;
          </p>
          <p className="about__quote-text" data-reveal="fade">
            We wanted to create natural cosmetics with{" "}
            <span className="glow glow--peach">absolutely zero side effects</span>{" "}
            — rich in biodynamic ingredients, yet very potent at doing their job.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
