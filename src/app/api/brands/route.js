import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Perfume from "@/lib/models/Perfume";

const addBrand = (brandMap, value) => {
  if (typeof value !== "string") return;
  const trimmed = value.trim();
  if (!trimmed) return;
  const key = trimmed.toLowerCase();
  if (!brandMap.has(key)) {
    brandMap.set(key, trimmed);
  }
};

// GET /api/brands - Public: list distinct brands from active perfumes
export async function GET() {
  try {
    await connectDB();

    const perfumes = await Perfume.find({ status: "active" })
      .select("brand brands")
      .lean();

    const brandMap = new Map();
    for (const perfume of perfumes) {
      if (Array.isArray(perfume.brands)) {
        perfume.brands.forEach((b) => addBrand(brandMap, b));
      }
      if (perfume.brand) {
        addBrand(brandMap, perfume.brand);
      }
    }

    const brands = Array.from(brandMap.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Public brands error:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
