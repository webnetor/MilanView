import React, { useState } from 'react';
import { 
  Monitor, 
  FolderSync, 
  Copy, 
  Check, 
  QrCode, 
  ShieldCheck, 
  ArrowRight, 
  Laptop, 
  Server, 
  Cpu, 
  Star, 
  Search, 
  Plus, 
  Radio, 
  HardDrive,
  Trash2,
  ExternalLink,
  Lock
} from 'lucide-react';
import { Device, OSType } from '../types';
import { formatMilanAddress, cleanMilanDigits } from '../utils/formatters';

interface HomeDashboardProps {
  myAddress: string;
  devices: Device[];
  onConnect: (addressOrId: string, mode: 'remote-control' | 'file-transfer') => void;
  onAddDevice: () => void;
  onDeleteDevice: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenSettings: () => void;
  onOpenQRCode: () => void;
  onStartLiveBroadcast: () => void;
  isBroadcasting: boolean;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  myAddress,
  devices,
  onConnect,
  onAddDevice,
  onDeleteDevice,
  onToggleFavorite,
  onOpenSettings,
  onOpenQRCode,
  onStartLiveBroadcast,
  isBroadcasting,
}) => {
  const [remoteInput, setRemoteInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanMilanDigits(myAddress));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // If it's digits, format as 9-digit
    if (/^[\d\s]*$/.test(raw)) {
      setRemoteInput(formatMilanAddress(raw));
    } else {
      setRemoteInput(raw);
    }
  };

  const handleConnectSubmit = (mode: 'remote-control' | 'file-transfer') => {
    if (!remoteInput.trim()) return;
    onConnect(remoteInput.trim(), mode);
  };

  // Filtered devices
  const filteredDevices = devices.filter((dev) => {
    const matchesGroup =
      selectedGroup === 'All'
        ? true
        : selectedGroup === 'Favorites'
        ? dev.favorite
        : dev.group === selectedGroup;

    const matchesSearch =
      dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.address.includes(searchQuery) ||
      dev.ip.includes(searchQuery);

    return matchesGroup && matchesSearch;
  });

  const getOsIcon = (os: OSType) => {
    switch (os) {
      case 'windows':
        return <Monitor className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'macos':
        return <Laptop className="w-4 h-4 text-slate-700 dark:text-neutral-300" />;
      case 'linux':
        return <Server className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getOsBadgeClasses = (os: OSType) => {
    switch (os) {
      case 'windows':
        return 'bg-sky-50 dark:bg-neutral-900 border border-sky-200/80 dark:border-neutral-800 text-sky-700';
      case 'macos':
        return 'bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700';
      case 'linux':
        return 'bg-amber-50 dark:bg-neutral-900 border border-amber-200/80 dark:border-neutral-800 text-amber-700';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-mesh-light dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Top 2-Column Banner: This Desk & Remote Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-7xl mx-auto">
        {/* Card 1: AnyDesk-Style Signature Crimson Hero Card (This Desk) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white rounded-2xl p-6 shadow-xl shadow-red-500/20 relative overflow-hidden flex flex-col justify-between border border-red-500/40">
          {/* Subtle Ambient Decorative Glows */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/15 rounded-full blur-xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs animate-ping" />
                <span className="text-xs font-bold text-red-100 uppercase tracking-wider">
                  This Desk (Your Address)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-medium border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-[11px]">Online & Ready</span>
              </div>
            </div>

            {/* Large Frosted Glass Inset for 9-Digit Milan Address */}
            <div className="bg-black/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-inner flex items-center justify-between">
              <div className="space-y-1">
                <span className="font-mono text-3xl md:text-4xl font-black tracking-widest text-white drop-shadow-sm select-all">
                  {myAddress}
                </span>
                <p className="text-xs text-red-100 font-mono flex items-center gap-1.5 opacity-90">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>milan-personal-workstation</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl transition-all active:scale-95 shadow-sm border border-white/20 flex items-center gap-1"
                  title="Copy 9-digit Milan ID"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span className="text-[11px] font-bold text-emerald-300 pr-1">Copied</span>
                    </>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onOpenQRCode}
                  className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl transition-all active:scale-95 shadow-sm border border-white/20"
                  title="Show QR Code for mobile pairing"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-red-100/90 leading-relaxed font-normal">
              Share this 9-digit ID with another computer to accept remote control, or set an unattended access password.
            </p>
          </div>

          {/* Quick Actions Row */}
          <div className="pt-4 border-t border-white/20 mt-4 flex items-center justify-between gap-2 relative z-10">
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white font-semibold transition-colors hover:underline underline-offset-4"
            >
              <Lock className="w-3.5 h-3.5 text-red-200" />
              <span>Unattended Access</span>
            </button>

            <button
              type="button"
              onClick={onStartLiveBroadcast}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                isBroadcasting
                  ? 'bg-white text-red-700 animate-pulse ring-2 ring-white/50'
                  : 'bg-white text-red-700 hover:bg-red-50 hover:shadow-lg'
              }`}
              title="Broadcast your screen via Screen Capture API"
            >
              <Radio className="w-3.5 h-3.5 text-red-600" />
              <span>{isBroadcasting ? 'Broadcasting...' : 'Share My Screen'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Remote Desk (Connect to Remote) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Remote Desk (Enter Milan ID or Alias)
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                P2P Direct · End-to-End Encrypted
              </span>
            </div>

            {/* Input with Dual Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={remoteInput}
                  onChange={handleInputChange}
                  placeholder="e.g. 614 902 441 or milan-desktop-win11"
                  className="w-full h-12 bg-slate-50/90 hover:bg-slate-50 dark:bg-neutral-900 border-2 border-slate-250 dark:border-neutral-700 focus:border-red-500 dark:focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 rounded-xl px-4 text-base font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none transition-all tracking-wider shadow-inner"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConnectSubmit('remote-control');
                  }}
                />
              </div>

              {/* Primary Connect Button */}
              <button
                type="button"
                onClick={() => handleConnectSubmit('remote-control')}
                className="h-12 px-6 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 shadow-md shadow-red-500/25 active:scale-95 cursor-pointer"
              >
                <Monitor className="w-4 h-4" />
                <span>Connect</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Dedicated File Transfer Button (Iconic AnyDesk feature) */}
              <button
                type="button"
                onClick={() => handleConnectSubmit('file-transfer')}
                className="h-12 px-5 bg-slate-100 hover:bg-slate-200/90 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 hover:text-slate-900 dark:hover:text-white border border-slate-250 dark:border-transparent text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95 cursor-pointer shadow-xs"
                title="Direct Dual-Pane File Manager Mode"
              >
                <FolderSync className="w-4 h-4 text-amber-500" />
                <span>File Transfer</span>
              </button>
            </div>

            {/* Quick history pills */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs text-slate-600 dark:text-neutral-400 pt-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-500 shrink-0">Recent:</span>
              {devices.slice(0, 3).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setRemoteInput(d.address)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-mono text-[11px] shrink-0 transition-all border border-slate-200/80 dark:border-neutral-800 font-semibold hover:border-slate-350 cursor-pointer"
                >
                  {d.name.split(' ')[0]} ({d.address})
                </button>
              ))}
            </div>
          </div>

          {/* Security Features strip */}
          <div className="pt-4 border-t border-slate-100 dark:border-neutral-800/80 mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">TLS 1.3 · ChaCha20-Poly1305 · Zero cloud relay storage</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500 dark:text-neutral-400 font-bold bg-slate-100 dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-neutral-800">
              v3.2.0-secure
            </span>
          </div>
        </div>
      </div>

      {/* Feature Metric Highlights Strip (Adds distinct polish to Light Mode) */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white/90 dark:bg-neutral-950/80 border border-slate-200/90 dark:border-neutral-800/80 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40 flex items-center justify-center shrink-0">
            <Monitor className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">DeskRT 60 FPS</div>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400">Fluid zero-lag remote control</div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-neutral-950/80 border border-slate-200/90 dark:border-neutral-800/80 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center shrink-0">
            <FolderSync className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Dual-Pane File Sync</div>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400">Fast cross-platform transfers</div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-neutral-950/80 border border-slate-200/90 dark:border-neutral-800/80 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">ChaCha20-Poly1305</div>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400">Military-grade peer encryption</div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-neutral-950/80 border border-slate-200/90 dark:border-neutral-800/80 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Direct P2P Routing</div>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400">12ms ultra-low ping channel</div>
          </div>
        </div>
      </div>

      {/* Address Book & Saved Desktops Section */}
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Section Header with Category Tabs & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-200/90 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide">
              Address Book & Saved Desktops
            </h2>
            <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono font-medium">
              ({filteredDevices.length} machines)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Group Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-neutral-950 p-1 rounded-xl border border-slate-200/90 dark:border-neutral-800 text-xs">
              {['All', 'Workstations', 'Cloud Nodes', 'Home Lab', 'Favorites'].map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedGroup === grp
                      ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-transparent'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter computers..."
                className="w-44 h-8 bg-white dark:bg-neutral-950 border border-slate-250 dark:border-neutral-800 rounded-lg pl-8 pr-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:focus:border-neutral-700 shadow-2xs"
              />
            </div>

            {/* Add Computer Button */}
            <button
              type="button"
              onClick={onAddDevice}
              className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Computer</span>
            </button>
          </div>
        </div>

        {/* Device Cards Grid */}
        {filteredDevices.length === 0 ? (
          <div className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-2xl p-10 text-center space-y-3 shadow-xs">
            <Cpu className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-neutral-300">No computers found</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
              No remote desktop machines match your filter. You can add a new computer or clear your search query.
            </p>
            <button
              onClick={onAddDevice}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Computer</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredDevices.map((device) => (
              <div
                key={device.id}
                className="bg-white dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800 hover:border-red-400 dark:hover:border-neutral-700 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between group relative shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  {/* Card Header: OS icon, Name, Favorite Star */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${getOsBadgeClasses(device.os)}`}>
                        {getOsIcon(device.os)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {device.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono truncate">
                          {device.alias}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleFavorite(device.id)}
                      className="text-slate-400 hover:text-amber-500 transition-colors p-1"
                      title={device.favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          device.favorite ? 'fill-amber-400 text-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Address & IP pill */}
                  <div className="bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/80 dark:border-neutral-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900 dark:text-neutral-200 tracking-wider">
                      {device.address}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400">
                      {device.ip}
                    </span>
                  </div>

                  {/* Hardware Specs & Ping */}
                  <div className="text-[11px] text-slate-600 dark:text-neutral-400 space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between">
                      <span>Latency:</span>
                      <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded text-[10px]">
                        {device.latencyMs} ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Resolution:</span>
                      <span className="text-slate-800 dark:text-neutral-300 font-mono font-medium truncate max-w-[130px]">
                        {device.specs.resolution.split(' ')[0]}
                      </span>
                    </div>
                    <div className="truncate text-slate-500 dark:text-neutral-400 text-[10px]">
                      {device.specs.cpu}
                    </div>
                  </div>
                </div>

                {/* Card Actions: Connect & File Transfer */}
                <div className="pt-3.5 border-t border-slate-100 dark:border-neutral-800/80 mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onConnect(device.id, 'remote-control')}
                    className="flex-1 h-8 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onConnect(device.id, 'file-transfer')}
                    className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white rounded-lg flex items-center justify-center transition-all border border-slate-200 dark:border-neutral-800 active:scale-95"
                    title="Direct File Transfer"
                  >
                    <FolderSync className="w-3.5 h-3.5 text-amber-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteDevice(device.id)}
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-neutral-900 rounded-lg flex items-center justify-center transition-colors"
                    title="Delete Device"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
