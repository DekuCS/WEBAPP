import React from 'react';
import { AspectRatio } from '../types';
import { Play, Pause, Shuffle, Maximize2, Minimize2, Download, RotateCcw, Sparkles } from 'lucide-react';

interface HeaderProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRandomize: () => void;
  onReset: () => void;
  aspectRatio: AspectRatio;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isPlaying,
  onTogglePlay,
  onRandomize,
  onReset,
  aspectRatio,
  onChangeAspectRatio,
  isFullscreen,
  onToggleFullscreen,
  onOpenExport,
}) => {
  const ratios: { id: AspectRatio; label: string }[] = [
    { id: 'free', label: 'Frei' },
    { id: '2:3', label: '2:3 Poster' },
    { id: '16:9', label: '16:9 TV' },
    { id: '1:1', label: '1:1' },
    { id: '9:16', label: '9:16' },
    { id: '4:5', label: '4:5' },
    { id: '21:9', label: '21:9' },
  ];

  return (
    <header className="h-16 px-4 md:px-6 border-b border-white/10 glass-panel flex items-center justify-between z-30 shrink-0">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-purple-500/20">
          <div className="w-full h-full bg-[#0d0e14] rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm md:text-base tracking-tight text-white font-['Syne']">
              NUVIO
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              3D Studio
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block -mt-0.5 hidden sm:block">
            Hardware-Accelerated WebGL Shader Generator
          </span>
        </div>
      </div>

      {/* Center Controls: Play, Randomize, Aspect Ratio */}
      <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-2xl">
        {/* Play / Pause */}
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            isPlaying
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
              : 'hover:bg-white/10 text-slate-300'
          }`}
          title="Play/Pause (Leertaste)"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        {/* Randomize All */}
        <button
          onClick={onRandomize}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
          title="Zufälliger Farbverlauf (Taste: R)"
        >
          <Shuffle className="w-3.5 h-3.5 text-pink-400" />
          <span>Zufall</span>
        </button>

        {/* Aspect Ratio Pills */}
        <div className="h-4 w-[1px] bg-white/10 mx-1" />
        <div className="flex items-center gap-1">
          {ratios.map((r) => (
            <button
              key={r.id}
              onClick={() => onChangeAspectRatio(r.id)}
              className={`px-2 py-1 text-[11px] font-medium rounded-lg transition ${
                aspectRatio === r.id
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Controls: Fullscreen, Reset, Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white border border-white/10"
          title="Play/Pause"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          onClick={onRandomize}
          className="lg:hidden p-2 rounded-xl bg-white/5 text-pink-400 border border-white/10"
          title="Zufall"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <button
          onClick={onReset}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition"
          title="Zurücksetzen"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition hidden sm:flex"
          title="Vollbild Vorschau"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Exportieren</span>
        </button>
      </div>
    </header>
  );
};
