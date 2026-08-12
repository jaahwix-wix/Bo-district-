import React, { useState, useEffect } from 'react';
import { TabType } from '../types';
import { 
  Building2, 
  Users, 
  Calculator, 
  FileText, 
  Bot, 
  Download, 
  X, 
  Smartphone, 
  WifiOff,
  DollarSign
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Detect offline/online network status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for PWA Install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install on iOS: Tap the Share button in Safari, then select "Add to Home Screen".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const navItems = [
    { id: 'home' as TabType, label: 'Home', icon: <Building2 className="w-5 h-5" /> },
    { id: 'citizens' as TabType, label: 'Citizens', icon: <Users className="w-5 h-5" /> },
    { id: 'tax' as TabType, label: 'Pay Tax', icon: <Calculator className="w-5 h-5" />, highlight: true },
    { id: 'report' as TabType, label: 'Report', icon: <FileText className="w-5 h-5" /> },
    { id: 'assistant' as TabType, label: 'Assistant', icon: <Bot className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Offline Status Badge */}
      {isOffline && (
        <div className="fixed top-0 inset-x-0 bg-amber-600 text-white text-[11px] font-bold text-center py-1 z-[60] flex items-center justify-center gap-1 shadow">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active • Saved data available</span>
        </div>
      )}

      {/* Mobile App Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-16 inset-x-3 bg-gradient-to-r from-emerald-950 to-slate-900 border border-amber-400/50 text-white p-3.5 rounded-2xl shadow-2xl z-40 lg:hidden flex items-center justify-between gap-3 animate-bounce-short">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-emerald-950 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-300">Install Bo Council App</h4>
              <p className="text-[10px] text-emerald-200">Add to homescreen for fast offline mobile access</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs rounded-xl shadow flex items-center gap-1"
              id="mobile-pwa-install-btn"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-emerald-950 border-t border-emerald-800/80 z-50 lg:hidden px-2 py-1 shadow-2xl">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] ${
                  isActive
                    ? 'bg-amber-500 text-emerald-950 font-black shadow'
                    : item.highlight
                    ? 'text-amber-300 hover:text-amber-200'
                    : 'text-emerald-200/90 hover:text-white'
                }`}
                id={`mobile-nav-${item.id}`}
              >
                <div className="relative">
                  {item.icon}
                  {item.highlight && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                  )}
                </div>
                <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
