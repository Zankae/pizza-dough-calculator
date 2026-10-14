from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1] / "public"
for filename, size in [("icon-192.png", 192), ("icon-512.png", 512), ("icon-maskable-512.png", 512), ("apple-touch-icon.png", 180)]:
    scale = 4
    canvas = Image.new("RGB", (size * scale, size * scale), "#df392b")
    draw = ImageDraw.Draw(canvas)
    factor = size * scale / 128
    def point(x, y): return (round(x * factor), round(y * factor))
    # A centered original pizza illustration, inside the maskable safe area.
    def p(x, y): return point(64 + (x - 64) * .82, 64 + (y - 64) * .82)
    draw.polygon([p(30, 28), p(98, 28), p(64, 106)], fill="#f6cf4e")
    draw.line([p(30, 28), p(64, 106), p(98, 28)], fill="#171716", width=round(5 * factor), joint="curve")
    curve = []
    for i in range(101):
        t = i / 100
        curve.append(p((1-t)**2*30+2*(1-t)*t*64+t*t*98, (1-t)**2*28+2*(1-t)*t*12+t*t*28))
    draw.line(curve, fill="#e7a95c", width=round(12 * factor), joint="curve")
    for x, y, radius, color in [(56, 46, 9, "#df392b"), (77, 60, 8, "#df392b"), (62, 80, 7, "#df392b"), (76, 38, 3, "#446948"), (48, 60, 3, "#446948")]:
        draw.ellipse([p(x-radius, y-radius), p(x+radius, y+radius)], fill=color)
    canvas.resize((size, size), Image.Resampling.LANCZOS).save(root / filename)
    print(filename, size)
