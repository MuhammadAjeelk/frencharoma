import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Perfume from "@/lib/models/Perfume";

// GET /api/perfumes - Public list of active perfumes with optional filters
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const gender = searchParams.get("gender");
    const scentFamily = searchParams.get("scentFamily");
    const tag = searchParams.get("tag");
    const bestSeller = searchParams.get("bestSeller");
    const sort = searchParams.get("sort") || "newest";
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const conditions = [{ status: "active" }];

    if (search) {
      const searchRegex = new RegExp(search, "i");
      conditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { brands: { $in: [searchRegex] } },
          { tags: { $in: [searchRegex] } },
          { description: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (gender && gender !== "all") {
      conditions.push({ gender });
    }

    if (scentFamily && scentFamily !== "all") {
      conditions.push({ scentFamily: { $regex: scentFamily, $options: "i" } });
    }

    if (tag && tag !== "all") {
      conditions.push({ tags: { $in: [new RegExp(tag, "i")] } });
    }

    if (bestSeller === "true") {
      conditions.push({ isBestSeller: true });
    }

    const query = { $and: conditions };

    let sortObj = {};
    if (sort === "newest") sortObj = { createdAt: -1 };
    else if (sort === "oldest") sortObj = { createdAt: 1 };
    else if (sort === "name-asc") sortObj = { name: 1 };
    else if (sort === "name-desc") sortObj = { name: -1 };
    else sortObj = { createdAt: -1 };

    const skip = (page - 1) * limit;

    const [perfumes, total] = await Promise.all([
      Perfume.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select(
          "name slug brand brands gender scentFamily tags images editions description notes status isBestSeller"
        )
        .lean(),
      Perfume.countDocuments(query),
    ]);

    const serialized = perfumes.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }));

    return NextResponse.json({
      perfumes: serialized,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Public list perfumes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch perfumes" },
      { status: 500 }
    );
  }
}
