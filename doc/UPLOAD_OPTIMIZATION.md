# Оптимизация загрузки видео

## Почему загрузка медленная?

### Основные причины:
1. **Размер файла** - видео 300MB+ требует времени
2. **Скорость интернета** - зависит от провайдера
3. **Сервер обрабатывает весь файл** - multer сохраняет на диск

## Что уже сделано

✅ Увеличен timeout до 10 минут
✅ Добавлен индикатор прогресса с процентами
✅ Добавлен индикатор скорости загрузки (MB/s)
✅ Логирование прогресса в консоль
✅ Отключен proxy buffering в nginx

## Типичная скорость загрузки

| Размер файла | Скорость 1 MB/s | Скорость 5 MB/s | Скорость 10 MB/s |
|--------------|-----------------|-----------------|------------------|
| 100 MB       | ~2 минуты       | ~20 секунд      | ~10 секунд       |
| 300 MB       | ~5 минут        | ~1 минута       | ~30 секунд       |
| 500 MB       | ~8 минут        | ~2 минуты       | ~50 секунд       |

## Дополнительная оптимизация

### 1. Сжатие видео перед загрузкой

Рекомендуется сжимать видео локально:

```bash
# Используя ffmpeg (качество vs размер)
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4

# Для веб-оптимизации
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset fast -movflags +faststart output.mp4
```

**CRF значения:**
- 18-23: Высокое качество (большой размер)
- 23-28: Среднее качество (оптимально для веб)
- 28-35: Низкое качество (маленький размер)

### 2. Chunked Upload (будущая оптимизация)

Для очень больших файлов можно реализовать загрузку по частям:

```typescript
// Пример chunked upload
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const chunks = Math.ceil(file.size / CHUNK_SIZE);

for (let i = 0; i < chunks; i++) {
  const start = i * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, file.size);
  const chunk = file.slice(start, end);
  
  await uploadChunk(chunk, i, chunks);
}
```

### 3. Resumable Upload

Возможность продолжить загрузку после обрыва:
- Сохранять прогресс в localStorage
- Использовать tus.io протокол
- Реализовать на сервере поддержку Range headers

### 4. Проверка скорости интернета

```bash
# На сервере
speedtest-cli

# Или через curl
curl -o /dev/null http://speedtest.wdc01.softlayer.com/downloads/test100.zip
```

## Текущие настройки

### Nginx
```nginx
client_max_body_size 500M;
proxy_request_buffering off;
proxy_read_timeout 300s;
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
```

### Express
```typescript
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
```

### Multer
```typescript
limits: {
  fileSize: 500 * 1024 * 1024, // 500MB
}
```

### Axios
```typescript
timeout: 600000, // 10 minutes
maxContentLength: Infinity,
maxBodyLength: Infinity,
```

## Рекомендации

### Для пользователей:
1. **Сжимайте видео** перед загрузкой (используйте HandBrake, ffmpeg)
2. **Используйте стабильное соединение** (не WiFi, если возможно)
3. **Не закрывайте вкладку** во время загрузки
4. **Проверьте скорость интернета** перед загрузкой больших файлов

### Для разработчиков:
1. Рассмотрите **chunked upload** для файлов >100MB
2. Добавьте **resumable upload** для надежности
3. Используйте **CDN** для хранения видео (S3, Cloudflare R2)
4. Реализуйте **фоновую обработку** (транскодинг, оптимизация)

## Мониторинг

Проверить скорость загрузки:

```bash
# На сервере
tail -f /var/log/nginx/access.log | grep upload

# Размер загруженных файлов
du -sh /var/www/moo/uploads

# Свободное место
df -h /var/www/moo
```

## Troubleshooting

### Загрузка зависает на 0%
- Проверьте права на папку uploads
- Проверьте свободное место на диске
- Проверьте логи nginx и pm2

### Загрузка обрывается
- Увеличьте timeout в nginx
- Проверьте стабильность интернета
- Проверьте логи на ошибки

### Медленная загрузка
- Проверьте скорость интернета (speedtest)
- Сжимайте видео перед загрузкой
- Рассмотрите использование CDN
