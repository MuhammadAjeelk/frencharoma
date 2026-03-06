import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Perfume from "@/lib/models/Perfume";

// GET /api/perfumes - Public list of active perfumes with optional filters
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search      = searchParams.get("search");
    const gender      = searchParams.get("gender");
    const scentFamily = searchParams.get("scentFamily");
    const tag         = searchParams.get("tag");
    const edition     = searchParams.get("edition");
    const bestSeller  = searchParams.get("bestSeller");
    const sort        = searchParams.get("sort") || "newest";
    const limit       = parseInt(searchParams.get("limit") || "20");
    const page        = parseInt(searchParams.get("page")  || "1");

    const conditions = [{ status: "active" }];

    if (search) {
      const searchRegex = new RegExp(search, "i");
      conditions.push({
        $or: [
          { name:        { $regex: search, $options: "i" } },
          { brand:       { $regex: search, $options: "i" } },
          { brands:      { $in: [searchRegex] } },
          { tags:        { $in: [searchRegex] } },
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

    // Filter by edition key (Luxury / Premium / Classic)
    if (edition && edition !== "all") {
      conditions.push({
        editions: { $elemMatch: { key: edition, enabled: true } },
      });
    }

    if (bestSeller === "true") {
      conditions.push({ isBestSeller: true });
    }

    const query = { $and: conditions };
    const skip  = (page - 1) * limit;

    // ── Price-based sort: needs aggregation pipeline ──────────────────────
    if (sort === "price-asc" || sort === "price-desc") {
      const sortDir = sort === "price-asc" ? 1 : -1;

      const dataPipeline = [
        { $match: query },
        {
          $addFields: {
            _minPrice: {
              $min: {
                $reduce: {
                  input: { $ifNull: ["$editions", []] },
                  initialValue: [],
                  in: {
                    $concatArrays: [
                      "$$value",
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: { $ifNull: ["$$this.variants", []] },
                              as: "v",
                              cond: { $eq: ["$$v.isActive", true] },
                            },
                          },
                          as: "v",
                          in: "$$v.price",
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        { $sort: { _minPrice: sortDir } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _minPrice: 0,
            name: 1, slug: 1, brand: 1, brands: 1, gender: 1,
            scentFamily: 1, tags: 1, images: 1, editions: 1,
            description: 1, notes: 1, status: 1, isBestSeller: 1,
          },
        },
      ];

      const [perfumesAgg, totalCount] = await Promise.all([
        Perfume.aggregate(dataPipeline),
        Perfume.countDocuments(query),
      ]);

      const serialized = perfumesAgg.map((p) => ({
        ...p,
        _id: p._id.toString(),
      }));

      return NextResponse.json({
        perfumes: serialized,
        total:    totalCount,
        page,
        pages:    Math.ceil(totalCount / limit),
      });
    }

    // ── Standard sort ─────────────────────────────────────────────────────
    let sortObj = {};
    if      (sort === "newest")    sortObj = { createdAt: -1 };
    else if (sort === "oldest")    sortObj = { createdAt:  1 };
    else if (sort === "name-asc")  sortObj = { name:  1 };
    else if (sort === "name-desc") sortObj = { name: -1 };
    else                           sortObj = { createdAt: -1 };

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
