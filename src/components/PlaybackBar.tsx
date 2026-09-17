import React from 'react';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Download,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { VoiceEngine } from '../types';

interface PlaybackBarProps {
  engine: VoiceEngine;
  isPlaying: boolean;
  isPaused: boolean;
  isSynthesizing: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReplay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  audioElement: HTMLAudioElement | null;
  speed: number;
  onSpeedChange: (speed: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentAudioUrl: string | null;
  onDownloadAudio: () => void;
  activeVoiceName: string;
  activeStyleName: string;
  hasText: boolean;
}

export const PlaybackBar: React.FC<PlaybackBarProps> = ({
  engine,
  isPlaying,
  isPaused,
  isSynthesizing,
  onPlay,
  onPause,
  onResume,
  onStop,
  onReplay,
  currentTime,
  duration,
  onSeek,
  audioElement,
  speed,
  onSpeedChange,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  currentAudioUrl,
  onDownloadAudio,
  activeVoiceName,
  activeStyleName,
  hasText,
}) => {
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
        {/* Left: Play / Speak Primary Button & Controls */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-center lg:justify-start">
          {/* Main Action Button */}
          {isSynthesizing ? (
            <button
              type="button"
              disabled
              id="btn-speak-loading"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-medium shadow-md shadow-indigo-200 text-sm cursor-wait min-w-[150px]"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing...</span>
            </button>
          ) : isPlaying ? (
            isPaused ? (
              <button
                type="button"
                id="btn-speak-resume"
                onClick={onResume}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-200 text-sm transition min-w-[150px]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-speak-pause"
                onClick={onPause}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-md shadow-amber-200 text-sm transition min-w-[150px]"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </button>
            )
          ) : (
            <button
              type="button"
              id="btn-speak-main"
              onClick={onPlay}
              disabled={!hasText}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm transition min-w-[150px] ${
                hasText
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 cursor-pointer active:scale-98'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Speak Aloud</span>
            </button>
          )}

          {/* Secondary Stop & Replay buttons */}
          {(isPlaying || isPaused) && (
            <button
              type="button"
              id="btn-stop-audio"
              onClick={onStop}
              className="p-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
              title="Stop Speech"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          )}

          {currentAudioUrl && !isPlaying && (
            <button
              type="button"
              id="btn-replay-audio"
              onClick={onReplay}
              className="p-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
              title="Replay Last Clip"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Active Voice info pill */}
          <div className="hidden sm:flex flex-col text-left pl-2">
            <span className="text-xs font-semibold text-slate-900 leading-none">
              {activeVoiceName}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {activeStyleName}
            </span>
          </div>
        </div>

        {/* Center: Audio Waveform Visualizer & Timeline */}
        <div className="w-full max-w-md flex flex-col items-center justify-center">
          <AudioVisualizer
            isPlaying={isPlaying}
            isPaused={isPaused}
            audioElement={audioElement}
            accentColor="#6366f1"
            height={38}
          />

          {/* Scrubber progress bar for audio clips */}
          {duration > 0 && (
            <div className="w-full flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-slate-500 w-8 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[10px] font-mono text-slate-500 w-8">
                {formatTime(duration)}
              </span>
            </div>
          )}
        </div>

        {/* Right: Playback Speed, Volume & Download */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-center lg:justify-end">
          {/* Speed Presets */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            {speeds.map((s) => (
              <button
                type="button"
                key={s}
                id={`btn-speed-${s}`}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-1 text-xs rounded-lg font-medium transition ${
                  speed === s
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Download Audio Button */}
          {currentAudioUrl && (
            <button
              type="button"
              id="btn-download-audio"
              onClick={onDownloadAudio}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 text-xs font-medium transition"
              title="Download Spoken Audio (.wav)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
