import React, { useState, useEffect } from 'react';
import { ConnectionStatus, LockState } from '../types';

interface ControlPanelProps {
  connectionStatus: ConnectionStatus;
  lockState: LockState;
  onCommand: (cmd: 'LOCK' | 'UNLOCK') => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  connectionStatus, 
  lockState, 
  onCommand
}) => {
  const isConnected = connectionStatus === ConnectionStatus.CONNECTED;
  const isPending = lockState === LockState.PENDING;

  // 追踪当前正在操作的指令，以便只在对应的按钮上显示 Loading
  const [activeCmd, setActiveCmd] = useState<'LOCK' | 'UNLOCK' | null>(null);
  // 追踪刚刚完成的指令，用于显示短暂的 Success 状态
  const [successCmd, setSuccessCmd] = useState<'LOCK' | 'UNLOCK' | null>(null);

  // 监听 lockState 变化，当从 PENDING 结束时，触发成功动画
  useEffect(() => {
    if (!isPending && activeCmd) {
      // 指令结束（可能是成功或超时），显示成功反馈
      setSuccessCmd(activeCmd);
      setActiveCmd(null);

      // 1.5秒后清除成功状态
      const timer = setTimeout(() => {
        setSuccessCmd(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPending, activeCmd]);

  const handleBtnClick = (cmd: 'LOCK' | 'UNLOCK') => {
    setActiveCmd(cmd);
    onCommand(cmd);
  };

  // 按钮是否禁用：未连接、正在发送中（全局）
  const isGlobalDisabled = !isConnected || isPending;

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4 h-full flex flex-col relative overflow-hidden justify-center">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
         <svg className="w-32 h-32 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M12 12h.01M12 6h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
      </div>

      {/* APP 遥控区 */}
      <div className="space-y-4 flex flex-col justify-center relative z-10 w-full max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-2 justify-center">
              <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="text-slate-200 text-xs font-bold tracking-wider uppercase">
                Remote App (手机遥控)
              </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* 开锁按钮 - 绿色 (Emerald) */}
            <button
              onClick={() => handleBtnClick('UNLOCK')}
              disabled={isGlobalDisabled}
              className={`
                relative group flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl transition-all duration-300 border-2 min-h-[140px]
                ${isGlobalDisabled
                    ? 'bg-slate-800/50 border-slate-700 text-slate-600 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(52,211,153,0.3)] hover:-translate-y-1 active:translate-y-0 active:scale-95'
                }
              `}
            >
              {successCmd === 'UNLOCK' ? (
                 // 成功状态
                 <>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-emerald-500 text-white animate-in zoom-in duration-300">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg text-emerald-400 animate-pulse">指令已达</span>
                 </>
              ) : activeCmd === 'UNLOCK' && isPending ? (
                  // 加载状态
                  <>
                    <div className="w-16 h-16 flex items-center justify-center mb-3">
                        <svg className="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <span className="font-bold text-lg text-emerald-500">发送中...</span>
                  </>
              ) : (
                // 默认状态
                <>
                    <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors duration-300
                        ${isConnected ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-slate-700 text-slate-500'}
                    `}>
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className={`font-bold text-lg ${isConnected ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-slate-600'}`}>
                        远程开锁
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Unlock</span>
                </>
              )}
            </button>

            {/* 关锁按钮 - 红色 (Rose) */}
            <button
              onClick={() => handleBtnClick('LOCK')}
              disabled={isGlobalDisabled}
              className={`
                relative group flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl transition-all duration-300 border-2 min-h-[140px]
                ${isGlobalDisabled
                    ? 'bg-slate-800/50 border-slate-700 text-slate-600 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 hover:border-rose-400 hover:shadow-[0_0_25px_rgba(251,113,133,0.3)] hover:-translate-y-1 active:translate-y-0 active:scale-95'
                }
              `}
            >
              {successCmd === 'LOCK' ? (
                 // 成功状态
                 <>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-rose-500 text-white animate-in zoom-in duration-300">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg text-rose-400 animate-pulse">指令已达</span>
                 </>
              ) : activeCmd === 'LOCK' && isPending ? (
                  // 加载状态
                  <>
                    <div className="w-16 h-16 flex items-center justify-center mb-3">
                        <svg className="animate-spin h-8 w-8 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <span className="font-bold text-lg text-rose-500">发送中...</span>
                  </>
              ) : (
                // 默认状态
                <>
                    <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors duration-300
                        ${isConnected ? 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white' : 'bg-slate-700 text-slate-500'}
                    `}>
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <span className={`font-bold text-lg ${isConnected ? 'text-rose-400 group-hover:text-rose-300' : 'text-slate-600'}`}>
                        远程关锁
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Lock</span>
                </>
              )}
            </button>
          </div>
      </div>

      <div className="p-3 bg-slate-900/50 rounded-lg text-xs text-slate-400 text-center border border-slate-800 relative z-10">
        {isConnected 
          ? '✅ 信号正常：点击按钮发送无线指令' 
          : '⚠️ 信号中断：无法发送指令'}
      </div>
    </div>
  );
};

export default ControlPanel;