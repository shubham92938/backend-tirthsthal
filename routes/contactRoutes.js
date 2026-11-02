const express = require("express");
const router  = express.Router();
const { submitContact } = require("../controllers/contactController");
const { contactRules }  = require("../validators/contactValidator");
const validate          = require("../middleware/validate");
const { optionalAuth }  = require("../middleware/auth");

// POST /api/contact — public (login ho to user link ho jaata hai)
router.post("/", optionalAuth, contactRules, validate, submitContact);

module.exports = router;
