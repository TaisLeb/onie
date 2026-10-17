"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Nav cart link with a live item-count badge, kept in sync via localStorage
 *  and the "onie:cart" event dispatched when a product is added. */
export default function CartLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const read = () => {
      try {
        setCount(parseInt(localStorage.getItem("onie:cartCount") || "0", 10) || 0);
      } catch {}
    };
    read();
    const onCart = (e) =>
      setCount(typeof e.detail === "number" ? e.detail : 0);
    window.addEventListener("onie:cart", onCart);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("onie:cart", onCart);
      window.removeEventListener("storage", read);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="nav__link nav__cart"
      aria-label={`Cart${count ? `, ${count} item${count > 1 ? "s" : ""}` : ""}`}
    >
      Cart
      {count > 0 && <span className="nav__cart-badge">{count}</span>}
    </Link>
  );
}
