import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Sparkles, 
  Play, 
  Download, 
  RefreshCw, 
  Film, 
  CheckCircle2, 
  AlertCircle, 
  Maximize2,
  Tv,
  Smartphone
} from 'lucide-react';
import { VEO_PROMPT_PRESETS } from '../data/mockData';

export const VeoVideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState(
    'Cinematic 3D render of an autonomous cybernetic AI agent core with glowing circuit traces, floating data rings revolving in a dark server room, volumetric fog, cinematic lighting, 8k resolution'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [status, setStatus] = useState<'idle' | 'generating' | 'polling' | 'ready' | 'error'>('idle');
  const [progressStep, setProgressStep] = useState(0);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollIntervalRef = useRef<any>(null);

  const PROGRESS_MESSAGES = [
    'Initializing Veo 3 Neural Canvas (veo-3.1-fast-generate-preview)...',
    'Synthesizing keyframe dynamics and camera motion vectors...',
    'Rendering high-fidelity temporal consistency across frames...',
    'Finalizing video stream and color grading profile...',
    'Video generation complete! Preparing playback...',
  ];

  useEffect(() => {
    let interval: any;
    if (status === 'generating' || status === 'polling') {
      interval = setInterval(() => {
        setProgressStep((prev) => (prev < PROGRESS_MESSAGES.length - 2 ? prev + 1 : prev));
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleStartGeneration = async () => {
    if (!prompt.trim() || status === 'generating' || status === 'polling') return;

    setStatus('generating');
    setProgressStep(0);
    setErrorMessage(null);
    setVideoUrl(null);
    setOperationName(null);

    try {
      const res = await fetch('/api/veo/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Generation failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const opName = data.operationName;
      setOperationName(opName);
      setStatus('polling');

      // Start polling status
      pollVideoStatus(opName);
    } catch (err: any) {
      console.error('Veo generation error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to start video generation');
    }
  };

  const pollVideoStatus = (opName: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch('/api/veo/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        if (!res.ok) throw new Error('Status polling failed');
        const data = await res.json();

        if (data.done) {
          clearInterval(pollIntervalRef.current);
          setProgressStep(PROGRESS_MESSAGES.length - 1);
          
          // Trigger download / stream
          fetchVideoBlob(opName);
        } else if (data.error) {
          clearInterval(pollIntervalRef.current);
          setStatus('error');
          setErrorMessage(data.error.message || 'Model reported an error during video synthesis');
        } else if (attempts >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          setStatus('error');
          setErrorMessage('Video generation timed out. Please try a simpler prompt.');
        }
      } catch (err: any) {
        console.warn('Poll attempt error:', err);
      }
    }, 5000);
  };

  const fetchVideoBlob = async (opName: string) => {
    try {
      const res = await fetch('/api/veo/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve video stream');
      }

      const blob = await res.blob();
      const localUrl = URL.createObjectURL(blob);
      setVideoUrl(localUrl);
      setStatus('ready');
    } catch (err: any) {
      console.error('Fetch video blob error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to download completed video');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-600 to-amber-600 text-white shadow-lg shadow-rose-900/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100">Veo 3 Video Studio</h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800 text-rose-300">
                  veo-3.1-fast-generate-preview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate high-definition AI videos from text descriptions using Google's state-of-the-art Veo 3 model.
              </p>
            </div>
          </div>

          {/* Aspect Ratio Toggle */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 px-2">Format:</span>
            <button
              id="ratio-16-9"
              onClick={() => setAspectRatio('16:9')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>16:9 Landscape</span>
            </button>
            <button
              id="ratio-9-16"
              onClick={() => setAspectRatio('9:16')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 Portrait</span>
            </button>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mt-5 space-y-3">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
              <span>Text Prompt for Veo 3</span>
              <span className="text-slate-500 font-sans normal-case">Be descriptive about camera angle, lighting, and movement</span>
            </label>
            <textarea
              id="veo-prompt-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe the scene, motion, lighting, and camera angle..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-sans resize-none"
            />
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Presets:</span>
            {VEO_PROMPT_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(preset.prompt);
                  setAspectRatio(preset.ratio);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {preset.title} ({preset.ratio})
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <button
              id="btn-generate-video"
              onClick={handleStartGeneration}
              disabled={status === 'generating' || status === 'polling' || !prompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {status === 'generating' || status === 'polling' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Video with Veo 3...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Veo 3 Video ({aspectRatio})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Status Card */}
      {(status === 'generating' || status === 'polling') && (
        <div className="bg-slate-900/90 border border-rose-900/60 rounded-2xl p-6 shadow-xl space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Veo 3 Neural Video Generation in Progress
              </h2>
              <p className="text-xs text-rose-300 font-medium">
                {PROGRESS_MESSAGES[progressStep]}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(95, ((progressStep + 1) / PROGRESS_MESSAGES.length) * 100)}%`,
              }}
            />
          </div>

          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Model: <code className="text-rose-400 font-mono">veo-3.1-fast-generate-preview</code></span>
            <span>Target Ratio: <code className="text-rose-400 font-mono">{aspectRatio}</code></span>
            {operationName && (
              <span className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]">
                Op: {operationName}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="bg-red-950/40 border border-red-800 rounded-2xl p-5 shadow-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-red-200">Video Generation Encountered an Issue</h2>
            <p className="text-xs text-red-300/90">{errorMessage}</p>
            <p className="text-[11px] text-slate-400 mt-2">
              Note: Veo 3 preview generation requires quota enabled on your Gemini API key in Settings &gt; Secrets.
            </p>
          </div>
        </div>
      )}

      {/* Video Player & Download Card */}
      {videoUrl && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-100">Veo 3 Video Ready</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                {aspectRatio}
              </span>
            </div>

            <a
              href={videoUrl}
              download={`veo3-${aspectRatio}-${Date.now()}.mp4`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download MP4</span>
            </a>
          </div>

          <div
            className={`mx-auto bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 ${
              aspectRatio === '16:9' ? 'aspect-video max-w-2xl' : 'aspect-[9/16] max-w-xs'
            }`}
          >
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full h-full object-contain"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Prompt:</span> {prompt}
          </div>
        </div>
      )}
    </div>
  );
};
