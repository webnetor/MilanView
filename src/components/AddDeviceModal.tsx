import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Monitor, 
  Laptop, 
  Server, 
  Key, 
  HardDrive 
} from 'lucide-react';
import { Device, OSType } from '../types';
import { formatMilanAddress } from '../utils/formatters';

interface AddDeviceModalProps {
  onAdd: (device: Device) => void;
  onClose: () => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [address, setAddress] = useState('');
  const [os, setOs] = useState<OSType>('windows');
  const [ip, setIp] = useState('192.168.1.');
  const [group, setGroup] = useState<'Workstations' | 'Cloud Nodes' | 'Home Lab'>('Workstations');
  const [unattendedPassword, setUnattendedPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const newDevice: Device = {
      id: `dev-custom-${Date.now()}`,
      name: name.trim(),
      alias: alias.trim() || name.toLowerCase().replace(/\s+/g, '-'),
      address: formatMilanAddress(address),
      os,
      ip: ip.trim() || '192.168.1.150',
      status: 'online',
      latencyMs: Math.floor(10 + Math.random() * 15),
      favorite: false,
      group,
      lastActive: 'Just added',
      unattendedPassword: unattendedPassword.trim() || undefined,
      specs: {
        cpu: os === 'macos' ? 'Apple Silicon' : 'x86_64 Multi-Core',
        ram: '32 GB DDR5',
        storage: '1 TB NVMe SSD',
        resolution: '2560 x 1440 QHD',
      },
    };

    onAdd(newDevice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="h-12 px-5 bg-slate-50 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Computer to Address Book</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Computer Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Milan Office Workstation"
              className="w-full h-9 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 focus:border-red-500 rounded-lg px-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                9-Digit Milan Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(formatMilanAddress(e.target.value))}
                placeholder="582 914 302"
                className="w-full h-9 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 focus:border-red-500 rounded-lg px-3 font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none shadow-2xs font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Device Alias</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="milan-office-pc"
                className="w-full h-9 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 focus:border-red-500 rounded-lg px-3 font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none shadow-2xs"
              />
            </div>
          </div>

          {/* OS Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">Operating System</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOs('windows')}
                className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  os === 'windows'
                    ? 'bg-sky-50 dark:bg-neutral-800 border-sky-400 text-sky-700 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Windows</span>
              </button>

              <button
                type="button"
                onClick={() => setOs('macos')}
                className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  os === 'macos'
                    ? 'bg-slate-100 dark:bg-neutral-800 border-slate-400 text-slate-900 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50'
                }`}
              >
                <Laptop className="w-3.5 h-3.5 text-slate-700 dark:text-neutral-300" />
                <span>macOS</span>
              </button>

              <button
                type="button"
                onClick={() => setOs('linux')}
                className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  os === 'linux'
                    ? 'bg-amber-50 dark:bg-neutral-800 border-amber-400 text-amber-700 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Linux</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Group</label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value as any)}
                className="w-full h-9 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 rounded-lg px-2 text-slate-900 dark:text-white outline-none shadow-2xs font-medium"
              >
                <option value="Workstations">Workstations</option>
                <option value="Cloud Nodes">Cloud Nodes</option>
                <option value="Home Lab">Home Lab</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">IP / Host</label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full h-9 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 rounded-lg px-3 font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">
              Unattended Access Password (Optional)
            </label>
            <div className="relative">
              <input
                type="password"
                value={unattendedPassword}
                onChange={(e) => setUnattendedPassword(e.target.value)}
                placeholder="Set password to connect without confirmation"
                className="w-full h-9 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 rounded-lg pl-3 pr-8 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none shadow-2xs font-mono"
              />
              <Key className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors border border-slate-200 dark:border-transparent cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-red-500/20 cursor-pointer active:scale-95"
            >
              Save Computer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
