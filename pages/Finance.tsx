import React, { useState, useEffect } from 'react';
import { Heading, Text, Card, Button, Input, Select, Badge, ProgressBar, IOSSheet } from '../components/ui';
import { Lock, Crown, Plus, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Calculator, PieChart, FileText, Landmark, Wallet } from 'lucide-react';
import { api } from '../services/storage';
import { financeApi } from '../services/finance';
import { User, FinanceTransaction, FinanceStats, UNIONS, UserUnionTracking } from '../types';
import { useToast } from '../context/ToastContext';
import { clsx } from 'clsx';

export const Finance = () => {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tracking, setTracking] = useState<UserUnionTracking[]>([]);
  
  // Local Form State
  const [form, setForm] = useState({
      type: 'EXPENSE',
      category: 'MEALS_ENTERTAINMENT',
      amount: '',
      tax: '',
      desc: '',
      date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const initFinance = async () => {
      const u = await api.auth.getUser();
      setUser(u);
      if (u?.isPremium) {
        setTransactions(financeApi.list());
        setStats(financeApi.getStats());
        const tracks = await api.tracking.get();
        setTracking(tracks);
      }
    };
    initFinance();
  }, []);

  const isPremium = user?.isPremium;

  const refreshData = async () => {
      setTransactions(financeApi.list());
      setStats(financeApi.getStats());
      const tracks = await api.tracking.get();
      setTracking(tracks);
  };

  const handleUpgrade = async () => {
      if (user) {
          const updated = { ...user, isPremium: true };
          await api.auth.updateUser(updated);
          setUser(updated);
          showToast('Wallet Activated.', 'success');
          refreshData();
      }
  };

  const handleAddTransaction = () => {
      const amount = parseFloat(form.amount) || 0;
      const tax = parseFloat(form.tax) || 0;
      if (!form.desc.trim()) {
        showToast('Please provide a description.', 'error');
        return;
      }
      if (amount <= 0) {
        showToast('Please enter a valid amount.', 'error');
        return;
      }

      financeApi.add({
          userId: user?.id || 'unknown',
          type: form.type as any,
          category: form.category,
          amountBeforeTax: amount,
          taxAmount: tax,
          totalAmount: amount + tax,
          description: form.desc,
          dateIncurred: form.date,
          businessUsePercent: 100
      });
      setIsAddModalOpen(false);
      showToast('Record logged to ledger.', 'success');
      refreshData();
      setForm({ type: 'EXPENSE', category: 'MEALS_ENTERTAINMENT', amount: '', tax: '', desc: '', date: new Date().toISOString().split('T')[0] });
  };

  if (!isPremium) {
      return (
          <div className="min-h-[70dvh] flex flex-col items-center justify-center p-4 text-center">
              <div className="w-full max-w-sm glass-ui p-8 rounded-none border border-white/20 space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-accent/10 border border-accent/40 flex items-center justify-center mx-auto shadow-glow rounded-none">
                      <Lock className="w-7 h-7 text-accent" />
                  </div>
                  <div className="space-y-3">
                      <h1 className="heading-huge text-white">WRAP <span className="text-accent">WALLET.</span></h1>
                      <p className="text-xs text-white/60 leading-relaxed font-light italic">
                          Automate CRA write-offs, 50% meal deductions, GST threshold compliance, and union initiation deductions.
                      </p>
                  </div>
                  <Button onClick={handleUpgrade} className="w-full h-14 text-[10px] tracking-[0.4em] bg-white text-black hover:bg-accent font-black">
                      <Crown className="w-4 h-4 mr-2" /> Unlock Terminal // $15 mo
                  </Button>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
           <Badge color="accent">Financial Terminal</Badge>
           <span className="text-[8px] font-black uppercase text-white/30 tracking-widest italic">YTD CRA Calibrated</span>
        </div>
        <div className="flex items-end justify-between">
          <h1 className="heading-huge text-white">WRAP <span className="text-accent">WALLET.</span></h1>
          <Button onClick={() => setIsAddModalOpen(true)} className="h-10 px-4 text-[9px] font-black bg-accent text-black hover:bg-yellow-400 flex items-center">
              <Plus className="w-3.5 h-3.5 mr-1" /> Log Mark
          </Button>
        </div>
      </header>

      {/* Stats 2x2 Grid with Sharp CineArch Cards */}
      {stats && (
          <div className="grid grid-cols-2 gap-1">
             <div className="p-4 rounded-none glass-ui border border-white/10 space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-white/30 italic">Gross Scale</p>
                 <div className="text-3xl font-serif text-white italic leading-tight">${stats.grossIncomeYTD.toLocaleString()}</div>
                 <p className="text-[8px] text-white/20 italic">Total Billings</p>
             </div>
             <div className="p-4 rounded-none glass-ui border border-white/10 space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-white/30 italic">Expenses</p>
                 <div className="text-3xl font-serif text-white italic leading-tight">${stats.totalExpensesYTD.toLocaleString()}</div>
                 <p className="text-[8px] text-white/20 italic">Deductible Outflow</p>
             </div>
             <div className="p-4 rounded-none glass-ui border-accent/30 bg-accent/5 space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-accent italic">Audit Safe Yield</p>
                 <div className="text-3xl font-serif text-accent italic leading-tight">${stats.deductibleExpensesYTD.toLocaleString()}</div>
                 <p className="text-[8px] text-accent/40 italic">Post-50% Rules</p>
             </div>
             <div className="p-4 rounded-none glass-ui border border-white/10 space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-white/30 italic">Est. Tax Base</p>
                 <div className="text-3xl font-serif text-white italic leading-tight">${stats.taxableIncomeProjected.toLocaleString()}</div>
                 <p className="text-[8px] text-white/20 italic">Projected CRA</p>
             </div>
          </div>
      )}

      {/* GST Small Supplier Monitor */}
      {stats && (
         <div className="glass-ui p-5 rounded-none space-y-3 border border-white/10">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <div>
                   <h3 className="font-serif italic text-xl text-white">Small Supplier Status</h3>
                   <p className="text-[8px] font-black uppercase tracking-widest text-white/30 italic">Rule GST-001 · $30k Limit</p>
                </div>
                <Badge color={stats.grossIncomeYTD >= 30000 ? "danger" : "neutral"}>
                  {stats.grossIncomeYTD >= 30000 ? "REGISTER" : "EXEMPT"}
                </Badge>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-white/40">Current: ${stats.grossIncomeYTD.toLocaleString()}</span>
                    <span className="text-white/70">Threshold: $30,000</span>
                </div>
                <ProgressBar progress={financeApi.getThresholdProgress(stats.grossIncomeYTD)} />
                
                {financeApi.checkGstThreshold(stats.grossIncomeYTD) && (
                    <div className="p-3 bg-accent/5 border border-accent/20 flex gap-2.5 items-start mt-2 rounded-none">
                        <AlertTriangle className="text-accent shrink-0 mt-0.5" size={15} />
                        <p className="text-xs text-white/80 leading-snug italic font-light">
                          Threshold exceeded. Register for GST/HST to remain in compliance with the CRA.
                        </p>
                    </div>
                )}
            </div>
         </div>
      )}

      {/* Transaction List (Sharp CineArch Cards) */}
      <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="font-serif italic text-2xl text-white">Production Ledger</h3>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/30 italic">{transactions.length} Records</span>
          </div>

          <div className="space-y-1.5">
              {transactions.length === 0 && (
                  <div className="py-14 text-center border border-dashed border-white/10 rounded-none opacity-30 text-xs italic">
                     Ledger is clear. Tap "Log Mark" to print a record.
                  </div>
              )}
              {transactions.map(tx => (
                  <div key={tx.id} className="p-4 rounded-none glass-ui border border-white/10 flex items-center justify-between">
                      <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <span className="text-base font-serif italic text-white">{tx.description}</span>
                             {tx.ruleTags && tx.ruleTags.length > 0 && (
                                 <Badge color="accent" className="text-[7px]">
                                   {tx.ruleTags[0].replace('MEALS_50_LIMIT', '50% Rule')}
                                 </Badge>
                             )}
                          </div>
                          <p className="text-[8px] text-white/40 font-mono uppercase tracking-wider">
                            {tx.dateIncurred} · {tx.category.replace(/_/g, ' ')}
                          </p>
                      </div>
                      <div className="text-right">
                          <span className={clsx("text-lg font-serif italic", tx.type === 'INCOME' ? "text-accent" : "text-white")}>
                              {tx.type === 'INCOME' ? '+' : '-'}${tx.totalAmount.toFixed(2)}
                          </span>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* CINEARCH SHUTTER SHEET FOR TRANSACTIONS */}
      <IOSSheet
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Financial Mark"
        subtitle="RECEIPT OR VOUCHER ENTRY"
      >
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Entry Type</label>
                    <Select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="h-11 text-sm font-serif italic">
                        <option value="EXPENSE" className="bg-black">Expense</option>
                        <option value="INCOME" className="bg-black">Income</option>
                    </Select>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Date</label>
                    <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="h-11 text-sm font-mono" />
                </div>
            </div>
            
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Category Sector</label>
                <Select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="h-11 text-sm font-serif italic">
                    {form.type === 'EXPENSE' ? (
                        <>
                            <option value="MEALS_ENTERTAINMENT" className="bg-black">Meals (50% CRA Rule)</option>
                            <option value="UNION_DUES" className="bg-black">Union Dues & Assessments</option>
                            <option value="APPLICATION_FEE" className="bg-black">Initiation / Application Fee</option>
                            <option value="GEAR_SMALL_TOOLS" className="bg-black">Kit Rental & Tools</option>
                            <option value="OFFICE_SUPPLIES" className="bg-black">Office Supplies</option>
                        </>
                    ) : (
                        <>
                            <option value="SERVICE_FEES" className="bg-black">Day Rate & Service Fees</option>
                            <option value="RESIDUAL" className="bg-black">Residuals & Royalties</option>
                        </>
                    )}
                </Select>
            </div>

            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Description</label>
                <Input 
                  value={form.desc} 
                  onChange={e => setForm({...form, desc: e.target.value})} 
                  placeholder="e.g. Set Catering or Lens Cleaner" 
                  className="h-11 text-base font-serif italic" 
                />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Subtotal ($)</label>
                    <Input 
                      type="number" 
                      inputMode="decimal"
                      value={form.amount} 
                      onChange={e => setForm({...form, amount: e.target.value})} 
                      className="h-11 text-base font-mono" 
                      placeholder="0.00"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">GST/HST ($)</label>
                    <Input 
                      type="number" 
                      inputMode="decimal"
                      value={form.tax} 
                      onChange={e => setForm({...form, tax: e.target.value})} 
                      className="h-11 text-base font-mono" 
                      placeholder="0.00"
                    />
                </div>
            </div>

            <div className="pt-2">
               <Button onClick={handleAddTransaction} className="w-full h-12 text-[10px] tracking-[0.4em] bg-white text-black hover:bg-accent font-black">
                 Print Record to Ledger
               </Button>
            </div>
        </div>
      </IOSSheet>
    </div>
  );
};
