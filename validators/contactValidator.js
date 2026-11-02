const { body } = require("express-validator");

exports.contactRules = [
  body("name")
    .exists({ values: "falsy" }).withMessage("Name is required").bail()
    .isString().withMessage("Name must be text").bail()
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters"),

  body("email")
    .exists({ values: "falsy" }).withMessage("Email is required").bail()
    .isString().bail()
    .trim()
    .isEmail().withMessage("Please enter a valid email")
    .isLength({ max: 254 }).withMessage("Email is too long")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("subject")
    .exists({ values: "falsy" }).withMessage("Subject is required").bail()
    .isString().withMessage("Subject must be text").bail()
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage("Subject must be 3–150 characters"),

  body("message")
    .exists({ values: "falsy" }).withMessage("Message is required").bail()
    .isString().withMessage("Message must be text").bail()
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage("Message must be 10–2000 characters"),
];
