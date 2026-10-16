import React, { useState } from 'react';
import Papa from 'papaparse';
import { api } from '../services/storage';
import { Job } from '../types';
import { Upload, CheckCircle, Settings2, ArrowRight } from 'lucide-react';
import { Button, Select, Badge } from './ui';

/**
 * THE INGESTOR v2.0 - MOBILE & IPHONE OPTIMIZED
 * Includes Column Mapping to handle Canadian industry payroll exports.
 */

export const BulkJobUpload = ({ userId, onComplete }: { userId: string, onComplete: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [step, setStep] = useState<'IDLE' | 'MAPPING' | 'FINISHING'>('IDLE');

  const REQUIRED_FIELDS = [
    { key: 'productionName', label: 'Production Name' },
    { key: 'role', label: 'Role' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'grossEarnings', label: 'Gross Earnings' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > 0) {
          const headers = Object.keys(results.data[0]);
          setCsvHeaders(headers);
          setRawRows(results.data);
          
          // Auto-mapping attempt
          const initialMapping: Record<string, string> = {};
          REQUIRED_FIELDS.forEach(f => {
            const match = headers.find(h => 
              h.toLowerCase().includes(f.label.toLowerCase()) || 
              h.toLowerCase().includes(f.key.toLowerCase())
            );
            if (match) initialMapping[f.key] = match;
          });
          setMapping(initialMapping);
          setStep('MAPPING');
        }
      }
    });
  };

  const processImport = async () => {
    setUploading(true);
    try {
      const jobsToInsert: Job[] = rawRows.map((row) => {
        const earningsRaw = row[mapping['grossEarnings']]?.toString() || '0';
        return {
          id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: userId,
          productionName: row[mapping['productionName']] || 'Untitled Import',
          role: row[mapping['role']] || 'Crew',
          startDate: row[mapping['startDate']] || new Date().toISOString(),
          grossEarnings: parseFloat(earningsRaw.replace(/[$,]/g, '')) || 0,
          isUnion: false,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          documentCount: 0
        } as Job;
      });

      for (const job of jobsToInsert) {
        await api.jobs.add(job);
      }

      setStep('FINISHING');
      setTimeout(() => {
        onComplete();
        setStep('IDLE');
      }, 1200);
    } catch (e) {
      console.error("Import failed:", e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 'IDLE' && (
        <label className="block w-full cursor-pointer">
          <div className="border-2 border-dashed border-white/20 p-6 text-center glass-ui hover:border-accent active:scale-[0.99] transition-all group rounded-none">
            <Upload className="mx-auto mb-3 text-white/40 group-hover:text-accent" size={24} />
            <h4 className="text-lg font-serif italic text-white mb-1">Initialize Roster Ingest</h4>
            <p className="text-[9px] text-white/50 uppercase tracking-widest italic mb-4">EP Canada, Cast & Crew, or CSV</p>
            <Button variant="outline" className="h-10 text-[9px] border-white/20 pointer-events-none">Select CSV File</Button>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </div>
        </label>
      )}

      {step === 'MAPPING' && (
        <div className="glass-ui p-4 space-y-4 rounded-none animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
             <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-accent" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Column Alignment</h4>
             </div>
             <Badge color="accent">CSV Setup</Badge>
          </div>

          <div className="space-y-3">
            {REQUIRED_FIELDS.map(field => (
              <div key={field.key} className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/70 italic block">{field.label}</label>
                <Select 
                  className="h-12 w-full text-base bg-black" 
                  value={mapping[field.key] || ''} 
                  onChange={e => setMapping({...mapping, [field.key]: e.target.value})}
                >
                  <option value="">Select CSV Header</option>
                  {csvHeaders.map(h => <option key={h} value={h} className="bg-black text-white">{h}</option>)}
                </Select>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
             <Button variant="ghost" className="h-10 text-[9px]" onClick={() => setStep('IDLE')}>Discard</Button>
             <Button className="h-10 text-[9px] bg-white text-black hover:bg-accent font-black" onClick={processImport} isLoading={uploading} disabled={REQUIRED_FIELDS.some(f => !mapping[f.key])}>
               Commit Ingest <ArrowRight className="ml-2" size={12} />
             </Button>
          </div>
        </div>
      )}

      {step === 'FINISHING' && (
        <div className="p-8 text-center glass-ui rounded-none animate-in fade-in duration-300">
           <CheckCircle className="mx-auto mb-3 text-accent" size={36} />
           <h4 className="text-2xl font-serif italic text-white uppercase">Ledger Locked.</h4>
           <p className="text-[9px] text-white/50 uppercase tracking-widest italic mt-2">Dailies Synchronized</p>
        </div>
      )}
    </div>
  );
};
