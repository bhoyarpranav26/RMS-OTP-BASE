// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Prefer SendGrid Web API when SENDGRID_API_KEY is present — more reliable from PaaS providers
let sgMail = null;
try {
  if (process.env.SENDGRID_API_KEY) {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
} catch (e) {
  console.warn('SendGrid library not available or failed to initialize:', e && e.message);
  sgMail = null;
}

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Create a transporter depending on available environment variables.
function createTransporter() {
  // Use SendGrid SMTP when SENDGRID_API_KEY is provided (recommended for production)
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  // Fall back to Gmail SMTP (requires an App Password when 2FA is enabled)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  // No configured mailer
  return null;
}

// SIGNUP: save user (unverified) and send OTP by email
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check existing
    let existing = await User.findOne({ email });
    if (existing && existing.verified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    let user;
    if (existing) {
      user = await User.findOneAndUpdate({ email }, {
        name, phone, password: hashed, otp, otpExpires: otpExpiry, verified: false
      }, { new: true });
    } else {
      user = new User({ name, email, phone, password: hashed, otp, otpExpires: otpExpiry });
      await user.save();
    }

    // Optionally skip sending email in test/dev environments
    if (process.env.SKIP_EMAIL === 'true') {
      console.log(`SKIP_EMAIL enabled - OTP for ${email}: ${otp}`);
      return res.status(200).json({ message: "OTP generated (skipped email)", otp });
    }

    const fromAddr = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'no-reply@example.com';
    const subject = 'Your OTP from KavyaServe';
    const text = `Hello ${name},\n\nYour OTP is ${otp}. It expires in 10 minutes.\n\nIf you didn't request this, ignore this mail.`;

    // If SendGrid Web API is available, use it (HTTPS) rather than SMTP — more reliable on PaaS
    if (process.env.SENDGRID_API_KEY && sgMail) {
      try {
        const msg = { to: email, from: fromAddr, subject, text };
        let lastErr = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const resp = await sgMail.send(msg);
            console.log('SendGrid send response:', resp && resp[0] && resp[0].statusCode);
            return res.status(200).json({ message: 'OTP sent to email' });
          } catch (e) {
            lastErr = e;
            console.warn(`SendGrid send attempt ${attempt} failed:`, e && e.message ? e.message : e);
            if (attempt < 2) await new Promise((r) => setTimeout(r, 500));
          }
        }
        console.error('SendGrid failed after retries:', lastErr && lastErr.stack ? lastErr.stack : lastErr);
        // fallthrough to SMTP fallback if configured
      } catch (sgErr) {
        console.error('SendGrid fatal error:', sgErr && sgErr.stack ? sgErr.stack : sgErr);
      }
    }

    // Fallback to SMTP transporter (Gmail or SendGrid SMTP)
    const transporter = createTransporter();
    if (!transporter) {
      console.error('No mail transporter configured. Set SENDGRID_API_KEY or EMAIL_USER/EMAIL_PASS');
      return res.status(500).json({ message: 'Signup failed (no-mailer-config)' });
    }

    const mailOptions = { from: fromAddr, to: email, subject, text };
    try {
      try { await transporter.verify(); } catch (vErr) { console.warn('Transporter verify warning:', vErr && vErr.message); }
      let lastErr = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const info = await transporter.sendMail(mailOptions);
          console.log('Email sent (SMTP):', info && info.messageId ? info.messageId : info);
          return res.status(200).json({ message: 'OTP sent to email' });
        } catch (e) {
          lastErr = e;
          console.warn(`SMTP send attempt ${attempt} failed:`, e && e.message ? e.message : e);
          if (attempt < 2) await new Promise((r) => setTimeout(r, 500));
        }
      }
      console.error('Failed to send email after retries (SMTP):', lastErr && lastErr.stack ? lastErr.stack : lastErr);
      return res.status(500).json({ message: 'Signup failed (email)', error: lastErr && lastErr.message });
    } catch (mailErr) {
      console.error('Mail send error (fatal):', mailErr);
      return res.status(500).json({ message: 'Signup failed (email)', error: mailErr.message });
    }
  } catch (err) {
    console.error("Signup error:", err);
    // handle validation error (like phone required)
    return res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.verified) return res.status(400).json({ message: "User already verified" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: "OTP expired" });

    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Account verified successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.verified) return res.status(403).json({ message: "Email not verified" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

// PROFILE (protected) - small helper for route usage
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId; // from middleware
    const user = await User.findById(userId).select("-password -otp -otpExpires");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("GetProfile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
