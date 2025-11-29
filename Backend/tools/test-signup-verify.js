// Test helper: create or update a user, generate OTP (prints it), then verify the OTP.
// Usage: node tools/test-signup-verify.js email "Full Name" phone password

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) require('dotenv').config({ path: envPath });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI missing in environment or Backend/.env');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 4) {
  console.error('Usage: node tools/test-signup-verify.js email "Full Name" phone password');
  process.exit(1);
}

const [email, name, phone, password] = args;

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

  let user = await User.findOne({ email });
  const otp = generateOTP();
  const otpExpiry = Date.now() + 10 * 60 * 1000;

  const hashed = await bcrypt.hash(password, 10);

  if (!user) {
    user = new User({ name, email, phone, password: hashed, otp, otpExpires: otpExpiry, verified: false });
    await user.save();
    console.log('Created user (unverified):', email);
  } else {
    // update existing
    user.name = name;
    user.phone = phone;
    user.password = hashed;
    user.otp = otp;
    user.otpExpires = otpExpiry;
    user.verified = false;
    await user.save();
    console.log('Updated existing user (set new OTP):', email);
  }

  console.log('OTP (for testing):', otp);

  // Simulate verification (for test flow) by marking user verified directly
  user.verified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();
  console.log('User verified successfully (test flow)');

  const final = await User.findOne({ email }).lean();
  console.log('Final user doc (selected fields):', { email: final.email, verified: final.verified, phone: final.phone, createdAt: final.createdAt });

  await mongoose.disconnect();
}

run().catch(err => { console.error('Error:', err && err.message ? err.message : err); process.exit(1); });
