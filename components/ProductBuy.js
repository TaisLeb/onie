"use client";

import { useState } from "react";

export default function ProductBuy({ name, price }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const add = () => {
    setAdded(true);
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
        data-magnetic="0.35"
        onClick={add}
      >
        <span>{added ? "Added to cart ✦" : "Add to cart"}</span>
        {!added && <i className="btn__arrow" />}
      </button>
    </div>
  );
}
