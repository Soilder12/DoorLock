import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus, LockState, LogEntry, MqttConfig, DEFAULT_CONFIG } from './types';
import { MqttService } from './services/mqttService';
import LockVisualizer from './components/LockVisualizer';
import ControlPanel from './components/ControlPanel';
import LogViewer from './components/LogViewer';

// 悬浮教学提示组件
const TeachingTip = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-4 shadow-lg shadow-indigo-500/30 transition-all hover:scale-110 animate-bounce-slow"
        title="打开原理小课堂"
      >
        <span className="text-2xl">💡</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-900/50 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900/50 p-3 flex items-center justify-between border-b border-indigo-500/20">
        <h4 className="flex items-center gap-2 text-indigo-300 text-sm font-bold uppercase">
          <span className="bg-indigo-500/20 p-1 rounded text-xs">💡</span> 原理小课堂
        </h4>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 relative">
         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        </div>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed relative z-10">
            <p>MQTT 就像<strong>班级群聊</strong>：</p>
            <ul className="space-y-2 list-none pl-1">
                <li className="flex gap-2 items-start">
                    <span className="text-blue-400 font-bold shrink-0 bg-blue-400/10 px-1.5 rounded mt-0.5">1</span>
                    <span>你点击按钮发消息 <br/><span className="text-slate-500">(Publish 发布指令)</span></span>
                </li>
                <li className="flex gap-2 items-start">
                    <span className="text-purple-400 font-bold shrink-0 bg-purple-400/10 px-1.5 rounded mt-0.5">2</span>
                    <span>门锁收到消息后动作 <br/><span className="text-slate-500">(Subscribe 订阅指令)</span></span>
                </li>
                <li className="flex gap-2 items-start">
                    <span className="text-emerald-400 font-bold shrink-0 bg-emerald-400/10 px-1.5 rounded mt-0.5">3</span>
                    <span>门锁回复“已执行” <br/><span className="text-slate-500">(Publish 状态更新)</span></span>
                </li>
            </ul>
            <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-slate-500 italic">
               观察下方的通信日志，看看数据是怎么流动的！
            </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Application State
  const [config, setConfig] = useState<MqttConfig>(DEFAULT_CONFIG);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [lockState, setLockState] = useState<LockState>(LockState.UNKNOWN);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Teaching Feature: Device Simulation
  // 默认关闭状态
  const [isSimulatingDevice, setIsSimulatingDevice] = useState<boolean>(false);

  // Refs to access latest state in callbacks
  const mqttServiceRef = useRef<MqttService | null>(null);
  const isSimulatingRef = useRef(isSimulatingDevice);
  
  useEffect(() => {
    isSimulatingRef.current = isSimulatingDevice;
  }, [isSimulatingDevice]);

  // Handler for incoming messages
  const handleMessage = useCallback((topic: string, message: string) => {
    const cmdTopic = `${config.baseTopic}/cmd`;
    const statusTopic = `${config.baseTopic}/status`;

    // 1. 手机端逻辑：始终监听状态更新
    if (topic === statusTopic) {
      if (message === 'LOCKED') setLockState(LockState.LOCKED);
      else if (message === 'UNLOCKED') setLockState(LockState.UNLOCKED);
      else setLockState(LockState.UNKNOWN);
    }

    // 2. 虚拟门锁逻辑：监听命令
    // 只有当 设备电源开启 (isSimulating) 时才处理命令
    if (isSimulatingRef.current && topic === cmdTopic) {
      setTimeout(() => {
        const response = message === 'LOCK' ? 'LOCKED' : message === 'UNLOCK' ? 'UNLOCKED' : null;
        if (response && mqttServiceRef.current) {
          mqttServiceRef.current.publish(statusTopic, response);
        }
      }, 800);
    }
  }, [config.baseTopic]);

  // Initialize MQTT Service
  useEffect(() => {
    const updateStatus = (status: ConnectionStatus) => setConnectionStatus(status);
    const addLog = (entry: LogEntry) => setLogs(prev => [...prev.slice(-49), entry]);

    mqttServiceRef.current = new MqttService(
      updateStatus,
      (topic, msg) => handleMessage(topic, msg),
      addLog
    );

    // 基础主题：监听状态（手机端功能）
    const topics = [`${config.baseTopic}/status`];
    
    // 只有当“设备电源”开启时，才订阅命令主题，模拟设备上线
    if (isSimulatingDevice) {
        topics.push(`${config.baseTopic}/cmd`);
    }

    mqttServiceRef.current.connect(config.brokerUrl, config.clientId, topics);

    return () => {
      mqttServiceRef.current?.disconnect();
    };
  }, [config, isSimulatingDevice, handleMessage]);

  // 处理电源开关切换
  const handleTogglePower = () => {
    const newState = !isSimulatingDevice;
    setIsSimulatingDevice(newState);
    
    if (newState) {
      // 电源开启，默认状态设为已上锁
      setLockState(LockState.LOCKED);
      setLogs(prev => [...prev.slice(-49), {
         id: Math.random().toString(36).substring(7),
         timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
         topic: '本地模拟',
         message: '🔌 设备已启动 (初始状态: 🔴 已上锁)',
         direction: 'IN'
      }]);
    } else {
      // 电源关闭，状态未知
      setLockState(LockState.UNKNOWN);
      setLogs(prev => [...prev.slice(-49), {
         id: Math.random().toString(36).substring(7),
         timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
         topic: '本地模拟',
         message: '🔌 设备已关机',
         direction: 'IN'
      }]);
    }
  };

  const handleCommand = (cmd: 'LOCK' | 'UNLOCK') => {
    if (!mqttServiceRef.current) return;
    setLockState(LockState.PENDING);
    mqttServiceRef.current.publish(`${config.baseTopic}/cmd`, cmd);
    
    // 超时检测
    setTimeout(() => {
        setLockState(currentState => {
            if (currentState === LockState.PENDING) {
                 setLogs(prev => [...prev.slice(-49), {
                    id: Math.random().toString(36).substring(7),
                    timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
                    topic: '系统',
                    message: '⚠️ 警告: 等待设备响应超时 (设备可能未开启)',
                    direction: 'IN'
                 }]);
                 return LockState.UNKNOWN; // 超时后重置为未知
            }
            return currentState;
        });
    }, 3000);
  };

  const handleClearLogs = () => setLogs([]);

  const getStatusText = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED: return '已连接到云端';
      case ConnectionStatus.CONNECTING: return '正在连接...';
      case ConnectionStatus.DISCONNECTED: return '离线';
      case ConnectionStatus.ERROR: return '连接错误';
      default: return status;
    }
  };

  return (
    // 使用 h-screen 锁定整个页面高度，防止页面级滚动
    <div className="h-screen w-full bg-slate-950 text-slate-100 font-sans flex flex-col overflow-hidden">
      
      {/* Header: 固定高度 */}
      <header className="shrink-0 pt-4 pb-2 relative z-40 flex justify-center">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full px-6 py-2 flex items-center gap-6 shadow-xl shadow-blue-900/10">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                </div>
                <h1 className="text-lg font-bold tracking-tight animate-text-shine whitespace-nowrap">
                智能门锁 IoT 教学演示
                </h1>
            </div>
            
            <div className="hidden sm:block w-px h-6 bg-slate-700/50"></div>
            
            <div className="flex items-center gap-2">
                <div className={`relative w-2 h-2 rounded-full ${
                    connectionStatus === ConnectionStatus.CONNECTED ? 'bg-emerald-400' : 
                    connectionStatus === ConnectionStatus.CONNECTING ? 'bg-yellow-400' : 'bg-red-500'
                }`}>
                    {connectionStatus === ConnectionStatus.CONNECTED && (
                        <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
                    )}
                </div>
                <span className={`text-xs font-bold whitespace-nowrap ${
                    connectionStatus === ConnectionStatus.CONNECTED ? 'text-emerald-400' : 
                    connectionStatus === ConnectionStatus.CONNECTING ? 'text-yellow-400' : 'text-red-400'
                }`}>
                    {getStatusText(connectionStatus)}
                </span>
            </div>
        </div>
      </header>

      {/* Main Content: 垂直布局 */}
      <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto p-4 flex flex-col gap-4">
          
          {/* Top Section: Dashboard (左右布局) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
            
            {/* Left: 门锁视觉 */}
            <div className="flex flex-col gap-4 h-full">
                <div className="flex justify-between items-center px-1">
                     <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Device View (设备视图)</span>
                </div>
                <div className="flex-1">
                    <LockVisualizer 
                        state={lockState} 
                        isSimulating={isSimulatingDevice}
                        onToggleSimulation={handleTogglePower}
                    />
                </div>
            </div>

            {/* Right: 控制面板 */}
            <div className="flex flex-col gap-4 h-full">
                 <div className="flex justify-start items-center px-1">
                     <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Control Center (控制中心)</span>
                </div>
                <div className="flex-1">
                    <ControlPanel 
                        connectionStatus={connectionStatus} 
                        lockState={lockState} 
                        onCommand={handleCommand}
                    />
                </div>
            </div>
          </div>

          {/* Bottom Section: 日志 (填满剩余高度) */}
          <div className="flex-1 min-h-0 flex flex-col relative">
            <LogViewer logs={logs} onClear={handleClearLogs} className="h-full shadow-2xl" />
          </div>

      </main>

      {/* 悬浮教学提示 */}
      <TeachingTip />
    </div>
  );
};

export default App;