import React, { useState, useEffect } from 'react';
import { api } from '../services/storage';
import { Job, User } from '../types';
import { Heading, Text, Button, Badge } from '../components/ui';
import { BulkJobUploadEnterprise } from '../components/BulkJobUploadEnterprise';
import { Shield, UploadCloud, Plus, UserCheck, Lock, Layers, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export const JobsEnterprise = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<{job: Job, clientName: string}[]>([]);
  const [showIngest, setShowIngest] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const u = await api.auth.getUser();
      setUser(u);
      
      if (!u?.managedUsers || u.managedUsers.length === 0) {
        setJobs([]);
        return;
      }

      const allJobs: {job: Job, clientName: string}[] = [];
      
      await Promise.all(u.managedUsers.map(async (client) => {
        const clientJobs = await api.jobs.listForClient(client.id);
        clientJobs.forEach((j: Job) => {
          allJobs.push({ job: j, clientName: client.name });
        });
      }));

      setJobs(allJobs.sort((a, b) => 
        new Date(b.job.startDate).getTime() - new Date(a.job.startDate).getTime()
      ));
    } catch (err) {
      console.error("Aggregation Failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    refresh(); 
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
           <Badge color="accent">Master Ledger</Badge>
           <span className="text-[8px] font-black uppercase text-white/30 tracking-widest italic">{jobs.length} Aggregate Marks</span>
        </div>
        <div className="flex items-end justify-between">
          <h1 className="heading-huge text-white">THE <span className="text-accent">AGGREGATE.</span></h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowIngest(!showIngest)} 
              className={clsx(
                "h-10 px-3 text-[9px] border-white/20 flex items-center rounded-none", 
                showIngest && "bg-white text-black"
              )}
            >
               <UploadCloud size={13} className="mr-1.5" /> Ingest
            </Button>
            <Button 
              onClick={() => navigate('/roster')} 
              className="bg-accent text-black h-10 px-3.5 text-[9px] font-black flex items-center hover:bg-yellow-400 rounded-none"
            >
              <Users size={13} className="mr-1" /> Roster
            </Button>
          </div>
        </div>
      </header>

      {showIngest && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <BulkJobUploadEnterprise 
            userId={user?.id || 'anon'} 
            onComplete={() => { setShowIngest(false); refresh(); }} 
          />
        </div>
      )}

      <div className="space-y-2">
        {jobs.map(({ job, clientName }, idx) => (
          <div 
            key={`${job.id}-${idx}`} 
            className="glass-ui p-4 rounded-none border border-white/10 space-y-2 hover:border-accent/40 active:scale-[0.99] transition-all"
          >
            <div className="flex justify-between items-center">
               <span className="text-[8px] font-black text-accent uppercase tracking-widest italic">{clientName}</span>
               <span className="text-[8px] font-mono text-white/30">{job.startDate}</span>
            </div>
            
            <div className="flex justify-between items-end">
               <div>
                 <h3 className="text-lg font-serif italic text-white leading-tight">{job.productionName}</h3>
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-0.5">{job.role}</p>
               </div>
               <div className="text-right">
                 <Badge color={job.isUnion ? "accent" : "neutral"} className="text-[8px]">
                   {job.isUnion ? (job.unionName || 'Union') : 'Non-Union'}
                 </Badge>
                 <span className="block text-base font-serif italic text-white mt-1">
                   ${(job.grossEarnings || 0).toLocaleString()}
                 </span>
               </div>
            </div>
          </div>
        ))}

        {jobs.length === 0 && !loading && (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-none opacity-30 text-xs italic space-y-2">
             <Layers className="mx-auto w-8 h-8 opacity-40 text-accent" />
             <p>No production marks in aggregate roster.</p>
             <button 
               onClick={() => navigate('/roster')}
               className="text-[9px] font-black uppercase text-accent tracking-[0.3em] underline pt-2 italic"
             >
               Configure Roster Members
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
