require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const email = (process.env.DEFAULT_ADMIN_EMAIL || 'info.teletech.rw@gmail.com').toLowerCase();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'ADMIN123';

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const existing = await User.findOne({ email });
  if (existing) {
    let changed = false;
    if (existing.role !== 'administrator') {
      existing.role = 'administrator';
      changed = true;
    }
    if (!existing.verified) {
      existing.verified = true;
      changed = true;
    }

    if (changed) {
      await existing.save();
      console.log(`Updated existing user to administrator: ${email}`);
    } else {
      console.log(`Administrator already exists: ${email}`);
    }
    return;
  }

  const admin = new User({
    email,
    password,
    firstName: 'Admin',
    lastName: 'User',
    role: 'administrator',
    verified: true,
  });

  await admin.save();
  console.log(`Created administrator: ${email}`);
}

main()
  .catch((err) => {
    console.error('Failed to create administrator:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });