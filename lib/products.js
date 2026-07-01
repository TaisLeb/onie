// Shared product catalogue — used by the homepage grid and the product pages.

export const PRODUCTS = [
  {
    slug: "purify",
    name: "Purify",
    tag: "So fresh & so clean",
    product: "Hydra-repair day cream",
    size: "65ml / 2.2oz",
    price: "$45.00",
    cardDesc: "Hydra-repair day cream that melts into thirsty skin.",
    desc: "With a luscious touch of hydrating mixture, this daily repair cream quenches the thirst of your skin. Apply morning and night to see the best results.",
    ingredients: [
      "Orange peel oil",
      "Mint",
      "Cucumber",
      "Aloe",
      "White turmeric",
      "Sweet fennel",
    ],
    img: "/img/cream-tube.png",
    // [smear, ingredient a, ingredient b] revealed behind the product on hover
    behind: [
      "/img/smear-orange.png",
      "/img/ing-orange.png",
      "/img/ing-orange-peel.png",
    ],
    c1: "rgba(240,150,70,0.85)",
    editorial: {
      title: ["Quench the", "thirst of your skin", "with nature’s best"],
      body: "A daily drink of water for your skin — orange peel oil and aloe flood it with moisture while cucumber and sweet fennel calm and clarify.",
    },
  },
  {
    slug: "nourish",
    name: "Nourish",
    tag: "You got that yummy-yum",
    product: "Nourishing skin-food cream",
    size: "100ml / 3.4oz",
    price: "$52.00",
    cardDesc: "A whipped skin-food balm that drinks in overnight.",
    desc: "A whipped skin-food cream enriched with activated charcoal, lava mud, tea tree oil, avocado and mint. It drinks into the skin overnight to deeply nourish and detoxify.",
    ingredients: [
      "Activated charcoal",
      "Lava mud",
      "Tea tree oil",
      "Avocado",
      "Cucumber",
      "Mint",
    ],
    img: "/img/nourish-jar.png",
    behind: [
      "/img/smear-cucumber.png",
      "/img/ing-cucumber.png",
      "/img/ing-mint.png",
    ],
    c1: "rgba(150,190,110,0.8)",
    editorial: {
      title: ["Feed your skin", "the greens", "it quietly craves"],
      body: "Whipped avocado and cool cucumber nourish while activated charcoal and lava mud draw out what the day left behind — waking skin, softer.",
    },
  },
  {
    slug: "brighten",
    name: "Brighten",
    tag: "Shine bright like a diamond",
    product: "Brightening vitamin serum",
    size: "65ml / 2.19oz",
    price: "$58.00",
    cardDesc: "A vitamin serum that wakes up a dull complexion.",
    desc: "A potent serum with saffron extract, licorice extract, vitamin C acerola and vitamin E papaya. It wakes a dull complexion for a lit-from-within glow.",
    ingredients: [
      "Saffron extract",
      "Licorice extract",
      "Vitamin C acerola",
      "Vitamin E",
      "Papaya",
    ],
    img: "/img/serum-tube.png",
    behind: [
      "/img/smear-saffron.png",
      "/img/ing-saffron-flower.png",
      "/img/oil-drop.png",
    ],
    c1: "rgba(200,90,70,0.8)",
    editorial: {
      title: ["Wake the glow", "that lives", "inside your skin"],
      body: "Saffron and acerola vitamin C brighten, licorice evens tone, and papaya enzymes polish — for a complexion that looks quietly lit from within.",
    },
  },
];

export function getProduct(slug) {
  return PRODUCTS.find((p) => p.slug === slug);
}
