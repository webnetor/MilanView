export type OSType = 'windows' | 'macos' | 'linux';

export type DeviceStatus = 'online' | 'busy' | 'offline';

export interface Device {
  id: string;
  name: string;
  alias: string;
  address: string; // 9-digit format: "492 813 605"
  os: OSType;
  ip: string;
  status: DeviceStatus;
  latencyMs: number;
  favorite: boolean;
  group: 'Workstations' | 'Cloud Nodes' | 'Home Lab';
  lastActive: string;
  unattendedPassword?: string;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    resolution: string;
  };
}

export interface SessionPermissions {
  mouse: boolean;
  keyboard: boolean;
  clipboard: boolean;
  fileTransfer: boolean;
  audio: boolean;
  lock: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  size: number; // in bytes
  isDirectory: boolean;
  modified: string;
  path: string;
  extension?: string;
  content?: string;
}

export interface TransferTask {
  id: string;
  fileName: string;
  fileSize: number;
  transferredBytes: number;
  direction: 'upload' | 'download';
  status: 'queued' | 'transferring' | 'completed' | 'cancelled' | 'failed';
  speedBytesPerSec: number;
  startedAt: number;
  sourcePath: string;
  targetPath: string;
}

export interface WindowItem {
  id: string;
  title: string;
  type: 'explorer' | 'terminal' | 'taskmgr' | 'notes' | 'whiteboard' | 'browser';
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  initialPath?: string;
}

export interface SessionTab {
  id: string;
  type: 'home' | 'remote-control' | 'file-transfer';
  deviceId: string;
  deviceTitle: string;
  address: string;
  os: OSType;
  connectedAt: number;
  latencyMs: number;
  fps: number;
  bandwidthMbps: number;
  viewMode: 'fit' | 'original' | 'stretch';
  displayIndex: 1 | 2;
  isMuted: boolean;
  isRecording: boolean;
  permissions: SessionPermissions;
  isLiveShare?: boolean;
}

export interface IncomingSessionRequest {
  requestId: string;
  clientAddress: string;
  clientName: string;
  clientOS: OSType;
  timestamp: number;
  requestedPermissions: SessionPermissions;
}
