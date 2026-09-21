// Rebuild the favicon / app-icon set from the brand logo.
//
// public/logo.png is the master: flat gold ink (#d2ae6d) on an opaque white
// plate — it was drawn to sit on light and the site hid the plate with
// mix-blend-multiply. public/logo-dark.png is the same art keyed by luminance,
// which leaves the gold itself at partial alpha; composited onto a dark plate
// it goes muddy. So we key logo.png ourselves and keep the gold at full
// strength.
//
// Two things the art needs before it survives a 16px tab:
//
//   1. The wordmark goes. "FRENCH AROMAS" is four pixels tall at 16px. Ink
//      rows are grouped into bands and only the topmost band — the bottle and
//      its monogram — is kept. Found, not hardcoded.
//
//   2. The FA monogram gets pulled back at small sizes. The oval stroke is 6px
//      on a 200px-wide mark, i.e. half a pixel at 16px, so everything lands as
//      the same mid-gold and the bottle dissolves into its own monogram. We
//      split the mark into an outline band and an interior, fade the interior
//      at 16/32 and lift the surviving alpha so the silhouette stays crisp.
//      At 48px and up nothing is faded — the monogram reads on its own.
//
// The mark is gold hairline art, so it needs an opaque plate: on a light tab
// strip a transparent gold outline disappears. #211d18 is the brand's deepest
// ground and carries the gold at ~7.7:1.
//
// Usage: node scripts/build-favicons.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = process.cwd();
const SRC = path.join(ROOT, "public/logo.png");
const APP = path.join(ROOT, "src/app");
const PUBLIC = path.join(ROOT, "public");

const PLATE = { r: 0x21, g: 0x1d, b: 0x18 }; // deepest brand ground
const WHITE = [254, 254, 254]; // the master's plate, not pure #fff
const GOLD = [210, 174, 109]; // #d2ae6d, measured off the master

const INK = 40; // alpha above which a pixel counts as ink
const BLANK_RUN = 8; // blank rows that end a band (the art leaves ~26)
const BAND = 0.025; // outline band depth, as a fraction of the mark's width

// --- key the white plate out of the master -------------------------------

// src = ink*a + white*(1-a). Solve for a on the channel with the most room
// (blue: 254 -> 109), then unmultiply to recover the ink's true colour, so
// anti-aliased edges stay gold instead of greying toward the plate.
function keyWhite(data, info) {
  const { width: w, height: h, channels: c } = info;
  const out = Buffer.alloc(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    const i = p * c;
    let a = 0;
    for (let k = 0; k < 3; k++) {
      const span = WHITE[k] - GOLD[k];
      if (span > 8) a = Math.max(a, (WHITE[k] - data[i + k]) / span);
    }
    a = Math.min(1, Math.max(0, a));
    const o = p * 4;
    for (let k = 0; k < 3; k++) {
      const v = a > 0.004 ? (data[i + k] - WHITE[k] * (1 - a)) / a : GOLD[k];
      out[o + k] = Math.min(255, Math.max(0, Math.round(v)));
    }
    out[o + 3] = Math.round(a * 255);
  }
  return out;
}

// --- find the mark -------------------------------------------------------

