import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    perfumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Perfume",
      required: true,
    },
    perfumeSlug: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    body: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ perfumeSlug: 1, createdAt: -1 });
ReviewSchema.index({ perfumeId: 1, isApproved: 1 });

let Review;
if (mongoose.models.Review) {
  Review = mongoose.models.Review;
} else {
  Review = mongoose.model("Review", ReviewSchema);
}

export default Review;
