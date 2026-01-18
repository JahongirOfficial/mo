# AI Kuzatuv Tizimi (Follow-up System)

## Xususiyatlar

### 1. Avtomatik Follow-up Yaratish
- AI 7-kunlik reja berganida avtomatik follow-up yaratiladi
- 3 kundan keyin eslatma yuboriladi
- Har bir reja uchun progress tracking

### 2. Progress Tracking
- 7 kunlik reja har bir kun uchun tracking
- Har bir kun: bajarildi/bajarilmadi
- Izohlar qo'shish imkoniyati
- Bajarilgan sana

### 3. Avtomatik Eslatma
- 3 kundan keyin avtomatik eslatma
- Chat ochilganda eslatma xabari ko'rsatiladi
- "Qanday natija bo'ldi?" deb so'raydi

### 4. Status Tracking
- **pending**: Kutilmoqda
- **reminded**: Eslatma yuborildi
- **completed**: Yakunlandi
- **cancelled**: Bekor qilindi

## API Endpointlar

### GET /api/ai/follow-ups
Barcha follow-uplarni olish (oxirgi 10 ta)

### GET /api/ai/follow-ups/pending
Eslatma kerak bo'lgan follow-uplar

### PUT /api/ai/follow-ups/:id/progress
Progress yangilash
```json
{
  "day": 1,
  "completed": true,
  "note": "Yaxshi natija"
}
```

### PUT /api/ai/follow-ups/:id/complete
Follow-upni yakunlash
```json
{
  "feedback": "Juda yaxshi natija bo'ldi, bola o'zgargan"
}
```

### PUT /api/ai/follow-ups/:id/remind
Eslatmani belgilash (avtomatik)

## Database Schema

```typescript
{
  userId: ObjectId,
  planTitle: String,        // "Telefon muammosi"
  planContent: String,      // To'liq reja matni
  startDate: Date,
  followUpDate: Date,       // 3 kundan keyin
  status: String,           // pending, reminded, completed, cancelled
  progress: [{
    day: Number,            // 1-7
    completed: Boolean,
    note: String,
    completedAt: Date
  }],
  finalFeedback: String,
  createdAt: Date
}
```

## Qanday Ishlaydi

1. **Reja Beriladi**: AI 7-kunlik reja beradi
2. **Follow-up Yaratiladi**: Avtomatik follow-up yaratiladi (3 kun keyingi sana)
3. **Eslatma**: 3 kundan keyin user chat ochganda eslatma ko'rsatiladi
4. **Progress**: User har kunni belgilashi mumkin
5. **Yakunlash**: 7 kundan keyin natija beriladi

## Frontend Integration (Keyingi Qadam)

Frontend qismida quyidagilar kerak:
- Follow-up ro'yxati komponenti
- Progress tracker komponenti
- Eslatma notification
- Yakunlash modal oynasi

## Misol

```
User: "Bolam telefonga yopishib qolgan"
AI: [7-kunlik reja beradi]
→ Follow-up yaratiladi (3 kun keyingi sana)

3 kundan keyin:
User: [Chat ochadi]
AI: "Eslatma: 3 kun oldin siz 'Telefon muammosi' bo'yicha reja oldingiz. 
     Qanday natija bo'ldi?"
```

## Kelajakdagi Yaxshilanishlar

- Email/SMS eslatmalar
- Push notification
- Haftalik hisobot
- Statistika va analytics
- Muvaffaqiyat darajasi tracking
