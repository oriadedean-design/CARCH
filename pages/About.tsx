import React from 'react';
import { Heading, Text, Badge, Card } from '../components/ui';
import { Shield, Camera, Landmark, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const About = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 py-4 animate-in fade-in duration-500 max-w-lg mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors p-1 italic"
      >
         <ArrowLeft size={14} /> Previous Scene
      </button>

      <header className="space-y-2 border-b border-white/10 pb-4">
        <Badge color="accent">Brand Charter</Badge>
        <h1 className="heading-huge text-white">AUTHORITY. <br/><span className="text-accent">PRECISION.</span></h1>
        <p className="text-xs text-white/50 font-light leading-relaxed italic">
          CineArch exists in the space between the camera lens and the archival vault. We build precision tools for the technical and creative backbone of the Canadian film industry.
        </p>
      </header>

      <div className="space-y-2">
        <Card className="p-5 border-white/10 space-y-3 rounded-none">
           <div className="w-10 h-10 bg-accent/10 border border-accent/20 flex items-center justify-center text-accent rounded-none">
              <Shield size={18} />
           </div>
           <h3 className="text-2xl font-serif italic text-white">Discretion.</h3>
           <p className="text-xs text-white/60 leading-relaxed font-light italic">
              Your professional coordinates are your own. We utilize sovereign client-side encryption to ensure deal memos and financial records remain private.
           </p>
        </Card>
        
        <Card className="p-5 border-white/10 space-y-3 rounded-none">
           <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-white/40 rounded-none">
              <Camera size={18} />
           </div>
           <h3 className="text-2xl font-serif italic text-white">Cinema Native.</h3>
           <p className="text-xs text-white/60 leading-relaxed font-light italic">
              Everything we build respects the unit economics of set life. No rounded corners. No clutter. Just technical UI built for crew, by people who understand the gate.
           </p>
        </Card>
      </div>

      <section className="space-y-3 border-t border-white/10 pt-4">
         <div className="flex items-center gap-2 text-accent">
            <Landmark size={18} />
            <h2 className="text-2xl font-serif italic text-white uppercase tracking-tight">The Legacy.</h2>
         </div>
         <div className="space-y-2 text-xs text-white/50 font-light italic leading-relaxed">
            <p>CineArch was conceived to bridge the gap between chaotic production schedules and rigorous financial compliance. We recognize the nuanced boundaries between technical Locals—from the IATSE 873 hub in Toronto to the vast 634 jurisdiction in Northern Ontario.</p>
            <p>We are a digital infrastructure designed to track your journey from permittee to full guild membership.</p>
         </div>
      </section>

      <footer className="text-center py-6 border-t border-white/5 space-y-1">
         <span className="font-serif italic text-4xl text-accent block">Ca</span>
         <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/20">Archival Systems // v0.5 BUILD</p>
      </footer>
    </div>
  );
};
