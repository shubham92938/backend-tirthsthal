const ContactMessage = require("../models/ContactMessage");
const sendEmail      = require("../utils/sendEmail");
const escapeHtml     = require("../utils/escapeHtml");

// ── Contact form submit (public; logged-in ho to user link ho jaata hai) ──
// POST /api/contact  body: { name, email, subject, message }
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      user: req.user?.id || null,
    });

    // Admin ko email — best effort. Email fail ho to bhi message store ho chuka hai,
    // isliye user ko error nahi jaayega.
    const recipient = process.env.CONTACT_RECIPIENT || process.env.EMAIL_USER;
    if (recipient && process.env.EMAIL_HOST) {
      sendEmail({
        to:      recipient,
        subject: `🛕 Tirthstal contact: ${subject}`,
        html: `
          <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        `,
      }).catch((err) => console.error(`⚠️ Contact email failed: ${err.message}`));
    }

    res.status(201).json({
      success: true,
      message: "Thank you for reaching out. We will get back to you soon.",
      contact: {
        id:        contact._id,
        name:      contact.name,
        email:     contact.email,
        subject:   contact.subject,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
