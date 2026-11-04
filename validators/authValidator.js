const { body } = require("express-validator");

const emailRule = () =>
  body("email")
    .exists({ values: "falsy" }).withMessage("Email is required").bail()
    .isString().withMessage("Email must be text").bail()
    .trim()
    .isEmail().withMessage("Please enter a valid email")
    .isLength({ max: 254 }).withMessage("Email is too long")
    .normalizeEmail({ gmail_remove_dots: false });

const passwordRule = (field = "password") =>
  body(field)
    .exists({ values: "falsy" }).withMessage("Password is required").bail()
    .isString().withMessage("Password must be text").bail()
    .isLength({ min: 6, max: 72 }).withMessage("Password must be 6–72 characters")
    // bcrypt sirf pehle 72 bytes use karta hai
    .custom((v) => Buffer.byteLength(v, "utf8") <= 72)
    .withMessage("Password is too long");

// POST /api/auth/register
exports.registerRules = [
  body("name")
    .exists({ values: "falsy" }).withMessage("Name is required").bail()
    .isString().withMessage("Name must be text").bail()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage("Name must be 1–50 characters"),
  emailRule(),
  passwordRule(),
];

// POST /api/auth/login
exports.loginRules = [emailRule(), passwordRule()];

const PHONE_RX = /^[+\d][\d\s-]{9,15}$/;

// PUT /api/auth/profile — sab fields optional; jo bheji jaayein sirf wahi update hoti hain.
// Empty string phone/city/bio = clear karna.
exports.updateProfileRules = [
  body("name")
    .optional()
    .isString().withMessage("Name must be text").bail()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage("Name must be 1–50 characters"),

  body("language")
    .optional()
    .isIn(["en", "hi", "mr", "gu"]).withMessage("Language must be one of en, hi, mr, gu"),

  body("phone")
    .optional({ values: "null" })
    .isString().withMessage("Phone must be text").bail()
    .trim()
    .custom((v) => v === "" || PHONE_RX.test(v))
    .withMessage("Please enter a valid phone number"),

  body("city")
    .optional({ values: "null" })
    .isString().withMessage("City must be text").bail()
    .trim()
    .isLength({ max: 100 }).withMessage("City cannot exceed 100 characters"),

  body("bio")
    .optional({ values: "null" })
    .isString().withMessage("Bio must be text").bail()
    .trim()
    .isLength({ max: 500 }).withMessage("Bio cannot exceed 500 characters"),
];

// PUT /api/auth/change-password
exports.changePasswordRules = [
  body("currentPassword")
    .exists({ values: "falsy" }).withMessage("Current password is required").bail()
    .isString().withMessage("Current password must be text"),

  body("newPassword")
    .exists({ values: "falsy" }).withMessage("New password is required").bail()
    .isString().withMessage("New password must be text").bail()
    .isLength({ min: 6, max: 72 }).withMessage("New password must be 6–72 characters")
    // bcrypt sirf pehle 72 bytes use karta hai — isliye byte limit bhi check karo
    .custom((v) => Buffer.byteLength(v, "utf8") <= 72)
    .withMessage("New password is too long")
    .custom((v, { req }) => v !== req.body.currentPassword)
    .withMessage("New password must be different from the current password"),
];
