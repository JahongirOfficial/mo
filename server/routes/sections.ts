import { Router } from 'express';
import { Section, Category } from '../db';

const router = Router();

// Get all sections
router.get('/', async (req, res) => {
  try {
    const sections = await Section.find().sort({ orderIndex: 1 });
    
    // Get category count for each section
    const sectionsWithCount = await Promise.all(
      sections.map(async (section) => {
        const categoryCount = await Category.countDocuments({ sectionId: section._id });
        return {
          id: section._id,
          name: section.name,
          icon: section.icon,
          color: section.color,
          orderIndex: section.orderIndex,
          categoryCount
        };
      })
    );
    
    res.json(sectionsWithCount);
  } catch (error) {
    res.status(500).json({ error: "Bo'limlarni olishda xatolik" });
  }
});

// Get single section with categories
router.get('/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ error: "Bo'lim topilmadi" });
    }
    
    const categories = await Category.find({ sectionId: section._id });
    
    res.json({
      id: section._id,
      name: section.name,
      icon: section.icon,
      color: section.color,
      categories: categories.map(c => ({
        id: c._id,
        name: c.name,
        description: c.description,
        icon: c.icon,
        color: c.color
      }))
    });
  } catch (error) {
    res.status(500).json({ error: "Bo'limni olishda xatolik" });
  }
});

// Create section (admin only)
router.post('/', async (req: any, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat berilmagan' });
  }
  
  try {
    const { name, icon, color } = req.body;
    const lastSection = await Section.findOne().sort({ orderIndex: -1 });
    const orderIndex = lastSection ? lastSection.orderIndex + 1 : 0;
    
    const section = await Section.create({
      name,
      icon: icon || 'folder',
      color: color || 'from-emerald-500 to-emerald-600',
      orderIndex
    });
    
    res.status(201).json({
      id: section._id,
      name: section.name,
      icon: section.icon,
      color: section.color,
      orderIndex: section.orderIndex,
      categoryCount: 0
    });
  } catch (error) {
    res.status(500).json({ error: "Bo'lim yaratishda xatolik" });
  }
});

// Update section (admin only)
router.put('/:id', async (req: any, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat berilmagan' });
  }
  
  try {
    const { name, icon, color } = req.body;
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { name, icon, color },
      { new: true }
    );
    
    if (!section) {
      return res.status(404).json({ error: "Bo'lim topilmadi" });
    }
    
    res.json({
      id: section._id,
      name: section.name,
      icon: section.icon,
      color: section.color
    });
  } catch (error) {
    res.status(500).json({ error: "Bo'limni yangilashda xatolik" });
  }
});

// Delete section (admin only)
router.delete('/:id', async (req: any, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat berilmagan' });
  }
  
  try {
    // Check if section has categories
    const categoryCount = await Category.countDocuments({ sectionId: req.params.id });
    if (categoryCount > 0) {
      return res.status(400).json({ error: "Bu bo'limda kategoriyalar bor. Avval ularni o'chiring." });
    }
    
    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: "Bo'lim o'chirildi" });
  } catch (error) {
    res.status(500).json({ error: "Bo'limni o'chirishda xatolik" });
  }
});

export default router;
