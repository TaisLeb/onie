import Motion from "@/components/Motion";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BlogClient from "@/components/BlogClient";

export const metadata = {
  title: "Blog — Onie Beauty",
  description:
    "Organic beauty recipes and make-up tips from the Onie Beauty journal.",
};

export default function BlogPage() {
  return (
    <>
      <Cursor />
      <Motion />
      <Nav />
      <main className="blog">
        <div className="blog__head wrap">
          <p className="eyebrow" data-reveal="fade">
            The journal
          </p>
          <h1 className="blog__title display" data-reveal="fade" data-delay="0.05">
            Blog
          </h1>
        </div>
        <BlogClient />
      </main>
      <Footer />
    </>
  );
}
