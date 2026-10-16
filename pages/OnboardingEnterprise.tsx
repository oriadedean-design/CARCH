import React, { useState, useEffect } from 'react';
import { User, CanadianProvince, EntityType } from '../types';
import { api } from '../services/storage';
import { Button, Input, Heading, Text, Select, Badge, Card } from '../components/ui';
import { ArrowRight, Shield, Zap, Landmark, Mail, Phone, Percent, UserCheck, Users, Building, GraduationCap, UploadCloud, Plus, X } from 'lucide-react';
import { clsx } from 'clsx';
import { BulkJobUpload } from '../components/BulkJobUpload';

const ProductionCallOverlay = ({ onComplete }: { onComplete: () => void }) => {
  const [stage, setStage] = useState(0);
  const sequence = [
    "Pictures up. Agency interface active.",
    "Syncing Roster Ledger...",
    "Calibrating Guild Compliance...",
    "Showrunner Mode: Active.",
    "Director: Action."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStage(prev => {
        if (prev >= sequence.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-4 animate-in fade-in duration-300">
         <div className="w-16 h-[2px] bg-accent mx-auto animate-snap origin-left"></div>
         <p className="text-2xl font-serif italic text-white tracking-tight leading-snug max-w-xs">
           "{sequence[stage]}"
         </p>
      </div>
    </div>
  );
};

export const OnboardingEnterprise = ({ user, onComplete }: { user: User, onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [isPreparing, setIsPreparing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: '',
    province: CanadianProvince.ON,
    entityType: EntityType.AGENCY,
    organizationName: '',
    role: 'Talent Agent',
    hasAgentFee: true,
    agentFeePercentage: 10,
    cohortYear: new Date().getFullYear().toString(),
    programName: '',
    managedUsers: [] as { name: string, email: string, role: string }[]
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleAddTempUser = () => {
    setFormData(prev => ({
      ...prev,
      managedUsers: [...prev.managedUsers, { name: '', email: '', role: '' }]
    }));
  };

  const updateTempUser = (index: number, field: string, value: string) => {
    const newList = [...formData.managedUsers];
    newList[index] = { ...newList[index], [field]: value };
    setFormData({ ...formData, managedUsers: newList });
  };

  const handleFinish = () => {
    setIsPreparing(true);
  };

  const executeCompletion = () => {
    const clients: User[] = formData.managedUsers
      .filter(u => u.name && u.email)
      .map(u => ({
        id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: u.name,
        email: u.email,
        role: u.role || 'Talent',
        province: formData.province,
        isOnboarded: true,
        accountType: 'INDIVIDUAL',
        isPremium: true
      }));

    const updates: Partial<User> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      province: formData.province,
      entityType: formData.entityType,
      organizationName: formData.organizationName,
      role: formData.role,
      hasAgentFee: formData.entityType === EntityType.AGENCY ? formData.hasAgentFee : false,
      agentFeePercentage: formData.agentFeePercentage,
      cohortYear: formData.cohortYear,
      programName: formData.programName,
      managedUsers: clients,
      isOnboarded: true
    };

    api.auth.updateUser(updates);
    onComplete();
  };

  if (isPreparing) return <ProductionCallOverlay onComplete={executeCompletion} />;

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center px-4 py-8 text-white relative bg-black font-sans">
      <div className="bg-vignette-universal"></div>
      
      <div className="w-full max-w-sm mx-auto space-y-6 relative z-10 animate-in fade-in duration-500">
        
        {step === 1 && (
          <div className="text-center space-y-5">
            <Badge color="accent">Showrunner Terminal</Badge>
            <h1 className="font-serif italic text-4xl text-white">COMMAND BASE.</h1>
            <p className="text-xs text-white/60 font-light italic leading-relaxed">
              Initializing your Enterprise Terminal. Optimized for roster management, compliance auditing, and tactical scheduling.
            </p>
            <div className="pt-4">
              <Button onClick={handleNext} className="w-full h-12 text-[10px] tracking-[0.3em] bg-accent text-black hover:bg-yellow-400">
                Initialize Terminal
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <div className="space-y-1">
                <Text variant="caption">Scene 01 // Contact Dossier</Text>
                <h2 className="font-serif italic text-2xl text-white">Principal Coordinates.</h2>
             </div>
             <div className="space-y-3">
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-white/50">Point of Contact Name</label>
                   <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-11 text-base font-serif italic" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-white/50">Organization Name</label>
                   <Input value={formData.organizationName} onChange={e => setFormData({...formData, organizationName: e.target.value})} className="h-11 text-base font-serif italic" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-white/50">Headquarters</label>
                   <Select value={formData.province} onChange={e => setFormData({...formData, province: e.target.value as any})} className="h-11 text-sm">
                      {Object.values(CanadianProvince).map(v => <option key={v} value={v} className="bg-black text-white">{v}</option>)}
                   </Select>
                </div>
             </div>
             <div className="flex justify-between items-center pt-4 border-t border-white/10">
               <button onClick={handleBack} className="text-[9px] font-black uppercase tracking-wider text-white/40 hover:text-white">Back</button>
               <Button onClick={handleNext} className="h-11 px-5 text-[9px] bg-accent text-black hover:bg-yellow-400" disabled={!formData.name || !formData.organizationName}>
                 Define Entity <ArrowRight size={12} className="ml-1.5" />
               </Button>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <div className="space-y-1">
                <Text variant="caption">Scene 02 // Structure</Text>
                <h2 className="font-serif italic text-2xl text-white">Operational Category.</h2>
             </div>

             <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: EntityType.AGENCY, label: 'Agency', icon: Building },
                  { id: EntityType.ARTS_ORG, label: 'Arts Org', icon: Users },
                  { id: EntityType.TRAINING_INST, label: 'School', icon: GraduationCap }
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setFormData({...formData, entityType: item.id})}
                    className={clsx(
                      "p-3 rounded-xl border transition-all flex flex-col items-center text-center gap-2", 
                      formData.entityType === item.id ? "bg-accent text-black border-accent" : "glass-ui text-white border-white/10"
                    )}
                  >
                    <item.icon size={20} strokeWidth={1.5} />
                    <span className="text-[10px] font-black uppercase">{item.label}</span>
                  </button>
                ))}
             </div>

             {/* Commission rate if agency */}
             {formData.entityType === EntityType.AGENCY && (
                <div className="p-3.5 glass-ui rounded-xl border-accent/30 space-y-2 pt-3">
                   <div className="flex justify-between items-center">
                     <label className="text-[9px] font-black uppercase tracking-wider text-accent">Commission Rate (%)</label>
                     <span className="text-[9px] font-mono text-white/50">Deduction</span>
                   </div>
                   <Input 
                     type="number" 
                     value={formData.agentFeePercentage} 
                     onChange={e => setFormData({...formData, agentFeePercentage: Number(e.target.value)})}
                     className="h-11 text-xl font-mono text-center"
                   />
                   <p className="text-[8px] text-white/40 italic">Automatically applied to client production logs.</p>
                </div>
             )}

             <div className="flex justify-between items-center pt-3 border-t border-white/10">
               <button onClick={handleBack} className="text-[9px] font-black uppercase tracking-wider text-white/40 hover:text-white">Back</button>
               <Button onClick={handleNext} className="h-11 px-5 text-[9px] bg-accent text-black hover:bg-yellow-400">
                 Build Roster <ArrowRight size={12} className="ml-1.5" />
               </Button>
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-end border-b border-white/10 pb-2">
                <div>
                   <Text variant="caption">Scene 03 // Roster</Text>
                   <h2 className="font-serif italic text-2xl text-white">Personnel Sync.</h2>
                </div>
                <Badge color="accent">{formData.managedUsers.length} Added</Badge>
             </div>

             <div className="space-y-2 max-h-60 overflow-y-auto ios-momentum-scroll pr-1">
                {formData.managedUsers.map((u, i) => (
                  <div key={i} className="p-3 rounded-xl glass-ui border-white/10 space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-accent">Talent {i+1}</span>
                        <button onClick={() => setFormData({...formData, managedUsers: formData.managedUsers.filter((_, idx) => idx !== i)})}><X size={12} className="text-white/40" /></button>
                     </div>
                     <Input placeholder="Talent Name" value={u.name} onChange={e => updateTempUser(i, 'name', e.target.value)} className="h-10 text-xs" />
                     <Input placeholder="Email Address" value={u.email} onChange={e => updateTempUser(i, 'email', e.target.value)} className="h-10 text-xs" />
                  </div>
                ))}
                
                <button 
                  onClick={handleAddTempUser}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-[9px] font-black uppercase tracking-wider text-white/60 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                   <Plus size={13} /> Add Personnel
                </button>
             </div>

             <div className="flex justify-between items-center pt-3 border-t border-white/10">
               <button onClick={handleFinish} className="text-[9px] font-black uppercase tracking-wider text-white/40 hover:text-white">Skip & Enter</button>
               <Button onClick={handleFinish} className="h-11 px-5 text-[9px] bg-accent text-black hover:bg-yellow-400">
                 Roll Sound & Launch
               </Button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
