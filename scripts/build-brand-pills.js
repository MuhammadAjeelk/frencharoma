// Rebuild the Shop By Brand marquee pills from the single-outline label art.
//
// Each public/icons/brands-labels/<slug>.png is dark ink (one oval + the logo)
// over an opaque white interior, transparent outside the oval. So the pill is
// just a recolour: alpha carries the pill shape, luminance says how much ink is
// at that pixel, and we blend fill -> accent across it. Nothing is redrawn, so
// the outline stays exactly as the source has it — a single line.
//
// Usage: node scripts/build-brand-pills.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(process.cwd(), "public/icons/brands-labels");
const SIZE = { width: 500, height: 250 };

// The source art carries an opaque rim OUTSIDE its oval stroke (15px vertical /
// 16px horizontal on the 900x450 masters). Left in, that rim paints fill colour
// beyond the stroke, so the gold pill reads as two rings against the dark band.
// Clipping the silhouette to the stroke's outer edge leaves exactly one line.
const RIM = { x: 16 / 900, y: 15 / 450 };

function stadiumMask(w, h) {
  const ix = Math.round(w * RIM.x);
  const iy = Math.round(h * RIM.y);
  const r = (h - 2 * iy) / 2;
  return Buffer.from(
    `<svg width="${w}" height="${h}"><rect x="${ix}" y="${iy}" ` +
      `width="${w - 2 * ix}" height="${h - 2 * iy}" rx="${r}" ry="${r}" fill="#fff"/></svg>`,
  );
}

// [fill, accent] — the pill's resting state and its hover state.
const VARIANTS = {
  dark: { fill: [0x14, 0x11, 0x0e], accent: [0xd6, 0xb0, 0x5e] },
  gold: { fill: [0xd2, 0xae, 0x6d], accent: [0x14, 0x11, 0x0e] },
};

async function build(slug) {
  const src = path.join(DIR, `${slug}.png`);
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const mask = await sharp(stadiumMask(info.width, info.height))
    .ensureAlpha()
    .raw()
    .toBuffer();

  for (const [name, { fill, accent }] of Object.entries(VARIANTS)) {
    const out = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i += 4) {
      // Ink coverage: white interior -> 0, black stroke/logo -> 1.
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      const ink = 1 - lum;
      for (let c = 0; c < 3; c++) {
        out[i + c] = Math.round(fill[c] + (accent[c] - fill[c]) * ink);
      }
      out[i + 3] = Math.min(data[i + 3], mask[i + 3]); // clip to the stroke edge
    }

    await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
      .resize(SIZE.width, SIZE.height, { fit: "fill" })
      .webp({ quality: 90, alphaQuality: 100 })
      .toFile(path.join(DIR, `${slug}-${name}.webp`));
  }
}

(async () => {
  const slugs = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".png") && !/-(dark|gold)\.png$/.test(f))
    .map((f) => f.replace(/\.png$/, ""));

  for (const slug of slugs) {
    try {
      await build(slug);
      console.log("built", slug);
    } catch (e) {
      console.log("SKIP", slug, e.message);
    }
  }
  console.log(`\n${slugs.length} brands -> ${slugs.length * 2} pills`);
})();
