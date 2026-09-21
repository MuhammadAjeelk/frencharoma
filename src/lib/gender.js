// Gender display metadata.
//
// The label used to be colour-coded per gender — men blue, women pink, unisex
// purple — so the three read as three different things on a grid of cards. It
// is one label doing one job, so it now takes one colour.
//
// The blue is deeper than the homepage's original #2f7fd4 because that tone
// measures 2.48:1 on the #d5c7b4 card panel, well under the 4.5:1 bar. This one
// is 4.79:1 and keeps the same character. GENDER_ON_DARK is the variant for
// near-black grounds, where the deep blue would disappear.
export const GENDER_LABEL_HEX = "#1b4f9c";
export const GENDER_LABEL = "text-[#1b4f9c]";
export const GENDER_ON_DARK = "text-[#7fb2f0]";

export const GENDER_META = {
  men:    { label: "For Men",    hex: GENDER_LABEL_HEX, text: GENDER_LABEL },
  women:  { label: "For Women",  hex: GENDER_LABEL_HEX, text: GENDER_LABEL },
  unisex: { label: "For Unisex", hex: GENDER_LABEL_HEX, text: GENDER_LABEL },
};

export const genderMeta = (g) => GENDER_META[g] || null;

// " – For Men" style suffix for headings, or "" when gender is unknown.
export const genderSuffix = (g) => {
  const m = GENDER_META[g];
  return m ? ` – ${m.label}` : "";
};

// Heading node: name in the default colour + the gender suffix in the single
// label blue, matching the perfume cards.
export const genderHeading = (name, g) => {
  const m = GENDER_META[g];
  return (
    <>
      {name || ""}
      {m && (
        <>
          {" – "}
          <span className={m.text}>{m.label}</span>
        </>
      )}
    </>
  );
};
