import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Wifi, 
  Lock, 
  EyeOff, 
  MousePointer, 
  Volume2, 
  Clipboard, 
  Terminal, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Zap, 
  Sliders, 
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { TelemetryDataPoint } from './TelemetryOverlay';

interface AdminControllerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  deviceTitle: string;
  address: string;
  os: string;
  latencyMs: number;
  jitterMs: number;
  packetLossPct: number;
  bandwidthMbps: number;
  fps: number;
  packetsTotal: number;
  packetsDropped: number;
  history: TelemetryDataPoint[];
  isSimulatedStress: boolean;
  onToggleStress: () => void;
  onSendCtrlAltDel: () => void;
  onOpenTaskManager: () => void;
  onOpenTerminal: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminControllerPanel: React.FC<AdminControllerPanelProps> = ({
  isOpen,
  onClose,
  deviceTitle,
  address,
  os,
  latencyMs,
  jitterMs,
  packetLossPct,
  bandwidthMbps,
  fps,
  packetsTotal,
  packetsDropped,
  history,
  isSimulatedStress,
  onToggleStress,
  onSendCtrlAltDel,
  onOpenTaskManager,
  onOpenTerminal,
  onShowToast,
}) => {
  // Admin permissions & operator state toggles
  const [exclusiveInput, setExclusiveInput] = useState(false);
  const [blankScreen, setBlankScreen] = useState(false);
  const [elevatedAdmin, setElevatedAdmin] = useState(true);
  const [clipboardSync, setClipboardSync] = useState(true);
  const [audioStream, setAudioStream] = useState(true);

  if (!isOpen) return null;

  const isLossFree = packetLossPct < 0.2;
  const isOptimalJitter = jitterMs < 2.5;

  // Mini sparkline for the admin panel
  const renderMiniChart = () => {
    if (!history || history.length < 2) return null;
    const width = 310;
    const height = 48;
    const maxVal = Math.max(25, ...history.map((h) => h.latency));

    const points = history
      .map((h, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - (h.latency / maxVal) * (height - 8) - 4;
        return `${x},${y}`;
      })
      .join(' ');

    const jitterPoints = history
      .map((h, i) => {
        const x = (i / (history.length - 1)) * width;
        const jY = height - (Math.min(h.jitter * 4, maxVal) / maxVal) * (height - 8) - 4;
        return `${x},${jY}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="w-full overflow-visible">
        {/* Latency line (emerald) */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Jitter line (sky) */}
        <polyline
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          strokeLinecap="round"
          points={jitterPoints}
        />
      </svg>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-neutral-900 border-l border-slate-200 dark:border-neutral-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* Panel Header */}
      <div className="h-14 px-4 bg-slate-50/90 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600/10 dark:bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-wide">
                Admin (Remote Controller) Panel
              </h3>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono truncate max-w-[220px]">
              {deviceTitle} · {address}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Close Admin Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* TELEMETRY SECTION: Live Connection Health */}
        <div className="bg-slate-50 dark:bg-neutral-950/80 border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Live Connection Telemetry
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                packetLossPct > 0 || jitterMs > 5
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
              }`}
            >
              {packetLossPct > 0 ? 'Degraded Link' : 'Zero-Loss Optimal'}
            </span>
          </div>

          {/* 4 Metric Badges Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Packet Loss */}
            <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-[10px] font-medium">
                <span>Packet Loss</span>
                <span className={isLossFree ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                  {isLossFree ? '0.00%' : `${packetLossPct.toFixed(1)}%`}
                </span>
              </div>
              <div className="text-lg font-black font-mono tracking-tight text-slate-900 dark:text-white mt-0.5">
                {packetLossPct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-neutral-800">
                <span>Dropped</span>
                <span className="font-bold text-slate-700 dark:text-neutral-300">{packetsDropped} pkts</span>
              </div>
            </div>

            {/* Jitter */}
            <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-[10px] font-medium">
                <span>Jitter (P2P)</span>
                <span className={isOptimalJitter ? 'text-sky-600 font-bold' : 'text-amber-600 font-bold'}>
                  {isOptimalJitter ? 'Smooth' : 'Variable'}
                </span>
              </div>
              <div className="text-lg font-black font-mono tracking-tight text-slate-900 dark:text-white mt-0.5">
                {jitterMs.toFixed(1)} <span className="text-xs font-normal text-slate-500">ms</span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-neutral-800">
                <span>Buffer</span>
                <span className="font-bold text-slate-700 dark:text-neutral-300">0.8 ms</span>
              </div>
            </div>

            {/* Latency RTT */}
            <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-[10px] font-medium">
                <span>Round-Trip Latency</span>
                <span className="text-emerald-600 font-bold">Direct UDP</span>
              </div>
              <div className="text-lg font-black font-mono tracking-tight text-slate-900 dark:text-white mt-0.5">
                {latencyMs} <span className="text-xs font-normal text-slate-500">ms</span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-neutral-800">
                <span>Response</span>
                <span className="font-bold text-emerald-600">Immediate</span>
              </div>
            </div>

            {/* Throughput & FPS */}
            <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-[10px] font-medium">
                <span>Stream Bitrate</span>
                <span className="text-slate-700 dark:text-neutral-300 font-bold">{fps} FPS</span>
              </div>
              <div className="text-lg font-black font-mono tracking-tight text-slate-900 dark:text-white mt-0.5">
                {bandwidthMbps.toFixed(1)} <span className="text-xs font-normal text-slate-500">Mbps</span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-neutral-800">
                <span>Packets Tot.</span>
                <span className="font-bold text-slate-700 dark:text-neutral-300">{packetsTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Sparkline Graphic */}
          <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Latency ({latencyMs}ms)
                <span className="w-2 h-2 rounded-full bg-sky-400 ml-2" />
                Jitter ({jitterMs.toFixed(1)}ms)
              </span>
              <span>Rolling 15s</span>
            </div>
            <div className="h-12 w-full pt-1 flex items-center">
              {renderMiniChart()}
            </div>
          </div>

          {/* Network Stress / Congestion simulation button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={onToggleStress}
              className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                isSimulatedStress
                  ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-neutral-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {isSimulatedStress
                  ? 'Stress Test Active (Click to Restore Low Latency)'
                  : 'Run Diagnostics Stress Test (Simulate Loss & Jitter)'}
              </span>
            </button>
          </div>
        </div>

        {/* ADMIN OPERATOR PRIVILEGES & SECURITY */}
        <div className="bg-slate-50 dark:bg-neutral-950/80 border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-red-600" />
              Operator Control Privileges
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Active Control
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Elevated Admin Rights */}
            <label
              onClick={() => {
                setElevatedAdmin(!elevatedAdmin);
                onShowToast(!elevatedAdmin ? 'UAC Admin Rights elevated' : 'Standard user rights active');
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-neutral-800/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block text-xs">Elevated Admin Rights (UAC)</span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400">Permit UAC prompts & service changes</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={elevatedAdmin}
                onChange={() => {}}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </label>

            {/* Exclusive Operator Control (Block Remote Input) */}
            <label
              onClick={() => {
                setExclusiveInput(!exclusiveInput);
                onShowToast(!exclusiveInput ? 'Blocked remote user keyboard & mouse' : 'Remote user input unblocked');
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-neutral-800/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-sky-600" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block text-xs">Block Remote Input</span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400">Lock remote mouse & keyboard during work</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={exclusiveInput}
                onChange={() => {}}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </label>

            {/* Blank Remote Screen */}
            <label
              onClick={() => {
                setBlankScreen(!blankScreen);
                onShowToast(!blankScreen ? 'Remote monitor blanked for privacy' : 'Remote display restored');
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-neutral-800/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block text-xs">Blank Remote Screen</span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400">Blackout remote monitor (Privacy Mode)</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={blankScreen}
                onChange={() => {}}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </label>

            {/* Clipboard Sync */}
            <label
              onClick={() => {
                setClipboardSync(!clipboardSync);
                onShowToast(!clipboardSync ? 'Clipboard sync enabled' : 'Clipboard sync paused');
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-neutral-800/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block text-xs">Clipboard Sync</span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400">Bidirectional copy & paste (Text, Images)</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={clipboardSync}
                onChange={() => {}}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </label>

            {/* Audio Stream */}
            <label
              onClick={() => {
                setAudioStream(!audioStream);
                onShowToast(!audioStream ? 'Remote stereo audio streaming' : 'Remote audio muted');
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-neutral-800/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block text-xs">Audio Transmission</span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400">Direct Opus stereo stream from host</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={audioStream}
                onChange={() => {}}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* QUICK ADMIN ACTIONS */}
        <div className="bg-slate-50 dark:bg-neutral-950/80 border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-3.5 space-y-2 shadow-xs">
          <span className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider block">
            System & Command Shortcuts
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onSendCtrlAltDel}
              className="p-2 bg-white hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-800 dark:text-white font-mono font-bold text-[11px] rounded-xl border border-slate-200/80 dark:border-neutral-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Ctrl + Alt + Del</span>
            </button>

            <button
              type="button"
              onClick={() => onShowToast('Sent [Win + L] Workstation Lock to remote host')}
              className="p-2 bg-white hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-800 dark:text-white font-mono font-bold text-[11px] rounded-xl border border-slate-200/80 dark:border-neutral-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-red-500" />
              <span>Lock (Win + L)</span>
            </button>

            <button
              type="button"
              onClick={onOpenTaskManager}
              className="p-2 bg-white hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-800 dark:text-white font-bold text-[11px] rounded-xl border border-slate-200/80 dark:border-neutral-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-sky-500" />
              <span>Task Manager</span>
            </button>

            <button
              type="button"
              onClick={onOpenTerminal}
              className="p-2 bg-white hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-800 dark:text-white font-mono font-bold text-[11px] rounded-xl border border-slate-200/80 dark:border-neutral-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              <span>PowerShell</span>
            </button>
          </div>
        </div>

        {/* SESSION SECURITY AUDIT */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 text-[11px] text-slate-600 dark:text-neutral-400 space-y-1 font-mono">
          <div className="flex justify-between">
            <span>Protocol:</span>
            <span className="text-slate-900 dark:text-white font-bold">Milan Direct UDP / TLS 1.3</span>
          </div>
          <div className="flex justify-between">
            <span>Encryption:</span>
            <span className="text-slate-900 dark:text-white font-bold">ChaCha20-Poly1305</span>
          </div>
          <div className="flex justify-between">
            <span>Admin Token:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">MILAN-AUTH-TOKEN-VALID</span>
          </div>
        </div>
      </div>
    </div>
  );
};
