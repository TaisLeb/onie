"use client";

// Lightweight client-side cart persisted in localStorage. Full line items live
// under "onie:cart"; a derived count under "onie:cartCount". Every write fires
// an "onie:cart" event (detail = count) so the nav badge stays in sync.

export const CART_KEY = "onie:cart";
export const COUNT_KEY = "onie:cartCount";

export function readCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function cartCount(items) {
  return items.reduce((s, i) => s + (i.qty || 0), 0);
}

export function writeCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    const count = cartCount(items);
    localStorage.setItem(COUNT_KEY, String(count));
    window.dispatchEvent(new CustomEvent("onie:cart", { detail: count }));
  } catch {}
}

export function addToCart(item, qty = 1) {
  const items = readCart();
  const found = items.find((i) => i.slug === item.slug);
  if (found) found.qty = Math.min(9, found.qty + qty);
  else items.push({ ...item, qty: Math.min(9, qty) });
  writeCart(items);
  return items;
}
