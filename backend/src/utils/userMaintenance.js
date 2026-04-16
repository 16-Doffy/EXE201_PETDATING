const bcrypt = require('bcryptjs');
const User = require('../models/User');

const normalizeEmail = (value = '') => value.toLowerCase().trim();

const buildUsername = (email = '', fallback = 'user') => {
  const base =
    normalizeEmail(email)
      .replace(/@.*/, '')
      .replace(/[^a-z0-9._-]/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 24) || fallback;

  return `${base}_${Date.now().toString(36).slice(-4)}`;
};

const repairUserCollection = async () => {
  const indexes = await User.collection.indexes();
  const legacyUsernameIndex = indexes.find((index) => index.name === 'username_1');

  if (legacyUsernameIndex) {
    await User.collection.dropIndex('username_1');
  }

  const users = await User.find({
    $or: [{ username: { $exists: false } }, { username: null }, { username: '' }],
  });

  for (const user of users) {
    user.username = buildUsername(user.email, `user_${user._id.toString().slice(-6)}`);
    await user.save();
  }
};

const ensureAdminAccount = async () => {
  const adminEmail = normalizeEmail(process.env.DEFAULT_ADMIN_EMAIL || 'admin@petdating.app');
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

  let user = await User.findOne({ email: adminEmail });
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  if (!user) {
    user = await User.create({
      email: adminEmail,
      username: buildUsername(adminEmail, 'admin'),
      passwordHash,
      role: 'admin',
    });

    return user;
  }

  let changed = false;

  if (user.role !== 'admin') {
    user.role = 'admin';
    changed = true;
  }

  if (!user.username) {
    user.username = buildUsername(adminEmail, 'admin');
    changed = true;
  }

  const passwordMatches = await bcrypt.compare(adminPassword, user.passwordHash);
  if (!passwordMatches) {
    user.passwordHash = passwordHash;
    changed = true;
  }

  if (changed) {
    await user.save();
  }

  return user;
};

module.exports = {
  ensureAdminAccount,
  repairUserCollection,
};
