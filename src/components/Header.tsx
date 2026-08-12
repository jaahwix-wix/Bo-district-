import React from 'react';
import { TabType } from '../types';
import { User } from 'firebase/auth';
import { 
  Building2, 
  FileText, 
  MapPin, 
  Calculator, 
  Briefcase, 
  Bell, 
  Bot, 
  ShieldCheck, 
  PhoneCall, 
  CheckCircle2,
  Menu,
  X,
  Users,
  DollarSign,
  Award,
  Calendar,
  User as UserIcon,
  Lock
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  currentUser: User | null;
  userRole: 'citizen' | 'officer' | 'admin';
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  setIsAdmin,
  currentUser,
  userRole,
  onOpenAuth
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Overview', icon: <Building2 className="w-4 h-4" /> },
    { id: 'citizens', label: 'Citizens', icon: <Users className="w-4 h-4" /> },
    { id: 'revenue', label: 'Revenue & Receipts', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'licences', label: 'Licences & Permits', icon: <Award className="w-4 h-4" /> },
    { id: 'report', label: 'Report Issue', icon: <FileText className="w-4 h-4" /> },
    { id: 'chiefdoms', label: 'Chiefdoms & Wards', icon: <MapPin className="w-4 h-4" /> },
    { id: 'tax', label: 'Pay Taxes & Rates', icon: <Calculator className="w-4 h-4" /> },
    { id: 'projects', label: 'DevTracker', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'notices', label: 'Notices & Events', icon: <Calendar className="w-4 h-4" /> },
    { id: 'assistant', label: 'AI Assistant', icon: <Bot className="w-4 h-4" /> },
  ];

  const handleOfficerToggle = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const nextAdminState = !isAdmin;
    setIsAdmin(nextAdminState);
    if (nextAdminState) {
      setActiveTab('admin');
    } else {
      setActiveTab('home');
    }
  };

  return (
    <header className="bg-emerald-950 text-white shadow-lg sticky top-0 z-50 border-b border-emerald-800/50">
      {/* Top Banner with Emergency Numbers & Officer Switcher */}
      <div className="bg-emerald-900/90 text-emerald-100 text-xs px-4 py-1.5 border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-emerald-200/90">
            <span className="flex items-center gap-1 font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              Council Toll-Free: <strong className="text-white">+232 76 600 300</strong>
            </span>
            <span className="hidden sm:inline text-emerald-700">|</span>
            <span className="hidden sm:inline">District Emergency Health: <strong className="text-white">117</strong></span>
            <span className="hidden md:inline text-emerald-700">|</span>
            <span className="hidden md:inline">Bo Central Police: <strong className="text-white">112</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {/* Firebase Auth Button */}
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/50 transition-colors"
              id="header-auth-btn"
            >
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="User" className="w-3.5 h-3.5 rounded-full" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
              )}
              {currentUser ? (
                <span>{currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0] || 'Account'} <span className="opacity-75">({userRole})</span></span>
              ) : (
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  Sign In (Credentials & Auth)
                </span>
              )}
            </button>

            <button
              onClick={handleOfficerToggle}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isAdmin 
                  ? 'bg-amber-500 text-emerald-950 hover:bg-amber-400' 
                  : 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700 border border-emerald-600/50'
              }`}
              id="header-officer-toggle-btn"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAdmin ? 'Officer Portal Mode (Active)' : 'Switch to Officer Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          {/* Custom District Seal */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-0.5 shadow-md flex items-center justify-center border border-amber-400/40 shrink-0">
            <div className="w-full h-full bg-emerald-950 rounded-[10px] flex flex-col items-center justify-center p-1 text-center">
              <span className="text-[10px] font-black text-amber-400 tracking-wider">BDC</span>
              <div className="w-5 h-0.5 bg-emerald-400 my-0.5 rounded-full"></div>
              <span className="text-[7px] text-emerald-300 font-bold uppercase">BO SL</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white leading-tight">
                Bo District Council
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-800/80 text-[11px] font-medium text-amber-300 border border-emerald-700">
                Southern Province, Sierra Leone
              </span>
            </div>
            <p className="text-xs text-emerald-300/90 font-normal">
              Local Government Digital Gateway • Cloud SQL & Firebase Auth Enforced
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-emerald-900/60 p-1 rounded-xl border border-emerald-800/60">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-amber-500 text-emerald-950 font-semibold shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white'
                }`}
                id={`nav-btn-${item.id}`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth();
                } else {
                  setActiveTab('admin');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-400 text-emerald-950 shadow-sm'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              }`}
              id="nav-btn-admin"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Officer Dashboard
            </button>
          )}
        </nav>

        {/* Mobile menu toggle button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
          id="header-mobile-menu-toggle"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-900 border-t border-emerald-800 px-4 py-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                activeTab === item.id
                  ? 'bg-amber-500 text-emerald-950 font-semibold'
                  : 'text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth();
                } else {
                  setActiveTab('admin');
                }
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-amber-400 text-emerald-950'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Officer Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
};
