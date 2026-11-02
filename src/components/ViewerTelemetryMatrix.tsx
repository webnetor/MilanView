import React, { useState, useRef } from 'react';
import { 
  Activity, 
  Wifi, 
  ChevronDown, 
  ChevronUp, 
  Minimize2, 
  Maximize2, 
  Zap, 
  Move,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GripVertical
} from 'lucide-react';
import { TelemetryDataPoint } from './TelemetryOverlay';

interface ViewerTelemetryMatrixProps {
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
  deviceTitle: string;
}

export const ViewerTelemetryMatrix: React.FC<ViewerTelemetryMatrixProps> = ({
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
  deviceTitle,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Fluid Draggable Position State
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const defaultX = typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 340) : 600;
    return { x: defaultX, y: 16 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;

    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };

    const handlePointerMove = (moveEv: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = moveEv.clientX - dragRef.current.startX;
      const dy = moveEv.clientY - dragRef.current.startY;

      const maxX = Math.max(10, window.innerWidth - (isExpanded ? 330 : 260));
      const maxY = Math.max(10, window.innerHeight - 80);

      const nextX = Math.min(maxX, Math.max(10, dragRef.current.initialX + dx));
      const nextY = Math.min(maxY, Math.max(10, dragRef.current.initialY + dy));

      setPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      dragRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsVisible(true)}
        className="absolute top-3 right-3 z-35 bg-black/75 hover:bg-black/90 backdrop-blur-md text-emerald-400 border border-emerald-500/40 rounded-full px-3 py-1 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
        title="Show Viewer Telemetry Matrix"
      >
        <Activity className="w-3.5 h-3.5 animate-pulse" />
        <span>Telemetry Matrix</span>
      </button>
    );
  }

  const isLossFree = packetLossPct < 0.2;
  const isGoodJitter = jitterMs < 3.0;

  // Mini live SVG sparkline
  const renderSparkline = () => {
    if (!history || history.length < 2) return null;
    const width = 180;
    const height = 28;
    const maxVal = Math.max(30, ...history.map((h) => h.latency));

    const points = history
      .map((h, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - (h.latency / maxVal) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(' ');

    const jitterPoints = history
      .map((h, i) => {
        const x = (i / (history.length - 1)) * width;
        const jY = height - (Math.min(h.jitter * 4, maxVal) / maxVal) * (height - 6) - 3;
        return `${x},${jY}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible w-full">
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <polyline
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeDasharray="2 2"
          strokeLinecap="round"
          points={jitterPoints}
        />
      </svg>
    );
  };

  // COMPACT PILL MODE
  if (!isExpanded) {
    return (
      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          top: 0,
          left: 0,
        }}
        className="absolute z-35 select-none touch-none"
      >
        <div
          onPointerDown={handlePointerDown}
          onClick={() => {
            if (!isDragging) setIsExpanded(true);
          }}
          className={`bg-black/90 hover:bg-black/95 backdrop-blur-md border rounded-full px-3 py-1 shadow-2xl flex items-center gap-2 text-[11px] font-mono text-white transition-shadow ${
            isDragging
              ? 'border-emerald-500 ring-2 ring-emerald-500/50 cursor-grabbing'
              : 'border-neutral-700/80 hover:border-neutral-500 cursor-grab'
          }`}
          title="Drag to move Telemetry Matrix pill · Click to expand"
        >
          <GripVertical className="w-3 h-3 text-neutral-500 pointer-events-none" />
          <div className="flex items-center gap-1.5 pointer-events-none">
            <span
              className={`w-2 h-2 rounded-full ${
                isLossFree ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="text-emerald-400 font-extrabold">{latencyMs}ms</span>
          </div>

          <span className="text-neutral-600">·</span>

          <span className={isLossFree ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-bold'}>
            {packetLossPct.toFixed(1)}% loss
          </span>

          <span className="text-neutral-600">·</span>

          <span className="text-sky-400 font-semibold">{jitterMs.toFixed(1)}ms jit</span>

          <span className="text-neutral-600">·</span>

          <span className="text-neutral-300 font-bold">{fps} FPS</span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="p-1 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Expand Full Telemetry Matrix"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // EXPANDED MATRIX HUD MODE
  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        top: 0,
        left: 0,
      }}
      className={`absolute z-35 w-80 bg-neutral-950/95 backdrop-blur-md border rounded-2xl shadow-2xl overflow-hidden select-none transition-shadow text-white ${
        isDragging
          ? 'border-emerald-500/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-2 ring-emerald-500/50'
          : 'border-neutral-800/90'
      }`}
    >
      {/* Top Header Bar (Drag Handle) */}
      <div
        onPointerDown={handlePointerDown}
        className={`h-8 px-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between text-xs touch-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        title="Drag header to move Telemetry Matrix"
      >
        <div className="flex items-center gap-1.5 pointer-events-none">
          <GripVertical className="w-3.5 h-3.5 text-neutral-500" />
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-neutral-200 font-mono">
            Viewer Telemetry Matrix
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>

        <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
          {/* Minimize Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer"
            title="Collapse to compact pill"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Close HUD */}
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 rounded transition-colors cursor-pointer"
            title="Hide HUD from viewer screen"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Telemetry Matrix Grid */}
      <div className="p-3 space-y-2.5 text-xs">
        {/* Primary 4-Cell Matrix */}
        <div className="grid grid-cols-2 gap-2">
          {/* 1. Packet Loss */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-2 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>PACKET LOSS</span>
              <span className={`font-bold ${isLossFree ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isLossFree ? '0 DROP' : `${packetsDropped} DROP`}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span
                className={`text-base font-mono font-black tracking-tight ${
                  isLossFree ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {packetLossPct.toFixed(1)}%
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {packetsTotal > 0 ? `${(packetsTotal / 1000).toFixed(1)}k pkts` : 'P2P'}
              </span>
            </div>
          </div>

          {/* 2. Jitter */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-2 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>JITTER</span>
              <span className={`font-bold ${isGoodJitter ? 'text-sky-400' : 'text-amber-400'}`}>
                {isGoodJitter ? 'STABLE' : 'VARIABLE'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-mono font-black tracking-tight text-sky-400">
                {jitterMs.toFixed(1)}
                <span className="text-[10px] font-normal text-neutral-400 ml-0.5">ms</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">buffer: 0.8ms</span>
            </div>
          </div>

          {/* 3. Latency (RTT) */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-2 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>ROUND-TRIP (RTT)</span>
              <span className="text-emerald-400 font-bold">DIRECT</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-mono font-black tracking-tight text-white">
                {latencyMs}
                <span className="text-[10px] font-normal text-neutral-400 ml-0.5">ms</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">Low-Lag</span>
            </div>
          </div>

          {/* 4. Frame Rate & Bandwidth */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-2 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>STREAM BITRATE</span>
              <span className="text-emerald-400 font-bold">{fps} FPS</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-mono font-black tracking-tight text-white">
                {bandwidthMbps.toFixed(1)}
                <span className="text-[10px] font-normal text-neutral-400 ml-0.5">Mbps</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">HW H.265</span>
            </div>
          </div>
        </div>

        {/* Real-time wave sparkline */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-2 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              RTT: {latencyMs}ms
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 ml-2" />
              Jitter: {jitterMs.toFixed(1)}ms
            </span>
            <span className="text-[9px] text-neutral-500">15s Wave</span>
          </div>
          <div className="h-7 w-full flex items-center pt-0.5">
            {renderSparkline()}
          </div>
        </div>

        {/* Bottom Status & Stress Test Toggle */}
        <div className="pt-0.5 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[130px]">{deviceTitle}</span>
          </div>

          <button
            type="button"
            onClick={onToggleStress}
            className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
              isSimulatedStress
                ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
            }`}
            title="Simulate network congestion"
          >
            <Zap className="w-3 h-3" />
            <span>{isSimulatedStress ? 'Reset Test' : 'Stress Test'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
