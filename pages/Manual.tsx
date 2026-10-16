import { useState, useMemo } from 'react';
import { Heading, Badge, Input, Card, Text, Button } from '../components/ui';
import { CanadianProvince } from '../types';
import { getAllUnions, resolveGuildsForRole } from '../services/union_engine';
import { INDUSTRY_DEPARTMENTS } from '../config/industry_roles';
import { Search, Shield, ChevronRight, Mail, Landmark, Info, MapPin, Briefcase, LayoutGrid, BookOpen, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export const Manual = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ROLES' | 'GUILDS' | 'HUBS'>('ROLES');
  const [selectedProvince, setSelectedProvince] = useState<string>('Ontario');

  const filteredGuilds = useMemo(() => {
    return getAllUnions().filter(u => 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const filteredDepartments = useMemo(() => {
    if (!search) return INDUSTRY_DEPARTMENTS;
    return INDUSTRY_DEPARTMENTS.map(dept => ({
      ...dept,
      roles: dept.roles.filter(role => 
        role.name.toLowerCase().includes(search.toLowerCase()) || 
        role.description.toLowerCase().includes(search.toLowerCase())
      )
    })).filter(dept => dept.roles.length > 0);
  }, [search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
           <Badge color="accent">Field Manual</Badge>
           <span className="text-[8px] font-black uppercase text-white/30 tracking-widest italic">Collective Agreements v0.5</span>
        </div>
        <h1 className="heading-huge text-white">FIELD <span className="text-accent">MANUAL.</span></h1>
        
        {/* Search */}
        <div className="relative mt-2">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
           <Input 
             placeholder="Search roles or guilds..." 
             className="pl-11 h-12 text-sm border-white/10 rounded-none font-serif italic" 
             value={search} 
             onChange={e => setSearch(e.target.value)} 
           />
        </div>

        {/* Sharp CineArch Segmented Tab Control */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-white/[0.03] border border-white/10 rounded-none mt-2">
          <button 
            onClick={() => setActiveTab('ROLES')} 
            className={clsx(
              "py-2.5 text-[9px] font-black uppercase tracking-[0.25em] rounded-none transition-all text-center italic",
              activeTab === 'ROLES' ? "bg-white text-black font-bold shadow-sm" : "text-white/40 hover:text-white"
            )}
          >
            Roles
          </button>
          <button 
            onClick={() => setActiveTab('GUILDS')} 
            className={clsx(
              "py-2.5 text-[9px] font-black uppercase tracking-[0.25em] rounded-none transition-all text-center italic",
              activeTab === 'GUILDS' ? "bg-white text-black font-bold shadow-sm" : "text-white/40 hover:text-white"
            )}
          >
            Guilds
          </button>
          <button 
            onClick={() => setActiveTab('HUBS')} 
            className={clsx(
              "py-2.5 text-[9px] font-black uppercase tracking-[0.25em] rounded-none transition-all text-center italic",
              activeTab === 'HUBS' ? "bg-white text-black font-bold shadow-sm" : "text-white/40 hover:text-white"
            )}
          >
            Hubs ({selectedProvince})
          </button>
        </div>
      </header>

      {/* HUBS SELECTOR TAB */}
      {activeTab === 'HUBS' && (
         <div className="space-y-3 animate-in fade-in duration-300">
            <Card className="p-5 space-y-3 bg-accent/5 border-accent/20 rounded-none">
               <div className="flex items-center gap-2 text-accent">
                  <MapPin size={16} />
                  <h4 className="text-[9px] font-black uppercase tracking-[0.4em] italic">Active Jurisdictional Hub</h4>
               </div>
               <p className="text-xs text-white/70 italic leading-relaxed font-light">
                 Selecting a hub calibrates role-to-guild continuity and collective agreement requirements.
               </p>
               <div className="grid grid-cols-2 gap-1.5 pt-2">
                  {['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Nova Scotia'].map(p => (
                     <button 
                       key={p} 
                       onClick={() => {
                         setSelectedProvince(p);
                         setActiveTab('ROLES');
                       }}
                       className={clsx(
                         "p-3 rounded-none text-xs font-semibold border transition-all text-left flex items-center justify-between",
                         selectedProvince === p ? "border-accent text-accent bg-accent/10" : "border-white/10 text-white/50 hover:text-white"
                       )}
                     >
                       <span className="font-serif italic">{p}</span>
                       {selectedProvince === p && <span className="w-1.5 h-1.5 bg-accent" />}
                     </button>
                  ))}
               </div>
            </Card>
         </div>
      )}

      {/* ROLES DIRECTORY */}
      {activeTab === 'ROLES' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           {filteredDepartments.map(dept => (
              <div key={dept.name} className="space-y-2">
                 <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <h3 className="font-serif italic text-xl text-white">{dept.name}</h3>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30 italic">{dept.roles.length} Marks</span>
                 </div>
                 
                 <div className="space-y-2">
                    {dept.roles.map(role => {
                       const unionIds = resolveGuildsForRole(selectedProvince, role.name, dept.name);
                       const guilds = getAllUnions().filter(u => unionIds.includes(u.id));
                       
                       return (
                          <Card key={role.name} className="p-4 space-y-3 hover:border-accent/40 rounded-none border-white/10">
                             <div>
                                <h4 className="text-lg font-serif italic text-white leading-tight">{role.name}</h4>
                                <p className="text-xs text-white/50 leading-relaxed mt-1 font-light italic">{role.description}</p>
                             </div>

                             {role.requirements && role.requirements.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                   {role.requirements.map(req => (
                                     <span key={req} className="px-2 py-0.5 rounded-none bg-white/5 border border-white/10 text-[8px] text-white/60 font-mono">
                                       {req}
                                     </span>
                                   ))}
                                </div>
                             )}
                             
                             <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5">
                                <span className="text-[7px] font-black uppercase tracking-widest text-white/30 mr-1 italic">Jurisdiction:</span>
                                {guilds.map(g => (
                                   <Badge key={g.id} color="accent" className="text-[8px]">{g.name}</Badge>
                                ))}
                                {guilds.length === 0 && (
                                   <span className="text-[8px] text-white/30 italic">Indie / Non-Affiliated</span>
                                )}
                             </div>
                          </Card>
                       );
                    })}
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* GUILDS DIRECTORY */}
      {activeTab === 'GUILDS' && (
         <div className="space-y-3 animate-in fade-in duration-300">
            {filteredGuilds.map(u => (
               <Card key={u.id} className="p-5 space-y-3 rounded-none border-white/10">
                  <div className="flex justify-between items-start">
                     <div>
                        <Badge color="accent" className="text-[8px]">{(u as any).type || u.id}</Badge>
                        <h3 className="text-2xl font-serif italic text-white mt-1.5 leading-tight">{u.name}</h3>
                     </div>
                     <div className="text-right">
                        <span className="text-xl font-serif italic text-white">${u.applicationFee || 0}</span>
                        <span className="text-[7px] block font-black uppercase tracking-widest text-white/30 italic">Initiation</span>
                     </div>
                  </div>

                  <p className="text-xs text-white/60 leading-relaxed font-light italic">{u.description}</p>

                  {u.jurisdictionalNotes && (
                    <div className="p-3 bg-accent/5 border border-accent/20 flex gap-2 items-start rounded-none">
                       <Info size={14} className="text-accent shrink-0 mt-0.5" />
                       <p className="text-[10px] text-accent/90 italic leading-snug">{u.jurisdictionalNotes}</p>
                    </div>
                  )}

                  {u.tiers && u.tiers.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/30 italic">Entry Targets:</span>
                       <div className="space-y-1">
                          {u.tiers.map((tier, i) => (
                             <div key={i} className="flex justify-between items-center text-[10px] text-white/70">
                                <span className="font-serif italic">{tier.name}</span>
                                <span className="font-mono text-accent">{tier.targetValue} {tier.targetType}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}
               </Card>
            ))}
         </div>
      )}
    </div>
  );
};
