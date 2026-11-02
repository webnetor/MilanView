import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { RemoteSession } from './components/RemoteSession';
import { FileTransferManager } from './components/FileTransferManager';
import { IncomingRequestModal } from './components/IncomingRequestModal';
import { AddDeviceModal } from './components/AddDeviceModal';
import { SecuritySettingsModal } from './components/SecuritySettingsModal';
import { QRCodeModal } from './components/QRCodeModal';
import { HelpModal } from './components/HelpModal';
import { INITIAL_DEVICES } from './data/devices';
import { INITIAL_LOCAL_FILES, INITIAL_REMOTE_FILES } from './data/sampleFileSystem';
import { 
  Device, 
  SessionTab, 
  FileItem, 
  TransferTask, 
  IncomingSessionRequest, 
  SessionPermissions,
  OSType
} from './types';
import { cleanMilanDigits, formatMilanAddress } from './utils/formatters';
import { sounds } from './utils/soundEffects';
import { p2pManager, getOrCreateLocalAddress } from './utils/p2pChannel';

export default function App() {
  // Theme & Audio state - default to attractive light mode theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('milan_theme');
    return saved ? saved === 'dark' : false; // Default to Light Mode
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Address of this desk
  const [myAddress, setMyAddress] = useState<string>('492 813 605');

  // Address Book devices
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem('milan_devices');
    return saved ? JSON.parse(saved) : INITIAL_DEVICES;
  });

  // Session Tabs
  const [tabs, setTabs] = useState<SessionTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-home');

  // File systems state
  const [localFiles, setLocalFiles] = useState<FileItem[]>(INITIAL_LOCAL_FILES);
  const [remoteFilesMap, setRemoteFilesMap] = useState<Record<string, FileItem[]>>(INITIAL_REMOTE_FILES);
  const [activeTransfers, setActiveTransfers] = useState<TransferTask[]>([]);

  // Security password
  const [unattendedPassword, setUnattendedPassword] = useState<string>('milan');

  // Modals
  const [incomingRequest, setIncomingRequest] = useState<IncomingSessionRequest | null>(null);
  const [addDeviceModalOpen, setAddDeviceModalOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Initialize address and P2P listener
  useEffect(() => {
    const addr = getOrCreateLocalAddress();
    setMyAddress(addr);

    // Save devices to localStorage on change
    localStorage.setItem('milan_devices', JSON.stringify(devices));
  }, [devices]);

  // Sync dark class on html and persist
  useEffect(() => {
    localStorage.setItem('milan_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // P2P Broadcast Channel listener for cross-tab sessions
  useEffect(() => {
    const unsubscribe = p2pManager.subscribe((msg) => {
      if (msg.type === 'SESSION_REQUEST') {
        const cleanTarget = cleanMilanDigits(msg.request.clientAddress);
        const cleanMine = cleanMilanDigits(myAddress);

        if (cleanTarget === cleanMine) {
          if (!isMuted) sounds.playIncomingChime();
          setIncomingRequest(msg.request);
        }
      } else if (msg.type === 'SESSION_ACCEPTED') {
        // Tab B received approval from Tab A!
        if (!isMuted) sounds.playConnectSound();
      }
    });

    return () => unsubscribe();
  }, [myAddress, isMuted]);

  // Connect to a device by ID or 9-digit address
  const handleConnect = (addressOrId: string, mode: 'remote-control' | 'file-transfer') => {
    const cleanInput = cleanMilanDigits(addressOrId);

    // Check if matched in Address Book
    let matchedDevice = devices.find(
      (d) => d.id === addressOrId || cleanMilanDigits(d.address) === cleanInput || d.alias.toLowerCase() === addressOrId.toLowerCase()
    );

    // If not found in address book, create dynamic ad-hoc device
    if (!matchedDevice) {
      const formatted = cleanInput.length === 9 ? formatMilanAddress(cleanInput) : addressOrId;
      matchedDevice = {
        id: `dev-adhoc-${Date.now()}`,
        name: `Remote Desk (${formatted})`,
        alias: `remote-${cleanInput.slice(0, 4)}`,
        address: formatted,
        os: 'windows',
        ip: '192.168.1.189',
        status: 'online',
        latencyMs: 12,
        favorite: false,
        group: 'Workstations',
        lastActive: 'Connected now',
        specs: {
          cpu: 'AMD Ryzen 9 or Intel Core Ultra',
          ram: '32 GB RAM',
          storage: '1 TB NVMe',
          resolution: '3840 x 2160',
        },
      };

      // Add to address book so it persists
      setDevices((prev) => [matchedDevice!, ...prev]);
    }

    // Check if tab already exists for this device
    const existingTab = tabs.find(
      (t) => t.deviceId === matchedDevice!.id && t.type === mode
    );

    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    if (!isMuted) sounds.playConnectSound();

    // Create new session tab
    const newTab: SessionTab = {
      id: `tab-${mode}-${Date.now()}`,
      type: mode,
      deviceId: matchedDevice.id,
      deviceTitle: matchedDevice.name,
      address: matchedDevice.address,
      os: matchedDevice.os,
      connectedAt: Date.now(),
      latencyMs: matchedDevice.latencyMs,
      fps: 60,
      bandwidthMbps: 3.8,
      viewMode: 'fit',
      displayIndex: 1,
      isMuted: false,
      isRecording: false,
      permissions: {
        mouse: true,
        keyboard: true,
        clipboard: true,
        fileTransfer: true,
        audio: true,
        lock: false,
      },
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);

    // Also broadcast request via P2P for cross-tab testing
    p2pManager.broadcast({
      type: 'SESSION_REQUEST',
      request: {
        requestId: `req-${Date.now()}`,
        clientAddress: myAddress,
        clientName: 'Milan Personal Client',
        clientOS: 'windows',
        timestamp: Date.now(),
        requestedPermissions: newTab.permissions,
      },
    });
  };

  // Close Session Tab
  const handleCloseTab = (tabId: string) => {
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) {
        if (filtered.length > 0) {
          setActiveTabId(filtered[filtered.length - 1].id);
        } else {
          setActiveTabId('tab-home');
        }
      }
      return filtered;
    });
  };

  // Switch an active remote session into file transfer mode
  const handleSwitchToFileTransfer = (session: SessionTab) => {
    const existingFileTab = tabs.find(
      (t) => t.deviceId === session.deviceId && t.type === 'file-transfer'
    );
    if (existingFileTab) {
      setActiveTabId(existingFileTab.id);
    } else {
      const newFileTab: SessionTab = {
        ...session,
        id: `tab-file-transfer-${Date.now()}`,
        type: 'file-transfer',
      };
      setTabs((prev) => [...prev, newFileTab]);
      setActiveTabId(newFileTab.id);
    }
  };

  // Real Screen Sharing using navigator.mediaDevices.getDisplayMedia
  const handleStartLiveBroadcast = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      alert('Screen Sharing is not supported by this browser environment.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setIsBroadcasting(true);
      if (!isMuted) sounds.playConnectSound();

      // Open a live broadcast session tab
      const broadcastTab: SessionTab = {
        id: `tab-broadcast-${Date.now()}`,
        type: 'remote-control',
        deviceId: 'dev-local-broadcast',
        deviceTitle: 'Live Screen Broadcast (This PC)',
        address: myAddress,
        os: 'windows',
        connectedAt: Date.now(),
        latencyMs: 4,
        fps: 60,
        bandwidthMbps: 5.2,
        viewMode: 'fit',
        displayIndex: 1,
        isMuted: false,
        isRecording: false,
        permissions: {
          mouse: false,
          keyboard: false,
          clipboard: true,
          fileTransfer: true,
          audio: true,
          lock: false,
        },
        isLiveShare: true,
      };

      setTabs((prev) => [...prev, broadcastTab]);
      setActiveTabId(broadcastTab.id);

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        setIsBroadcasting(false);
      };
    } catch {
      // User cancelled picker
      setIsBroadcasting(false);
    }
  };

  // Accept incoming connection request
  const handleAcceptIncoming = (permissions: SessionPermissions) => {
    if (!incomingRequest) return;
    if (!isMuted) sounds.playConnectSound();

    p2pManager.broadcast({
      type: 'SESSION_ACCEPTED',
      targetAddress: incomingRequest.clientAddress,
      permissions,
    });

    // Create session tab for the incoming client
    const newTab: SessionTab = {
      id: `tab-incoming-${Date.now()}`,
      type: 'remote-control',
      deviceId: `dev-${incomingRequest.clientAddress}`,
      deviceTitle: incomingRequest.clientName,
      address: incomingRequest.clientAddress,
      os: incomingRequest.clientOS,
      connectedAt: Date.now(),
      latencyMs: 9,
      fps: 60,
      bandwidthMbps: 4.1,
      viewMode: 'fit',
      displayIndex: 1,
      isMuted: false,
      isRecording: false,
      permissions,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setIncomingRequest(null);
  };

  // Reject incoming connection request
  const handleRejectIncoming = () => {
    if (incomingRequest) {
      p2pManager.broadcast({
        type: 'SESSION_REJECTED',
        targetAddress: incomingRequest.clientAddress,
      });
      setIncomingRequest(null);
    }
  };

  // File Transfer: Upload to remote
  const handleUploadToRemote = (selectedLocalIds: string[], targetRemotePath: string) => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    const targetDevId = activeTab?.deviceId || 'dev-win-11';

    const filesToUpload = localFiles.filter((f) => selectedLocalIds.includes(f.id));
    if (filesToUpload.length === 0) return;

    filesToUpload.forEach((file) => {
      const taskId = `task-${Date.now()}-${Math.random()}`;
      const newTask: TransferTask = {
        id: taskId,
        fileName: file.name,
        fileSize: file.size,
        transferredBytes: 0,
        direction: 'upload',
        status: 'transferring',
        speedBytesPerSec: 48 * 1024 * 1024,
        startedAt: Date.now(),
        sourcePath: file.path,
        targetPath: `${targetRemotePath}/${file.name}`,
      };

      setActiveTransfers((prev) => [newTask, ...prev]);

      // Progress animation
      let progress = 0;
      const interval = setInterval(() => {
        progress += file.size > 10000000 ? file.size * 0.25 : file.size * 0.5;
        if (progress >= file.size) {
          clearInterval(interval);
          setActiveTransfers((prev) =>
            prev.map((t) =>
              t.id === taskId
                ? { ...t, transferredBytes: file.size, status: 'completed' }
                : t
            )
          );

          // Add to remote file list
          setRemoteFilesMap((prev) => {
            const currentList = prev[targetDevId] || INITIAL_REMOTE_FILES['dev-win-11'];
            const exists = currentList.some((f) => f.name === file.name);
            if (exists) return prev;
            const newRemoteFile: FileItem = {
              id: `rem-uploaded-${Date.now()}-${Math.random()}`,
              name: file.name,
              size: file.size,
              isDirectory: false,
              modified: 'Just now',
              path: `${targetRemotePath}/${file.name}`,
              extension: file.extension,
              content: file.content,
            };
            return {
              ...prev,
              [targetDevId]: [newRemoteFile, ...currentList],
            };
          });

          if (!isMuted) sounds.playTransferComplete();
        } else {
          setActiveTransfers((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, transferredBytes: Math.floor(progress) } : t
            )
          );
        }
      }, 300);
    });
  };

  // File Transfer: Download to local PC
  const handleDownloadToLocal = (selectedRemoteIds: string[]) => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    const targetDevId = activeTab?.deviceId || 'dev-win-11';
    const remoteList = remoteFilesMap[targetDevId] || INITIAL_REMOTE_FILES['dev-win-11'];

    const filesToDownload = remoteList.filter((f) => selectedRemoteIds.includes(f.id));
    if (filesToDownload.length === 0) return;

    filesToDownload.forEach((file) => {
      const taskId = `task-down-${Date.now()}-${Math.random()}`;
      const newTask: TransferTask = {
        id: taskId,
        fileName: file.name,
        fileSize: file.size,
        transferredBytes: 0,
        direction: 'download',
        status: 'transferring',
        speedBytesPerSec: 52 * 1024 * 1024,
        startedAt: Date.now(),
        sourcePath: file.path,
        targetPath: `/Downloads/${file.name}`,
      };

      setActiveTransfers((prev) => [newTask, ...prev]);

      // Progress animation
      let progress = 0;
      const interval = setInterval(() => {
        progress += file.size > 10000000 ? file.size * 0.25 : file.size * 0.5;
        if (progress >= file.size) {
          clearInterval(interval);
          setActiveTransfers((prev) =>
            prev.map((t) =>
              t.id === taskId
                ? { ...t, transferredBytes: file.size, status: 'completed' }
                : t
            )
          );

          // Add to local files list
          setLocalFiles((prev) => {
            const exists = prev.some((f) => f.name === file.name);
            if (exists) return prev;
            return [
              {
                id: `loc-downloaded-${Date.now()}`,
                name: file.name,
                size: file.size,
                isDirectory: false,
                modified: 'Just now',
                path: `/Downloads/${file.name}`,
                extension: file.extension,
                content: file.content,
              },
              ...prev,
            ];
          });

          // Trigger real browser download for client
          try {
            const blob = new Blob([file.content || `Milan Remote Desktop File: ${file.name}`], {
              type: 'text/plain;charset=utf-8',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch {
            // Silently handled
          }

          if (!isMuted) sounds.playTransferComplete();
        } else {
          setActiveTransfers((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, transferredBytes: Math.floor(progress) } : t
            )
          );
        }
      }, 300);
    });
  };

  // Add custom files from hard drive
  const handleAddLocalFiles = (newFiles: FileItem[]) => {
    setLocalFiles((prev) => [...newFiles, ...prev]);
  };

  // Add folder to remote file system
  const handleCreateRemoteFolder = (folderName: string, parentPath: string) => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    const targetDevId = activeTab?.deviceId || 'dev-win-11';

    const newFolderItem: FileItem = {
      id: `rem-dir-${Date.now()}`,
      name: folderName,
      size: 0,
      isDirectory: true,
      modified: 'Just now',
      path: `${parentPath}/${folderName}`,
    };

    setRemoteFilesMap((prev) => {
      const currentList = prev[targetDevId] || INITIAL_REMOTE_FILES['dev-win-11'];
      return {
        ...prev,
        [targetDevId]: [newFolderItem, ...currentList],
      };
    });
  };

  // Delete remote file
  const handleDeleteRemoteFile = (fileId: string) => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    const targetDevId = activeTab?.deviceId || 'dev-win-11';

    setRemoteFilesMap((prev) => {
      const currentList = prev[targetDevId] || INITIAL_REMOTE_FILES['dev-win-11'];
      return {
        ...prev,
        [targetDevId]: currentList.filter((f) => f.id !== fileId),
      };
    });
  };

  // Active session object if any
  const currentSession = tabs.find((t) => t.id === activeTabId);
  const currentRemoteFiles = currentSession
    ? remoteFilesMap[currentSession.deviceId] || INITIAL_REMOTE_FILES['dev-win-11']
    : INITIAL_REMOTE_FILES['dev-win-11'];

  return (
    <div className={`w-screen h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 ${isDark ? 'dark' : ''}`}>
      {/* ANYDESK HEADER & SESSION TABS */}
      <Header
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={(tabId) => setActiveTabId(tabId)}
        onCloseTab={handleCloseTab}
        onNewTab={() => setActiveTabId('tab-home')}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onOpenSettings={() => setSecurityModalOpen(true)}
        onOpenHelp={() => setHelpModalOpen(true)}
      />

      {/* VIEWPORT BODY */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {activeTabId === 'tab-home' || !currentSession ? (
          <HomeDashboard
            myAddress={myAddress}
            devices={devices}
            onConnect={handleConnect}
            onAddDevice={() => setAddDeviceModalOpen(true)}
            onDeleteDevice={(id) => setDevices((prev) => prev.filter((d) => d.id !== id))}
            onToggleFavorite={(id) =>
              setDevices((prev) =>
                prev.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d))
              )
            }
            onOpenSettings={() => setSecurityModalOpen(true)}
            onOpenQRCode={() => setQrModalOpen(true)}
            onStartLiveBroadcast={handleStartLiveBroadcast}
            isBroadcasting={isBroadcasting}
          />
        ) : currentSession.type === 'file-transfer' ? (
          <FileTransferManager
            remoteDeviceName={currentSession.deviceTitle}
            remoteOS={currentSession.os}
            remoteAddress={currentSession.address}
            localFiles={localFiles}
            remoteFiles={currentRemoteFiles}
            onUploadToRemote={handleUploadToRemote}
            onDownloadToLocal={handleDownloadToLocal}
            onAddLocalFiles={handleAddLocalFiles}
            onCreateRemoteFolder={handleCreateRemoteFolder}
            onDeleteRemoteFile={handleDeleteRemoteFile}
            activeTransfers={activeTransfers}
            onCancelTransfer={(taskId) =>
              setActiveTransfers((prev) =>
                prev.map((t) => (t.id === taskId ? { ...t, status: 'cancelled' } : t))
              )
            }
            onClearCompletedTransfers={() =>
              setActiveTransfers((prev) =>
                prev.filter((t) => t.status === 'transferring' || t.status === 'queued')
              )
            }
          />
        ) : (
          <RemoteSession
            session={currentSession}
            onDisconnect={() => handleCloseTab(currentSession.id)}
            onSwitchToFileTransfer={() => handleSwitchToFileTransfer(currentSession)}
            remoteFiles={currentRemoteFiles}
            onUploadFileToRemote={(file) => {
              const targetDevId = currentSession.deviceId;
              setRemoteFilesMap((prev) => ({
                ...prev,
                [targetDevId]: [file, ...(prev[targetDevId] || [])],
              }));
            }}
            onDeleteRemoteFile={handleDeleteRemoteFile}
          />
        )}
      </main>

      {/* INCOMING CONNECTION REQUEST MODAL */}
      {incomingRequest && (
        <IncomingRequestModal
          request={incomingRequest}
          onAccept={handleAcceptIncoming}
          onReject={handleRejectIncoming}
        />
      )}

      {/* ADD DEVICE MODAL */}
      {addDeviceModalOpen && (
        <AddDeviceModal
          onAdd={(newDev) => setDevices((prev) => [newDev, ...prev])}
          onClose={() => setAddDeviceModalOpen(false)}
        />
      )}

      {/* SECURITY & UNATTENDED ACCESS MODAL */}
      {securityModalOpen && (
        <SecuritySettingsModal
          unattendedPassword={unattendedPassword}
          onSavePassword={(pwd) => setUnattendedPassword(pwd)}
          onClose={() => setSecurityModalOpen(false)}
        />
      )}

      {/* QR CODE PAIRING MODAL */}
      {qrModalOpen && (
        <QRCodeModal
          address={myAddress}
          onClose={() => setQrModalOpen(false)}
        />
      )}

      {/* GUIDE & SHORTCUTS MODAL */}
      {helpModalOpen && <HelpModal onClose={() => setHelpModalOpen(false)} />}
    </div>
  );
}
