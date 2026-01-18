import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAiChat } from '../App';

interface Problem {
  id: number;
  icon: string;
  title: string;
  solution: string;
  category: 'texnologiya' | 'xulq' | 'talim' | 'salomatlik' | 'muloqot';
}

const problems: Problem[] = [
  {
    id: 1,
    icon: 'smartphone',
    title: 'Bola telefonga yopishib qolgan, nima qilish kerak?',
    solution: 'Avval o\'zingiz telefonni qo\'ying. Bola sizdan ko\'radi. Keyin unga "telefon o\'rniga" qiziqarliroq mashg\'ulot (to\'p, kitob, mehnat) topib bering.',
    category: 'texnologiya'
  },
  {
    id: 2,
    icon: 'block',
    title: 'Gapimga quloq solmaydi, "yo\'q" deydi.',
    solution: 'Buyruq bermang, iltimos qiling. "Tur, buni qil" emas, "Menga yordamvor bo\'la olasanmi?" deb ko\'ring.',
    category: 'xulq'
  },
  {
    id: 3,
    icon: 'menu_book',
    title: 'O\'qishga qiziqishi yo\'q, kitob ko\'rsa uyqusi keladi.',
    solution: 'Kitobni u bilan birga o\'qing. Siz o\'qib turing, u tinglasin. "Nima bo\'larkin?" deb qiziqtirib qo\'ying.',
    category: 'talim'
  },
  {
    id: 4,
    icon: 'child_care',
    title: 'Juda erka, hamma narsani xohlaydi.',
    solution: '"Yo\'q" deyishni o\'rganing. Hamma xohishini bajarish – bolaga yaxshilik emas. Ba\'zida yetishmovchilik ham tarbiya beradi.',
    category: 'xulq'
  },
  {
    id: 5,
    icon: 'sentiment_dissatisfied',
    title: 'Yolg\'on gapirishni boshladi.',
    solution: 'To\'g\'risini aytganida urshmang. "Rostini aytsang hammasini kechiraman" deng va so\'zingizda turing. Qatig\'qo\'llik yolg\'onchilikka yetaklaydi.',
    category: 'xulq'
  },
  {
    id: 6,
    icon: 'psychology_alt',
    title: 'O\'ziga ishonchi past, uyatchan.',
    solution: 'Kichik ishlarda ham maqtang. "Sen eplaysan, sendan zo\'ri yo\'q" deb ruhlantiring. Xato qilsa, kulmang.',
    category: 'muloqot'
  },
  {
    id: 7,
    icon: 'airline_seat_recline_extra',
    title: 'Bolam juda dangasa, hech ish qilgisi kelmaydi.',
    solution: 'Ishni birga qiling. "Men supiraman, sen changni artasan" deng. Mehnatni jazo emas, o\'yin deb biling.',
    category: 'xulq'
  },
  {
    id: 8,
    icon: 'record_voice_over',
    title: 'Ko\'chadan yomon gaplar o\'rganib kelayapti.',
    solution: 'Uyda madaniyatli bo\'ling. "Bu so\'z bizga to\'g\'ri kelmaydi, bu yomon odamning gapi" deb tushuntiring.',
    category: 'muloqot'
  },
  {
    id: 9,
    icon: 'groups',
    title: 'Oka-uka (opa-singil) doim urishadi.',
    solution: 'Birini ikkinchisiga maqtab, birini kamsitmang. "Sen kattasan, yo\'l ber" demang, adolatli bo\'ling.',
    category: 'muloqot'
  },
  {
    id: 10,
    icon: 'restaurant',
    title: 'Ovqat tanlaydi, faqat "fast-fud" yeydi.',
    solution: 'Och qolsa, hamma narsani yeydi. Stolga nima qo\'yilsa, shu – bo\'lmasam och qoladi. Qattiq turing.',
    category: 'salomatlik'
  },
  {
    id: 11,
    icon: 'alarm',
    title: 'Ertalab turishga qiynaladi.',
    solution: 'Kechasi vaqtli yotqizing. Kechki 9-10 dan keyin uyda "chiroq o\'chsin", hamma dam olsin.',
    category: 'salomatlik'
  },
  {
    id: 12,
    icon: 'payments',
    title: 'Pulni qadriga yetmaydi, isrof qiladi.',
    solution: 'Unga ma\'lum miqdorda "cho\'ntak puli" bering va oylik reja qilishni o\'rgating. Tugab qolsa, qaytib bermang.',
    category: 'talim'
  },
  {
    id: 13,
    icon: 'clean_hands',
    title: 'Tishini yuvmaydi yoki gigiyenaga amal qilmaydi.',
    solution: 'Birgalikda yuving. "Kim tishini oppoq qilar ekan?" deb musobaqa o\'ynang.',
    category: 'salomatlik'
  },
  {
    id: 14,
    icon: 'mood_bad',
    title: 'Bolam juda asabiy, tez jahl qiladi.',
    solution: 'Siz xotirjam bo\'ling. U baqirsa, siz pichirlab gapiring. Bolaning jahli sizning aksingiz bo\'lishi mumkin.',
    category: 'xulq'
  },
  {
    id: 15,
    icon: 'person_off',
    title: 'Boshqa bolalarga qo\'shilmaydi, do\'sti kam.',
    solution: 'Ko\'proq mehmonga boring va uyga mehmon chaqiring. Muloqotni o\'rgating.',
    category: 'muloqot'
  },
  {
    id: 16,
    icon: 'sports_soccer',
    title: 'Sport bilan shug\'ullanishni xohlamaydi.',
    solution: 'Yoniga tushing. Birga yuguring yoki turnikda tortiling. "Dadasi/oyisi bilan musobaqa" – eng zo\'r motivatsiya.',
    category: 'salomatlik'
  },
  {
    id: 17,
    icon: 'forum',
    title: 'Kattalarga gap qaytaradi.',
    solution: 'Hurmatni talab qilmang, ko\'rsating. Siz ota-onangizga qanday bo\'lsangiz, u ham shunday bo\'ladi.',
    category: 'muloqot'
  },
  {
    id: 18,
    icon: 'error_outline',
    title: 'Xatosini bo\'yniga olmaydi, birovni ayblaydi.',
    solution: '"Xato qilish – ayb emas, tan olmaslik – ayb" deb tushuntiring. O\'zingiz xato qilsangiz, boladan uzr so\'rashdan qo\'rqmang.',
    category: 'xulq'
  },
  {
    id: 19,
    icon: 'bedtime',
    title: 'Kechasi kech yotadi.',
    solution: 'Uyqudan 2 soat oldin ekranlarni (TV, telefon) o\'chiring. Chiroqni pasaytiring, muhit yarating.',
    category: 'salomatlik'
  },
  {
    id: 20,
    icon: 'diversity_3',
    title: 'Meni tushunmaydi, "zamonaviy" bo\'lib ketgan.',
    solution: 'Uning dunyosiga kiring. Qiziqishlarini so\'rang, u eshitadigan musiqani birga eshiting. Do\'st bo\'ling.',
    category: 'muloqot'
  }
];

