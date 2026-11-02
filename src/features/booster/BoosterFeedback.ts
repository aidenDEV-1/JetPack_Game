import Phaser from 'phaser';

export const BOOSTER_FEEDBACK_LABEL = 'BOOST!';
export const BOOSTER_FEEDBACK_COLOR = '#52c7ff';

export function showBoosterFeedback(scene: Phaser.Scene): void {
  const label = scene.add.text(scene.scale.width / 2, scene.scale.height / 2, BOOSTER_FEEDBACK_LABEL, {
    color: BOOSTER_FEEDBACK_COLOR,
    fontFamily: 'Arial, sans-serif',
    fontSize: '42px',
    fontStyle: 'bold',
    stroke: '#07111f',
    strokeThickness: 8,
  }).setOrigin(0.5).setDepth(14);
  scene.tweens.add({
    targets: label,
    scale: 1.35,
    alpha: 0,
    duration: 650,
    ease: 'Cubic.easeOut',
    onComplete: () => label.destroy(),
  });
}

