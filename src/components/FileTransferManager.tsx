import React, { useState, useRef } from 'react';
import { 
  Folder, 
  FileText, 
  FileCode, 
  FileArchive, 
  Image as ImageIcon, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Download, 
  Trash2, 
  FolderPlus, 
  RefreshCw, 
  Search, 
  CheckSquare, 
  Square, 
  HardDrive, 
  Laptop, 
  CheckCircle2, 
  X, 
  Clock, 
  Zap, 
  ChevronRight,
  FolderUp
} from 'lucide-react';
import { FileItem, TransferTask, OSType } from '../types';
import { formatBytes } from '../utils/formatters';
import { sounds } from '../utils/soundEffects';

interface FileTransferManagerProps {
  remoteDeviceName: string;
  remoteOS: OSType;
  remoteAddress: string;
  localFiles: FileItem[];
  remoteFiles: FileItem[];
  onUploadToRemote: (selectedLocalIds: string[], targetRemotePath: string) => void;
  onDownloadToLocal: (selectedRemoteIds: string[]) => void;
  onAddLocalFiles: (files: FileItem[]) => void;
  onCreateRemoteFolder: (folderName: string, parentPath: string) => void;
  onDeleteRemoteFile: (fileId: string) => void;
  activeTransfers: TransferTask[];
  onCancelTransfer: (transferId: string) => void;
  onClearCompletedTransfers: () => void;
}

