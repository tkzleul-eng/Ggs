import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

/**
 * Prepend standard 44-byte RIFF WAV header to raw PCM audio buffer.
 * Gemini TTS output is 24,000 Hz, 1-channel (mono), 16-bit signed integer little-endian PCM.
 */
function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20); // AudioFormat: PCM = 1
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
  });
});

// Text-to-Speech synthesis endpoint
app.post('/api/tts/synthesize', async (req, res) => {
  try {
    const {
      text,
      voiceName = 'Kore',
      stylePromptPrefix = '',
      voiceDirective = '',
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return res.status(400).json({
        error: 'GEMINI_API_KEY is not configured on the server. You can still use the Browser Speech Engine for instant speech!',
        code: 'MISSING_API_KEY',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Construct styled prompt combining persona directive and delivery style
    const cleanText = text.trim();
    const directives: string[] = [];
    if (voiceDirective && typeof voiceDirective === 'string') {
      directives.push(voiceDirective.trim());
    }
    if (stylePromptPrefix && typeof stylePromptPrefix === 'string') {
      directives.push(stylePromptPrefix.trim());
    }

    const combinedInstruction = directives.join(' ');
    const prompt = combinedInstruction
      ? `${combinedInstruction} "${cleanText}"`
      : `Read aloud clearly and naturally: "${cleanText}"`;

    const validVoice = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'].includes(voiceName)
      ? voiceName
      : 'Kore';

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: validVoice },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const rawAudioBase64 = part?.inlineData?.data;
    const returnedMime = part?.inlineData?.mimeType || 'audio/pcm;rate=24000';

    if (!rawAudioBase64) {
      return res.status(502).json({ error: 'No audio data received from the speech model.' });
    }

    const rawBuffer = Buffer.from(rawAudioBase64, 'base64');

    // Check if the data already contains a RIFF/WAVE header
    const isWav = rawBuffer.subarray(0, 4).toString('ascii') === 'RIFF';
    const isMp3 =
      rawBuffer.subarray(0, 3).toString('ascii') === 'ID3' ||
      (rawBuffer[0] === 0xff && (rawBuffer[1] & 0xe0) === 0xe0);

    let finalWavBuffer: Buffer;
    let finalMime = 'audio/wav';

    if (isWav || isMp3) {
      finalWavBuffer = rawBuffer;
      finalMime = isMp3 ? 'audio/mp3' : 'audio/wav';
    } else {
      // Raw PCM 24kHz 16-bit mono -> Wrap in standard WAV container
      finalWavBuffer = pcmToWav(rawBuffer, 24000, 1, 16);
    }

    const finalBase64 = finalWavBuffer.toString('base64');
    const audioDataUrl = `data:${finalMime};base64,${finalBase64}`;

    return res.json({
      audioDataUrl,
      format: finalMime,
      sampleRate: 24000,
      sizeBytes: finalWavBuffer.length,
      voice: validVoice,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('TTS Synthesis Error:', error);
    let message = error.message || 'Failed to synthesize speech.';
    try {
      const parsed = JSON.parse(message);
      if (parsed?.error?.message) {
        message = parsed.error.message;
      }
    } catch {
      // not JSON string
    }

    const isQuota = message.includes('429') || message.toLowerCase().includes('quota');

    return res.status(isQuota ? 429 : 500).json({
      error: isQuota
        ? 'AI voice synthesis quota limit reached. Falling back to high-quality Device Speech Engine.'
        : message,
      isQuota,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TTS Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
