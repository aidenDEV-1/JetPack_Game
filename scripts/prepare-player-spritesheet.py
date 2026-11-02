#!/usr/bin/env python3
"""Normalize player sheet cells without modifying the source image.

The source artwork is not a strict grid: a few poses cross the nominal
384px cell boundary. Cropping cells independently therefore cuts off a hand,
hat, or exhaust and leaves the remainder in the next Phaser frame. We find
the four largest connected artwork components in each row, then re-center each
pose inside a transparent cell with a 2px gutter. Small components touching a
row boundary are deliberately excluded because they are frame bleed from the
neighboring source pose.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


FRAME_WIDTH = 384
FRAME_HEIGHT = 170
FRAME_COLUMNS = 4
FRAME_ROWS = 7
GUTTER = 2


def normalize(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGBA")
    expected = (FRAME_WIDTH * FRAME_COLUMNS, FRAME_HEIGHT * FRAME_ROWS)
    if image.size != expected:
        raise ValueError(f"expected {expected}, got {image.size}")

    output = Image.new("RGBA", expected, (0, 0, 0, 0))
    pixels = image.load()

    for row in range(FRAME_ROWS):
        row_top = row * FRAME_HEIGHT
        row_bottom = min(image.height, row_top + FRAME_HEIGHT)
        components = connected_components(pixels, image.width, row_top, row_bottom)
        primary = sorted(components, reverse=True)[:FRAME_COLUMNS]
        primary.sort(key=lambda component: component[1][0])

        for column, (_, main_box) in enumerate(primary):
            # The large connected component is the pose itself. Small pieces
            # touching a row boundary belong to a neighboring source frame;
            # leaving them out is what prevents frame bleed in Phaser.
            bounds = main_box
            content = image.crop(bounds)
            max_width = FRAME_WIDTH - GUTTER * 2
            max_height = FRAME_HEIGHT - GUTTER * 2
            scale = min(max_width / content.width, max_height / content.height, 1.0)
            if scale < 1.0:
                content = content.resize(
                    (max(1, round(content.width * scale)), max(1, round(content.height * scale))),
                    Image.Resampling.LANCZOS,
                )
            x = column * FRAME_WIDTH + (FRAME_WIDTH - content.width) // 2
            original_top = bounds[1] - row_top
            y = row_top + max(GUTTER, min(FRAME_HEIGHT - GUTTER - content.height, original_top))
            output.alpha_composite(content, (x, y))

    destination.parent.mkdir(parents=True, exist_ok=True)
    output.save(destination, format="PNG", optimize=True)


def connected_components(pixels, width: int, top: int, bottom: int):
    seen = set()
    components = []
    for y in range(top, bottom):
        for x in range(width):
            if (x, y) in seen or pixels[x, y][3] <= 8:
                continue
            stack = [(x, y)]
            seen.add((x, y))
            points = []
            while stack:
                current_x, current_y = stack.pop()
                points.append((current_x, current_y))
                for next_x, next_y in (
                    (current_x + 1, current_y),
                    (current_x - 1, current_y),
                    (current_x, current_y + 1),
                    (current_x, current_y - 1),
                ):
                    if not (0 <= next_x < width and top <= next_y < bottom):
                        continue
                    if (next_x, next_y) in seen or pixels[next_x, next_y][3] <= 8:
                        continue
                    seen.add((next_x, next_y))
                    stack.append((next_x, next_y))
            if len(points) > 20:
                xs = [point[0] for point in points]
                ys = [point[1] for point in points]
                components.append((len(points), (min(xs), min(ys), max(xs) + 1, max(ys) + 1)))
    return components


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    normalize(args.source, args.destination)


if __name__ == "__main__":
    main()
