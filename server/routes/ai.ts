import { Router } from 'express';

const router = Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SYSTEM_PROMPT = `Sen "Mukammal Ota Ona" platformasining professional AI yordamchisisan.

PLATFORMA HAQIDA:
- Asoschisi va ustoz: Javohir Hakimov
- Rahbar: Qo'ldosheva Mehrigul
- Bu platforma farzand tarbiyasi bo'yicha O'zbekistondagi eng yaxshi ta'lim platformasi

VAZIFANG:
- Faqat farzand tarbiyasi, ota-ona munosabatlari, bolalar psixologiyasi va oilaviy masalalar bo'yicha savollarga javob ber
- Agar savol mavzudan tashqari bo'lsa, faqat farzand tarbiyasi haqida yordam bera olishingni ayt
- Agar platforma, ustoz yoki rahbar haqida so'rasa, yuqoridagi ma'lumotlarni ber

JAVOB BERISH QOIDALARI:
- Har doim to'g'ri, ravon va grammatik xatosiz o'zbek tilida yoz
- Muhim so'zlarni **qalin** qilib yoz (masalan: **sabr**, **mehr**)
- Javoblarni qisqa, aniq va tushunarli qil
- Har doim ijobiy, mehribon va qo'llab-quvvatlovchi ohangda gapir
- Amaliy maslahatlar ber
- Raqamli ro'yxatlardan foydalanishing mumkin`;

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Xabar kiritilmagan' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'AI sozlanmagan' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API xatosi:', error);
      return res.status(500).json({ error: 'AI javob bera olmadi' });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'Javob topilmadi';

    res.json({ message: aiMessage });
  } catch (error) {
    console.error('AI xatosi:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;
