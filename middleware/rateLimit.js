const rateLimit = require("express-rate-limit");

// Brute-force / spam se bachao. Response JSON hi rahega ({success:false,message}).
const make = ({ windowMs, limit, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests, // true → sirf galat attempts ginein
    standardHeaders: "draft-7", // RateLimit-* headers
    legacyHeaders:   false,
    message: { success: false, message },
  });

const FIFTEEN_MIN = 15 * 60 * 1000;
const ONE_HOUR    = 60 * 60 * 1000;

exports.loginLimiter = make({
  windowMs: FIFTEEN_MIN,
  limit: 20,
  skipSuccessfulRequests: true,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

exports.registerLimiter = make({
  windowMs: ONE_HOUR,
  limit: 20,
  message: "Too many accounts created from this network. Please try again later.",
});

exports.forgotPasswordLimiter = make({
  windowMs: ONE_HOUR,
  limit: 5,
  message: "Too many password reset requests. Please try again after an hour.",
});
