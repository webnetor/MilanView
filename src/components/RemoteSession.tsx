import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, 
  Wifi, 
  ShieldCheck, 
  FolderSync, 
  Maximize2, 
  Minimize2, 
  Camera, 
  Video, 
  Edit3, 
  Lock, 
  PhoneOff, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Terminal as TerminalIcon, 
  Activity, 
  FileText, 
  Folder, 
  X, 
  Minus, 
  Square, 
  Upload, 
  Send, 
  Volume2, 
  VolumeX, 
  Check, 
  Play, 
  Square as StopIcon,
  RefreshCw,
  Trash2,
  Save,
  HelpCircle
} from 'lucide-react';
import { SessionTab, WindowItem, FileItem, OSType } from '../types';
import { formatBytes, formatDuration } from '../utils/formatters';
import { sounds } from '../utils/soundEffects';

interface RemoteSessionProps {
  session: SessionTab;
  onDisconnect: () => void;
  onSwitchToFileTransfer: () => void;
  remoteFiles: FileItem[];
  onUploadFileToRemote: (file: FileItem) => void;
  onDeleteRemoteFile: (fileId: string) => void;
}

export const RemoteSession: React.FC<RemoteSessionProps> = ({
  session,
  onDisconnect,
  onSwitchToFileTransfer,
  remoteFiles,
  onUploadFileToRemote,
  onDeleteRemoteFile,
}) => {
  // Session duration timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [latency, setLatency] = useState(session.latencyMs);
  const [bandwidth, setBandwidth] = useState(session.bandwidthMbps);

  // Floating toolbar states
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'fit' | 'original' | 'stretch'>(session.viewMode);
  const [activeDisplay, setActiveDisplay] = useState<1 | 2>(session.displayIndex);
  const [inputControlEnabled, setInputControlEnabled] = useState(session.permissions.mouse);
  const [isRecording, setIsRecording] = useState(false);
  const [whiteboardActive, setWhiteboardActive] = useState(false);
  const [whiteboardColor, setWhiteboardColor] = useState('#EF4444');
  const [whiteboardStroke, setWhiteboardStroke] = useState(3);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'System',
      text: 'Encrypted P2P connection established via ChaCha20-Poly1305.',
      time: 'Just now',
    },
    {
      sender: 'Remote Host',
      text: 'Milan Workstation session active. Mouse, keyboard, and file transfer enabled.',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Drag-and-drop file upload onto remote desktop
  const [isDragOverScreen, setIsDragOverScreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Remote Desktop Windows state
  const [windows, setWindows] = useState<WindowItem[]>([
    {
      id: 'win-taskmgr',
      title: session.os === 'macos' ? 'Activity Monitor' : 'Task Manager - Performance',
      type: 'taskmgr',
      x: 480,
      y: 60,
      width: 480,
      height: 340,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
    },
    {
      id: 'win-explorer',
      title: session.os === 'macos' ? 'Finder - Desktop' : 'File Explorer - Desktop',
      type: 'explorer',
      x: 80,
      y: 90,
      width: 500,
      height: 360,
      isMinimized: false,
      isMaximized: false,
      zIndex: 11,
    },
  ]);
  const [activeWindowId, setActiveWindowId] = useState<string>('win-explorer');
  const [highestZ, setHighestZ] = useState(20);

  // Start Menu state for Windows/macOS/Linux
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Milan Remote Console [Version 10.0.22631.3007]',
    '(c) Milan Workstation Corporation. All rights reserved.',
    '',
    `Connected to ${session.deviceTitle} (${session.address})`,
    'Type "help" for a list of available remote commands.',
    '',
  ]);
  const [terminalInput, setTerminalInput] = useState('');

  // Notepad state
  const [notepadContent, setNotepadContent] = useState<string>(
    '# Milan-remoteDesktop Session Notes\n\n- System latency: stable at ~11ms\n- End-to-end encrypted direct data channel\n- Cross-platform file drag-and-drop active'
  );

  // Whiteboard canvas refs
  const whiteboardCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // CPU chart canvas ref for Task Manager
  const cpuCanvasRef = useRef<HTMLCanvasElement>(null);
  const cpuHistoryRef = useRef<number[]>([25, 28, 22, 34, 42, 30, 27, 31, 29, 36, 40, 32, 28]);

  // Session timer and jitter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      // Realistic minor latency jitter
      if (Math.random() > 0.6) {
        setLatency((prev) => Math.max(8, Math.min(22, prev + (Math.random() > 0.5 ? 1 : -1))));
        setBandwidth((prev) => +(Math.max(2.8, Math.min(6.5, prev + (Math.random() - 0.5) * 0.4)).toFixed(1)));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animate Task Manager CPU canvas
  useEffect(() => {
    const canvas = cpuCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;

    const renderChart = (time: number) => {
      if (time - lastTime > 600) {
        lastTime = time;
        const newUsage = Math.floor(18 + Math.random() * 26);
        cpuHistoryRef.current.push(newUsage);
        if (cpuHistoryRef.current.length > 25) {
          cpuHistoryRef.current.shift();
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw CPU curve
      const pts = cpuHistoryRef.current;
      const step = canvas.width / (pts.length - 1);

      ctx.beginPath();
      pts.forEach((val, i) => {
        const x = i * step;
        const y = canvas.height - (val / 100) * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fill area under curve
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
      ctx.fillStyle = grad;
      ctx.fill();

      animId = requestAnimationFrame(renderChart);
    };

    animId = requestAnimationFrame(renderChart);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Bring window to front
  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setHighestZ((prev) => prev + 1);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: highestZ + 1 } : w))
    );
  };

  // Open or restore a window
  const openWindow = (type: WindowItem['type'], title: string) => {
    setStartMenuOpen(false);
    const existing = windows.find((w) => w.type === type);
    if (existing) {
      if (existing.isMinimized) {
        setWindows((prev) =>
          prev.map((w) => (w.id === existing.id ? { ...w, isMinimized: false } : w))
        );
      }
      focusWindow(existing.id);
      return;
    }

    const newWin: WindowItem = {
      id: `win-${type}-${Date.now()}`,
      title,
      type,
      x: 100 + (windows.length % 5) * 35,
      y: 80 + (windows.length % 5) * 30,
      width: type === 'terminal' ? 560 : type === 'notes' ? 440 : 500,
      height: type === 'terminal' ? 360 : 340,
      isMinimized: false,
      isMaximized: false,
      zIndex: highestZ + 1,
    };
    setHighestZ((prev) => prev + 1);
    setWindows((prev) => [...prev, newWin]);
    setActiveWindowId(newWin.id);
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
  };

  const maximizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  // Terminal command execution
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    const args = cmd.split(' ');
    const mainCmd = args[0].toLowerCase();

    const newLines = [`C:\\Users\\Milan> ${cmd}`];

    switch (mainCmd) {
      case 'help':
        newLines.push(
          'Available commands:',
          '  dir, ls          - List remote files and folders',
          '  ipconfig, ifconfig - View remote IP network configuration',
          '  systeminfo       - Detailed workstation hardware specs',
          '  ping <host>      - Test network latency to host',
          '  whoami           - Display logged-in remote user',
          '  cls, clear       - Clear terminal console',
          '  date, time       - Show current machine timestamp',
          '  echo <text>      - Echo arguments to output',
          '  ver              - Print Milan remote OS kernel build'
        );
        break;
      case 'dir':
      case 'ls':
        newLines.push(` Directory of C:\\Users\\Milan\\Desktop\n`);
        remoteFiles.forEach((f) => {
          newLines.push(
            `  ${f.modified.padEnd(16)}  ${f.isDirectory ? '<DIR>    ' : formatBytes(f.size).padStart(9)}  ${f.name}`
          );
        });
        newLines.push(`\n  ${remoteFiles.length} File(s)`);
        break;
      case 'ipconfig':
      case 'ifconfig':
        newLines.push(
          'Ethernet adapter vEthernet (Milan P2P vSwitch):',
          '   Connection-specific DNS Suffix  . : localdomain',
          '   IPv4 Address. . . . . . . . . . . : 192.168.1.104',
          '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
          '   Default Gateway . . . . . . . . . : 192.168.1.1',
          '   Milan Direct Relay Node . . . . . : 10.0.4.88:443'
        );
        break;
      case 'systeminfo':
        newLines.push(
          'Host Name:                 MILAN-RIG-WIN11',
          'OS Name:                   Microsoft Windows 11 Pro',
          'OS Version:                10.0.22631 N/A Build 22631',
          'Processor:                 AMD Ryzen 9 7950X 16-Core Processor @ 4.50 GHz',
          'Total Physical Memory:     65,420 MB',
          'Available Physical Memory: 42,108 MB',
          'Milan P2P Latency:         11 ms (TLS 1.3)'
        );
        break;
      case 'whoami':
        newLines.push('milan-workstation\\administrator (High Integrity Privilege)');
        break;
      case 'date':
      case 'time':
        newLines.push(`Current remote time: ${new Date().toLocaleTimeString()} - ${new Date().toLocaleDateString()}`);
        break;
      case 'cls':
      case 'clear':
        setTerminalHistory([]);
        setTerminalInput('');
        return;
      case 'ping':
        const target = args[1] || '8.8.8.8';
        newLines.push(
          `Pinging ${target} with 32 bytes of data:`,
          `Reply from ${target}: bytes=32 time=9ms TTL=118`,
          `Reply from ${target}: bytes=32 time=10ms TTL=118`,
          `Reply from ${target}: bytes=32 time=9ms TTL=118`,
          `Ping statistics for ${target}: Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)`
        );
        break;
      default:
        newLines.push(`'${mainCmd}' is not recognized as an internal or external command. Type 'help' for options.`);
    }

    setTerminalHistory((prev) => [...prev, ...newLines, '']);
    setTerminalInput('');
  };

  // Drag and drop handler for remote screen file upload
  const handleScreenDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverScreen(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => {
        const newFileItem: FileItem = {
          id: `rem-drop-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          isDirectory: false,
          modified: 'Just now',
          path: `C:/Users/Milan/Desktop/${file.name}`,
          extension: file.name.split('.').pop()?.toLowerCase() || '',
        };
        onUploadFileToRemote(newFileItem);
      });
      sounds.playTransferComplete();
      showToast(`Uploaded ${e.dataTransfer.files.length} file(s) to Remote Desktop!`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Actions
  const handleSendCtrlAltDel = () => {
    showToast('Sent [Ctrl + Alt + Del] to remote session');
    sounds.playConnectSound();
  };

  const handleTakeScreenshot = () => {
    showToast('Session screenshot captured and saved');
    sounds.playConnectSound();
  };

  const handleToggleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      showToast('Recording remote session (WebM HD)');
    } else {
      showToast('Session recording saved to Downloads');
      sounds.playTransferComplete();
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'You',
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  // Whiteboard drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!whiteboardActive) return;
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!whiteboardActive || !isDrawingRef.current) return;
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = whiteboardColor;
    ctx.lineWidth = whiteboardStroke;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div
      className="flex-1 relative flex flex-col h-full bg-neutral-950 overflow-hidden select-none"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOverScreen(true);
      }}
      onDragLeave={() => setIsDragOverScreen(false)}
      onDrop={handleScreenDrop}
    >
      {/* ANYDESK FLOATING CONTROL RIBBON (TOP CENTER) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
        <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-slate-200/90 dark:border-neutral-700/80 rounded-2xl shadow-xl shadow-slate-900/10 px-3.5 py-1.5 flex items-center gap-2.5 text-xs text-slate-800 dark:text-neutral-200">
          {/* Status Indicator & Title */}
          <div className="flex items-center gap-2 pr-2.5 border-r border-slate-200 dark:border-neutral-700/80">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-slate-900 dark:text-white tracking-wide truncate max-w-[140px]">
              {session.deviceTitle}
            </span>
            <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-neutral-400 font-semibold bg-slate-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
              {formatDuration(elapsedSeconds)}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="hidden md:flex items-center gap-2 pr-2.5 border-r border-slate-200 dark:border-neutral-700/80 text-[11px] font-mono tabular-nums text-slate-600 dark:text-neutral-300">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-transparent">
              {latency} ms
            </span>
            <span className="text-slate-300 dark:text-neutral-600">·</span>
            <span className="font-bold text-slate-700 dark:text-neutral-200">60 FPS</span>
            <span className="text-slate-300 dark:text-neutral-600">·</span>
            <span className="text-slate-500 dark:text-neutral-400">{bandwidth} MB/s</span>
          </div>

          {/* Main Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Ctrl+Alt+Del shortcut */}
            <button
              type="button"
              onClick={handleSendCtrlAltDel}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 hover:text-slate-900 dark:hover:text-white rounded-lg text-[11px] font-mono font-bold transition-colors border border-slate-200/80 dark:border-transparent cursor-pointer shadow-2xs"
              title="Send Ctrl+Alt+Del"
            >
              Ctrl+Alt+Del
            </button>

            {/* Display Scaler */}
            <button
              type="button"
              onClick={() => {
                const modes: Array<'fit' | 'original' | 'stretch'> = ['fit', 'original', 'stretch'];
                const nextIdx = (modes.indexOf(viewMode) + 1) % modes.length;
                setViewMode(modes[nextIdx]);
                showToast(`View mode: ${modes[nextIdx].toUpperCase()}`);
              }}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              title={`View Mode: ${viewMode} (Click to toggle)`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Multi-monitor switcher */}
            <button
              type="button"
              onClick={() => {
                const next = activeDisplay === 1 ? 2 : 1;
                setActiveDisplay(next);
                showToast(`Switched to Monitor ${next} (${next === 1 ? '3840x2160 4K' : '1920x1080'})`);
              }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 rounded-lg text-[11px] font-bold transition-colors border border-slate-200/80 dark:border-transparent cursor-pointer"
              title="Switch Active Display"
            >
              Disp {activeDisplay}
            </button>

            {/* Dedicated File Transfer Overlay / Mode */}
            <button
              type="button"
              onClick={onSwitchToFileTransfer}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title="Open Dual-Pane File Transfer Manager"
            >
              <FolderSync className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Files</span>
            </button>

            {/* Whiteboard Annotation Toggle */}
            <button
              type="button"
              onClick={() => {
                setWhiteboardActive(!whiteboardActive);
                showToast(whiteboardActive ? 'Annotation Pen disabled' : 'Annotation Pen active: Draw on remote screen');
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                whiteboardActive
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Remote Screen Annotation Whiteboard"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {/* Session Recorder */}
            <button
              type="button"
              onClick={handleToggleRecord}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse shadow-xs'
                  : 'hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={isRecording ? 'Stop Recording' : 'Record Session'}
            >
              <Video className="w-3.5 h-3.5" />
            </button>

            {/* In-Session Chat Drawer Toggle */}
            <button
              type="button"
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-1.5 rounded-lg transition-colors relative cursor-pointer ${
                chatOpen
                  ? 'bg-slate-800 text-white dark:bg-neutral-700'
                  : 'hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Remote Chat"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>

            {/* Disconnect Button (Iconic AnyDesk Red phone button) */}
            <button
              type="button"
              onClick={onDisconnect}
              className="ml-1 h-7 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-red-500/20 active:scale-95 cursor-pointer"
              title="Disconnect Remote Session"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      </div>

      {/* WHITEBOARD ANNOTATION TOOLBAR (when active) */}
      {whiteboardActive && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-neutral-900 border border-neutral-700 rounded-lg p-2 flex items-center gap-2 shadow-xl text-xs">
          <span className="text-[11px] font-bold text-neutral-400">Marker:</span>
          {['#EF4444', '#38BDF8', '#10B981', '#F59E0B', '#FFFFFF'].map((c) => (
            <button
              key={c}
              onClick={() => setWhiteboardColor(c)}
              className={`w-5 h-5 rounded-full border transition-transform ${
                whiteboardColor === c ? 'scale-125 border-white shadow-xs' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="h-4 w-px bg-neutral-700 mx-1" />
          <button
            onClick={clearWhiteboard}
            className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[11px]"
          >
            Clear
          </button>
        </div>
      )}

      {/* TOAST POPUP NOTIFICATION */}
      {toastMessage && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/90 border border-neutral-700 text-white px-4 py-2 rounded-lg text-xs shadow-xl flex items-center gap-2 animate-bounce">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DRAG-AND-DROP FILE OVERLAY ON SCREEN */}
      {isDragOverScreen && (
        <div className="absolute inset-0 z-50 bg-red-950/70 backdrop-blur-xs border-4 border-dashed border-red-500 flex flex-col items-center justify-center pointer-events-none text-white space-y-3">
          <Upload className="w-16 h-16 text-red-400 animate-bounce" />
          <h2 className="text-xl font-bold">Drop files to upload to Remote Desktop</h2>
          <p className="text-xs text-neutral-300 font-mono">
            Directly saved to C:\Users\Milan\Desktop
          </p>
        </div>
      )}

      {/* REMOTE DESKTOP WORKSPACE (VIRTUAL OS ENVIRONMENT) */}
      <div
        className={`flex-1 relative overflow-hidden flex flex-col justify-between ${
          session.os === 'macos'
            ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950'
            : session.os === 'linux'
            ? 'bg-gradient-to-br from-purple-950 via-neutral-900 to-amber-950'
            : 'bg-gradient-to-br from-slate-950 via-sky-950 to-neutral-900'
        }`}
        style={{
          backgroundSize: viewMode === 'stretch' ? '100% 100%' : 'cover',
        }}
        onClick={() => setStartMenuOpen(false)}
      >
        {/* Subtle high-tech desktop wallpaper grid / gradient rings */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Remote Desktop Icons Grid */}
        <div className="relative z-10 p-4 grid grid-flow-col grid-rows-6 gap-3 w-fit">
          {/* This PC / Finder */}
          <div
            onDoubleClick={() => openWindow('explorer', session.os === 'macos' ? 'Finder' : 'This PC')}
            onClick={() => openWindow('explorer', session.os === 'macos' ? 'Finder' : 'This PC')}
            className="w-20 p-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-xs flex flex-col items-center gap-1.5 cursor-pointer text-center group transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-sky-600/80 border border-sky-400/40 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] text-white font-medium drop-shadow-md truncate max-w-full">
              {session.os === 'macos' ? 'Finder' : 'This PC'}
            </span>
          </div>

          {/* PowerShell / Terminal */}
          <div
            onDoubleClick={() => openWindow('terminal', session.os === 'macos' ? 'Terminal' : 'PowerShell')}
            onClick={() => openWindow('terminal', session.os === 'macos' ? 'Terminal' : 'PowerShell')}
            className="w-20 p-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-xs flex flex-col items-center gap-1.5 cursor-pointer text-center group transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <TerminalIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] text-white font-medium drop-shadow-md truncate max-w-full">
              Terminal
            </span>
          </div>

          {/* Task Manager / Activity Monitor */}
          <div
            onDoubleClick={() => openWindow('taskmgr', session.os === 'macos' ? 'Activity Monitor' : 'Task Manager')}
            onClick={() => openWindow('taskmgr', session.os === 'macos' ? 'Activity Monitor' : 'Task Manager')}
            className="w-20 p-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-xs flex flex-col items-center gap-1.5 cursor-pointer text-center group transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-700/80 border border-emerald-400/40 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] text-white font-medium drop-shadow-md truncate max-w-full">
              Activity
            </span>
          </div>

          {/* Notepad / Notes */}
          <div
            onDoubleClick={() => openWindow('notes', 'Notepad - Architecture.txt')}
            onClick={() => openWindow('notes', 'Notepad - Architecture.txt')}
            className="w-20 p-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-xs flex flex-col items-center gap-1.5 cursor-pointer text-center group transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-600/80 border border-amber-400/40 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] text-white font-medium drop-shadow-md truncate max-w-full">
              Notepad
            </span>
          </div>

          {/* Direct File Transfer Shortcut */}
          <div
            onClick={onSwitchToFileTransfer}
            className="w-20 p-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-xs flex flex-col items-center gap-1.5 cursor-pointer text-center group transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-red-600 border border-red-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <FolderSync className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] text-white font-medium drop-shadow-md truncate max-w-full">
              File Sync
            </span>
          </div>
        </div>

        {/* ACTIVE DRAGGABLE OS WINDOWS */}
        {windows.map((win) => {
          if (win.isMinimized) return null;
          const isFocused = activeWindowId === win.id;

          return (
            <div
              key={win.id}
              onClick={() => focusWindow(win.id)}
              style={{
                transform: win.isMaximized ? 'none' : `translate(${win.x}px, ${win.y}px)`,
                width: win.isMaximized ? '100%' : `${win.width}px`,
                height: win.isMaximized ? 'calc(100% - 40px)' : `${win.height}px`,
                top: win.isMaximized ? 0 : undefined,
                left: win.isMaximized ? 0 : undefined,
                zIndex: win.zIndex,
              }}
              className={`absolute rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-150 border ${
                isFocused
                  ? 'border-neutral-350 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white'
                  : 'border-neutral-250 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/90 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {/* Window Title Bar */}
              <div
                className={`h-9 px-3 flex items-center justify-between select-none cursor-move shrink-0 border-b ${
                  isFocused ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white' : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {win.type === 'terminal' ? (
                    <TerminalIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : win.type === 'taskmgr' ? (
                    <Activity className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  ) : win.type === 'notes' ? (
                    <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  )}
                  <span className="text-xs font-semibold truncate">{win.title}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      minimizeWindow(win.id);
                    }}
                    className="w-6 h-6 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xs flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      maximizeWindow(win.id);
                    }}
                    className="w-6 h-6 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-xs flex items-center justify-center transition-colors"
                  >
                    <Square className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(win.id);
                    }}
                    className="w-6 h-6 hover:bg-red-600 text-neutral-400 hover:text-white rounded-xs flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Window Body Contents */}
              <div className="flex-1 overflow-hidden bg-neutral-950 flex flex-col">
                {/* 1. Terminal / PowerShell */}
                {win.type === 'terminal' && (
                  <div className="flex-1 flex flex-col p-3 font-mono text-xs text-neutral-200 overflow-hidden bg-neutral-950">
                    <div className="flex-1 overflow-y-auto space-y-1 select-text">
                      {terminalHistory.map((line, idx) => (
                        <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                          {line}
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                      <span className="text-emerald-400 font-bold shrink-0">&gt;</span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        placeholder="Type remote command (help, dir, ipconfig, ping)..."
                        className="flex-1 bg-transparent text-white outline-none font-mono text-xs"
                      />
                    </form>
                  </div>
                )}

                {/* 2. Task Manager / Activity Monitor */}
                {win.type === 'taskmgr' && (
                  <div className="flex-1 p-3 flex flex-col gap-3 text-xs overflow-y-auto bg-neutral-950">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-neutral-900 border border-neutral-800 p-2.5 rounded-lg space-y-1">
                        <div className="flex items-center justify-between text-neutral-400">
                          <span>CPU Utilization</span>
                          <span className="font-mono text-emerald-400 font-bold">28% @ 4.8 GHz</span>
                        </div>
                        <canvas ref={cpuCanvasRef} width={200} height={70} className="w-full h-16 rounded" />
                      </div>

                      <div className="bg-neutral-900 border border-neutral-800 p-2.5 rounded-lg space-y-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-neutral-400">
                          <span>Memory In-Use</span>
                          <span className="font-mono text-sky-400 font-bold">22.4 GB / 64 GB</span>
                        </div>
                        <div className="w-full bg-neutral-800 h-3 rounded-full overflow-hidden">
                          <div className="bg-sky-500 h-full w-[35%]" />
                        </div>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          Committed: 28/72 GB · Speed: 6000 MT/s
                        </span>
                      </div>
                    </div>

                    {/* Process Table */}
                    <div className="flex-1 border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/60">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800 font-mono">
                          <tr>
                            <th className="py-1.5 px-2.5">Name</th>
                            <th className="py-1.5 px-2 text-right">CPU</th>
                            <th className="py-1.5 px-2 text-right">Memory</th>
                            <th className="py-1.5 pr-2.5 w-16"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900 text-neutral-300">
                          <tr>
                            <td className="py-1.5 px-2.5 font-medium flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Milan Remote Server
                            </td>
                            <td className="py-1.5 px-2 text-right font-mono text-emerald-400">1.8%</td>
                            <td className="py-1.5 px-2 text-right font-mono">148 MB</td>
                            <td className="py-1.5 pr-2.5 text-right">
                              <span className="text-neutral-500">System</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2.5 font-medium">Google Chrome (18 tabs)</td>
                            <td className="py-1.5 px-2 text-right font-mono">12.4%</td>
                            <td className="py-1.5 px-2 text-right font-mono">3,420 MB</td>
                            <td className="py-1.5 pr-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => showToast('Closed Chrome process')}
                                className="text-red-400 hover:text-red-300"
                              >
                                End
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2.5 font-medium">Visual Studio Code</td>
                            <td className="py-1.5 px-2 text-right font-mono">4.1%</td>
                            <td className="py-1.5 px-2 text-right font-mono">1,120 MB</td>
                            <td className="py-1.5 pr-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => showToast('Terminated VS Code')}
                                className="text-red-400 hover:text-red-300"
                              >
                                End
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2.5 font-medium">Docker Desktop Service</td>
                            <td className="py-1.5 px-2 text-right font-mono">3.2%</td>
                            <td className="py-1.5 px-2 text-right font-mono">2,840 MB</td>
                            <td className="py-1.5 pr-2.5 text-right">
                              <span className="text-neutral-500">Running</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. Notepad / Text Editor */}
                {win.type === 'notes' && (
                  <div className="flex-1 flex flex-col bg-neutral-950 p-2">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-xs">
                      <span className="text-neutral-400 font-mono text-[11px]">UTF-8 · Windows (CRLF)</span>
                      <button
                        type="button"
                        onClick={() => showToast('Document saved successfully to Desktop')}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                    <textarea
                      value={notepadContent}
                      onChange={(e) => setNotepadContent(e.target.value)}
                      className="flex-1 bg-transparent text-white font-mono text-xs outline-none resize-none p-1 leading-relaxed"
                    />
                  </div>
                )}

                {/* 4. File Explorer */}
                {win.type === 'explorer' && (
                  <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden text-xs">
                    <div className="p-2 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
                      <span className="font-mono text-neutral-300">C:\Users\Milan\Desktop</span>
                      <button
                        type="button"
                        onClick={onSwitchToFileTransfer}
                        className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                      >
                        <FolderSync className="w-3.5 h-3.5" />
                        <span>Open Transfer Manager</span>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                      <table className="w-full text-left text-xs">
                        <tbody className="divide-y divide-neutral-900">
                          {remoteFiles.map((file) => (
                            <tr key={file.id} className="hover:bg-neutral-900/80 transition-colors">
                              <td className="py-1.5 px-2 flex items-center gap-2">
                                <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                                <span className="font-medium text-white">{file.name}</span>
                              </td>
                              <td className="py-1.5 px-2 text-right font-mono text-neutral-400">
                                {file.isDirectory ? '--' : formatBytes(file.size)}
                              </td>
                              <td className="py-1.5 px-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => onDeleteRemoteFile(file.id)}
                                  className="text-neutral-500 hover:text-red-400 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* WHITEBOARD OVERLAY CANVAS */}
        <canvas
          ref={whiteboardCanvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute inset-0 z-30 ${
            whiteboardActive ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
          }`}
        />

        {/* WINDOWS 11 / MACOS FLUENT TASKBAR (BOTTOM) */}
        <div className="relative z-20 h-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-3 flex items-center justify-between select-none shadow-2xs">
          {/* Start Menu Button & Pinned Apps */}
          <div className="flex items-center gap-1.5">
            {/* Start Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setStartMenuOpen(!startMenuOpen);
              }}
              className="w-8 h-8 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-800 dark:text-white transition-colors border border-neutral-200 dark:border-transparent"
              title="Start Menu"
            >
              {session.os === 'macos' ? (
                <span className="font-bold text-sm"></span>
              ) : (
                <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                  <div className="bg-sky-500 rounded-2xs" />
                  <div className="bg-sky-500 rounded-2xs" />
                  <div className="bg-sky-500 rounded-2xs" />
                  <div className="bg-sky-500 rounded-2xs" />
                </div>
              )}
            </button>

            {/* Running window icons in taskbar */}
            {windows.map((win) => (
              <button
                key={win.id}
                type="button"
                onClick={() => {
                  if (win.isMinimized) {
                    setWindows((prev) =>
                      prev.map((w) => (w.id === win.id ? { ...w, isMinimized: false } : w))
                    );
                    focusWindow(win.id);
                  } else if (activeWindowId === win.id) {
                    minimizeWindow(win.id);
                  } else {
                    focusWindow(win.id);
                  }
                }}
                className={`h-7 px-2.5 rounded-md flex items-center gap-1.5 text-xs transition-colors ${
                  activeWindowId === win.id && !win.isMinimized
                    ? 'bg-neutral-200/90 dark:bg-neutral-700 text-neutral-900 dark:text-white font-medium shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {win.type === 'terminal' ? (
                  <TerminalIcon className="w-3.5 h-3.5 text-emerald-500" />
                ) : win.type === 'taskmgr' ? (
                  <Activity className="w-3.5 h-3.5 text-sky-500" />
                ) : win.type === 'notes' ? (
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-sky-500" />
                )}
                <span className="truncate max-w-[90px]">{win.title.split(' - ')[0]}</span>
              </button>
            ))}
          </div>

          {/* System Tray (Clock, Network, Sound) */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">P2P Ready</span>
            <Wifi className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            <Volume2 className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            <span className="font-mono text-neutral-800 dark:text-neutral-200 ml-1">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* START MENU POPUP (when clicked) */}
        {startMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-12 left-3 z-30 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-xs">
                M
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Milan Administrator</h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">milan-workstation</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500">Pinned Apps</span>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => openWindow('terminal', 'PowerShell')}
                  className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-800 flex items-center gap-2 text-xs text-neutral-800 dark:text-white border border-neutral-200/60 dark:border-transparent"
                >
                  <TerminalIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Terminal</span>
                </button>
                <button
                  type="button"
                  onClick={() => openWindow('explorer', 'File Explorer')}
                  className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-800 flex items-center gap-2 text-xs text-neutral-800 dark:text-white border border-neutral-200/60 dark:border-transparent"
                >
                  <Folder className="w-3.5 h-3.5 text-sky-500" />
                  <span>Explorer</span>
                </button>
                <button
                  type="button"
                  onClick={() => openWindow('taskmgr', 'Task Manager')}
                  className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-800 flex items-center gap-2 text-xs text-neutral-800 dark:text-white border border-neutral-200/60 dark:border-transparent"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-500" />
                  <span>Task Mgr</span>
                </button>
                <button
                  type="button"
                  onClick={() => openWindow('notes', 'Notepad')}
                  className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-800 flex items-center gap-2 text-xs text-neutral-800 dark:text-white border border-neutral-200/60 dark:border-transparent"
                >
                  <FileText className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                  <span>Notepad</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SLIDE-OVER IN-SESSION CHAT DRAWER */}
      {chatOpen && (
        <div className="absolute top-12 right-0 bottom-10 w-80 bg-neutral-900 border-l border-neutral-800 z-40 flex flex-col shadow-2xl">
          <div className="h-10 px-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950 shrink-0">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-bold text-white">Session Chat</span>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg space-y-1 ${
                  msg.sender === 'You'
                    ? 'bg-red-950/50 border border-red-900/50 text-white ml-4'
                    : msg.sender === 'System'
                    ? 'bg-neutral-950 border border-neutral-800 text-neutral-400 font-mono text-[11px]'
                    : 'bg-neutral-800 text-neutral-200 mr-4'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span className="font-semibold">{msg.sender}</span>
                  <span>{msg.time}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-2 border-t border-neutral-800 bg-neutral-950 flex gap-1.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message to remote user..."
              className="flex-1 h-8 bg-neutral-900 border border-neutral-700 rounded-md px-2.5 text-xs text-white placeholder:text-neutral-500 outline-none"
            />
            <button
              type="submit"
              className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
