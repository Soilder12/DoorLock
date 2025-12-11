import mqtt, { MqttClient } from 'mqtt';
import { ConnectionStatus, LogEntry } from '../types';

// 定义简化的接口供 React 组件使用
export class MqttService {
  private client: MqttClient | null = null;
  private onStatusChange: (status: ConnectionStatus) => void;
  private onMessageArrived: (topic: string, message: string) => void;
  private onLog: (entry: LogEntry) => void;

  constructor(
    onStatusChange: (status: ConnectionStatus) => void,
    onMessageArrived: (topic: string, message: string) => void,
    onLog: (entry: LogEntry) => void
  ) {
    this.onStatusChange = onStatusChange;
    this.onMessageArrived = onMessageArrived;
    this.onLog = onLog;
  }

  public connect(brokerUrl: string, clientId: string, topicsToSubscribe: string[]) {
    if (this.client) {
      this.client.end();
    }

    this.onStatusChange(ConnectionStatus.CONNECTING);
    this.addLog('系统', `正在呼叫中转站 (Broker)...`, 'OUT');

    try {
      this.client = mqtt.connect(brokerUrl, {
        clientId,
        keepalive: 60,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
      });

      this.client.on('connect', () => {
        this.onStatusChange(ConnectionStatus.CONNECTED);
        this.addLog('系统', '✅ 成功连接到中转站！', 'IN');
        
        // 订阅主题
        if (this.client && topicsToSubscribe.length > 0) {
            this.client.subscribe(topicsToSubscribe, (err) => {
                if (!err) {
                    this.addLog('系统', `📡 已订阅频道: ${topicsToSubscribe.join(', ')}`, 'OUT');
                } else {
                    this.addLog('错误', `关注频道失败: ${err.message}`, 'IN');
                }
            });
        }
      });

      this.client.on('message', (topic, message) => {
        const msgStr = message.toString();
        
        // 转换日志消息，使其更易懂
        let displayMsg = msgStr;
        if (msgStr === 'LOCK') displayMsg = '📥 收到指令: 🔴 关锁 (LOCK)';
        else if (msgStr === 'UNLOCK') displayMsg = '📥 收到指令: 🟢 开锁 (UNLOCK)';
        else if (msgStr === 'LOCKED') displayMsg = '🔔 状态更新: 🔴 门已关 (LOCKED)';
        else if (msgStr === 'UNLOCKED') displayMsg = '🔔 状态更新: 🟢 门已开 (UNLOCKED)';

        this.addLog(topic, displayMsg, 'IN');
        this.onMessageArrived(topic, msgStr);
      });

      this.client.on('error', (err) => {
        console.error('MQTT Error:', err);
        this.onStatusChange(ConnectionStatus.ERROR);
        this.addLog('错误', `❌ 连接出错: ${err.message}`, 'IN');
        this.client?.end();
      });

      this.client.on('close', () => {
        this.onStatusChange(ConnectionStatus.DISCONNECTED);
        this.addLog('系统', '🔌 连接已断开', 'IN');
      });

    } catch (error) {
      this.onStatusChange(ConnectionStatus.ERROR);
      this.addLog('错误', error instanceof Error ? error.message : '未知错误', 'IN');
    }
  }

  public publish(topic: string, message: string) {
    if (this.client && this.client.connected) {
      this.client.publish(topic, message, { qos: 0, retain: false }, (err) => {
        if (err) {
            this.addLog('错误', `❌ 发送失败: ${err.message}`, 'IN');
        } else {
            // 转换日志消息，使其更易懂
            let displayMsg = message;
            if (message === 'LOCK') displayMsg = '📤 发送指令: 🔴 关锁 (LOCK)';
            else if (message === 'UNLOCK') displayMsg = '📤 发送指令: 🟢 开锁 (UNLOCK)';
            else if (message === 'LOCKED') displayMsg = '📢 上报状态: 🔴 已关锁 (LOCKED)';
            else if (message === 'UNLOCKED') displayMsg = '📢 上报状态: 🟢 已开锁 (UNLOCKED)';

            this.addLog(topic, displayMsg, 'OUT');
        }
      });
    } else {
        this.addLog('错误', '❌ 发送失败: 未连接到服务器', 'OUT');
    }
  }

  public disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }

  private addLog(topic: string, message: string, direction: 'IN' | 'OUT') {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      topic,
      message,
      direction
    };
    this.onLog(entry);
  }
}