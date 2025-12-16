import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Send lead to Telegram
router.post('/', async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ error: "Ism va telefon raqam kiritilishi shart" });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminId = process.env.TELEGRAM_ADMIN_ID;

    if (!botToken || !adminId) {
      console.error('Telegram bot token yoki admin ID topilmadi');
      // Telegram sozlanmagan bo'lsa ham success qaytaramiz
      return res.json({ success: true, message: "Ma'lumot qabul qilindi" });
    }

    const message = `🆕 Yangi foydalanuvchi!\n\n👤 Ism: ${fullName}\n📱 Telefon: ${phone}\n\n📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;

    try {
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: adminId,
        text: message
      });
      console.log('Telegram ga yuborildi:', fullName, phone);
    } catch (telegramError: any) {
      console.error('Telegram xatosi:', telegramError.response?.data || telegramError.message);
      // Telegram xatosi bo'lsa ham foydalanuvchiga success qaytaramiz
    }

    res.json({ success: true, message: "Ma'lumot yuborildi" });
  } catch (error) {
    console.error('Lead yuborishda xatolik:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;
