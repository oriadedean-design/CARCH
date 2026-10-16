import React, { useState, useMemo, useEffect } from 'react';
import { User, CanadianProvince, UserUnionTracking } from '../types';
import { INDUSTRY_DEPARTMENTS } from '../config/industry_roles';
import { UNION_SPECS } from '../config/unions_data';
import { resolveUnionsForRole } from '../config/jurisdiction_map';
import { api } from '../services/storage';
import { Button, Input, Heading, Text, Select, Badge, Card } from '../components/ui';
import { ArrowRight, MapPin, Sparkles, Check } from 'lucide-react';
import { clsx } from 'clsx';

const ProductionCallOverlay = ({ onComplete }: { onComplete: () => void }) => {
  const [stage, setStage] = useState(0);
  const sequence = [
    "Pictures up. Calibrating Hub...",
    "Syncing Jurisdictional Rules...",
    "Assigning Guild Continuity...",
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

export const OnboardingIndividual = ({ user, onComplete }: { user: User, onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [isPreparing, setIsPreparing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.name?.split(' ')[0] || '',
    lastName: user.name?.split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    phone: user.phone || '',
    province: CanadianProvince.ON,
    region: 'TORONTO' as User['region'],
    department: 'Camera Department', 
    selectedRoles: [] as string[],
    selectedUnions: [] as string[]
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  // THE INTELLIGENCE ENGINE
  const suggestedUnionIds = useMemo(() => {
    const ids = new Set<string>();
    formData.selectedRoles.forEach(role => {
      const resolved = resolveUnionsForRole(formData.province, role, formData.department);
      resolved.forEach(id => ids.add(id));
    });
    return Array.from(ids);
  }, [formData.selectedRoles, formData.province, formData.department]);

  useEffect(() => {
    if (step === 4) {
      setFormData(prev => ({ ...prev, selectedUnions: suggestedUnionIds }));
    }
  }, [step, suggestedUnionIds]);

  const executeCompletion = async () => {
    const updates: Partial<User> = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      province: formData.province,
      region: formData.region,
      department: formData.department,
      selectedRoles: formData.selectedRoles,
      isOnboarded: true,
      role: formData.selectedRoles[0] || 'Film Professional'
    };
    
    const newTrackings: UserUnionTracking[] = formData.selectedUnions.map(id => {
      const spec = UNION_SPECS[id];
      return {
        id: `track_${id}_${Date.now()}`,
        userId: user.id,
        unionTypeId: id,
        unionName: spec.name,
        tierLabel: spec.tiers[0].name,
        targetType: spec.tiers[0].targetType,
        targetValue: spec.tiers[0].targetValue,
        startingValue: 0
      };
    });

    await api.auth.updateUser(updates);
    await api.tracking.save(newTrackings);
    onComplete();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center px-4 py-8 text-white bg-black relative font-sans">
      {isPreparing && <ProductionCallOverlay onComplete={executeCompletion} />}
      <div className="bg-vignette-universal"></div>
      
      <div className="w-full max-w-sm mx-auto space-y-6 relative z-10 animate-in fade-in duration-500">
        
        {step === 1 && (
          <div className="text-center space-y-6">
            <Badge color="accent" className="tracking-[0.6em]">JURISDICTIONAL ENGINE v0.5</Badge>
            <h1 className="heading-huge text-white">LOCK IT UP.</h1>
            <p className="text-xs text-white/60 font-light italic leading-relaxed">
              Establishing jurisdictional coordinates. National standards apply, but provincial peculiarities drive your eligibility.
            </p>
            <div className="pt-4">
              <Button onClick={handleNext} className="w-full h-14 text-[10px] tracking-[0.5em] bg-white text-black hover:bg-accent font-black shadow-glow rounded-none">
                Begin Calibration
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <div className="space-y-1">
                <Text variant="caption">Scene 01 // Coordinates</Text>
                <h2 className="font-serif italic text-3xl text-white">Principal Hub.</h2>
             </div>
             <div className="space-y-3">
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">First Name</label>
                   <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="h-12 text-base font-serif italic" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Last Name</label>
                   <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="h-12 text-base font-serif italic" />
                </div>
                <div className="space-y-1 pt-1">
                   <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic flex items-center gap-1.5">
                     <MapPin size={10} className="text-accent" /> Base Jurisdiction
                   </label>
                   <Select value={formData.province} onChange={e => setFormData({...formData, province: e.target.value as any})} className="h-12 text-sm font-serif italic">
                      {Object.values(CanadianProvince).map(v => <option key={v} value={v} className="bg-black text-white">{v}</option>)}
                   </Select>
                </div>
             </div>
             <div className="flex justify-between items-center pt-4 border-t border-white/10">
               <button onClick={handleBack} className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white italic">Back to Ones</button>
               <Button onClick={handleNext} className="h-12 px-6 text-[10px] tracking-[0.4em] bg-white text-black hover:bg-accent font-black shadow-glow">
                 Assign Dept <ArrowRight size={12} className="ml-2" />
               </Button>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-end border-b border-white/10 pb-2">
                <div>
                   <Text variant="caption">Scene 02 // Department</Text>
                   <h2 className="font-serif italic text-3xl text-white">Role Selection.</h2>
                </div>
                <Badge color="accent">{formData.selectedRoles.length} Marked</Badge>
             </div>

             {/* Department Buttons */}
             <div className="grid grid-cols-2 gap-1">
                {INDUSTRY_DEPARTMENTS.map(d => (
                    <button 
                      key={d.name} 
                      onClick={() => setFormData({...formData, department: d.name})}
                      className={clsx(
                        "p-3 border text-[9px] font-black uppercase tracking-widest transition-all text-center rounded-none italic", 
                        formData.department === d.name ? "bg-accent text-black border-accent" : "glass-ui text-white/60 hover:border-white/20 border-white/10"
                      )}
                    >
                      {d.name.replace(' Department', '')}
                    </button>
                ))}
             </div>

             {/* Roles under Department */}
             {formData.department && (
                <div className="space-y-1.5 pt-2 border-t border-white/10 max-h-56 overflow-y-auto ios-momentum-scroll pr-1">
                   {INDUSTRY_DEPARTMENTS.find(d => d.name === formData.department)?.roles.map(r => {
                    const resolvedUnionIds = resolveUnionsForRole(formData.province, r.name, formData.department);
                    const isSelected = formData.selectedRoles.includes(r.name);
                    
                    return (
                      <div 
                        key={r.name} 
                        onClick={() => {
                          setFormData({ 
                            ...formData, 
                            selectedRoles: isSelected 
                              ? formData.selectedRoles.filter(x => x !== r.name) 
                              : [...formData.selectedRoles, r.name] 
                          });
                        }}
                        className={clsx(
                          "p-3 rounded-none border transition-all cursor-pointer flex items-center justify-between", 
                          isSelected ? "bg-white text-black border-white" : "glass-ui text-white border-white/10 hover:border-white/20"
                        )}
                      >
                         <div>
                            <h4 className="font-serif italic text-base leading-tight">{r.name}</h4>
                            <p className={clsx("text-[9px] line-clamp-1 italic font-light", isSelected ? "text-black/60" : "text-white/40")}>
                              {r.description}
                            </p>
                         </div>
                         <div className="shrink-0 ml-2">
                           {isSelected ? (
                             <div className="w-5 h-5 bg-black text-white flex items-center justify-center font-bold text-xs rounded-none">
                               ✓
                             </div>
                           ) : (
                             <div className="w-5 h-5 border border-white/20 rounded-none" />
                           )}
                         </div>
                      </div>
                    );
                   })}
                </div>
             )}

             <div className="flex justify-between items-center pt-3 border-t border-white/10">
               <button onClick={handleBack} className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white italic">Back to Ones</button>
               <Button onClick={handleNext} className="h-12 px-6 text-[10px] tracking-[0.4em] bg-white text-black hover:bg-accent font-black shadow-glow" disabled={formData.selectedRoles.length === 0}>
                 Identify Guilds <ArrowRight size={12} className="ml-2" />
               </Button>
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <div className="space-y-1">
                <Text variant="caption">Scene 03 // Affiliation</Text>
                <h2 className="font-serif italic text-3xl text-white">Guild Intelligence.</h2>
             </div>
             
             <div className="p-4 bg-accent/5 border border-accent/20 rounded-none flex items-start gap-3">
                <Sparkles className="text-accent shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-white/70 italic leading-relaxed font-light">
                  Based on role selection and <b>{formData.province}</b> residency, the matrix resolved these trajectories.
                </p>
             </div>

             <div className="space-y-1.5 max-h-60 overflow-y-auto ios-momentum-scroll pr-1">
                {Object.entries(UNION_SPECS).map(([id, u]) => {
                  const isSuggested = suggestedUnionIds.includes(id);
                  const isSelected = formData.selectedUnions.includes(id);
                  return (
                    <div 
                      key={id}
                      onClick={() => {
                        const exists = formData.selectedUnions.includes(id);
                        setFormData({ 
                          ...formData, 
                          selectedUnions: exists 
                            ? formData.selectedUnions.filter(x => x !== id) 
                            : [...formData.selectedUnions, id] 
                        });
                      }}
                      className={clsx(
                        "p-3.5 rounded-none border transition-all cursor-pointer flex items-center justify-between", 
                        isSelected 
                          ? "bg-accent text-black border-accent" 
                          : isSuggested 
                            ? "border-accent/30 bg-accent/5 text-white" 
                            : "glass-ui text-white border-white/10"
                      )}
                    >
                      <div>
                         <div className="flex items-center gap-2">
                            <span className="text-lg font-serif italic">{u.name}</span>
                            {isSuggested && <Badge color={isSelected ? "neutral" : "accent"} className="text-[7px]">Matched</Badge>}
                         </div>
                         <p className="text-[9px] opacity-60 line-clamp-1 italic">{u.description}</p>
                      </div>
                      <div className="shrink-0 ml-2">
                        {isSelected ? (
                          <div className="w-5 h-5 bg-black text-accent flex items-center justify-center font-bold text-xs rounded-none">
                            ✓
                          </div>
                        ) : (
                          <div className="w-5 h-5 border border-white/20 rounded-none" />
                        )}
                      </div>
                    </div>
                  );
                })}
             </div>

             <div className="flex justify-between items-center pt-3 border-t border-white/10">
               <button onClick={handleBack} className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white italic">Adjust Roles</button>
               <Button onClick={() => setIsPreparing(true)} className="h-12 px-6 text-[10px] tracking-[0.4em] bg-white text-black hover:bg-accent font-black shadow-glow">
                 Action // Roll Sound
               </Button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
