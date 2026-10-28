import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const DEFAULT_UPLOAD_SUBDIR = path.join("public", "uploads", "perfumes");
const UPLOAD_URL_BASE = (process.env.UPLOAD_URL_BASE || "/uploads/perfumes").replace(
  /\/$/,
  ""
);

const UPLOAD_URL_PATH = (() => {
  try {
    return new URL(UPLOAD_URL_BASE, "http://localhost").pathname.replace(/\/$/, "");
  } catch {
    return "/uploads/perfumes";
  }
})();

function resolveUploadDir() {
  const envDir = process.env.UPLOAD_DIR;
  if (envDir) {
    return path.isAbsolute(envDir) ? envDir : path.join(process.cwd(), envDir);
  }
  return path.join(process.cwd(), DEFAULT_UPLOAD_SUBDIR);
}

function getFilenameFromUrl(fileUrl) {
  if (!fileUrl) return null;
  let pathname = fileUrl;
  try {
    pathname = new URL(fileUrl, "http://localhost").pathname;
  } catch {
    // Keep pathname as-is for relative URLs
  }

  if (!pathname.startsWith(`${UPLOAD_URL_PATH}/`)) {
    return null;
  }

  return pathname.slice(UPLOAD_URL_PATH.length + 1);
}

const UPLOAD_DIR = resolveUploadDir();
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export function validateFile(file) {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP are allowed",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File too large. Maximum size is 5MB",
    };
  }

  return { valid: true };
}

export async function saveFile(file) {
  await ensureUploadDir();

  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = file.name.split(".").pop().toLowerCase();
  const filename = `${timestamp}-${randomStr}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  await writeFile(filepath, buffer);

  // Return the public URL path
  return `${UPLOAD_URL_BASE}/${filename}`;
}

export async function deleteFile(fileUrl) {
  const filename = getFilenameFromUrl(fileUrl);
  if (!filename) return;

  const filepath = path.join(UPLOAD_DIR, filename);

  try {
    if (existsSync(filepath)) {
      await unlink(filepath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

// ── Homepage (site) images ────────────────────────────────────────────────
// Kept beside the perfume uploads in a sibling `site/` folder, so the same
// nginx `/uploads/` alias serves them and product photos stay separate.
const SITE_UPLOAD_DIR = path.join(path.dirname(UPLOAD_DIR), "site");
export const SITE_URL_BASE = UPLOAD_URL_BASE.replace(/\/perfumes$/, "") + "/site";
export const SITE_MAX_FILE_SIZE = 25 * 1024 * 1024; // designer exports run large

// Normalises any upload to a webp no wider than `maxWidth` and writes it under
// a unique name — a new URL per upload, so no cache (Next's optimizer,
// Cloudflare, the browser) can ever keep serving the image it replaced.
// Transparency survives: the trust-strip icons rely on it.
export async function saveSiteImage(buffer, { key, maxWidth }) {
  const sharp = (await import("sharp")).default;
  if (!existsSync(SITE_UPLOAD_DIR)) {
    await mkdir(SITE_UPLOAD_DIR, { recursive: true });
  }

  const { data, info } = await sharp(buffer, { limitInputPixels: 80_000_000 })
    .rotate() // honour EXIF orientation from phone photos
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90, effort: 5 })
    .toBuffer({ resolveWithObject: true });

  const slug = key.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  const filename = `${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  await writeFile(path.join(SITE_UPLOAD_DIR, filename), data);

  return {
    url: `${SITE_URL_BASE}/${filename}`,
    width: info.width,
    height: info.height,
    bytes: info.size,
  };
}

export async function saveMultipleFiles(files) {
  const urls = [];
  for (const file of files) {
    const url = await saveFile(file);
    urls.push(url);
  }
  return urls;
}
