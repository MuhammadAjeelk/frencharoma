// Gender display metadata — colours used across perfume cards and the quick view.
// Men = blue, Women = pinkish-red, Unisex = purple (per the design spec).
export const GENDER_META = {
  men:    { label: "For Men",    hex: "#1d6fe0", text: "text-[#1d6fe0]" },
  women:  { label: "For Women",  hex: "#e11d63", text: "text-[#e11d63]" },
  unisex: { label: "For Unisex", hex: "#7c3aed", text: "text-[#7c3aed]" },
};

export const genderMeta = (g) => GENDER_META[g] || null;

// " – For Men" style suffix for headings, or "" when gender is unknown.
export const genderSuffix = (g) => {
  const m = GENDER_META[g];
  return m ? ` – ${m.label}` : "";
};

// Heading node: name in the default colour + a colour-coded gender suffix
// (blue/pink/purple) matching the perfume cards.
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
