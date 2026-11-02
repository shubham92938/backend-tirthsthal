// ── Seed / update temples ──
// Usage (from backend/):  npm run seed:temples
// Idempotent: upserts by `slug` (existing docs are updated, never duplicated).
// Requires MONGO_URI in .env.
//
// Also fixes older Temple docs that were created before the isActive field
// existed — they would otherwise be hidden by the isActive:true listing filter.

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const Temple   = require("../models/Temple");
const temples  = [
  ...require("./templeData"),
  ...require("./templeDataExtra"),
];

(async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not set. Copy .env.example to .env and fill it first.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    const slugs = temples.map((t) => t.slug);
    if (new Set(slugs).size !== slugs.length) {
      throw new Error("Duplicate slug found in seed data");
    }

    let created = 0;
    let updated = 0;

    for (const item of temples) {
      const { slug, ...fields } = item;
      const result = await Temple.updateOne(
        { slug },
        { $set: { ...fields, slug, isActive: true } },
        { upsert: true, runValidators: true }
      );
      if (result.upsertedCount) created += 1;
      else updated += 1;
    }

    const legacy = await Temple.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );

    console.log(
      `🛕 Temples seeded — created: ${created}, updated: ${updated}, total: ${temples.length}` +
      (legacy.modifiedCount ? `, legacy docs activated: ${legacy.modifiedCount}` : "")
    );
  } catch (error) {
    console.error(`❌ Seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
