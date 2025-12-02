// ========================================
// Load environment variables FIRST
// ========================================
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// CORS SETUP
// ========================================
const corsEnv = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "";
const allowedOrigins = corsEnv
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed by server"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ========================================
// MongoDB Connection
// ========================================
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("❌ ERROR: MONGO_URI is missing. Add it to Render environment.");
  process.exit(1);
}

console.log("⏳ Connecting to MongoDB...");

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    // Load routes only after DB is connected
    console.log("📌 Importing Auth Routes...");
    const authRoutes = require("./routes/authRoutes");

    console.log("📌 Mounting /api/auth Routes...");
    app.use("/api/auth", authRoutes);

    // Test route
    app.get("/", (req, res) => {
      res.send("🚀 Backend is running on Render!");
    });

    app.get("/health", (req, res) => {
      const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
      res.json({ ok: state === 1, state });
    });

    // Start server AFTER DB is ready
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });
