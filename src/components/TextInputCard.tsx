import React from 'react';
import { AlignLeft, Trash2, Clipboard, Sparkles, Clock } from 'lucide-react';
import { SAMPLE_SNIPPETS } from '../data/voices';
import { NeuralVoiceId, VoiceStyleId, SampleSnippet } from '../types';

interface TextInputCardProps {
  text: string;
  onChangeText: (text: string) => void;
  onSelectSnippet: (snippet: SampleSnippet) => void;
  isSynthesizing: boolean;
}

export const TextInputCard: React.FC<TextInputCardProps> = ({
  text,
  onChangeText,
  onSelectSnippet,
  isSynthesizing,
}) => {
  const charCount = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  // Estimated reading time at ~140 wpm
  const estimatedSeconds = Math.max(1, Math.round((words / 140) * 60));

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChangeText(clipText);
      }
    } catch {
      // Clipboard access denied or unsupported in iframe
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-900">Type or Paste Text</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-paste-text"
            onClick={handlePaste}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Paste</span>
          </button>

          {text && (
            <button
              type="button"
              id="btn-clear-text"
              onClick={() => onChangeText('')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative flex-1 min-h-[140px]">
        <textarea
          id="tts-input-textarea"
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Enter the words, sentences, or story you want to hear spoken aloud..."
          disabled={isSynthesizing}
          className="w-full h-full min-h-[140px] p-3.5 text-sm text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl resize-none focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400 leading-relaxed transition"
        />
      </div>

      {/* Character / Word count footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span>
            <strong className="font-semibold text-slate-700">{words}</strong> word{words !== 1 ? 's' : ''}
          </span>
          <span>•</span>
          <span>
            <strong className="font-semibold text-slate-700">{charCount}</strong> characters
          </span>
        </div>

        {words > 0 && (
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3" />
            <span>~{estimatedSeconds}s read</span>
          </div>
        )}
      </div>

      {/* Sample presets chips */}
      <div className="pt-3">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Quick Inspiration Presets:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_SNIPPETS.map((snippet) => (
            <button
              type="button"
              key={snippet.id}
              id={`sample-chip-${snippet.id}`}
              onClick={() => onSelectSnippet(snippet)}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg transition-colors border border-slate-200/60"
            >
              {snippet.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
