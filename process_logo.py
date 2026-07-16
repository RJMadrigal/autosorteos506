from PIL import Image
import collections

img = Image.open('src/assets/logo-luxurywheels.png').convert("RGBA")
pixels = img.load()
width, height = img.size

colors = []
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if a > 128:
            # only consider colors that aren't purely grayscale
            if max(abs(r-g), abs(g-b), abs(r-b)) > 20:
                colors.append((r, g, b))

counter = collections.Counter(colors)
common = counter.most_common(5)
if not common:
    print("Logo is entirely grayscale/white/black.")
else:
    for color, count in common:
        print(f"Color: #{color[0]:02x}{color[1]:02x}{color[2]:02x} Count: {count}")
