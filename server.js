const dotenv = require("dotenv");
dotenv.config({ quiet: true });

const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const morgan       = require("morgan");
const connectDB    = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { isProduction, isOriginAllowed, getAllowedOrigins } = require("./utils/config");

// ── Startup: required env fail fast ──
const REQUIRED_ENV = ["JWT_SECRET", "MONGO_URI"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k] || !String(process.env[k]).trim());
if (missing.length) {
  console.error(`❌ Missing required environment variable(s): ${missing.join(", ")}`);
  console.error("   Set them in your hosting dashboard (or backend/.env for local dev). See README.md.");
  process.exit(1);
}

// ── Routes ──
const authRoutes       = require("./routes/authRoutes");
const templeRoutes     = require("./routes/templeRoutes");
const districtRoutes   = require("./routes/districtRoutes");
const festivalRoutes   = require("./routes/festivalRoutes");
const blogRoutes       = require("./routes/blogRoutes");
const reviewRoutes     = require("./routes/reviewRoutes");
const gosevaRoutes     = require("./routes/gosevaRoutes");
const contactRoutes    = require("./routes/contactRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");

const app = express();

// Hosting proxy (Render / Railway / Heroku) ke peeche — real client IP aur
// secure cookies/rate-limit ke liye zaroori.
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());

// ── CORS ──
// Disallowed origin → clean 403 JSON (cors ka callback(error) nahi use karte, woh 500 deta tha).
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !isOriginAllowed(origin)) {
    return res.status(403).json({ success: false, message: "Origin not allowed" });
  }
  next();
});

app.use(cors({
  origin: (origin, callback) => callback(null, isOriginAllowed(origin) ? (origin || true) : false),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
  maxAge: 86400, // preflight cache 1 din
}));

app.use(morgan(isProduction() ? "combined" : "dev"));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Express 5: body parse na ho to req.body undefined hota hai — destructuring crash se bachao
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

// ── Routes Mount ──
app.use("/api/auth",       authRoutes);
app.use("/api/temples",    templeRoutes);
app.use("/api/districts",  districtRoutes);
app.use("/api/festivals",  festivalRoutes);
app.use("/api/blogs",      blogRoutes);
app.use("/api/goseva",     gosevaRoutes);
app.use("/api/contact",    contactRoutes);
app.use("/api/newsletter", newsletterRoutes);

// ── Nested review route: /api/temples/:templeId/reviews ──
app.use("/api/temples/:templeId/reviews", reviewRoutes);

// ── Health Check ──
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🛕 Tirthstal API is running!",
    version: "1.0.0",
    environment: isProduction() ? "production" : "development",
    routes: [
      "POST   /api/auth/register",
      "POST   /api/auth/login",
      "POST   /api/auth/check-email",
      "POST   /api/auth/forgot-password",
      "POST   /api/auth/reset-password/:token",
      "GET    /api/auth/profile",
      "PUT    /api/auth/profile",
      "PUT    /api/auth/change-password",
      "DELETE /api/auth/account",
      "POST   /api/auth/logout",
      "GET    /api/temples",
      "GET    /api/temples/search?q=",
      "GET    /api/temples/:slug",
      "POST   /api/temples/:id/favorite",
      "GET    /api/temples/:templeId/reviews",
      "POST   /api/temples/:templeId/reviews",
      "GET    /api/districts",
      "GET    /api/districts/:slug",
      "GET    /api/festivals",
      "GET    /api/festivals/upcoming",
      "GET    /api/festivals/:slug",
      "GET    /api/blogs",
      "GET    /api/blogs/featured",
      "GET    /api/blogs/categories",
      "GET    /api/blogs/:slug",
      "GET    /api/goseva/stats",
      "GET    /api/goseva/gaushalas",
      "GET    /api/goseva/gaushalas/:slug",
      "POST   /api/goseva/pledges",
      "GET    /api/goseva/pledges/mine",
      "GET    /api/goseva/pledges (admin)",
      "PUT    /api/goseva/pledges/:id/status (admin)",
      "POST   /api/contact",
      "POST   /api/newsletter",
    ],
  });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Error Handler ──
app.use(errorHandler);

// ── Start: DB connect hone ke baad hi listen ──
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
let server;

const start = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error("   Check MONGO_URI and (for Atlas) that the host's IP is in the Network Access allowlist.");
    process.exit(1);
  }

  server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on port ${PORT} (${isProduction() ? "production" : "development"})`);
    console.log(`🔗 Health: /api/health`);
    console.log(`🌐 CORS origins: ${getAllowedOrigins().join(", ")}`);
  });
};

// Hosting platforms SIGTERM bhejte hain — connections saaf karke band karo
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);
  if (!server) process.exit(0);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 10000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

if (require.main === module) {
  start();
}

module.exports = app; // testing ke liye
