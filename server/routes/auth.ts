import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db';
import { JWT_SECRET, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, phone, password } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });
    }

    // Bo'shliqlarni olib tashlash
    const cleanPhone = phone.replace(/\s/g, '');
    
    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({ error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // 7 kunlik bepul sinov muddati
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    
    const user = await User.create({
      fullName,
      phone: cleanPhone,
      password: hashedPassword,
      subscriptionEnd: trialEndDate,
      usedFreeTrial: true
    });

    const token = jwt.sign(
      { id: user._id, phone, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, fullName, phone, role: 'user' }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Telefon va parolni kiriting" });
    }

    // Bo'shliqlarni olib tashlash
    const cleanPhone = phone.replace(/\s/g, '');
    const user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      return res.status(400).json({ error: 'Foydalanuvchi topilmadi' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Parol noto'g'ri" });
    }

    const token = jwt.sign(
      { id: user._id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, phone: user.phone, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }
    res.json({ id: user._id, fullName: user.fullName, phone: user.phone, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;
