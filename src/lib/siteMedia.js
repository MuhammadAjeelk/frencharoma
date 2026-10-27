// Every image on the homepage that an admin can replace, with the file it
// falls back to. This module is plain data so both the homepage (server) and
// the admin screen (client) can import it — nothing here touches the database.
//
// The database only ever holds *overrides*: a slot with no override renders
// its built-in default, and "Reset to default" just deletes the override.
//
// `width`/`height` are the default file's real pixels. Sections that size by
// intrinsic dimensions (the trust strip, the brand collage) use them, so an
// override records the processed image's own dimensions alongside its URL.
// `maxWidth` caps what an upload is resized to — a 5700px designer export is
// never served as-is.

import { SCENTS } from "./scentProfiles";

const hero = (id, label, desktop, mobile) => [
  {
    key: `hero.${id}.desktop`,
    label: `${label} — desktop`,
    hint: "Wide banner. 2880 × 985 recommended; anything wider is cropped to fit.",
    src: desktop,
    width: 2880,
    height: 985,
    maxWidth: 2880,
  },
  {
    key: `hero.${id}.mobile`,
    label: `${label} — phone`,
    hint: mobile
      ? "Phone banner. 1290 × 1405 recommended."
      : "Phone banner. 1290 × 1405 recommended. Until one is uploaded this slide is hidden on phones.",
    src: mobile,
    width: 1290,
    height: 1405,
    maxWidth: 1290,
  },
];

const trust = (id, label, strip, icon, popup) => [
  {
    key: `trust.${id}.strip`,
    label: `${label} — strip (desktop)`,
    hint: "Icon with its label baked in, transparent background. About 60px tall on screen.",
    ...strip,
    maxWidth: 1200,
  },
  {
    key: `trust.${id}.icon`,
    label: `${label} — icon (phone & tablet)`,
    hint: "Icon only, transparent background. About 40px tall on screen.",
    ...icon,
    maxWidth: 600,
  },
  ...(popup
    ? [
        {
          key: `trust.${id}.popup`,
          label: `${label} — popup`,
          hint: "Shown when the icon is tapped. 1094 × 1437 recommended.",
          src: popup,
          width: 1094,
          height: 1437,
          maxWidth: 1200,
        },
      ]
    : []),
];

const card = (key, label, src, width, height, maxWidth, hint) => ({
  key,
  label,
  hint,
  src,
  width,
  height,
  maxWidth,
});

