const NewsletterSubscriber = require("../models/NewsletterSubscriber");

// ── Newsletter subscribe (public) ──
// POST /api/newsletter  body: { email }
// Dedupe: same email dobara aaye to error nahi — "already subscribed" 200.
// (Frontend 4xx ko validation error maanta hai, isliye duplicate 200 hai.)
exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
        return res.status(200).json({
          success: true,
          subscribed: true,
          message: "Welcome back! You are subscribed again.",
        });
      }
      return res.status(200).json({
        success: true,
        subscribed: true,
        alreadySubscribed: true,
        message: "You are already subscribed.",
      });
    }

    try {
      await NewsletterSubscriber.create({ email, source: req.body.source || "website" });
    } catch (error) {
      // Race condition: do requests ek saath aayi aur unique index ne pakad liya
      if (error.code === 11000) {
        return res.status(200).json({
          success: true,
          subscribed: true,
          alreadySubscribed: true,
          message: "You are already subscribed.",
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      subscribed: true,
      message: "Thank you for subscribing!",
    });
  } catch (error) {
    next(error);
  }
};
