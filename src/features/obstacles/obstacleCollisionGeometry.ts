export interface RectangleLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleLike {
  x: number;
  y: number;
  radius: number;
}

export function intersectsObstacleGeometry(
  playerBounds: RectangleLike,
  obstacleX: number,
  obstacleY: number,
  rectangles: readonly RectangleLike[],
  circles: readonly CircleLike[],
): boolean {
  const rectangleHit = rectangles.some((hitbox) => rectanglesOverlap(
    playerBounds,
    { x: obstacleX + hitbox.x, y: obstacleY + hitbox.y, width: hitbox.width, height: hitbox.height },
  ));
  if (rectangleHit) return true;
  return circles.some((circle) => circleOverlapsRectangle(
    { x: obstacleX + circle.x, y: obstacleY + circle.y, radius: circle.radius },
    playerBounds,
  ));
}

function rectanglesOverlap(first: RectangleLike, second: RectangleLike): boolean {
  return first.x < second.x + second.width
    && first.x + first.width > second.x
    && first.y < second.y + second.height
    && first.y + first.height > second.y;
}

function circleOverlapsRectangle(circle: CircleLike, rectangle: RectangleLike): boolean {
  const closestX = Math.max(rectangle.x, Math.min(circle.x, rectangle.x + rectangle.width));
  const closestY = Math.max(rectangle.y, Math.min(circle.y, rectangle.y + rectangle.height));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}
