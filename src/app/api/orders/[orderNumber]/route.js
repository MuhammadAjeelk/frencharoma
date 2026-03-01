import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";

// GET /api/orders/[orderNumber] — Get order by order number
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { orderNumber } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const query = { orderNumber: orderNumber.toUpperCase() };
    // If email provided, use it as extra verification
    if (email) query["customer.email"] = email.toLowerCase();

    const order = await Order.findOne(query).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Serialize
    const serialized = JSON.parse(JSON.stringify(order));

    return NextResponse.json({ order: serialized });
  } catch (err) {
    console.error("Get order error:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
