// Gender display metadata — the label is colour-coded per gender, which is the
// design intent: men blue, women pink, unisex purple. Both tables below hold the
// same three hues (≈216° blue, ≈338° pink, ≈261° purple); only the lightness
// differs, so the coding survives on either ground.
//
// There are two variants because one set cannot serve both grounds:
//
//   GENDER_META   — for LIGHT panels (#d5c7b4 card, #efe7db modal sheet).
//                   4.76–7.08:1 there, but only 1.35–1.59:1 on #373838.
//   GENDER_ON_DARK — for DARK grounds (#373838 modal header / cart, #211d18
//                   popover). 4.91–7.60:1 there, but 1.33–1.95:1 on a light panel.
//
// Picking the wrong one is invisible text, so prefer `genderTextClass(g, tone)`
// over indexing either table by hand.
//
// (The light-ground hues are darker than the originals #1d6fe0 / #e11d63 /
// #7c3aed, which measured 2.8–3.4:1 on #d5c7b4.)
export const GENDER_ON_DARK = {
  men: "text-[#7fb2f0]",
  women: "text-[#f584ab]",
  unisex: "text-[#b99af5]",
};

// `hex` is the same colour as `text`, for the gender-coloured dividers and card
// borders that take an inline style rather than a class.
export const GENDER_META = {
  men:    { label: "For Men",    hex: "#1b4f9c", text: "text-[#1b4f9c]" },
  women:  { label: "For Women",  hex: "#a01046", text: "text-[#a01046]" },
  unisex: { label: "For Unisex", hex: "#5b2bb0", text: "text-[#5b2bb0]" },
};

export const genderMeta = (g) => GENDER_META[g] || null;

// The one door for picking a gender text colour. `tone` names the ground the
// label actually sits on, not the page's overall theme — the Quick View heading
// is on a dark bar inside a light sheet, and the label inside that same sheet is
// on the light one. Returns "" for an unknown gender so the caller's own colour
// shows through.
export const genderTextClass = (g, tone = "dark") =>
  tone === "dark" ? GENDER_ON_DARK[g] || "" : GENDER_META[g]?.text || "";

// " – For Men" style suffix for headings, or "" when gender is unknown.
// Plain text, so it carries no colour — use `genderHeading` where the colour
// coding is wanted.
export const genderSuffix = (g) => {
  const m = GENDER_META[g];
  return m ? ` – ${m.label}` : "";
};

// Heading node: name in the inherited colour + a colour-coded gender suffix.
//
// `tone` defaults to "dark" because every caller is a `UniversalModal` heading
// and that header bar is #373838. A caller on a light panel must pass "light",
// or the suffix drops to ~1.5:1 and disappears.
export const genderHeading = (name, g, tone = "dark") => {
  const m = GENDER_META[g];
  return (
    <>
      {name || ""}
      {m && (
        <>
          {" – "}
          <span className={genderTextClass(g, tone)}>{m.label}</span>
        </>
      )}
    </>
  );
};
