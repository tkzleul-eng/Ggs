import React from 'react';
import { VoiceStyleId } from '../types';
import { VOICE_STYLES } from '../data/voices';
import {
  MessageSquare,
  BookOpen,
  Zap,
  Sparkles,
  Film,
  Award,
  Smile,
  Eye,
  Wand2,
} from 'lucide-react';

interface StyleSelectorProps {
  selectedStyleId: VoiceStyleId;
  onSelectStyle: (styleId: VoiceStyleId) => void;
  isNeural: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  MessageSquare,
  BookOpen,
  Zap,
  Sparkles,
  Film,
  Award,
  Smile,
  Eye,
};

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyleId,
  onSelectStyle,
  isNeural,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-violet-600" />
          <h2 className="text-sm font-semibold text-slate-900">Voice Delivery & Emotional Style</h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {VOICE_STYLES.length} styles available
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        {isNeural
          ? 'Guides vocal inflection, pace, emotional color, and acoustic presence.'
          : 'Applies tailored pitch and tempo presets to your browser speech synthesizer.'}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {VOICE_STYLES.map((style) => {
          const isSelected = selectedStyleId === style.id;
          const Icon = ICON_MAP[style.icon] || MessageSquare;

          return (
            <button
              type="button"
              key={style.id}
              id={`style-btn-${style.id}`}
              onClick={() => onSelectStyle(style.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/10 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-900 leading-tight mb-0.5">
                  {style.name}
                </h3>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
                  {style.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
