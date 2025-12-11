export enum ConnectionStatus {
  DISCONNECTED = 'Disconnected',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  ERROR = 'Error',
}

export enum LockState {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  PENDING = 'PENDING',
  UNKNOWN = 'UNKNOWN',
}

export interface LogEntry {
  id: string;
  timestamp: string;
  topic: string;
  message: string;
  direction: 'IN' | 'OUT';
}

export interface MqttConfig {
  brokerUrl: string; // e.g., wss://broker.emqx.io:8084/mqtt
  baseTopic: string;
  clientId: string;
}

export const DEFAULT_CONFIG: MqttConfig = {
  brokerUrl: 'wss://broker.emqx.io:8084/mqtt',
  baseTopic: `demo/smartlock/${Math.floor(Math.random() * 10000)}`,
  clientId: `react-client-${Math.random().toString(16).substring(2, 8)}`,
};