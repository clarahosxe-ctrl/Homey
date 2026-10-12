"""Génère les icônes de l'app à partir de design/logo-source.jpg (python3 scripts/make-icons.py, nécessite Pillow)."""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = Image.open(root / 'design' / 'logo-source.jpg').convert('RGB')

# carré centré
w, h = src.size
s = min(w, h)
sq = src.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))

out = root / 'public'
for size, name in [(512, 'icon-512.png'), (192, 'icon-192.png'), (180, 'apple-touch-icon.png'), (64, 'favicon-64.png'), (32, 'favicon-32.png')]:
    sq.resize((size, size), Image.LANCZOS).save(out / name, optimize=True)

# Icône "maskable" (Android) : le logo est réduit pour rester dans la zone sûre (80 %),
# sur un fond dégradé reconstitué à partir des 4 coins du logo.
def corner(x, y):
    patch = sq.crop((x, y, x + 24, y + 24)).resize((1, 1), Image.BOX)
    return patch.getpixel((0, 0))

tl, tr, bl, br = corner(4, 4), corner(s - 28, 4), corner(4, s - 28), corner(s - 28, s - 28)
grad = Image.new('RGB', (2, 2)); grad.putpixel((0, 0), tl); grad.putpixel((1, 0), tr); grad.putpixel((0, 1), bl); grad.putpixel((1, 1), br)
canvas = grad.resize((512, 512), Image.BICUBIC)
fg_size = 380
fg = sq.resize((fg_size, fg_size), Image.LANCZOS)
mask = Image.new('L', (fg_size, fg_size), 0)
ImageDraw.Draw(mask).rectangle((14, 14, fg_size - 15, fg_size - 15), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(10))  # fondu des bords pour éviter toute couture
canvas.paste(fg, ((512 - fg_size) // 2, (512 - fg_size) // 2), mask)
canvas.save(out / 'icon-maskable-512.png', optimize=True)
print('ok')
