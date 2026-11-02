import React from 'react';
import { HelpCircle, X, Monitor, FolderSync, ShieldCheck, Sparkles } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="h-12 px-5 bg-slate-50 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">MilanView Guide</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-700 dark:text-neutral-300 overflow-y-auto max-h-[75vh]">
          <div className="space-y-1.5 bg-slate-50 dark:bg-neutral-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-neutral-800">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Monitor className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              1. Seamless Remote Desktop Access
            </h4>
            <p className="text-slate-600 dark:text-neutral-400 leading-relaxed font-normal">
              Connect to any workstation or server instantly by entering its 9-digit Milan ID or alias, or clicking a saved device in the Address Book. You get complete interactive control with low latency (sub-15ms), 60 FPS video, multi-monitor display switching, interactive Terminal, and Task Manager.
            </p>
          </div>

          <div className="space-y-1.5 bg-slate-50 dark:bg-neutral-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-neutral-800">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <FolderSync className="w-4 h-4 text-amber-500" />
              2. Cross-Platform Dual-Pane File Transfers
            </h4>
            <p className="text-slate-600 dark:text-neutral-400 leading-relaxed font-normal">
              Transfer files effortlessly between your local computer and remote targets using the dedicated dual-pane File Transfer Manager. You can upload real files directly from your hard drive, navigate remote directory hierarchies, or drag-and-drop any file straight onto the remote desktop screen canvas!
            </p>
          </div>

          <div className="space-y-1.5 bg-slate-50 dark:bg-neutral-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-neutral-800">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              3. Unattended Access & P2P Security
            </h4>
            <p className="text-slate-600 dark:text-neutral-400 leading-relaxed font-normal">
              Configure an unattended access password in Security Settings to connect directly without manual approval at the host machine. Sessions are secured with TLS 1.3 and ChaCha20-Poly1305 end-to-end encryption.
            </p>
          </div>

          <div className="space-y-1.5 bg-slate-50 dark:bg-neutral-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-neutral-800">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              4. Real Cross-Tab Connectivity
            </h4>
            <p className="text-slate-600 dark:text-neutral-400 leading-relaxed font-normal">
              Want to see two instances connect live? Duplicate this browser tab in another window! Copy the 9-digit ID from Tab A and connect from Tab B. Tab A will ring with AnyDesk&apos;s authorization prompt!
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/20 cursor-pointer active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