export const FileTransferManager: React.FC<FileTransferManagerProps> = ({
  remoteDeviceName,
  remoteOS,
  remoteAddress,
  localFiles,
  remoteFiles,
  onUploadToRemote,
  onDownloadToLocal,
  onAddLocalFiles,
  onCreateRemoteFolder,
  onDeleteRemoteFile,
  activeTransfers,
  onCancelTransfer,
  onClearCompletedTransfers,
}) => {
  // Navigation states
  const [localCurrentPath, setLocalCurrentPath] = useState<string>('/Downloads');
  const [remoteCurrentPath, setRemoteCurrentPath] = useState<string>(
    remoteOS === 'windows' ? 'C:/Users/Milan/Desktop' : '/Users/milan/Desktop'
  );

  // Selection states
  const [selectedLocalIds, setSelectedLocalIds] = useState<Set<string>>(new Set());
  const [selectedRemoteIds, setSelectedRemoteIds] = useState<Set<string>>(new Set());

  // Search states
  const [localSearch, setLocalSearch] = useState('');
  const [remoteSearch, setRemoteSearch] = useState('');

  // New folder modal state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Hidden real file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered files for current paths
  const currentLocalList = localFiles.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(localSearch.toLowerCase());
    return matchesSearch;
  });

  const currentRemoteList = remoteFiles.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(remoteSearch.toLowerCase());
    return matchesSearch;
  });

  // Handle real files uploaded from the user's hard drive
  const handleRealFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const uploadedFiles: FileItem[] = Array.from(e.target.files).map((file, idx) => ({
      id: `real-loc-${Date.now()}-${idx}`,
      name: file.name,
      size: file.size,
      isDirectory: false,
      modified: 'Just now',
      path: `${localCurrentPath}/${file.name}`,
      extension: file.name.split('.').pop()?.toLowerCase() || '',
    }));

    onAddLocalFiles(uploadedFiles);
    // Auto-select these files for quick transfer
    setSelectedLocalIds(new Set(uploadedFiles.map((f) => f.id)));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleSelectLocal = (id: string) => {
    setSelectedLocalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectRemote = (id: string) => {
    setSelectedRemoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllLocal = () => {
    if (selectedLocalIds.size === currentLocalList.length) {
      setSelectedLocalIds(new Set());
    } else {
      setSelectedLocalIds(new Set(currentLocalList.map((f) => f.id)));
    }
  };

  const handleSelectAllRemote = () => {
    if (selectedRemoteIds.size === currentRemoteList.length) {
      setSelectedRemoteIds(new Set());
    } else {
      setSelectedRemoteIds(new Set(currentRemoteList.map((f) => f.id)));
    }
  };

  const handleTriggerUpload = () => {
    if (selectedLocalIds.size === 0) return;
    onUploadToRemote(Array.from(selectedLocalIds), remoteCurrentPath);
    setSelectedLocalIds(new Set());
  };

  const handleTriggerDownload = () => {
    if (selectedRemoteIds.size === 0) return;
    onDownloadToLocal(Array.from(selectedRemoteIds));
    setSelectedRemoteIds(new Set());
  };

  const handleFolderCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateRemoteFolder(newFolderName.trim(), remoteCurrentPath);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const getFileIcon = (file: FileItem) => {
    if (file.isDirectory) return <Folder className="w-4 h-4 text-amber-400 shrink-0" />;
    const ext = file.extension?.toLowerCase() || '';
    if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) {
      return <FileArchive className="w-4 h-4 text-purple-400 shrink-0" />;
    }
    if (['jpg', 'jpeg', 'png', 'svg', 'gif', 'webp'].includes(ext)) {
      return <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (['ts', 'js', 'json', 'py', 'sh', 'sql', 'html', 'css', 'env', 'yml'].includes(ext)) {
      return <FileCode className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-neutral-300 shrink-0" />;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 overflow-hidden">
      {/* Top Banner: Dual Machine Summary */}
      <div className="h-12 bg-white dark:bg-neutral-950 border-b border-slate-200/90 dark:border-neutral-800 px-4 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">This Computer</span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono font-medium">(Local Client)</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">{remoteDeviceName}</span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono font-medium">({remoteAddress})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Real Hard Drive Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRealFileInput}
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 px-3 bg-slate-100 hover:bg-slate-200/90 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300/80 dark:border-neutral-700 shadow-xs cursor-pointer active:scale-95"
            title="Choose files from your hard drive to send"
          >
            <Upload className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Add Files from PC</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-slate-50/60 dark:bg-neutral-900">
        {/* LEFT PANE: LOCAL COMPUTER */}
        <div className="lg:col-span-5 flex flex-col border-r border-slate-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-950/60 overflow-hidden">
          {/* Local Pane Header / Breadcrumbs */}
          <div className="p-3 border-b border-slate-200/90 dark:border-neutral-800 bg-slate-50/80 dark:bg-neutral-950 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-neutral-300 font-mono truncate">
                <span className="text-slate-400 dark:text-neutral-500">Local:</span>
                <span className="text-slate-900 dark:text-white font-bold truncate">{localCurrentPath}</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium shrink-0">
                {currentLocalList.length} items
              </span>
            </div>

            {/* Local Search & Select All */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllLocal}
                className="p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-neutral-800 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Select / Deselect all"
              >
                {selectedLocalIds.size === currentLocalList.length && currentLocalList.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-red-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>

              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Filter local files..."
                  className="w-full h-7 bg-white dark:bg-neutral-900 border border-slate-250 dark:border-neutral-800 rounded-md pl-7 pr-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Local Files Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-100/90 dark:bg-neutral-900/80 sticky top-0 border-b border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                <tr>
                  <th className="py-2 pl-3 pr-2 w-8"></th>
                  <th className="py-2 px-2 font-medium">Name</th>
                  <th className="py-2 px-2 font-medium text-right w-24">Size</th>
                  <th className="py-2 pr-3 pl-2 font-medium text-right w-28">Modified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                {currentLocalList.map((file) => {
                  const isSelected = selectedLocalIds.has(file.id);
                  return (
                    <tr
                      key={file.id}
                      onClick={() => toggleSelectLocal(file.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-50 dark:bg-red-950/40 text-neutral-900 dark:text-white font-medium'
                          : 'hover:bg-neutral-100/70 dark:hover:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <td className="py-2 pl-3 pr-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleSelectLocal(file.id)}
                          className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-red-600" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-600" />
                          )}
                        </button>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2 truncate">
                          {getFileIcon(file)}
                          <span className="truncate">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                        {file.isDirectory ? '--' : formatBytes(file.size)}
                      </td>
                      <td className="py-2 pr-3 pl-2 text-right font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                        {file.modified}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Local Pane Footer Selection Counter */}
          <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
            <span>
              {selectedLocalIds.size} of {currentLocalList.length} selected
            </span>
            {selectedLocalIds.size > 0 && (
              <span className="text-neutral-900 dark:text-white font-mono font-medium">
                {formatBytes(
                  currentLocalList
                    .filter((f) => selectedLocalIds.has(f.id))
                    .reduce((acc, f) => acc + f.size, 0)
                )}
              </span>
            )}
          </div>
        </div>

        {/* CENTER ACTION COLUMN (Iconic AnyDesk Action Bar) */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center gap-3 p-4 bg-slate-100/90 dark:bg-neutral-900/90 border-r border-slate-200/90 dark:border-neutral-800 shrink-0">
          <div className="text-center space-y-1 mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-neutral-400 tracking-wider">
              Transfer
            </span>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            disabled={selectedLocalIds.size === 0}
            onClick={handleTriggerUpload}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              selectedLocalIds.size > 0
                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-500/20 active:scale-95 cursor-pointer'
                : 'bg-slate-200 dark:bg-neutral-800 text-slate-400 dark:text-neutral-500 cursor-not-allowed'
            }`}
            title="Upload selected local files to remote folder"
          >
            <span>Upload</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Download Button */}
          <button
            type="button"
            disabled={selectedRemoteIds.size === 0}
            onClick={handleTriggerDownload}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              selectedRemoteIds.size > 0
                ? 'bg-white hover:bg-slate-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-white border border-slate-300/80 dark:border-neutral-700 shadow-xs active:scale-95 cursor-pointer'
                : 'bg-slate-200/70 dark:bg-neutral-800/50 text-slate-400 dark:text-neutral-600 cursor-not-allowed'
            }`}
            title="Download selected remote files to local computer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Download</span>
          </button>

          {/* Active speed indicator */}
          {activeTransfers.some((t) => t.status === 'transferring') && (
            <div className="w-full bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl p-2.5 text-center mt-3 space-y-1 shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                <span className="font-mono tabular-nums">48.2 MB/s</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium">P2P Stream Active</p>
            </div>
          )}
        </div>

        {/* RIGHT PANE: REMOTE COMPUTER */}
        <div className="lg:col-span-5 flex flex-col bg-white dark:bg-neutral-950/60 overflow-hidden">
          {/* Remote Pane Header / Breadcrumbs */}
          <div className="p-3 border-b border-slate-200/90 dark:border-neutral-800 bg-slate-50/80 dark:bg-neutral-950 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-neutral-300 font-mono truncate">
                <span className="text-slate-400 dark:text-neutral-500">Remote:</span>
                <span className="text-slate-900 dark:text-white font-bold truncate">{remoteCurrentPath}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(true)}
                  className="p-1.5 hover:bg-slate-200/80 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="New Remote Folder"
                >
                  <FolderPlus className="w-4 h-4 text-amber-500" />
                </button>
              </div>
            </div>

            {/* Remote Search & Select All */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllRemote}
                className="p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-neutral-800 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Select / Deselect all"
              >
                {selectedRemoteIds.size === currentRemoteList.length && currentRemoteList.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-red-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>

              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
                <input
                  type="text"
                  value={remoteSearch}
                  onChange={(e) => setRemoteSearch(e.target.value)}
                  placeholder="Filter remote files..."
                  className="w-full h-7 bg-white dark:bg-neutral-900 border border-slate-250 dark:border-neutral-800 rounded-md pl-7 pr-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* New Folder Inline Form if active */}
          {isCreatingFolder && (
            <form
              onSubmit={handleFolderCreateSubmit}
              className="p-2.5 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4 text-amber-500 shrink-0" />
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="flex-1 h-7 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded px-2 text-xs text-neutral-900 dark:text-white outline-none"
              />
              <button
                type="submit"
                className="px-2.5 h-7 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Remote Files Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-100/90 dark:bg-neutral-900/80 sticky top-0 border-b border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                <tr>
                  <th className="py-2 pl-3 pr-2 w-8"></th>
                  <th className="py-2 px-2 font-medium">Name</th>
                  <th className="py-2 px-2 font-medium text-right w-24">Size</th>
                  <th className="py-2 pr-3 pl-2 font-medium text-right w-28">Modified</th>
                  <th className="py-2 pr-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                {currentRemoteList.map((file) => {
                  const isSelected = selectedRemoteIds.has(file.id);
                  return (
                    <tr
                      key={file.id}
                      onClick={() => toggleSelectRemote(file.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-50 dark:bg-red-950/40 text-neutral-900 dark:text-white font-medium'
                          : 'hover:bg-neutral-100/70 dark:hover:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <td className="py-2 pl-3 pr-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleSelectRemote(file.id)}
                          className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-red-600" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-600" />
                          )}
                        </button>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2 truncate">
                          {getFileIcon(file)}
                          <span className="truncate">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                        {file.isDirectory ? '--' : formatBytes(file.size)}
                      </td>
                      <td className="py-2 pr-3 pl-2 text-right font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                        {file.modified}
                      </td>
                      <td className="py-2 pr-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onDeleteRemoteFile(file.id)}
                          className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                          title="Delete file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Remote Pane Footer Selection Counter */}
          <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
            <span>
              {selectedRemoteIds.size} of {currentRemoteList.length} selected
            </span>
            {selectedRemoteIds.size > 0 && (
              <span className="text-neutral-900 dark:text-white font-mono font-medium">
                {formatBytes(
                  currentRemoteList
                    .filter((f) => selectedRemoteIds.has(f.id))
                    .reduce((acc, f) => acc + f.size, 0)
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM TRANSFER QUEUE & SPEED MONITOR DRAWER */}
      <div className="bg-white dark:bg-neutral-950 border-t border-slate-200/90 dark:border-neutral-800 p-3 shrink-0 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-neutral-200">Transfer Queue</span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 font-medium">
              ({activeTransfers.length} total)
            </span>
          </div>

          {activeTransfers.length > 0 && (
            <button
              type="button"
              onClick={onClearCompletedTransfers}
              className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors font-medium cursor-pointer"
            >
              Clear Completed
            </button>
          )}
        </div>

        {activeTransfers.length === 0 ? (
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 py-1 font-mono">
            No transfers in progress. Select files above and click Upload or Download.
          </div>
        ) : (
          <div className="max-h-28 overflow-y-auto space-y-2">
            {activeTransfers.map((task) => {
              const progressPct =
                task.fileSize > 0
                  ? Math.min(100, Math.round((task.transferredBytes / task.fileSize) * 100))
                  : 100;
              return (
                <div
                  key={task.id}
                  className="bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800/80 rounded-lg p-2 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {task.direction === 'upload' ? (
                      <Upload className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="truncate font-semibold text-slate-900 dark:text-neutral-200">{task.fileName}</span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 shrink-0">
                      ({formatBytes(task.transferredBytes)} / {formatBytes(task.fileSize)})
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-32 bg-slate-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden shrink-0">
                    <div
                      className={`h-full transition-all duration-300 ${
                        task.status === 'completed'
                          ? 'bg-emerald-500'
                          : task.status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-gradient-to-r from-red-600 to-rose-600'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <span className="font-mono tabular-nums text-[11px] text-slate-700 dark:text-neutral-300 w-10 text-right shrink-0 font-bold">
                    {progressPct}%
                  </span>

                  {task.status === 'transferring' ? (
                    <button
                      type="button"
                      onClick={() => onCancelTransfer(task.id)}
                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  ) : task.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">Cancelled</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
