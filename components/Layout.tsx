import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  Settings, 
  Plus, 
  WalletCards, 
  Users, 
  LogOut, 
  UploadCloud, 
  BookOpen, 
  Smartphone, 
  Maximize2, 
  Wifi, 
  BatteryMedium,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { api } from '../services/storage';
import { User } from '../types';
import { clsx } from 'clsx';
import { IOSSheet } from './ui';

export const Layout = ({ children, onLogout }: { children?: React.ReactNode, onLogout: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isIPhoneFrameEnabled, setIsIPhoneFrameEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState('9:41');
  
  useEffect(() => {
    let isMounted = true;
    const refreshUser = async () => {
      try {
        const u = await api.auth.getUser();
        if (isMounted) setUser(u);
      } catch (e) {
        console.warn("Layout user fetch aborted");
      }
    };
    refreshUser();
    return () => { isMounted = false; };
  }, [location]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours % 12 || 12}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const isDashboardMode = user && user.isOnboarded;
  const isAuthPage = ['/auth', '/welcome'].includes(location.pathname);
  const isOnboarding = location.pathname.includes('onboarding');

  const navItems = user?.accountType === 'AGENT' ? [
    { icon: LayoutDashboard, path: '/', label: 'WRAP' },
    { icon: Users, path: '/roster', label: 'ROSTER' },
    { icon: WalletCards, path: '/finance', label: 'WALLET' },
    { icon: Settings, path: '/settings', label: 'CONFIG' },
  ] : [
    { icon: LayoutDashboard, path: '/', label: 'WRAP' },
    { icon: Layers, path: '/jobs', label: 'SLATE' },
    { icon: WalletCards, path: '/finance', label: 'WALLET' },
    { icon: Settings, path: '/settings', label: 'CONFIG' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // The inner application screen - structured as a flex column to eliminate iOS Safari fixed positioning bugs
  const appContent = (
    <div className="relative w-full h-full flex flex-col bg-black text-textPrimary overflow-hidden font-sans select-none">
      
      {/* SIMULATED iOS STATUS BAR: ONLY visible in Desktop Chassis Simulator */}
      <div 
        className="hidden md:flex w-full shrink-0 items-center justify-between px-7 text-[12px] font-semibold text-white/90 z-[120] pointer-events-none select-none h-[38px] pt-1.5"
      >
        <span className="tracking-tight font-medium ml-1 text-white/80">{currentTime}</span>
        
        {/* Dynamic Island Pill representation (centered in desktop frame) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2 h-[25px] w-[114px] bg-black rounded-full border border-white/10 flex items-center justify-between px-3 shadow-inner pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/20 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-500/40" />
          </div>
          <span className="text-[8px] font-black uppercase text-accent tracking-[0.2em] font-mono">CINEARCH</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 animate-pulse" />
        </div>

        <div className="flex items-center gap-1.5 mr-1 text-white/70">
          <span className="text-[10px] font-bold tracking-tight">5G</span>
          <Wifi className="w-3.5 h-3.5" />
          <BatteryMedium className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* TOP HUD: FIXED/STICKY HEADER WITH SAFE AREA INSET */}
      {!isAuthPage && !isOnboarding && (
        <header 
          className="shrink-0 z-[100] px-5 flex items-center justify-between glass-ui border-b border-white/10 backdrop-blur-2xl"
          style={{
            paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)',
            height: 'calc(3.5rem + max(env(safe-area-inset-top, 0px), 0px))'
          }}
        >
          <div 
            className="flex items-center gap-2.5 cursor-pointer active:opacity-75 transition-opacity" 
            onClick={() => navigate('/')}
          >
            <span className="font-serif italic text-2xl text-white">Ca</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white">CineArch</span>
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 italic">Terminal v0.5</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/manual')}
              className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-accent active:scale-95 transition-all rounded-none"
              aria-label="Field Manual"
              title="Field Manual"
            >
              <BookOpen size={16} />
            </button>
            {user && (
              <button 
                onClick={onLogout} 
                className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 active:scale-95 transition-all rounded-none"
                aria-label="Logout"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </header>
      )}

      {/* MAIN CONTENT AREA WITH iOS MOMENTUM SCROLL */}
      <main 
        className={clsx(
          "flex-1 overflow-y-auto ios-momentum-scroll hide-scrollbar w-full",
          isOnboarding && "pt-0"
        )}
      >
        <div className="mobile-wrapper py-4 pb-12">
          {children}
        </div>
      </main>

      {/* COMMAND DOCK: MOBILE BOTTOM NAVIGATION */}
      {isDashboardMode && !isOnboarding && (
        <nav 
          className="shrink-0 z-[100] glass-ui border-t border-white/10 backdrop-blur-3xl select-none"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)'
          }}
        >
          <div className="flex items-center justify-around h-14 px-2 max-w-[480px] mx-auto relative">
            {navItems.slice(0, 2).map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={clsx(
                    "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all duration-200 active:scale-95 rounded-none",
                    active ? 'text-accent' : 'text-white/30 hover:text-white/70'
                  )}
                >
                  <item.icon size={19} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[7px] font-black uppercase tracking-widest mt-1">{item.label}</span>
                </button>
              );
            })}
            
            {/* CENTRAL ACTION BUTTON: OPENS SHUTTER SHEET */}
            <div className="flex items-center justify-center px-1 -mt-3">
              <button
                onClick={() => setIsQuickActionOpen(true)}
                className="flex items-center justify-center w-12 h-12 bg-white text-black active:bg-accent active:scale-90 transition-all shadow-glow border border-black rounded-none"
                aria-label="Command Actions"
              >
                <Plus size={22} strokeWidth={3} />
              </button>
            </div>

            {navItems.slice(2, 4).map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={clsx(
                    "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all duration-200 active:scale-95 rounded-none",
                    active ? 'text-accent' : 'text-white/30 hover:text-white/70'
                  )}
                >
                  <item.icon size={19} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[7px] font-black uppercase tracking-widest mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* iOS Home Indicator Bar: Shown in desktop simulator */}
          <div className="hidden md:flex w-full justify-center pb-1">
            <div className="w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </nav>
      )}

      {/* CINEARCH SHUTTER ACTION SHEET */}
      <IOSSheet
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        title="Command Actions"
        subtitle="RAPID PRODUCTION MARKS"
      >
        <div className="grid grid-cols-1 gap-2 pt-1">
          <button
            onClick={() => {
              setIsQuickActionOpen(false);
              navigate('/jobs/new');
            }}
            className="w-full p-4 bg-white/[0.03] border border-white/10 hover:border-accent flex items-center justify-between text-left active:scale-[0.99] transition-all group rounded-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 border border-accent/30 flex items-center justify-center text-accent rounded-none">
                <Plus size={18} />
              </div>
              <div>
                <p className="text-sm font-serif italic text-white">Log Dailies Slate</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Record shift, rate, & union hours</p>
              </div>
            </div>
            <span className="text-[9px] font-black text-accent tracking-[0.3em] uppercase italic">MARK</span>
          </button>

          <button
            onClick={() => {
              setIsQuickActionOpen(false);
              navigate('/jobs');
            }}
            className="w-full p-4 bg-white/[0.03] border border-white/10 hover:border-white/30 flex items-center justify-between text-left active:scale-[0.99] transition-all rounded-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-white/80 rounded-none">
                <UploadCloud size={18} />
              </div>
              <div>
                <p className="text-sm font-serif italic text-white">Ingest Dailies (CSV)</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Batch import multiple production logs</p>
              </div>
            </div>
            <span className="text-[9px] font-black text-white/40 tracking-[0.3em] uppercase italic">IMPORT</span>
          </button>

          <button
            onClick={() => {
              setIsQuickActionOpen(false);
              navigate('/finance');
            }}
            className="w-full p-4 bg-white/[0.03] border border-white/10 hover:border-white/30 flex items-center justify-between text-left active:scale-[0.99] transition-all rounded-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 rounded-none">
                <WalletCards size={18} />
              </div>
              <div>
                <p className="text-sm font-serif italic text-white">Record Wallet Expense</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Gear rental, kit fee, or 50% meals</p>
              </div>
            </div>
            <span className="text-[9px] font-black text-emerald-400 tracking-[0.3em] uppercase italic">EXPENSE</span>
          </button>

          <button
            onClick={() => {
              setIsQuickActionOpen(false);
              navigate('/manual');
            }}
            className="w-full p-4 bg-white/[0.03] border border-white/10 hover:border-white/30 flex items-center justify-between text-left active:scale-[0.99] transition-all rounded-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-white/80 rounded-none">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-sm font-serif italic text-white">Jurisdictional Field Manual</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">IATSE, DGC, & ACTRA rulebook</p>
              </div>
            </div>
            <span className="text-[9px] font-black text-white/40 tracking-[0.3em] uppercase italic">RULES</span>
          </button>
        </div>
      </IOSSheet>
    </div>
  );

  return (
    <div className="min-h-[100dvh] w-full bg-neutral-950 flex flex-col items-center justify-center">
      
      {/* DESKTOP SIMULATOR SWITCHER BAR (Hidden on mobile phones) */}
      <div className="hidden md:flex items-center justify-between w-full max-w-5xl px-6 py-3 border-b border-white/10 bg-black/80 backdrop-blur-md text-xs z-50">
        <div className="flex items-center gap-3">
          <span className="font-bold text-accent tracking-[0.4em] uppercase text-[10px]">CineArch Terminal</span>
          <span className="text-white/20">|</span>
          <span className="text-white/60 font-light italic">iPhone 16 Pro Viewport Architecture</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsIPhoneFrameEnabled(true)}
            className={clsx(
              "px-3 py-1.5 rounded-none border flex items-center gap-1.5 font-bold uppercase tracking-wider transition-all text-[9px]",
              isIPhoneFrameEnabled 
                ? "bg-white text-black border-white shadow-sm" 
                : "text-white/40 hover:text-white border-white/10 bg-white/5"
            )}
          >
            <Smartphone size={13} /> iPhone 16 Pro Chassis
          </button>
          <button
            onClick={() => setIsIPhoneFrameEnabled(false)}
            className={clsx(
              "px-3 py-1.5 rounded-none border flex items-center gap-1.5 font-bold uppercase tracking-wider transition-all text-[9px]",
              !isIPhoneFrameEnabled 
                ? "bg-white text-black border-white shadow-sm" 
                : "text-white/40 hover:text-white border-white/10 bg-white/5"
            )}
          >
            <Maximize2 size={13} /> Full View
          </button>
        </div>
      </div>

      {/* CHASSIS OR FLUID CONTAINER */}
      <div className={clsx(
        "w-full flex-1 flex items-center justify-center",
        isIPhoneFrameEnabled ? "p-0 md:py-8" : "p-0"
      )}>
        {isIPhoneFrameEnabled ? (
          <div className="relative w-full md:w-[393px] h-[100dvh] md:h-[852px] bg-black md:rounded-[54px] md:border-[10px] md:border-neutral-800 md:shadow-[0_0_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col ring-1 ring-white/10">
            {appContent}
          </div>
        ) : (
          <div className="w-full h-[100dvh] flex flex-col bg-black">
            {appContent}
          </div>
        )}
      </div>
    </div>
  );
};
