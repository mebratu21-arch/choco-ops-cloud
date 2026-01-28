import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor() {
    this.connect();
  }

  private connect() {
    const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5001';

    this.socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

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

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
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
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
      toast.success('Connection restored', { 
        duration: 2000,
        position: 'bottom-right' 
      });
    });
  }

  // SOS Alerts
  public onSOSAlert(callback: (data: any) => void) {
    this.socket?.on('sos_alert', callback);
  }

  public offSOSAlert(callback: (data: any) => void) {
    this.socket?.off('sos_alert', callback);
  }

  // Batch updates
  public onBatchUpdate(callback: (data: any) => void) {
    this.socket?.on('batch_update', callback);
  }

  public offBatchUpdate(callback: (data: any) => void) {
    this.socket?.off('batch_update', callback);
  }

  // QC updates
  public onQCUpdate(callback: (data: any) => void) {
    this.socket?.on('qc_update', callback);
  }

  public offQCUpdate(callback: (data: any) => void) {
    this.socket?.off('qc_update', callback);
  }

  // Stock alerts
  public onStockAlert(callback: (data: any) => void) {
    this.socket?.on('stock_alert', callback);
  }

  public offStockAlert(callback: (data: any) => void) {
    this.socket?.off('stock_alert', callback);
  }

  // Manager announcements
  public onAnnouncement(callback: (data: any) => void) {
    this.socket?.on('announcement', callback);
  }

  public offAnnouncement(callback: (data: any) => void) {
    this.socket?.off('announcement', callback);
  }

  // Emit events
  public emitSOSAlert(data: any) {
    this.socket?.emit('sos_alert', data);
  }

  public emitBatchUpdate(data: any) {
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
    return this.socket?.connected || false;
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
