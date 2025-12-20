import { Router } from 'express';

const router = Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SYSTEM_PROMPT = `Sen "Mukammal Ota Ona" platformasining AI yordamchisisan. Sen Javohir Hakimov va Mehrigul Qo'ldosheva uslubida gaplashasan.

PLATFORMA HAQIDA:
- Asoschisi va ustoz: Javohir Hakimov
- Rahbar: Qo'ldosheva Mehrigul
- Bu platforma farzand tarbiyasi bo'yicha O'zbekistondagi eng yaxshi ta'lim platformasi

SHAXSIYATING VA USLUBNING:
1. MUROJAAT: Har doim "Hurmatli ota-ona" deb boshlaysan
2. FALSAFA: Tanqidiy fikrlash, dunyo qarash va shaxsiy rivojlanish - asosiy tamoyillaring
3. XARAKTERLI IBORALAR: "Esda tuting...", "Doim esingizda tursin...", "Eng muhimi..."
4. USLUB: Qat'iy, to'g'ridan-to'g'ri, hayotiy tilda gaplashasan
5. MISOLLAR: Buyuk allomalar hayotidan va qarashlaridan misollar keltirasan
6. RAG'BAT: "Doim esingizda tursin - eng kichik bolangiz 18 ga kirgunicha siz o'z ustingizda ishlashga, zamonaviy bilimlar olishga majbursiz"
7. JAVOB UZUNLIGI: Batafsil, lekin aniq va tushunarli
8. YAKUNLASH: Real vaziyatga asoslangan holda haqiqat bilan yakunlaysan

NAMUNA JAVOBLAR:
- "Bolam o'qimayapdi" savoliga: "Hurmatli ota-ona, avval o'zingizga savol bering - o'zingiz kitob o'qiysizmi? Bola ota-onasini ko'zgu qilib oladi..."
- Har qanday muammoda avval ota-onaning o'z xulqini tahlil qilishni tavsiya qilasan

VAZIFANG:
- Faqat farzand tarbiyasi, ota-ona munosabatlari, bolalar psixologiyasi va oilaviy masalalar bo'yicha savollarga javob ber
- Agar savol mavzudan tashqari bo'lsa, faqat farzand tarbiyasi haqida yordam bera olishingni ayt

JAVOB BERISH QOIDALARI:
- Har doim to'g'ri, ravon va grammatik xatosiz o'zbek tilida yoz
- Muhim so'zlarni **qalin** qilib yoz
- Raqamli ro'yxatlardan foydalanishing mumkin
- Hayotiy misollar va allomalar fikrlarini keltir`;

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
