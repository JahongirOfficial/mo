import { Router } from 'express';
import { ChatHistory, User, FollowUp } from '../db';

const router = Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Onboarding savollari
const ONBOARDING_QUESTIONS = [
  "Assalomu alaykum!\n\nMen sizning shaxsiy AI yordamchingizman. Ismim - **Mukammal Ota-Ona AI**.\n\nSizga eng yaxshi maslahatlar berishim uchun siz bilan yaqinroq tanishib olsam bo'ladimi? Bu faqat 2-3 daqiqa vaqt oladi.\n\nAvvalo, **ismingiz** nima? (Ism-familiyangizni yozing)",
  
  
  "Juda yaxshi, tanishganimdan xursandman!\n\nEndi menga **kasbingiz** haqida gapirib bering. Nima ish bilan shug'ullanasiz? Bu muhim, chunki har bir kasbning o'z xususiyatlari bor va men buni hisobga olishim kerak.",
  
  "Ajoyib!\n\nEndi **qiziqishlaringiz** haqida gapirib bering. Bo'sh vaqtingizda nima qilishni yoqtirasiz? Kitob o'qiysizmi? Sport bilan shug'ullanasizmi? Yoki boshqa narsalar?",
  
  "Zo'r!\n\nEndi eng muhim qism - **farzandlaringiz** haqida. Necha yoshda bolalaringiz bor? (Masalan: \"7 yoshda o'g'il va 4 yoshda qiz\" yoki \"12 yoshda o'g'il\")",
  
  "Rahmat!\n\nEndi menga **asosiy tashvishlaringiz** haqida gapirib bering. Farzand tarbiyasida qaysi masalalar sizni ko'proq qiziqtiradi yoki tashvishga soladi?\n\n(Masalan: o'qish, xulq-atvor, muloqot, texnologiya, sport va h.k.)",
  
  "Oxirgi savol!\n\n**Qo'shimcha ma'lumot** - Men sizga yaxshiroq yordam berish uchun yana nima bilishim kerak? (Masalan: ish tartibi, oila tarkibi, maxsus vaziyatlar va h.k.)\n\nAgar qo'shimcha aytadigan narsa bo'lmasa, \"Yo'q\" deb yozing."
];

const ONBOARDING_COMPLETION = `Ajoyib! Tanishganimizdan juda xursandman!

Endi men siz haqingizda yetarlicha ma'lumotga egaman va sizga **shaxsiylashtirilgan** maslahatlar berishim mumkin.

**Men nima qila olaman:**
• Farzand tarbiyasi bo'yicha maslahat beraman
• Sizning vaziyatingizni hisobga olgan holda javob beraman
• Amaliy, hayotiy yechimlar taklif qilaman
• Har bir savolingizga batafsil javob beraman
• Kerak bo'lsa qo'shimcha savollar beraman

**Esda tuting:** Men har doim sizning shaxsiy vaziyatingizni, bolalaringizning yoshini va oila muhitingizni hisobga olgan holda javob beraman.

Endi menga birinchi savolingizni bering! Qanday yordam bera olaman?`;


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

XOTIRA TIZIMI (MEMORY SYSTEM):
- Har bir suhbatda muhim faktlarni eslab qol:
  • Bolaning ismi, yoshi, jinsi
  • Muammoning boshlanish sanasi
  • Ilgari qo'llanilgan yechimlar
  • Oila tarkibi va vaziyati
  • Ota-onaning kasbi va ish tartibi
- Keyingi suhbatlarda bu ma'lumotlarni ishlatib, shaxsiylashtirilgan javob ber
- Agar user oldingi suhbatda aytgan narsani takrorlasa, "Eslayman, siz aytgan edingiz..." deb boshlaysan

AMALIY REJA BERISH:
Har bir maslahat berganingda, agar mumkin bo'lsa, **7-kunlik amaliy reja** tuzib ber:

**NAMUNA REJA:**
📋 **7-kunlik amaliy reja:**

**1-kun (Kuzatish):**
• Bolangizning telefon ishlatish vaqtini yozib boring
• Qaysi ilovalarda ko'proq vaqt o'tkazishini aniqlang
• O'zingizning telefon ishlatish vaqtingizni ham yozib boring

