import React, { useEffect, useState } from 'react';
import { api } from '../services/storage';
import { Job, User, UserUnionTracking } from '../types';
import { Heading, Badge, Card, Button } from '../components/ui';
import { GanttChartSquare, Zap, Users, Briefcase, Plus, ShieldOff, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface RosterMember {
  client: User;
  jobs: Job[];
  tracks: UserUnionTracking[];
}

export const DashboardEnterprise = () => {
  const navigate = useNavigate();
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadRoster = async () => {
      const u = await api.auth.getUser();
      setUser(u);
      if (!u?.managedUsers) return;
      
      const data: RosterMember[] = await Promise.all(u.managedUsers.map(async (client) => {
        const jobs = await api.jobs.listForClient(client.id);
        const tracks = await api.tracking.get(client.id);
        return { client, jobs, tracks };
      }));
      setRoster(data);
    };
    
    loadRoster();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
           <Badge color="accent">Agency Intelligence</Badge>
           <span className="text-[8px] font-black uppercase tracking-widest text-white/30 italic">{roster.length} Personnel Active</span>
        </div>
        <div className="flex items-end justify-between">
          <h1 className="heading-huge text-white">SHOW <span className="text-accent">RUNNER.</span></h1>
          <Button 
            onClick={() => navigate('/roster')} 
            className="h-10 px-4 text-[9px] font-black bg-accent text-black hover:bg-yellow-400 flex items-center"
          >
            <Users size={13} className="mr-1" /> Roster
          </Button>
        </div>
      </header>

      {/* Overview Stat Card */}
      <div className="grid grid-cols-2 gap-1">
         <div className="p-4 rounded-none glass-ui border-accent/30 bg-accent/5 space-y-1">
            <span className="text-[8px] font-black uppercase text-accent tracking-[0.3em] italic">Active Roster</span>
            <div className="text-4xl font-serif text-white italic leading-tight">{roster.length}</div>
            <p className="text-[8px] text-white/40 italic">Verified Personnel</p>
         </div>
         <div className="p-4 rounded-none glass-ui border border-white/10 space-y-1">
            <span className="text-[8px] font-black uppercase text-white/40 tracking-[0.3em] italic">Aggregate Marks</span>
            <div className="text-4xl font-serif text-white italic leading-tight">
              {roster.reduce((acc, curr) => acc + curr.jobs.length, 0)}
            </div>
            <p className="text-[8px] text-white/40 italic">Production Slates</p>
         </div>
      </div>

      {/* Roster & Tactical Schedule */}
      <section className="space-y-3">
         <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
               <Calendar className="text-accent" size={16} />
               <h3 className="font-serif italic text-2xl text-white">Tactical Schedule</h3>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/30 italic">Live Roster Sync</span>
         </div>

         <div className="space-y-1.5">
            {roster.map(({ client, jobs }) => (
               <div key={client.id} className="p-4 rounded-none glass-ui border border-white/10 space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-accent/10 border border-accent/20 flex items-center justify-center text-[10px] font-black italic text-accent">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-base font-serif italic text-white block leading-tight">{client.name}</span>
                          <span className="text-[8px] text-white/40 font-mono uppercase">{client.province} · {client.department || 'Crew'}</span>
                        </div>
                     </div>
                     <Badge color={jobs.length > 0 ? "accent" : "neutral"} className="text-[8px]">
                       {jobs.length} Slates
                     </Badge>
                  </div>

                  {jobs.length > 0 ? (
                     <div className="space-y-1 pt-1">
                        {jobs.slice(0, 2).map((job) => (
                           <div key={job.id} className="flex justify-between items-center text-xs text-white/70 italic">
                              <span className="truncate max-w-[200px]">{job.productionName}</span>
                              <span className="text-[9px] font-mono text-white/40">{job.startDate}</span>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-[9px] text-white/30 italic">No current production marks logged.</p>
                  )}
               </div>
            ))}

            {roster.length === 0 && (
               <div className="py-14 text-center border border-dashed border-white/10 rounded-none opacity-30 text-xs italic">
                  No roster members linked. Connect crew via Management terminal.
               </div>
            )}
         </div>
      </section>

      {/* Quick Action Dock */}
      <div className="grid grid-cols-2 gap-1.5 pt-2">
         <Button 
           onClick={() => navigate('/roster')} 
           variant="secondary"
           className="h-12 text-[9px] flex items-center justify-center font-black"
         >
           <Users size={13} className="mr-1.5" /> Manage Crew
         </Button>
         <Button 
           onClick={() => navigate('/jobs/new')} 
           className="h-12 text-[9px] bg-white text-black hover:bg-accent flex items-center justify-center font-black shadow-glow"
         >
           <Plus size={13} className="mr-1.5" /> New Slate Mark
         </Button>
      </div>
    </div>
  );
};
