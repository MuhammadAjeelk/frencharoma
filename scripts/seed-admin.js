// Run with: node scripts/seed-admin.js
// This script creates an admin user for testing

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/frencharomas";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@frencharomas.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash("admin123", salt);

    const admin = new User({
      email: "admin@frencharomas.com",
      passwordHash,
      name: "Admin User",
      role: "admin",
    });

    await admin.save();
    console.log("Admin user created successfully!");
    console.log("Email: admin@frencharomas.com");
    console.log("Password: admin123");
    console.log("\nIMPORTANT: Change these credentials in production!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
