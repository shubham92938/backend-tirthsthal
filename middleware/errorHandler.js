const { isProduction } = require("../utils/config");

// ── Central error handler ──
// Rule: response me kabhi stack trace nahi jaata. 5xx par production me generic message.
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Server logs me poori detail (stack) — sirf server console par
  console.error(err.stack || err);

  // Body parser errors (malformed JSON, body too large, wrong content-type)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request body too large" });
  }

  // Mongo duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const message = field === "email" ? "Email already registered" : `${field} already exists`;
    return res.status(field === "email" ? 409 : 400).json({ success: false, message });
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message).join(", ");
    return res.status(400).json({ success: false, message });
  }

  // Mongoose bad ObjectId (e.g. /api/temples/:id with junk)
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }

  // JWT
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  const status = Number(err.statusCode || err.status) || 500;

  // 4xx ka message safe hai (humne khud likha hai); 5xx production me hide
  let message;
  if (status < 500) {
    message = err.message || "Bad request";
  } else {
    message = isProduction() ? "Server Error" : err.message || "Server Error";
  }

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