// Topmost run of ink rows: the bottle, without the wordmark below it.
function markBox(rgba, w, h) {
  const ink = (x, y) => rgba[(y * w + x) * 4 + 3] > INK;
  const rowHas = [];
  for (let y = 0; y < h; y++) {
    let has = false;
    for (let x = 0; x < w && !has; x++) has = ink(x, y);
    rowHas.push(has);
  }
  const top = rowHas.indexOf(true);
  if (top < 0) throw new Error(`no ink in ${SRC}`);
  let bottom = top;
  for (let y = top, blank = 0; y < h; y++) {
    if (rowHas[y]) {
      bottom = y;
      blank = 0;
    } else if (++blank >= BLANK_RUN) break;
  }
  let left = w;
  let right = 0;
  for (let y = top; y <= bottom; y++) {
    for (let x = 0; x < w; x++) {
      if (!ink(x, y)) continue;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

function crop(rgba, w, box) {
  const out = Buffer.alloc(box.width * box.height * 4);
  for (let y = 0; y < box.height; y++) {
    const s = ((y + box.top) * w + box.left) * 4;
    rgba.copy(out, y * box.width * 4, s, s + box.width * 4);
  }
  return out;
}

// --- split outline from interior -----------------------------------------

// The bottle is horizontally convex, so its silhouette is simply the span
// between the first and last ink pixel on each row. (A flood fill from the
// border leaks: the art leaves a 4px gap between the cap and the shoulders.)
function spanFill(rgba, w, h) {
  const sil = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    let a = -1;
    let b = -1;
    for (let x = 0; x < w; x++) {
      if (rgba[(y * w + x) * 4 + 3] > INK) {
        if (a < 0) a = x;
        b = x;
      }
    }
    for (let x = a; a >= 0 && x <= b; x++) sil[y * w + x] = 1;
  }
  return sil;
}

// Square erosion, done as two 1-D passes.
function erode(mask, w, h, r) {
  const t = new Uint8Array(w * h);
  const o = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let ok = 1;
      for (let d = -r; d <= r && ok; d++) {
        const nx = x + d;
        if (nx < 0 || nx >= w || !mask[y * w + nx]) ok = 0;
      }
      t[y * w + x] = ok;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let ok = 1;
      for (let d = -r; d <= r && ok; d++) {
        const ny = y + d;
        if (ny < 0 || ny >= h || !t[ny * w + x]) ok = 0;
      }
      o[y * w + x] = ok;
    }
  }
  return o;
}

// Everything within BAND of the silhouette's edge is "outline"; the rest of
// the interior is the monogram.
function outlineBand(rgba, w, h) {
  const sil = spanFill(rgba, w, h);
  const core = erode(sil, w, h, Math.max(1, Math.round(w * BAND)));
  const band = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) band[i] = sil[i] && !core[i] ? 1 : 0;
  return band;
}

// --- render --------------------------------------------------------------

function attenuate(rgba, band, weight) {
  if (weight === 1) return Buffer.from(rgba);
  const out = Buffer.from(rgba);
  for (let i = 0; i < band.length; i++) {
    if (!band[i]) out[i * 4 + 3] = Math.round(out[i * 4 + 3] * weight);
  }
  return out;
}

// Hairlines lose coverage when downscaled: a 6px stroke landing on a 16px
// canvas arrives at ~30% alpha and reads as a smudge. 1-(1-a)^boost pushes
// partial coverage back up without touching solid fills.
function boostAlpha(buf, boost) {
  if (boost === 1) return buf;
  for (let i = 3; i < buf.length; i += 4) {
    const a = buf[i] / 255;
    buf[i] = Math.round((1 - Math.pow(1 - a, boost)) * 255);
  }
  return buf;
}

