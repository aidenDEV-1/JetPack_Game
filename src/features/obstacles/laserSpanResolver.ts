import type { LaserSpanSpec, ResolvedLaserGeometry } from './obstacleTypes';

export interface LaserViewport {
  width: number;
  ceilingY: number;
  floorY: number;
}

export function resolveLaserGeometry(
  spec: LaserSpanSpec,
  viewport: LaserViewport,
  random: () => number,
): ResolvedLaserGeometry {
  const fullLength = spec.orientation === 'vertical'
    ? viewport.floorY - viewport.ceilingY
    : viewport.width + spec.margin * 2;
  const length = resolveLength(spec, fullLength, random);
  const start = -length / 2;
  const end = length / 2;
  return {
    orientation: spec.orientation,
    length,
    collisionLength: length,
    start,
    end,
    center: spec.orientation === 'vertical'
      ? { x: 0, y: (viewport.ceilingY + viewport.floorY) / 2 }
      : { x: 0, y: 0 },
  };
}

function resolveLength(spec: LaserSpanSpec, fullLength: number, random: () => number): number {
  if (spec.mode === 'full') return fullLength;
  if (spec.mode === 'fixed') {
    if (!spec.length || spec.length <= 0) throw new Error('Fixed laser span requires a positive length');
    return Math.min(fullLength, spec.length);
  }
  if (!spec.minLength || !spec.maxLength || spec.minLength <= 0 || spec.maxLength < spec.minLength) {
    throw new Error('Random laser span requires valid minLength and maxLength');
  }
  if (spec.minLength > fullLength) throw new Error('Random laser span minLength exceeds the playable span');
  const fullSpanChance = Math.max(0, Math.min(1, spec.fullSpanChance ?? 0));
  if (random() < fullSpanChance) return fullLength;
  const maxLength = Math.min(fullLength, spec.maxLength);
  return spec.minLength + (maxLength - spec.minLength) * Math.max(0, Math.min(1, random()));
}
