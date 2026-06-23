"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      setNote("Please enter a valid email.");
      return;
    }
    setNote("Thank you — your natural glow is on its way ✦");
    setEmail("");
  };

  return (
    <section className="section news wrap" id="contact">
      <h2 className="news__title" data-reveal="fade">
        Sign up for updates
      </h2>
      <form className="news__form" onSubmit={submit} data-reveal="fade" data-delay="0.1">
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
        />
        <button type="submit" data-magnetic="0.3">
          Submit <i className="btn__arrow" />
        </button>
      </form>
      <p className="news__note" role="status">
        {note}
      </p>
    </section>
  );
}
