import React, { useState } from 'react';
import Papa from 'papaparse';
import { api } from '../services/storage';
import { Job, UNIONS } from '../types';
import { Upload, AlertCircle, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Button, Text, Badge } from './ui';

export const BulkJobUploadIndividual = ({ userId, onComplete }: { userId: string, onComplete: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as any[];
          if (rows.length === 0) throw new Error("CSV appears empty");

          const jobsToInsert: Job[] = rows.map((row) => {
            const isUnion = row['Is Union?']?.toString().toUpperCase() === 'TRUE';
            const unionName = isUnion ? row['Union / Guild'] : undefined;
            const unionObj = UNIONS.find(u => u.name === unionName);

            return {
              id: `job_indiv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              userId: userId,
              role: row['Role'] || 'Talent',
              totalHours: parseFloat(row['Total Hours'] || '0'),
              startDate: row['Start Date'] ? new Date(row['Start Date']).toISOString() : new Date().toISOString(),
              isUnion: isUnion,
              unionName: unionName,
              unionTypeId: unionObj?.id,
              productionName: row['Production Name'] || 'Untitled',
              grossEarnings: parseFloat(row['Gross Earnings']?.replace(/[$,]/g, '') || '0'),
              status: 'CONFIRMED',
              documentCount: 0,
              createdAt: new Date().toISOString()
            } as Job;
          });

          jobsToInsert.forEach(job => api.jobs.add(job));
          onComplete();
        } catch (err: any) {
          setError(err.message || "Parse failed");
        } finally {
          setUploading(false);
        }
      }
    });
  };

  return (
    <label className="block w-full cursor-pointer">
      <div className="p-5 border-2 border-dashed border-white/15 rounded-none glass-ui text-center space-y-3 hover:border-accent/40 active:scale-[0.99] transition-all">
        <FileSpreadsheet size={24} className="mx-auto text-accent" strokeWidth={1.5} />
        <div className="space-y-0.5">
          <h3 className="font-serif italic text-base text-white">Import Historical Dailies</h3>
          <p className="text-[8px] text-white/40 uppercase font-black tracking-wider">Sync logs via CSV file</p>
        </div>
        {error && <div className="text-red-400 text-[10px] font-mono">{error}</div>}
        <div className="pt-1">
          <Button variant="outline" className="h-10 px-4 text-[9px] border-white/20 pointer-events-none rounded-none" isLoading={uploading}>
            {uploading ? "Parsing File..." : "Choose CSV File"}
          </Button>
        </div>
        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
      </div>
    </label>
  );
};
