import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ShaderConfig, TextConfig, Preset, AspectRatio } from './types';
import { PRESETS } from './data/presets';
import { DEFAULT_TEXT_CONFIG } from './data/textPresets';
import { ShaderCanvas, ShaderCanvasRef } from './components/ShaderCanvas';
import { TextOverlay } from './components/TextOverlay';
import { Header } from './components/Header';
import { ColorEditor } from './components/ColorEditor';
import { ShaderControls } from './components/ShaderControls';
import { TypographyControls } from './components/TypographyControls';
import { PresetGallery } from './components/PresetGallery';
import { ExportModal } from './components/ExportModal';
import { 
  Palette, 
  Sliders, 
  Type, 
  Sparkles, 
  PanelRightClose, 
  PanelRightOpen, 
  MousePointer2, 
  Layers, 
  Maximize2, 
  Compass, 
  Play, 
  Pause 
} from 'lucide-react';

export default function App() {
  const initialPreset = PRESETS[0];

  const [shaderConfig, setShaderConfig] = useState<ShaderConfig>({
    ...initialPreset.shader,
    isPlaying: true,
  });

  const [textConfig, setTextConfig] = useState<TextConfig>({
    ...DEFAULT_TEXT_CONFIG,
    ...(initialPreset.text || {}),
  });

  const [activePreset, setActivePreset] = useState<Preset>(initialPreset);
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'shader' | 'text'>('presets');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [showInspector, setShowInspector] = useState<boolean>(true);

  const canvasRef = useRef<ShaderCanvasRef | null>(null);
  const currentTimeRef = useRef<number>(0);

  // Apply a preset
  const handleSelectPreset = (preset: Preset) => {
    setActivePreset(preset);
    setShaderConfig((prev) => ({
      ...prev,
      ...preset.shader,
      isPlaying: prev.isPlaying,
    }));

    if (preset.text) {
      setTextConfig((prev) => ({
        ...prev,
        ...preset.text,
      }));
    }
  };

  // Randomize colors, angle, and distortion
  const handleRandomize = useCallback(() => {
    const randomHex = () =>
      '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const colorCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 colors
    const colors = Array.from({ length: colorCount }, () => randomHex());

    setShaderConfig((prev) => ({
      ...prev,
      colors,
      angle: Math.floor(Math.random() * 360),
      distortion: parseFloat((0.8 + Math.random() * 0.9).toFixed(2)),
      speed: parseFloat((0.6 + Math.random() * 0.8).toFixed(2)),
      frequency: parseFloat((0.9 + Math.random() * 1.0).toFixed(2)),
    }));
  }, []);

  // Reset to default preset
  const handleReset = () => {
    handleSelectPreset(PRESETS[0]);
  };

  // Toggle play/pause
  const handleTogglePlay = () => {
    setShaderConfig((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        handleRandomize();
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen((prev) => !prev);
      } else if (e.key === 'e' || e.key === 'E') {
        setIsExportOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRandomize]);

  // Aspect ratio wrapper styles
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case '2:3':
        return 'aspect-[2/3] max-h-[85vh] max-w-[56.6vh] rounded-3xl shadow-2xl';
      case '1:1':
        return 'aspect-square max-h-[85vh] max-w-[85vh] rounded-3xl shadow-2xl';
      case '16:9':
        return 'aspect-video max-h-[85vh] max-w-[90vw] rounded-3xl shadow-2xl';
      case '9:16':
        return 'aspect-[9/16] max-h-[85vh] max-w-[50vh] rounded-3xl shadow-2xl';
      case '4:5':
        return 'aspect-[4/5] max-h-[85vh] max-w-[68vh] rounded-3xl shadow-2xl';
      case '21:9':
        return 'aspect-[21/9] max-h-[75vh] max-w-[92vw] rounded-3xl shadow-2xl';
      case 'free':
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0c10] text-slate-100 select-none">
      {/* Top Navigation */}
      {!isFullscreen && (
        <Header
          isPlaying={shaderConfig.isPlaying}
          onTogglePlay={handleTogglePlay}
          onRandomize={handleRandomize}
          onReset={handleReset}
          aspectRatio={aspectRatio}
          onChangeAspectRatio={setAspectRatio}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(true)}
          onOpenExport={() => setIsExportOpen(true)}
        />
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left / Center: Interactive Canvas Viewport */}
        <main
          className={`flex-1 relative flex items-center justify-center bg-[#07080b] p-2 md:p-6 transition-all duration-300 ${
            isFullscreen ? 'p-0' : ''
          }`}
        >
          {/* Subtle canvas background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e2230_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

          {/* Canvas Wrapper Container */}
          <div
            className={`relative overflow-hidden border border-white/10 transition-all duration-300 flex items-center justify-center ${
              isFullscreen ? 'w-full h-full rounded-0 border-none' : getAspectRatioClasses()
            }`}
          >
            {/* The Real Hardware-Accelerated 3D WebGL Shader Canvas */}
            <ShaderCanvas
              ref={canvasRef}
              config={shaderConfig}
              currentTimeRef={currentTimeRef}
              className="w-full h-full"
            />

            {/* Typography Overlay (Real-time with Rainbow & Palette-matched effects) */}
            <TextOverlay config={textConfig} shaderColors={shaderConfig.colors} />

            {/* In-Canvas Floating Quick Controls */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-auto">
              <div className="glass-panel-subtle px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-3 text-xs text-slate-300 shadow-lg">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>WebGL 60 FPS</span>
                </span>
                <span className="text-white/20">|</span>
                <span className="font-mono text-[11px] text-purple-300 uppercase">
                  {shaderConfig.style} Flow
                </span>
                <span className="text-white/20">|</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-slate-400" />
                  <span>{shaderConfig.angle}°</span>
                </span>
              </div>
            </div>

            {/* Exit Fullscreen Floating Button */}
            {isFullscreen && (
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-xl glass-panel text-xs text-white border border-white/20 hover:bg-white/10 transition flex items-center gap-1.5 shadow-xl"
              >
                <span>Vollbild beenden (Esc)</span>
              </button>
            )}
          </div>

          {/* Toggle Inspector Floating Button (Mobile / Desktop) */}
          {!isFullscreen && (
            <button
              onClick={() => setShowInspector((prev) => !prev)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white border border-white/15 shadow-xl hover:bg-white/10 transition"
              title={showInspector ? 'Panel schließen' : 'Panel öffnen'}
            >
              {showInspector ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          )}
        </main>

        {/* Right: Studio Inspector Panel */}
        {!isFullscreen && showInspector && (
          <aside className="w-full sm:w-96 md:w-[420px] h-full glass-panel border-l border-white/10 flex flex-col z-20 shrink-0 transition-all duration-300">
            {/* Inspector Navigation Tabs */}
            <div className="flex items-center border-b border-white/10 p-2 gap-1 bg-white/2 shrink-0">
              {[
                { id: 'presets', label: '20+ Presets', icon: <Sparkles className="w-3.5 h-3.5" /> },
                { id: 'colors', label: 'Farben', icon: <Palette className="w-3.5 h-3.5" /> },
                { id: 'shader', label: '3D Shader', icon: <Sliders className="w-3.5 h-3.5" /> },
                { id: 'text', label: 'Typografie', icon: <Type className="w-3.5 h-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Body View */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 scrollbar-thin">
              {activeTab === 'presets' && (
                <PresetGallery
                  activePresetId={activePreset.id}
                  onSelectPreset={handleSelectPreset}
                />
              )}

              {activeTab === 'colors' && (
                <ColorEditor
                  colors={shaderConfig.colors}
                  onChange={(colors) => setShaderConfig((prev) => ({ ...prev, colors }))}
                />
              )}

              {activeTab === 'shader' && (
                <ShaderControls
                  config={shaderConfig}
                  onChange={(updated) => setShaderConfig((prev) => ({ ...prev, ...updated }))}
                />
              )}

              {activeTab === 'text' && (
                <TypographyControls
                  config={textConfig}
                  onChange={(updated) => setTextConfig((prev) => ({ ...prev, ...updated }))}
                  shaderColors={shaderConfig.colors}
                />
              )}
            </div>

            {/* Bottom Quick Preset Info & Export Prompt */}
            <div className="p-3.5 border-t border-white/10 bg-white/3 flex items-center justify-between shrink-0">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-medium">Aktives Preset:</span>
                <span className="text-xs font-bold text-white font-['Syne']">
                  {activePreset.name}
                </span>
              </div>
              <button
                onClick={() => setIsExportOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold transition"
              >
                Als GIF / PNG sichern →
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Export Modal Component */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        glCanvas={canvasRef.current ? canvasRef.current.getCanvas() : null}
        renderFrameAtTime={(t) => {
          if (canvasRef.current) canvasRef.current.renderFrameAtTime(t);
        }}
        renderAtResolution={(t, w, h) => {
          if (canvasRef.current) canvasRef.current.renderAtResolution(t, w, h);
        }}
        restoreViewportResolution={() => {
          if (canvasRef.current) canvasRef.current.restoreViewportResolution();
        }}
        currentTime={currentTimeRef.current}
        shaderConfig={shaderConfig}
        textConfig={textConfig}
        activePresetName={activePreset.name}
      />
    </div>
  );
}
