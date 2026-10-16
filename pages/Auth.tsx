import React, { useState } from 'react';
import { Button, Input, Heading, Text, Badge } from '../components/ui';
import { api } from '../services/storage';
import { User } from '../types';
import { useToast } from '../context/ToastContext';
import { Briefcase, ArrowLeft, Camera, Shield, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export const Auth = ({ onLogin, onBack, initialAgentMode = false }: { onLogin: (u: User) => void, onBack: () => void, initialAgentMode?: boolean }) => {
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAgent, setIsAgent] = useState(initialAgentMode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let user;
      if (isLogin) {
        user = await api.auth.login(email, password);
      } else {
        user = await api.auth.register(email, password, isAgent);
      }
      showToast(isLogin ? "Verified on Slate." : "Account provisioned.", "success");
      onLogin(user);
    } catch (err: any) {
      console.error("CineArch Auth Failure:", err);
      showToast("Authentication Denied: " + (err.message || "Invalid Coordinates"), "error");
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      await api.auth.loginWithGoogle();
    } catch (err: any) {
      console.error("Google Auth Failed:", err);
      showToast("Google Sign-In Error: " + (err.message || "Failed to initialize"), "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center px-4 py-8 relative bg-black font-sans">
      <div className="absolute inset-0 bg-cinematic-universal opacity-20 pointer-events-none"></div>
      <div className="bg-vignette-universal"></div>

      {/* Back button respecting safe area */}
      <div 
        className="fixed top-4 left-4 cursor-pointer z-50 flex items-center gap-2 p-2 bg-black/60 backdrop-blur-md border border-white/10 active:scale-95 transition-all rounded-none"
        style={{ top: 'max(env(safe-area-inset-top), 12px)' }}
        onClick={onBack}
      >
         <ArrowLeft className="w-4 h-4 text-white/50" />
         <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 italic">Back to Ones</span>
      </div>

      <div className="w-full max-w-sm mx-auto relative z-10 space-y-6 pt-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
             <div className="w-14 h-14 border border-white/20 glass-ui flex items-center justify-center rounded-none shadow-glow">
                <span className="font-serif italic text-3xl text-white">Ca</span>
             </div>
          </div>
          <h1 className="heading-huge text-white">CINEARCH.</h1>
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-accent italic">
            {isAgent ? "Agency Operations" : "Professional Registry"}
          </p>
        </div>

        <div className="space-y-4">
          {/* Google Auth Option */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full h-13 py-3 border border-white/15 glass-ui hover:border-accent/40 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-40 rounded-none group"
          >
            <div className="w-5 h-5 bg-white rounded-none flex items-center justify-center p-0.5 shadow-glow">
               <svg viewBox="0 0 24 24" className="w-full h-full">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
               </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 group-hover:text-white transition-colors">
              {isLogin ? "Authenticate via Google" : "Register via Google"}
            </span>
          </button>

          <div className="flex items-center gap-3 opacity-25 py-1">
            <div className="h-px bg-white flex-1" />
            <span className="text-[8px] uppercase font-black tracking-[0.5em] text-white">OR ACCESS KEY</span>
            <div className="h-px bg-white flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-1.5 italic">
                <Shield size={10} className="text-accent" /> Personnel Coordinate
              </label>
              <Input 
                type="email" 
                required 
                autoComplete="email"
                placeholder="Production Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 text-[16px]"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 italic">Access Key</label>
              <Input 
                type="password" 
                required 
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 text-[16px]"
              />
            </div>
            
            <div className="pt-2">
              <Button 
                className="w-full h-14 text-[10px] font-black uppercase tracking-[0.5em] bg-white text-black hover:bg-accent shadow-glow" 
                isLoading={loading}
                type="submit"
              >
                {loading ? "Checking the Gate..." : isLogin ? "Report to Set" : "Sign for the Block"}
              </Button>
            </div>

            <div className="text-center space-y-4 pt-2">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors italic"
              >
                {isLogin ? "New Personnel? Register" : "Existing Member? Authenticate"}
              </button>
              
              <div className="pt-3 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setIsAgent(!isAgent)}
                  className={clsx(
                    "text-[8px] font-black uppercase tracking-[0.3em] transition-all px-4 py-2 border rounded-none italic",
                    isAgent ? "border-accent text-accent bg-accent/5" : "border-white/10 text-white/40 hover:text-white hover:border-white/30"
                  )}
                >
                  {isAgent ? "Switch to Individual Access" : "Switch to Agency Command"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
