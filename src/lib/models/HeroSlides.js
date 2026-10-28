import mongoose from "mongoose";

// The homepage hero's slide list, as a single document (key "home"). With no
// document the built-in slides in src/lib/siteMedia.js are shown; "Restore
// original slides" deletes it.
const ArtSchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false },
);

const SlideSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    href: { type: String, required: true },
    desktop: { type: ArtSchema, required: true },
    mobile: { type: ArtSchema, default: null },
  },
  { _id: false },
);

const HeroSlidesSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "home" },
    slides: { type: [SlideSchema], default: [] },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true },
);

const HeroSlides =
  mongoose.models.HeroSlides || mongoose.model("HeroSlides", HeroSlidesSchema);

export default HeroSlides;
