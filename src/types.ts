export type VoiceEngine = 'neural' | 'browser';

export type VoiceAccent =
  | 'American'
  | 'British'
  | 'Australian'
  | 'Irish'
  | 'Scottish'
  | 'Indian'
  | 'Canadian';

export type VoiceAge = 'Child' | 'Young Adult' | 'Adult' | 'Elder';

export type VoiceGender = 'Female' | 'Male' | 'Neutral';

export interface VoiceProfile {
  id: string;
  name: string;
  accent: VoiceAccent;
  age: VoiceAge;
  gender: VoiceGender;
  tagline: string;
  description: string;
  samplePhrase: string;
  flagEmoji: string;
  baseNeuralVoice: NeuralVoiceId;
  neuralPromptDirective: string;
  browserLangCodes: string[];
  browserPitch: number;
  browserRate: number;
  preferredBrowserVoiceNames?: string[];
}

export type VoiceStyleId =
  | 'natural'
  | 'warm_storyteller'
  | 'energetic_host'
  | 'calm_meditation'
  | 'dramatic_cinema'
  | 'professional_news'
  | 'cheerful_friend'
  | 'mysterious_whisper';

export interface VoiceStyle {
  id: VoiceStyleId;
  name: string;
  tagline: string;
  description: string;
  promptPrefix: string;
  icon: string;
  accentColor: string;
  // Fallback pitch and rate for browser speech engine
  browserPitch: number;
  browserRate: number;
}

export type NeuralVoiceId = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface NeuralVoice {
  id: NeuralVoiceId;
  name: string;
  gender: 'female' | 'male' | 'neutral';
  tone: string;
  description: string;
  recommendedStyles: VoiceStyleId[];
}

export interface SampleSnippet {
  id: string;
  category: string;
  label: string;
  text: string;
  suggestedStyle: VoiceStyleId;
  suggestedVoice?: NeuralVoiceId;
  suggestedProfileId?: string;
}

export interface SpokenClip {
  id: string;
  text: string;
  engine: VoiceEngine;
  voiceName: string;
  voiceProfileId?: string;
  accent?: VoiceAccent;
  age?: VoiceAge;
  gender?: VoiceGender;
  styleName: string;
  styleId?: VoiceStyleId;
  audioUrl?: string; // base64 or blob URL
  timestamp: number;
  rate: number;
  pitch: number;
  durationSec?: number;
}

export interface SynthesisRequest {
  text: string;
  voiceName: NeuralVoiceId;
  styleId: VoiceStyleId;
  voiceDirective?: string;
  speed?: number;
}

export interface SynthesisResponse {
  audioDataUrl: string;
  sampleRate: number;
  format: string;
  mimeType: string;
}

