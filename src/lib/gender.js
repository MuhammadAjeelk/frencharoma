// Gender display metadata — the label is colour-coded per gender, which is the
// design intent: men blue, women pink, unisex purple.
//
// The hues are darker than the originals (#1d6fe0 / #e11d63 / #7c3aed) because
// those measured 2.8-3.4:1 against the #d5c7b4 card panel, under the 4.5:1 bar.
// These keep the same three hues and clear it. ON_DARK holds the light twins for
// near-black grounds, where the darkened versions would disappear.
export const GENDER_ON_DARK = {
  men: "text-[#7fb2f0]",
  women: "text-[#f584ab]",
  unisex: "text-[#b99af5]",
};

export const GENDER_META = {
  men:    { label: "For Men",    hex: "#1b4f9c", text: "text-[#1b4f9c]" },
  women:  { label: "For Women",  hex: "#a8114a", text: "text-[#a8114a]" },
  unisex: { label: "For Unisex", hex: "#5b2bb0", text: "text-[#5b2bb0]" },
};

export const genderMeta = (g) => GENDER_META[g] || null;

// " – For Men" style suffix for headings, or "" when gender is unknown.
export const genderSuffix = (g) => {
  const m = GENDER_META[g];
  return m ? ` – ${m.label}` : "";
};

// Heading node: name in the default colour + a colour-coded gender suffix
// (blue / pink / purple) matching the perfume cards.
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
