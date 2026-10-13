import React, { useState } from 'react';
import { PRESETS } from '../data/presets';
import { Preset } from '../types';
import { Search, Sparkles, Check } from 'lucide-react';

interface PresetGalleryProps {
  activePresetId?: string;
  onSelectPreset: (preset: Preset) => void;
}

export const PresetGallery: React.FC<PresetGalleryProps> = ({ activePresetId, onSelectPreset }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'Alle' },
    { id: 'vibrant', label: 'Vibrant' },
    { id: 'luxury', label: 'Luxury & Gold' },
    { id: 'cyber', label: 'Cyber & Neon' },
    { id: 'pastel', label: 'Pastel' },
    { id: 'natural', label: 'Natur & Aurora' },
  ];

  const filteredPresets = PRESETS.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shader.style.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search & Header */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="20+ Presets durchsuchen..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
        />
      </div>

      {/* Categories Horizontal Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 text-[11px] rounded-lg whitespace-nowrap font-medium transition ${
              activeCategory === cat.id
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of 24 Presets */}
      <div className="grid grid-cols-2 gap-2.5 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
        {filteredPresets.map((preset) => {
          const isSelected = activePresetId === preset.id;
          const bgGradient = `linear-gradient(135deg, ${preset.shader.colors.join(', ')})`;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`group relative flex flex-col p-2.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-purple-600/15 border-purple-500 ring-1 ring-purple-500/50 shadow-lg shadow-purple-950/40'
                  : 'bg-white/4 border-white/10 hover:border-white/20 hover:bg-white/7'
              }`}
            >
              {/* Preset Visual Gradient Swatch */}
              <div
                className="w-full h-20 rounded-xl relative overflow-hidden shadow-inner border border-white/10 group-hover:scale-[1.02] transition-transform duration-300"
                style={{ background: bgGradient }}
              >
                {/* Subtle sheen highlight */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />

                {/* Style badge */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-md text-[9px] font-mono uppercase text-white/90">
                  {preset.shader.style}
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="mt-2.5 flex flex-col">
                <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                  {preset.name}
                </span>
                <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 leading-tight">
                  {preset.description}
                </span>

                {/* Color dots row */}
                <div className="flex items-center gap-1 mt-2">
                  {preset.shader.colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
