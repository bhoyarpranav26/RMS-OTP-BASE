// One-off helper: resend OTP to an existing (unverified) user.
// Usage: node tools/resend-otp.js user@example.com

const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const fs = require('fs');

// load .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) require('dotenv').config({ path: envPath });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI missing in environment or Backend/.env');
  process.exit(1);
}

const emailArg = process.argv[2];
if (!emailArg) {
  console.error('Usage: node tools/resend-otp.js user@example.com');
  process.exit(1);
}

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const user = await User.findOne({ email: emailArg });
  if (!user) {
    console.error('User not found:', emailArg);
    await mongoose.disconnect();
    process.exit(2);
  }

  if (user.verified) {
    console.log('User already verified. No OTP sent.');
    await mongoose.disconnect();
    process.exit(0);
  }

  const otp = generateOTP();
  const otpExpiry = Date.now() + 10 * 60 * 1000;
  user.otp = otp;
  user.otpExpires = otpExpiry;
  await user.save();
  console.log('Saved new OTP for user:', emailArg);

  if (process.env.SKIP_EMAIL === 'true' || process.env.SKIP_EMAIL === 'TRUE') {
    console.log('SKIP_EMAIL enabled — OTP:', otp);
    await mongoose.disconnect();
    process.exit(0);
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: emailArg,
      subject: 'Your OTP from KavyaServe (resend)',
      text: `Hello ${user.name || ''},\n\nYour OTP is ${otp}. It expires in 10 minutes.\n\nIf you didn't request this, ignore this mail.`,
    });
    console.log('Email sent:', info && info.messageId ? info.messageId : info);
  } catch (err) {
    console.error('Failed to send email:', err && err.message ? err.message : err);
    console.error(err && err.stack ? err.stack : '');
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
});
