import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { sectionsAPI, lessonsAPI } from '../api';
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
  orderIndex?: number;
  status?: 'active' | 'pause';
  lessonCount?: number;
}

interface Section {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: 'active' | 'pause';
  orderIndex: number;
  categories: Category[];
}

export function KategoriyaBolimi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, subscription, logout } = useAuth();
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [pausedSectionName, setPausedSectionName] = useState('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryLessons, setCategoryLessons] = useState<Record<string, Lesson[]>>({});
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pausedCategoryName, setPausedCategoryName] = useState('');
  const [loadingLessons, setLoadingLessons] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    loadSection();
    const completed = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    setCompletedLessons(completed);
  }, [id]);

  const loadSection = async () => {
    try {
      // Bitta so'rov bilan section va uning kategoriyalarini olish
      const res = await sectionsAPI.getOne(id!);
      
      // Agar pause bo'lsa va admin bo'lmasa, tekshirish
      if (!isAdmin && res.data.status === 'pause') {
        // Oldingi bo'lim nomini olish uchun barcha bo'limlarni so'rash
        const allSectionsRes = await sectionsAPI.getAll();
        const allSections = allSectionsRes.data.sort((a: Section, b: Section) => (a.orderIndex || 0) - (b.orderIndex || 0));
        const currentIndex = allSections.findIndex((s: Section) => s.id === id);
        const prevSection = allSections[currentIndex - 1];
        setPausedSectionName(prevSection?.name || 'oldingi bo\'lim');
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      
      setSection(res.data);
    } catch (err: any) {
      navigate('/bolim');
    } finally {
      setLoading(false);
    }
  };


  const loadCategoryLessons = async (categoryId: string) => {
    if (categoryLessons[categoryId]) return;
    setLoadingLessons(categoryId);
    try {
      const res = await lessonsAPI.getAll(categoryId);
      setCategoryLessons(prev => ({ ...prev, [categoryId]: res.data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLessons(null);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
      loadCategoryLessons(categoryId);
    }
  };

  const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
    article: { icon: 'article', label: 'Maqola', color: 'bg-emerald-100 text-emerald-600' },
    video: { icon: 'play_circle', label: 'Video', color: 'bg-emerald-100 text-emerald-600' },
    audio: { icon: 'headphones', label: 'Audio', color: 'bg-orange-100 text-orange-600' },
  };

  const colorClasses: Record<string, { bg: string; gradient: string; light: string }> = {
    green: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50' },
    blue: { bg: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50' },
    red: { bg: 'bg-red-500', gradient: 'from-red-500 to-red-600', light: 'bg-red-50' },
    purple: { bg: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50' },
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
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Bo'lim qulflangan</h2>
          <p className="text-slate-600 mb-5 text-sm">
            Bu bo'limni ochish uchun avval <strong>"{pausedSectionName}"</strong> bo'limini tugatishingiz kerak.
          </p>
          <Link to="/bolim" className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold text-sm">
            <span className="material-symbols-outlined text-lg">arrow_back</span>Orqaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  if (!section) return null;

  const colors = colorClasses[section.color] || colorClasses.green;


  return (
    <div className="min-h-screen bg-slate-50 font-display">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 sm:h-16 gap-3">
            <button onClick={() => navigate('/bolim')} className="p-2.5 sm:p-3 hover:bg-slate-100 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-600">arrow_back</span>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-slate-900 truncate">{section.name}</h1>
              <p className="text-xs text-slate-500">{section.categories?.length || 0} ta kategoriya</p>
            </div>
            {!isAdmin && subscription && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold text-xs ${
                subscription.daysLeft <= 3 ? 'bg-red-100 text-red-700' :
                subscription.daysLeft <= 5 ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                <span>{subscription.daysLeft} kun</span>
              </div>
            )}
            <Link to="/bolim" className="p-2.5 sm:p-3 hover:bg-slate-100 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-600">home</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2.5 sm:p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Chiqish"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Section Hero - Compact */}
        <div className={`bg-gradient-to-br ${colors.gradient} rounded-2xl p-4 sm:p-5 mb-6 text-white relative overflow-hidden shadow-lg`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl sm:text-3xl">{section.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold mb-0.5 truncate">{section.name}</h2>
              <p className="text-white/80 text-xs sm:text-sm">Kategoriyalarni tanlang va darslarni boshlang</p>
            </div>
            <div className="text-center shrink-0">
              <p className="text-2xl sm:text-3xl font-bold">{section.categories?.length || 0}</p>
              <p className="text-white/70 text-[10px] sm:text-xs">Kategoriya</p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-xl font-bold text-slate-900">Kategoriyalar</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Kategoriyani tanlang va darslarni boshlang</p>
        </div>
        
        {!section.categories || section.categories.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center">
            <div className={`w-16 sm:w-20 h-16 sm:h-20 rounded-xl sm:rounded-2xl ${colors.light} flex items-center justify-center mx-auto mb-4 sm:mb-6`}>
              <span className="material-symbols-outlined text-3xl sm:text-4xl text-slate-400">folder_off</span>
            </div>
            <p className="text-base sm:text-xl text-slate-500">Bu bo'limda hali kategoriyalar yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.categories.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)).map((category, catIndex) => {
              const catColors = colorClasses[category.color] || colorClasses.green;
              const isExpanded = expandedCategory === category.id;
              const lessons = categoryLessons[category.id] || [];
              const sortedCategories = [...section.categories].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
              const prevCategory = sortedCategories[catIndex - 1];
              const isPaused = !isAdmin && category.status === 'pause';

              const handleCategoryClick = () => {
                if (isPaused) {
                  setPausedCategoryName(prevCategory?.name || 'oldingi kategoriya');
                  setShowPauseModal(true);
                } else {
                  toggleCategory(category.id);
                }
              };
              
              return (
                <div key={category.id}>
                  {/* Category Card */}
                  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all ${isPaused ? 'opacity-60' : 'hover:shadow-lg hover:border-emerald-200'}`}>
                    <button
                      onClick={handleCategoryClick}
                      className="w-full p-5 text-left"
                    >
                      {/* Lock Badge */}
                      {isPaused && (
                        <div className="flex justify-end mb-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-400 text-lg">lock</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${isPaused ? 'from-slate-400 to-slate-500 grayscale' : catColors.gradient} flex items-center justify-center text-white shadow-md mb-4 transition-transform ${!isPaused && 'hover:scale-110'}`}>
                        <span className="material-symbols-outlined text-2xl">{isPaused ? 'lock' : category.icon}</span>
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-2 mb-4">
                        <h4 className={`font-bold text-base ${isPaused ? 'text-slate-500' : 'text-slate-800'}`}>
                          {category.name}
                        </h4>
                        <p className="text-sm text-slate-500 line-clamp-2">{category.description}</p>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span className="material-symbols-outlined text-lg">school</span>
                          <span className="text-sm font-medium">{category.lessonCount || 0} ta dars</span>
                        </div>
                        {!isPaused && (
                          <div className={`w-8 h-8 rounded-full ${isExpanded ? 'bg-emerald-500' : 'bg-slate-100'} flex items-center justify-center transition-all`}>
                            <span className={`material-symbols-outlined text-lg transition-all ${isExpanded ? 'text-white rotate-180' : 'text-slate-400'}`}>
                              expand_more
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                  
                  {/* Lessons Dropdown - Full Width Below Card */}
                  {isExpanded && !isPaused && (
                    <div className="mt-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                      {loadingLessons === category.id ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl animate-pulse">
                              <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : lessons.length === 0 ? (
                        <p className="text-center text-slate-500 py-4 text-sm">Bu kategoriyada hali darslar yo'q</p>
                      ) : (
                        <div className="space-y-2">
                          {lessons.map((lesson, index) => {
                            const type = typeConfig[lesson.type] || typeConfig.article;
                            const isLessonCompleted = completedLessons.includes(lesson.id);
                            
                            return (
                              <Link key={lesson.id} to={`/dars/${lesson.id}`} className="group flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-white hover:shadow-md hover:border-emerald-200 border border-transparent transition-all">
                                <div className={`w-8 h-8 rounded-lg ${isLessonCompleted ? 'bg-emerald-500' : `bg-gradient-to-br ${catColors.gradient}`} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                  {isLessonCompleted ? (
                                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">{lesson.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${type.color}`}>
                                      <span className="material-symbols-outlined text-xs">{type.icon}</span>
                                      <span>{type.label}</span>
                                    </span>
                                    <span>{lesson.duration}</span>
                                  </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0">arrow_forward</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 20 ta Dolzarb Muammo - Special Module */}
            <Link 
              to="/muammolar"
              className="group relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1"
            >
              {/* Special Badge */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-amber-100 rounded-full">
                <span className="text-[10px] font-bold text-amber-700">Maxsus</span>
              </div>
              
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-2xl">lightbulb</span>
              </div>
              
              {/* Content */}
              <div className="space-y-1 mb-4">
                <h4 className="font-bold text-base text-slate-800 group-hover:text-emerald-600 transition-colors">
                  20 ta Dolzarb Muammo va Yechimlar
                </h4>
                <p className="text-sm text-slate-500 line-clamp-2">
                  Eng ko'p uchraydigan muammolar va ularning amaliy yechimlari
                </p>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="material-symbols-outlined text-lg">quiz</span>
                  <span className="text-sm font-medium">20 ta muammo</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                  <span className="material-symbols-outlined text-emerald-600 text-lg">arrow_forward</span>
                </div>
              </div>
            </Link>
          </div>
        )}
      </main>

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowPauseModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-amber-600">lock</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Kategoriya qulflangan</h3>
            <p className="text-slate-600 text-sm mb-6">
              Bu kategoriyani ochish uchun avval <strong>"{pausedCategoryName}"</strong> kategoriyasini tugatishingiz kerak.
            </p>
            <button
              onClick={() => setShowPauseModal(false)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
