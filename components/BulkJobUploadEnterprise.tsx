import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { api } from '../services/storage';
import { Job, UNIONS, User } from '../types';
import { UploadCloud, Users, AlertCircle, FileJson } from 'lucide-react';
import { Button, Select, Badge } from './ui';

export const BulkJobUploadEnterprise = ({ userId, onComplete }: { userId: string, onComplete: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<User | null>(null);
  const [targetUserId, setTargetUserId] = useState<string>(userId);

  useEffect(() => {
    api.auth.getUser().then(setAgent);
  }, []);

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
          const jobsToInsert = rows.map((row) => {
            const isUnion = row['Is Union?']?.toString().toUpperCase() === 'TRUE';
            return {
              id: `job_ent_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              userId: targetUserId,
              role: row['Role'] || 'Talent',
              productionName: row['Production Name'] || 'Untitled',
              startDate: row['Start Date'] || new Date().toISOString(),
              isUnion,
              unionName: isUnion ? row['Union / Guild'] : undefined,
              grossEarnings: parseFloat(row['Gross Earnings']?.replace(/[$,]/g, '') || '0'),
              status: 'CONFIRMED',
              createdAt: new Date().toISOString()
            } as Job;
          });

          const originalActiveId = agent?.activeViewId;
          api.auth.switchClient(targetUserId);
          jobsToInsert.forEach(job => api.jobs.add(job));
          api.auth.switchClient(originalActiveId || null);

          onComplete();
        } catch (err: any) {
          setError("Bulk process interrupted");
        } finally {
          setUploading(false);
        }
      }
    });
  };

  return (
    <div className="p-4 border-2 border-dashed border-accent/30 rounded-none bg-accent/5 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <Badge color="accent">Enterprise Ingestor</Badge>
          <h3 className="font-serif italic text-lg text-white">Roster Sync Engine</h3>
        </div>
        <FileJson size={20} className="text-accent/40" />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black uppercase tracking-wider text-white/50">Target Personnel</label>
        <Select value={targetUserId} onChange={e => setTargetUserId(e.target.value)} className="h-12 text-base bg-black">
          <option value={userId}>Self (Organization Record)</option>
          {agent?.managedUsers?.map(u => (
            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
          ))}
        </Select>
      </div>

      {error && <p className="text-red-400 text-[10px] font-mono">{error}</p>}

      <label className="block w-full cursor-pointer pt-1">
        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        <Button className="w-full h-12 bg-white text-black font-black uppercase tracking-[0.3em] pointer-events-none rounded-none" isLoading={uploading}>
          {uploading ? "Processing Roster Data..." : "Select Roster CSV"}
        </Button>
      </label>
    </div>
  );
};
