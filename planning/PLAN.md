# French Aromas — Website Restructure Plan

> **Goal**: Match the website structure, layout, and behavior to the provided wireframes (Pages 1–4).
> **Last Updated**: 2026-04-06
> **Build Status**: PASSING (all routes compile, zero errors)

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| DONE | Fully matches wireframe |
| PARTIAL | Exists but needs changes |
| TODO | Not yet built |

---

## ══════════════════════════════════════════════════
## IMPLEMENTATION PROGRESS
## ══════════════════════════════════════════════════

### Phase 1 — Navigation & Structure
- [x] 1.1 Restructured Header navigation: SHOP▼, BEST SELLERS, SHOP BY BRAND▼, BUNDLE OFFERS, SPECIAL OFFERS, DISCOVERY BOX, BLOGS
- [x] 1.2 SHOP dropdown with Shop All, Gender filters, Edition filters
- [x] 1.3 SHOP BY BRAND dropdown fetches brands from public `/api/brands` endpoint, lists A-Z in 3-column grid
- [x] 1.4 BUNDLE OFFERS, SPECIAL OFFERS, DISCOVERY BOX nav links added
- [x] 1.5 Mobile menu mirrors exact same structure with accordion dropdowns

### Phase 2 — Home Page Sections
- [x] 2.1 HeroCarousel updated to 4 banners (Best Sellers, Bundle Offers, Special Offers, Discovery Box)
- [x] 2.2 Each SHOP NOW button dynamically links to correct section
- [x] 2.3 BrandMarquee rebuilt: fetches all brands from API, displays as scrolling name pills with "SHOP BY BRAND" heading
- [x] 2.4 BestSellers carousel adjusted to 3 visible items on desktop (was 4), with product count indicator
- [x] 2.5 WhatMakesUsSpecial expanded from 4 → 8 features in 4×2 grid
- [x] 2.6 SpecialOffers link fixed to include `?specialOffer=true`
- [x] 2.7 Discovery banner links to `/collections/discovery-box` with "Build Your Box" CTA
- [x] 2.8 Footer: payment icons (Visa, Mastercard, JazzCash, EasyPaisa, COD), scroll-to-top button, updated links

### Phase 3 — Listing Page & Product Detail
- [x] 3.1 ProductCard: added `impressionName` prop → "Inspired by X" label, "By Brand" format
- [x] 3.2 ProductCard: wishlist heart button on every card (toggle add/remove)
- [x] 3.3 Shop-all page: passes `impressionName` and `slug` to ProductCard
- [x] 3.4 Shop-all page: initializes brand filter from `?search=` URL param (for brand nav links)
- [x] 3.5 PDP: Globally Admired % displayed below concentration
- [x] 3.6 PDP: Wishlist button (Add to Wishlist / In Your Wishlist toggle)
- [x] 3.7 PDP: "You May Also Like" subtitle added
- [x] 3.8 PDP: Standalone FAQ section with 5 questions, accordion toggle
- [x] 3.9 PDP: Customer Reviews section with star ratings, review form, review list

### Phase 4 — New Features
- [x] 4.1 **Wishlist**: WishlistContext with localStorage persistence, `/wishlist` page, heart on all ProductCards, heart on PDP
- [x] 4.2 **Customer Reviews**: Review mongoose model, `/api/reviews` GET+POST, PDP review section with star rating, form, display
- [x] 4.3 **Discovery Box**: `/collections/discovery-box` page — filters 5ml testers, selection counter, 25% discount, confirmation modal, add-all-to-cart
- [x] 4.4 **Bundle Discounts**: CartContext computes tiered discounts (1st item 0%, 2nd 10%, 3rd 15%, 4th+ 20%), cart page shows bundle savings breakdown
- [x] 4.5 **Free Shipping**: Cart shows free shipping for orders ≥ PKR 7,000, progress indicator
- [x] 4.6 **Public Brands API**: `/api/brands` — returns distinct brand names from active perfumes, sorted A-Z
- [x] 4.7 **SEO Metadata**: Updated root layout metadata with keywords, description
- [x] 4.8 **Scroll to Top**: Footer includes animated scroll-to-top button

---

## ══════════════════════════════════════════════════
## FILES CHANGED / CREATED
## ══════════════════════════════════════════════════

