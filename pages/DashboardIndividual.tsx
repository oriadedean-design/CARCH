import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/storage';
import { financeApi } from '../services/finance';
import { UserUnionTracking, Job, User } from '../types';
import { Heading, Text, Card, Badge, Button, ProgressBar } from '../components/ui';
import { ArrowUpRight, Landmark, Radar, BookOpen, HelpCircle, Info, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const DashStat = ({ label, value, subtext, highlight = false }: { label: string, value: string, subtext?: string, highlight?: boolean }) => (
  <div className={clsx("p-4 glass-ui rounded-none transition-all duration-500", highlight ? "border-accent/40 bg-accent/5" : "border-white/10 hover:border-white/20")}>
    <span className={clsx("text-[8px] font-black uppercase tracking-[0.4em] italic block", highlight ? "text-accent" : "text-white/40")}>{label}</span>
    <div className={clsx("text-3xl sm:text-4xl font-serif mt-2 mb-1 tracking-tighter italic leading-none", highlight ? "text-accent" : "text-white")}>{value}</div>
    {subtext && <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/30 italic truncate">{subtext}</p>}
  </div>
);

export const DashboardIndividual = () => {
  const navigate = useNavigate();
  const [tracking, setTracking] = useState<UserUnionTracking[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [financeStats, setFinanceStats] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const initializeDashboard = async () => {
      try {
        const u = await api.auth.getUser();
        if (!isMounted.current) return;
        setUser(u);
        
        const tracks = await api.tracking.get();
        if (!isMounted.current) return;
        setTracking(tracks);
        
        const jobList = await api.jobs.list();
        if (!isMounted.current) return;
        setJobs(jobList);
        
        const stats = financeApi.getStats();
        if (!isMounted.current) return;
        setFinanceStats(stats);
      } catch (e) {
        console.warn("Dashboard init aborted");
      }
    };
    initializeDashboard();
    return () => { isMounted.current = false; };
  }, []);

  if (!user) return null;

  const primaryTrack = tracking[0];
  const eligibilityProgress = primaryTrack ? api.tracking.calculateProgress(primaryTrack, jobs) : { percent: 0, current: 0, target: 0 };
  const gstProgress = financeStats ? financeApi.getThresholdProgress(financeStats.grossIncomeYTD) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <Badge color="accent">Professional Interface</Badge>
          <span className="text-[8px] font-black uppercase tracking-widest text-white/30 italic">
            {user.province} · {user.department || 'Crew'}
          </span>
        </div>
        
        <div className="flex items-end justify-between">
          <h1 className="heading-huge text-white">YOUR <span className="text-accent">WRAP.</span></h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/manual')} 
              className="h-10 px-3 text-[9px] border-white/20 flex items-center"
            >
               <BookOpen size={13} className="mr-1.5 text-accent" /> Manual
            </Button>
            <Button 
              onClick={() => navigate('/jobs/new')} 
              className="h-10 px-4 text-[9px] bg-white text-black hover:bg-accent flex items-center shadow-glow font-black"
            >
              <Plus size={13} className="mr-1" /> Log Dailies
            </Button>
          </div>
        </div>
      </header>

      {/* Primary Mobile Stat Grid: 2x2 grid */}
      <div className="grid grid-cols-2 gap-1">
        <DashStat 
          label="Guild Logic" 
          value={`${Math.round(eligibilityProgress.percent)}%`} 
          subtext={primaryTrack ? primaryTrack.unionName : 'IDLE'} 
          highlight 
        />
        <DashStat 
          label="Scale YTD" 
          value={`$${((financeStats?.grossIncomeYTD || 0) / 1000).toFixed(1)}k`} 
          subtext="Earnings" 
        />
        <DashStat label="The Vault" value="SECURE" subtext="Credentials OK" />
        <DashStat label="GST Status" value={`${Math.round(gstProgress)}%`} subtext="Threshold" />
      </div>

      {/* Target Trajectory Card */}
      <section className="glass-ui p-5 rounded-none border border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
             <Radar className="text-accent animate-pulse" size={16} />
             <h3 className="font-serif italic text-2xl text-white">Target Trajectory</h3>
          </div>
          <span className="text-[8px] font-mono text-white/40 uppercase">{jobs.length} Verified</span>
        </div>
        
        <div className="space-y-4">
          {tracking.map(t => {
            const { percent, current, target } = api.tracking.calculateProgress(t, jobs);
            return (
              <div key={t.id} className="space-y-2 p-3 bg-white/[0.02] border border-white/5 rounded-none">
                <div className="flex justify-between items-baseline">
                   <div>
                      <span className="text-lg font-serif italic text-white block leading-tight">{t.unionName}</span>
                      <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">
                        {t.tierLabel} · {current}/{target} {t.targetType}
                      </span>
                   </div>
                   <span className="text-2xl font-serif italic text-white">{Math.round(percent)}%</span>
                </div>
                <ProgressBar progress={percent} />
              </div>
            );
          })}
          
          {tracking.length === 0 && (
            <div className="py-8 text-center border border-dashed border-white/10 rounded-none opacity-30 text-xs italic">
              No active guild targets calibrated.
            </div>
          )}
        </div>
      </section>

      {/* Hub Context and Terminal Navigation */}
      <div className="space-y-2">
         <Card className="p-4 border-accent/20 bg-accent/5 rounded-none space-y-2">
            <div className="flex items-center gap-2 text-accent">
               <Landmark size={15} />
               <h4 className="text-[9px] font-black uppercase tracking-[0.4em] italic">Hub Calibration</h4>
            </div>
            <p className="text-xs text-white/70 italic leading-relaxed font-light">
               Personnel coordinates anchored to <span className="text-white font-medium">{user.province}</span>. Trajectories automatically calibrate local jurisdiction agreements.
            </p>
         </Card>

         <div 
           className="p-4 rounded-none glass-ui border border-white/10 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group" 
           onClick={() => navigate('/finance')}
         >
            <div>
               <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30 block italic">The Terminal</span>
               <p className="text-lg font-serif italic text-white">Wallet Intelligence</p>
            </div>
            <ArrowUpRight size={16} className="text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
         </div>
      </div>
    </div>
  );
};
