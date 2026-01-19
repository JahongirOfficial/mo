# Chunked Upload - Загрузка по частям

## Зачем нужно?

- Загрузка файлов >500MB
- Возможность продолжить после обрыва
- Показ реального прогресса
- Меньше нагрузка на память сервера

## Как работает?

1. Файл делится на части (chunks) по 5-10MB
2. Каждая часть загружается отдельно
3. На сервере части собираются в один файл
4. Если обрыв - можно продолжить с последней части

## Реализация (будущее)

### Frontend (React)

\`\`\`typescript
const uploadVideoChunked = async (file: File, onProgress: (progress: number) => void) => {
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = crypto.randomUUID();
  
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);
    
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('uploadId', uploadId);
    formData.append('filename', file.name);
    
    await api.post('/upload/video-chunk', formData);
    
    const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
    onProgress(progress);
  }
  
  // Finalize upload
  const response = await api.post('/upload/video-finalize', { uploadId });
  return response.data;
};
\`\`\`

### Backend (Express)

\`\`\`typescript
// Temporary storage for chunks
const uploadChunks = new Map<string, { chunks: Buffer[], totalChunks: number, filename: string }>();

router.post('/video-chunk', isAdmin, upload.single('chunk'), async (req, res) => {
  const { chunkIndex, totalChunks, uploadId, filename } = req.body;
  
  if (!uploadChunks.has(uploadId)) {
    uploadChunks.set(uploadId, { chunks: [], totalChunks: parseInt(totalChunks), filename });
  }
  
  const uploadData = uploadChunks.get(uploadId)!;
  uploadData.chunks[parseInt(chunkIndex)] = req.file!.buffer;
  
  res.json({ success: true, received: chunkIndex });
});

router.post('/video-finalize', isAdmin, async (req, res) => {
  const { uploadId } = req.body;
  const uploadData = uploadChunks.get(uploadId);
  
  if (!uploadData) {
    return res.status(400).json({ error: 'Upload not found' });
  }
  
  // Combine chunks
  const finalBuffer = Buffer.concat(uploadData.chunks);
  const filename = \`\${crypto.randomBytes(16).toString('hex')}.mp4\`;
  const filepath = path.join(uploadsDir, filename);
  
  await fs.promises.writeFile(filepath, finalBuffer);
  uploadChunks.delete(uploadId);
  
  res.json({ videoUrl: \`/api/videos/\${filename}\` });
});
\`\`\`

## Альтернатива: tus.io

Готовый протокол для resumable uploads:

\`\`\`bash
npm install tus-js-client
npm install @tus/server
\`\`\`

## Текущее решение

Пока используем обычную загрузку с оптимизациями:
- Сжимайте видео перед загрузкой
- Используйте стабильное соединение
- Не закрывайте вкладку во время загрузки

## Когда внедрять chunked upload?

- Если файлы регулярно >500MB
- Если часто обрываются загрузки
- Если нужна возможность паузы/продолжения
