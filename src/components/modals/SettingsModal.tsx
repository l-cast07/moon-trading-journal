// src/components/modals/SettingsModal.tsx

import React, { useState, useRef } from 'react';
import { X, Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { exportData, importData } from '../../utils/backup';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{type: 'idle' | 'success' | 'error', message: string}>({ type: 'idle', message: '' });

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setStatus({ type: 'idle', message: '' });
      await exportData();
      setStatus({ type: 'success', message: 'Backup exported successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to export backup.' });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Alerta de seguridad obligatoria
    if (!window.confirm("WARNING: Importing a backup will OVERWRITE ALL your current data. Do you want to proceed?")) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setStatus({ type: 'idle', message: '' });
      await importData(file);
      setStatus({ type: 'success', message: 'Data imported successfully! Reloading...' });
      
      // Recargamos la p gina para que Zustand y los componentes vuelvan a leer los datos frescos de Dexie
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      setStatus({ type: 'error', message: 'Invalid backup file structure.' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="h-14 px-6 border-b border-[#262626] flex justify-between items-center bg-[#0a0a0a]">
          <h2 className="font-mono text-sm tracking-wider text-[#d4d4d4] uppercase">Settings & Data</h2>
          <button onClick={onClose} className="text-[#525252] hover:text-[#d4d4d4] transition-colors p-1 rounded hover:bg-[#141414]">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Banner de Estado Din mico */}
          {status.type !== 'idle' && (
            <div className={`p-3 border rounded flex items-center gap-2 text-sm font-mono ${
              status.type === 'success' ? 'bg-[#4ade80]/10 border-[#4ade80]/20 text-[#4ade80]' : 'bg-[#f87171]/10 border-[#f87171]/20 text-[#f87171]'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {status.message}
            </div>
          )}

          {/* Secci n de Respaldo */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono text-[#737373] uppercase tracking-wider border-b border-[#262626] pb-2">Backup & Restore</h3>
            <p className="text-[#525252] text-xs font-mono mb-4">Export your trades and strategies to a JSON file to keep them safe, or import an existing backup.</p>

            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 bg-[#141414] border border-[#262626] text-[#d4d4d4] px-4 py-3 rounded-lg hover:bg-[#1a1a1a] hover:border-[#404040] transition-all"
            >
              <Download size={18} />
              <span className="font-mono text-sm">Export Data (.json)</span>
            </button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImport}
                className="hidden"
                id="import-backup"
              />
              <label
                htmlFor="import-backup"
                className="w-full flex items-center justify-center gap-2 bg-[#141414] border border-[#262626] text-[#d4d4d4] px-4 py-3 rounded-lg hover:bg-[#1a1a1a] hover:border-[#404040] transition-all cursor-pointer"
              >
                <Upload size={18} />
                <span className="font-mono text-sm">Import Data (Overwrite)</span>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};