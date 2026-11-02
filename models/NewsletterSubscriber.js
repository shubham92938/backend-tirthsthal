const mongoose = require("mongoose");

// ── Newsletter subscribers (POST /api/newsletter) ──
const NewsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type:     String,
      required: [true, "Email is required"],
      unique:   true,          // dedupe: ek email ek hi baar
      lowercase: true,
      trim:     true,
      match:    [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    isActive: { type: Boolean, default: true },
    source:   { type: String, default: "website" }, // footer / festivals page etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model("NewsletterSubscriber", NewsletterSubscriberSchema);
