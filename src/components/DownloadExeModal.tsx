import React, { useState } from 'react';
import { 
  Download, 
  Monitor, 
  Terminal, 
  Copy, 
  Check, 
  X, 
  Cpu, 
  ShieldCheck, 
  ExternalLink,
  Laptop,
  CheckCircle2,
  FileCode,
  Sparkles,
  Layers
} from 'lucide-react';
import { SatelliteLogo } from './SatelliteLogo';

interface DownloadExeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBroadcasting?: boolean;
}

export const DownloadExeModal: React.FC<DownloadExeModalProps> = ({
  isOpen,
  onClose,
  isBroadcasting = false,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleDownload = (filename: string, fileUrl: string) => {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const electronCommand = 'npx electron-packager . MilanView --platform=win32 --arch=x64 --out=dist-exe --overwrite';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="h-16 px-6 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/20 backdrop-blur-md rounded-xl border border-white/20">
              <SatelliteLogo isBroadcasting={isBroadcasting} size={22} showBadge={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">MilanView for Windows</h3>
                <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Win 10 / 11 x64
                </span>
              </div>
              <p className="text-xs text-red-100 opacity-90">
                Native Windows Executable & Portable Desktop Client (.exe)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800 dark:text-neutral-200">
          {/* Main Download Card (1-Click Generator for real MilanView.exe) */}
          <div className="bg-slate-50 dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    MilanView.exe (Windows Executable)
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    StandAlone GUI
                  </span>
                </div>
                <p className="text-slate-600 dark:text-neutral-400 mt-1 leading-relaxed">
                  Direct standalone Windows executable. Double-click <strong>MilanView.exe</strong> on Windows 10/11 to launch MilanView as a native, hardware-accelerated desktop application with zero installation.
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-slate-500 dark:text-neutral-400">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">PE32+ 64-bit GUI Binary</span>
                  <span>·</span>
                  <span>Zero Installation</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => handleDownload('MilanView.exe', '/MilanView.exe')}
                className="px-5 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-xl shadow-md shadow-red-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download MilanView.exe (Direct)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload('Build-MilanView-EXE.bat', '/Build-MilanView-EXE.bat')}
                className="px-4 py-2 bg-white hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-800 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-neutral-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <FileCode className="w-3.5 h-3.5 text-slate-600 dark:text-neutral-400" />
                <span>Download .BAT Builder</span>
              </button>
            </div>
          </div>

          {/* Option 2: Electron Packaging for Offline Standalone EXE */}
          <div className="bg-slate-50 dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Compile with Electron Packager (Zero Config)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">
                electron-main.cjs ready
              </span>
            </div>

            <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
              We have pre-configured <code>electron-main.cjs</code> in the project. Run this command in terminal to bundle the web app into a distribution folder containing <code>MilanView.exe</code>:
            </p>

            <div className="bg-neutral-900 text-neutral-100 font-mono text-xs p-3 rounded-xl border border-neutral-800 flex items-center justify-between gap-3 overflow-x-auto">
              <span className="select-all">{electronCommand}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(electronCommand, 'electron')}
                className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Copy command"
              >
                {copiedCmd === 'electron' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* 3 Windows Desktop Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Hardware Accelerated</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                Direct H.265/H.264 GPU decoding with 60 FPS DeskRT protocol.
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Installation</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                Runs standalone from USB thumb drives, desktop, or Downloads.
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>P2P Encrypted</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                ChaCha20-Poly1305 end-to-end encrypted direct data channels.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="h-14 px-6 bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400">
            MilanView Windows Client v3.2.0-stable
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
