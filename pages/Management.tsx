import React, { useState, useEffect } from 'react';
import { api } from '../services/storage';
import { User, Job } from '../types';
import { Heading, Text, Card, Badge, Button, Input, IOSSheet } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { Search, Plus, UserPlus, Mail, Phone, ChevronRight, UploadCloud, ArrowUpRight, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BulkJobUpload } from '../components/BulkJobUpload';
import { clsx } from 'clsx';

export const Management = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [agent, setAgent] = useState<User | null>(null);
  const [roster, setRoster] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showIngest, setShowIngest] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  useEffect(() => {
    const initManagement = async () => {
      const u = await api.auth.getUser();
      if (u?.accountType !== 'AGENT') {
        navigate('/');
        return;
      }
      setAgent(u);
      setRoster(u.managedUsers || []);
    };
    initManagement();
  }, [navigate]);

  const filteredRoster = roster.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImpersonate = (clientId: string) => {
    api.auth.switchClient(clientId);
    showToast("Switched to client slate.", "info");
    navigate('/');
  };

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) {
      showToast("Name and email are required.", "error");
      return;
    }

    const newClient: User = {
      id: `client_${Date.now()}`,
      name: newClientName.trim(),
      email: newClientEmail.trim(),
      role: 'Talent',
      province: 'Ontario',
      isOnboarded: true,
      accountType: 'INDIVIDUAL',
      isPremium: true
    };
    api.auth.addClient(newClient);
    setRoster(prev => [...prev, newClient]);
    setIsAddModalOpen(false);
    setNewClientName('');
    setNewClientEmail('');
    showToast("Personnel added to Roster.", "success");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
           <Badge color="accent">Management Terminal</Badge>
           <span className="text-[8px] font-black uppercase text-white/30 tracking-widest italic">{roster.length} Personnel Registered</span>
        </div>
        <div className="flex items-end justify-between">
          <h1 className="heading-huge text-white">THE <span className="text-accent">ROSTER.</span></h1>
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="h-10 px-4 text-[9px] font-black bg-accent text-black hover:bg-yellow-400 flex items-center"
          >
             <UserPlus size={13} className="mr-1" /> Add Talent
          </Button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
         <Input 
           placeholder="Search roster by name or email..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
           className="pl-11 h-12 text-sm border-white/10 rounded-none font-serif italic"
         />
      </div>

      {/* Roster Cards */}
      <div className="space-y-2">
         {filteredRoster.map((client) => (
            <Card key={client.id} className="p-4 rounded-none border border-white/10 space-y-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-accent/5 border border-accent/20 flex items-center justify-center font-serif italic text-2xl text-accent rounded-none">
                        {client.name.charAt(0)}
                     </div>
                     <div>
                        <h3 className="text-lg font-serif italic text-white leading-tight">{client.name}</h3>
                        <p className="text-[9px] text-white/40 font-mono truncate max-w-[180px]">{client.email}</p>
                     </div>
                  </div>
                  <Badge color="neutral" className="text-[8px]">{client.selectedRoles?.[0] || 'Crew'}</Badge>
               </div>

               <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowIngest(showIngest === client.id ? null : client.id)}
                    className={clsx("h-10 flex-1 text-[8px] border-white/10", showIngest === client.id && "bg-accent text-black")}
                  >
                     <UploadCloud size={12} className="mr-1" /> Mark Slate
                  </Button>
                  <Button 
                    onClick={() => handleImpersonate(client.id)}
                    className="h-10 flex-1 text-[8px] bg-white text-black hover:bg-accent"
                  >
                     View Slate <ArrowUpRight size={12} className="ml-1" />
                  </Button>
               </div>

               {/* Inline Proxy Ingestor */}
               {showIngest === client.id && (
                  <div className="p-4 bg-white/[0.02] border-t border-white/10 rounded-none space-y-3 animate-in slide-in-from-top-2 duration-300">
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-accent italic">Ingest Engine // {client.name}</span>
                        <button onClick={() => setShowIngest(null)} className="text-white/40 hover:text-white p-1"><X size={14} /></button>
                     </div>
                     <BulkJobUpload userId={client.id} onComplete={() => { setShowIngest(null); showToast("Dailies ingested for " + client.name, "success"); }} />
                  </div>
               )}
            </Card>
         ))}

         {filteredRoster.length === 0 && (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-none opacity-30 text-xs italic space-y-3">
               <p>No personnel records found.</p>
               <Button onClick={() => setIsAddModalOpen(true)} variant="outline" className="h-10 text-[9px] border-white/20">
                 Add First Talent
               </Button>
            </div>
         )}
      </div>

      {/* CINEARCH SHUTTER SHEET FOR ADDING TALENT */}
      <IOSSheet
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Personnel"
        subtitle="AGENCY ROSTER INGEST"
      >
        <form onSubmit={handleAddClientSubmit} className="space-y-4">
           <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Talent Full Name</label>
              <Input 
                value={newClientName} 
                onChange={e => setNewClientName(e.target.value)} 
                placeholder="e.g. Sarah Jenkins"
                className="h-12 text-base font-serif italic"
                required
                autoFocus
              />
           </div>

           <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Production Email</label>
              <Input 
                type="email"
                value={newClientEmail} 
                onChange={e => setNewClientEmail(e.target.value)} 
                placeholder="talent@cinema.ca"
                className="h-12 text-sm font-mono"
                required
              />
           </div>

           <div className="pt-2">
              <Button type="submit" className="w-full h-12 text-[10px] tracking-[0.4em] bg-accent text-black hover:bg-yellow-400 font-black">
                Commit Talent to Roster
              </Button>
           </div>
        </form>
      </IOSSheet>
    </div>
  );
};
