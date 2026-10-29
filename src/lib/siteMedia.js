// Every image on the homepage that an admin can replace, with the file it
// falls back to. This module is plain data so both the homepage (server) and
// the admin screen (client) can import it — nothing here touches the database.
//
// The database only ever holds *overrides*: a slot with no override renders
// its built-in default, and "Reset to default" just deletes the override.
//
// `width`/`height` give the slot's shape — the designer's spec size, which the
// default file matches in proportion. The trust strip sizes by intrinsic
// dimensions, so an override records the processed image's own dimensions
// alongside its URL.
// `maxWidth` caps what an upload is resized to — a 5700px designer export is
// never served as-is.

// The hero is a list, not fixed slots: admins add, remove and reorder slides.
// Until the list has been saved once, these built-in slides are shown. A slide
// with no phone art is hidden on phones rather than cropped.
export const HERO_DESKTOP = { width: 2880, height: 985 };
export const HERO_MOBILE = { width: 1290, height: 1405 };
export const HERO_MAX_SLIDES = 10;

const builtInSlide = (id, title, href, desktop, mobile) => ({
  id,
  title,
  href,
  desktop: { src: desktop, ...HERO_DESKTOP },
  mobile: mobile ? { src: mobile, ...HERO_MOBILE } : null,
});

export const DEFAULT_HERO_SLIDES = [
  builtInSlide(
    "bestSellers",
    "Best Sellers",
    "/collections/shop-all?bestSeller=true",
    "/images/home/hero-best-sellers-v5.webp",
    "/images/home/hero-best-sellers-mobile-v5.webp",
  ),
  builtInSlide(
    "specialOffers",
    "Special Offers",
    "/collections/shop-all?specialOffer=true",
    "/images/home/hero-special-offers-v5.webp",
    null,
  ),
  builtInSlide(
    "bundleOffers",
    "Bundle Offers",
    "/collections/shop-all",
    "/images/home/hero-bundle-offers-v5.webp",
    "/images/home/hero-bundle-offers-mobile-v5.webp",
  ),
  builtInSlide(
    "discoveryBox",
    "Discovery Box",
    "/collections/discovery-box",
    "/images/home/hero-discovery-box-v5.webp",
    "/images/home/hero-discovery-box-mobile-v5.webp",
  ),
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

// A slot whose art carries its own text and button (the designer bakes the
// label, tagline and "Explore" into the image), so the whole image is the
// link. `alt` is what a screen reader hears in place of that baked-in text.
const card = (key, label, { src, width, height, maxWidth, hint, href, alt }) => ({
  key,
  label,
  hint,
  src,
  width,
  height,
  maxWidth,
  href,
  alt: alt || label,
});

// Until the designer's full-size files are uploaded, each slot shows its box
// cut from the approved homepage mockup (public/images/home/mock). They are
// soft at full size; that is expected for a placeholder.
const MOCK = (name) => `/images/home/mock/${name}-mock-v1.webp`;

const WIDE_CARD = { width: 1788, height: 767, maxWidth: 1788, hint: "1788 × 767. Text and button are part of the image." };
const wideCard = (key, label, mock, href, alt) =>
  card(key, label, { src: MOCK(mock), ...WIDE_CARD, href, alt });

const brand = (id, name, mock) =>
  card(`brands.${id}`, name, {
    src: MOCK(mock),
    width: 858,
    height: 858,
    maxWidth: 858,
    hint: "858 × 858, shown as a circle. Logo is part of the image.",
    href: `/collections/shop-all?search=${encodeURIComponent(name)}&view=products`,
  });

const promo = (id, label, mock, href) =>
  card(`promo.${id}`, label, {
    src: MOCK(mock),
    width: 5700,
    height: 1200,
    maxWidth: 2880,
    hint: "5700 × 1200 full-width banner. The whole banner is the link.",
    href,
  });

export const SITE_MEDIA_SECTIONS = [
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
    id: "gender",
    title: "Shop By Gender",
    note: "Three cards under the trust strip. On phones they become a swipeable row.",
    slots: [
      wideCard("gender.men", "For Men", "gender-men", "/collections/shop-all?gender=men", "For Men — Bold. Distinctive. Timeless."),
      wideCard("gender.women", "For Women", "gender-women", "/collections/shop-all?gender=women", "For Women — Elegant. Graceful. Unique."),
      wideCard("gender.unisex", "Unisex", "gender-unisex", "/collections/shop-all?gender=unisex", "Unisex — Beyond Boundaries."),
    ],
  },
  {
    id: "brands",
    title: "Shop By Brand",
    note: "Round brand cards. Six show at once on desktop; the arrows scroll the rest.",
    slots: [
      brand("creed", "Creed", "brand-creed"),
      brand("dolceGabbana", "Dolce & Gabbana", "brand-dolce-gabbana"),
      brand("frenchAromas", "French Aromas", "brand-french-aromas"),
      brand("armani", "Giorgio Armani", "brand-armani"),
      brand("gucci", "Gucci", "brand-gucci"),
      brand("jeanPaulGaultier", "Jean Paul Gaultier", "brand-jean-paul-gaultier"),
    ],
  },
  {
    id: "seasons",
    title: "Shop By Season",
    slots: [
      wideCard("seasons.all", "All Seasons", "season-all", "/collections/shop-all?tags=all-seasons", "All Seasons — scents for every moment."),
      wideCard("seasons.summer", "Summer & Spring", "season-summer", "/collections/shop-all?tags=spring,summer", "Summer & Spring — fresh scents for brighter days."),
      wideCard("seasons.winter", "Winter & Autumn", "season-winter", "/collections/shop-all?tags=autumn,winter", "Winter & Autumn — warm scents for cozy moments."),
    ],
  },
  {
    id: "editions",
    title: "Shop By Edition",
    note: "One banner: the left half opens Luxury, the right half opens Premium.",
    slots: [
      card("editions.banner", "Luxury & Premium banner", {
        src: MOCK("editions"),
        width: 5432,
        height: 1088,
        maxWidth: 2880,
        hint: "5432 × 1088. Keep Luxury on the left half and Premium on the right.",
        alt: "Luxury Edition and Premium Edition",
      }),
    ],
  },
  {
    id: "scents",
    title: "Shop By Scent Profile",
    slots: [
      wideCard("scents.fresh", "Fresh", "scent-fresh", "/collections/shop-all?scentFamily=Fresh", "Fresh — bright, clean, refreshing."),
      wideCard("scents.fruity", "Fruity", "scent-fruity", "/collections/shop-all?scentFamily=Fruity", "Fruity — juicy, vibrant, playful."),
      wideCard("scents.floral", "Floral", "scent-floral", "/collections/shop-all?scentFamily=Floral", "Floral — elegant, romantic, delicate."),
    ],
  },
  {
    id: "promos",
    title: "Offer banners",
    note: "The three full-width banners above the footer, in this order.",
    slots: [
      promo("discoveryBox", "Discovery Box", "promo-discovery-box", "/collections/discovery-box"),
      promo("specialOffers", "Special Offers", "promo-special-offers", "/collections/shop-all?specialOffer=true"),
      promo("bundleOffers", "Bundle Offers", "promo-bundle-offers", "/collections/shop-all"),
    ],
  },
];

export const SLOTS = Object.fromEntries(
  SITE_MEDIA_SECTIONS.flatMap((s) => s.slots).map((slot) => [slot.key, slot]),
);

// Merges overrides ({ key: { url, width, height } }) over the defaults and
// returns { key: { src, width, height, custom, href, alt } } for every slot. Overrides for
// keys no longer in the registry are ignored rather than rendered.
export function resolveMedia(overrides = {}) {
  const out = {};
  for (const [key, slot] of Object.entries(SLOTS)) {
    const o = overrides[key];
    const art = o?.url
      ? { src: o.url, width: o.width || slot.width, height: o.height || slot.height, custom: true }
      : { src: slot.src, width: slot.width, height: slot.height, custom: false };
    out[key] = { ...art, href: slot.href, alt: slot.alt };
  }
  return out;
}

// Every slot at its built-in default. Components take this as their default
// `media` prop, so rendering one without the map still shows real images.
export const DEFAULT_MEDIA = resolveMedia({});
