import React from 'react';
import { ShaderConfig, ShaderStyle } from '../types';
import { Waves, Droplet, Sparkles, Wind, Orbit, Sliders, Sun, Eye, MousePointer2 } from 'lucide-react';

interface ShaderControlsProps {
  config: ShaderConfig;
  onChange: (updated: Partial<ShaderConfig>) => void;
}

export const ShaderControls: React.FC<ShaderControlsProps> = ({ config, onChange }) => {
  const styles: { id: ShaderStyle; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'mesh', label: 'Neat Mesh', icon: <Waves className="w-4 h-4" />, desc: '3D FBM organische Wellen' },
    { id: 'liquid', label: 'Viscous Liquid', icon: <Droplet className="w-4 h-4" />, desc: 'Fließende Metaball-Dynamik' },
    { id: 'aurora', label: 'Aurora Ribbons', icon: <Wind className="w-4 h-4" />, desc: 'Atmosphärische Polarstreifen' },
    { id: 'vortex', label: 'Cyber Vortex', icon: <Orbit className="w-4 h-4" />, desc: 'Logarithmischer 3D-Strudel' },
    { id: 'silk', label: 'Silk Satin', icon: <Sliders className="w-4 h-4" />, desc: 'Sinusoidale Seidenfalten' },
    { id: 'prismatic', label: 'Prismatic Glass', icon: <Sparkles className="w-4 h-4" />, desc: 'Lichtbrechung & Refraktion' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Shader Style Selector */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 block">
          3D-Shader Algorithmus
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {styles.map((item) => {
            const isSelected = config.style === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChange({ style: item.id })}
                className={`flex flex-col items-start p-2.5 rounded-xl border transition-all text-left group ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-500 shadow-md shadow-purple-500/10 text-white'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 w-full">
                  <span className={`${isSelected ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-300'}`}>
                    {item.icon}
                  </span>
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Shader Parameter Sliders */}
      <div className="space-y-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
          Parameter & Dynamik
        </label>

        {/* Speed */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span>Geschwindigkeit</span>
            </span>
            <span className="font-mono text-purple-400">{config.speed.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="2.5"
            step="0.05"
            value={config.speed}
            onChange={(e) => onChange({ speed: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Distortion / Amplitude */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Wellenverzerrung (Distortion)</span>
            <span className="font-mono text-purple-400">{config.distortion.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="2.2"
            step="0.05"
            value={config.distortion}
            onChange={(e) => onChange({ distortion: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Frequency / Complexity */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Frequenz & Komplexität</span>
            <span className="font-mono text-purple-400">{config.frequency.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.05"
            value={config.frequency}
            onChange={(e) => onChange({ frequency: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Film Grain (tactile noise) */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span>Filmkorn (Grain & Dither)</span>
            </span>
            <span className="font-mono text-purple-400">{(config.grain * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.3"
            step="0.01"
            value={config.grain}
            onChange={(e) => onChange({ grain: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 3D Lighting & Specular highlights */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>3D Beleuchtung & Glanz</span>
            </span>
            <span className="font-mono text-purple-400">{config.lighting.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.5"
            step="0.05"
            value={config.lighting}
            onChange={(e) => onChange({ lighting: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Flow Angle */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Flussrichtung (Winkel)</span>
            <span className="font-mono text-purple-400">{config.angle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={config.angle}
            onChange={(e) => onChange({ angle: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Zoom / Scale */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Zoom & Maßstab</span>
            </span>
            <span className="font-mono text-purple-400">{config.scale.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={config.scale}
            onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Mouse Ripple Reaction */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <MousePointer2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Maus-Interaktion (Ripples)</span>
            </span>
            <span className="font-mono text-purple-400">{(config.mouseInfluence * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={config.mouseInfluence}
            onChange={(e) => onChange({ mouseInfluence: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
