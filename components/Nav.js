import Link from "next/link";
import CartLink from "@/components/CartLink";

export default function Nav() {
  return (
    <header className="nav">
      <div className="nav__side">
        <button className="nav__burger" aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
        <Link href="/#products" className="nav__link nav__link--hide">
          Shop
        </Link>
        <Link href="/about" className="nav__link nav__link--hide">
          About
        </Link>
      </div>
      <Link href="/" className="nav__brand">
        onie beauty<span className="dot" />
      </Link>
      <div className="nav__side nav__side--right">
        <Link href="/#contact" className="nav__link nav__link--hide">
          Contact
        </Link>
        <CartLink />
      </div>
    </header>
  );
}
