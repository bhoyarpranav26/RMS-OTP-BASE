// Simple smoke test: POST /api/auth/signup and verify the user exists in MongoDB
// Usage: node tools/smoke-test.js
// It will load ../.env by default. Set SMOKE_BASE_URL to target a deployed backend.

const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const mongoose = require('mongoose');

// load env from repo .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const BASE = process.env.SMOKE_BASE_URL || process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
const MONGO_URI = process.env.MONGO_URI;

const email = process.env.SMOKE_EMAIL || `smoke+${Date.now()}@example.com`;
const name = process.env.SMOKE_NAME || 'SmokeTester';
const phone = process.env.SMOKE_PHONE || '9999999999';
const password = process.env.SMOKE_PASSWORD || 'SmokePass123!';

function postJSON(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const body = JSON.stringify(data);
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + (url.search || ''),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
}

async function run() {
  console.log('Base URL:', BASE);
  console.log('Using email:', email);

  try {
    console.log('\n1) Hitting signup endpoint...');
    const signupUrl = new URL('/api/auth/signup', BASE).toString();
    const res = await postJSON(signupUrl, { name, email, phone, password });
    console.log('Signup response status:', res.status);
    console.log('Signup response body:', res.body);

    if (!MONGO_URI) {
      console.warn('\nNo MONGO_URI provided in env; cannot verify DB. Set MONGO_URI in .env or environment. Exiting.');
      return;
    }

    console.log('\n2) Waiting 2s then connecting to MongoDB to verify record...');
    await new Promise((r) => setTimeout(r, 2000));

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for verification');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    const doc = await User.findOne({ email }).lean();
    if (!doc) {
      console.error('User not found in DB for email:', email);
    } else {
      console.log('User found in DB:');
      // hide password partially
      if (doc.password && typeof doc.password === 'string') {
        console.log('  password (prefix):', doc.password.slice(0, 10));
      }
      console.log(JSON.stringify({ email: doc.email, verified: doc.verified, otp: doc.otp ? '[present]' : '[none]', createdAt: doc.createdAt }, null, 2));
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Smoke test error:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exitCode = 2;
  }
}

run();
