import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";

// GET /api/orders?userId=...&email=... — Fetch orders for a user
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json({ error: "userId or email is required" }, { status: 400 });
    }

    // Build query: match by userId OR by email (catches guest orders placed with same email)
    const orConditions = [];
    if (userId) orConditions.push({ userId });
    if (email) orConditions.push({ "customer.email": email.toLowerCase() });

    const orders = await Order.find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .lean();

    const serialized = JSON.parse(JSON.stringify(orders));
    return NextResponse.json({ orders: serialized });
  } catch (err) {
    console.error("Get orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FA-${year}${month}-${random}`;
}

// POST /api/orders — Create a new order
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      customer,
      items,
      paymentMethod,
      subtotal,
      shippingCost,
      total,
      notes,
      userId,
    } = body;

    // Basic validation
    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address || !customer?.city) {
      return NextResponse.json({ error: "Missing required customer fields" }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
    }
    if (!["cod", "online"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      ...(userId ? { userId } : {}),
      customer,
      items,
      paymentMethod,
      subtotal,
      shippingCost: shippingCost || 200,
      total,
      notes: notes || "",
      paymentStatus: "pending",
      status: "pending",
      statusHistory: [
        { status: "pending", note: "Order placed", timestamp: new Date() },
      ],
    });

    return NextResponse.json(
      { success: true, orderNumber: order.orderNumber, orderId: order._id.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
