const express = require("express");
const router  = express.Router();
const { subscribe }        = require("../controllers/newsletterController");
const { newsletterRules }  = require("../validators/newsletterValidator");
const validate             = require("../middleware/validate");

// POST /api/newsletter — public
router.post("/", newsletterRules, validate, subscribe);

module.exports = router;
