import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  Check, 
  CheckCircle2, 
  Sliders, 
  Cpu, 
  Radio 
} from 'lucide-react';

interface SecuritySettingsModalProps {
  onClose: () => void;
  unattendedPassword: string;
  onSavePassword: (pwd: string) => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  onClose,
  unattendedPassword,
  onSavePassword,
}) => {
  const [password, setPassword] = useState(unattendedPassword);
  const [confirmPassword, setConfirmPassword] = useState(unattendedPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [interactiveMode, setInteractiveMode] = useState<'always_ask' | 'unattended' | 'reject'>('unattended');
  const [allowDirectAudio, setAllowDirectAudio] = useState(true);
  const [hardwareAccel, setHardwareAccel] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSavePassword(password.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-12 px-5 bg-slate-50 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Access Permissions</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs text-slate-800 dark:text-neutral-200">
          {/* Unattended Access Password Section */}
          <div className="bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-600" />
                <span className="font-bold text-slate-900 dark:text-white">Unattended Access Password</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {password ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <p className="text-slate-600 dark:text-neutral-400 leading-relaxed text-[11px] font-normal">
              Set a master security password to access this computer remotely without requiring someone at the desk to manually click &quot;Accept&quot;.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-600 dark:text-neutral-400 text-[11px] mb-1 font-semibold">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full h-8 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg pl-2.5 pr-8 text-slate-900 dark:text-white outline-none shadow-2xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-400 text-[11px] mb-1 font-semibold">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full h-8 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg px-2.5 text-slate-900 dark:text-white outline-none shadow-2xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Interactive Access Policy */}
          <div className="bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="font-bold text-slate-900 dark:text-white">Interactive Access Policy</span>
            </div>

            <div className="space-y-2 pt-1 text-slate-700 dark:text-neutral-300 font-medium">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="policy"
                  checked={interactiveMode === 'unattended'}
                  onChange={() => setInteractiveMode('unattended')}
                  className="accent-red-600 w-4 h-4 cursor-pointer"
                />
                <span>Allow unattended access with password (Recommended)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="policy"
                  checked={interactiveMode === 'always_ask'}
                  onChange={() => setInteractiveMode('always_ask')}
                  className="accent-red-600 w-4 h-4 cursor-pointer"
                />
                <span>Always ask for confirmation on incoming connections</span>
              </label>
            </div>
          </div>

          {/* Hardware & Stream Optimizations */}
          <div className="bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-900 dark:text-white">Stream & Hardware Acceleration</span>
            </div>

            <div className="space-y-2 text-slate-700 dark:text-neutral-300 font-medium">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Hardware Accelerated GPU Encoding (Direct3D 12 / Metal)</span>
                <input
                  type="checkbox"
                  checked={hardwareAccel}
                  onChange={(e) => setHardwareAccel(e.target.checked)}
                  className="rounded accent-red-600 cursor-pointer w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Direct Opus Low-Latency Audio Streaming</span>
                <input
                  type="checkbox"
                  checked={allowDirectAudio}
                  onChange={(e) => setAllowDirectAudio(e.target.checked)}
                  className="rounded accent-red-600 cursor-pointer w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved!
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-mono font-medium">
                TLS 1.3 · ChaCha20-Poly1305 active
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors border border-slate-200 dark:border-transparent cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-red-500/20 cursor-pointer active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
