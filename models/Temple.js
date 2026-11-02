const mongoose = require("mongoose");

// ── Temple listing (frontend ke src/data/temple.js ke shape se match karta hai) ──
const TempleSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Temple name is required"],
      trim:     true,
      maxlength: [150, "Name cannot exceed 150 characters"],
    },
    slug: {
      type:   String,
      unique: true, // unique index already banata hai
    },
    deity: {
      type:     String,
      required: [true, "Deity is required"],
      trim:     true,
    },
    deityColor: { type: String, default: "#c8610a" }, // UI accent color
    type:       { type: String, trim: true, default: "" }, // Jyotirlinga, Shakti Peeth, ...

    address:  { type: String, trim: true, default: "" },
    district: {
      type:     String,
      required: [true, "District is required"],
      trim:     true,
    },
    state: {
      type:     String,
      required: [true, "State is required"],
      trim:     true,
    },

    description: { type: String, trim: true, default: "" },
    history:     { type: String, trim: true, default: "" },

    timings: {
      morning: { type: String, default: "" },
      evening: { type: String, default: "" },
    },
    // e.g. { morningAarti: "6:00 AM", eveningAarti: "7:30 PM" }
    aartiTimings: {
      type: Map,
      of:   String,
    },

    festivals:     [String],
    images:        [String],
    facilities:    [String],
    nearbyTemples: [String],

    coordinates: {
      lat: { type: Number, min: -90,  max: 90  },
      lng: { type: Number, min: -180, max: 180 },
    },

    rating:  { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 }, // public review count (display)

    officialWebsite: { type: String, trim: true, default: "" },

    // Soft delete ke liye (deleteTemple isActive=false karta hai).
    // default true: pehle se bane documents bhi listing me aayein.
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// ── Auto slug generate (agar slug na diya ho) ──
TempleSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// ── Search Index ──
TempleSchema.index({
  name:     "text",
  deity:    "text",
  district: "text",
  state:    "text",
  type:     "text",
});

module.exports = mongoose.model("Temple", TempleSchema);
