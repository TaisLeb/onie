import Link from "next/link";
import { notFound } from "next/navigation";
import Motion from "@/components/Motion";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductBuy from "@/components/ProductBuy";
import { PRODUCTS, getProduct } from "@/lib/products";

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
              <ProductBuy name={p.name} price={p.price} />
            </div>
          </div>
        </section>

        {/* ---------- editorial ---------- */}
        <section className="section wrap pdp__ed">
          <div className="pdp__ed-stage" data-reveal="fade">
            <div className="pdp__ed-photo">
              <img
                src="/img/story-woman.jpg"
                alt="Onie Beauty ritual"
                loading="lazy"
              />
            </div>
            <div className="pdp__ed-swatch">
              <img src="/img/cream-swatch.png" alt="" loading="lazy" />
            </div>
            <span className="pdp__ed-ings" aria-hidden="true">
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
              data-magnetic="0.4"
              data-reveal="fade"
              data-delay="0.15"
            >
              <span>Shop all products</span>
              <i className="btn__arrow" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
