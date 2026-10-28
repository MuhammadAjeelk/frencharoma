import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import connectDB from "@/lib/db";
import HeroSlides from "@/lib/models/HeroSlides";
import {
  DEFAULT_HERO_SLIDES,
  HERO_DESKTOP,
  HERO_MOBILE,
  HERO_MAX_SLIDES,
} from "@/lib/siteMedia";
import { saveSiteImage, SITE_MAX_FILE_SIZE, SITE_URL_BASE } from "@/lib/upload";

// The hero slide list. Like site-media, every save re-renders the static
// homepage once; visitors never trigger a database read.

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function authError(error) {
  if (error.message === "Unauthorized" || error.message?.includes("Admin access")) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  return null;
}

// Slide art may only point at a built-in hero file or something uploaded
// through POST below — never an arbitrary URL.
const BUILT_IN_ART = new Set(
  DEFAULT_HERO_SLIDES.flatMap((s) => [s.desktop.src, s.mobile?.src]).filter(Boolean),
);
const isOurArt = (src) =>
  typeof src === "string" && (BUILT_IN_ART.has(src) || src.startsWith(`${SITE_URL_BASE}/`));

function cleanArt(art, fallback) {
  if (!art || !isOurArt(art.src)) return null;
  const width = Number(art.width) || fallback.width;
  const height = Number(art.height) || fallback.height;
  return { src: art.src, width, height };
}

// Returns [slides, error].
function validateSlides(input) {
  if (!Array.isArray(input)) return [null, "Slides must be a list"];
  if (input.length === 0) return [null, "Keep at least one slide"];
  if (input.length > HERO_MAX_SLIDES) return [null, `At most ${HERO_MAX_SLIDES} slides`];

  const seen = new Set();
  const slides = [];
  for (const [i, s] of input.entries()) {
    const n = i + 1;
    const id = String(s?.id || "").slice(0, 60);
    const title = String(s?.title || "").trim().slice(0, 80);
    const href = String(s?.href || "").trim().slice(0, 500);
    if (!id || seen.has(id)) return [null, `Slide ${n}: bad id`];
    seen.add(id);
    if (!title) return [null, `Slide ${n}: add a name (it is read out to screen readers)`];
    if (!href.startsWith("/") && !/^https:\/\//.test(href)) {
      return [null, `Slide ${n}: the link must start with / or https://`];
    }
    const desktop = cleanArt(s.desktop, HERO_DESKTOP);
    if (!desktop) return [null, `Slide ${n}: needs a desktop image`];
    const mobile = s.mobile ? cleanArt(s.mobile, HERO_MOBILE) : null;
    if (s.mobile && !mobile) return [null, `Slide ${n}: phone image is not valid`];
    slides.push({ id, title, href, desktop, mobile });
  }
  return [slides, null];
}

// GET — the current list, and whether it is still the built-in one.
export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const doc = await HeroSlides.findOne({ key: "home" }).lean();
    return NextResponse.json({
      slides: doc ? doc.slides : DEFAULT_HERO_SLIDES,
      isDefault: !doc,
      maxSlides: HERO_MAX_SLIDES,
    });
  } catch (error) {
    return authError(error) || NextResponse.json({ error: error.message || "Failed to load" }, { status: 500 });
  }
}

// POST multipart { file, kind: "desktop" | "mobile" } — store one banner image
// and return its URL. It does not touch the slide list; the admin screen puts
// the URL into a slide and saves the list with PUT.
export async function POST(request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind") === "mobile" ? "mobile" : "desktop";

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG and WebP images are allowed" }, { status: 400 });
    }
    if (file.size > SITE_MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 25MB" }, { status: 400 });
    }

    try {
      const saved = await saveSiteImage(Buffer.from(await file.arrayBuffer()), {
        key: `hero-${kind}`,
        maxWidth: kind === "mobile" ? HERO_MOBILE.width : HERO_DESKTOP.width,
      });
      return NextResponse.json({ src: saved.url, width: saved.width, height: saved.height });
    } catch {
      return NextResponse.json({ error: "That file could not be read as an image" }, { status: 400 });
    }
  } catch (error) {
    console.error("Hero image upload error:", error);
    return authError(error) || NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}

// PUT { slides } — replace the whole list (add, remove, reorder, edit).
export async function PUT(request) {
  try {
    const session = await requireAdmin();
    const body = await request.json().catch(() => null);
    const [slides, error] = validateSlides(body?.slides);
    if (error) return NextResponse.json({ error }, { status: 400 });

    await connectDB();
    await HeroSlides.findOneAndUpdate(
      { key: "home" },
      { key: "home", slides, updatedBy: session.user?.email || "" },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    revalidatePath("/");
    return NextResponse.json({ slides, isDefault: false });
  } catch (error) {
    return authError(error) || NextResponse.json({ error: error.message || "Save failed" }, { status: 500 });
  }
}

// DELETE — back to the built-in slides. Uploaded files stay on disk.
export async function DELETE() {
  try {
    await requireAdmin();
    await connectDB();
    await HeroSlides.deleteOne({ key: "home" });
    revalidatePath("/");
    return NextResponse.json({ slides: DEFAULT_HERO_SLIDES, isDefault: true });
  } catch (error) {
    return authError(error) || NextResponse.json({ error: error.message || "Reset failed" }, { status: 500 });
  }
}
