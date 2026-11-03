export type CoworkerReaction = 'walk' | 'startled' | 'duck' | 'recover';

export interface CoworkerNpcSnapshot {
  id: string;
  x: number;
  y: number;
  reaction: CoworkerReaction;
  collisionEnabled: false;
}
