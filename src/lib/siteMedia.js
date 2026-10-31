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
export const HERO_MOBILE = { width: 1512, height: 1650 }; // 756 × 825 in the phone spec, at 2×
export const HERO_MAX_SLIDES = 10;

const builtInSlide = (id, title, href, desktop, mobile) => ({
  id,
  title,
  href,
  desktop: { src: desktop, ...HERO_DESKTOP },
  mobile: mobile ? { src: mobile, ...HERO_MOBILE } : null,
});

export const DEFAULT_HERO_SLIDES = [
  // The mockup's hero. Until the designer's 5700 × 1950 file is uploaded, both
  // versions are cut from the mockups (desktop soft at full width).
  builtInSlide(
    "shopAll",
    "Shop All",
    "/collections/shop-all",
    "/images/home/v3/hero-shop-all-mock-v1.webp",
    "/images/home/v3/hero-shop-all-mobile-mock-v1.webp",
  ),
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

// Trust strip tiles: one image with the icon and its label, used on every
// device (a row on desktop, two rows of three on phones), plus the popup a tap
// opens.
const trust = (id, label, strip, popup) => [
  {
    key: `trust.${id}.strip`,
    label: `${label} — icon & label`,
    hint: "Icon with its label baked in, transparent background. About 75px tall on desktop, 40px on phones.",
    ...strip,
    maxWidth: 1200,
  },
  ...(popup
    ? [
        {
          key: `trust.${id}.popup`,
          label: `${label} — popup`,
          hint: "Shown when the tile is tapped. 1094 × 1437 recommended.",
          src: popup,
          width: 1094,
          height: 1437,
          maxWidth: 1200,
        },
      ]
    : []),
];

// An image slot that links somewhere. `alt` is what a screen reader hears in
// place of the text drawn into the art.
//
// `cta` is the button the website draws over the art — the designer's files
// carry the title and tagline but not the button. Its box is in percent of the
// art (x, y = top-left corner; w, h = size) and `size` is the label's font size
// in percent of the art's width, so it scales with the image and always lands
// on the same spot. Positions were measured from the 2026-10 mockups and
// checked against the supplied artwork; replacement art should leave that
// spot clear.
const card = (key, label, { src, width, height, maxWidth, hint, href, alt, cta, ctas, phoneCrop, phoneCardCrop }) => ({
  key,
  label,
  hint,
  src,
  width,
  height,
  maxWidth,
  href,
  alt: alt || label,
  ...(cta ? { cta } : {}),
  ...(ctas ? { ctas } : {}),
  ...(phoneCrop ? { phoneCrop } : {}),
  ...(phoneCardCrop ? { phoneCardCrop } : {}),
});

const V3 = (name) => `/images/home/v3/${name}.webp`;
// Brand cards are still cut from the mockup until their artwork arrives.
const MOCK = (name) => `/images/home/mock/${name}-mock-v1.webp`;

// The supplied sample cards stand in for every wide card until each one's own
// art is uploaded.
const SAMPLE_SEASONS = V3("card-sample-all-seasons-v1");
const SAMPLE_FRESH = V3("card-sample-fresh-v1");

// "Explore →" on a 1788 × 767 card, from the mockup: same spot on every card,
// below the tagline.
const EXPLORE = { label: "Explore", x: 7.48, y: 63.5, w: 22.3, h: 16.2, size: 3.85 };

// Phones show these cards at 637 × 300 (the 756-unit phone spec), narrower
// than the art, so the middle 91.08% of its width is shown there.
const PHONE_CARD_CROP = { start: 4.46, span: 91.08 };

const WIDE_CARD = { width: 1788, height: 767, maxWidth: 1788, hint: "1788 × 767 with the title and tagline on the left; leave the lower-left clear for the Explore button. Phones trim 4.5% off each side." };
const wideCard = (key, label, src, href, alt, look = "pill-dark") =>
  card(key, label, { src, ...WIDE_CARD, href, alt, cta: { ...EXPLORE, look }, phoneCardCrop: PHONE_CARD_CROP });

const brand = (id, name, mock) =>
  card(`brands.${id}`, name, {
    src: MOCK(mock),
    width: 858,
    height: 858,
    maxWidth: 858,
    hint: "858 × 858, shown as a circle. Logo is part of the image.",
    href: `/collections/shop-all?search=${encodeURIComponent(name)}&view=products`,
  });

// Offer banners: a desktop file (5700 × 1200) and a phone file, each with its
// own button position.
const promo = (id, label, href, desktop, phone) => [
  card(`promo.${id}`, `${label} — desktop`, {
    src: desktop.src,
    width: 5700,
    height: 1200,
    maxWidth: 2880,
    hint: "5700 × 1200 full-width banner. The whole banner is the link.",
    href,
    alt: label,
    cta: desktop.cta,
  }),
  card(`promo.${id}.mobile`, `${label} — phone`, {
    src: phone.src,
    width: 1512,
    height: 720,
    maxWidth: 1512,
    hint: "1512 × 720 phone banner (756 × 360 in the phone spec). The whole banner is the link.",
    href,
    alt: label,
    cta: phone.cta,
  }),
];

export const SITE_MEDIA_SECTIONS = [
  {
    id: "trust",
    title: "Trust strip",
    note: "The six tiles under the hero: one row on desktop, two rows of three on phones. Tap a tile to see its popup.",
    slots: [
      ...trust(
        "frenchIngredients",
        "French Ingredients",
        { src: "/images/home/trust/french-ingredients.webp", width: 770, height: 340 },
        "/images/home/trust/french-ingredients-popup-v3.png",
      ),
      ...trust(
        "highConcentration",
        "High Concentration",
        { src: "/images/home/trust/high-concentration.webp", width: 874, height: 345 },
        "/images/home/trust/high-concentration-popup-v1.png",
      ),
      ...trust(
        "longLasting",
        "Long-Lasting",
        { src: "/images/home/trust/long-lasting.webp", width: 972, height: 346 },
        "/images/home/trust/long-lasting-popup-v1.png",
      ),
      ...trust(
        "affordableLuxury",
        "Affordable Luxury",
        { src: "/images/home/trust/affordable-luxury.webp", width: 893, height: 346 },
        "/images/home/trust/affordable-luxury-popup-v1.png",
      ),
      {
        key: "trust.trusted.icon",
        label: "Trusted by Customers — icon",
        hint: "Shield and handshake, icon only, transparent background. The label is set by the website.",
        src: V3("trust-trusted-icon-mock-v2"),
        width: 246,
        height: 276,
        maxWidth: 600,
      },
      ...trust(
        "freeShipping",
        "Free Shipping",
        { src: "/images/home/trust/free-shipping.webp", width: 581, height: 344 },
        "/images/home/trust/free-shipping-popup-v1.png",
      ),
    ],
  },
  {
    id: "gender",
    title: "Shop By Gender",
    note: "Three cards under the trust strip; a swipeable row on phones. Showing the sample card until each is uploaded.",
    slots: [
      wideCard("gender.men", "For Men", SAMPLE_SEASONS, "/collections/shop-all?gender=men", "For Men — Bold. Distinctive. Timeless."),
      wideCard("gender.women", "For Women", SAMPLE_FRESH, "/collections/shop-all?gender=women", "For Women — Elegant. Graceful. Unique.", "pill-coral"),
      wideCard("gender.unisex", "Unisex", SAMPLE_SEASONS, "/collections/shop-all?gender=unisex", "Unisex — Beyond Boundaries.", "pill-outline"),
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
      wideCard("seasons.all", "All Seasons", SAMPLE_SEASONS, "/collections/shop-all?tags=all-seasons", "All Seasons — scents for every moment."),
      wideCard("seasons.summer", "Summer & Spring", SAMPLE_SEASONS, "/collections/shop-all?tags=spring,summer", "Summer & Spring — fresh scents for brighter days."),
      wideCard("seasons.winter", "Winter & Autumn", SAMPLE_SEASONS, "/collections/shop-all?tags=autumn,winter", "Winter & Autumn — warm scents for cozy moments."),
    ],
  },
  {
    id: "editions",
    title: "Shop By Edition",
    note: "One banner with a button on each half. Phones show it as two cards: the left and right 42.5% (Luxury, Premium).",
    slots: [
      card("editions.banner", "Luxury & Premium banner", {
        src: V3("editions-v1"),
        width: 5432,
        height: 1088,
        maxWidth: 2880,
        hint: "5432 × 1088. Luxury text on the left, Premium on the right; keep the space under each list clear for its button.",
        alt: "Luxury Edition and Premium Edition",
        // Each phone card is 637 × 300 (2.123:1): 42.53% of the banner's width.
        phoneCrop: 42.53,
        ctas: [
          { label: "Shop Luxury", href: "/collections/shop-all?edition=luxury", look: "pill-outline-gold", x: 5.91, y: 78.5, w: 11.9, h: 12.6, size: 1.46 },
          { label: "Shop Premium", href: "/collections/shop-all?edition=premium", look: "pill-dark", x: 74.96, y: 78.5, w: 13.5, h: 12.6, size: 1.46 },
        ],
      }),
    ],
  },
  {
    id: "scents",
    title: "Shop By Scent Profile",
    slots: [
      wideCard("scents.fresh", "Fresh", SAMPLE_FRESH, "/collections/shop-all?scentFamily=Fresh", "Fresh — bright, clean, refreshing."),
      wideCard("scents.fruity", "Fruity", SAMPLE_FRESH, "/collections/shop-all?scentFamily=Fruity", "Fruity — juicy, vibrant, playful."),
      wideCard("scents.floral", "Floral", SAMPLE_FRESH, "/collections/shop-all?scentFamily=Floral", "Floral — elegant, romantic, delicate."),
    ],
  },
  {
    id: "promos",
    title: "Offer banners",
    note: "The three full-width banners above the footer, in this order. Phones get their own, taller files.",
    slots: [
      ...promo(
        "discoveryBox",
        "Discovery Box",
        "/collections/discovery-box",
        {
          src: V3("promo-discovery-box-v1"),
          // The mockup's spot, nudged 2.5% left so it clears the Eiffel Tower's leg.
          cta: { label: "Build Your Box", look: "rect-dark-caps", x: 75.95, y: 75.0, w: 13.3, h: 12.8, size: 0.99 },
        },
        {
          src: V3("promo-discovery-box-mobile-mock-v3"),
          cta: { label: "Build Your Box", look: "pill-dark", x: 55.0, y: 72.47, w: 28.7, h: 11.86, size: 3.2 },
        },
      ),
      ...promo(
        "specialOffers",
        "Special Offers",
        "/collections/shop-all?specialOffer=true",
        {
          src: V3("promo-special-offers-v1"),
          cta: { label: "Explore", look: "rect-dark", x: 14.83, y: 74.0, w: 7.82, h: 12.2, size: 1.02 },
        },
        {
          src: V3("promo-special-offers-mobile-mock-v3"),
          cta: { label: "Shop Now", look: "pill-dark", x: 7.6, y: 81.5, w: 22.8, h: 12.08, size: 3.2 },
        },
      ),
      ...promo(
        "bundleOffers",
        "Bundle Offers",
        "/collections/shop-all",
        {
          src: V3("promo-bundle-offers-v1"),
          // The mockup puts this under the discount box, but in the final art
          // the box runs to the bottom edge, so it sits after the subtitle.
          cta: { label: "Shop Now", look: "pill-gray-caps", x: 32.6, y: 31.75, w: 7.82, h: 8.7, size: 0.8 },
        },
        {
          src: V3("promo-bundle-offers-mobile-mock-v2"),
          cta: { label: "Shop Now", look: "pill-dark", x: 38.6, y: 75.8, w: 22.8, h: 12.73, size: 3.2 },
        },
      ),
    ],
  },
];

export const SLOTS = Object.fromEntries(
  SITE_MEDIA_SECTIONS.flatMap((s) => s.slots).map((slot) => [slot.key, slot]),
);

// Merges overrides ({ key: { url, width, height } }) over the defaults and
// returns { key: { src, width, height, custom, href, alt, cta… } } for every
// slot. Overrides for
// keys no longer in the registry are ignored rather than rendered.
export function resolveMedia(overrides = {}) {
  const out = {};
  for (const [key, slot] of Object.entries(SLOTS)) {
    const o = overrides[key];
    const art = o?.url
      ? { src: o.url, width: o.width || slot.width, height: o.height || slot.height, custom: true }
      : { src: slot.src, width: slot.width, height: slot.height, custom: false };
    out[key] = { ...art, href: slot.href, alt: slot.alt, cta: slot.cta, ctas: slot.ctas, phoneCrop: slot.phoneCrop, phoneCardCrop: slot.phoneCardCrop };
  }
  return out;
}

// Every slot at its built-in default. Components take this as their default
// `media` prop, so rendering one without the map still shows real images.
export const DEFAULT_MEDIA = resolveMedia({});
