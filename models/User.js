const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: [true, "Name is required"],
    trim:     true,
    maxlength:[50, "Name cannot exceed 50 characters"],
  },
  email: {
    type:     String,
    required: [true, "Email is required"],
    unique:   true,
    lowercase:true,
    match:    [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  password: {
    type:     String,
    required: [true, "Password is required"],
    minlength:[6, "Password must be at least 6 characters"],
    select:   false,
  },
  avatar: {
    type:    String,
    default: "",
  },
  // ── Profile details (PUT /api/auth/profile) ──
  phone: {
    type:    String,
    trim:    true,
    default: "",
    match:   [/^$|^[+\d][\d\s-]{9,15}$/, "Please enter a valid phone number"],
  },
  city: {
    type:      String,
    trim:      true,
    default:   "",
    maxlength: [100, "City cannot exceed 100 characters"],
  },
  bio: {
    type:      String,
    trim:      true,
    default:   "",
    maxlength: [500, "Bio cannot exceed 500 characters"],
  },
  role: {
    type:    String,
    enum:    ["user", "admin"],
    default: "user",
  },
  language: {
    type:    String,
    enum:    ["en", "hi", "mr", "gu"],
    default: "en",
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:  "Temple",
  }],
  isVerified: {
    type:    Boolean,
    default: false,
  },
  // select:false — hashed reset token profile response me kabhi na jaaye
  resetPasswordToken:  { type: String, select: false },
  resetPasswordExpire: { type: Date,   select: false },
}, {
  timestamps: true,
  // Defense in depth: JSON/response me password ya reset token kabhi na jaaye,
  // chahe query me select:false override ho jaaye.
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpire;
      delete ret.__v;
      return ret;
    },
  },
});

// ── Hooks & Methods BEFORE module.exports ──

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Single export at the bottom ──
module.exports = mongoose.model("User", UserSchema);