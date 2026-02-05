import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: [true, "Size is required"],
      enum: ["5ml", "30ml", "50ml", "100ml"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sampleLimitPerUser: {
      type: Number,
      min: [1, "Sample limit must be at least 1"],
      default: null,
    },
    images: {
      main: {
        type: String,
        default: null,
      },
      gallery: {
        type: [String],
        default: [],
      },
    },
  },
  { _id: true }
);

const EditionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      enum: ["luxury", "premium", "classic"],
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    variants: {
      type: [VariantSchema],
      default: [],
    },
  },
  { _id: true }
);

const PerfumeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Perfume name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    brands: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      top: {
        type: [String],
        default: [],
      },
      middle: {
        type: [String],
        default: [],
      },
      base: {
        type: [String],
        default: [],
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      enum: ["men", "women", "unisex", ""],
      default: "",
    },
    scentFamily: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    images: {
      main: {
        type: String,
        default: null,
      },
      gallery: {
        type: [String],
        default: [],
      },
    },
    editions: {
      type: [EditionSchema],
      default: [
        { key: "luxury", enabled: false, variants: [] },
        { key: "premium", enabled: false, variants: [] },
        { key: "classic", enabled: false, variants: [] },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name if not provided
PerfumeSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

// Custom validation for editions
PerfumeSchema.pre("validate", function () {
  const editions = this.editions || [];
  const enabledEditions = editions.filter((e) => e.enabled);

  if (this.status === "active" && enabledEditions.length === 0) {
    this.invalidate(
      "editions",
      "Active perfumes must have at least one enabled edition"
    );
  }

  for (const edition of enabledEditions) {
    const variants = edition.variants || [];
    const activeVariants = variants.filter((v) => v.isActive);

    if (activeVariants.length === 0) {
      this.invalidate(
        "editions",
        `Enabled edition "${edition.key}" must have at least one active variant`
      );
      continue;
    }

    const sizes = variants.map((v) => v.size);
    const uniqueSizes = new Set(sizes);
    if (sizes.length !== uniqueSizes.size) {
      this.invalidate(
        "editions",
        `Edition "${edition.key}" cannot have duplicate sizes`
      );
    }

    for (const variant of activeVariants) {
      if (variant.price <= 0) {
        this.invalidate(
          "editions",
          `Active variant ${variant.size} in edition "${edition.key}" must have a price greater than 0`
        );
      }
    }
  }
});

// Index for searching
PerfumeSchema.index({ name: "text", brand: "text", brands: "text", tags: "text" });
PerfumeSchema.index({ status: 1 });

const Perfume = mongoose.models.Perfume || mongoose.model("Perfume", PerfumeSchema);

export default Perfume;
