import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Perfume from "@/lib/models/Perfume";

// GET /api/scent-families - Public: distinct scent families from active perfumes
export async function GET() {
  try {
    await connectDB();

    const perfumes = await Perfume.find({ status: "active" })
      .select("scentFamily")
      .lean();

    const map = new Map();
    for (const p of perfumes) {
      const v = typeof p.scentFamily === "string" ? p.scentFamily.trim() : "";
      if (!v) continue;
      const key = v.toLowerCase();
      if (!map.has(key)) map.set(key, v);
    }

    const families = Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    return NextResponse.json(
      { families },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Public scent families error:", error);
    return NextResponse.json({ families: [] }, { status: 500 });
  }
}
