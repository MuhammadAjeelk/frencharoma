import "server-only";
import connectDB from "./db";
import SiteMedia from "./models/SiteMedia";
import HeroSlides from "./models/HeroSlides";
import { resolveMedia, DEFAULT_HERO_SLIDES } from "./siteMedia";

// Reads the homepage image overrides and the hero slide list. This runs only
// when the homepage is rendered — once at build, and once more after an admin
// saves (the admin APIs call revalidatePath("/")). Visitors are served the
// cached page, so no visitor request ever reaches the database for these.
//
// Failure behaves differently by phase, on purpose:
// - At build, a missing database falls back to the built-in defaults, so a
//   build never fails or hangs because Mongo is unreachable.
// - At runtime, a failed read throws. Next then keeps serving the previous
//   page, so a database blip can't silently swap every replaced image back to
//   its default until the next save.
const BUILD_TIMEOUT_MS = 5000;

const DEFAULTS = { media: resolveMedia({}), heroSlides: DEFAULT_HERO_SLIDES };

export default async function getSiteMedia() {
  const building = process.env.NEXT_PHASE === "phase-production-build";

  const read = async () => {
    await connectDB();
    const [docs, hero] = await Promise.all([
      SiteMedia.find({}, { key: 1, url: 1, width: 1, height: 1 }).lean(),
      HeroSlides.findOne({ key: "home" }, { slides: 1 }).lean(),
    ]);
    return {
      media: resolveMedia(Object.fromEntries(docs.map((d) => [d.key, d]))),
      heroSlides: hero ? hero.slides : DEFAULT_HERO_SLIDES,
    };
  };

  if (!building) return read();

  try {
    return await Promise.race([
      read(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timed out")), BUILD_TIMEOUT_MS),
      ),
    ]);
  } catch (err) {
    console.warn(`[site-media] using built-in defaults at build: ${err.message}`);
    return DEFAULTS;
  }
}
