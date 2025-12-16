import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = `http://${window.location.hostname}:3001/api`;

export function BoshSahifa() {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({ fullName: '', phone: '+998' });
  const [leadSending, setLeadSending] = useState(false);
  const [leadSent, setLeadSent] = useState(false);

  useEffect(() => {
    // Token bo'lmasa 1 soniyadan keyin modal ochilsin
    const token = localStorage.getItem('token');
    const leadSubmitted = localStorage.getItem('leadSubmitted');
    
    if (!token && !leadSubmitted) {
      const timer = setTimeout(() => {
        setShowLeadModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leadForm.fullName.trim().length < 3 || leadForm.phone.length < 13) return;
    
    setLeadSending(true);
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm)
      });
      
      if (res.ok) {
        setLeadSent(true);
        localStorage.setItem('leadSubmitted', 'true');
        setTimeout(() => {
          setShowLeadModal(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLeadSending(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Faqat +998 bilan boshlansin va raqamlar bo'lsin
    if (!value.startsWith('+998')) {
      value = '+998';
    }
    // Faqat raqamlar va + belgisi
    const cleaned = '+998' + value.slice(4).replace(/\D/g, '');
    if (cleaned.length <= 13) {
      setLeadForm({ ...leadForm, phone: cleaned });
    }
  };
  const features = [
    { icon: 'psychology', title: 'Psixolog maslahatlari', desc: 'Malakali mutaxassislardan yordam', color: 'from-emerald-500 to-emerald-600' },
    { icon: 'play_circle', title: 'Video darslar', desc: 'Interaktiv video kurslar', color: 'from-emerald-500 to-emerald-600' },
    { icon: 'menu_book', title: 'Foydali maqolalar', desc: 'Ilmiy asoslangan materiallar', color: 'from-emerald-500 to-emerald-600' },
    { icon: 'groups', title: 'Ota-onalar jamoasi', desc: 'Tajriba almashish', color: 'from-emerald-500 to-emerald-600' },
  ];

  const categories = [
    { icon: 'psychology', title: 'Xulq-atvor', desc: 'Injiqlik, agressiya, qaysarlik', lessons: 15, color: 'bg-emerald-500' },
    { icon: 'school', title: "Ta'lim va Maktab", desc: "O'qishga qiziqish, uy vazifasi", lessons: 12, color: 'bg-emerald-600' },
    { icon: 'favorite', title: 'Psixologiya', desc: "Qo'rquvlar, ishonch, his-tuyg'ular", lessons: 18, color: 'bg-teal-500' },
    { icon: 'forum', title: 'Muloqot', desc: 'Samarali suhbat, tinglash', lessons: 10, color: 'bg-emerald-500' },
    { icon: 'fact_check', title: 'Intizom', desc: 'Tartib, javobgarlik', lessons: 8, color: 'bg-green-600' },
    { icon: 'fitness_center', title: 'Salomatlik', desc: 'Ovqatlanish, uyqu, sport', lessons: 14, color: 'bg-teal-600' },
  ];

  const testimonials = [
    { name: 'Malika Karimova', role: "2 farzand onasi", text: "Bu platforma orqali farzandlarim bilan munosabatlarim tubdan o'zgardi. Har bir dars hayotiy va amaliy.", avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Azizbek Tursunov', role: "3 farzand otasi", text: "Video darslar juda tushunarli. Endi bolalarim bilan muloqot qilish osonlashdi.", avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Nilufar Rahimova', role: "1 farzand onasi", text: "Psixolog maslahatlari juda foydali. Bolam maktabga qiziqib boradi endi.", avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  ];

  const stats = [
    { value: '10,000+', label: "Foydalanuvchilar" },
    { value: '150+', label: "Video darslar" },
    { value: '50+', label: "Mutaxassislar" },
    { value: '98%', label: "Ijobiy fikrlar" },
  ];

  return (
    <div className="min-h-screen bg-white font-display">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-xl sm:text-2xl lg:text-3xl">family_star</span>
              </div>
              <div>
                <span className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">Mukammal Ota Ona</span>
                <p className="text-xs text-slate-500 hidden sm:block">Farzand tarbiyasi platformasi</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-primary transition-colors font-medium">Imkoniyatlar</a>
              <a href="#categories" className="text-slate-600 hover:text-primary transition-colors font-medium">Kategoriyalar</a>
              <a href="#testimonials" className="text-slate-600 hover:text-primary transition-colors font-medium">Fikrlar</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/kirish" className="hidden sm:flex px-4 py-2 text-slate-700 hover:text-primary font-medium transition-colors text-sm">
                Kirish
              </Link>
              <Link to="/kirish" className="px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all text-sm sm:text-base">
                Boshlash
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-20 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6">
                <span className="material-symbols-outlined text-lg">verified</span>
                #1 Ota-onalik platformasi O'zbekistonda
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 leading-tight mb-4 sm:mb-6">
                Farzand tarbiyasida 
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent"> ishonchli </span>
                yordamchingiz
              </h1>
              <p className="text-sm sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                Zamonaviy ilm va milliy qadriyatlar asosida mukammal ota-ona bo'ling. 150+ video darslar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link to="/kirish" className="group px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2">
                  Bepul boshlash
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-lg sm:text-2xl">arrow_forward</span>
                </Link>
                <a href="#features" className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-slate-700 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg border-2 border-slate-200 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg sm:text-2xl">play_circle</span>
                  Video ko'rish
                </a>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-slate-200">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&h=700&fit=crop" 
                  alt="Ona va bola" 
                  className="rounded-3xl shadow-2xl shadow-slate-900/20"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 z-20 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900">98% natija</p>
                  <p className="text-sm text-slate-500">Ijobiy o'zgarish</p>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 z-20 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900">150+ darslar</p>
                  <p className="text-sm text-slate-500">Video va maqolalar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-12 sm:py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">Imkoniyatlar</span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mt-2 mb-3 sm:mb-4">Nima uchun bizni tanlashadi?</h2>
            <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto">Platformamiz sizga eng yaxshi tajriba va bilimlarni taqdim etadi</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {features.map((f, i) => (
              <div key={i} className="group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-3 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <span className="material-symbols-outlined text-xl sm:text-3xl">{f.icon}</span>
                </div>
                <h3 className="text-sm sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">{f.title}</h3>
                <p className="text-slate-600 text-xs sm:text-base">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-12 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">Kategoriyalar</span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mt-2 mb-3 sm:mb-4">Muammo kategoriyalari</h2>
            <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto">Bolalar tarbiyasidagi eng ko'p uchraydigan muammolar</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {categories.map((cat, i) => (
              <div key={i} className="group relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 overflow-hidden">
                <div className={`absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 ${cat.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${cat.color} flex items-center justify-center text-white mb-3 sm:mb-5 shadow-lg`}>
                  <span className="material-symbols-outlined text-lg sm:text-2xl">{cat.icon}</span>
                </div>
                <h3 className="text-sm sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">{cat.title}</h3>
                <p className="text-slate-600 mb-2 sm:mb-4 text-xs sm:text-base line-clamp-2">{cat.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-500">{cat.lessons} ta dars</span>
                  <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform text-lg sm:text-2xl">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 sm:mt-12">
            <Link to="/kirish" className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-slate-800 transition-colors text-sm sm:text-base">
              Barcha kategoriyalar
              <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-12 sm:py-20 lg:py-32 bg-gradient-to-br from-emerald-500 to-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-emerald-200 font-semibold text-xs sm:text-sm uppercase tracking-wider">Fikrlar</span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mt-2 mb-3 sm:mb-4">Foydalanuvchilar nima deydi?</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/20">
                <div className="flex items-center gap-0.5 text-yellow-400 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="material-symbols-outlined text-base sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-white/90 text-sm sm:text-lg mb-4 sm:mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-white text-sm sm:text-base">{t.name}</p>
                    <p className="text-emerald-200 text-xs sm:text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6">Bugun boshlang!</h2>
          <p className="text-sm sm:text-xl text-slate-600 mb-6 sm:mb-10">Minglab ota-onalar allaqachon farzandlari bilan munosabatlarini yaxshilashdi.</p>
          <Link to="/kirish" className="inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-10 sm:py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-xl hover:shadow-2xl hover:shadow-primary/30 transition-all">
            Bepul ro'yxatdan o'tish
            <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLeadModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <button 
              onClick={() => setShowLeadModal(false)} 
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            
            {leadSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-emerald-600">check_circle</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Rahmat!</h3>
                <p className="text-slate-600">Tez orada siz bilan bog'lanamiz</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-2xl text-white">family_star</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Bepul maslahat oling!</h3>
                  <p className="text-slate-600 text-sm">Ma'lumotlaringizni qoldiring, mutaxassislarimiz siz bilan bog'lanadi</p>
                </div>
                
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ism Familiya</label>
                    <input
                      type="text"
                      value={leadForm.fullName}
                      onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                      placeholder="Ismingizni kiriting"
                      required
                      minLength={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefon raqam</label>
                    <input
                      type="tel"
                      value={leadForm.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                      placeholder="+998 90 123 45 67"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={leadSending || leadForm.fullName.length < 3 || leadForm.phone.length < 13}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {leadSending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Yuborilmoqda...
                      </span>
                    ) : (
                      'Yuborish'
                    )}
                  </button>
                </form>
                
                <p className="text-xs text-slate-500 text-center mt-4">
                  Yuborish tugmasini bosish orqali siz shaxsiy ma'lumotlaringizni qayta ishlashga rozilik bildirasiz
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">family_star</span>
                </div>
                <span className="text-lg sm:text-xl font-bold">Mukammal Ota Ona</span>
              </div>
              <p className="text-slate-400 max-w-md text-sm sm:text-base">Zamonaviy ilm va milliy qadriyatlar asosida farzand tarbiyasi platformasi.</p>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Sahifalar</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Bosh sahifa</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kategoriyalar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Narxlar</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Bog'lanish</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>info@mukammal.uz</li>
                <li>+998 90 123 45 67</li>
                <li>Toshkent</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 sm:pt-8 text-center text-slate-500 text-xs sm:text-sm">
            <p>© 2024 Mukammal Ota Ona</p>
          </div>
        </div>
      </footer>
    </div>
  );
}