async function renderIcon(mark, band, dims, { size, pad, interior, boost }) {
  const src = await sharp(attenuate(mark, band, interior), {
    raw: { width: dims.width, height: dims.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const inner = Math.max(1, Math.round(size * (1 - 2 * pad)));
  const { data, info } = await sharp(src)
    .resize(inner, inner, {
      fit: "contain",
      kernel: "lanczos3",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const layer = await sharp(boostAlpha(data, boost), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: { ...PLATE, alpha: 1 } },
  })
    .composite([{ input: layer, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// --- ICO -----------------------------------------------------------------

// sharp cannot write ICO, so assemble one by hand. Each entry is a 32-bit
// BITMAPINFOHEADER DIB (bottom-up BGRA, then a 1bpp AND mask), which every
// browser and Explorer build reads — PNG-compressed entries are newer and not
// worth the compatibility question for a 48px image.
function dibEntry(rgba, size) {
  const xorStride = size * 4;
  const andStride = Math.ceil(size / 8 / 4) * 4;
  const xor = Buffer.alloc(xorStride * size);
  const and = Buffer.alloc(andStride * size); // all zero = fully opaque

  for (let y = 0; y < size; y++) {
    const dst = (size - 1 - y) * xorStride; // DIBs run bottom-up
    for (let x = 0; x < size; x++) {
      const s = (y * size + x) * 4;
      const d = dst + x * 4;
      xor[d] = rgba[s + 2]; // B
      xor[d + 1] = rgba[s + 1]; // G
      xor[d + 2] = rgba[s]; // R
      xor[d + 3] = rgba[s + 3]; // A
    }
  }

  const head = Buffer.alloc(40);
  head.writeUInt32LE(40, 0); // biSize
  head.writeInt32LE(size, 4); // biWidth
  head.writeInt32LE(size * 2, 8); // biHeight: XOR and AND stacked
  head.writeUInt16LE(1, 12); // biPlanes
  head.writeUInt16LE(32, 14); // biBitCount
  head.writeUInt32LE(0, 16); // biCompression = BI_RGB
  head.writeUInt32LE(xor.length + and.length, 20); // biSizeImage
  return Buffer.concat([head, xor, and]);
}

function buildIco(frames) {
  const dir = Buffer.alloc(6 + frames.length * 16);
  dir.writeUInt16LE(0, 0); // reserved
  dir.writeUInt16LE(1, 2); // 1 = icon
  dir.writeUInt16LE(frames.length, 4);

  let offset = dir.length;
  const blobs = [];
  frames.forEach(({ size, rgba }, i) => {
    const blob = dibEntry(rgba, size);
    const e = 6 + i * 16;
    dir[e] = size === 256 ? 0 : size; // 0 means 256
    dir[e + 1] = size === 256 ? 0 : size;
    dir[e + 2] = 0; // palette entries
    dir[e + 3] = 0; // reserved
    dir.writeUInt16LE(1, e + 4); // planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(blob.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += blob.length;
    blobs.push(blob);
  });
  return Buffer.concat([dir, ...blobs]);
}

// --- outputs -------------------------------------------------------------

// Small sizes get less padding, a faded monogram and more lift; from 48px up
// the art is rendered as drawn.
const ICO_SIZES = [
  { size: 16, pad: 0.03, interior: 0.25, boost: 2.0 },
  { size: 32, pad: 0.05, interior: 0.6, boost: 1.4 },
  { size: 48, pad: 0.06, interior: 1, boost: 1.15 },
];

const PNG_FILES = [
  { file: path.join(APP, "icon.png"), size: 512, pad: 0.1, interior: 1, boost: 1 },
  { file: path.join(APP, "apple-icon.png"), size: 180, pad: 0.1, interior: 1, boost: 1.05 },
  { file: path.join(PUBLIC, "icon-192.png"), size: 192, pad: 0.1, interior: 1, boost: 1.05 },
  { file: path.join(PUBLIC, "icon-512.png"), size: 512, pad: 0.1, interior: 1, boost: 1 },
];

(async () => {
  const { data, info } = await sharp(SRC)
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const keyed = keyWhite(data, info);
  const box = markBox(keyed, info.width, info.height);
  const mark = crop(keyed, info.width, box);
  const band = outlineBand(mark, box.width, box.height);
  const dims = { width: box.width, height: box.height };
  console.log(
    `${path.relative(ROOT, SRC)} ${info.width}x${info.height} -> mark ` +
      `${box.width}x${box.height} at ${box.left},${box.top} (wordmark dropped)`,
  );

  for (const { file, ...opts } of PNG_FILES) {
    fs.writeFileSync(file, await renderIcon(mark, band, dims, opts));
    console.log(`wrote ${path.relative(ROOT, file)} (${opts.size}x${opts.size})`);
  }

  const frames = [];
  for (const opts of ICO_SIZES) {
    const png = await renderIcon(mark, band, dims, opts);
    frames.push({ size: opts.size, rgba: await sharp(png).ensureAlpha().raw().toBuffer() });
  }
  const ico = path.join(APP, "favicon.ico");
  fs.writeFileSync(ico, buildIco(frames));
  console.log(
    `wrote ${path.relative(ROOT, ico)} (${ICO_SIZES.map((s) => s.size).join(", ")})`,
  );
})();
