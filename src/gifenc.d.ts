declare module 'gifenc' {
  export function GIFEncoder(options?: any): {
    writeFrame: (
      index: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: number[][];
        delay?: number;
        repeat?: number;
        transparent?: boolean;
        transparentIndex?: number;
      }
    ) => void;
    finish: () => void;
    bytes: () => Uint8Array;
    stream: any;
  };
  export function quantize(
    rgba: Uint8ClampedArray | Uint8Array,
    maxColors: number,
    options?: any
  ): number[][];
  export function applyPalette(
    rgba: Uint8ClampedArray | Uint8Array,
    palette: number[][],
    options?: any
  ): Uint8Array;
}
