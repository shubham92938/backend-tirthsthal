const mongoose = require("mongoose");
const dns      = require("dns");

// ── DNS override (opt-in) ──
// Kuch networks par Atlas SRV lookup fail hota hai. Tab DNS_OVERRIDE=true set karo.
// Default: system DNS (hosting providers par yahi sahi hai).
if (process.env.DNS_OVERRIDE === "true") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

// Throws on failure — caller (server.js) decide karega ki process band karna hai ya nahi.
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS:          45000,
  });
  console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
