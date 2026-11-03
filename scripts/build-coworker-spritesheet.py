from pathlib import Path
from PIL import Image, ImageChops


root = Path(__file__).resolve().parents[1]
source = root / "public/assets/world/source/coworker-npc-source.png"
target = root / "public/assets/world/coworker-npc-spritesheet.png"
frame_width, frame_height, frame_count = 128, 170, 4

image = Image.open(source).convert("RGBA")
alpha = image.getchannel("A")
bounds = alpha.getbbox()
if bounds is None:
    raise SystemExit("coworker source has no visible pixels")

subject = image.crop(bounds)
subject.thumbnail((frame_width - 16, frame_height - 8), Image.Resampling.LANCZOS)
sheet = Image.new("RGBA", (frame_width * frame_count, frame_height), (0, 0, 0, 0))

for index in range(frame_count):
    frame = Image.new("RGBA", (frame_width, frame_height), (0, 0, 0, 0))
    x = (frame_width - subject.width) // 2 + (index % 2) * 2 - 1
    y = frame_height - subject.height - 2
    frame.alpha_composite(subject, (x, y))
    sheet.alpha_composite(frame, (index * frame_width, 0))

target.parent.mkdir(parents=True, exist_ok=True)
sheet.save(target, "PNG", optimize=True)
print(f"created {target} ({sheet.width}x{sheet.height})")
