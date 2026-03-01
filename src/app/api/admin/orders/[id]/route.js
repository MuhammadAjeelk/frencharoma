import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/orders/[id] — Get single order
export async function GET(request, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id).lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json({ order: JSON.parse(JSON.stringify(order)) });
  } catch (err) {
    if (err.message === "Unauthorized" || err.message?.includes("Forbidden")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// PATCH /api/admin/orders/[id] — Update order status / notes
export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Capture old status BEFORE making changes
    const oldStatus = order.status;

    // Apply updates
    const allowedFields = ["status", "paymentStatus", "adminNotes", "trackingNumber"];
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        order[key] = body[key];
      }
    }

    // Push to status history only if status actually changed
    if (body.status && body.status !== oldStatus) {
      order.statusHistory.push({
        status: body.status,
        note: body.statusNote || "",
        timestamp: new Date(),
      });
    }

    await order.save();

    return NextResponse.json({ success: true, order: JSON.parse(JSON.stringify(order.toObject())) });
  } catch (err) {
    console.error("Update order error:", err);
    if (err.message === "Unauthorized" || err.message?.includes("Forbidden")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
