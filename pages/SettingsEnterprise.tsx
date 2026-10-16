import React, { useState, useEffect } from 'react';
import { api } from '../services/storage';
import { User, EntityType, CanadianProvince } from '../types';
import { Heading, Text, Button, Input, Select, Card, Badge } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { Landmark, Users, GraduationCap, Building, FolderSync, Percent, Briefcase, UserMinus } from 'lucide-react';

export const SettingsEnterprise = () => {
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
      showToast("Organization Terminal Calibrated.", "success");
    }
  };

  const handleReleaseUser = (clientId: string, clientName: string) => {
    showConfirm({
      title: `Release ${clientName}?`,
      message: "This will disconnect their production ledger from your command view.",
      confirmText: "Release",
      isDestructive: true,
      onConfirm: async () => {
        await api.auth.removeManagedUser(clientId);
        const u = await api.auth.getUser();
        setUser(u);
        showToast("Personnel Released from Roster.", "info");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="space-y-2 border-b border-white/10 pb-4">
         <Badge color="accent">Enterprise Configuration</Badge>
         <h1 className="heading-huge">BASE <span className="text-accent">COMMAND.</span></h1>
      </header>

      <div className="space-y-4">
         <Card className="p-5 border-accent/20 bg-accent/5 space-y-2 rounded-none">
            <div className="flex gap-2 items-center text-accent">
               <Landmark size={16} />
               <span className="text-[9px] font-black uppercase tracking-[0.4em] italic">Status: Command Terminal</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-light italic">
              Global agency parameters drive automated commission deductions and aggregate slate reporting.
            </p>
         </Card>

         <Card className="p-5 space-y-3 border-white/10 rounded-none">
            <div className="flex items-center justify-between">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Active Roster</h4>
              <span className="text-[8px] font-mono text-white/30">{user?.managedUsers?.length || 0} Members</span>
            </div>
            <div className="space-y-1.5">
               {user?.managedUsers?.map(client => (
                 <div key={client.id} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-none">
                    <span className="text-sm font-serif italic text-white">{client.name}</span>
                    <button 
                      onClick={() => handleReleaseUser(client.id, client.name)}
                      className="p-1 text-white/20 hover:text-red-400 active:scale-95 transition-colors"
                      title="Release Personnel"
                    >
                       <UserMinus size={14} />
                    </button>
                 </div>
               ))}
               {(!user?.managedUsers || user.managedUsers.length === 0) && (
                 <p className="text-[9px] font-mono text-white/30 italic py-2">No Active Roster Clients</p>
               )}
            </div>
         </Card>

         <div className="glass-ui p-5 rounded-none border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-white/40 border-b border-white/10 pb-2">
               <Briefcase size={14} />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">Entity Definition</span>
            </div>

            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Organization Name</label>
               <Input 
                 value={profileForm.organizationName || ''} 
                 onChange={e => setProfileForm({...profileForm, organizationName: e.target.value})} 
                 className="h-12 text-base font-serif italic" 
               />
            </div>

            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Base Jurisdiction</label>
               <Select 
                 value={profileForm.province} 
                 onChange={e => setProfileForm({...profileForm, province: e.target.value as any})} 
                 className="h-12 text-sm font-serif italic" 
               >
                  {Object.values(CanadianProvince).map(v => (
                    <option key={v} value={v} className="bg-black text-white">{v}</option>
                  ))}
               </Select>
            </div>

            {user?.entityType === EntityType.AGENCY && (
               <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black uppercase tracking-widest text-accent italic">Commission Rate (%)</label>
                    <span className="text-[8px] font-mono text-white/30">Deduction Rule</span>
                  </div>
                  <Input 
                    type="number" 
                    value={profileForm.agentFeePercentage} 
                    onChange={e => setProfileForm({...profileForm, agentFeePercentage: Number(e.target.value)})} 
                    className="h-12 text-xl font-mono text-center" 
                  />
               </div>
            )}

            <div className="pt-3 border-t border-white/10 flex justify-end">
               <Button onClick={handleSave} className="w-full h-12 text-[10px] tracking-[0.4em] bg-white text-black hover:bg-accent font-black">
                 Synchronize Base
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
};
