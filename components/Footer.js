import Link from "next/link";
import { IconYoutube, IconInstagram, IconTwitter } from "@/components/Art";

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__social">
            <a href="#" aria-label="YouTube">
              <IconYoutube />
            </a>
            <a href="#" aria-label="Instagram">
              <IconInstagram />
            </a>
            <a href="#" aria-label="Twitter">
              <IconTwitter />
            </a>
          </div>
          <nav className="footer__nav" aria-label="Footer">
            <Link href="/#products">Shop</Link>
            <Link href="/#contact">Contact</Link>
            <Link href="/about">About</Link>
            <Link href="/blog">Blog</Link>
          </nav>
        </div>
      </div>
      <div className="footer__wordmark" data-drift>
        onie beauty
      </div>
      <div className="wrap">
        <div className="footer__legal">
          <span>© 2026 Onie Beauty Cosmetics. All rights reserved.</span>
          <span>Designed &amp; developed by Taisiya Lebedeva</span>
        </div>
      </div>
    </footer>
  );
}
