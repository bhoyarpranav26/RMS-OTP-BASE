// One-off helper: create a user directly in MongoDB (hashes password, marks verified=true)
// Usage: node tools/create-user.js email name phone password

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// load .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) require('dotenv').config({ path: envPath });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI missing in environment or Backend/.env');
  process.exit(1);
}

const [,, emailArg, ...rest] = process.argv;
if (!emailArg || rest.length < 2) {
  console.error('Usage: node tools/create-user.js email "Full Name" phone password');
  process.exit(1);
}

const nameArg = rest[0];
const phoneArg = rest[1];
const passwordArg = rest[2];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

  const existing = await User.findOne({ email: emailArg });
  if (existing) {
    console.log('User already exists:', emailArg);
    await mongoose.disconnect();
    process.exit(0);
  }

  const hashed = await bcrypt.hash(passwordArg, 10);
  const now = new Date();
  const doc = {
    name: nameArg,
    email: emailArg,
    phone: phoneArg,
    password: hashed,
    verified: true,
    otp: null,
    otpExpires: null,
    createdAt: now,
    updatedAt: now,
  };

  const created = await User.create(doc);
  console.log('Created user:', created.email, 'id:', created._id);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error creating user:', err && err.message ? err.message : err);
  process.exit(1);
});
