import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import connectDB from "@/lib/db";
import Perfume from "@/lib/models/Perfume";

// PATCH /api/admin/perfumes/[id]/bestseller - Toggle best seller flag
export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const perfume = await Perfume.findById(id);

    if (!perfume) {
      return NextResponse.json({ error: "Perfume not found" }, { status: 404 });
    }

    perfume.isBestSeller = !perfume.isBestSeller;
    await perfume.save();

    return NextResponse.json({
      message: perfume.isBestSeller
        ? "Marked as best seller"
        : "Removed from best sellers",
      isBestSeller: perfume.isBestSeller,
    });
  } catch (error) {
    console.error("Toggle best seller error:", error);
    if (error.message === "Unauthorized" || error.message.includes("Admin access")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
