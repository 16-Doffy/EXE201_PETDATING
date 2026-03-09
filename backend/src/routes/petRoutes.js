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
    if (!myPet) return res.json({ pets: [] });

    const pets = await Pet.find({ _id: { $ne: myPet._id } }).lean();
    res.json({ pets: pets.map((pet) => ({ ...pet, id: pet._id.toString() })) });
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

router.post('/seed/demo', async (_req, res) => {
  try {
    const existing = await User.findOne({ email: 'demo-owner@bossitive.app' });
    if (existing) {
      return res.json({ ok: true, seeded: false, message: 'Demo data already exists' });
    }

    const passwordHash = await bcrypt.hash('123456', 10);
    const owners = await User.insertMany([
      { email: 'demo-owner@bossitive.app', passwordHash },
      { email: 'demo-owner2@bossitive.app', passwordHash },
      { email: 'demo-owner3@bossitive.app', passwordHash },
      { email: 'demo-owner4@bossitive.app', passwordHash },
    ]);

    const demoPets = [
      {
        ownerId: owners[0]._id,
        name: 'Boss',
        age: '3',
        breed: 'Corgi',
        gender: 'Male',
        location: 'HCM',
        bio: 'Thân thiện, thích chạy bộ và chơi bóng.',
        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1000',
        ownerContact: '0900000001',
      },
      {
        ownerId: owners[1]._id,
        name: 'Milo',
        age: '2',
        breed: 'Shiba',
        gender: 'Male',
        location: 'HCM',
        bio: 'Năng động, thích đi dạo công viên.',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=1000',
        ownerContact: '0900000002',
      },
      {
        ownerId: owners[2]._id,
        name: 'Luna',
        age: '1',
        breed: 'Poodle',
        gender: 'Female',
        location: 'HCM',
        bio: 'Hiền lành, thích ôm và ngủ nướng.',
        image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1000',
        ownerContact: '0900000003',
      },
      {
        ownerId: owners[3]._id,
        name: 'Nabi',
        age: '4',
        breed: 'Mèo Anh lông ngắn',
        gender: 'Female',
        location: 'HCM',
        bio: 'Thông minh, khá hướng nội nhưng rất dễ thương.',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1000',
        ownerContact: '0900000004',
      },
    ];

    const pets = await Pet.insertMany(demoPets);

    if (pets.length >= 2) {
      await Like.create({ fromPetId: pets[0]._id, toPetId: pets[1]._id });
      await Like.create({ fromPetId: pets[1]._id, toPetId: pets[0]._id });
      const pair = [pets[0]._id.toString(), pets[1]._id.toString()].sort();
      const match = await Match.create({ pet1: pair[0], pet2: pair[1] });
      await Message.create({ matchId: match._id, senderPetId: pets[0]._id, text: 'Chào bạn, đi chơi công viên không?' });
      await Message.create({ matchId: match._id, senderPetId: pets[1]._id, text: 'Oke luôn, cuối tuần này nha!' });
    }

    res.status(201).json({ ok: true, seeded: true, count: pets.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to seed demo data', error: error.message });
  }
});

module.exports = router;
