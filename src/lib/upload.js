import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "perfumes");
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
  return `/uploads/perfumes/${filename}`;
}

export async function deleteFile(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith("/uploads/perfumes/")) {
    return;
  }

  const filename = fileUrl.replace("/uploads/perfumes/", "");
  const filepath = path.join(UPLOAD_DIR, filename);

  try {
    if (existsSync(filepath)) {
      await unlink(filepath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

export async function saveMultipleFiles(files) {
  const urls = [];
  for (const file of files) {
    const url = await saveFile(file);
    urls.push(url);
  }
  return urls;
}
