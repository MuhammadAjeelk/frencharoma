import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import connectDB from "@/lib/db";
import SiteMedia from "@/lib/models/SiteMedia";
import { SLOTS } from "@/lib/siteMedia";
import { saveSiteImage, SITE_MAX_FILE_SIZE } from "@/lib/upload";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function authError(error) {
  if (error.message === "Unauthorized" || error.message?.includes("Admin access")) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  return null;
}

// The homepage is a static page; this re-renders it once with the new image.
// Every visitor after that gets the cached page — no per-request DB reads.
function refreshHomepage() {
  revalidatePath("/");
}

// GET — current overrides, for the admin screen.
export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const docs = await SiteMedia.find({}, { _id: 0, key: 1, url: 1, width: 1, height: 1, updatedAt: 1 }).lean();
    return NextResponse.json({ overrides: docs });
  } catch (error) {
    return authError(error) || NextResponse.json({ error: error.message || "Failed to load" }, { status: 500 });
  }
}

// POST multipart { key, file } — replace one slot's image.
export async function POST(request) {
  try {
    const session = await requireAdmin();
    const form = await request.formData();
    const key = form.get("key");
    const file = form.get("file");

    const slot = SLOTS[key];
    if (!slot) {
      return NextResponse.json({ error: "Unknown image slot" }, { status: 400 });
    }
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG and WebP images are allowed" }, { status: 400 });
    }
    if (file.size > SITE_MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 25MB" }, { status: 400 });
    }

    let saved;
    try {
      saved = await saveSiteImage(Buffer.from(await file.arrayBuffer()), {
        key,
        maxWidth: slot.maxWidth,
      });
    } catch {
      return NextResponse.json({ error: "That file could not be read as an image" }, { status: 400 });
    }

    await connectDB();
    // The previous file is deliberately kept on disk: nothing is deleted, and
    // pages already cached by a browser or Cloudflare still resolve.
    await SiteMedia.findOneAndUpdate(
      { key },
      { key, url: saved.url, width: saved.width, height: saved.height, updatedBy: session.user?.email || "" },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    refreshHomepage();
    return NextResponse.json({ key, ...saved });
  } catch (error) {
    console.error("Site media upload error:", error);
    return authError(error) || NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}

// DELETE ?key= — drop the override so the slot shows its built-in default.
export async function DELETE(request) {
  try {
    await requireAdmin();
    const key = new URL(request.url).searchParams.get("key");
    if (!SLOTS[key]) {
      return NextResponse.json({ error: "Unknown image slot" }, { status: 400 });
    }
    await connectDB();
    await SiteMedia.deleteOne({ key });
    refreshHomepage();
    return NextResponse.json({ key, reset: true });
  } catch (error) {
    return authError(error) || NextResponse.json({ error: error.message || "Reset failed" }, { status: 500 });
  }
}
