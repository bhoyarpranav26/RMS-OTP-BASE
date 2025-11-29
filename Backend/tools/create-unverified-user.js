// Create or update an unverified user and print the OTP (for testing when email sending fails)
// Usage: node tools/create-unverified-user.js email "Full Name" phone password

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) require('dotenv').config({ path: envPath });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI missing');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 4) {
  console.error('Usage: node tools/create-unverified-user.js email "Full Name" phone password');
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

  const otp = generateOTP();
  const otpExpiry = Date.now() + 10 * 60 * 1000;
  const hashed = await bcrypt.hash(password, 10);

  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ name, email, phone, password: hashed, otp, otpExpires: otpExpiry, verified: false });
    await user.save();
    console.log('Created unverified user:', email);
  } else {
    user.name = name;
    user.phone = phone;
    user.password = hashed;
    user.otp = otp;
    user.otpExpires = otpExpiry;
    user.verified = false;
    await user.save();
    console.log('Updated user with new OTP:', email);
  }

  console.log('OTP (copy this to verify):', otp);

  await mongoose.disconnect();
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
