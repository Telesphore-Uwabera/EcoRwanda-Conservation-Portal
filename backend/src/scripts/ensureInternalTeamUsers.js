/**
 * One-off: mark internal team accounts as verified and optionally reset password.
 * Matches emails containing: teletech, telesphore, or uwabera (case insensitive).
 *
 * Usage (local or CI with MONGODB_URI set):
 *   npm run fix:internal-users
 *
 * Optional: set SYNC_INTERNAL_PASSWORD in env to reset password (bcrypt on save).
 * If omitted, only sets verified: true.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const TEAM_EMAIL_REGEX = /teletech|telesphore|uwabera/i;

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const users = await User.find({ email: TEAM_EMAIL_REGEX });
  const newPassword = process.env.SYNC_INTERNAL_PASSWORD;

  for (const u of users) {
    u.verified = true;
    if (newPassword) {
      u.password = newPassword;
    }
    await u.save();
    console.log('Updated:', u.email, newPassword ? '(password reset)' : '(verified only)');
  }

  console.log('Matched users:', users.length);
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
