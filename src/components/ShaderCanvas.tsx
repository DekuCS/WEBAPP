import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { ShaderConfig } from '../types';
import { VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE } from '../shader/glsl';
import { hexToRgb } from '../utils/exportEngine';

export interface ShaderCanvasRef {
  getCanvas: () => HTMLCanvasElement | null;
  renderFrameAtTime: (time: number) => void;
  renderAtResolution: (time: number, targetWidth: number, targetHeight: number) => void;
  restoreViewportResolution: () => void;
  resetTime: () => void;
}

interface ShaderCanvasProps {
  config: ShaderConfig;
  className?: string;
  currentTimeRef?: React.MutableRefObject<number>;
}

export const ShaderCanvas = forwardRef<ShaderCanvasRef, ShaderCanvasProps>(
  ({ config, className = '', currentTimeRef }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const animIdRef = useRef<number | null>(null);
    const timeRef = useRef<number>(0);
    const mousePosRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
    const targetMouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

    // Store uniform locations
    const uniformsRef = useRef<{
      time: WebGLUniformLocation | null;
      resolution: WebGLUniformLocation | null;
      colors: WebGLUniformLocation | null;
      colorCount: WebGLUniformLocation | null;
      distortion: WebGLUniformLocation | null;
      frequency: WebGLUniformLocation | null;
      grain: WebGLUniformLocation | null;
      lighting: WebGLUniformLocation | null;
      angle: WebGLUniformLocation | null;
      scale: WebGLUniformLocation | null;
      softness: WebGLUniformLocation | null;
      mouse: WebGLUniformLocation | null;
      mouseInfluence: WebGLUniformLocation | null;
      style: WebGLUniformLocation | null;
    } | null>(null);

    // Initialize WebGL Program
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const gl = canvas.getContext('webgl', {
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });

      if (!gl) {
        console.error('WebGL is not supported in this browser.');
        return;
      }
      glRef.current = gl;

      // Compile Shaders
      const compileShader = (type: number, source: string): WebGLShader | null => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('Shader compile error:', gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
      const fragmentShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

      if (!vertexShader || !fragmentShader) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
      }

      gl.useProgram(program);
      programRef.current = program;

      // Screen Quad Buffer
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const positions = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const aPosition = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      // Cache Uniform Locations
      uniformsRef.current = {
        time: gl.getUniformLocation(program, 'u_time'),
        resolution: gl.getUniformLocation(program, 'u_resolution'),
        colors: gl.getUniformLocation(program, 'u_colors'),
        colorCount: gl.getUniformLocation(program, 'u_color_count'),
        distortion: gl.getUniformLocation(program, 'u_distortion'),
        frequency: gl.getUniformLocation(program, 'u_frequency'),
        grain: gl.getUniformLocation(program, 'u_grain'),
        lighting: gl.getUniformLocation(program, 'u_lighting'),
        angle: gl.getUniformLocation(program, 'u_angle'),
        scale: gl.getUniformLocation(program, 'u_scale'),
        softness: gl.getUniformLocation(program, 'u_softness'),
        mouse: gl.getUniformLocation(program, 'u_mouse'),
        mouseInfluence: gl.getUniformLocation(program, 'u_mouse_influence'),
        style: gl.getUniformLocation(program, 'u_style'),
      };

      return () => {
        if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
        if (program) gl.deleteProgram(program);
      };
    }, []);

    // Style mapping
    const getStyleIndex = (style: ShaderConfig['style']): number => {
      switch (style) {
        case 'mesh': return 0;
        case 'liquid': return 1;
        case 'aurora': return 2;
        case 'vortex': return 3;
        case 'silk': return 4;
        case 'prismatic': return 5;
        default: return 0;
      }
    };

    // Render a single frame with explicit time
    const renderFrameAtTime = useCallback((explicitTime: number) => {
      const gl = glRef.current;
      const program = programRef.current;
      const uniforms = uniformsRef.current;
      const canvas = canvasRef.current;

      if (!gl || !program || !uniforms || !canvas) return;

      gl.useProgram(program);
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, explicitTime);
      gl.uniform1f(uniforms.distortion, config.distortion);
      gl.uniform1f(uniforms.frequency, config.frequency);
      gl.uniform1f(uniforms.grain, config.grain);
      gl.uniform1f(uniforms.lighting, config.lighting);
      gl.uniform1f(uniforms.angle, (config.angle * Math.PI) / 180);
      gl.uniform1f(uniforms.scale, config.scale);
      gl.uniform1f(uniforms.softness, config.softness);
      gl.uniform1i(uniforms.style, getStyleIndex(config.style));
      gl.uniform2f(uniforms.mouse, mousePosRef.current.x, mousePosRef.current.y);
      gl.uniform1f(uniforms.mouseInfluence, config.mouseInfluence);

      // Pass colors array
      const colorFloats: number[] = [];
      const count = Math.min(6, Math.max(2, config.colors.length));
      for (let i = 0; i < 6; i++) {
        const hex = config.colors[i % count] || '#ffffff';
        const [r, g, b] = hexToRgb(hex);
        colorFloats.push(r, g, b);
      }
      gl.uniform3fv(uniforms.colors, new Float32Array(colorFloats));
      gl.uniform1i(uniforms.colorCount, count);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }, [config]);

    // Handle canvas resize
    const handleResize = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(rect.width * dpr);
      const height = Math.floor(rect.height * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
      }
    }, []);

    useEffect(() => {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // Main animation loop
    useEffect(() => {
      let lastTimestamp = performance.now();

      const animate = (timestamp: number) => {
        const delta = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;

        if (config.isPlaying) {
          timeRef.current += delta * config.speed;
          if (currentTimeRef) {
            currentTimeRef.current = timeRef.current;
          }
        }

        // Smooth mouse pointer lerp
        mousePosRef.current.x += (targetMouseRef.current.x - mousePosRef.current.x) * 0.08;
        mousePosRef.current.y += (targetMouseRef.current.y - mousePosRef.current.y) * 0.08;

        renderFrameAtTime(timeRef.current);
        animIdRef.current = requestAnimationFrame(animate);
      };

      animIdRef.current = requestAnimationFrame(animate);

      return () => {
        if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      };
    }, [config, renderFrameAtTime, currentTimeRef]);

    // Render at explicit resolution for pristine high-res exports (1080p, 4K, retina)
    const renderAtResolution = useCallback((explicitTime: number, targetWidth: number, targetHeight: number) => {
      const gl = glRef.current;
      const program = programRef.current;
      const uniforms = uniformsRef.current;
      const canvas = canvasRef.current;

      if (!gl || !program || !uniforms || !canvas) return;

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      gl.useProgram(program);
      gl.viewport(0, 0, targetWidth, targetHeight);

      gl.uniform2f(uniforms.resolution, targetWidth, targetHeight);
      gl.uniform1f(uniforms.time, explicitTime);
      gl.uniform1f(uniforms.distortion, config.distortion);
      gl.uniform1f(uniforms.frequency, config.frequency);
      gl.uniform1f(uniforms.grain, config.grain);
      gl.uniform1f(uniforms.lighting, config.lighting);
      gl.uniform1f(uniforms.angle, (config.angle * Math.PI) / 180);
      gl.uniform1f(uniforms.scale, config.scale);
      gl.uniform1f(uniforms.softness, config.softness);
      gl.uniform1i(uniforms.style, getStyleIndex(config.style));
      gl.uniform2f(uniforms.mouse, mousePosRef.current.x, mousePosRef.current.y);
      gl.uniform1f(uniforms.mouseInfluence, config.mouseInfluence);

      const colorFloats: number[] = [];
      const count = Math.min(6, Math.max(2, config.colors.length));
      for (let i = 0; i < 6; i++) {
        const hex = config.colors[i % count] || '#ffffff';
        const [r, g, b] = hexToRgb(hex);
        colorFloats.push(r, g, b);
      }
      gl.uniform3fv(uniforms.colors, new Float32Array(colorFloats));
      gl.uniform1i(uniforms.colorCount, count);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }, [config]);

    const restoreViewportResolution = useCallback(() => {
      handleResize();
      renderFrameAtTime(timeRef.current);
    }, [handleResize, renderFrameAtTime]);

    // Pointer move listener
    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height; // WebGL Y is inverted
      targetMouseRef.current = { x, y };
    };

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      renderFrameAtTime: (t: number) => renderFrameAtTime(t),
      renderAtResolution: (t: number, w: number, h: number) => renderAtResolution(t, w, h),
      restoreViewportResolution: () => restoreViewportResolution(),
      resetTime: () => {
        timeRef.current = 0;
        renderFrameAtTime(0);
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        className={`w-full h-full block cursor-crosshair ${className}`}
      />
    );
  }
);

ShaderCanvas.displayName = 'ShaderCanvas';
