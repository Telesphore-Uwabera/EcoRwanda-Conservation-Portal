/**
 * One-off: mark listed team accounts as verified and optionally reset password.
 * Emails match User Management (EcoRwanda portal).
 *
 * Usage (from backend/, with MONGODB_URI in .env):
 *   npm run fix:internal-users
 *
 * Optional: SYNC_INTERNAL_PASSWORD — if set, resets password (hashed on save).
 * If omitted, only sets verified: true.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Exact emails from admin User Management (stored lowercase in DB)
const TEAM_EMAILS = [
  'telesphore91073@gmail.com',
  'uwaberatelesphore@gmail.com',
  't.uwabera@alustudent.com',
  'info.teletech.rw@gmail.com',
];

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const users = await User.find({ email: { $in: TEAM_EMAILS } });
  const newPassword = process.env.SYNC_INTERNAL_PASSWORD;

  const found = new Set(users.map((u) => u.email));
  for (const email of TEAM_EMAILS) {
    if (!found.has(email)) {
      console.warn('No user in DB for:', email);
    }
  }

  for (const u of users) {
    u.verified = true;
    if (newPassword) {
      u.password = newPassword;
    }
    await u.save();
    console.log('Updated:', u.email, newPassword ? '(password reset)' : '(verified only)');
  }

  console.log('Matched users:', users.length, '/', TEAM_EMAILS.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });
