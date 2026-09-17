import React from 'react';
import { Volume2, Sparkles, Cpu, Info, History } from 'lucide-react';
import { VoiceEngine } from '../types';

interface HeaderProps {
  engine: VoiceEngine;
  setEngine: (engine: VoiceEngine) => void;
  hasApiKey: boolean;
  historyCount: number;
  onToggleHistory: () => void;
  isHistoryOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  engine,
  setEngine,
  hasApiKey,
  historyCount,
  onToggleHistory,
  isHistoryOpen,
}) => {
  return (
    <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                Text to Speech
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                Voice Studio
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Expressive speech synthesis with customizable vocal styles
            </p>
          </div>
        </div>

        {/* Engine switcher & History toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Engine Selector Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              id="btn-engine-neural"
              onClick={() => setEngine('neural')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                engine === 'neural'
                  ? 'bg-white text-indigo-700 shadow-xs shadow-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Neural Voice</span>
              {!hasApiKey && (
                <span
                  title="Gemini API Key is optional; system falls back smoothly or uses local engine"
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5"
                />
              )}
            </button>

            <button
              type="button"
              id="btn-engine-browser"
              onClick={() => setEngine('browser')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                engine === 'browser'
                  ? 'bg-white text-slate-900 shadow-xs shadow-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-slate-600" />
              <span>Device System</span>
            </button>
          </div>

          {/* History drawer button */}
          <button
            type="button"
            id="btn-toggle-history"
            onClick={onToggleHistory}
            className={`relative p-2 rounded-xl border transition-colors ${
              isHistoryOpen
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
            title="Saved & Recent Clips"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
