import React from 'react';
import { LockState } from '../types';

interface LockVisualizerProps {
  state: LockState;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

const LockVisualizer: React.FC<LockVisualizerProps> = ({ state, isSimulating, onToggleSimulation }) => {
  const isLocked = state === LockState.LOCKED;
  const isPending = state === LockState.PENDING;

  // 动态样式：Locked = Red (Rose), Unlocked = Green (Emerald), Pending = Yellow
  // 如果未模拟（设备离线），则显示灰色
  const circleColor = !isSimulating
    ? 'border-slate-600 shadow-none'
    : isLocked 
      ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]' 
      : isPending 
        ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)]'
        : 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]';
      
  const iconColor = !isSimulating ? 'text-slate-600' : isLocked ? 'text-rose-400' : isPending ? 'text-yellow-400' : 'text-emerald-400';
  const statusText = !isSimulating ? '设备已离线' : isLocked ? '已上锁' : isPending ? '正在执行...' : '已解锁';

  return (
    <div className="flex flex-col items-center justify-between p-6 bg-slate-800 rounded-3xl border border-slate-700 relative overflow-hidden shadow-2xl h-full min-h-[300px]">
        {/* 背景电路装饰 */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* 顶部控制栏 */}
        <div className="w-full flex items-center justify-between z-10 mb-4 bg-slate-900/40 p-2 rounded-xl border border-slate-700/30 backdrop-blur-sm">
            <div className="flex flex-col ml-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulator Power</span>
                <span className={`text-xs font-bold ${isSimulating ? 'text-green-400' : 'text-slate-500'}`}>
                    {isSimulating ? '● 设备电源: ON' : '○ 设备电源: OFF'}
                </span>
            </div>
            
            <button
                onClick={onToggleSimulation}
                className={`
                    relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
                    ${isSimulating ? 'bg-green-600' : 'bg-slate-600'}
                `}
                title="开启/关闭 虚拟门锁设备"
            >
                <span className="sr-only">Toggle Simulation</span>
                <span
                    aria-hidden="true"
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out
                        ${isSimulating ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>

      <div className="relative group flex-1 flex items-center justify-center w-full">
        {/* 状态指示灯（脉冲动画 - 仅在在线且非上锁状态时跳动） */}
        <div className={`absolute rounded-full border-4 ${circleColor} transition-all duration-500 w-48 h-48 ${isSimulating && !isLocked ? 'animate-pulse-ring' : ''}`}></div>
        
        <div className={`relative z-10 w-48 h-48 rounded-full border-8 ${circleColor} bg-slate-900 flex items-center justify-center transition-all duration-500 shadow-inner ${isSimulating ? 'group-hover:scale-105' : 'opacity-80'}`}>
          <svg 
            className={`w-24 h-24 ${iconColor} transition-colors duration-500 ease-in-out`} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* 锁梁: 增加弹跳效果和精确的旋转中心 */}
            <path 
                d="M7 11V7a5 5 0 0 1 10 0v4" 
                style={{ transformOrigin: '17px 11px' }}
                className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
                    ${!isSimulating 
                        ? 'translate-y-0 rotate-0' // 离线时保持闭合
                        : (!isLocked ? '-translate-y-2 rotate-[-45deg]' : 'translate-y-0 rotate-0')
                    }`}
            />
            
            {/* 锁体 */}
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" className="transition-all duration-500" />
            
            {/* 锁孔: 增加旋转动画，模拟钥匙转动 */}
            <g 
                style={{ transformOrigin: '12px 16.5px' }}
                className={`transition-transform duration-700 ease-in-out 
                    ${!isSimulating 
                        ? 'rotate-0' 
                        : (!isLocked ? 'rotate-90' : 'rotate-0')
                    }`}
            >
                {/* 锁芯圆孔 */}
                <circle cx="12" cy="16.5" r="1.5" />
                {/* 锁孔下方竖槽 */}
                <path d="M12 18V19.5" strokeWidth="1.5" />
            </g>
          </svg>
        </div>
      </div>

      <div className="mt-4 text-center pb-2 w-full">
        <h2 className={`text-3xl font-bold tracking-widest ${iconColor} transition-colors duration-500`}>
            {statusText}
        </h2>
        <p className="text-slate-500 text-xs mt-2 uppercase tracking-wide">
            {isSimulating ? 'Device Status (设备状态)' : 'Device Offline (设备离线)'}
        </p>
      </div>
    </div>
  );
};

export default LockVisualizer;