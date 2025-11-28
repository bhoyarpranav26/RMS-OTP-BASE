const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// CORS SETUP
// ==========================
const allowedOrigin = process.env.CORS_ORIGIN || "https://restom-frontend.onrender.com";

app.use(
  cors({
    origin: allowedOrigin,
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
  mongoose
    .connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
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

// ==========================
// Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
