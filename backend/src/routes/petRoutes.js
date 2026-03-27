const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const Pet = require('../models/Pet');
const User = require('../models/User');
const Like = require('../models/Like');
const Match = require('../models/Match');
const Message = require('../models/Message');

const router = express.Router();

router.post('/me', auth, async (req, res) => {
  try {
    const payload = req.body;
    const pet = await Pet.findOneAndUpdate(
      { ownerId: req.userId },
      { ...payload, ownerId: req.userId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    res.status(201).json({ pet: { ...pet, id: pet._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save pet profile', error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const pet = await Pet.findOne({ ownerId: req.userId }).lean();
    if (!pet) return res.json({ pet: null });
    res.json({ pet: { ...pet, id: pet._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load pet profile', error: error.message });
  }
});

router.get('/explore', auth, async (req, res) => {
  try {
    const myPet = await Pet.findOne({ ownerId: req.userId }).lean();
    const query = myPet ? { _id: { $ne: myPet._id } } : {};
    const pets = await Pet.find(query).lean();
    res.json({ pets: pets.map((p) => ({ ...p, id: p._id.toString() })) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load explore pets', error: error.message });
  }
});

router.get('/:petId', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId).lean();
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    res.json({ pet: { ...pet, id: pet._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load pet detail', error: error.message });
  }
});

// SEED DATA: 2 CHÓ, 2 MÈO
router.post('/seed/demo', async (_req, res) => {
  try {
    await Promise.all([Pet.deleteMany({}), User.deleteMany({}), Match.deleteMany({}), Message.deleteMany({})]);

    const passwordHash = await bcrypt.hash('123456', 10);
    const owners = await User.insertMany([
      { email: 'dog1@test.com', passwordHash },
      { email: 'dog2@test.com', passwordHash },
      { email: 'cat1@test.com', passwordHash },
      { email: 'cat2@test.com', passwordHash },
    ]);

    const pets = await Pet.insertMany([
      { ownerId: owners[0]._id, name: 'Lu (Corgi)', age: '2 tuổi', breed: 'Corgi', type: 'Dog', gender: 'Male', location: 'Quận 1', bio: 'Ham chơi.', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b', ownerContact: '091' },
      { ownerId: owners[1]._id, name: 'Ki (Poodle)', age: '1 tuổi', breed: 'Poodle', type: 'Dog', gender: 'Female', location: 'Quận 7', bio: 'Thông minh.', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7', ownerContact: '092' },
      { ownerId: owners[2]._id, name: 'Mimi (Mèo Anh)', age: '3 tuổi', breed: 'Mèo Anh', type: 'Cat', gender: 'Female', location: 'Bình Thạnh', bio: 'Lười biếng.', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba', ownerContact: '093' },
      { ownerId: owners[3]._id, name: 'Mít (Mèo Mướp)', age: '2 tuổi', breed: 'Mèo Mướp', type: 'Cat', gender: 'Male', location: 'Thủ Đức', bio: 'Dễ nuôi.', image: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4', ownerContact: '094' }
    ]);

    // Tạo Match mẫu giữa Lu và Ki
    const pair = [pets[0]._id.toString(), pets[1]._id.toString()].sort();
    const match = await Match.create({ pet1: pair[0], pet2: pair[1], createdAt: Date.now() });
    await Message.create({ matchId: match._id, senderPetId: pets[0]._id, text: 'Gâu gâu!', createdAt: Date.now() });

    res.json({ ok: true, message: 'Đã tạo 2 Chó, 2 Mèo thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Seed failed', error: error.message });
  }
});

module.exports = router;
