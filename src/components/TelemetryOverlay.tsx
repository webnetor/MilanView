import React, { useState, useRef } from 'react';
import { 
  Activity, 
  Wifi, 
  X, 
  Minus, 
  Maximize2, 
  Minimize2, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Sliders, 
  RefreshCw,
  Layers,
  Cpu,
  GripVertical,
  GripHorizontal,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export interface TelemetryDataPoint {
  time: number;
  latency: number;
  jitter: number;
  loss: number;
}

export interface BandwidthDataPoint {
  second: number;
  label: string;
  mbps: number;
}

interface TelemetryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  latencyMs: number;
  jitterMs: number;
  packetLossPct: number;
  bandwidthMbps: number;
  fps: number;
  packetsTotal: number;
  packetsDropped: number;
  history: TelemetryDataPoint[];
  bandwidthHistory?: BandwidthDataPoint[];
  deviceTitle: string;
  address: string;
  codec?: string;
  isSimulatedStress: boolean;
  onToggleStress: () => void;
}

export const TelemetryOverlay: React.FC<TelemetryOverlayProps> = ({
  isOpen,
  onClose,
  latencyMs,
  jitterMs,
  packetLossPct,
  bandwidthMbps,
  fps,
  packetsTotal,
  packetsDropped,
  history,
  bandwidthHistory,
  deviceTitle,
  address,
  codec = 'DeskRT 2.0 (Direct H.265 Hardware)',
  isSimulatedStress,
  onToggleStress,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<'bandwidth' | 'waveform' | 'both'>('both');

  // Fluid Draggable Position & State
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const defaultX = typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 410) : 750;
    return { x: defaultX, y: 56 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Left-click only
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    // Don't drag when clicking buttons, inputs, tabs
    if (target.closest('button') || target.closest('input') || target.closest('a')) return;

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

      const maxX = Math.max(10, window.innerWidth - (isMinimized ? 280 : 380));
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

  if (!isOpen) return null;

  // Determine connection health quality tier
  const isHealthy = packetLossPct < 0.8 && jitterMs < 4.0 && latencyMs < 35;
  const isDegraded = packetLossPct >= 2.0 || jitterMs >= 10.0 || latencyMs > 60;

  // Helper to render SVG line charts from rolling history
  const renderSparkline = () => {
    if (history.length < 2) return null;
    const width = 280;
    const height = 64;
    const maxVal = Math.max(...history.map((h) => Math.max(h.latency, h.jitter * 3)), 30);
    const minVal = 0;

    const pointsLatency = history
      .map((pt, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - ((pt.latency - minVal) / (maxVal - minVal || 1)) * (height - 8) - 4;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const pointsJitter = history
      .map((pt, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - ((pt.jitter * 3 - minVal) / (maxVal - minVal || 1)) * (height - 8) - 4;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Subtle grid guidelines */}
        <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#334155" strokeDasharray="2 2" strokeWidth="0.8" opacity="0.4" />
        <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#334155" strokeDasharray="2 2" strokeWidth="0.8" opacity="0.4" />
        <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#334155" strokeDasharray="2 2" strokeWidth="0.8" opacity="0.4" />

        {/* Latency line (Sky Blue) */}
        <polyline
          fill="none"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsLatency}
        />

        {/* Jitter line (Emerald Green) */}
        <polyline
          fill="none"
          stroke="#34D399"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="3 1.5"
          points={pointsJitter}
        />
      </svg>
    );
  };

  // Minimized Floating HUD Pill
  if (isMinimized) {
    return (
      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          top: 0,
          left: 0,
        }}
        className="absolute z-50 select-none touch-none"
      >
        <div
          onPointerDown={handlePointerDown}
          onClick={() => {
            if (!isDragging) setIsMinimized(false);
          }}
          className={`bg-neutral-950/95 hover:bg-neutral-900 backdrop-blur-md border rounded-xl px-3 py-1.5 shadow-2xl flex items-center gap-2 text-xs text-white transition-shadow ${
            isDragging
              ? 'border-emerald-500 ring-2 ring-emerald-500/50 cursor-grabbing'
              : 'border-neutral-700/80 cursor-grab hover:border-neutral-500'
          }`}
          title="Drag to reposition Telemetry Pill · Click to expand"
        >
          <GripVertical className="w-3 h-3 text-neutral-500 pointer-events-none" />
          <span
            className={`w-2 h-2 rounded-full ${
              isHealthy ? 'bg-emerald-400 animate-pulse' : isDegraded ? 'bg-red-400 animate-ping' : 'bg-amber-400'
            }`}
          />
          <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums pointer-events-none">
            <span className="text-slate-300">
              Loss: <span className={packetLossPct > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>{packetLossPct.toFixed(1)}%</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-slate-300">
              Jitter: <span className="text-emerald-400 font-bold">{jitterMs.toFixed(1)}ms</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-sky-400 font-bold">{latencyMs}ms</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Expand Full Telemetry HUD"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Compute rolling bandwidth metrics over the 60-second window
  const effectiveBandwidthHistory = React.useMemo(() => {
    if (bandwidthHistory && bandwidthHistory.length > 0) {
      return bandwidthHistory;
    }
    const fallback: BandwidthDataPoint[] = [];
    for (let i = 59; i >= 0; i--) {
      fallback.push({
        second: 60 - i,
        label: i === 0 ? 'Now' : `-${i}s`,
        mbps: +(Math.max(1.8, bandwidthMbps + Math.sin(i / 5) * 0.4).toFixed(2)),
      });
    }
    return fallback;
  }, [bandwidthHistory, bandwidthMbps]);

  const mbpsList = effectiveBandwidthHistory.map((d) => d.mbps);
  const peakMbps = mbpsList.length ? Math.max(...mbpsList) : bandwidthMbps;
  const minMbps = mbpsList.length ? Math.min(...mbpsList) : bandwidthMbps;
  const avgMbps = mbpsList.length ? +(mbpsList.reduce((acc, v) => acc + v, 0) / mbpsList.length).toFixed(2) : bandwidthMbps;

  // Custom Dark HUD Tooltip for Recharts
  const CustomBandwidthTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: BandwidthDataPoint }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const val = Number(payload[0].value);
      return (
        <div className="bg-neutral-950/95 border border-emerald-500/70 rounded-lg p-2 text-xs font-mono shadow-xl backdrop-blur-md">
          <div className="text-neutral-400 text-[10px] flex items-center justify-between gap-3">
            <span>Timeline:</span>
            <span className="text-white font-semibold">{label === 'Now' ? 'Current (Live)' : `${label} ago`}</span>
          </div>
          <div className="text-emerald-400 font-bold text-sm mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{val.toFixed(2)} Mbps</span>
          </div>
          <div className="text-neutral-500 text-[9px] mt-0.5">
            {val >= 4.5 ? '4K Ultra-HD · 60 FPS' : val >= 2.5 ? '1080p FHD · Adaptive' : 'Low-Bandwidth Mode'}
          </div>
        </div>
      );
    }
    return null;
  };

  // Expanded Full Diagnostics HUD Panel
  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        top: 0,
        left: 0,
      }}
      className={`absolute z-50 w-88 md:w-[420px] max-h-[calc(100vh-70px)] overflow-y-auto bg-neutral-950/95 backdrop-blur-lg border rounded-2xl text-neutral-200 select-none transition-shadow shadow-[0_20px_50px_rgba(0,0,0,0.7)] ${
        isDragging
          ? 'border-emerald-500/80 ring-2 ring-emerald-500/50 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]'
          : 'border-neutral-800'
      }`}
    >
      {/* Header (Drag Handle) */}
      <div
        onPointerDown={handlePointerDown}
        className={`h-10 px-3 bg-neutral-900/90 border-b border-neutral-800/80 flex items-center justify-between touch-none sticky top-0 z-10 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        title="Drag header to move Telemetry Window"
      >
        <div className="flex items-center gap-1.5 pointer-events-none">
          <GripVertical className="w-3.5 h-3.5 text-neutral-500" />
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold text-white tracking-wide">Connection Telemetry</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isHealthy ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : isDegraded ? 'bg-red-400 shadow-[0_0_8px_#f87171]' : 'bg-amber-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Minimize to HUD Pill"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-md hover:bg-red-600/80 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Close Telemetry"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Telemetry Body */}
      <div className="p-3.5 space-y-3 text-xs">
        {/* Real-time Health Banner */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80">
          <div className="flex items-center gap-2">
            {isHealthy ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <div>
              <div className="font-semibold text-white text-[11px] leading-tight">
                {isHealthy ? 'Direct P2P Link: Optimal' : isDegraded ? 'Network Congestion / Packet Drops' : 'Stable Connection'}
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">
                {deviceTitle} · {address}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
            TLS 1.3 Direct
          </span>
        </div>

        {/* 4-Stat Metric Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* 1. Packet Loss */}
          <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium">
              <span>Packet Loss</span>
              <span className={`font-mono text-[9px] px-1 rounded ${packetLossPct === 0 ? 'text-emerald-400 bg-emerald-950/40' : 'text-amber-400 bg-amber-950/40'}`}>
                {packetLossPct === 0 ? '0 Loss' : 'Loss'}
              </span>
            </div>
            <div className="my-1">
              <span className={`text-xl font-mono font-black tabular-nums tracking-tight ${
                packetLossPct === 0 ? 'text-emerald-400' : packetLossPct > 2 ? 'text-red-400' : 'text-amber-400'
              }`}>
                {packetLossPct.toFixed(1)}%
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono flex items-center justify-between">
              <span>Dropped:</span>
              <span className="text-white tabular-nums">{packetsDropped} / {packetsTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* 2. Jitter */}
          <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium">
              <span>Jitter</span>
              <span className="font-mono text-[9px] text-emerald-400 bg-emerald-950/40 px-1 rounded">
                ±0.3 ms
              </span>
            </div>
            <div className="my-1">
              <span className="text-xl font-mono font-black tabular-nums tracking-tight text-emerald-400">
                {jitterMs.toFixed(1)} <span className="text-xs font-normal text-neutral-400">ms</span>
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono flex items-center justify-between">
              <span>Variance:</span>
              <span className="text-white tabular-nums">&lt; 3.0 ms avg</span>
            </div>
          </div>

          {/* 3. Latency / RTT */}
          <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium">
              <span>Round Trip (RTT)</span>
              <Zap className="w-3 h-3 text-sky-400" />
            </div>
            <div className="my-1">
              <span className="text-xl font-mono font-black tabular-nums tracking-tight text-sky-400">
                {latencyMs} <span className="text-xs font-normal text-neutral-400">ms</span>
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono flex items-center justify-between">
              <span>Buffer queue:</span>
              <span className="text-white tabular-nums">0.0 ms</span>
            </div>
          </div>

          {/* 4. Bitrate & FPS */}
          <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium">
              <span>Live Bandwidth</span>
              <span className="font-mono text-[9px] text-emerald-400 bg-emerald-950/40 px-1 rounded">
                {fps} FPS
              </span>
            </div>
            <div className="my-1">
              <span className="text-xl font-mono font-black tabular-nums tracking-tight text-emerald-400">
                {bandwidthMbps.toFixed(2)} <span className="text-xs font-normal text-neutral-400">Mbps</span>
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono flex items-center justify-between">
              <span>Peak (60s):</span>
              <span className="text-white font-mono">{peakMbps.toFixed(2)} Mbps</span>
            </div>
          </div>
        </div>

        {/* View Selection Toggle */}
        <div className="flex items-center justify-between gap-1 bg-neutral-900/60 p-1 rounded-lg border border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveChartTab('bandwidth')}
            className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              activeChartTab === 'bandwidth'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Bandwidth (60s)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('waveform')}
            className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              activeChartTab === 'waveform'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3 text-sky-400" />
            <span>Latency / Jitter</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('both')}
            className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              activeChartTab === 'both'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3 h-3 text-neutral-400" />
            <span>All Graphs</span>
          </button>
        </div>

        {/* REAL-TIME RECHARTS BANDWIDTH CONSUMPTION CHART (LAST 60 SECONDS) */}
        {(activeChartTab === 'bandwidth' || activeChartTab === 'both') && (
          <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bandwidth Consumption</span>
                <span className="text-[10px] text-neutral-400 font-normal">(Last 60s)</span>
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-bold border border-emerald-800/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {bandwidthMbps.toFixed(2)} Mbps Live
                </span>
              </div>
            </div>

            {/* Quick 60s summary pill stats */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-neutral-400 bg-neutral-950/60 p-1.5 rounded-lg border border-neutral-850">
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-500">60s Avg</span>
                <span className="text-white font-bold">{avgMbps.toFixed(2)} Mbps</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-500">60s Peak</span>
                <span className="text-emerald-400 font-bold">{peakMbps.toFixed(2)} Mbps</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-500">60s Min</span>
                <span className="text-sky-400 font-bold">{minMbps.toFixed(2)} Mbps</span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-36 w-full bg-neutral-950 rounded-lg p-1.5 border border-neutral-850">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={effectiveBandwidthHistory}
                  margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="bandwidthAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#262626" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: '#333333' }}
                    tick={{ fill: '#737373', fontSize: 9 }}
                    interval={14}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: '#333333' }}
                    tick={{ fill: '#737373', fontSize: 9 }}
                    domain={['dataMin - 0.4', 'dataMax + 0.6']}
                    tickFormatter={(val: number) => `${val.toFixed(1)}`}
                    width={32}
                  />
                  <Tooltip content={<CustomBandwidthTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="mbps"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#bandwidthAreaGrad)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 px-1">
              <span>-60 seconds</span>
              <span className="text-emerald-400/80 font-semibold">Real-Time Continuous Sampling (1 Hz)</span>
              <span>Now (Live)</span>
            </div>
          </div>
        )}

        {/* Live Rolling Waveform Section (Latency & Jitter) */}
        {(activeChartTab === 'waveform' || activeChartTab === 'both') && (
          <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>Latency & Jitter Waveform</span>
                <span className="text-[10px] text-neutral-500 font-normal">(Last 30s)</span>
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-sky-400">
                  <span className="w-2 h-0.5 bg-sky-400 rounded-full" /> Latency
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-0.5 bg-emerald-400 rounded-full" /> Jitter
                </span>
              </div>
            </div>

            {/* Waveform Canvas / SVG */}
            <div className="h-16 w-full bg-neutral-950 rounded-lg p-1 border border-neutral-850 flex items-center justify-center">
              {renderSparkline()}
            </div>
          </div>
        )}

        {/* Protocol & Hardware Engine Details */}
        <div className="bg-neutral-900/50 rounded-xl p-2.5 border border-neutral-850 text-[11px] font-mono space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span>Video Codec:</span>
            <span className="text-neutral-200 truncate max-w-[170px] text-right font-semibold">
              {codec}
            </span>
          </div>
          <div className="flex items-center justify-between text-neutral-400">
            <span>Encryption:</span>
            <span className="text-emerald-400 font-semibold">ChaCha20-Poly1305 (256-bit)</span>
          </div>
          <div className="flex items-center justify-between text-neutral-400">
            <span>Data Transport:</span>
            <span className="text-neutral-200">WebRTC DataChannel / UDP</span>
          </div>
        </div>

        {/* Interactive Stress Test / Jitter Simulator Button */}
        <div className="pt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={onToggleStress}
            className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 ${
              isSimulatedStress
                ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black'
                : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white border border-neutral-700/80'
            }`}
            title="Toggle simulated network interference to inspect packet loss and jitter reaction"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isSimulatedStress ? 'Reset to Optimal Link (Stress Active)' : 'Simulate Network Jitter & Loss'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
