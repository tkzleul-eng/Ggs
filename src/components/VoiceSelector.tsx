import React, { useState, useMemo } from 'react';
import {
  VoiceProfile,
  VoiceAccent,
  VoiceAge,
  VoiceGender,
  VoiceEngine,
} from '../types';
import { VOICE_PROFILES } from '../data/voices';
import {
  Volume2,
  Sliders,
  Sparkles,
  Search,
  Check,
  Globe2,
  Users,
  UserCheck,
  Play,
  RotateCcw,
} from 'lucide-react';

interface VoiceSelectorProps {
  engine: VoiceEngine;
  selectedProfileId: string;
  onSelectProfile: (profile: VoiceProfile) => void;
  // Browser Speech properties
  browserVoices: SpeechSynthesisVoice[];
  selectedBrowserVoiceUri: string;
  onSelectBrowserVoiceUri: (uri: string) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  rate: number;
  onRateChange: (rate: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onPreviewVoiceSample: (profile: VoiceProfile) => void;
  previewingProfileId: string | null;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  engine,
  selectedProfileId,
  onSelectProfile,
  browserVoices,
  selectedBrowserVoiceUri,
  onSelectBrowserVoiceUri,
  pitch,
  onPitchChange,
  rate,
  onRateChange,
  volume,
  onVolumeChange,
  onPreviewVoiceSample,
  previewingProfileId,
}) => {
  // Filter States
  const [accentFilter, setAccentFilter] = useState<string>('All');
  const [ageFilter, setAgeFilter] = useState<string>('All');
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Accents list
  const accents: string[] = [
    'All',
    'American',
    'British',
    'Australian',
    'Irish',
    'Scottish',
    'Indian',
    'Canadian',
  ];
  const ages: string[] = ['All', 'Child', 'Young Adult', 'Adult', 'Elder'];
  const genders: string[] = ['All', 'Female', 'Male', 'Neutral'];

  // Filtered voice profiles
  const filteredProfiles = useMemo(() => {
    return VOICE_PROFILES.filter((profile) => {
      if (accentFilter !== 'All' && profile.accent !== accentFilter) return false;
      if (ageFilter !== 'All' && profile.age !== ageFilter) return false;
      if (genderFilter !== 'All' && profile.gender !== genderFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = profile.name.toLowerCase().includes(q);
        const matchesAccent = profile.accent.toLowerCase().includes(q);
        const matchesAge = profile.age.toLowerCase().includes(q);
        const matchesGender = profile.gender.toLowerCase().includes(q);
        const matchesTagline = profile.tagline.toLowerCase().includes(q);
        const matchesDesc = profile.description.toLowerCase().includes(q);
        return (
          matchesName ||
          matchesAccent ||
          matchesAge ||
          matchesGender ||
          matchesTagline ||
          matchesDesc
        );
      }

      return true;
    });
  }, [accentFilter, ageFilter, genderFilter, searchQuery]);

  const selectedProfile =
    VOICE_PROFILES.find((p) => p.id === selectedProfileId) || VOICE_PROFILES[0];

  const getAgeBadgeColor = (age: VoiceAge) => {
    switch (age) {
      case 'Child':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Young Adult':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Adult':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Elder':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getGenderBadgeColor = (gender: VoiceGender) => {
    switch (gender) {
      case 'Female':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Male':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Neutral':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header with count and search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Select Voice Persona ({VOICE_PROFILES.length} Voices)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Differentiated by accent, age stage, and gender identity
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search voice, accent, age..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Filter Tabs / Pills */}
      <div className="space-y-2">
        {/* Accent Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Globe2 className="w-3 h-3" /> Accent:
          </span>
          {accents.map((accent) => (
            <button
              type="button"
              key={accent}
              onClick={() => setAccentFilter(accent)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
                accentFilter === accent
                  ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {accent === 'American' && '🇺🇸 '}
              {accent === 'British' && '🇬🇧 '}
              {accent === 'Australian' && '🇦🇺 '}
              {accent === 'Irish' && '🇮🇪 '}
              {accent === 'Scottish' && '🏴󠁧󠁢󠁳󠁣󠁴󠁿 '}
              {accent === 'Indian' && '🇮🇳 '}
              {accent === 'Canadian' && '🇨🇦 '}
              {accent}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Age & Gender */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Age Filters */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mr-1">
              Age:
            </span>
            {ages.map((age) => (
              <button
                type="button"
                key={age}
                onClick={() => setAgeFilter(age)}
                className={`px-2 py-0.5 rounded-md text-xs transition ${
                  ageFilter === age
                    ? 'bg-slate-900 text-white font-medium'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {age}
              </button>
            ))}
          </div>

          {/* Gender Filters */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mr-1">
              Gender:
            </span>
            {genders.map((gender) => (
              <button
                type="button"
                key={gender}
                onClick={() => setGenderFilter(gender)}
                className={`px-2 py-0.5 rounded-md text-xs transition ${
                  genderFilter === gender
                    ? 'bg-slate-900 text-white font-medium'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredProfiles.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-400">
            <p className="text-sm font-medium">No voices match your filters.</p>
            <button
              type="button"
              onClick={() => {
                setAccentFilter('All');
                setAgeFilter('All');
                setGenderFilter('All');
                setSearchQuery('');
              }}
              className="mt-2 text-xs text-indigo-600 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredProfiles.map((profile) => {
            const isSelected = selectedProfileId === profile.id;
            const isPreviewing = previewingProfileId === profile.id;

            return (
              <div
                key={profile.id}
                id={`voice-card-${profile.id}`}
                onClick={() => onSelectProfile(profile)}
                className={`group relative p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                {/* Header: Flag, Name, Checkmark */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none" role="img" aria-label={profile.accent}>
                      {profile.flagEmoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 leading-none">
                          {profile.name}
                        </h3>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                        {profile.tagline}
                      </span>
                    </div>
                  </div>

                  {/* Preview Audio Sample Button */}
                  <button
                    type="button"
                    id={`btn-preview-sample-${profile.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewVoiceSample(profile);
                    }}
                    title={`Hear ${profile.name}'s voice preview`}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition ${
                      isPreviewing
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Sample</span>
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-2.5">
                  {profile.description}
                </p>

                {/* Badges: Accent, Age, Gender */}
                <div className="flex items-center flex-wrap gap-1.5 text-[11px]">
                  {/* Accent Badge */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium bg-slate-100 border border-slate-200/80 text-slate-700">
                    <span>{profile.flagEmoji}</span>
                    <span>{profile.accent}</span>
                  </span>

                  {/* Age Badge */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${getAgeBadgeColor(
                      profile.age
                    )}`}
                  >
                    {profile.age}
                  </span>

                  {/* Gender Badge */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${getGenderBadgeColor(
                      profile.gender
                    )}`}
                  >
                    {profile.gender}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Browser Engine Extras when in Device mode */}
      {engine === 'browser' && (
        <div className="pt-3 border-t border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <h4 className="text-xs font-semibold text-slate-800">
                Device System Speech Mapping & Sliders
              </h4>
            </div>
            <span className="text-[11px] text-slate-500">
              {browserVoices.length} installed voice{browserVoices.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="device-voice-dropdown"
                className="block text-[11px] font-medium text-slate-600 mb-1"
              >
                Installed Voice Override
              </label>
              <select
                id="device-voice-dropdown"
                value={selectedBrowserVoiceUri}
                onChange={(e) => onSelectBrowserVoiceUri(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {browserVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>Pitch</span>
                  <span className="font-mono">{pitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>Rate</span>
                  <span className="font-mono">{rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={rate}
                  onChange={(e) => onRateChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
