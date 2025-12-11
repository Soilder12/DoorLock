import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
  onClear: () => void;
  className?: string; // 允许父组件传入样式
}

const LogViewer: React.FC<LogViewerProps> = ({ logs, onClear, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 使用 scrollTo 实现更平滑的滚动效果
    if (containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      // 只有当内容超过视口高度时才滚动
      if (scrollHeight > clientHeight) {
        containerRef.current.scrollTo({
            top: scrollHeight,
            behavior: 'smooth'
        });
      }
    }
  }, [logs]);

  // 辅助函数：根据消息内容决定颜色
  const getMessageColor = (msg: string) => {
    // 错误信息
    if (msg.includes('错误') || msg.includes('失败') || msg.includes('❌')) {
      return 'text-red-400';
    }
    
    // 开锁相关 (绿色) - 优先判断 Unlocked 避免被 Locked 匹配
    if (msg.includes('UNLOCKED') || msg.includes('UNLOCK') || msg.includes('开锁') || msg.includes('已解锁') || msg.includes('已开')) {
      return 'text-emerald-400';
    }
    
    // 关锁相关 (红色)
    if (msg.includes('LOCKED') || msg.includes('LOCK') || msg.includes('关锁') || msg.includes('已上锁') || msg.includes('已关')) {
      return 'text-rose-400';
    }
    
    // 默认颜色
    return 'text-slate-300';
  };

  return (
    <div className={`flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-sm shadow-inner relative group ${className}`}>
      {/* 装饰性标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">通信日志 (Data Stream)</span>
        </div>
        <button 
            onClick={onClear}
            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded border border-slate-700 transition-colors"
        >
            清空日志
        </button>
      </div>
      
      {/* 日志内容区域：自动伸缩，内部滚动 */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-slate-950/80"
      >
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-2">
            <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs italic">等待数据传输...</span>
          </div>
        )}
        
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 items-start text-xs font-medium hover:bg-white/5 p-1 rounded transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-slate-600 shrink-0 select-none min-w-[50px] text-right">{log.timestamp}</span>
            
            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] border w-10 text-center select-none ${
                log.direction === 'OUT' 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            }`}>
                {log.direction === 'OUT' ? '发送' : '接收'}
            </span>
            
            <div className="flex-1 break-all flex flex-col sm:flex-row sm:gap-2">
                <span className="text-slate-500 select-all">频道: {log.topic}</span>
                <span className="hidden sm:inline text-slate-700">|</span>
                <span className={`font-bold select-all ${getMessageColor(log.message)}`}>
                    {log.message}
                </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* 底部渐变遮罩 */}
      {logs.length > 5 && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
      )}
    </div>
  );
};

export default LogViewer;