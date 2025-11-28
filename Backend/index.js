const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(bodyParser.json());

// ==========================
// ✅ MongoDB Connection
// ==========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));


// ==========================
// ✅ Routes Import
// ==========================
console.log("📌 Loading auth routes...");
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);
console.log("📌 Auth routes mounted at /api/auth");

// Root test
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// ==========================
// Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