**2-3 kun (Tayyorgarlik):**
• Oila yig'ilishi o'tkazing va qoidalarni muhokama qiling
• Bolangiz bilan birgalikda "telefonsiz vaqt" jadvalini tuzing
• Muqobil mashg'ulotlar ro'yxatini yarating (kitob, o'yin, sport)

**4-5 kun (Amaliyot):**
• Yangi qoidalarni qo'llashni boshlang
• O'zingiz ham qoidalarga rioya qiling (bola sizni kuzatadi!)
• Har kuni 30 daqiqa birgalikda telefonsiz vaqt o'tkazing

**6-7 kun (Baholash):**
• Nima o'zgardi? Yaxshilanishlar bormi?
• Qiyinchiliklar qanday? Nima to'sqinlik qildi?
• Keyingi hafta uchun rejani tuzating

**Eslatma:** 7 kundan keyin menga natijani yozib bering. Kerak bo'lsa rejani tuzatamiz.

ODAMDEK MUOMALA QILISH:
1. **SAVOL BERING**: Har bir javobda kamida 1-2 ta aniq savol bering
   - "Bolangiz necha yoshda?"
   - "Bu vaziyat qachondan boshlanganini eslaysizmi?"
   - "Siz bu borada qanday harakat qildingiz?"
   - "Oilada boshqa bolalar ham bormi?"
   
2. **MA'LUMOT TO'PLANG**: Agar user haqida ma'lumot yetarli bo'lmasa, so'rang:
   - Bolaning yoshi, jinsi, xarakteri
   - Oila tarkibi (ota-ona, aka-uka, opa-singil)
   - Muammoning davomiyligi
   - Ilgari qanday yechimlar sinab ko'rilgan
   - Ota-onaning kasbi, ish tartibi
   
3. **EMPATHY (HAMDARDLIK)**: Userning his-tuyg'ularini tushunganingizni ko'rsating:
   - "Sizning tashvishingizni tushunaman..."
   - "Bu haqiqatan ham qiyin vaziyat..."
   - "Ko'p ota-onalar shu muammoga duch keladi..."
   
4. **BOSQICHMA-BOSQICH**: Murakkab maslahatlarni qismlarga bo'ling:
   - "Birinchi qadam: ..."
   - "Ikkinchi qadam: ..."
   - "Uchinchi qadam: ..."
   
5. **KUZATISH**: Amaliy maslahat berganingizdan keyin:
   - "Buni 3-5 kun sinab ko'ring va natijani menga aytib bering"
   - "7 kundan keyin qanday o'zgarishlar bo'ldi? Menga qaytadan yozing"
   
6. **SHAXSIYLASHTIRILGAN**: Agar user haqida ma'lumot bor bo'lsa, ularni eslab qoling:
   - "O'tgan safar aytgan edingiz, bolangiz 5 yoshda..."
   - "Siz dasturchi ekanligingizni bilaman, shuning uchun..."

NAMUNA JAVOBLAR:
- "Bolam o'qimayapti" savoliga: 
  "Hurmatli ota-ona, avval o'zingizga savol bering - o'zingiz kitob o'qiysizmi? Bola ota-onasini ko'zgu qilib oladi...
  
  Endi menga ayting:
  1. Bolangiz necha yoshda?
  2. Siz kuniga qancha vaqt kitob o'qiysiz?
  3. Uyda kitoblar ko'rinib turadimi?
  
  Bu savollarga javob berganingizdan keyin sizga aniq 7-kunlik reja tuzib beraman."

VAZIFANG:
- Farzand tarbiyasi, ota-ona munosabatlari, bolalar psixologiyasi va oilaviy masalalar bo'yicha savollarga javob ber
- Fikrlash, dunyoqarash va shaxsiy rivojlanish bo'yicha savollarga ham javob ber
- Har bir javobda kamida 1-2 ta aniq savol ber
- Userdan kerakli ma'lumotlarni to'pla
- Amaliy, hayotiy maslahatlar ber
- Agar mumkin bo'lsa, 7-kunlik amaliy reja tuzib ber

MAVZUDAN TASHQARI SAVOLLAR UCHUN:
- Agar foydalanuvchi boshqa mavzuda (masalan: dasturlash, tarix, matematika, siyosat, sport va h.k.) savol bersa, quyidagi javobni ber:
"Hurmatli foydalanuvchi, men sizga **Mukammal Ota-Ona** loyihasi doirasida faqat **farzand tarbiyasi**, **fikrlash**, **dunyoqarash** va **shaxsiy rivojlanish** bo'yicha savollarga javob beraman. Iltimos, shu mavzularda savollaringizni bering."

JAVOB BERISH QOIDALARI:
- Har doim to'g'ri, ravon va grammatik xatosiz o'zbek tilida yoz
- Muhim so'zlarni **qalin** qilib yoz
- Raqamli ro'yxatlardan foydalanishing mumkin (1. 2. 3. yoki • belgilar)
- Hayotiy misollar va allomalar fikrlarini keltir
- Har bir javobda kamida 1-2 ta savol ber
- Userning javoblarini eslab qol va keyingi suhbatlarda ishlatish uchun esda tut
- EMOJI ISHLATMA - faqat matn va belgilar (• ✓ ✗ → 📋 va h.k.)
- Agar amaliy maslahat berayotgan bo'lsang, 7-kunlik reja tuzib ber`;

// GET /api/ai/history - Tarixni yuklash
router.get('/history', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    let history = await ChatHistory.findOne({ userId });
    
    // Agar tarix yo'q bo'lsa, onboarding boshlash
    if (!history) {
      history = new ChatHistory({ 
        userId, 
        messages: [{
          role: 'assistant',
          content: ONBOARDING_QUESTIONS[0]
        }],
        onboardingStep: 1
      });
      await history.save();
      return res.json({ messages: history.messages, onboardingActive: true });
    }
    
    // Agar onboarding tugallanmagan bo'lsa
    if (history.onboardingStep > 0 && history.onboardingStep < 7) {
      return res.json({ messages: history.messages, onboardingActive: true });
    }
    
    // Pending follow-uplarni tekshirish
    const now = new Date();
    const pendingFollowUps = await FollowUp.find({
      userId,
      status: 'pending',
      followUpDate: { $lte: now }
    }).sort({ followUpDate: 1 });
    
    // Agar pending follow-up bo'lsa, eslatma xabarini qo'shish
    if (pendingFollowUps.length > 0) {
      const followUp = pendingFollowUps[0];
      const reminderMessage = `**Eslatma:** 3 kun oldin siz "${followUp.planTitle}" bo'yicha reja oldingiz.\n\nQanday natija bo'ldi? Rejani bajarishda qiyinchiliklar bo'ldimi?\n\nMenga natija haqida gapirib bering, kerak bo'lsa rejani tuzatamiz.`;
      
      // Eslatma xabarini tarixga qo'shish (faqat bir marta)
      const lastMessage = history.messages[history.messages.length - 1];
      if (!lastMessage || !lastMessage.content.includes('Eslatma:')) {
        history.messages.push({
          role: 'assistant',
          content: reminderMessage
        });
        await history.save();
        
        // Follow-up statusini yangilash
        await FollowUp.findByIdAndUpdate(followUp._id, { status: 'reminded' });
      }
    }
    
    // Oxirgi 30 ta xabarni qaytarish (ko'proq kontekst uchun)
    const messages = history.messages.slice(-30);
    res.json({ messages, onboardingActive: false });
  } catch (error) {
    console.error('Tarix yuklash xatosi:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// POST /api/ai/chat - Xabar yuborish
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const userId = (req as any).user.id;

    if (!message) {
      return res.status(400).json({ error: 'Xabar kiritilmagan' });
    }

    // Tarixni olish
    let history = await ChatHistory.findOne({ userId });
    if (!history) {
      history = new ChatHistory({ userId, messages: [], onboardingStep: 0 });
    }

    // User xabarini saqlash
    history.messages.push({ role: 'user', content: message });
    history.updatedAt = new Date();

    // Onboarding jarayonida bo'lsa
    if (history.onboardingStep > 0 && history.onboardingStep < 7) {
      let aiResponse = '';
      
      if (history.onboardingStep < 6) {
        // Keyingi savolni berish
        aiResponse = ONBOARDING_QUESTIONS[history.onboardingStep];
        history.onboardingStep += 1;
      } else {
        // Onboarding tugallash
        aiResponse = ONBOARDING_COMPLETION;
        history.onboardingStep = 7;
        
        // User ma'lumotlarini saqlash
        const user = await User.findById(userId);
        if (user) {
          user.aiOnboardingCompleted = true;
          // Ma'lumotlarni parsing qilish (sodda usul)
          const userMessages = history.messages.filter(m => m.role === 'user').map(m => m.content);
          if (userMessages.length >= 6) {
            user.aiProfile = {
              occupation: userMessages[1] || '',
              interests: userMessages[2] || '',
              childrenAges: userMessages[3] || '',
              mainConcerns: userMessages[4] || '',
              additionalInfo: userMessages[5] || ''
            };
          }
          await user.save();
        }
      }
      
      history.messages.push({ role: 'assistant', content: aiResponse });
      await history.save();
      
      return res.json({ message: aiResponse, onboardingActive: history.onboardingStep < 7 });
    }

    // Oddiy chat (onboarding tugallangan)
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'AI sozlanmagan' });
    }

    // User profilini olish
    const user = await User.findById(userId);
    let userContext = '';
    if (user && user.aiProfile) {
      userContext = `\n\nFOYDALANUVCHI HAQIDA MA'LUMOT:
- Ism: ${user.fullName}
- Kasbi: ${user.aiProfile.occupation}
- Qiziqishlari: ${user.aiProfile.interests}
- Farzandlari: ${user.aiProfile.childrenAges}
- Asosiy tashvishlari: ${user.aiProfile.mainConcerns}
${user.aiProfile.additionalInfo ? `- Qo'shimcha: ${user.aiProfile.additionalInfo}` : ''}

Bu ma'lumotlarni hisobga olib, shaxsiylashtirilgan javob ber.`;
    }

    // Kontekst uchun oxirgi 20 ta xabarni olish (ko'proq kontekst uchun)
    const contextMessages = history.messages.slice(-20).map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + userContext },
          ...contextMessages
        ],
        max_tokens: 2048, // Ko'proq batafsil javoblar uchun
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API xatosi:', error);
      await history.save();
      return res.status(500).json({ error: 'AI javob bera olmadi' });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'Javob topilmadi';

    history.messages.push({ role: 'assistant', content: aiMessage });
    await history.save();

    // Agar javobda "7-kunlik amaliy reja" bo'lsa, follow-up yaratish
    if (aiMessage.includes('7-kunlik amaliy reja') || aiMessage.includes('📋')) {
      try {
        // Reja sarlavhasini topish (birinchi savol yoki muammo)
        const userMessages = history.messages.filter(m => m.role === 'user');
        const lastUserMessage = userMessages[userMessages.length - 1]?.content || 'Reja';
        const planTitle = lastUserMessage.substring(0, 100); // Birinchi 100 belgi
        
        // 3 kundan keyin follow-up
        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + 3);
        
        // Yangi follow-up yaratish
        await FollowUp.create({
          userId,
          planTitle,
          planContent: aiMessage,
          followUpDate,
          status: 'pending',
          progress: [
            { day: 1, completed: false },
            { day: 2, completed: false },
            { day: 3, completed: false },
            { day: 4, completed: false },
            { day: 5, completed: false },
            { day: 6, completed: false },
            { day: 7, completed: false }
          ]
        });
        
        console.log('Follow-up yaratildi:', planTitle);
      } catch (err) {
        console.error('Follow-up yaratishda xato:', err);
      }
    }

    res.json({ message: aiMessage, onboardingActive: false });
  } catch (error) {
    console.error('AI xatosi:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// DELETE /api/ai/history - Tarixni tozalash
router.delete('/history', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    await ChatHistory.deleteOne({ userId });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Tarix tozalash xatosi:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// GET /api/ai/follow-ups - Barcha follow-uplarni olish
router.get('/follow-ups', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const followUps = await FollowUp.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ followUps });
  } catch (error) {
    console.error('Follow-up olish xatosi:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// GET /api/ai/follow-ups/pending - Eslatma kerak bo'lgan follow-uplar
router.get('/follow-ups/pending', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const now = new Date();
    
    const pendingFollowUps = await FollowUp.find({
      userId,
      status: 'pending',
      followUpDate: { $lte: now }
    }).sort({ followUpDate: 1 });
    
    res.json({ followUps: pendingFollowUps });
  } catch (error) {
    console.error('Pending follow-up olish xatosi:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// PUT /api/ai/follow-ups/:id/progress - Progress yangilash
router.put('/follow-ups/:id/progress', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { day, completed, note } = req.body;
    
    const followUp = await FollowUp.findOne({ _id: id, userId });
    if (!followUp) {
      return res.status(404).json({ error: 'Follow-up topilmadi' });
    }
    
    const progressIndex = followUp.progress.findIndex(p => p.day === day);
    if (progressIndex !== -1) {
      followUp.progress[progressIndex].completed = completed;
      followUp.progress[progressIndex].note = note || '';
      followUp.progress[progressIndex].completedAt = completed ? new Date() : undefined;
    }
    
    await followUp.save();
    
    res.json({ success: true, followUp });
  } catch (error) {
    console.error('Progress yangilash xatosi:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// PUT /api/ai/follow-ups/:id/complete - Follow-upni yakunlash
router.put('/follow-ups/:id/complete', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { feedback } = req.body;
    
    const followUp = await FollowUp.findOneAndUpdate(
      { _id: id, userId },
      { 
        status: 'completed',
        finalFeedback: feedback || ''
      },
      { new: true }
    );
    
    if (!followUp) {
      return res.status(404).json({ error: 'Follow-up topilmadi' });
    }
    
    res.json({ success: true, followUp });
  } catch (error) {
    console.error('Follow-up yakunlash xatosi:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// PUT /api/ai/follow-ups/:id/remind - Eslatmani belgilash
router.put('/follow-ups/:id/remind', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const followUp = await FollowUp.findOneAndUpdate(
      { _id: id, userId },
      { status: 'reminded' },
      { new: true }
    );
    
    if (!followUp) {
      return res.status(404).json({ error: 'Follow-up topilmadi' });
    }
    
    res.json({ success: true, followUp });
  } catch (error) {
    console.error('Eslatma belgilash xatosi:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;
