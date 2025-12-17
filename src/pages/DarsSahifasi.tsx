import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

interface Lesson {
  id: string; title: string; content: string; duration: string; type: string;
  categoryId: string; categoryName: string; videoUrl?: string;
  tushuncha?: string; misol?: string; amaliy?: string;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
}

export function DarsSahifasi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, subscription } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => { loadLesson(); window.scrollTo(0, 0); }, [id]);

  // Check if lesson is completed
  useEffect(() => {
    if (id) {
      const completed = JSON.parse(localStorage.getItem('completedLessons') || '[]');
      setIsCompleted(completed.includes(id));
    }
  }, [id]);

  // Mark lesson as completed and go to next
  const handleComplete = () => {
    if (!id || !lesson) return;
    
    const completed = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    if (!completed.includes(id)) {
      completed.push(id);
      localStorage.setItem('completedLessons', JSON.stringify(completed));
      setIsCompleted(true);
    }
    
    // Navigate to next lesson or category
    if (lesson.nextLesson) {
      navigate(`/dars/${lesson.nextLesson.id}`);
    } else {
      navigate(`/bolim`);
    }
  };

  // Check bookmark status
  useEffect(() => {
    if (id) {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedLessons') || '[]');
      setIsBookmarked(bookmarks.includes(id));
    }
  }, [id]);

  // Toggle bookmark
  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedLessons') || '[]');
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter((b: string) => b !== id);
      localStorage.setItem('bookmarkedLessons', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
    } else {
      bookmarks.push(id);
      localStorage.setItem('bookmarkedLessons', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  // Share lesson
  const handleShare = async () => {
    const shareData = {
      title: lesson?.title || 'Dars',
      text: `${lesson?.title} - Mukammal Ota Ona platformasida`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  // Get video URL with token
  const getVideoUrl = (videoUrl: string) => {
    const token = localStorage.getItem('token');
    return `http://${window.location.hostname}:3001${videoUrl}?token=${token}`;
  };

  const loadLesson = async () => {
    setLoading(true);
    setSubscriptionError(false);
    try {
      const res = await lessonsAPI.getOne(id!);
      setLesson(res.data);
    } catch (err: any) {
      if (err.response?.data?.code === 'SUBSCRIPTION_REQUIRED') {
        setSubscriptionError(true);
      } else {
        navigate('/bolim');
      }
    } finally { setLoading(false); }
  };

  const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
    article: { icon: 'article', label: 'Maqola', color: 'bg-emerald-100 text-emerald-600' },
    video: { icon: 'play_circle', label: 'Video', color: 'bg-emerald-100 text-emerald-600' },
    audio: { icon: 'headphones', label: 'Audio', color: 'bg-orange-100 text-orange-600' },
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>;

  if (subscriptionError) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full text-center shadow-xl">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-amber-600">lock</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Obuna talab qilinadi</h2>
        <p className="text-slate-600 mb-8 text-sm sm:text-base">Darslarni ko'rish uchun oylik obunani faollashtiring. Admin bilan bog'laning.</p>
        <Link to="/bolim" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold text-sm">
          <span className="material-symbols-outlined">arrow_back</span>Orqaga qaytish
        </Link>
      </div>
    </div>
  );

  if (!lesson) return null;
  const type = typeConfig[lesson.type] || typeConfig.article;
  const paragraphs = lesson.content?.split('\n\n').filter(p => p.trim()) || [];


  return (
    <div className="min-h-screen bg-slate-50 font-display">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16 lg:h-20 gap-3">
            <button onClick={() => navigate('/bolim')} className="p-2 hover:bg-slate-100 rounded-xl">
              <span className="material-symbols-outlined text-slate-600">arrow_back</span>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-slate-900 truncate">{lesson.title}</h1>
              <p className="text-xs sm:text-sm text-slate-500 truncate">{lesson.categoryName}</p>
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
            <button 
              onClick={toggleBookmark} 
              className={`p-2 rounded-xl transition-all ${isBookmarked ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 text-slate-600'}`}
              title={isBookmarked ? 'Saqlanganlardan olib tashlash' : 'Saqlash'}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
            </button>
            <button 
              onClick={handleShare} 
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"
              title="Ulashish"
            >
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <article className="bg-white rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden border border-slate-100">
          {/* Video Player */}
          {lesson.type === 'video' && lesson.videoUrl && (
            <div className="relative bg-black aspect-video">
              <video 
                controls 
                className="w-full h-full" 
                controlsList="nodownload" 
                onContextMenu={(e) => e.preventDefault()}
                src={getVideoUrl(lesson.videoUrl)}
              >
                Brauzeringiz video formatini qo'llab-quvvatlamaydi.
              </video>
            </div>
          )}

          {/* Accordion Sections */}
          {lesson.type === 'video' && (lesson.tushuncha || lesson.misol || lesson.amaliy) && (
            <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-3">
              {/* Ota-onaga tushuncha */}
              {lesson.tushuncha && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenSection(openSection === 'tushuncha' ? null : 'tushuncha')}
                    className={`w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 transition-colors ${openSection === 'tushuncha' ? 'bg-emerald-50' : 'bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${openSection === 'tushuncha' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                        <span className="material-symbols-outlined text-lg sm:text-xl">psychology</span>
                      </div>
                      <span className="font-semibold text-slate-800 text-sm sm:text-base">Ota-onaga tushuncha</span>
                    </div>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${openSection === 'tushuncha' ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {openSection === 'tushuncha' && (
                    <div className="px-4 sm:px-5 py-4 sm:py-5 bg-white border-t border-slate-100">
                      <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">{lesson.tushuncha}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Hayotiy misol */}
              {lesson.misol && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenSection(openSection === 'misol' ? null : 'misol')}
                    className={`w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 transition-colors ${openSection === 'misol' ? 'bg-amber-50' : 'bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${openSection === 'misol' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
                        <span className="material-symbols-outlined text-lg sm:text-xl">auto_stories</span>
                      </div>
                      <span className="font-semibold text-slate-800 text-sm sm:text-base">Hayotiy misol</span>
                    </div>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${openSection === 'misol' ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {openSection === 'misol' && (
                    <div className="px-4 sm:px-5 py-4 sm:py-5 bg-white border-t border-slate-100">
                      <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">{lesson.misol}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Amaliy mashq */}
              {lesson.amaliy && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenSection(openSection === 'amaliy' ? null : 'amaliy')}
                    className={`w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 transition-colors ${openSection === 'amaliy' ? 'bg-sky-50' : 'bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${openSection === 'amaliy' ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-600'}`}>
                        <span className="material-symbols-outlined text-lg sm:text-xl">fitness_center</span>
                      </div>
                      <span className="font-semibold text-slate-800 text-sm sm:text-base">Amaliy mashq</span>
                    </div>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${openSection === 'amaliy' ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {openSection === 'amaliy' && (
                    <div className="px-4 sm:px-5 py-4 sm:py-5 bg-white border-t border-slate-100">
                      <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">{lesson.amaliy}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Hero for non-video */}
          {lesson.type !== 'video' && (
            <div className="relative h-32 sm:h-48 lg:h-64 bg-gradient-to-br from-emerald-500 to-emerald-700 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200')] bg-cover bg-center opacity-30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${type.color} mb-3 text-sm`}>
                    <span className="material-symbols-outlined text-base">{type.icon}</span>
                    <span className="font-semibold">{type.label}</span>
                  </div>
                  <h1 className="text-lg sm:text-2xl lg:text-4xl font-bold">{lesson.title}</h1>
                </div>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 lg:px-10 py-4 border-b border-slate-100 bg-slate-50 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span className="font-medium">{lesson.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="material-symbols-outlined text-base">folder</span>
              <span className="font-medium truncate">{lesson.categoryName}</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
            {paragraphs.length > 0 ? (
              <div className="prose prose-slate max-w-none">
                {paragraphs.map((para, i) => {
                  if (/^\d+\./.test(para.trim())) {
                    return (
                      <div key={i} className="flex gap-3 sm:gap-4 mb-4 p-3 sm:p-4 bg-slate-50 rounded-xl">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-sm">
                          {para.trim().match(/^(\d+)\./)?.[1]}
                        </div>
                        <p className="text-slate-700 leading-relaxed flex-1 m-0 text-sm sm:text-base">{para.trim().replace(/^\d+\.\s*/, '')}</p>
                      </div>
                    );
                  }
                  return <p key={i} className="text-slate-700 leading-relaxed mb-5 text-sm sm:text-base lg:text-lg">{para}</p>;
                })}
              </div>
            ) : lesson.type !== 'video' && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">description</span>
                <p className="text-slate-500 text-sm sm:text-base">Bu dars uchun kontent hali qo'shilmagan.</p>
              </div>
            )}

            <div className="mt-8 p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl border border-amber-100">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <span className="material-symbols-outlined text-xl sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-lg">Maslahat</h4>
                  <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">Darsni o'qib bo'lgach, o'rgangan bilimlaringizni amalda qo'llashga harakat qiling.</p>
                </div>
              </div>
            </div>
          </div>
        </article>


        {/* Complete Button */}
        <button
          onClick={handleComplete}
          className={`w-full mt-6 sm:mt-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all ${
            isCompleted 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : "'FILL' 0" }}>
            {isCompleted ? 'check_circle' : 'task_alt'}
          </span>
          {isCompleted ? 'Bajarildi ✓' : 'Bajardim'}
        </button>

        {/* Navigation */}
        <div className="mt-4 sm:mt-6 grid sm:grid-cols-2 gap-3 sm:gap-4">
          {lesson.prevLesson && (
            <Link to={`/dars/${lesson.prevLesson.id}`} className="group flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-slate-500 mb-0.5">Oldingi dars</p>
                <p className="font-bold text-slate-900 truncate text-sm sm:text-base">{lesson.prevLesson.title}</p>
              </div>
            </Link>
          )}
        </div>
      </main>
      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span className="text-sm font-medium">Havola nusxalandi!</span>
        </div>
      )}
    </div>
  );
}



