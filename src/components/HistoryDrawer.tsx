import React from 'react';
import { SpokenClip } from '../types';
import {
  History,
  X,
  Play,
  RotateCcw,
  Download,
  Trash2,
  Volume2,
  Clock,
  Sparkles,
  Cpu,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clips: SpokenClip[];
  onPlayClip: (clip: SpokenClip) => void;
  onLoadIntoInput: (text: string) => void;
  onDeleteClip: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  clips,
  onPlayClip,
  onLoadIntoInput,
  onDeleteClip,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">Recent Spoken Clips</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {clips.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {clips.length > 0 && (
              <button
                type="button"
                id="btn-clear-history"
                onClick={onClearAll}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded-md hover:bg-rose-50 transition"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              id="btn-close-history"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clips List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {clips.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Volume2 className="w-8 h-8 stroke-1 mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">No clips recorded yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Type text and click &ldquo;Speak Aloud&rdquo; to hear it and save clips to your session history.
              </p>
            </div>
          ) : (
            clips.map((clip) => {
              const dateStr = new Date(clip.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={clip.id}
                  id={`history-clip-${clip.id}`}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex flex-col gap-2.5"
                >
                  {/* Top metadata */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700">
                        {clip.engine === 'neural' ? (
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                        ) : (
                          <Cpu className="w-3 h-3 text-slate-500" />
                        )}
                        {clip.voiceName}
                      </span>
                      {clip.accent && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {clip.accent}
                        </span>
                      )}
                      {clip.age && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                          {clip.age}
                        </span>
                      )}
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                        {clip.styleName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* Text snippet */}
                  <p className="text-xs text-slate-800 leading-relaxed line-clamp-3">
                    &ldquo;{clip.text}&rdquo;
                  </p>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPlayClip(clip)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Replay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onLoadIntoInput(clip.text);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                        title="Load text into editor"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {clip.audioUrl && (
                        <a
                          href={clip.audioUrl}
                          download={`speech-${clip.voiceName}-${Date.now()}.wav`}
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-md transition"
                          title="Download audio clip (.wav)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteClip(clip.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"
                      title="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
