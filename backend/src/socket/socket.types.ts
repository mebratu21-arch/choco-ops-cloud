export interface SOSAlertPayload {
  machindId: string;
  reason: string;
  [key: string]: unknown;
}

export interface BatchUpdatePayload {
  batchId: string;
  status: string;
  [key: string]: unknown;
}

export interface QCUpdatePayload {
  checkId: string;
  status: 'passed' | 'failed';
  [key: string]: unknown;
}

export interface StockAlertPayload {
  itemId: string;
  quantity: number;
  [key: string]: unknown;
}

export interface AnnouncementPayload {
  message: string;
  priority: 'low' | 'medium' | 'high';
  [key: string]: unknown;
}

export interface ServerToClientEvents {
  sos_alert: (data: SOSAlertPayload) => void;
  batch_update: (data: BatchUpdatePayload) => void;
  qc_update: (data: QCUpdatePayload) => void;
  stock_alert: (data: StockAlertPayload) => void;
  announcement: (data: AnnouncementPayload) => void;
}

export interface ClientToServerEvents {
  sos_alert: (data: SOSAlertPayload) => void;
  batch_update: (data: BatchUpdatePayload) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: {
    id: string;
    role: string;
    name: string;
  };
}
