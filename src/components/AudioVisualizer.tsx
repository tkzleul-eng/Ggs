import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  isPaused?: boolean;
  audioElement?: HTMLAudioElement | null;
  accentColor?: string;
  height?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  isPaused = false,
  audioElement,
  accentColor = '#6366f1',
  height = 56,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const simulatedPhaseRef = useRef<number>(0);

  // Set up Web Audio API analyser if audioElement is provided
  useEffect(() => {
    if (!audioElement) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === 'suspended' && isPlaying) {
        audioCtxRef.current.resume();
      }

      if (!sourceNodeRef.current && audioCtxRef.current) {
        try {
          const source = audioCtxRef.current.createMediaElementSource(audioElement);
          const analyser = audioCtxRef.current.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.8;

          source.connect(analyser);
          analyser.connect(audioCtxRef.current.destination);

          sourceNodeRef.current = source;
          analyserRef.current = analyser;
        } catch (e) {
          // Already connected or cross-origin restriction
          console.debug('MediaElementSource initialization notice:', e);
        }
      }
    } catch {
      // Fall back to synthetic animation
    }
  }, [audioElement, isPlaying]);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numBars = 36;
    const barWidth = 3;
    const gap = 4;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      const startX = Math.max(0, (width - (numBars * (barWidth + gap) - gap)) / 2);

      let frequencies: number[] = [];

      if (isPlaying && !isPaused && analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        for (let i = 0; i < numBars; i++) {
          const index = Math.floor((i / numBars) * (bufferLength / 2));
          frequencies.push(dataArray[index] / 255);
        }
      } else if (isPlaying && !isPaused) {
        // Organic simulated speech cadence waveform
        simulatedPhaseRef.current += 0.08;
        const p = simulatedPhaseRef.current;

        for (let i = 0; i < numBars; i++) {
          const centerDist = Math.abs(i - numBars / 2) / (numBars / 2);
          const envelope = Math.max(0.2, 1 - centerDist * 0.7);
          const wave1 = Math.sin(p * 2 + i * 0.4);
          const wave2 = Math.cos(p * 3.5 + i * 0.7);
          const wave3 = Math.sin(p * 0.9 + i * 0.2);
          const amp = Math.max(0.1, (wave1 * 0.4 + wave2 * 0.3 + wave3 * 0.3 + 0.5) * envelope);
          frequencies.push(Math.min(1, Math.max(0.1, amp)));
        }
      } else {
        // Idle gentle breathing baseline
        for (let i = 0; i < numBars; i++) {
          frequencies.push(0.08);
        }
      }

      // Draw bars
      for (let i = 0; i < numBars; i++) {
        const x = startX + i * (barWidth + gap);
        const amp = frequencies[i] || 0.08;
        const barHeight = Math.max(4, amp * (h * 0.85));
        const y = (h - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, accentColor);
        grad.addColorStop(1, '#a5b4fc');

        ctx.fillStyle = isPlaying && !isPaused ? grad : '#cbd5e1';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isPaused, accentColor]);

  return (
    <div className="w-full flex items-center justify-center overflow-hidden py-1">
      <canvas
        ref={canvasRef}
        width={340}
        height={height}
        className="w-full max-w-[340px] block"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};
