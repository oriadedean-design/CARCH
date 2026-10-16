import React, { useState, useEffect } from 'react';
import { api } from '../services/storage';
import { Job, User } from '../types';
import { Heading, Text, Button, Badge } from '../components/ui';
import { BulkJobUploadIndividual } from '../components/BulkJobUploadIndividual';
import { UploadCloud, Plus, Layers, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export const JobsIndividual = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showIngest, setShowIngest] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const refresh = async () => {
    const u = await api.auth.getUser();
    setUser(u);
    const jobList = await api.jobs.list();
    setJobs(jobList);
  };
  
  useEffect(() => { refresh(); }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
           <Badge color="accent">Production Ledger</Badge>
           <span className="text-[8px] font-black uppercase text-white/30 tracking-widest italic">{jobs.length} Verified Marks</span>
        </div>

        <div className="flex items-end justify-between">
          <h1 className="heading-huge text-white">THE <span className="text-accent">SLATE.</span></h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowIngest(!showIngest)} 
              className={clsx("h-10 px-3 text-[9px] border-white/20 flex items-center", showIngest && "bg-white text-black")}
            >
               <UploadCloud size={13} className="mr-1.5" /> Ingest
            </Button>
            <Button 
              onClick={() => navigate('/jobs/new')} 
              className="bg-accent text-black h-10 px-3.5 text-[9px] font-black flex items-center hover:bg-yellow-400"
            >
              <Plus size={13} className="mr-1" /> Mark Slate
            </Button>
          </div>
        </div>
      </header>

      {showIngest && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <BulkJobUploadIndividual userId={user?.id || 'anon'} onComplete={() => { setShowIngest(false); refresh(); }} />
        </div>
      )}

      {/* Grid of Slates: Sharp CineArch Rectangular Cards */}
      <div className="space-y-2">
        {jobs.map(job => (
          <div 
            key={job.id} 
            onClick={() => navigate(`/jobs/${job.id}`)} 
            className="glass-ui p-5 rounded-none border border-white/10 hover:border-accent/40 active:scale-[0.99] transition-all cursor-pointer space-y-3"
          >
            <div className="flex justify-between items-center">
               <Badge color={job.isUnion ? "accent" : "neutral"}>
                 {job.isUnion ? (job.unionName || 'Union') : 'Non-Union'}
               </Badge>
               <span className="text-[8px] font-black uppercase tracking-widest text-white/30 italic">{job.startDate}</span>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-serif italic text-white leading-tight">{job.productionName}</h3>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">{job.role}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-serif italic text-white">
                  ${(job.grossEarnings || 0).toLocaleString()}
                </span>
                <span className="text-[7px] block font-black uppercase tracking-widest text-white/20">Gross Scale</span>
              </div>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-none opacity-30 italic space-y-2">
             <Layers className="mx-auto w-8 h-8 opacity-40 text-accent" />
             <p className="text-xs">Personnel slate is clear.</p>
             <button 
               onClick={() => navigate('/jobs/new')}
               className="text-[9px] font-black uppercase text-accent tracking-[0.3em] underline pt-2"
             >
               Record First Production Day
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
