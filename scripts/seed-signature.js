// One-off: mark perfumes whose impression is "Signature Scent" as isSignature.
// Usage: node scripts/seed-signature.js
const fs = require("fs");
const mongoose = require("mongoose");

function readEnv(key) {
  const raw = fs.readFileSync(".env.local", "utf8");
  const line = raw.split("\n").find((l) => l.startsWith(key + "="));
  return line ? line.slice(key.length + 1).trim().replace(/^["']|["']$/g, "") : "";
}

(async () => {
  await mongoose.connect(readEnv("MONGODB_URI"));
  const Perfume = mongoose.connection.collection("perfumes");

  const res = await Perfume.updateMany(
    { impressionName: "Signature Scent", status: "active" },
    { $set: { isSignature: true } }
  );
  console.log("matched:", res.matchedCount, "modified:", res.modifiedCount);

  const total = await Perfume.countDocuments({ isSignature: true });
  console.log("total signature now:", total);

  const sample = await Perfume.find({ isSignature: true })
    .project({ name: 1 })
    .limit(15)
    .toArray();
  sample.forEach((p) => console.log("  -", p.name));

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
