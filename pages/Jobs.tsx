import React, { useState, useEffect } from 'react';
import { api } from '../services/storage';
import { Job, User } from '../types';
import { resolveGuildsForRole, getUnionSpec, getAllUnions } from '../services/union_engine';
import { INDUSTRY_DEPARTMENTS } from '../config/industry_roles';
import { Button, Input, Select, Badge, Card } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';

export const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isNew = id === 'new';
  const [user, setUser] = useState<User | null>(null);
  
  const [form, setForm] = useState<Partial<Job>>({
    status: 'CONFIRMED',
    productionName: '',
    role: '',
    department: 'Camera Department',
    isUnion: true,
    unionTypeId: '',
    startDate: new Date().toISOString().split('T')[0],
    grossEarnings: 0,
    province: 'Ontario'
  });

  const [resolvedUnionIds, setResolvedUnionIds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const u = await api.auth.getUser();
        if (!isMounted) return;
        setUser(u);
        if (u && isNew) {
          setForm(prev => ({
            ...prev,
            role: u.selectedRoles?.[0] || '',
            department: u.department || 'Camera Department',
            province: u.province || 'Ontario'
          }));
        }
      } catch (e) {
        console.error("Session fetch aborted or failed", e);
      }
    };
    fetchUser();
    return () => { isMounted = false; };
  }, [isNew]);

  useEffect(() => {
    if (form.province && form.department && form.role) {
      const suggestions = resolveGuildsForRole(form.province, form.role, form.department);
      setResolvedUnionIds(suggestions);
      
      if (isNew && !form.unionTypeId && form.isUnion && suggestions.length > 0) {
        setForm(prev => ({ ...prev, unionTypeId: suggestions[0] }));
      }
    }
  }, [form.province, form.department, form.role, isNew, form.isUnion]);

  const handleSave = async () => {
    if (!form.productionName?.trim()) {
      showToast('Production Title is required.', 'error');
      return;
    }
    
    const unionSpec = getUnionSpec(form.unionTypeId || '');
    const unionName = form.isUnion ? unionSpec?.name : undefined;

    const jobData = {
      ...form,
      id: isNew ? `job_${Date.now()}` : id!,
      userId: user?.id || 'anon',
      createdAt: new Date().toISOString(),
      unionName
    } as Job;

    if (isNew) await api.jobs.add(jobData); 
    else await api.jobs.update(jobData);
    
    showToast('Committed to Slate.', 'success');
    navigate('/jobs');
  };

  const allRoles = INDUSTRY_DEPARTMENTS.flatMap(d => d.roles.map(r => ({ ...r, dept: d.name })));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-lg mx-auto">
      <header className="flex justify-between items-center pb-2">
         <button 
           onClick={() => navigate('/jobs')} 
           className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors flex items-center gap-2 p-1 active:scale-95 italic"
         >
            <ArrowLeft size={14} /> Back to Slate
         </button>
         <Badge color="accent">{isNew ? "New Mark" : "Review Mark"}</Badge>
      </header>

      <div className="space-y-5">
         <div className="border-b border-white/10 pb-4">
            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-accent mb-2 block italic">Production Title</label>
            <Input 
               value={form.productionName} 
               onChange={e => setForm({...form, productionName: e.target.value})}
               className="text-3xl sm:text-4xl font-serif italic bg-transparent border-none px-0 text-white placeholder:text-white/20 min-h-0 py-1"
               placeholder="Untitled"
               autoFocus={isNew}
            />
         </div>

         <div className="space-y-4">
            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Regional Hub</label>
               <Select value={form.province} onChange={e => setForm({...form, province: e.target.value})} className="h-12 text-sm font-serif italic">
                  {['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Nova Scotia', 'New Brunswick', 'Prince Edward Island', 'Newfoundland and Labrador', 'Saskatchewan', 'Yukon', 'Northwest Territories', 'Nunavut'].map(p => <option key={p} value={p} className="bg-black text-white">{p}</option>)}
               </Select>
            </div>

            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Active Assignment (Role)</label>
               <Select value={form.role} onChange={e => {
                 const roleName = e.target.value;
                 const roleObj = allRoles.find(r => r.name === roleName);
                 setForm({...form, role: roleName, department: roleObj?.dept || form.department});
               }} className="h-12 text-sm font-serif italic">
                  {INDUSTRY_DEPARTMENTS.map(dept => (
                     <optgroup key={dept.name} label={dept.name} className="bg-black text-accent uppercase font-black tracking-widest">
                        {dept.roles.map(r => <option key={r.name} value={r.name} className="bg-black text-white">{r.name}</option>)}
                     </optgroup>
                  ))}
               </Select>
            </div>

            <Card className="p-4 border-white/10 bg-white/[0.02] space-y-4 rounded-none">
               <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Category</label>
                  <div className="flex gap-1.5">
                     <button 
                       type="button"
                       onClick={() => setForm({...form, isUnion: true})} 
                       className={clsx("px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all rounded-none", form.isUnion ? "bg-accent text-black border-accent" : "text-white/30 border-white/10 hover:text-white")}
                     >
                       Union
                     </button>
                     <button 
                       type="button"
                       onClick={() => setForm({...form, isUnion: false, unionTypeId: ''})} 
                       className={clsx("px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all rounded-none", !form.isUnion ? "bg-accent text-black border-accent" : "text-white/30 border-white/10 hover:text-white")}
                     >
                       Indie
                     </button>
                  </div>
               </div>

               {form.isUnion && (
                 <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Guild Continuity</label>
                    <Select 
                       value={form.unionTypeId || ''} 
                       onChange={e => setForm({...form, unionTypeId: e.target.value})} 
                       className="h-12 text-sm font-serif italic"
                    >
                       {resolvedUnionIds.map(id => {
                         const spec = getUnionSpec(id);
                         return <option key={id} value={id} className="bg-black">{spec?.name}</option>;
                       })}
                       <option disabled className="text-white/20">—— Manual Select ——</option>
                       {getAllUnions().filter(u => !resolvedUnionIds.includes(u.id)).map(u => <option key={u.id} value={u.id} className="bg-black">{u.name}</option>)}
                    </Select>
                    <div className="flex items-center gap-1.5 text-accent text-[9px] italic">
                       <ShieldCheck size={12} />
                       <span>Resolved via Jurisdictional Matrix</span>
                    </div>
                 </div>
               )}
            </Card>

            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Start Date</label>
                  <Input 
                    type="date" 
                    value={form.startDate} 
                    onChange={e => setForm({...form, startDate: e.target.value})} 
                    className="h-12 text-sm font-mono" 
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Gross Scale ($)</label>
                  <Input 
                    type="number" 
                    inputMode="decimal"
                    value={form.grossEarnings} 
                    onChange={e => setForm({...form, grossEarnings: Number(e.target.value)})} 
                    className="h-12 text-base font-mono" 
                  />
               </div>
            </div>

            <Card className="p-4 border-accent/20 bg-accent/5 space-y-2 rounded-none">
               <div className="flex items-center gap-2 text-accent">
                  <Zap size={14} fill="currentColor" />
                  <h4 className="text-[9px] font-black uppercase tracking-[0.4em] italic">Manifesto</h4>
               </div>
               <p className="text-xs text-white/70 italic leading-relaxed font-light">
                  {allRoles.find(r => r.name === form.role)?.description || "Personnel assignment description calibrated for film schedule."}
               </p>
            </Card>

            <div className="pt-3 flex flex-col gap-2">
               <Button onClick={handleSave} className="w-full h-12 text-[10px] tracking-[0.4em] bg-accent text-black hover:bg-yellow-400 font-black">
                 Commit to Slate
               </Button>
               <button 
                 type="button"
                 onClick={() => navigate('/jobs')} 
                 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors py-2 text-center italic"
               >
                 Discard Mark
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
