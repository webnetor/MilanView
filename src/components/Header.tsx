import React from 'react';
import { 
  Monitor, 
  FolderSync, 
  X, 
  Plus, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Minus, 
  Square, 
  Settings,
  HelpCircle,
  Download
} from 'lucide-react';
import { SessionTab } from '../types';
import { SatelliteLogo } from './SatelliteLogo';

interface HeaderProps {
  tabs: SessionTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  isBroadcasting?: boolean;
  onOpenDownloadExe?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  isDark,
  onToggleTheme,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenHelp,
  isBroadcasting = false,
  onOpenDownloadExe,
}) => {
  return (
    <header className="h-11 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md text-slate-800 dark:text-neutral-200 border-b border-slate-200/90 dark:border-neutral-800/90 flex items-center justify-between select-none px-2 z-50 shadow-[0_1px_3px_0_rgba(15,23,42,0.05)]">
      {/* Brand & Tabs Zone */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 h-full py-1">
        {/* AnyDesk-style Brand Icon / Home button */}
        <button
          onClick={() => onSelectTab('tab-home')}
          className={`flex items-center gap-2 px-3 h-full rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTabId === 'tab-home'
              ? 'bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white border border-slate-300/90 dark:border-neutral-700 shadow-xs'
              : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-neutral-900'
          }`}
          title={isBroadcasting ? "MilanView Home (Screen Sharing Active)" : "MilanView Home"}
        >
          {/* Satellite App Icon - switches between Red (standard) and Emerald Green (broadcasting active) */}
          <SatelliteLogo isBroadcasting={isBroadcasting} size={22} showBadge={true} />
          
          <span className="tracking-tight font-extrabold text-slate-900 dark:text-white">
            Milan<span className={isBroadcasting ? 'text-emerald-600 dark:text-emerald-400 transition-colors' : 'text-red-600 dark:text-red-500 transition-colors'}>View</span>
          </span>
          
          {isBroadcasting ? (
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-1.5 py-0.2 rounded-md flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE
            </span>
          ) : (
            <span className="text-[10px] text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/50 px-1 py-0.2 rounded">
              REMOTE
            </span>
          )}
        </button>

        {/* Dynamic Session Tabs */}
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center gap-2 px-3 h-full rounded-lg text-xs transition-all cursor-pointer shrink-0 max-w-64 border ${
                isActive
                  ? 'bg-white dark:bg-neutral-800/95 text-slate-900 dark:text-white border-slate-300/90 dark:border-neutral-700 shadow-xs font-semibold ring-1 ring-slate-900/5'
                  : 'text-slate-600 dark:text-neutral-400 border-transparent hover:bg-slate-100/80 dark:hover:bg-neutral-900 hover:text-slate-900 dark:hover:text-neutral-200'
              }`}
            >
              {tab.type === 'file-transfer' ? (
                <FolderSync className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              ) : (
                <Monitor className="w-3.5 h-3.5 text-red-600 shrink-0" />
              )}
              
              <span className="truncate">{tab.deviceTitle}</span>
              
              {/* Tab Latency Info */}
              <span className="text-[10px] font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.2 rounded ml-0.5">
                {tab.latencyMs}ms
              </span>

              {/* Close Tab Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="w-4 h-4 rounded-md hover:bg-slate-200/80 dark:hover:bg-neutral-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ml-1"
                title="Close Session"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Plus Button to Open New Connection */}
        <button
          onClick={onNewTab}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-900 flex items-center justify-center text-slate-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0 ml-1 border border-transparent hover:border-slate-300 dark:hover:border-neutral-700 cursor-pointer"
          title="Open New Remote Session"
          aria-label="Open New Remote Session"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Controls Zone */}
      <div className="flex items-center gap-1.5 shrink-0 pl-3">
        {/* Windows .EXE Download Button */}
        {onOpenDownloadExe && (
          <button
            onClick={onOpenDownloadExe}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-md font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Download MilanView.exe for Windows"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Download .EXE</span>
          </button>
        )}

        {/* Security Status Indicator */}
        <button
          onClick={onOpenSettings}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-neutral-900 border border-emerald-200/80 dark:border-neutral-800 rounded-md transition-colors hover:bg-emerald-100/70"
          title="Security & Permissions"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
          <span className="text-[11px] font-semibold">Secured</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleMute}
          className="w-7 h-7 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-900 flex items-center justify-center text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" /> : <Volume2 className="w-3.5 h-3.5 text-slate-700 dark:text-neutral-300" />}
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="w-7 h-7 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-900 flex items-center justify-center text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="w-7 h-7 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-900 flex items-center justify-center text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Preferences & Unattended Access"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="w-7 h-7 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-900 flex items-center justify-center text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Help & Shortcuts"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Desktop Window Controls Decoration */}
        <div className="flex items-center border-l border-slate-250 dark:border-neutral-800 pl-2 ml-1">
          <button className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xs">
            <Minus className="w-3 h-3" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xs">
            <Square className="w-2.5 h-2.5" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 rounded-xs transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
};
