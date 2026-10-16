import React from 'react';
import { Heading, Text, Button, Card, Badge } from '../components/ui';
import { ArrowRight, Shield, Target, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PLANS, UNIONS } from '../types';
import { clsx } from 'clsx';

export const Welcome = ({ onEnter }: { onEnter: (asAgent?: boolean) => void }) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[100dvh] font-sans text-textPrimary bg-black overflow-x-hidden space-y-12">
      {/* Hero Section */}
      <section className="relative min-h-[75dvh] flex flex-col justify-center items-center px-4 py-8 text-center">
        <div className="space-y-5 z-10 max-w-sm sm:max-w-md">
          <span className="block text-accent text-[9px] font-black uppercase tracking-[0.6em] italic animate-in fade-in slide-in-from-bottom-2">
            Your Digital Interface for Cinema
          </span>
          <h1 className="heading-huge text-white">
            YOUR INDUSTRY <br /> <span className="text-accent">INTERFACE.</span>
          </h1>
          <p className="text-xs text-white/60 font-light italic leading-relaxed max-w-xs mx-auto">
            Calibrated for Canadian film workers. Track union eligibility, log dailies, and manage documents with precision.
          </p>
          <div className="pt-6 flex flex-col gap-3 w-full">
             <Button onClick={() => onEnter(false)} className="w-full h-14 text-[10px] tracking-[0.4em] shadow-glow font-black">
               Initialize Your Profile <ArrowRight className="ml-3" size={14}/>
             </Button>
             <Button onClick={() => onEnter(true)} variant="secondary" className="w-full h-14 text-[10px] tracking-[0.4em] font-black">
               Command Your Agency
             </Button>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-full pointer-events-none opacity-15">
           <img src="https://i.pinimg.com/736x/86/bc/62/86bc625fc438194940ed2003b8c263d1.jpg" className="absolute top-12 right-2 w-48 grayscale" alt="Production Detail" />
           <img src="https://i.pinimg.com/736x/84/ec/58/84ec58f9ee5d374d9ebbb0c0bfea1885.jpg" className="absolute bottom-12 left-2 w-48 grayscale" alt="Technical Layout" />
        </div>
      </section>

      {/* Jurisdictional Logic Section */}
      <section className="py-8 border-y border-white/5 bg-surface/50 backdrop-blur-3xl">
         <div className="space-y-6">
            <div className="space-y-2">
               <Badge color="accent">Jurisdictional Intelligence</Badge>
               <h2 className="font-serif text-3xl sm:text-4xl italic text-white leading-tight">Calibrated for <br/> Your Hub.</h2>
               <p className="text-xs text-white/40 font-light italic leading-relaxed">
                 From IATSE 873 Toronto to Local 634 Northern Ontario and DGC/ACTRA National standards. We track your eligibility in real-time.
               </p>
            </div>
            
            <Button onClick={() => navigate('/manual')} variant="outline" className="w-full h-12 border-accent/20 text-accent group text-[10px] tracking-[0.3em]">
               Open Your Field Manual <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="grid grid-cols-2 gap-1.5">
               {UNIONS.map(u => (
                  <div key={u.id} className="p-4 glass-ui rounded-none flex flex-col justify-between gap-4 group hover:border-accent/30 transition-all min-h-[140px] border border-white/10">
                     <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-accent tracking-[0.2em] block">{u.name}</span>
                        <span className="text-[8px] font-black uppercase text-white/20 tracking-widest leading-relaxed block line-clamp-2">{u.description}</span>
                     </div>
                     <div className="pt-2 border-t border-white/5">
                        <p className="text-[7px] font-black uppercase text-white/20 tracking-widest">Entry Protocol</p>
                        <p className="text-xs text-white/60 font-serif italic">${u.applicationFee || 0} Initiation</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Brand Ethos */}
      <section className="py-4">
         <div className="space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl italic text-white tracking-tight uppercase leading-none">Authority. <br/>Precision. <br/>Discretion.</h2>
            <div className="space-y-3 text-xs md:text-sm font-light text-textSecondary leading-relaxed italic">
               <p>CineArch is your cinematic platform built to navigate the complexities of the Canadian film industry. We bridge the gap between your chaotic production schedule and your professional compliance.</p>
               <p>Empowering you to log jobs, track union eligibility, and secure financial records with absolute architectural focus.</p>
            </div>
            <div className="pt-2">
               <button onClick={() => navigate('/about')} className="text-accent text-[9px] font-black uppercase tracking-[0.6em] border-b border-accent/30 pb-1 hover:text-white transition-colors italic">
                 Read Your Charter &rarr;
               </button>
            </div>
         </div>
      </section>

      {/* Membership Section */}
      <section className="py-6 border-t border-white/5">
        <div className="space-y-6">
          <h2 className="heading-huge text-center uppercase italic">Your Membership.</h2>
          <div className="space-y-3">
             {Object.values(PLANS).map((plan) => (
               <div key={plan.id} className={clsx("p-6 border rounded-none flex flex-col transition-all duration-500", plan.id === 'pro' ? "bg-accent/5 border-accent/20" : "bg-black/40 border-white/10")}>
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="text-xl font-serif italic text-white">{plan.label}</h3>
                   <span className="text-3xl font-serif text-white italic tracking-tighter">{plan.price}<span className="text-[10px] font-sans text-textTertiary ml-1">/mo</span></span>
                 </div>
                 <p className="text-[8px] font-black uppercase tracking-widest text-textTertiary mb-4">{plan.desc}</p>
                 <ul className="space-y-2.5 mb-6 border-t border-white/10 pt-4">
                    {plan.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-xs font-medium text-textSecondary italic">
                        <span className="text-accent font-bold">+</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                 </ul>
                 <Button onClick={() => onEnter(plan.id === 'agency')} className={clsx("w-full h-14 text-[10px] tracking-[0.4em] font-black", plan.id === 'pro' ? "bg-accent text-black hover:bg-yellow-400" : "bg-white/10 text-white hover:bg-white")}>
                   Select Your Tier
                 </Button>
               </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};
