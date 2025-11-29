// One-off helper: set verified=false for a user by email
// Usage: node tools/unverify-user.js user@example.com

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) require('dotenv').config({ path: envPath });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI missing in environment or Backend/.env');
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node tools/unverify-user.js user@example.com');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

  const user = await User.findOne({ email });
  if (!user) {
    console.error('User not found:', email);
    await mongoose.disconnect();
    process.exit(2);
  }

  user.verified = false;
  // clear previous otp so resend will generate a fresh one
  user.otp = null;
  user.otpExpires = null;
  await user.save();
  console.log('User unverified:', email);

  await mongoose.disconnect();
}

run().catch(err => { console.error('Error:', err && err.message ? err.message : err); process.exit(1); });
