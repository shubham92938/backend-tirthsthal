const { body } = require("express-validator");

exports.newsletterRules = [
  body("email")
    .exists({ values: "falsy" }).withMessage("Email is required").bail()
    .isString().bail()
    .trim()
    .isEmail().withMessage("Please enter a valid email")
    .isLength({ max: 254 }).withMessage("Email is too long")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("source")
    .optional({ values: "null" })
    .isString().bail()
    .trim()
    .isIn(["website", "footer", "festivals"]).withMessage("Unknown subscription source"),
];