export const SITE_MEDIA_SECTIONS = [
  {
    id: "hero",
    title: "Hero banners",
    note: "The banner images already include their “Explore Collection” button, so the whole slide is the link.",
    slots: [
      ...hero(
        "bestSellers",
        "Best Sellers",
        "/images/home/hero-best-sellers-v5.webp",
        "/images/home/hero-best-sellers-mobile-v5.webp",
      ),
      ...hero("specialOffers", "Special Offers", "/images/home/hero-special-offers-v5.webp", null),
      ...hero(
        "bundleOffers",
        "Bundle Offers",
        "/images/home/hero-bundle-offers-v5.webp",
        "/images/home/hero-bundle-offers-mobile-v5.webp",
      ),
      ...hero(
        "discoveryBox",
        "Discovery Box",
        "/images/home/hero-discovery-box-v5.webp",
        "/images/home/hero-discovery-box-mobile-v5.webp",
      ),
    ],
  },
  {
    id: "trust",
    title: "Trust strip",
    note: "The row of icons under the hero. Desktop shows the labelled version, phones and tablets the icon alone.",
    slots: [
      ...trust(
        "frenchIngredients",
        "French Ingredients",
        { src: "/images/home/trust/french-ingredients.webp", width: 770, height: 340 },
        { src: "/images/home/trust/french-ingredients-icon.webp", width: 174, height: 240 },
        "/images/home/trust/french-ingredients-popup-v3.png",
      ),
      ...trust(
        "highConcentration",
        "High Concentration",
        { src: "/images/home/trust/high-concentration.webp", width: 874, height: 345 },
        { src: "/images/home/trust/high-concentration-icon.webp", width: 155, height: 240 },
        "/images/home/trust/high-concentration-popup-v1.png",
      ),
      ...trust(
        "longLasting",
        "Long-Lasting",
        { src: "/images/home/trust/long-lasting.webp", width: 972, height: 346 },
        { src: "/images/home/trust/long-lasting-icon.webp", width: 275, height: 240 },
        "/images/home/trust/long-lasting-popup-v1.png",
      ),
      ...trust(
        "affordableLuxury",
        "Affordable Luxury",
        { src: "/images/home/trust/affordable-luxury.webp", width: 893, height: 346 },
        { src: "/images/home/trust/affordable-luxury-icon.webp", width: 269, height: 240 },
        "/images/home/trust/affordable-luxury-popup-v1.png",
      ),
      ...trust(
        "freeShipping",
        "Free Shipping",
        { src: "/images/home/trust/free-shipping.webp", width: 581, height: 344 },
        { src: "/images/home/trust/free-shipping.webp", width: 581, height: 344 },
        "/images/home/trust/free-shipping-popup-v1.png",
      ),
    ],
  },
  {
    id: "brands",
    title: "Shop By Brand",
    note: "The collage behind the moving brand pills. The pills sit across its lower third.",
    slots: [
      card(
        "brands.collage",
        "Brand collage",
        "/images/home/new/brand-collage-v2.webp",
        2000,
        1211,
        2400,
        "2000 × 1211 recommended. Keep the lower third quiet — the pills cover it.",
      ),
    ],
  },
  {
    id: "gender",
    title: "Shop By Gender",
    note: "Cards are cropped to 550 × 477.",
    slots: [
      card("gender.men", "Men", "/images/home/new/gender-men-v2.webp", 1100, 954, 1400, "1100 × 954 recommended."),
      card("gender.women", "Women", "/images/home/new/gender-women-v2.webp", 1100, 956, 1400, "1100 × 954 recommended."),
      card("gender.unisex", "Unisex", "/images/home/new/gender-unisex-v2.webp", 1100, 956, 1400, "1100 × 954 recommended."),
    ],
  },
  {
    id: "editions",
    title: "Shop By Edition",
    note: "Cards are cropped to 2443 × 1564.",
    slots: [
      card("editions.luxury", "Luxury Edition", "/images/home/new/edition-luxury-v2.webp", 1600, 1020, 1800, "1600 × 1024 recommended."),
      card("editions.premium", "Premium Edition", "/images/home/new/edition-premium-v2.webp", 1600, 1028, 1800, "1600 × 1024 recommended."),
    ],
  },
  {
    id: "seasons",
    title: "Shop By Season",
    note: "Square cards.",
    slots: [
      card("seasons.winter", "Winter & Autumn", "/images/home/new/season-winter-v2.webp", 1100, 1100, 1400, "1100 × 1100 recommended."),
      card("seasons.summer", "Summer & Spring", "/images/home/new/season-summer-v2.webp", 1100, 1099, 1400, "1100 × 1100 recommended."),
      card("seasons.all", "All Seasons", "/images/home/new/season-all-v2.webp", 1100, 1100, 1400, "1100 × 1100 recommended."),
    ],
  },
  {
    id: "scents",
    title: "Shop By Scent Profile",
    note: "Square cards.",
    slots: SCENTS.map((s) =>
      card(scentKey(s), s.name, s.img, 900, 900, 1200, "900 × 900 recommended."),
    ),
  },
];

// "/images/home/new/scent-oriental-v2.webp" -> "scents.oriental". Keyed off
// the file so renaming the display label never orphans an override.
export function scentKey(scent) {
  const m = /scent-([a-z]+)-v\d+/.exec(scent.img || "");
  return `scents.${m ? m[1] : scent.name.toLowerCase().replace(/[^a-z]+/g, "-")}`;
}

export const SLOTS = Object.fromEntries(
  SITE_MEDIA_SECTIONS.flatMap((s) => s.slots).map((slot) => [slot.key, slot]),
);

// Merges overrides ({ key: { url, width, height } }) over the defaults and
// returns { key: { src, width, height, custom } } for every slot. Overrides for
// keys no longer in the registry are ignored rather than rendered.
export function resolveMedia(overrides = {}) {
  const out = {};
  for (const [key, slot] of Object.entries(SLOTS)) {
    const o = overrides[key];
    out[key] = o?.url
      ? { src: o.url, width: o.width || slot.width, height: o.height || slot.height, custom: true }
      : { src: slot.src, width: slot.width, height: slot.height, custom: false };
  }
  return out;
}

// Every slot at its built-in default. Components take this as their default
// `media` prop, so rendering one without the map still shows real images.
export const DEFAULT_MEDIA = resolveMedia({});
