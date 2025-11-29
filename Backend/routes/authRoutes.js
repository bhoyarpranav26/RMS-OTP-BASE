const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

// ------------------ SIGNUP ------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, number, password } = req.body;
    const finalPhone = phone || number;

    if (!name || !email || !finalPhone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let existingUser = await User.findOne({ email });

    if (existingUser && existingUser.verified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    let user;

    if (existingUser) {
      user = await User.findOneAndUpdate(
        { email },
        { otp, otpExpires: otpExpiry },
        { new: true }
      );
    } else {
      user = new User({
        name,
        email,
        phone: finalPhone,
        password,
        otp,
        otpExpires: otpExpiry,
      });
      await user.save();
    }

    // SEND OTP EMAIL (can be skipped in local tests)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Gmail
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    if (process.env.SKIP_EMAIL === 'true') {
      console.log(`SKIP_EMAIL enabled - OTP for ${email}: ${otp}`);
      // Return OTP in response for local testing/dev only
      return res.status(200).json({ message: "OTP sent (skipped)", otp });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// ------------------ VERIFY OTP ------------------
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.verified) return res.status(400).json({ message: "Already verified" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: "OTP expired" });

    user.verified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "Account verified successfully!" });

  } catch (err) {
    console.error("OTP Verify error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

// ------------------ LOGIN ------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.verified)
      return res.status(400).json({ message: "Please verify your OTP first" });

    if (user.password !== password)
      return res.status(400).json({ message: "Incorrect password" });

    res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
