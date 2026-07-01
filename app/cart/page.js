import Motion from "@/components/Motion";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CartClient from "@/components/CartClient";

export const metadata = {
  title: "Your Cart — Onie Beauty",
  description: "Review your order and check out.",
};

export default function CartPage() {
  return (
    <>
      <Cursor />
      <Motion />
      <Nav />
      <main className="cartpage">
        <CartClient />
      </main>
      <Footer />
    </>
  );
}
