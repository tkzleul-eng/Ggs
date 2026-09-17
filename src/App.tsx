import React, { useState, useEffect, useRef } from 'react';
import {
  NeuralVoiceId,
  VoiceEngine,
  VoiceProfile,
  VoiceStyleId,
  SpokenClip,
  SampleSnippet,
} from './types';
import { VOICE_PROFILES, VOICE_STYLES, SAMPLE_SNIPPETS } from './data/voices';
import { Header } from './components/Header';
import { TextInputCard } from './components/TextInputCard';
import { VoiceSelector } from './components/VoiceSelector';
import { StyleSelector } from './components/StyleSelector';
import { PlaybackBar } from './components/PlaybackBar';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  // Main speech settings
  const [text, setText] = useState<string>(
    'Beyond the crest of the ancient pine ridge, the forgotten lighthouse stood silently against the breaking waves. For a century, its amber beacon guided solitary sailors through the dense northern fog.'
  );
  const [engine, setEngine] = useState<VoiceEngine>('neural');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('gb_oliver_adult');
  const [selectedNeuralVoice, setSelectedNeuralVoice] = useState<NeuralVoiceId>('Charon');
  const [selectedStyleId, setSelectedStyleId] = useState<VoiceStyleId>('warm_storyteller');

  // Audio adjustments
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [previewingProfileId, setPreviewingProfileId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // System & Environment
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedBrowserVoiceUri, setSelectedBrowserVoiceUri] = useState<string>('');
  const [history, setHistory] = useState<SpokenClip[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<{
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
  } | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const selectedProfile =
    VOICE_PROFILES.find((p) => p.id === selectedProfileId) || VOICE_PROFILES[0];

  // Helper to find best browser voice matching profile
  const matchBrowserVoiceForProfile = (
    profile: VoiceProfile,
    voicesList: SpeechSynthesisVoice[]
  ): SpeechSynthesisVoice | null => {
    if (voicesList.length === 0) return null;

    // 1. Try matching preferred voice names first
    if (profile.preferredBrowserVoiceNames && profile.preferredBrowserVoiceNames.length > 0) {
      for (const prefName of profile.preferredBrowserVoiceNames) {
        const found = voicesList.find((v) =>
          v.name.toLowerCase().includes(prefName.toLowerCase())
        );
        if (found) return found;
      }
    }

    // 2. Try matching language codes (e.g. en-GB, en-AU, en-IN)
    for (const code of profile.browserLangCodes) {
      const found = voicesList.find((v) =>
        v.lang.toLowerCase().startsWith(code.toLowerCase())
      );
      if (found) return found;
    }

    // 3. Match any English voice
    const anyEn = voicesList.find((v) => v.lang.toLowerCase().startsWith('en'));
    return anyEn || voicesList[0];
  };

  // 1. Initialize HTMLAudioElement & Check server health
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setPreviewingProfileId(null);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setIsSynthesizing(false);
      setPreviewingProfileId(null);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Fetch health and API key status
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasGeminiKey === 'boolean') {
          setHasApiKey(data.hasGeminiKey);
          if (!data.hasGeminiKey) {
            setStatusNotification({
              type: 'info',
              message:
                'Notice: Gemini API key is not yet set. The app uses the high-performance Device Speech Engine with accent mapping automatically.',
            });
          }
        }
      })
      .catch(() => {
        // Dev server or network offline
      });

    // Load saved clips from localStorage
    try {
      const saved = localStorage.getItem('tts_clips_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // 2. Load Browser SpeechSynthesis Voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setBrowserVoices(voices);

      if (voices.length > 0 && !selectedBrowserVoiceUri) {
        const matched = matchBrowserVoiceForProfile(selectedProfile, voices);
        if (matched) {
          setSelectedBrowserVoiceUri(matched.voiceURI);
        }
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedBrowserVoiceUri, selectedProfile]);

  // Sync volume & speed with active audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = speed;
    }
  }, [volume, isMuted, speed]);

  // Handle selecting a voice profile
  const handleSelectProfile = (profile: VoiceProfile) => {
    setSelectedProfileId(profile.id);
    setSelectedNeuralVoice(profile.baseNeuralVoice);

    if (engine === 'browser') {
      setPitch(profile.browserPitch);
      setSpeed(profile.browserRate);
      const matched = matchBrowserVoiceForProfile(profile, browserVoices);
      if (matched) {
        setSelectedBrowserVoiceUri(matched.voiceURI);
      }
    }
  };

  // Save history updates
  const saveHistoryItem = (clip: SpokenClip) => {
    setHistory((prev) => {
      const updated = [clip, ...prev.filter((c) => c.id !== clip.id)].slice(0, 40);
      try {
        localStorage.setItem('tts_clips_history', JSON.stringify(updated));
      } catch {
        // Storage full or restricted
      }
      return updated;
    });
  };

  // Stop all active playback
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setIsSynthesizing(false);
    setPreviewingProfileId(null);
    setCurrentTime(0);
  };

  // Pause playback
  const handlePause = () => {
    if (engine === 'neural' && audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // Resume playback
  const handleResume = () => {
    if (engine === 'neural' && audioRef.current) {
      audioRef.current.play();
      setIsPaused(false);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  // Browser Speech Synthesis playback
  const speakWithBrowser = (
    textToSpeak: string,
    profile = selectedProfile,
    customStyleId = selectedStyleId,
    saveToHistory = true
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setStatusNotification({
        type: 'error',
        message: 'Your browser does not support the Web Speech API.',
      });
      return;
    }

    handleStop();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Apply matched or selected voice
    let voiceToUse: SpeechSynthesisVoice | undefined;
    if (selectedBrowserVoiceUri) {
      voiceToUse = browserVoices.find((v) => v.voiceURI === selectedBrowserVoiceUri);
    }
    if (!voiceToUse && browserVoices.length > 0) {
      voiceToUse = matchBrowserVoiceForProfile(profile, browserVoices) || undefined;
    }
    if (voiceToUse) {
      utterance.voice = voiceToUse;
    }

    // Apply style adjustments and profile pitch/rate
    const styleObj = VOICE_STYLES.find((s) => s.id === customStyleId) || VOICE_STYLES[0];
    const targetPitch = Math.max(
      0.5,
      Math.min(2.0, (pitch || profile.browserPitch) * styleObj.browserPitch)
    );
    const targetRate = Math.max(
      0.5,
      Math.min(2.0, (speed || profile.browserRate) * styleObj.browserRate)
    );

    utterance.pitch = targetPitch;
    utterance.rate = targetRate;
    utterance.volume = isMuted ? 0 : volume;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setIsSynthesizing(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setPreviewingProfileId(null);
      setCurrentTime(0);
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error('SpeechSynthesis error:', e);
        setStatusNotification({
          type: 'error',
          message: `Device speech notice: ${e.error || 'Playback error.'}`,
        });
      }
      setIsPlaying(false);
      setIsPaused(false);
      setIsSynthesizing(false);
      setPreviewingProfileId(null);
    };

    window.speechSynthesis.speak(utterance);

    // Save clip to history if requested
    if (saveToHistory) {
      const newClip: SpokenClip = {
        id: `clip-${Date.now()}`,
        text: textToSpeak,
        engine: 'browser',
        voiceName: `${profile.flagEmoji} ${profile.name}`,
        voiceProfileId: profile.id,
        accent: profile.accent,
        age: profile.age,
        gender: profile.gender,
        styleName: styleObj.name,
        styleId: customStyleId,
        timestamp: Date.now(),
        rate: targetRate,
        pitch: targetPitch,
      };
      saveHistoryItem(newClip);
    }
  };

  // AI Neural Speech Synthesis playback
  const speakWithNeural = async (
    textToSpeak: string,
    profile = selectedProfile,
    customStyleId = selectedStyleId,
    saveToHistory = true
  ) => {
    handleStop();
    setIsSynthesizing(true);

    const styleObj = VOICE_STYLES.find((s) => s.id === customStyleId) || VOICE_STYLES[0];

    try {
      const res = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          voiceName: profile.baseNeuralVoice,
          voiceDirective: profile.neuralPromptDirective,
          stylePromptPrefix: styleObj.promptPrefix,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        // Fallback to browser speech seamlessly
        console.warn('AI TTS status:', res.status, data.error);
        setStatusNotification({
          type: 'info',
          message: `${data.error || 'Neural service notice'}. Switched to device speech engine.`,
        });
        speakWithBrowser(textToSpeak, profile, customStyleId, saveToHistory);
        return;
      }

      if (data.audioDataUrl && audioRef.current) {
        setCurrentAudioUrl(data.audioDataUrl);
        audioRef.current.src = data.audioDataUrl;
        audioRef.current.playbackRate = speed;
        audioRef.current.volume = isMuted ? 0 : volume;

        await audioRef.current.play();
        setIsPlaying(true);
        setIsPaused(false);

        // Save clip to history
        if (saveToHistory) {
          const newClip: SpokenClip = {
            id: `clip-${Date.now()}`,
            text: textToSpeak,
            engine: 'neural',
            voiceName: `${profile.flagEmoji} ${profile.name}`,
            voiceProfileId: profile.id,
            accent: profile.accent,
            age: profile.age,
            gender: profile.gender,
            styleName: styleObj.name,
            styleId: customStyleId,
            audioUrl: data.audioDataUrl,
            timestamp: Date.now(),
            rate: speed,
            pitch: 1.0,
          };
          saveHistoryItem(newClip);
        }
      }
    } catch (err) {
      console.error('TTS request failed:', err);
      setStatusNotification({
        type: 'warning',
        message: 'Could not connect to neural voice service. Playing via device speech.',
      });
      speakWithBrowser(textToSpeak, profile, customStyleId, saveToHistory);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Main Speak Aloud Trigger
  const handlePlay = () => {
    if (!text.trim()) return;

    if (engine === 'neural') {
      speakWithNeural(text.trim(), selectedProfile, selectedStyleId, true);
    } else {
      speakWithBrowser(text.trim(), selectedProfile, selectedStyleId, true);
    }
  };

  // Quick Voice Preview Sample
  const handlePreviewVoiceSample = (profile: VoiceProfile) => {
    handleSelectProfile(profile);
    setPreviewingProfileId(profile.id);

    const sampleText = profile.samplePhrase;

    if (engine === 'neural') {
      speakWithNeural(sampleText, profile, 'natural', false);
    } else {
      speakWithBrowser(sampleText, profile, 'natural', false);
    }
  };

  // Replay Last Audio
  const handleReplay = () => {
    if (currentAudioUrl && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      handlePlay();
    }
  };

  // Seek time
  const handleSeek = (newTime: number) => {
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Download Audio
  const handleDownloadAudio = () => {
    if (!currentAudioUrl) return;
    const a = document.createElement('a');
    a.href = currentAudioUrl;
    a.download = `speech-${selectedProfile.name.toLowerCase()}-${selectedProfile.accent.toLowerCase()}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Select snippet inspiration
  const handleSelectSnippet = (snippet: SampleSnippet) => {
    setText(snippet.text);
    setSelectedStyleId(snippet.suggestedStyle);
    if (snippet.suggestedProfileId) {
      const found = VOICE_PROFILES.find((p) => p.id === snippet.suggestedProfileId);
      if (found) {
        handleSelectProfile(found);
      }
    } else if (snippet.suggestedVoice) {
      setSelectedNeuralVoice(snippet.suggestedVoice);
    }
  };

  // History Replay
  const handlePlayClip = (clip: SpokenClip) => {
    if (clip.audioUrl && audioRef.current) {
      handleStop();
      setCurrentAudioUrl(clip.audioUrl);
      audioRef.current.src = clip.audioUrl;
      audioRef.current.playbackRate = clip.rate || 1.0;
      audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      setText(clip.text);
      const prof =
        VOICE_PROFILES.find((p) => p.id === clip.voiceProfileId) || selectedProfile;
      if (clip.engine === 'neural') {
        speakWithNeural(clip.text, prof, clip.styleId || 'natural', false);
      } else {
        speakWithBrowser(clip.text, prof, clip.styleId || 'natural', false);
      }
    }
  };

  const activeStyle =
    VOICE_STYLES.find((s) => s.id === selectedStyleId) || VOICE_STYLES[0];
  const activeVoiceName = `${selectedProfile.flagEmoji} ${selectedProfile.name} (${selectedProfile.accent} • ${selectedProfile.age})`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <Header
        engine={engine}
        setEngine={setEngine}
        hasApiKey={hasApiKey}
        historyCount={history.length}
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        isHistoryOpen={isHistoryOpen}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Notification Toast Banner */}
        {statusNotification && (
          <div
            className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs transition-all ${
              statusNotification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : statusNotification.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : statusNotification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusNotification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusNotification(null)}
              className="p-0.5 rounded-md hover:bg-black/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Primary Workspace: 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Text Input (5 cols on large) */}
          <div className="lg:col-span-5 flex flex-col">
            <TextInputCard
              text={text}
              onChangeText={setText}
              onSelectSnippet={handleSelectSnippet}
              isSynthesizing={isSynthesizing}
            />
          </div>

          {/* Right Column: Voice & Style Studio (7 cols on large) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Voice Persona Selector with Accents, Ages, Genders */}
            <VoiceSelector
              engine={engine}
              selectedProfileId={selectedProfileId}
              onSelectProfile={handleSelectProfile}
              browserVoices={browserVoices}
              selectedBrowserVoiceUri={selectedBrowserVoiceUri}
              onSelectBrowserVoiceUri={setSelectedBrowserVoiceUri}
              pitch={pitch}
              onPitchChange={setPitch}
              rate={speed}
              onRateChange={setSpeed}
              volume={volume}
              onVolumeChange={setVolume}
              onPreviewVoiceSample={handlePreviewVoiceSample}
              previewingProfileId={previewingProfileId}
            />

            {/* Voice Delivery & Style Grid */}
            <StyleSelector
              selectedStyleId={selectedStyleId}
              onSelectStyle={setSelectedStyleId}
              isNeural={engine === 'neural'}
            />
          </div>
        </div>

        {/* Persistent Bottom Playback & Visualizer Control Center */}
        <div className="sticky bottom-4 z-20">
          <PlaybackBar
            engine={engine}
            isPlaying={isPlaying}
            isPaused={isPaused}
            isSynthesizing={isSynthesizing}
            onPlay={handlePlay}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onReplay={handleReplay}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            audioElement={audioRef.current}
            speed={speed}
            onSpeedChange={setSpeed}
            volume={volume}
            onVolumeChange={setVolume}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((m) => !m)}
            currentAudioUrl={currentAudioUrl}
            onDownloadAudio={handleDownloadAudio}
            activeVoiceName={activeVoiceName}
            activeStyleName={activeStyle.name}
            hasText={text.trim().length > 0}
          />
        </div>
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        clips={history}
        onPlayClip={handlePlayClip}
        onLoadIntoInput={setText}
        onDeleteClip={(id) => {
          setHistory((prev) => {
            const updated = prev.filter((c) => c.id !== id);
            try {
              localStorage.setItem('tts_clips_history', JSON.stringify(updated));
            } catch {
              // Ignore
            }
            return updated;
          });
        }}
        onClearAll={() => {
          setHistory([]);
          try {
            localStorage.removeItem('tts_clips_history');
          } catch {
            // Ignore
          }
        }}
      />
    </div>
  );
}
