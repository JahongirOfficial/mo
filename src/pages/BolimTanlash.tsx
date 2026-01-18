import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sectionsAPI } from '../api';

interface Section {
  id: string;
  name: string;
  icon: string;
  color: string;
  orderIndex: number;
  status: 'active' | 'pause';
  categoryCount: number;
}

// Realtime countdown hook
function useSubscriptionCountdown(endDate: string | null | undefined) {
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    if (!endDate) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [endDate]);
  
  return useMemo(() => {
    if (!endDate) return null;
    const end = new Date(endDate).getTime();
    const diff = end - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, expired: false };
  }, [endDate, now]);
}

export function BolimTanlash() {
  const { user, isAdmin, isSubscribed, subscription, logout } = useAuth();
  const countdown = useSubscriptionCountdown(subscription?.subscriptionEndDate);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pausedSectionName, setPausedSectionName] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const res = await sectionsAPI.getAll();
      setSections(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-display">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/uploads/logo/gr.png" alt="Logo" className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl object-cover" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-[0.3em] sm:tracking-[0.35em] lg:tracking-[0.4em] ml-[2px]">mukammal</span>
                <span className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent -mt-1">OTA-ONA</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium transition-colors text-sm">
                  <span className="material-symbols-outlined text-lg sm:text-xl">admin_panel_settings</span>
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              {!isAdmin && (countdown || subscription) && (
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs sm:text-sm ${
                  countdown?.expired || (subscription?.daysLeft ?? 0) <= 0 ? 'bg-red-100 text-red-700' :
                  (countdown?.days ?? subscription?.daysLeft ?? 0) <= 3 ? 'bg-red-100 text-red-700' :
                  (countdown?.days ?? subscription?.daysLeft ?? 0) <= 5 ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  <span className="material-symbols-outlined text-base">schedule</span>
                  {countdown ? (
                    countdown.expired ? (
                      <span>Muddat tugadi</span>
                    ) : countdown.days > 0 ? (
                      <span>{countdown.days}k {countdown.hours}s {countdown.minutes}d</span>
                    ) : (
                      <span>{countdown.hours}s {countdown.minutes}d</span>
                    )
                  ) : (
                    <span>{subscription?.daysLeft} kun qoldi</span>
                  )}
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="p-2.5 sm:p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Chiqish"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10">
              <h1 className="text-lg sm:text-xl font-bold mb-1">Xush kelibsiz, {user?.fullName?.split(' ')[0]}!</h1>
              <p className="text-emerald-50 text-sm">Farzandlaringizni dunyo darajasiga olib chiqamiz</p>
            </div>
          </div>
        </div>

        {/* Bo'limlar */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 mb-4"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="material-symbols-outlined text-4xl sm:text-5xl text-slate-300">folder_off</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Hali bo'limlar yo'q</h3>
            <p className="text-sm sm:text-base text-slate-500 mb-6">Bo'limlar qo'shilgandan keyin bu yerda ko'rinadi</p>
            {isAdmin && (
              <Link to="/admin/bolimlar" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                <span className="material-symbols-outlined">add</span>
                Bo'lim qo'shish
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)).map((section, index) => {
              const isPaused = section.status === 'pause' && !isAdmin;
              const prevSection = sections.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))[index - 1];
              
              const handleClick = (e: React.MouseEvent) => {
                // Obunasi yo'q bo'lsa subscription modal ochilsin
                if (!isSubscribed && !isAdmin) {
                  e.preventDefault();
                  setShowSubscriptionModal(true);
                  return;
                }
                if (isPaused) {
                  e.preventDefault();
                  setPausedSectionName(prevSection?.name || 'oldingi bo\'lim');
                  setShowPauseModal(true);
                }
              };
              
              return (
                <Link
                  key={section.id}
                  to={isPaused ? '#' : `/kategoriya/${section.id}`}
                  onClick={handleClick}
                  className={`group relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all duration-300 ${
                    isPaused 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1'
                  }`}
                >
                  {/* Lock Badge */}
                  {isPaused && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400 text-lg">lock</span>
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center text-white shadow-md mb-4 ${
                    isPaused ? 'grayscale' : 'group-hover:scale-110'
                  } transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-2xl">{isPaused ? 'lock' : section.icon}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-1">
                    <h3 className={`font-bold text-base transition-colors ${
                      isPaused ? 'text-slate-500' : 'text-slate-800 group-hover:text-emerald-600'
                    }`}>
                      {section.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {section.categoryCount} ta kategoriya
                    </p>
                  </div>
                  
                  {/* Arrow */}
                  {!isPaused && (
                    <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                      <span className="material-symbols-outlined text-emerald-600 text-lg">arrow_forward</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowPauseModal(false)} />
          <div className="relative bg-white rounded-2xl sm:rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-center animate-scale-in">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <span className="material-symbols-outlined text-3xl sm:text-4xl text-white">lock</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">Bo'lim qulflangan</h3>
            <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 leading-relaxed">
              Bu bo'limni ochish uchun avval <span className="font-bold text-slate-900">"{pausedSectionName}"</span> bo'limini tugatishingiz kerak.
            </p>
            <button
              onClick={() => setShowPauseModal(false)}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowSubscriptionModal(false)} />
          <div className="relative bg-white rounded-2xl sm:rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl animate-scale-in">
            <button onClick={() => setShowSubscriptionModal(false)} className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            
            <div className="text-center mb-5 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="material-symbols-outlined text-3xl sm:text-4xl text-white">workspace_premium</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Obuna talab qilinadi</h3>
              <p className="text-sm sm:text-base text-slate-500">Darslarga kirish uchun oylik obunani faollashtiring</p>
            </div>

            {/* Price Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 sm:p-6 text-white text-center mb-4 shadow-lg">
              <p className="text-emerald-100 text-xs sm:text-sm mb-2">Oylik obuna narxi</p>
              <p className="text-3xl sm:text-4xl font-bold mb-1">50,000 so'm</p>
              <p className="text-emerald-100 text-xs sm:text-sm">Barcha darslar va materiallar</p>
            </div>

            {/* Card Number */}
            <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-500 text-xs sm:text-sm font-medium">To'lov uchun karta raqami:</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText('5614682714165471');
                    // Toast notification qo'shish mumkin
                  }}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Nusxalash"
                >
                  <span className="material-symbols-outlined text-lg">content_copy</span>
                </button>
              </div>
              <p className="font-bold text-slate-900 text-lg sm:text-xl tracking-wider">5614 6827 1416 5471</p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">Hakimov Javohir</p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-blue-600 text-xl shrink-0">info</span>
                <div>
                  <p className="text-sm text-blue-900 font-medium mb-1">To'lov qilgandan keyin:</p>
                  <p className="text-xs text-blue-700">Telegram orqali admin bilan bog'laning va chek rasmini yuboring</p>
                </div>
              </div>
            </div>

            {/* Telegram Button */}
            <a
              href="https://t.me/mukammal_tarbiya"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 sm:py-4 bg-[#0088cc] text-white rounded-xl font-semibold hover:bg-[#0077b5] transition-all mb-3 shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              Admin bilan bog'lanish
            </a>
            
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="w-full py-2.5 sm:py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all text-sm"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
