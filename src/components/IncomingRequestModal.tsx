import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Monitor, 
  MousePointer, 
  Keyboard, 
  Clipboard, 
  FolderSync, 
  Volume2, 
  Lock, 
  Check, 
  X, 
  Laptop, 
  Server
} from 'lucide-react';
import { IncomingSessionRequest, SessionPermissions, OSType } from '../types';

interface IncomingRequestModalProps {
  request: IncomingSessionRequest;
  onAccept: (permissions: SessionPermissions) => void;
  onReject: () => void;
}

export const IncomingRequestModal: React.FC<IncomingRequestModalProps> = ({
  request,
  onAccept,
  onReject,
}) => {
  const [permissions, setPermissions] = useState<SessionPermissions>(request.requestedPermissions);

  const togglePerm = (key: keyof SessionPermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getOsIcon = (os: OSType) => {
    switch (os) {
      case 'windows':
        return <Monitor className="w-5 h-5 text-sky-400" />;
      case 'macos':
        return <Laptop className="w-5 h-5 text-neutral-300" />;
      case 'linux':
        return <Server className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header with AnyDesk Crimson Header */}
        <div className="bg-red-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Incoming Connection Request</h3>
              <p className="text-[11px] text-red-100">MilanView P2P Direct</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-red-700 px-2 py-0.5 rounded">
            TLS 1.3
          </span>
        </div>

        {/* Client Identity Information */}
        <div className="p-5 space-y-4 text-slate-800 dark:text-neutral-200 text-xs">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-3.5 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-slate-200/80 dark:bg-neutral-900 border border-slate-300/80 dark:border-neutral-800 flex items-center justify-center shrink-0">
              {getOsIcon(request.clientOS)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{request.clientName}</h4>
              <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono tracking-wider">
                Milan ID: {request.clientAddress}
              </p>
            </div>
          </div>

          <p className="text-slate-600 dark:text-neutral-400 leading-relaxed font-normal">
            The remote user wants to connect to this machine. Select the specific permissions you want to grant for this session:
          </p>

          {/* Granular Permissions Checkboxes */}
          <div className="space-y-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800/80 rounded-xl p-3">
            <label
              onClick={() => togglePerm('mouse')}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-neutral-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MousePointer className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span className="font-semibold text-slate-800 dark:text-neutral-300">Allow Mouse & Keyboard Control</span>
              </div>
              <input
                type="checkbox"
                checked={permissions.mouse}
                onChange={() => {}}
                className="rounded accent-red-600 cursor-pointer w-4 h-4"
              />
            </label>

            <label
              onClick={() => togglePerm('clipboard')}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-neutral-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Clipboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-slate-800 dark:text-neutral-300">Synchronize Clipboard</span>
              </div>
              <input
                type="checkbox"
                checked={permissions.clipboard}
                onChange={() => {}}
                className="rounded accent-red-600 cursor-pointer w-4 h-4"
              />
            </label>

            <label
              onClick={() => togglePerm('fileTransfer')}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-neutral-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FolderSync className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-slate-800 dark:text-neutral-300">Allow File Transfers</span>
              </div>
              <input
                type="checkbox"
                checked={permissions.fileTransfer}
                onChange={() => {}}
                className="rounded accent-red-600 cursor-pointer w-4 h-4"
              />
            </label>

            <label
              onClick={() => togglePerm('audio')}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-neutral-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-slate-800 dark:text-neutral-300">Transmit System Audio</span>
              </div>
              <input
                type="checkbox"
                checked={permissions.audio}
                onChange={() => {}}
                className="rounded accent-red-600 cursor-pointer w-4 h-4"
              />
            </label>

            <label
              onClick={() => togglePerm('lock')}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-neutral-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                <span className="font-semibold text-slate-800 dark:text-neutral-300">Allow Lock on Disconnect</span>
              </div>
              <input
                type="checkbox"
                checked={permissions.lock}
                onChange={() => {}}
                className="rounded accent-red-600 cursor-pointer w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Action Buttons: Accept / Dismiss */}
        <div className="bg-slate-50 dark:bg-neutral-950 p-4 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onReject}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Dismiss</span>
          </button>

          <button
            type="button"
            onClick={() => onAccept(permissions)}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Accept Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
