import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../api';
import { useAuth } from '../context/AuthContext';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: string;
  orderIndex: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

export function KategoriyaBolimi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSubscribed, isAdmin, subscription } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [, setCategoryIndex] = useState<number>(-1);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    loadCategory();
    // Load completed lessons from localStorage
    const completed = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    setCompletedLessons(completed);
  }, [id]);

  const loadCategory = async () => {
    try {
      // First get all categories to check index
      const allCategoriesRes = await categoriesAPI.getAll();
      const allCategories = allCategoriesRes.data;
      const currentIndex = allCategories.findIndex((c: Category) => c.id === id);
      setCategoryIndex(currentIndex);
      
      // Check if user has access (admin, subscribed, or first category)
      if (!isAdmin && !isSubscribed && currentIndex > 0) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      
      const res = await categoriesAPI.getOne(id!);
      setCategory(res.data);
    } catch (err: any) {
      console.error(err);
      navigate('/kategoriyalar');
    } finally {
      setLoading(false);
    }
  };

  const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
    article: { icon: 'article', label: 'Maqola', color: 'bg-emerald-100 text-emerald-600' },
    video: { icon: 'play_circle', label: 'Video', color: 'bg-emerald-100 text-emerald-600' },
    audio: { icon: 'headphones', label: 'Audio', color: 'bg-orange-100 text-orange-600' },
  };

  const colorClasses: Record<string, { bg: string; gradient: string; light: string }> = {
    green: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50' },
    blue: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50' },
    red: { bg: 'bg-red-500', gradient: 'from-red-500 to-red-600', light: 'bg-red-50' },
    purple: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-purple-50' },
    orange: { bg: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600', light: 'bg-orange-50' },
    teal: { bg: 'bg-teal-500', gradient: 'from-teal-500 to-teal-600', light: 'bg-teal-50' },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-sm w-full text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-3xl text-amber-600">lock</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Obuna talab qilinadi</h2>
          <p className="text-slate-600 mb-5 text-sm">
            Bu kategoriyani ochish uchun oylik obunani faollashtiring. Hozircha faqat birinchi kategoriya bepul.
          </p>
          
          {/* Price */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white text-center mb-4">
            <p className="text-emerald-100 text-xs mb-1">Oylik obuna narxi</p>
            <p className="text-2xl font-bold">50,000 so'm</p>
          </div>
          
          {/* Card Number */}
          <div className="bg-slate-50 rounded-xl p-4 mb-4 text-left">
            <p className="text-slate-500 text-xs mb-2">To'lov uchun karta raqami:</p>
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900 text-lg tracking-wider">5614 6827 1416 5471</p>
              <button 
                onClick={() => navigator.clipboard.writeText('5614682714165471')}
                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                title="Nusxalash"
              >
                <span className="material-symbols-outlined text-lg">content_copy</span>
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-1">Hakimov Javohir</p>
          </div>

          {/* Telegram */}
          <a
            href="https://t.me/mukammal_ota_ona"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#0088cc] text-white rounded-xl font-semibold hover:bg-[#0077b5] transition-colors mb-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            Telegram orqali bog'lanish
          </a>
          
          <Link to="/kategoriyalar" className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>Orqaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  if (!category) return null;

  const colors = colorClasses[category.color] || colorClasses.green;

  return (
    <div className="min-h-screen bg-slate-50 font-display">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16 lg:h-20 gap-3 sm:gap-4">
            <button onClick={() => navigate('/kategoriyalar')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-slate-600">arrow_back</span>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 truncate">{category.name}</h1>
              <p className="text-xs sm:text-sm text-slate-500">{category.lessons.length} ta dars</p>
            </div>
            {!isAdmin && subscription && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold text-xs sm:text-sm ${
                subscription.daysLeft <= 3 ? 'bg-red-100 text-red-700' :
                subscription.daysLeft <= 5 ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                <span>{subscription.daysLeft} kun qoldi</span>
              </div>
            )}
            <Link to="/kategoriyalar" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-slate-600">home</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Category Hero */}
        <div className={`bg-gradient-to-br ${colors.gradient} rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 mb-6 sm:mb-10 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl sm:text-5xl lg:text-6xl">{category.icon}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">{category.name}</h2>
              <p className="text-white/80 text-sm sm:text-lg">{category.description}</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 mt-2 sm:mt-0">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{category.lessons.length}</p>
                <p className="text-white/70 text-xs sm:text-sm">Darslar</p>
              </div>
              <div className="w-px h-10 sm:h-12 bg-white/20"></div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">~{category.lessons.length * 5}</p>
                <p className="text-white/70 text-xs sm:text-sm">Daqiqa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <h3 className="text-base sm:text-xl font-bold text-slate-900">Darslar ro'yxati</h3>
          <span className="text-xs sm:text-sm text-slate-500">{category.lessons.length} ta dars</span>
        </div>
        
        {category.lessons.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center">
            <div className={`w-16 sm:w-20 h-16 sm:h-20 rounded-xl sm:rounded-2xl ${colors.light} flex items-center justify-center mx-auto mb-4 sm:mb-6`}>
              <span className="material-symbols-outlined text-3xl sm:text-4xl text-slate-400">school</span>
            </div>
            <p className="text-base sm:text-xl text-slate-500">Bu kategoriyada hali darslar yo'q</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {category.lessons.map((lesson, index) => {
              const type = typeConfig[lesson.type] || typeConfig.article;
              const isLessonCompleted = completedLessons.includes(lesson.id);
              // Dars ochiq: admin, birinchi dars, yoki oldingi dars bajarilgan
              const prevLessonId = index > 0 ? category.lessons[index - 1].id : null;
              const isPrevCompleted = prevLessonId ? completedLessons.includes(prevLessonId) : true;
              const isUnlocked = isAdmin || index === 0 || isPrevCompleted;
              
              if (!isUnlocked) {
                return (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 sm:gap-4 lg:gap-6 bg-white/60 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-slate-100 opacity-60"
                  >
                    <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-base sm:text-xl lg:text-2xl shrink-0">
                      <span className="material-symbols-outlined text-xl sm:text-2xl">lock</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm sm:text-lg text-slate-400 mb-1 truncate">
                        {lesson.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-400">Oldingi darsni bajaring</p>
                    </div>
                    
                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                      <span className="material-symbols-outlined text-lg sm:text-2xl">lock</span>
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={lesson.id}
                  to={`/dars/${lesson.id}`}
                  className="group flex items-center gap-3 sm:gap-4 lg:gap-6 bg-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100 hover:border-primary/20"
                >
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl ${isLessonCompleted ? 'bg-emerald-500' : `bg-gradient-to-br ${colors.gradient}`} flex items-center justify-center text-white font-bold text-base sm:text-xl lg:text-2xl shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    {isLessonCompleted ? (
                      <span className="material-symbols-outlined text-xl sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm sm:text-lg text-slate-900 group-hover:text-primary transition-colors mb-1 truncate">
                      {lesson.title}
                    </h4>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg ${type.color} font-medium`}>
                        <span className="material-symbols-outlined text-sm">{type.icon}</span>
                        <span className="hidden sm:inline">{type.label}</span>
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {lesson.duration}
                      </span>
                      {isLessonCompleted && (
                        <span className="text-emerald-600 flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <span className="hidden sm:inline">Bajarildi</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-slate-100 group-hover:bg-primary flex items-center justify-center text-slate-400 group-hover:text-white transition-all shrink-0">
                    <span className="material-symbols-outlined text-lg sm:text-2xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}




