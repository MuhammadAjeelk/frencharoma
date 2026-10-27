import mongoose from "mongoose";

// One document per replaced homepage image. Slots with no document render
// their built-in default (see src/lib/siteMedia.js).
const SiteMediaSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true },
);

const SiteMedia =
  mongoose.models.SiteMedia || mongoose.model("SiteMedia", SiteMediaSchema);

export default SiteMedia;
