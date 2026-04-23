const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth');

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed });
    res.status(201).json({ message: 'Registered successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/items (protected)
router.post('/items', authMiddleware, async (req, res) => {
  try {
    const { itemName, description, type, location, date, contactInfo } = req.body;
    const item = await Item.create({
      userId: req.userId, itemName, description, type, location, date, contactInfo
    });
    res.status(201).json(item);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/items (protected)
router.get('/items', authMiddleware, async (req, res) => {
  try {
    const items = await Item.find().sort({ date: -1 });
    res.json(items);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/items/search?name=xyz (protected)
router.get('/items/search', authMiddleware, async (req, res) => {
  try {
    const { name } = req.query;
    const items = await Item.find({
      itemName: { $regex: name, $options: 'i' }
    });
    res.json(items);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/items/:id (protected)
router.get('/items/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/items/:id (protected)
router.put('/items/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.userId.toString() !== req.userId)
      return res.status(403).json({ message: 'Not authorized' });

    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/items/:id (protected)
router.delete('/items/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.userId.toString() !== req.userId)
      return res.status(403).json({ message: 'Not authorized' });

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;