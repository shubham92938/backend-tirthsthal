const express = require("express");
const router  = express.Router();
const {
  register, login, getProfile,
  updateProfile, logout, forgotPassword, resetPassword, checkEmail,
  changePassword, deleteAccount,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate    = require("../middleware/validate");
const { loginLimiter, registerLimiter, forgotPasswordLimiter } = require("../middleware/rateLimit");
const {
  registerRules, loginRules, updateProfileRules, changePasswordRules,
} = require("../validators/authValidator");

router.post("/register",       registerLimiter, registerRules, validate, register);
router.post("/login",          loginLimiter, loginRules, validate, login);
router.post("/check-email",    checkEmail);
router.get( "/profile",        protect, getProfile);
router.put( "/profile",        protect, updateProfileRules, validate, updateProfile);
router.post("/logout",         protect, logout);
router.post("/forgot-password",   forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token",       resetPassword);

// ── password change & account delete (protected) ──
router.put(   "/change-password", protect, changePasswordRules, validate, changePassword);
router.delete("/account",         protect, deleteAccount);

module.exports = router;
