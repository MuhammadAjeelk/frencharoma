import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/lib/models/Review";

// GET /api/reviews?slug=xxx — fetch approved reviews for a perfume
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const reviews = await Review.find({ perfumeSlug: slug, isApproved: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const total = await Review.countDocuments({
      perfumeSlug: slug,
      isApproved: true,
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const serialized = reviews.map((r) => ({
      ...r,
      _id: r._id.toString(),
      perfumeId: r.perfumeId.toString(),
      userId: r.userId?.toString() || null,
    }));

    return NextResponse.json({
      reviews: serialized,
      total,
      avgRating: Math.round(avgRating * 10) / 10,
    });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews — submit a new review
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { perfumeId, perfumeSlug, name, email, rating, title, body: reviewBody } = body;

    if (!perfumeId || !perfumeSlug || !name || !rating) {
      return NextResponse.json(
        { error: "perfumeId, perfumeSlug, name, and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      perfumeId,
      perfumeSlug,
      name: name.trim(),
      email: email?.trim() || "",
      rating: Math.round(rating),
      title: title?.trim() || "",
      body: reviewBody?.trim() || "",
    });

    return NextResponse.json(
      {
        review: {
          ...review.toObject(),
          _id: review._id.toString(),
          perfumeId: review.perfumeId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
