import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Perfume from "@/lib/models/Perfume";

// GET /api/perfumes/[slug] - Public single perfume by slug
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { slug } = await params;

    const perfume = await Perfume.findOne({ slug, status: "active" }).lean();

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
    console.error("Public get perfume error:", error);
    return NextResponse.json(
      { error: "Failed to fetch perfume" },
      { status: 500 }
    );
  }
}
