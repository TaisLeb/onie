import Liquid from "./Liquid";

export default function Hero() {
  return (
    <section className="hero" id="top">
      {/* static gradient fallback always present underneath */}
      <div className="hero__fallback" aria-hidden="true" />
      {/* static portrait — shown on the right when WebGL is unavailable */}
      <img
        className="hero__portrait"
        src="/img/hero-face.png"
        alt=""
        aria-hidden="true"
      />
      {/* WebGL reveal (fades in over the fallback when supported) */}
      <Liquid />
      <div className="hero__grain" aria-hidden="true" />
      <div className="hero__vignette" aria-hidden="true" />

      <div className="hero__inner wrap">
        <div className="hero__lead">
          <div className="hero__eyebrow" data-reveal="fade">
            <span className="rule" />
            <span className="eyebrow">Organic · Biodynamic · Cruelty-free</span>
          </div>

          <h1 className="hero__title display" data-reveal="lines">
            <span className="reveal-line">
              <span>Reveal your</span>
            </span>
            <span className="reveal-line line2">
              <span>
                <em>natural</em> glow
              </span>
            </span>
          </h1>

          <div className="hero__cta">
            <p className="hero__lede" data-reveal="fade" data-delay="0.15">
              Skincare designed to bring out the best in you — just powerful,
              living ingredients that Mother Nature gifted us.
            </p>

            <a
              href="#products"
              className="btn btn--solid"
              data-magnetic="0.4"
              data-reveal="fade"
              data-delay="0.25"
            >
              <span>Shop products</span>
              <i className="btn__arrow" />
            </a>
          </div>
        </div>

        <div className="hero__scroll" aria-hidden="true">
          <span>Scroll</span>
          <span className="bar" />
        </div>
      </div>
    </section>
  );
}
