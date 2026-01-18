import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Global o'zgaruvchi - event'ni saqlash
let deferredPromptGlobal: BeforeInstallPromptEvent | null = null;

// Event'ni oldindan ushlash
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPromptGlobal = e as BeforeInstallPromptEvent;
  });
}

export function PwaInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // PWA allaqachon o'rnatilganmi tekshirish
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    const isDismissed = localStorage.getItem('pwaInstallDismissed');
    
    if (isStandalone || isDismissed) {
      return;
    }

    // iOS tekshirish
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Banner'ni ko'rsatish
    setShowBanner(true);
  }, []);

  const handleInstall = async () => {
    if (deferredPromptGlobal) {
      // Chrome/Edge/Android - o'rnatish dialogini chiqarish
      // Brauzer xavfsizlik sababli dialog majburiy
      deferredPromptGlobal.prompt();
      
      // Natijani kutish
      deferredPromptGlobal.userChoice.then(({ outcome }) => {
        if (outcome === 'accepted') {
          setShowBanner(false);
          localStorage.setItem('pwaInstallDismissed', 'true');
        }
        deferredPromptGlobal = null;
      });
    } else if (isIOS) {
      // iOS uchun modal ko'rsatish
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwaInstallDismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-xl shrink-0">download</span>
            <p className="text-sm font-medium truncate">Ilovani o'rnating</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-white text-emerald-600 rounded-lg font-semibold text-xs hover:bg-emerald-50 transition-colors"
            >
              O'rnatish
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      </div>

      {/* iOS Install Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowIOSModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-emerald-600">download</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Ilovani o'rnatish</h3>
              <div className="text-left space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <p>Pastdagi <strong>"Ulashish"</strong> tugmasini bosing</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <p><strong>"Bosh ekranga qo'shish"</strong> ni tanlang</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}
    </>
  );
}
