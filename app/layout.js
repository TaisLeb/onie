import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://onie-beauty.vercel.app"),
  title: "Onie Beauty — Reveal Your Natural Glow",
  description:
    "Onie Beauty — organic, biodynamic skincare designed to reveal your natural glow. Just powerful, living ingredients that Mother Nature gifted us.",
  keywords: [
    "Onie Beauty",
    "organic skincare",
    "natural beauty",
    "biodynamic cosmetics",
    "clean beauty",
  ],
  openGraph: {
    title: "Onie Beauty — Reveal Your Natural Glow",
    description:
      "Organic, biodynamic skincare designed to reveal your natural glow.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#0b0b0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
