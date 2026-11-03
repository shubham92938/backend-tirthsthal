// ── Central config helpers (CORS origins, frontend URL) ──
// Sab env parsing ek jagah: server.js, authController aur tests ek hi logic use karein.

const PRODUCTION_FRONTEND = "https://tirthsthalweb.netlify.app";
const LOCAL_DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
];

const isProduction = () => process.env.NODE_ENV === "production";

// "https://a.com/, https://b.com " → ["https://a.com", "https://b.com"]
// Trailing slash strip karta hai (origin me path nahi hota, browser "/" nahi bhejta).
const parseOriginList = (value = "") =>
  String(value)
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);

// Netlify deploy previews: https://<branch>--tirthsthalweb.netlify.app
const NETLIFY_PREVIEW_RX = /^https:\/\/[a-z0-9-]+--tirthsthalweb\.netlify\.app$/i;

// Allowed origins:
//  - production site (Netlify) — hamesha
//  - CLIENT_URL me jo bhi diya ho (comma-separated)
//  - localhost dev origins — sirf non-production me
const getAllowedOrigins = () => {
  const list = [
    PRODUCTION_FRONTEND,
    ...parseOriginList(process.env.CLIENT_URL),
    ...(isProduction() ? [] : LOCAL_DEV_ORIGINS),
  ];
  return [...new Set(list)];
};

// ALLOW_NETLIFY_PREVIEWS=true → deploy previews bhi allow (regex se)
const isOriginAllowed = (origin) => {
  if (!origin) return true; // curl / server-to-server (browser origin nahi bhejta)
  if (getAllowedOrigins().includes(origin)) return true;
  if (process.env.ALLOW_NETLIFY_PREVIEWS === "true" && NETLIFY_PREVIEW_RX.test(origin)) return true;
  return false;
};

// Password reset link ke liye ek hi URL.
// FRONTEND_URL → nahi to CLIENT_URL ka pehla entry → nahi to production site.
const getFrontendUrl = () => {
  const explicit = parseOriginList(process.env.FRONTEND_URL)[0];
  if (explicit) return explicit;
  const first = parseOriginList(process.env.CLIENT_URL)[0];
  if (first) return first;
  return PRODUCTION_FRONTEND;
};

module.exports = {
  isProduction,
  parseOriginList,
  getAllowedOrigins,
  isOriginAllowed,
  getFrontendUrl,
};
