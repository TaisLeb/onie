"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

const parsePrice = (s) => parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;

export default function ProductBuy({ slug, name, product, price, img }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const add = () => {
    setAdded(true);
    addToCart(
      { slug, name: product || name, price: parsePrice(price), img },
      qty
    );
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="buy">
      <div className="buy__qty" aria-label="Quantity">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span>{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(9, q + 1))}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        className="btn btn--solid buy__add"

        onClick={add}
      >
        <span>{added ? "Added to cart ✦" : "Add to cart"}</span>
        {!added && <i className="btn__arrow" />}
      </button>
    </div>
  );
}
