// Shared design tokens for the site-wide migration (docs/design-migration.md).
//
// These are the values the homepage was rebuilt against. Import them instead of
// retyping hexes so a change lands everywhere at once.

export const COLORS = {
  darkGround: "#373838",
  darkDeep: "#2e2e2e",
  lightGround: "#d4c6ab",
  band: "#d1c0ab",
  gold: "#c9a25a",
  goldBright: "#d1ae6d",
  goldHover: "#e3c489",
  ink: "#211d18",
  bodyOnDark: "#cbbfae",
  mutedOnDark: "#a99d8c",
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
  "transition-[box-shadow,border-color] duration-300 hover:border-[#e3c489] hover:shadow-[0_0_0_1px_rgba(209,174,109,0.45),0_14px_38px_rgba(209,174,109,0.22)]";

// Photography brightens slightly under the card's hover.
export const PHOTO_HOVER =
  "transition-[filter] duration-500 group-hover:brightness-110";

// Square corners, thin gold frame.
export const CARD_FRAME = "border border-[#d1ae6d] overflow-hidden";

// Feature cards: outer border, a 6px channel, inner border.
export const CARD_FRAME_DOUBLE = "border-2 border-[#d1ae6d] p-1.5";

// Outlined action link. `tone` picks the ground it sits on.
export const viewAllClass = (tone = "dark") =>
  tone === "dark"
    ? "inline-flex items-center gap-2.5 rounded-md border border-[#d2c1ac]/70 px-6 py-2.5 text-sm font-semibold tracking-[0.06em] text-[#efe7db] transition-colors hover:bg-[#d2c1ac] hover:text-[#211d18]"
    : "inline-flex items-center gap-2.5 rounded-md border border-[#2a2620]/70 px-6 py-2.5 text-sm font-semibold tracking-[0.06em] text-[#211d18] transition-colors hover:bg-[#2a2620] hover:text-[#d4c6ab]";

// --- Floating chrome ---------------------------------------------------
// Dropdowns, suggestion panels, drawers and overlays render outside any
// section, so they inherit no ground colour and have to carry their own.

export const MENU_PANEL =
  "bg-[#373838] border border-[#c9a25a]/50 shadow-[0_18px_44px_rgba(0,0,0,0.45)]";

// A row inside one of those panels.
export const MENU_ITEM =
  "transition-colors text-[#cbbfae] hover:bg-[#c9a25a]/10 hover:text-[#e3c489]";

// Destructive row (log out). Plain red fails contrast on #373838.
export const MENU_ITEM_DANGER =
  "transition-colors text-[#e8927f] hover:bg-[#e8927f]/10 hover:text-[#f2ad9e]";

// Text input on a dark ground — the footer newsletter field's treatment.
// The trailing `::-webkit-search-cancel-button` reset drops the browser's own
// blue clear glyph, which cannot be recoloured and clashes on a dark field.
export const FIELD_DARK =
  "bg-[#211d18] border border-[#c9a25a]/40 text-[#efe7db] placeholder-[#a99d8c]/60 focus:outline-none focus:border-[#c9a25a] transition-colors [&::-webkit-search-cancel-button]:appearance-none";

// Keyboard focus that stays visible on #373838. A ring rather than an outline,
// so it survives the `focus:outline-none` these controls already carry.
export const FOCUS_RING =
  "focus-visible:ring-2 focus-visible:ring-[#e3c489] focus-visible:ring-offset-0";

// The same ring for controls sitting on a light panel (#efe7db / #d4c6ab),
// where the gold above all but disappears. Modals use this one.
export const FOCUS_RING_LIGHT =
  "focus-visible:ring-2 focus-visible:ring-[#211d18] focus-visible:ring-offset-0";
