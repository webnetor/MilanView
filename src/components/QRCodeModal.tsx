import React from 'react';
import { QrCode, X, Smartphone, Copy, Check } from 'lucide-react';
import { cleanMilanDigits } from '../utils/formatters';

interface QRCodeModalProps {
  address: string;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ address, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const rawDigits = cleanMilanDigits(address);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawDigits);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 w-full max-w-sm rounded-2xl shadow-2xl p-5 flex flex-col items-center text-center space-y-4">
        <div className="w-full flex items-center justify-between pb-2 border-b border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Connect via Mobile</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean SVG QR Code Representation */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center">
          <svg className="w-48 h-48" viewBox="0 0 100 100" fill="currentColor">
            {/* Corner position markers */}
            <rect x="10" y="10" width="24" height="24" fill="#0f172a" rx="3" />
            <rect x="14" y="14" width="16" height="16" fill="#fff" rx="2" />
            <rect x="18" y="18" width="8" height="8" fill="#E02424" rx="1" />

            <rect x="66" y="10" width="24" height="24" fill="#0f172a" rx="3" />
            <rect x="70" y="14" width="16" height="16" fill="#fff" rx="2" />
            <rect x="74" y="18" width="8" height="8" fill="#E02424" rx="1" />

            <rect x="10" y="66" width="24" height="24" fill="#0f172a" rx="3" />
            <rect x="14" y="70" width="16" height="16" fill="#fff" rx="2" />
            <rect x="18" y="74" width="8" height="8" fill="#E02424" rx="1" />

            {/* Simulated QR data modules pattern */}
            <rect x="38" y="12" width="6" height="6" fill="#0f172a" />
            <rect x="48" y="12" width="8" height="4" fill="#0f172a" />
            <rect x="38" y="24" width="8" height="6" fill="#0f172a" />
            <rect x="52" y="22" width="6" height="8" fill="#0f172a" />

            <rect x="12" y="40" width="6" height="12" fill="#0f172a" />
            <rect x="24" y="44" width="10" height="6" fill="#0f172a" />
            <rect x="38" y="38" width="24" height="24" fill="#0f172a" rx="2" />
            <rect x="42" y="42" width="16" height="16" fill="#fff" rx="1" />
            {/* Center Milan Brand dot */}
            <rect x="46" y="46" width="8" height="8" fill="#E02424" rx="2" />

            <rect x="68" y="40" width="14" height="6" fill="#0f172a" />
            <rect x="76" y="50" width="8" height="10" fill="#0f172a" />

            <rect x="38" y="68" width="8" height="8" fill="#0f172a" />
            <rect x="50" y="74" width="8" height="8" fill="#0f172a" />
            <rect x="66" y="68" width="10" height="6" fill="#0f172a" />
            <rect x="80" y="76" width="6" height="12" fill="#0f172a" />
          </svg>
        </div>

        <div className="space-y-1">
          <p className="font-mono font-black text-slate-900 dark:text-white tracking-widest text-xl">
            {address}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-neutral-400">
            Scan with Milan Remote Mobile app or enter this 9-digit address on any Milan client.
          </p>
        </div>

        <div className="w-full flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200/90 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-transparent cursor-pointer shadow-xs active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied ID' : 'Copy Milan ID'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
