import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heading, Badge, Card } from '../components/ui';
import { ArrowLeft } from 'lucide-react';
import { Article } from '../types';

const ARTICLES: Article[] = [
  {
    slug: 'ontario-union-guide',
    title: 'Ontario Jurisdictional Alignment',
    subtitle: 'Navigating IATSE 873, 411, 667 and the DGC boundaries in the Toronto hub.',
    category: 'UNION',
    date: 'Jan 15, 2025',
    readTime: '10 min read',
    author: 'CineArch Editorial',
    imageUrl: 'https://i.pinimg.com/1200x/5e/42/57/5e4257679a36daca5536198bb55a92dc.jpg',
    content: (
      <div className="space-y-4">
        <p className="text-base font-serif leading-relaxed text-gray-300 italic">
          "The landscape of Ontario film is a puzzle of specific Locals. Knowing where your role fits isn't just about dues—it's about eligibility."
        </p>
        <h3 className="text-lg font-bold text-white mt-4 mb-2">The DGC/IATSE Divide</h3>
        <p className="text-sm text-gray-400 leading-relaxed font-light italic">
          In Ontario, job titles like Art Director, Locations, and Set P.A. are strictly covered by the Directors Guild of Canada (DGC). This differs from many US jurisdictions where these may fall under IATSE.
        </p>
        <div className="p-4 rounded-none glass-ui border-accent/20 bg-accent/5 my-4 space-y-1">
           <h4 className="text-accent font-black uppercase text-[9px] tracking-widest italic">Quick Check: Local 411</h4>
           <p className="text-xs text-white/80 italic">Office P.A.s, Production Coordinators, and Craft Services are all protected by IATSE 411 in Ontario.</p>
        </div>
      </div>
    )
  }
];

export const Resources = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  if (slug) {
    const article = ARTICLES.find(a => a.slug === slug);
    if (!article) return null;
    return (
      <div className="max-w-lg mx-auto py-4 space-y-5 animate-in fade-in duration-300">
        <button onClick={() => navigate('/resources')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white p-1 italic">
           <ArrowLeft size={14} /> Back to Archive
        </button>
        <div className="rounded-none overflow-hidden border border-white/10">
          <img src={article.imageUrl} className="w-full aspect-video object-cover grayscale brightness-75" />
        </div>
        <div className="space-y-3">
           <Badge color="accent">{article.category}</Badge>
           <h1 className="font-serif italic text-2xl sm:text-3xl text-white leading-tight">{article.title}</h1>
           <div className="text-white/70 leading-relaxed font-light text-sm pt-2 border-t border-white/10 italic">
             {article.content}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
           <Badge color="accent">Industry Library</Badge>
           <span className="text-[8px] font-black uppercase text-white/30 tracking-widest italic">Field Briefs</span>
        </div>
        <h1 className="heading-huge text-white">THE <span className="text-accent">CHRONICLE.</span></h1>
      </header>

      <div className="space-y-3">
        {ARTICLES.map(a => (
          <Card 
            key={a.slug} 
            onClick={() => navigate(`/resources/${a.slug}`)} 
            className="p-0 border-white/10 rounded-none group overflow-hidden cursor-pointer"
          >
             <div className="h-36 overflow-hidden relative">
                <img src={a.imageUrl} className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40" />
             </div>
             <div className="p-4 space-y-2">
                <span className="text-[8px] font-black text-accent uppercase tracking-widest italic">{a.category} · {a.readTime}</span>
                <h3 className="text-xl font-serif italic text-white leading-snug">{a.title}</h3>
                <p className="text-xs text-white/40 italic line-clamp-2 font-light">{a.subtitle}</p>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