const categoryColors = {
  texnologiya: { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  xulq: { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  talim: { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  salomatlik: { bg: 'from-rose-500 to-rose-600', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  muloqot: { bg: 'from-amber-500 to-amber-600', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' }
};

const categoryNames = {
  texnologiya: 'Texnologiya',
  xulq: 'Xulq-atvor',
  talim: 'Ta\'lim',
  salomatlik: 'Salomatlik',
  muloqot: 'Muloqot'
};

export function MuammolarVaYechimlar() {
  const { logout } = useAuth();
  const { openChatWithMessage } = useAiChat();
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleAiChat = () => {
    if (selectedProblem) {
      const message = `${selectedProblem.title}\n\nMen bu muammo bo'yicha batafsil maslahat olmoqchiman. Nima qilishim kerak?`;
      openChatWithMessage(message);
      setSelectedProblem(null);
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || problem.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-display">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/bolim" className="flex items-center gap-2 sm:gap-3">
              <img src="/uploads/logo/gr.png" alt="Logo" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-[0.3em] ml-[2px]">mukammal</span>
                <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent -mt-1">OTA-ONA</span>
              </div>
            </Link>
            
            <div className="flex items-center gap-2">
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
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 sm:p-8 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">lightbulb</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">20 ta Dolzarb Muammo va Yechimlar</h1>
                <p className="text-emerald-50 text-sm">Tez yordam: O'z muammongizni toping va yechimni o'qing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-emerald-500 outline-none transition-all text-slate-900"
              placeholder="Muammoni qidiring..."
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Barchasi ({problems.length})
            </button>
            {Object.entries(categoryNames).map(([key, name]) => {
              const count = problems.filter(p => p.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    selectedCategory === key
                      ? `bg-gradient-to-r ${categoryColors[key as keyof typeof categoryColors].bg} text-white shadow-md`
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Problems Grid */}
        {filteredProblems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Muammo topilmadi</h3>
            <p className="text-slate-500">Boshqa so'z bilan qidirib ko'ring</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProblems.map((problem) => {
              const colors = categoryColors[problem.category];
              return (
                <button
                  key={problem.id}
                  onClick={() => setSelectedProblem(problem)}
                  className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-emerald-200 transition-all text-left"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                    <span className="material-symbols-outlined text-2xl">{problem.icon}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {problem.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-lg ${colors.light} ${colors.text} font-medium`}>
                      {categoryNames[problem.category]}
                    </span>
                    <span className="material-symbols-outlined text-emerald-500 text-lg group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-2xl">info</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Eslatma</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                <strong>Tarbiya</strong> – bu gapirish emas, <strong>o'rnak bo'lish</strong>. Besh barmoq barobar emas, bolangizni boshqalarga solishtirmang. Uning qobiliyati nimaga bo'lsa, o'shani rivojlantiring. Eng asosiysi – <strong>mehrni ayamang</strong>.
              </p>
              <p className="text-xs text-slate-600 italic">
                💡 Bola shakar kabi bo'lishi kerak – ko'p bo'lsa "diabet" qiladi (erka bo'ladi), kam bo'lsa "taxir" bo'ladi (mehrsiz bo'ladi). Me'yorni ushlang.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Solution Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedProblem(null)} />
          <div className="relative bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            {/* Header */}
            <div className={`bg-gradient-to-br ${categoryColors[selectedProblem.category].bg} p-6 sm:p-8 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <button 
                onClick={() => setSelectedProblem(null)}
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-3xl">{selectedProblem.icon}</span>
                </div>
                <div className="flex-1">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium mb-3 ${categoryColors[selectedProblem.category].light} ${categoryColors[selectedProblem.category].text}`}>
                    {categoryNames[selectedProblem.category]}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold leading-tight">{selectedProblem.title}</h2>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Amaliy Yechim:</h3>
                  <p className="text-slate-700 leading-relaxed">{selectedProblem.solution}</p>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-2xl shrink-0">psychology</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 mb-3">
                      Yana savollaringiz bormi? AI yordamchimiz bilan suhbatlashing!
                    </p>
                    <button
                      onClick={handleAiChat}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-all text-sm"
                    >
                      <span className="material-symbols-outlined text-lg">chat</span>
                      AI bilan suhbat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
