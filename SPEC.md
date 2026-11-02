# 5PM RUSH Visual and Collision Specification

## Coordinate system

- Logical game viewport: `1280×720`.
- The player visual height is the shared unit: `PLAYER_HEIGHT = 96px` (13.3% of the logical viewport height).
- Player sprite cells remain fixed at `384×170`; runtime display height is derived from `PLAYER_HEIGHT`.
- Player hitboxes are independent from sprite pixels and target roughly 60–70% of the visible character silhouette.

## Obstacle scale

- Laser emitter/node diameter: `0.8 × PLAYER_HEIGHT` (`77px`, rounded).
- Laser beam width: `0.25 × node diameter` (`20px` maximum target).
- Laser glow width: `0.42 × PLAYER_HEIGHT` (`40px`), visual only.
- Partial laser spans: `2.25–4 × PLAYER_HEIGHT` (`216–384px`); full spans may use the viewport boundary as an explicit full-screen exception.
- Minimum authored playable gap: `1.6 × PLAYER_HEIGHT` (`154px`).
- Laser beam collision is a thin rectangle. Emitter/node collision is a separate circle and never uses glow bounds.

## Player rendering

- Player sheet: 4 columns × 7 rows, 28 frames, `384×170` cells.
- Generated runtime sheet has at least a 2px transparent gutter on every cell edge.
- Runtime body, jetpack, flame and particles are one `PlayerEntity` hierarchy. No booster world root is allowed.
- Debug overlay is disabled by default and toggled with `D`; blue is the sprite cell and red is the hitbox.

## Booster rendering

- `isBoosting` is a player visual state, not a second player entity.
- Flame and sparks are children of `JetpackAttachment` and follow the player transform every frame.
- Booster lean target: `-12°`.
- Render order: attached flame/sparks and jetpack behind the body; body sprite next; debug/front effects above only when enabled.
