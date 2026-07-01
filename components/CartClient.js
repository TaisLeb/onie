"use client";

import { useState } from "react";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

const parsePrice = (s) => parseFloat(String(s).replace(/[^0-9.]/g, ""));
const money = (n) => `$${n.toFixed(2)}`;

export default function CartClient() {
  // demo cart seeded with the featured product
  const seed = PRODUCTS.filter((p) => p.slug === "purify").map((p) => ({
    slug: p.slug,
    name: p.product,
    price: parsePrice(p.price),
    img: p.img,
    qty: 1,
  }));
  const [items, setItems] = useState(seed);
  const [placed, setPlaced] = useState(false);

  const setQty = (slug, d) =>
    setItems((is) =>
      is.map((i) =>
        i.slug === slug ? { ...i, qty: Math.max(1, Math.min(9, i.qty + d)) } : i
      )
    );
  const remove = (slug) => setItems((is) => is.filter((i) => i.slug !== slug));

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = items.length ? 5 : 0;
  const total = subtotal + shipping;

  const placeOrder = (e) => {
    e.preventDefault();
    if (!items.length) return;
    setPlaced(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="cart wrap">
      {/* ---------- order form ---------- */}
      <form className="cart__form" onSubmit={placeOrder}>
        <h1 className="cart__title display">Order</h1>

        <fieldset className="cart__group">
          <legend className="cart__legend">
            Contact info <span className="cart__req">*Required</span>
          </legend>
          <input className="fld" type="email" placeholder="*Email" aria-label="Email" required />
        </fieldset>

        <fieldset className="cart__group">
          <legend className="cart__legend">Shipping address</legend>
          <input className="fld" placeholder="*Full Name" aria-label="Full name" required />
          <input className="fld" placeholder="*Street Address" aria-label="Street address" required />
          <input className="fld" placeholder="Apartment, suite (optional)" aria-label="Address line 2" />
          <div className="cart__row3">
            <input className="fld" placeholder="*City" aria-label="City" required />
            <input className="fld" placeholder="*State/Province" aria-label="State or province" required />
            <input className="fld" placeholder="*ZIP Code" aria-label="ZIP code" required />
          </div>
        </fieldset>

        <fieldset className="cart__group">
          <legend className="cart__legend">Payment</legend>
          <input className="fld" placeholder="*Card Number   1234 1234 1234 1234" aria-label="Card number" required />
          <div className="cart__row2">
            <input className="fld" placeholder="*Expiration Date (MM/YY)" aria-label="Expiration date" required />
            <input className="fld" placeholder="*Security Code" aria-label="Security code" required />
          </div>
          <input className="fld" placeholder="Name On Card" aria-label="Name on card" />
          <label className="cart__check">
            <input type="checkbox" defaultChecked /> Billing address same as shipping
            address
          </label>
        </fieldset>
      </form>

      {/* ---------- order summary ---------- */}
      <aside className="cart__side">
        <div className="cart__summary">
          <h2 className="cart__title display">Order summary</h2>

          {items.length === 0 ? (
            <p className="cart__empty">
              {placed ? "Thank you — your order is on its way ✦" : "Your cart is empty."}{" "}
              <Link href="/#products" className="cart__emptylink">
                Shop products
              </Link>
            </p>
          ) : (
            <ul className="cart__items">
              {items.map((i) => (
                <li className="citem" key={i.slug}>
                  <div className="citem__media">
                    <span className="citem__count">{i.qty}</span>
                    <img src={i.img} alt={i.name} />
                  </div>
                  <div className="citem__body">
                    <div className="citem__row">
                      <p className="citem__name">{i.name}</p>
                      <button
                        type="button"
                        className="citem__remove"
                        onClick={() => remove(i.slug)}
                        aria-label={`Remove ${i.name}`}
                      >
                        ×
                      </button>
                    </div>
                    <div className="citem__qty" aria-label="Quantity">
                      <button type="button" onClick={() => setQty(i.slug, -1)} aria-label="Decrease">
                        −
                      </button>
                      <span>{i.qty}</span>
                      <button type="button" onClick={() => setQty(i.slug, 1)} aria-label="Increase">
                        +
                      </button>
                    </div>
                  </div>
                  <span className="citem__price">{money(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <>
              <div className="cart__lines">
                <div>
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div>
                  <span>Shipping</span>
                  <span>{money(shipping)}</span>
                </div>
              </div>
              <div className="cart__total">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </>
          )}
        </div>

        <button
          className="cart__place"
          data-magnetic="0.25"
          onClick={placeOrder}
          disabled={!items.length}
        >
          {placed ? "Order placed ✦" : "Place Order"}
        </button>
      </aside>
    </section>
  );
}
