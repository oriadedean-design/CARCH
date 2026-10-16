import React, { useState, useEffect } from 'react';
import { api } from '../services/storage';
import { User, CanadianProvince } from '../types';
import { Heading, Text, Button, Input, Select, Card, Badge } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { Shield, User as UserIcon, Lock, Landmark, FileText, Trash2, Users, XCircle } from 'lucide-react';

export const SettingsIndividual = () => {
  const { showToast, showConfirm } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profileForm, setProfileForm] = useState<Partial<User>>({});

  useEffect(() => {
    const init = async () => {
      const u = await api.auth.getUser();
      setUser(u);
      setProfileForm(u || {});
    };
    init();
  }, []);

  const handleSave = async () => {
    if (profileForm) {
      await api.auth.updateUser(profileForm);
      const u = await api.auth.getUser();
      setUser(u);
      showToast("Profile Canonical Synchronized.", "success");
    }
  };

  const handleRevokeAgency = () => {
    showConfirm({
      title: "Revoke Agency Access?",
      message: "This will immediately disconnect your ledger from the agency command terminal.",
      confirmText: "Revoke Access",
      isDestructive: true,
      onConfirm: async () => {
        await api.auth.revokeAgency();
        const u = await api.auth.getUser();
        setUser(u);
        showToast("Agency RLS Access Revoked.", "info");
      }
    });
  };

  const handlePurgeData = () => {
    showConfirm({
      title: "Purge All Drive Data?",
      message: "This will wipe all locally stored logs and reset to defaults. This action cannot be reversed.",
      confirmText: "Purge All",
      isDestructive: true,
      onConfirm: async () => {
        await api.system.resetData();
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="space-y-2 border-b border-white/10 pb-4">
         <Badge color="accent">Personnel File</Badge>
         <h1 className="heading-huge">BASE <span className="text-accent">CAMP.</span></h1>
      </header>

      <div className="space-y-4">
         <Card className="p-5 border-accent/20 bg-accent/5 space-y-2 rounded-none">
            <div className="flex items-center gap-2 text-accent">
               <Shield size={16} />
               <h3 className="text-base font-serif italic text-white">Identity Integrity</h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-light italic">
              Your professional coordinates drive all automated guild trajectory logic.
            </p>
         </Card>

         <Card className="p-5 space-y-3 border-white/10 rounded-none">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-widest italic">
                  <Users size={14} />
                  <span>Agency Link</span>
               </div>
               <Badge color={user?.hasAgentFee ? "accent" : "neutral"}>
                 {user?.hasAgentFee ? "CONNECTED" : "INDEPENDENT"}
               </Badge>
            </div>
            <p className="text-xs text-white/70 italic font-light">
              {user?.hasAgentFee ? "Linked to Agency Command Terminal" : "No active agency link currently bound to this slate."}
            </p>
            {user?.hasAgentFee && (
              <button 
                onClick={handleRevokeAgency}
                className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 pt-1"
              >
                <XCircle size={12} /> Revoke Agency Access
              </button>
            )}
         </Card>

         <div className="glass-ui p-5 rounded-none border border-white/10 space-y-4">
            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Full Name</label>
               <Input 
                 value={profileForm.name || ''} 
                 onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
                 className="h-12 text-base font-serif italic" 
               />
            </div>

            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Jurisdiction (Province)</label>
               <Select 
                 value={profileForm.province} 
                 onChange={e => setProfileForm({...profileForm, province: e.target.value})} 
                 className="h-12 text-sm font-serif italic"
               >
                  {Object.values(CanadianProvince).map(v => (
                    <option key={v} value={v} className="bg-black text-white">{v}</option>
                  ))}
               </Select>
            </div>

            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Digital Coordinate (Email)</label>
               <Input 
                 value={profileForm.email || ''} 
                 disabled 
                 className="h-12 opacity-30 cursor-not-allowed text-sm font-serif italic" 
               />
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
               <button 
                 type="button"
                 onClick={handlePurgeData} 
                 className="text-[9px] font-black uppercase tracking-widest text-red-400/50 hover:text-red-400 transition-colors italic"
               >
                 Purge Data
               </button>
               <Button onClick={handleSave} className="h-11 px-6 text-[10px] tracking-[0.4em] bg-white text-black hover:bg-accent font-black">
                 Print Updates
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
};
