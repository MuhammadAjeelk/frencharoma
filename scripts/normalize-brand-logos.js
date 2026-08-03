// One-off: trim surrounding whitespace/transparency from every brand logo and
// re-pad it with a uniform margin, so all logos present with balanced visual
// weight in the Shop By Brand marquee (no more tiny/huge mismatch).
// Usage: node scripts/normalize-brand-logos.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const dir = path.join(process.cwd(), "public/icons/brands");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".png"));

(async () => {
  for (const f of files) {
    const p = path.join(dir, f);
    try {
      const buf = fs.readFileSync(p);
      // Flatten onto white if the logo has a solid background, then trim the
      // uniform border (works for white- or transparent-edged logos), and give
      // every logo the same proportional breathing room.
      const trimmed = await sharp(buf)
        .ensureAlpha()
        .trim({ threshold: 15 })
        .toBuffer();
      const meta = await sharp(trimmed).metadata();
      const pad = Math.round(Math.max(meta.width, meta.height) * 0.07);
      const out = await sharp(trimmed)
        .extend({
          top: pad,
          bottom: pad,
          left: pad,
          right: pad,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
      fs.writeFileSync(p, out);
      console.log("normalized", f, `${meta.width}x${meta.height}`);
    } catch (e) {
      console.log("SKIP", f, e.message);
    }
  }
})();
