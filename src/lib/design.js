// Shared design tokens for the site-wide migration (docs/design-migration.md).
//
// Semantic colors resolve to the reference palette in app/globals.css.
// Keep these aliases for inline styles; Tailwind uses the same CSS variables.

export const COLORS = {
  darkGround: "var(--fa-dark)",
  darkDeep: "var(--fa-dark-deep)",
  lightGround: "var(--fa-cream)",
  band: "var(--fa-beige)",
  gold: "var(--fa-gold)",
  goldBright: "var(--fa-gold)",
  goldHover: "var(--fa-gold-hover)",
  ink: "var(--fa-ink)",
  bodyOnDark: "var(--fa-on-dark)",
  mutedOnDark: "var(--fa-muted-dark)",
};

// The page gutter, defined once. Sections apply this to their inner container
// and carry no horizontal padding of their own, or it doubles up.
export const GUTTER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

// Vertical rhythm between sections.
export const SECTION_Y = "py-10 md:py-12";

// Cards never lift or zoom on hover — the gold frame warms and a soft glow
// blooms instead.
export const GOLD_GLOW =
  "transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgba(209,174,109,0.45),0_14px_38px_rgba(209,174,109,0.22)]";

export const GOLD_GLOW_WITH_BORDER =
  "transition-[box-shadow,border-color] duration-300 hover:border-[var(--fa-gold-hover)] hover:shadow-[0_0_0_1px_rgba(209,174,109,0.45),0_14px_38px_rgba(209,174,109,0.22)]";

// Photography brightens slightly under the card's hover.
export const PHOTO_HOVER =
  "transition-[filter] duration-500 group-hover:brightness-110";

// Square corners, thin gold frame.
export const CARD_FRAME = "border border-[var(--fa-gold)] overflow-hidden";

// Feature cards: outer border, a 6px channel, inner border.
export const CARD_FRAME_DOUBLE = "border-2 border-[var(--fa-gold)] p-1.5";

// Outlined action link. `tone` picks the ground it sits on.
export const viewAllClass = (tone = "dark") =>
  tone === "dark"
    ? "inline-flex items-center gap-2.5 rounded-md border border-[var(--fa-on-dark)]/70 px-6 py-2.5 text-sm font-semibold tracking-[0.06em] text-[var(--fa-cream)] transition-colors hover:bg-[var(--fa-on-dark)] hover:text-[var(--fa-ink)]"
    : "inline-flex items-center gap-2.5 rounded-md border border-[var(--fa-hover-dark)]/70 px-6 py-2.5 text-sm font-semibold tracking-[0.06em] text-[var(--fa-ink)] transition-colors hover:bg-[var(--fa-hover-dark)] hover:text-[var(--fa-cream)]";

// --- Floating chrome ---------------------------------------------------
// Dropdowns, suggestion panels, drawers and overlays render outside any
// section, so they inherit no ground colour and have to carry their own.

export const MENU_PANEL =
  "bg-[var(--fa-dark)] border border-[var(--fa-gold)]/50 shadow-[0_18px_44px_rgba(0,0,0,0.45)]";

// A row inside one of those panels.
export const MENU_ITEM =
  "transition-colors text-[var(--fa-on-dark)] hover:bg-[var(--fa-gold)]/10 hover:text-[var(--fa-gold-hover)]";

// Destructive row (log out). Plain red fails contrast on #373838.
export const MENU_ITEM_DANGER =
  "transition-colors text-[#e8927f] hover:bg-[#e8927f]/10 hover:text-[#f2ad9e]";

// Text input on a dark ground — the footer newsletter field's treatment.
// The trailing `::-webkit-search-cancel-button` reset drops the browser's own
// blue clear glyph, which cannot be recoloured and clashes on a dark field.
export const FIELD_DARK =
  "bg-[var(--fa-ink)] border border-[var(--fa-gold)]/70 text-[var(--fa-cream)] placeholder-[var(--fa-muted-dark)] focus:outline-none focus:border-[var(--fa-gold)] transition-colors [&::-webkit-search-cancel-button]:appearance-none";

// Keyboard focus that stays visible on #373838. A ring rather than an outline,
// so it survives the `focus:outline-none` these controls already carry.
export const FOCUS_RING =
  "focus-visible:ring-2 focus-visible:ring-[var(--fa-gold-hover)] focus-visible:ring-offset-0";

// The same ring for controls sitting on a light panel (#efe7db / #d4c6ab),
// where the gold above all but disappears. Modals use this one.
export const FOCUS_RING_LIGHT =
  "focus-visible:ring-2 focus-visible:ring-[var(--fa-ink)] focus-visible:ring-offset-0";

// A gold ring on a gold fill is 1.42:1 — invisible. Solid-gold CTAs need the
// ring offset off the button and drawn in ink. Spelled out rather than composed
// from FOCUS_RING, because layering a second ring-offset utility leaves both in
// the class list and Tailwind's stylesheet order decides the winner, not yours.
export const FOCUS_RING_ON_GOLD =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fa-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fa-dark)]";
