"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CartLink from "@/components/CartLink";

const mobileLinks = [
  ["Home", "/"],
  ["Shop", "/#products"],
  ["About", "/about"],
  ["Contact", "/#contact"],
];

export default function Nav({ heroOverlay = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [overHero, setOverHero] = useState(heroOverlay);
  const headerRef = useRef(null);

  useEffect(() => {
    if (!heroOverlay) return;
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOverHero(entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroOverlay]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <header ref={headerRef} className={`nav${menuOpen ? " nav--open" : ""}${heroOverlay && overHero ? " nav--hero" : ""}`}>
      <nav className="nav__side" aria-label="Primary">
        <Link href="/" className="nav__link type--scroll">Home</Link>
        <Link href="/#products" className="nav__link type--scroll">Shop</Link>
        <Link href="/about" className="nav__link type--scroll">About</Link>
      </nav>

      <button
        className="nav__menu-toggle"
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? "mobile-primary-menu" : undefined}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
      </button>

      <Link href="/" className="nav__brand" onClick={() => setMenuOpen(false)}>
        <span className="nav__brand-text">onie beauty</span><span className="dot" />
      </Link>

      <div className="nav__side nav__side--right">
        <Link href="/#contact" className="nav__link type--scroll">Contact</Link>
        <CartLink />
      </div>

      {menuOpen && (
        <nav id="mobile-primary-menu" className="nav__dropdown" aria-label="Mobile primary">
          {mobileLinks.map(([label, href]) => (
            <Link key={label} href={href} className="nav__dropdown-link type--scroll" onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
          {heroOverlay && <div className="nav__dropdown-cart"><CartLink /></div>}
        </nav>
      )}
    </header>
  );
}