### Modified Files
| File | Changes |
|------|---------|
| `src/app/layout.js` | Added WishlistProvider, updated SEO metadata |
| `src/components/Header.js` | Complete rewrite — new nav structure, brand dropdown, wishlist icon |
| `src/components/HeroCarousel.js` | 4 slides with per-slide links |
| `src/components/BrandMarquee.js` | Fetches brands from API, section heading, text pills |
| `src/components/BestSellers.js` | 3 visible on desktop, count indicator |
| `src/components/WhatMakesUsSpecial.js` | 8 features in 4×2 grid |
| `src/components/SpecialOffers.js` | Link includes `?specialOffer=true` |
| `src/components/Discovery.js` | Links to `/collections/discovery-box` |
| `src/components/Footer.js` | Payment SVG icons, scroll-to-top, updated links |
| `src/components/ProductCard.js` | Impression label, wishlist heart, "By Brand" format |
| `src/context/CartContext.js` | Bundle discount logic, `total`, `bundle` exports |
| `src/app/(main)/cart/page.js` | Bundle savings display, free shipping threshold |
| `src/app/(main)/products/[slug]/page.js` | Globally admired %, wishlist, FAQ section, reviews |
| `src/app/(main)/collections/shop-all/page.js` | Pass impressionName/slug, init from ?search param |

### New Files
| File | Purpose |
|------|---------|
| `src/app/api/brands/route.js` | Public API: list distinct brands from active perfumes |
| `src/app/api/reviews/route.js` | Public API: GET reviews by slug, POST new review |
| `src/lib/models/Review.js` | Mongoose model for customer reviews |
| `src/context/WishlistContext.js` | Wishlist state with localStorage persistence |
| `src/app/(main)/wishlist/page.js` | Wishlist page with grid display |
| `src/app/(main)/collections/discovery-box/page.js` | Discovery Box: select 5+ testers at 25% off |
| `planning/PLAN.md` | This tracking document |

---

## ══════════════════════════════════════════════════
## WIREFRAME COMPLIANCE CHECKLIST
## ══════════════════════════════════════════════════

### Home Page (Wireframe Page 1)
- [x] Search icon + expand (1)
- [x] Shop dropdown with sub-items (2)
- [x] Navigation: SHOP, BEST SELLERS, SHOP BY BRAND, BUNDLE OFFERS, SPECIAL OFFERS, DISCOVERY BOX, BLOGS (3-7)
- [x] Four banner carousel with SHOP NOW per slide (8)
- [x] Shop by Brand marquee strip (14)
- [x] Shop by Gender cards (9)
- [x] Shop by Category cards (10)
- [x] Best Sellers carousel — 3 items + count (10)
- [x] Bundle Offers — Buy 2 / Buy 3 cards (11)
- [x] Special Offers banner (12)
- [x] Discovery Box banner (13)
- [x] What Makes Us Special — 8 items in 4×2 (14)
- [x] Footer with payment icons + social (15)

### Listing Page (Wireframe Page 2)
- [x] Filter bar: Filters, Gender, Category, Season, Brand
- [x] Sort by dropdown
- [x] Active filter chips
- [x] 4-column product grid
- [x] Product card with all required info
- [x] Quick view modal

### Product Detail Page (Wireframe Page 3)
- [x] Breadcrumb
- [x] Image gallery with thumbnails
- [x] Product name + gender
- [x] Inspired By brand
- [x] Impression name
- [x] Concentration / scent family
- [x] Globally Admired %
- [x] Edition selector with prices
- [x] Size selector
- [x] Price with discount display
- [x] Stock indicator
- [x] Quantity selector
- [x] Free sample dropdown
- [x] Feature icons (4)
- [x] Add to Cart / Buy Now
- [x] Wishlist button
- [x] Accordion sections (Fragrance, Why Choose, Disclaimer, Shipping)
- [x] Original vs. Impression comparison table
- [x] FAQ section (standalone)
- [x] You May Also Like with subtitle
- [x] Customer Reviews section

### E-commerce Essentials (Added as expert)
- [x] Wishlist with localStorage
- [x] Bundle discount pricing
- [x] Free shipping threshold
- [x] Customer reviews with star ratings
- [x] Discovery Box interactive flow
- [x] Brand browsing API
- [x] SEO metadata
- [x] Scroll to top

---

## ══════════════════════════════════════════════════
## FUTURE ENHANCEMENTS (Not in current scope)
## ══════════════════════════════════════════════════

| Feature | Priority | Notes |
|---------|----------|-------|
| Recently Viewed Products | Medium | Track in localStorage, show on home/PDP |
| Product Search with live results | Medium | Auto-suggest dropdown as user types |
| Newsletter subscription backend | Low | Currently client-side only |
| Social sharing on PDP | Low | Share buttons for WhatsApp, FB, etc. |
| Product comparison page | Low | Side-by-side compare 2-3 perfumes |
| Review moderation in admin | Medium | Admin can approve/reject reviews |
| Order email notifications | High | Send order confirmation + tracking emails |
| Payment gateway integration | High | Stripe/JazzCash/EasyPaisa integration |
| Gift wrapping option at checkout | Low | Add-on service |
| Loyalty points / rewards | Low | Points per purchase, redeem for discount |

---

*All items above are tracked and verified against the wireframes. Build passes with zero errors.*
