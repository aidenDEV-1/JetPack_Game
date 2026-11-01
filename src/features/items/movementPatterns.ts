import type { TokenPattern } from './itemTypes';

export interface Point { x: number; y: number; }
export interface Origin { x: number; y: number; }

export function selectTokenPattern(random: () => number = Math.random): TokenPattern {
  const patterns: TokenPattern[] = ['vertical', 'horizontal', 'wave', 'orbit'];
  return patterns[Math.min(patterns.length - 1, Math.floor(random() * patterns.length))];
}

export function getTokenPosition(pattern: TokenPattern, origin: Origin, elapsedMs: number, amplitude = 42): Point {
  const time = elapsedMs / 1000;
  switch (pattern) {
    case 'vertical':
      return { x: origin.x, y: origin.y + Math.sin(time * 2.2) * amplitude };
    case 'horizontal':
      return { x: origin.x + Math.sin(time * 1.8) * amplitude, y: origin.y };
    case 'wave':
      return { x: origin.x + Math.cos(time * 1.4) * amplitude, y: origin.y + Math.sin(time * 2.5) * amplitude };
    case 'orbit':
      return { x: origin.x + Math.cos(time * 1.6) * amplitude, y: origin.y + Math.sin(time * 1.6) * amplitude };
  }
}
