const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// CORS SETUP
// ==========================
// Support a comma-separated list of allowed origins via CORS_ORIGINS or the older CORS_ORIGIN env var.
const corsEnv = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "";
const allowedOrigins = corsEnv.split(",").map((s) => s.trim()).filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error("CORS not allowed by server"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ==========================
// MongoDB Connection
// ==========================
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("❌ ERROR: MONGO_URI is missing in Render Environment");
} else {
  // The modern MongoDB Node driver no longer needs useNewUrlParser/useUnifiedTopology options.
  mongoose
    .connect(mongoUri)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));
}

// ==========================
// Import Routes
// ==========================
console.log("📌 Importing Auth Routes...");
const authRoutes = require("./routes/authRoutes");

console.log("📌 Mounting /api/auth Routes...");
app.use("/api/auth", authRoutes);

// ==========================
// Test Route
// ==========================
app.get("/", (req, res) => {
  res.send("🚀 Backend is running on Render!");
});

// Simple health endpoint to check DB connectivity
app.get("/health", (req, res) => {
  const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
  res.json({ ok: state === 1, state });
});

// ==========================
// Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
