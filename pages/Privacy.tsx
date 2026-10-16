import React from 'react';
import { Heading, Text, Card, Badge } from '../components/ui';
import { Shield, Lock, EyeOff, Scale, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Privacy = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 py-4 animate-in fade-in duration-500 max-w-lg mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors p-1 italic"
      >
          <ArrowLeft size={14} /> Back to Library
      </button>

      <header className="space-y-2 border-b border-white/10 pb-4">
         <Badge color="accent">Legal Architecture</Badge>
         <h1 className="heading-huge text-white">THE <span className="text-accent">CHARTER.</span></h1>
         <p className="text-xs text-white/60 font-light italic leading-relaxed">
           How we protect your craft through radical transparency and zero-exploitation protocols.
         </p>
      </header>

      <div className="space-y-2">
         <Card className="p-4 space-y-2 rounded-none border-white/10">
            <div className="flex items-center gap-2 text-accent">
               <Shield size={16} />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] italic">Zero Exploitation</h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-light italic">
              We do not sell your financial data. Earnings, voucher uploads, and tax metadata are sovereign and encrypted.
            </p>
         </Card>

         <Card className="p-4 space-y-2 rounded-none border-white/10">
            <div className="flex items-center gap-2 text-accent">
               <Lock size={16} />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] italic">Local Encryption</h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-light italic">
              CineArch utilizes client-side encryption. Private deal memos and payroll stubs remain inaccessible to outside parties.
            </p>
         </Card>

         <Card className="p-4 space-y-2 rounded-none border-white/10">
            <div className="flex items-center gap-2 text-accent">
               <Scale size={16} />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] italic">The Purge Protocol</h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-light italic">
              At any time, you may trigger an Account Purge in Base Camp settings to permanently wipe all stored records.
            </p>
         </Card>
      </div>

      <div className="pt-2 text-center text-[8px] text-white/20 uppercase tracking-[0.4em] font-mono">
         Pipeda & Law Compliance Certified
      </div>
    </div>
  );
};
