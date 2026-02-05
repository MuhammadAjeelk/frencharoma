import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import connectDB from "@/lib/db";
import Perfume from "@/lib/models/Perfume";

const normalizeBrands = (brandsInput) => {
  const items = Array.isArray(brandsInput)
    ? brandsInput
    : brandsInput
    ? [brandsInput]
    : [];

  const brandMap = new Map();
  for (const item of items) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!brandMap.has(key)) {
      brandMap.set(key, trimmed);
    }
  }

  return Array.from(brandMap.values());
};

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/admin/perfumes - List all perfumes with search/filter
export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const brand = searchParams.get("brand");

    const conditions = [];

    if (search) {
      const searchRegex = new RegExp(search, "i");
      conditions.push({
        $or: [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { brands: { $in: [searchRegex] } },
        { tags: { $in: [searchRegex] } },
        ],
      });
    }

    if (status && status !== "all") {
      conditions.push({ status });
    }

    if (brand && brand !== "all") {
      const brandValues = brand
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      if (brandValues.length > 0) {
        const brandRegexes = brandValues.map(
          (value) => new RegExp(`^${escapeRegExp(value)}$`, "i")
        );

        conditions.push({
          $or: [
            { brand: { $in: brandRegexes } },
            { brands: { $in: brandRegexes } },
          ],
        });
      }
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};

    const perfumes = await Perfume.find(query)
      .sort({ updatedAt: -1 })
      .select("name brand brands slug status editions images updatedAt")
      .lean();

    return NextResponse.json({
      perfumes: perfumes.map((p) => ({
        ...p,
        _id: p._id.toString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("List perfumes error:", error);
    if (
      error.message === "Unauthorized" ||
      error.message.includes("Admin access")
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch perfumes" },
      { status: 500 }
    );
  }
}

// POST /api/admin/perfumes - Create a new perfume
export async function POST(request) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();

    // Server-side validation
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Perfume name is required" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const normalizedBrands = normalizeBrands(body.brands || body.brand);
    body.brands = normalizedBrands;
    body.brand = normalizedBrands[0] || "";

    // Check for duplicate slug
    const existingSlug = await Perfume.findOne({ slug: body.slug });
    if (existingSlug) {
      body.slug = `${body.slug}-${Date.now()}`;
    }

    // Validate editions if setting to active
    if (body.status === "active") {
      const enabledEditions = body.editions?.filter((e) => e.enabled) || [];
      if (enabledEditions.length === 0) {
        return NextResponse.json(
          { error: "Active perfumes must have at least one enabled edition" },
          { status: 400 }
        );
      }

      for (const edition of enabledEditions) {
        const activeVariants = edition.variants?.filter((v) => v.isActive) || [];
        if (activeVariants.length === 0) {
          return NextResponse.json(
            {
              error: `Enabled edition "${edition.key}" must have at least one active variant`,
            },
            { status: 400 }
          );
        }

        // Check for duplicate sizes
        const sizes = edition.variants.map((v) => v.size);
        if (new Set(sizes).size !== sizes.length) {
          return NextResponse.json(
            { error: `Edition "${edition.key}" cannot have duplicate sizes` },
            { status: 400 }
          );
        }

        // Validate prices
        for (const variant of activeVariants) {
          if (!variant.price || variant.price <= 0) {
            return NextResponse.json(
              {
                error: `Active variant ${variant.size} in edition "${edition.key}" must have a price greater than 0`,
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Generate SKUs for variants if not provided
    if (body.editions) {
      body.editions = body.editions.map((edition) => ({
        ...edition,
        variants: (edition.variants || []).map((variant, idx) => ({
          ...variant,
          sku:
            variant.sku ||
            `${body.slug}-${edition.key}-${variant.size}`.toUpperCase(),
        })),
      }));
    }

    const perfume = new Perfume(body);
    await perfume.save();

    return NextResponse.json({
      message: "Perfume created successfully",
      perfume: {
        ...perfume.toObject(),
        _id: perfume._id.toString(),
      },
    });
  } catch (error) {
    console.error("Create perfume error:", error);
    if (
      error.message === "Unauthorized" ||
      error.message.includes("Admin access")
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to create perfume" },
      { status: 500 }
    );
  }
}
