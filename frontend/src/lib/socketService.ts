import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

// Define strict types for event payloads
interface SOSAlertPayload {
  machindId: string;
  reason: string;
  [key: string]: unknown;
}

interface BatchUpdatePayload {
  batchId: string;
  status: string;
  [key: string]: unknown;
}

interface QCUpdatePayload {
  checkId: string;
  status: 'passed' | 'failed';
  [key: string]: unknown;
}

interface StockAlertPayload {
  itemId: string;
  quantity: number;
  [key: string]: unknown;
}

interface AnnouncementPayload {
  message: string;
  priority: 'low' | 'medium' | 'high';
  [key: string]: unknown;
}

// Define strict interfaces for client and server events
interface ServerToClientEvents {
  sos_alert: (data: SOSAlertPayload) => void;
  batch_update: (data: BatchUpdatePayload) => void;
  qc_update: (data: QCUpdatePayload) => void;
  stock_alert: (data: StockAlertPayload) => void;
  announcement: (data: AnnouncementPayload) => void;
  // Standard events
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  reconnect: (attemptNumber: number) => void;
}

interface ClientToServerEvents {
  sos_alert: (data: SOSAlertPayload) => void;
  batch_update: (data: BatchUpdatePayload) => void;
}

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor() {
    this.connect();
  }

  private connect() {
    const SOCKET_URL = (import.meta.env.VITE_WS_URL as string) ?? 'http://localhost:5000';

    this.socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    }) as Socket<ServerToClientEvents, ClientToServerEvents>;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      toast.success('Real-time connection established', { 
        duration: 2000,
        position: 'bottom-right' 
      });
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Unable to establish real-time connection', {
          duration: 5000,
          position: 'bottom-right'
        });
      }
    });

    // Custom events
    // Note: 'reconnect' is a Manager event, not strictly on the Socket type in v4,
    // but often works. For strict typing, we rely on the specific ServerToClientEvents.
    // However, the 'io' client manager handles reconnection logic. 
    // We'll keep the logic simple here.
    this.socket.on('reconnect', (attemptNumber: number) => {
       console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
       toast.success('Connection restored', { 
         duration: 2000,
         position: 'bottom-right' 
       });
    });
  }

  // SOS Alerts
  public onSOSAlert(callback: (data: SOSAlertPayload) => void) {
    this.socket?.on('sos_alert', callback);
  }

  public offSOSAlert(callback: (data: SOSAlertPayload) => void) {
    this.socket?.off('sos_alert', callback);
  }

  // Batch updates
  public onBatchUpdate(callback: (data: BatchUpdatePayload) => void) {
    this.socket?.on('batch_update', callback);
  }

  public offBatchUpdate(callback: (data: BatchUpdatePayload) => void) {
    this.socket?.off('batch_update', callback);
  }

  // QC updates
  public onQCUpdate(callback: (data: QCUpdatePayload) => void) {
    this.socket?.on('qc_update', callback);
  }

  public offQCUpdate(callback: (data: QCUpdatePayload) => void) {
    this.socket?.off('qc_update', callback);
  }

  // Stock alerts
  public onStockAlert(callback: (data: StockAlertPayload) => void) {
    this.socket?.on('stock_alert', callback);
  }

  public offStockAlert(callback: (data: StockAlertPayload) => void) {
    this.socket?.off('stock_alert', callback);
  }

  // Manager announcements
  public onAnnouncement(callback: (data: AnnouncementPayload) => void) {
    this.socket?.on('announcement', callback);
  }

  public offAnnouncement(callback: (data: AnnouncementPayload) => void) {
    this.socket?.off('announcement', callback);
  }

  // Emit events
  public emitSOSAlert(data: SOSAlertPayload) {
    this.socket?.emit('sos_alert', data);
  }

  public emitBatchUpdate(data: BatchUpdatePayload) {
    this.socket?.emit('batch_update', data);
  }

  // Disconnect
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Check connection status
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Update auth token
  public updateToken(token: string) {
    if (this.socket) {
      this.socket.auth = { token };
      this.socket.disconnect();
      this.socket.connect();
    }
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
