const { validationResult } = require("express-validator");

// ── express-validator ke errors ko ek hi shape me bhejo ──
// Response: { success:false, message:"<first error>", errors:[{field,message}] }
module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field:   e.path,
    message: e.msg,
  }));

  return res.status(400).json({
    success: false,
    message: errors[0].message,
    errors,
  });
};
