export type BoosterFlightPhase = 'idle' | 'travelling-out' | 'holding' | 'travelling-back';

export interface BoosterState {
  active: boolean;
  remainingMs: number;
  tokenCount: number;
  hasShield: boolean;
}
