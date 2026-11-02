import { IncomingSessionRequest, SessionPermissions } from '../types';

export type P2PMessage =
  | { type: 'ANNOUNCE'; address: string; name: string }
  | { type: 'SESSION_REQUEST'; request: IncomingSessionRequest }
  | { type: 'SESSION_ACCEPTED'; targetAddress: string; permissions: SessionPermissions }
  | { type: 'SESSION_REJECTED'; targetAddress: string; reason?: string }
  | { type: 'SESSION_TERMINATED'; targetAddress: string }
  | { type: 'FILE_DROP'; targetAddress: string; fileName: string; fileSize: number; dataUrl?: string }
  | { type: 'CHAT_MESSAGE'; targetAddress: string; sender: string; text: string; time: string };

const CHANNEL_NAME = 'milan_remote_desktop_p2p_v1';

export function getOrCreateLocalAddress(): string {
  if (typeof window === 'undefined') return '492 813 605';
  const stored = localStorage.getItem('milan_local_address');
  if (stored && stored.length === 9) {
    return `${stored.slice(0, 3)} ${stored.slice(3, 6)} ${stored.slice(6, 9)}`;
  }
  // Generate random 9-digit address
  const num = Math.floor(100000000 + Math.random() * 900000000).toString();
  localStorage.setItem('milan_local_address', num);
  return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6, 9)}`;
}

export class P2PChannelManager {
  private channel: BroadcastChannel | null = null;
  private listeners: ((msg: P2PMessage) => void)[] = [];
  public myAddress: string;

  constructor() {
    this.myAddress = getOrCreateLocalAddress();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.listeners.forEach((listener) => listener(event.data));
        };
      } catch {
        this.channel = null;
      }
    }
  }

  broadcast(msg: P2PMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch {
        // Fallback
      }
    }
  }

  subscribe(listener: (msg: P2PMessage) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}

export const p2pManager = new P2PChannelManager();
