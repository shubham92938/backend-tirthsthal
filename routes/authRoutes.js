const express = require("express");
const router  = express.Router();
const {
  register, login, getProfile,
  updateProfile, logout, forgotPassword, resetPassword, checkEmail,
  changePassword, deleteAccount,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate    = require("../middleware/validate");
const {
  updateProfileRules, changePasswordRules,
} = require("../validators/authValidator");

router.post("/register",       register);
router.post("/login",          login);
router.post("/check-email",    checkEmail);
router.get( "/profile",        protect, getProfile);
router.put( "/profile",        protect, updateProfileRules, validate, updateProfile);
router.post("/logout",         protect, logout);
router.post("/forgot-password",             forgotPassword);
router.post("/reset-password/:token",       resetPassword);

// ── New: password change & account delete (protected) ──
router.put(   "/change-password", protect, changePasswordRules, validate, changePassword);
router.delete("/account",         protect, deleteAccount);

module.exports = router;
