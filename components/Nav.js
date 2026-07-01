import Link from "next/link";

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
        <Link href="/#story" className="nav__link nav__link--hide">
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
        <a href="#" className="nav__link" aria-label="Cart">
          Cart (0)
        </a>
      </div>
    </header>
  );
}
