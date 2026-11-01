export interface MotionInput {
  y: number;
  velocityY: number;
  deltaSeconds: number;
  thrusting: boolean;
  floorY: number;
  ceilingY: number;
  gravity: number;
  liftAcceleration: number;
  maxUpwardVelocity: number;
  ceilingBounceVelocity: number;
}

export interface MotionResult {
  y: number;
  velocityY: number;
  grounded: boolean;
  ceilingBounced: boolean;
}

export function updateRunMotion(input: MotionInput): MotionResult {
  const acceleration = input.thrusting ? input.liftAcceleration : input.gravity;
  let velocityY = input.velocityY + acceleration * input.deltaSeconds;
  if (input.thrusting) velocityY = Math.max(input.maxUpwardVelocity, velocityY);

  const y = input.y + velocityY * input.deltaSeconds;
  if (y <= input.ceilingY) {
    return { y: input.ceilingY, velocityY: input.ceilingBounceVelocity, grounded: false, ceilingBounced: true };
  }
  if (y >= input.floorY) {
    return { y: input.floorY, velocityY: 0, grounded: !input.thrusting, ceilingBounced: false };
  }
  return { y, velocityY, grounded: false, ceilingBounced: false };
}
