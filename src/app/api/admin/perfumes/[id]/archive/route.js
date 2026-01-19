import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import connectDB from "@/lib/db";
import Perfume from "@/lib/models/Perfume";

// PATCH /api/admin/perfumes/[id]/archive - Archive a perfume (soft delete)
export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const perfume = await Perfume.findById(id);

    if (!perfume) {
      return NextResponse.json({ error: "Perfume not found" }, { status: 404 });
    }

    if (perfume.status === "archived") {
      return NextResponse.json(
        { error: "Perfume is already archived" },
        { status: 400 }
      );
    }

    perfume.status = "archived";
    await perfume.save();

    return NextResponse.json({
      message: "Perfume archived successfully",
      perfume: {
        _id: perfume._id.toString(),
        status: perfume.status,
      },
    });
  } catch (error) {
    console.error("Archive perfume error:", error);
    if (
      error.message === "Unauthorized" ||
      error.message.includes("Admin access")
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to archive perfume" },
      { status: 500 }
    );
  }
}
