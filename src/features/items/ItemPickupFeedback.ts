import Phaser from 'phaser';
import type { ItemKind } from './itemTypes';

const LABELS: Record<ItemKind, string> = { coin: '+1', shield: 'SHIELD', token: 'TOKEN' };
const COLORS: Record<ItemKind, string> = { coin: '#f7c948', shield: '#52c7ff', token: '#ffffff' };

export function showItemPickupFeedback(scene: Phaser.Scene, kind: ItemKind, x: number, y: number): void {
  const popup = scene.add.text(x, y, LABELS[kind], {
    color: COLORS[kind],
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    fontStyle: 'bold',
    stroke: '#07111f',
    strokeThickness: 4,
  }).setOrigin(0.5).setDepth(12);
  scene.tweens.add({
    targets: popup,
    y: y - 38,
    alpha: 0,
    scale: 1.15,
    duration: 350,
    ease: 'Cubic.easeOut',
    onComplete: () => popup.destroy(),
  });
}

