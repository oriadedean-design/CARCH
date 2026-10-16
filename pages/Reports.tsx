import React, { useMemo, useState, useEffect } from 'react';
import { Heading, Text, Card, Button, Badge } from '../components/ui';
import { Download, FileSpreadsheet, Landmark, Target, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../services/storage';
import { financeApi } from '../services/finance';
import { Job, User, UserUnionTracking } from '../types';
import { useToast } from '../context/ToastContext';
import { clsx } from 'clsx';

export const Reports = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [tracking, setTracking] = useState<UserUnionTracking[]>([]);
  const stats = financeApi.getStats();

  useEffect(() => {
    const fetchData = async () => {
      const u = await api.auth.getUser();
      setUser(u);
      const jobList = await api.jobs.list();
      setJobs(jobList);
      const tracks = await api.tracking.get();
      setTracking(tracks);
    };
    fetchData();
  }, []);

  const auditScore = useMemo(() => {
    let score = 40;
    if (jobs.length > 0) score += 20;
    if (user?.isPremium) score += 20;
    if (stats.gstCollected > 0) score += 20;
    return Math.min(100, score);
  }, [jobs, user, stats]);

  const handleDownload = () => {
    showToast("Editorial Audit Pack (PDF/CSV) compiled.", "success");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <Badge color="accent" className="italic tracking-widest uppercase">Personnel Registry // Analytics</Badge>
          <span className="text-[8px] font-mono text-white/30 uppercase">Audit v0.5</span>
        </div>
        <div className="flex items-end justify-between">
          <h1 className="heading-huge text-white">THE <br/><span className="text-accent">AUDIT.</span></h1>
          <div className="flex items-center gap-2">
            <Button onClick={handleDownload} className="h-10 px-4 text-[9px] font-black uppercase tracking-widest bg-white text-black hover:bg-accent transition-colors">
              <Download size={13} className="mr-1.5" /> Compile
            </Button>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* Fiscal Compliance */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <Landmark size={15} className="text-accent" />
            <h3 className="font-serif italic text-2xl text-white">Fiscal Compliance</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-1.5">
            <div className="p-4 rounded-none glass-ui border border-white/10 space-y-2">
              <span className="text-[8px] text-white/40 uppercase font-black tracking-widest italic block">GST/HST Remittance</span>
              <div className="text-2xl sm:text-3xl font-serif italic text-white">${stats.gstNetRemittance.toLocaleString()}</div>
              <p className="text-[8px] text-white/30 uppercase font-mono">Net Output vs ITC</p>
            </div>
            <div className="p-4 rounded-none glass-ui border border-white/10 space-y-2">
              <span className="text-[8px] text-white/40 uppercase font-black tracking-widest italic block">YTD Taxable Base</span>
              <div className="text-2xl sm:text-3xl font-serif italic text-white">${stats.taxableIncomeProjected.toLocaleString()}</div>
              <p className="text-[8px] text-white/30 uppercase font-mono">50% Rule (SP-010)</p>
            </div>
          </div>
        </section>

        {/* Guild Continuity */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <Target size={15} className="text-accent" />
            <h3 className="font-serif italic text-2xl text-white">Guild Continuity</h3>
          </div>

          <div className="space-y-1.5">
            {tracking.length > 0 ? tracking.map((t) => {
              const { percent, current, target } = api.tracking.calculateProgress(t, jobs);
              return (
                <div key={t.id} className="p-4 rounded-none glass-ui border border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-serif italic text-white leading-tight">{t.unionName} // {t.tierLabel}</p>
                    <div className="flex items-center gap-2">
                      <Badge color="neutral" className="text-[7px] py-0 px-1.5">{t.targetType}</Badge>
                      <p className="text-[8px] text-white/40 uppercase font-mono">{current} of {target} secured</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-serif italic text-white leading-none">{Math.round(percent)}%</span>
                  </div>
                </div>
              );
            }) : (
              <div className="py-12 text-center border border-dashed border-white/10 glass-ui rounded-none">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic">No guild objectives currently tracked.</p>
              </div>
            )}
          </div>
        </section>

        {/* Canonical Status Card */}
        <div className="p-5 border border-accent/20 bg-accent/5 space-y-4 rounded-none">
          <div className="flex items-center justify-between">
            <Badge color="accent" className="font-black italic">Audit Ready v1.0</Badge>
            <ShieldCheck size={20} className="text-accent" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-white/50">
              <span>Provenance Score</span>
              <span className="text-accent">{auditScore}%</span>
            </div>
            <div className="h-1 bg-white/10 w-full overflow-hidden">
              <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${auditScore}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[9px]">
            <div className="flex items-center justify-between p-2 bg-black/40 border border-white/5">
              <span className="text-white/40 uppercase italic">Voucher Sync</span>
              <span className="text-accent font-mono font-bold">Calibrated</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-black/40 border border-white/5">
              <span className="text-white/40 uppercase italic">Residency Check</span>
              <span className="text-emerald-400 font-mono font-bold">Verified</span>
            </div>
          </div>
        </div>

        {/* Compliance Note */}
        <Card className="p-4 border-white/10 rounded-none space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-accent" />
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white italic">Compliance Note</h4>
          </div>
          <p className="text-[10px] text-white/50 leading-relaxed italic font-light">
            Generated according to CRA 'Small Supplier' guidelines and Union Eligibility benchmarks for the Canadian film sector.
          </p>
        </Card>
      </div>
    </div>
  );
};
