import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
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

// GET /api/admin/brands - List distinct brands for admin inputs
export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const perfumes = await Perfume.find({})
      .select("brand brands")
      .lean();

    const brandMap = new Map();
    for (const perfume of perfumes) {
      if (Array.isArray(perfume.brands)) {
        perfume.brands.forEach((brand) => addBrand(brandMap, brand));
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
    console.error("List brands error:", error);
    if (
      error.message === "Unauthorized" ||
      error.message.includes("Admin access")
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
