import Link from "next/link";
import CartLink from "@/components/CartLink";

export default function Nav() {
  return (
    <header className="nav">
      <nav className="nav__side" aria-label="Primary">
        <Link href="/" className="nav__link">
          Home
        </Link>
        <Link href="/#products" className="nav__link">
          Shop
        </Link>
        <Link href="/about" className="nav__link">
          About
        </Link>
      </nav>
      <Link href="/" className="nav__brand">
        onie beauty<span className="dot" />
      </Link>
      <div className="nav__side nav__side--right">
        <Link href="/#contact" className="nav__link">
          Contact
        </Link>
        <CartLink />
      </div>
    </header>
  );
}
