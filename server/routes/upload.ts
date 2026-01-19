import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { isAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate secure random filename
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${randomName}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only video files
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat video fayllar (MP4, WebM, OGG) yuklash mumkin'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB max (2147483648 bytes)
    fieldSize: 2 * 1024 * 1024 * 1024,
  }
});

// Upload video (admin only)
router.post('/video', isAdmin, (req, res, next) => {
  // Set timeout to 30 minutes for video uploads
  req.setTimeout(1800000);
  res.setTimeout(1800000);
  
  // Log connection events for debugging
  let uploadStartTime = Date.now();
  let lastLoggedBytes = 0;
  
  req.on('aborted', () => {
    console.error('❌ Upload ABORTED by client after', (Date.now() - uploadStartTime) / 1000, 'seconds');
  });
  
  req.on('close', () => {
    const duration = (Date.now() - uploadStartTime) / 1000;
    if (!res.headersSent) {
      console.error('❌ Connection CLOSED before response sent. Duration:', duration, 'seconds');
    } else {
      console.log('✅ Upload completed successfully. Duration:', duration, 'seconds');
    }
  });
  
  // Log upload progress
  const progressInterval = setInterval(() => {
    if (req.socket && req.socket.bytesRead > lastLoggedBytes) {
      const bytesRead = req.socket.bytesRead;
      const mbRead = (bytesRead / 1024 / 1024).toFixed(2);
      const speed = ((bytesRead - lastLoggedBytes) / 1024 / 1024).toFixed(2);
      console.log(`📤 Upload progress: ${mbRead}MB received (${speed}MB/s)`);
      lastLoggedBytes = bytesRead;
    }
  }, 5000); // Log every 5 seconds
  
  res.on('finish', () => {
    clearInterval(progressInterval);
  });
  
  res.on('close', () => {
    clearInterval(progressInterval);
  });
  
  next();
}, upload.single('video'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      console.error('❌ No file received in request');
      return res.status(400).json({ error: 'Video fayl yuklanmadi' });
    }

    console.log('✅ File uploaded successfully:', {
      filename: req.file.filename,
      size: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
      mimetype: req.file.mimetype
    });

    // Return secure video URL (will be served through authenticated endpoint)
    const videoUrl = `/api/videos/${req.file.filename}`;

    res.json({
      message: 'Video muvaffaqiyatli yuklandi',
      videoUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Video yuklashda xatolik' });
  }
});

// Multer error handler
router.use((error: any, req: AuthRequest, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    console.error('❌ Multer error:', error.code, error.message);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'Video hajmi juda katta. Maksimal hajm: 2GB',
        code: 'FILE_TOO_LARGE'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Noto\'g\'ri fayl maydoni. "video" maydonidan foydalaning',
        code: 'INVALID_FIELD'
      });
    }
    
    return res.status(400).json({ 
      error: `Yuklashda xatolik: ${error.message}`,
      code: error.code
    });
  }
  
  if (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({ 
      error: 'Video yuklashda xatolik',
      message: error.message
    });
  }
  
  next();
});

// Delete video (admin only)
router.delete('/video/:filename', isAdmin, async (req: AuthRequest, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: "Video o'chirildi" });
    } else {
      res.status(404).json({ error: 'Video topilmadi' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Video o'chirishda xatolik" });
  }
});

export default router;
