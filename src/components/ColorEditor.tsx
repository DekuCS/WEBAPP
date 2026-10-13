import React from 'react';
import { Plus, Trash2, Shuffle, ArrowLeftRight, Sparkles } from 'lucide-react';

interface ColorEditorProps {
  colors: string[];
  onChange: (newColors: string[]) => void;
}

export const ColorEditor: React.FC<ColorEditorProps> = ({ colors, onChange }) => {
  const handleColorChange = (index: number, val: string) => {
    const updated = [...colors];
    updated[index] = val;
    onChange(updated);
  };

  const addColor = () => {
    if (colors.length >= 6) return;
    // Generate a complimentary or intermediate color
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    onChange([...colors, randomHex]);
  };

  const removeColor = (index: number) => {
    if (colors.length <= 2) return;
    const updated = colors.filter((_, i) => i !== index);
    onChange(updated);
  };

  const reversePalette = () => {
    onChange([...colors].reverse());
  };

  const randomizeAll = () => {
    const palettes = [
      ['#ff007f', '#7928ca', '#00dfd8', '#ff4d4d', '#ffbe0b'],
      ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd'],
      ['#5f0f40', '#9a031e', '#fb8b24', '#e36414', '#0f4c5c'],
      ['#2b2d42', '#8d99ae', '#edf2f4', '#ef233c', '#d90429'],
      ['#03071e', '#370617', '#6a040f', '#9d0208', '#d00000', '#dc2f02'],
      ['#051923', '#003554', '#006494', '#0582ca', '#00a6fb'],
      ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'],
      ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0'],
      ['#220901', '#621708', '#941b0c', '#bc3908', '#f6aa1c'],
      ['#0a0908', '#22333b', '#eae0d5', '#c6ac8f', '#5e503f'],
      ['#3d5a80', '#98c1d9', '#e0fbfc', '#ee6c4d', '#293241'],
      ['#132a13', '#31572c', '#4f772d', '#90a955', '#ecf39e'],
    ];
    const pick = palettes[Math.floor(Math.random() * palettes.length)];
    onChange(pick);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>Farbpalette</span>
          <span className="text-slate-500 font-mono text-[10px]">({colors.length}/6 Stops)</span>
        </label>
        <div className="flex items-center gap-1">
          <button
            onClick={randomizeAll}
            title="Zufällige Palette"
            className="p-1.5 text-xs rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition flex items-center gap-1"
          >
            <Shuffle className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px]">Zufall</span>
          </button>
          <button
            onClick={reversePalette}
            title="Palette umkehren"
            className="p-1.5 text-xs rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Palette Strip Preview */}
      <div
        className="h-7 w-full rounded-lg border border-white/10 shadow-inner overflow-hidden flex"
        style={{
          background: `linear-gradient(to right, ${colors.join(', ')})`,
        }}
      />

      {/* Individual Color Stops */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {colors.map((color, index) => (
          <div
            key={index}
            className="group relative flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all shadow-sm"
          >
            {/* Color Swatch Circle with input overlay */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-md ring-2 ring-white/10 group-hover:ring-purple-400 transition">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="absolute -top-4 -left-4 w-16 h-16 cursor-pointer opacity-0"
              />
              <div
                className="w-full h-full pointer-events-none"
                style={{ backgroundColor: color }}
              />
            </div>

            {/* Hex label */}
            <span className="mt-2 text-[10px] font-mono text-slate-300 tracking-wider">
              {color.toUpperCase()}
            </span>

            {/* Stop number badge */}
            <span className="text-[9px] text-slate-500 mt-0.5 font-sans">
              #{index + 1}
            </span>

            {/* Delete button (if more than 2 colors) */}
            {colors.length > 2 && (
              <button
                onClick={() => removeColor(index)}
                className="opacity-0 group-hover:opacity-100 transition absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600/90 text-white flex items-center justify-center hover:bg-rose-500 shadow"
                title="Farbe entfernen"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        ))}

        {/* Add Color Button */}
        {colors.length < 6 && (
          <button
            onClick={addColor}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-white/20 hover:border-purple-400/60 bg-white/2 hover:bg-white/5 text-slate-400 hover:text-white transition group min-h-[76px]"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-purple-500/20 flex items-center justify-center transition">
              <Plus className="w-4 h-4 text-slate-400 group-hover:text-purple-300" />
            </div>
            <span className="mt-2 text-[10px] font-medium text-slate-400 group-hover:text-slate-200">
              + Stop
            </span>
          </button>
        )}
      </div>

      {/* Preset Harmonies */}
      <div className="pt-2 border-t border-white/5">
        <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Farb-Harmonien:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { name: 'Nuvio Neo', colors: ['#0f0c29', '#302b63', '#ff007f', '#00f2fe'] },
            { name: 'Pure Gold', colors: ['#1c1409', '#b38728', '#fbf5b7', '#da9b37'] },
            { name: 'Bio Lime', colors: ['#050e03', '#1b4332', '#39ff14', '#b8ff00'] },
            { name: 'Lilac Dusk', colors: ['#1e1b2e', '#6d597a', '#b56576', '#eaac8b'] },
            { name: 'Deep Cyber', colors: ['#020024', '#090979', '#00d4ff', '#ff007f'] },
          ].map((theme, i) => (
            <button
              key={i}
              onClick={() => onChange(theme.colors)}
              className="text-[10px] px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/15 transition flex items-center gap-1.5"
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[theme.colors.length - 1]})`,
                }}
              />
              {theme.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
