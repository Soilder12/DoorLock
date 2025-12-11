import React, { useState } from 'react';
import { MqttConfig } from '../types';

interface SettingsProps {
  config: MqttConfig;
  onSave: (config: MqttConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ config, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localConfig);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700/50 hover:border-blue-500/50"
      >
        <span className="p-0.5 rounded-full bg-slate-700 group-hover:bg-blue-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </span>
        ⚙️ 配置服务器 (Setup)
      </button>

      {isOpen && (
        <>
            {/* 遮罩层，防止点击外部失效 */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            
            {/* 悬浮设置面板 */}
            <div className="absolute top-full left-0 mt-2 w-80 p-5 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">
                            消息中转站地址 (MQTT Broker URL)
                        </label>
                        <input 
                            type="text" 
                            value={localConfig.brokerUrl}
                            onChange={(e) => setLocalConfig({...localConfig, brokerUrl: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-xs text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">
                            通信频道前缀 (Topic Base)
                        </label>
                        <input 
                            type="text" 
                            value={localConfig.baseTopic}
                            onChange={(e) => setLocalConfig({...localConfig, baseTopic: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-xs text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/50">
                        <button 
                            type="button" 
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                        >
                            取消
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            保存并重连
                        </button>
                    </div>
                </form>
            </div>
        </>
      )}
    </div>
  );
};

export default Settings;