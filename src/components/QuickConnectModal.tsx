import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, 
  FolderSync, 
  ArrowRight, 
  X, 
  Laptop, 
  Server, 
  ShieldCheck, 
  Zap, 
  Clock
} from 'lucide-react';
import { Device, OSType } from '../types';
import { formatMilanAddress, cleanMilanDigits } from '../utils/formatters';

interface QuickConnectModalProps {
  devices: Device[];
  onConnect: (addressOrId: string, mode: 'remote-control' | 'file-transfer') => void;
  onClose: () => void;
}

export const QuickConnectModal: React.FC<QuickConnectModalProps> = ({
  devices,
  onConnect,
  onClose,
}) => {
  const [targetInput, setTargetInput] = useState('');
  const [connectMode, setConnectMode] = useState<'remote-control' | 'file-transfer'>('remote-control');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input on open
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (/^[\d\s]*$/.test(raw)) {
      setTargetInput(formatMilanAddress(raw));
    } else {
      setTargetInput(raw);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInput.trim()) return;
    onConnect(targetInput.trim(), connectMode);
    onClose();
  };

  const handleDeviceQuickConnect = (address: string) => {
    onConnect(address, connectMode);
    onClose();
  };

  const getOsIcon = (os: OSType) => {
    switch (os) {
      case 'windows':
        return <Monitor className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
      case 'macos':
        return <Laptop className="w-3.5 h-3.5 text-slate-700 dark:text-neutral-300" />;
      case 'linux':
        return <Server className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 px-5 bg-slate-50 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-xs bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 rotate-45 flex items-center justify-center shadow-xs shadow-red-500/30">
              <div className="w-1.5 h-1.5 bg-white rounded-2xs -rotate-45" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Open New Remote Session</h3>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">Connect to any remote computer with MilanView</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target Address Input */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 dark:text-neutral-200">
              Remote Desk Address or Alias
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={targetInput}
                onChange={handleInputChange}
                placeholder="e.g. 614 902 441 or workstation-pc"
                className="w-full h-11 bg-slate-50 hover:bg-white dark:bg-neutral-950 border-2 border-slate-300 dark:border-neutral-800 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 rounded-xl px-3.5 text-sm font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none shadow-2xs tracking-wider transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Direct P2P · End-to-End Encrypted via TLS 1.3</span>
            </p>
          </div>

          {/* Mode Selector */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 dark:text-neutral-200">
              Connection Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setConnectMode('remote-control')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  connectMode === 'remote-control'
                    ? 'bg-red-50/80 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-white ring-2 ring-red-500/20'
                    : 'bg-white dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-900'
                }`}
              >
                <Monitor className={`w-4 h-4 mt-0.5 shrink-0 ${connectMode === 'remote-control' ? 'text-red-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-bold text-xs">Remote Control</div>
                  <div className="text-[10px] text-slate-500 dark:text-neutral-400 leading-tight mt-0.5">
                    Interactive desktop with mouse, keyboard, and audio
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConnectMode('file-transfer')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  connectMode === 'file-transfer'
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-white ring-2 ring-amber-500/20'
                    : 'bg-white dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-900'
                }`}
              >
                <FolderSync className={`w-4 h-4 mt-0.5 shrink-0 ${connectMode === 'file-transfer' ? 'text-amber-500' : 'text-slate-400'}`} />
                <div>
                  <div className="font-bold text-xs">File Transfer</div>
                  <div className="text-[10px] text-slate-500 dark:text-neutral-400 leading-tight mt-0.5">
                    Dual-pane manager for fast bidirectional sync
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Connect from Saved Address Book */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Or Connect to Saved Computer
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">
                {devices.length} machines
              </span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {devices.map((device) => (
                <div
                  key={device.id}
                  onClick={() => handleDeviceQuickConnect(device.address)}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-neutral-950 dark:hover:bg-neutral-800/80 border border-slate-200/80 dark:border-neutral-800 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-center shrink-0 shadow-2xs">
                      {getOsIcon(device.os)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate group-hover:text-red-600 transition-colors">
                        {device.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono">
                        {device.address} · <span className="text-emerald-600 font-bold">{device.latencyMs}ms</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-red-600 dark:text-red-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Connect <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors border border-slate-200 dark:border-transparent cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!targetInput.trim()}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                targetInput.trim()
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/25'
                  : 'bg-slate-200 dark:bg-neutral-800 text-slate-400 dark:text-neutral-500 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Connect Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
