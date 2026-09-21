# Site-wide design migration

Bringing every customer-facing page onto the visual system established on the
homepage, without changing what anything does.

Status: **spec — not started.** Tick boxes as phases land.

---

## 1. What this is

The homepage was rebuilt against the designer's artwork. The rest of the site
still runs the previous look: navy `#1a1a2e`, old gold `#b8964e`, cream
`#faf8f5`, soft `rounded-xl` cards, bold headings. A customer moving from the
homepage to a product page currently crosses a visible seam.

This migration closes that seam. It is a **re-skin, not a rewrite**: markup and
styles change, behaviour does not.

### Out of scope

- `/(admin)/*` — internal tooling, not a brand surface. Left alone.
- Any change to data models, API routes, cart/wishlist logic, pricing rules,
  checkout flow, or auth.
- New features. If something looks missing, it is noted as a follow-up, not built.

---

## 2. The design system

Codified from the homepage. This is the contract every phase is checked against.

### Colour

| Token | Use |
|---|---|
| `#373838` | Primary dark section ground |
| `#2e2e2e` | Deeper dark (footer bottom bar) |
| `#d4c6ab` | Light section ground |
| `#d1c0ab` | Nav band / announcement strip |
| `#c9a25a` | Primary gold — headings, rules, borders |
| `#d1ae6d` | Brighter gold — card frames |
| `#e3c489` | Gold hover |
| `#211d18` | Warm near-black — text on light grounds |
| `#cbbfae` | Body text on dark grounds |
| `#a99d8c` | Muted/secondary text on dark |

Retired: `#1a1a2e`, `#b8964e`, `#faf8f5`, `#f7f5f2`, `#e8e4df`, `#1c1a17`,
`#211e1a`, `#17140f`.

### Type

- Section heading — Playfair Display, italic, `font-normal`, `text-2xl md:text-4xl`
- Subtitle — Playfair Display, `text-base md:text-xl`
- Body / UI — Geist
- **No tracked-out all-caps eyebrow labels.** Headings carry their own weight.

### Devices

- **Rule** — under a heading, inside an `inline-block` wrapper so it matches the
  title width: `h-[2px] md:h-[3px] w-full` with
  `bg-[linear-gradient(90deg,transparent_0%,<gold>_25%,<gold>_75%,transparent_100%)]`
- **View All** — outlined with an arrow, top-right on `md+`, centred below on mobile
- **Corners** — square on cards and frames; `rounded-full` stays for pills and badges
- **Frames** — thin gold border; feature cards use a double frame (outer border,
  `p-1.5` channel, inner border)
- **Hover** — no lift, no image zoom. Gold glow
  `shadow-[0_0_0_1px_rgba(209,174,109,0.45),0_14px_38px_rgba(209,174,109,0.22)]`
  plus `brightness-110` on photography
- **Gutter** — `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`, defined once per section
- **Rhythm** — `py-10 md:py-12` between sections
- **Reveal** — `threshold: 0`, `rootMargin: "0px 0px 20% 0px"`, 0.5s / 28px rise

---

## 3. Rules for every phase

1. **Behaviour is frozen.** No handler, route, query param, state shape or API
   call changes. If a re-skin would require one, stop and flag it.
2. **One phase, one commit.** Build must pass before committing.
3. **Verify before claiming.** Every phase ends with: `next build` clean, the
   page rendered in the browser at 1440 and 500, and the phase's own checks run.
4. **Leave the old token count lower than you found it.** Tracked below.
5. **Responsive is part of done,** not a follow-up pass.

---

## 4. Phases

Ordered so shared primitives land before the pages that consume them, and the
riskiest page is attempted only once the system is proven on simpler ones.

### Phase 0 — Foundation
- [ ] Add `src/components/ui/` with `SectionHeading`, `Rule`, `ViewAllLink`
- [ ] Export shared class constants for the card frame and gold-glow hover
- [ ] Write `CLAUDE.md` recording the design system so it survives this session
- [ ] Delete 5 unused components: `BundleOffers`, `Discovery`, `ShopByCategory`,
      `SpecialOffers`, `WhatMakesUsSpecial` — removes 32 old-token hits for free
- [ ] Confirm nothing imports them first

### Phase 1 — Global chrome
- [ ] `Header.js` (15 old-token hits), `PrimaryNav.js` (15)
- [ ] Mobile nav drawer / search overlay
- [ ] Check: header is the one element on every page; regressions here are sitewide

