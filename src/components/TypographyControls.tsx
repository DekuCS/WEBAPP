import React, { useState } from 'react';
import { TextConfig, TextVisualEffect, TextMotionAnimation } from '../types';
import { VISUAL_EFFECTS, MOTION_ANIMATIONS } from '../data/textPresets';
import {
  Type,
  Sparkles,
  AlignCenter,
  AlignLeft,
  LayoutTemplate,
  Palette,
  CaseUpper,
  Rainbow,
  Check,
  Activity,
  Zap,
  Layers,
  Flame,
  Radio,
  Eye,
  Sliders,
} from 'lucide-react';

interface TypographyControlsProps {
  config: TextConfig;
  onChange: (updates: Partial<TextConfig>) => void;
  shaderColors?: string[];
}

export const TypographyControls: React.FC<TypographyControlsProps> = ({
  config,
  onChange,
  shaderColors = ['#ff007f', '#7928ca', '#00dfd8'],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'effects' | 'motion'>('effects');
  const [selectedEffectCategory, setSelectedEffectCategory] = useState<string>('all');

  const fontFamilies = [
    { id: 'syne', label: 'Syne (Signature Bold & Modern)' },
    { id: 'space-grotesk', label: 'Space Grotesk (Cyber Tech)' },
    { id: 'plus-jakarta', label: 'Plus Jakarta Sans (Clean Editorial)' },
    { id: 'outfit', label: 'Outfit (Geometric Contemporary)' },
    { id: 'instrument-serif', label: 'Instrument Serif (Luxury Editorial)' },
    { id: 'cinzel', label: 'Cinzel (Classical Cinematic Poster)' },
    { id: 'jetbrains-mono', label: 'JetBrains Mono (Technical Minimal)' },
  ];

  const effectCategories = [
    { id: 'all', label: 'Alle Effekte' },
    { id: 'color-match', label: 'Invert & Blend' },
    { id: 'rainbow', label: 'Regenbogen' },
    { id: 'metallic', label: 'Metall & Gold' },
    { id: 'experimental', label: 'Kreativ & 3D' },
    { id: 'glow', label: 'Neon & Licht' },
    { id: 'clean', label: 'Minimal' },
  ];

  const filteredEffects = VISUAL_EFFECTS.filter((e) => {
    if (selectedEffectCategory === 'all') return true;
    return e.category === selectedEffectCategory;
  });

  return (
    <div className="space-y-5 select-none">
      {/* Enable / Disable Overlay Toggle */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block text-white">Typografie & Text-Overlay</span>
            <span className="text-[10px] text-slate-400 block">Effekte & Bewegungs-Animationen separat steuern</span>
          </div>
        </div>
        <button
          onClick={() => onChange({ enabled: !config.enabled })}
          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
            config.enabled ? 'bg-purple-600' : 'bg-white/10'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              config.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {config.enabled && (
        <>
          {/* Quick Highlight Actions */}
          <div className="grid grid-cols-2 gap-2">
            {/* Negative Invert Cutout Button */}
            <button
              onClick={() => {
                onChange({
                  effect: 'difference-blend',
                  matchBackgroundColors: false,
                });
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                config.effect === 'difference-blend'
                  ? 'bg-indigo-600/30 border-indigo-400 shadow-md ring-1 ring-indigo-400/50 text-white'
                  : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-white text-black text-[10px] font-extrabold flex items-center justify-center">±</span>
                  <span>Negative Invert</span>
                </span>
                {config.effect === 'difference-blend' && <Check className="w-3.5 h-3.5 text-indigo-300" />}
              </div>
              <span className="text-[10px] text-slate-400">Difference GPU Cutout</span>
            </button>

            {/* Rainbow Button */}
            <button
              onClick={() => {
                onChange({
                  effect: 'rainbow-wave',
                  matchBackgroundColors: false,
                });
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                config.effect === 'rainbow-wave' || config.effect === 'rainbow-hologram'
                  ? 'bg-pink-600/30 border-pink-400 shadow-md ring-1 ring-pink-400/50 text-white'
                  : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Rainbow className="w-3.5 h-3.5 text-pink-400" />
                  <span>Regenbogen</span>
                </span>
                {(config.effect === 'rainbow-wave' || config.effect === 'rainbow-hologram') && (
                  <Check className="w-3.5 h-3.5 text-pink-300" />
                )}
              </div>
              <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 via-sky-400 to-purple-500 shadow-inner" />
            </button>

            {/* Color Match Button */}
            <button
              onClick={() => {
                onChange({
                  effect: 'match-palette',
                  matchBackgroundColors: true,
                });
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                config.effect === 'match-palette'
                  ? 'bg-purple-600/30 border-purple-400 shadow-md ring-1 ring-purple-400/50 text-white'
                  : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  <span>Farben matchen</span>
                </span>
                {config.effect === 'match-palette' && <Check className="w-3.5 h-3.5 text-purple-300" />}
              </div>
              <div className="flex items-center gap-1">
                {shaderColors.slice(0, 4).map((c, i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border border-black/40"
                    style={{ backgroundColor: c }}
                  />
                ))}
                <span className="text-[10px] text-slate-400 ml-1">Palette Sync</span>
              </div>
            </button>

            {/* Luminous Solar Dodge Button */}
            <button
              onClick={() => {
                onChange({
                  effect: 'color-dodge',
                  matchBackgroundColors: false,
                });
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                config.effect === 'color-dodge'
                  ? 'bg-amber-600/30 border-amber-400 shadow-md ring-1 ring-amber-400/50 text-white'
                  : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Solar Dodge</span>
                </span>
                {config.effect === 'color-dodge' && <Check className="w-3.5 h-3.5 text-amber-300" />}
              </div>
              <span className="text-[10px] text-slate-400">Luminous Glow</span>
            </button>
          </div>

          {/* SEPARATED SECTION TABS: VISUAL EFFECT vs MOTION ANIMATION */}
          <div className="p-1 bg-white/5 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab('effects')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeSubTab === 'effects'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>1. Text-Stil & Effekt</span>
            </button>
            <button
              onClick={() => setActiveSubTab('motion')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeSubTab === 'motion'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>2. Bewegung & Animation</span>
            </button>
          </div>

          {/* TAB 1: VISUAL EFFECT STYLES */}
          {activeSubTab === 'effects' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <span>Visuelle Effekte ({VISUAL_EFFECTS.length})</span>
                </span>
                <span className="text-[10px] text-purple-300 font-mono">
                  Aktiv: {VISUAL_EFFECTS.find((e) => e.id === config.effect)?.name || config.effect}
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {effectCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedEffectCategory(c.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition cursor-pointer ${
                      selectedEffectCategory === c.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Effects Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {filteredEffects.map((effect) => {
                  const isSelected = config.effect === effect.id;
                  return (
                    <button
                      key={effect.id}
                      onClick={() => {
                        onChange({
                          effect: effect.id,
                          matchBackgroundColors: effect.id === 'match-palette',
                          fontFamily: effect.recommendedFont || config.fontFamily,
                        });
                      }}
                      className={`flex flex-col p-2.5 rounded-xl border text-left transition group cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600/25 border-purple-400 text-white shadow-md ring-1 ring-purple-500/40'
                          : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold truncate">{effect.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-white/10 text-slate-300">
                          {effect.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        {effect.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MOTION & KEYFRAME ANIMATIONS */}
          {activeSubTab === 'motion' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <span>Bewegungs-Animationen ({MOTION_ANIMATIONS.length})</span>
                </span>
                <span className="text-[10px] text-indigo-300 font-mono">
                  Aktiv: {MOTION_ANIMATIONS.find((a) => a.id === config.animation)?.name || config.animation}
                </span>
              </div>

              {/* Motion Animations Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {MOTION_ANIMATIONS.map((motion) => {
                  const isSelected = config.animation === motion.id;
                  return (
                    <button
                      key={motion.id}
                      onClick={() => onChange({ animation: motion.id })}
                      className={`flex flex-col p-2.5 rounded-xl border text-left transition group cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md ring-1 ring-indigo-400/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold truncate">{motion.name}</span>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-indigo-300" />
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-white/10 text-slate-400">
                            {motion.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        {motion.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content Inputs */}
          <div className="space-y-3 pt-1 border-t border-white/5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Inhalt & Typografie
            </label>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">
                Hauptüberschrift (Mehrzeilig möglich via Enter)
              </span>
              <textarea
                value={config.headline}
                onChange={(e) => onChange({ headline: e.target.value })}
                placeholder="z.B. ETHEREAL&#10;DRIFT"
                rows={2}
                className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white font-bold focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Beschreibung / Fließtext</span>
              <textarea
                value={config.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Beschreibungstext..."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>

            {config.showBadge && (
              <div>
                <span className="text-[11px] text-purple-300 block mb-1">Tagline / Badge Text</span>
                <input
                  type="text"
                  value={config.tagline}
                  onChange={(e) => onChange({ tagline: e.target.value })}
                  placeholder="z.B. NUVIO COLLECTION — 2026"
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            )}
          </div>

          {/* Font & Layout Styling */}
          <div className="space-y-3 pt-1 border-t border-white/5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Schriftart & Poster-Layout
            </label>

            {/* Font Family */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Schriftart</span>
              <select
                value={config.fontFamily}
                onChange={(e) => onChange({ fontFamily: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-[#161922] border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {fontFamilies.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#161922] text-white">
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Alignment */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Ausrichtung & Position</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'center', label: 'Zentriert', icon: <AlignCenter className="w-3.5 h-3.5" /> },
                  { id: 'bottom-left', label: 'Unten Links', icon: <AlignLeft className="w-3.5 h-3.5" /> },
                  { id: 'editorial-split', label: 'Editorial', icon: <LayoutTemplate className="w-3.5 h-3.5" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChange({ alignment: item.id as any })}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs border transition cursor-pointer ${
                      config.alignment === item.id
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size & Spacing */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Größe</span>
                <select
                  value={config.size}
                  onChange={(e) => onChange({ size: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#161922] border border-white/10 rounded-lg text-white focus:outline-none cursor-pointer"
                >
                  <option value="small">Kompakt</option>
                  <option value="medium">Mittel</option>
                  <option value="large">Groß (Hero)</option>
                  <option value="huge">Massiv (Poster)</option>
                  <option value="massive">Ultra Cinema (TV App)</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Zeichenabstand</span>
                <select
                  value={config.letterSpacing}
                  onChange={(e) => onChange({ letterSpacing: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#161922] border border-white/10 rounded-lg text-white focus:outline-none cursor-pointer"
                >
                  <option value="tight">Eng</option>
                  <option value="normal">Standard</option>
                  <option value="wide">Weit</option>
                  <option value="widest">Sehr weit</option>
                </select>
              </div>
            </div>

            {/* Custom Scale Slider for Poster Zoom */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Schrift-Skalierung (TV Poster Zoom)</span>
                </span>
                <span className="font-mono text-purple-400">
                  {((config.customScale ?? 1.15) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="2.2"
                step="0.05"
                value={config.customScale ?? 1.15}
                onChange={(e) => onChange({ customScale: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Colors & Options */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => onChange({ textColor: e.target.value, matchBackgroundColors: false })}
                    className="w-6 h-6 rounded cursor-pointer border border-white/20 bg-transparent"
                    title="Schriftfarbe"
                  />
                  <span className="text-[11px] text-slate-400">Farbe</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={(e) => onChange({ accentColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border border-white/20 bg-transparent"
                    title="Akzentfarbe (Glow / Badge)"
                  />
                  <span className="text-[11px] text-slate-400">Akzent</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onChange({ uppercase: !config.uppercase })}
                  className={`p-1.5 rounded-lg border text-xs transition flex items-center gap-1 cursor-pointer ${
                    config.uppercase
                      ? 'bg-purple-600/30 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                  title="GROSSBUCHSTABEN"
                >
                  <CaseUpper className="w-3.5 h-3.5" />
                  <span className="text-[10px]">CAPS</span>
                </button>
              </div>
            </div>

            {/* Badge & Watermark Toggles (DISABLED BY DEFAULT!) */}
            <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition">
                <input
                  type="checkbox"
                  checked={config.showBadge}
                  onChange={(e) => onChange({ showBadge: e.target.checked })}
                  className="rounded accent-purple-600 cursor-pointer"
                />
                <span>Badge / Tag anzeigen</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition">
                <input
                  type="checkbox"
                  checked={config.showWatermark}
                  onChange={(e) => onChange({ showWatermark: e.target.checked })}
                  className="rounded accent-purple-600 cursor-pointer"
                />
                <span>Branding Signatur</span>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
