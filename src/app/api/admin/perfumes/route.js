import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import connectDB from "@/lib/db";
import Perfume from "@/lib/models/Perfume";

// GET /api/admin/perfumes - List all perfumes with search/filter
export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const perfumes = await Perfume.find(query)
      .sort({ updatedAt: -1 })
      .select("name brand slug status editions images updatedAt")
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