### Phase 2 — ProductCard
- [ ] `ProductCard.js` (13) — used by shop-all, wishlist, search results
- [ ] Keep `hoverReveal`, `boxMode`, edition pills, wishlist toggle, quick view
- [ ] Check: all three consumers render correctly after the change

### Phase 3 — Collections
- [ ] `PerfumeFilterBar.js` (31 — largest single offender)
- [ ] `collections/shop-all/page.js` (5, 581 lines)
- [ ] Check: every filter, sort, URL param and empty state still works

### Phase 4 — Product detail
- [ ] `products/[slug]/page.js` (6, **1189 lines — highest risk**)
- [ ] Gallery, edition selector, size selector, add-to-cart, reviews, related
- [ ] Split into sub-commits if it grows past one reviewable diff

### Phase 5 — Cart and modals
- [ ] `cart/page.js` (9), `OrderSummary.js` (2)
- [ ] `AddedToCartPopup.js` (6), `QuickAddModal.js` (3), `UniversalModal.js` (1),
      `EditionInfoModal.js` (2), `EditionChoiceModal.js` (2)
- [ ] Check: quantity, remove, empty cart, totals, discount lines

### Phase 6 — Checkout
- [ ] `checkout/page.js` (1, 472 lines)
- [ ] Check: validation, error states, payment method selection, order submit
- [ ] Highest-consequence surface — money. Change styling only, nothing else.

### Phase 7 — Account and orders
- [ ] `account/`, `account/login`, `account/signup`, `account/orders`
- [ ] `orders/[orderNumber]`, `track-order`
- [ ] Check: form validation and error messaging survive intact

### Phase 8 — Wishlist and Discovery Box ✅
- [x] `wishlist/page.js` — empty state, skeleton, unavailable-item fallback
- [x] `collections/discovery-box/page.js` — banner, sticky builder, grid, states
- [x] Checked: partial box, full box, sealed box, sold-out testers, no-match panel

**Follow-ups raised by this phase:**
- The slot remove control is a `<span onClick>` inside a `<button>`, so it is
  not focusable — a keyboard user cannot remove a tester. Needs a markup change,
  deferred out of a styling-only phase.
- `boxSwapTarget` is a dead prop: `ProductCard` implements the state, nothing
  passes it.
- `src/lib/gender.js` colours are ~3.3:1 on near-black — marginal contrast.
- `.scrollbar-thin` in `globals.css` uses a black thumb, invisible on dark.
- The checkout-prompt content inside `UniversalModal` is styled for a light
  sheet; it needs revisiting once Phase 5 darkens that modal.

### Phase 9 — Sweep
- [ ] Delete unused assets: old `wc-*`, `scent-*`, `season-*`, `edition-*`,
      `brand-collage.webp`, `gender-*` non-v2
- [ ] Old-token count to zero outside `(admin)`
- [ ] Responsive pass at 390 / 768 / 1440
- [ ] Keyboard focus visible on every interactive element
- [ ] `prefers-reduced-motion` respected

---

## 5. Edge cases to watch

Things a re-skin quietly breaks if nobody looks:

- **Empty states** — empty cart, empty wishlist, no search results, no orders.
  Easy to restyle the populated case and never render the empty one.
- **Loading skeletons** — must match the new palette *and* the real layout's
  column count. This already bit us on Best Sellers (3 placeholders, 4 cards).
- **Error and validation states** — red on the old cream ground may fail contrast
  on `#373838`.
- **Disabled states** — `bg-[#e8e4df] text-[#a09890]` is invisible on dark.
- **Sold out / out of stock** badges.
- **Long content** — long perfume names, long addresses, 3-line brand lists.
- **Text contrast on dark** — every retired token pair needs re-checking, not
  mechanical find-and-replace.
- **Image optimizer cache** — any asset that changes needs a new filename;
  Next keys its cache on URL, not contents.
- **Modals and portals** — render outside the section, so they inherit no ground
  colour. Each needs its own.
- **Admin** — shares `ProductCard` and some components. Phase 2 must not break it.

---

## 6. Progress

Old-token hits outside `(admin)`, by phase. Baseline taken at spec time.

| Phase | Baseline | After |
|---|---|---|
| Start | 180 | — |
| 0 — Foundation | 180 | 148 |
| 8 — Wishlist + Discovery Box | 148 | 117 |

Update this table as each phase lands.
