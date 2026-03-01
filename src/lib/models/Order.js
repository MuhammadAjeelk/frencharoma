import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  perfumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Perfume" },
  name: { type: String, required: true },
  slug: { type: String },
  image: { type: String },
  edition: { type: String },
  size: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // linked account (null for guests)
    orderNumber: {
      type: String,
      unique: true,
      default: () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const random = Math.floor(1000 + Math.random() * 9000);
        return `FA-${year}${month}-${random}`;
      },
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, default: "" },
    },
    items: [OrderItemSchema],
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "submitted", "confirmed", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 200 },
    total: { type: Number, required: true },
    notes: { type: String, default: "" },
    adminNotes: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    statusHistory: [StatusHistorySchema],
  },
  { timestamps: true }
);

// In development, always re-register the model so schema changes (like removing
// pre-save hooks) take effect without restarting the server.
if (process.env.NODE_ENV !== "production" && mongoose.models.Order) {
  delete mongoose.models.Order;
}
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default Order;
