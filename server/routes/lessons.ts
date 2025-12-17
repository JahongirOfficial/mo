import { Router } from 'express';
import { Category, Lesson } from '../db';
import { isAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all lessons
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    let query = {};
    if (categoryId) {
      query = { categoryId };
    }

    const lessons = await Lesson.find(query).sort({ orderIndex: 1 });
    
    // Get category names
    const lessonsWithCategory = await Promise.all(
      lessons.map(async (lesson) => {
        const category = await Category.findById(lesson.categoryId);
        return {
          ...lesson.toObject(),
          id: lesson._id,
          categoryName: category?.name || ''
        };
      })
    );

    res.json(lessonsWithCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Get single lesson
router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Dars topilmadi' });
    }

    const category = await Category.findById(lesson.categoryId);

    // Get prev/next lessons
    const allLessons = await Lesson.find({ categoryId: lesson.categoryId }).sort({ orderIndex: 1 });
    const currentIndex = allLessons.findIndex(l => l._id.toString() === req.params.id);
    
    const prevLesson = currentIndex > 0 
      ? { id: allLessons[currentIndex - 1]._id, title: allLessons[currentIndex - 1].title }
      : null;
    const nextLesson = currentIndex < allLessons.length - 1
      ? { id: allLessons[currentIndex + 1]._id, title: allLessons[currentIndex + 1].title }
      : null;

    res.json({
      ...lesson.toObject(),
      id: lesson._id,
      categoryId: lesson.categoryId,
      categoryName: category?.name || '',
      prevLesson,
      nextLesson
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Create lesson (admin only)
router.post('/', isAdmin, async (req: AuthRequest, res) => {
  try {
    const { categoryId, title, content, duration, type, videoUrl, tushuncha, misol, amaliy } = req.body;

    if (!categoryId || !title) {
      return res.status(400).json({ error: 'Kategoriya va dars nomi kiritilishi shart' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Kategoriya topilmadi' });
    }

    // Get max order index
    const maxOrderLesson = await Lesson.findOne({ categoryId }).sort({ orderIndex: -1 });
    const orderIndex = (maxOrderLesson?.orderIndex || 0) + 1;

    const lesson = await Lesson.create({
      categoryId,
      title,
      content: content || '',
      tushuncha: tushuncha || '',
      misol: misol || '',
      amaliy: amaliy || '',
      duration: duration || '5 daqiqa',
      type: type || 'article',
      videoUrl: videoUrl || '',
      orderIndex
    });

    res.json({ ...lesson.toObject(), id: lesson._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Update lesson (admin only)
router.put('/:id', isAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, content, duration, type, orderIndex, videoUrl, tushuncha, misol, amaliy } = req.body;

    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { title, content, duration, type, orderIndex, videoUrl, tushuncha, misol, amaliy },
      { new: true }
    );

    if (!lesson) {
      return res.status(404).json({ error: 'Dars topilmadi' });
    }

    res.json({ ...lesson.toObject(), id: lesson._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Delete lesson (admin only)
router.delete('/:id', isAdmin, async (req: AuthRequest, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Dars topilmadi' });
    }

    res.json({ message: "Dars o'chirildi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;
