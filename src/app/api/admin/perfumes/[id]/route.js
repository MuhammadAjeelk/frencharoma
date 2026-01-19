import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import connectDB from "@/lib/db";
import Perfume from "@/lib/models/Perfume";
import { deleteFile } from "@/lib/upload";

// GET /api/admin/perfumes/[id] - Get a single perfume
export async function GET(request, { params }) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const perfume = await Perfume.findById(id).lean();

    if (!perfume) {
      return NextResponse.json({ error: "Perfume not found" }, { status: 404 });
    }

    return NextResponse.json({
      perfume: {
        ...perfume,
        _id: perfume._id.toString(),
        createdAt: perfume.createdAt.toISOString(),
        updatedAt: perfume.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get perfume error:", error);
    if (
      error.message === "Unauthorized" ||
      error.message.includes("Admin access")
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch perfume" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/perfumes/[id] - Update a perfume
export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const existingPerfume = await Perfume.findById(id);
    if (!existingPerfume) {
      return NextResponse.json({ error: "Perfume not found" }, { status: 404 });
    }

    // Server-side validation
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Perfume name is required" },
        { status: 400 }
      );
    }

    // Check slug uniqueness if changed
    if (body.slug && body.slug !== existingPerfume.slug) {
      const existingSlug = await Perfume.findOne({
        slug: body.slug,
        _id: { $ne: id },
      });
      if (existingSlug) {
        return NextResponse.json(
          { error: "A perfume with this slug already exists" },
          { status: 400 }
        );
      }
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
        const activeVariants =
          edition.variants?.filter((v) => v.isActive) || [];
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

        // Validate prices for active variants
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

    // Handle deleted images - clean up files
    if (body._deletedImages && body._deletedImages.length > 0) {
      for (const imageUrl of body._deletedImages) {
        await deleteFile(imageUrl);
      }
      delete body._deletedImages;
    }

    // Update the perfume
    Object.assign(existingPerfume, body);
    await existingPerfume.save();

    return NextResponse.json({
      message: "Perfume updated successfully",
      perfume: {
        ...existingPerfume.toObject(),
        _id: existingPerfume._id.toString(),
      },
    });
  } catch (error) {
    console.error("Update perfume error:", error);
    if (
      error.message === "Unauthorized" ||
      error.message.includes("Admin access")
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to update perfume" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/perfumes/[id] - Delete a perfume permanently
export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const perfume = await Perfume.findById(id);

    if (!perfume) {
      return NextResponse.json({ error: "Perfume not found" }, { status: 404 });
    }

    // Delete associated images
    if (perfume.images?.main) {
      await deleteFile(perfume.images.main);
    }
    if (perfume.images?.gallery) {
      for (const url of perfume.images.gallery) {
        await deleteFile(url);
      }
    }

    // Delete edition image overrides
    for (const edition of perfume.editions || []) {
      if (edition.imagesOverride?.main) {
        await deleteFile(edition.imagesOverride.main);
      }
      if (edition.imagesOverride?.gallery) {
        for (const url of edition.imagesOverride.gallery) {
          await deleteFile(url);
        }
      }
    }

    await Perfume.findByIdAndDelete(id);

    return NextResponse.json({ message: "Perfume deleted successfully" });
  } catch (error) {
    console.error("Delete perfume error:", error);
    if (
      error.message === "Unauthorized" ||
      error.message.includes("Admin access")
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete perfume" },
      { status: 500 }
    );
  }
}
