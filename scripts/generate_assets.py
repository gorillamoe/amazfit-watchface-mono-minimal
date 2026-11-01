#!/usr/bin/env python3

from __future__ import annotations
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets/active-max/images'
SCALE = 3
SIZE = 480
WHITE = (240, 240, 240, 255)
GRAY = (191, 191, 191, 255)
DIM = (65, 65, 65, 255)
FONT_CANDIDATES = [
    '/usr/share/fonts/TTF/Lato-Light.ttf',
]
FONT_BOLD = [
    '/usr/share/fonts/TTF/Lato-Regular.ttf',
]

def font(size: int, bold=False):
    for path in (FONT_BOLD if bold else FONT_CANDIDATES):
        if Path(path).exists():
            return ImageFont.truetype(path, size * SCALE)
    return ImageFont.load_default()

def coords(seq):
    return tuple(round(v * SCALE) for v in seq)

def img(w=SIZE, h=SIZE):
    return Image.new('RGBA', (w * SCALE, h * SCALE), (0, 0, 0, 0))

def save(image, path: Path, size=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    image = image.resize(size or (image.width // SCALE, image.height // SCALE), Image.Resampling.LANCZOS)
    image.save(path)
    return image

def draw_background():
    output = Image.new('RGBA', (SIZE * SCALE, SIZE * SCALE), (0, 0, 0, 255))
    d = ImageDraw.Draw(output)
    d.line(coords((155, 251, 325, 251)), fill=(190,190,190,255), width=2*SCALE)
    return save(output, ASSETS / 'background.png')

def draw_digit_images():
    for row, color in [('hour', WHITE), ('minute', GRAY)]:
        for num in range(10):
            canvas = img(80, 112)
            d = ImageDraw.Draw(canvas)
            f = font(139, bold=False)
            glyph = str(num)
            bx = d.textbbox((0, 0), glyph, font=f)
            width = bx[2] - bx[0]
            height = bx[3] - bx[1]
            d.text(((80*SCALE - width)/2-bx[0], (112*SCALE-height)/2-bx[1]-5*SCALE), glyph, font=f, fill=color)
            save(canvas, ASSETS / f'digits/{row}/{num}.png')

def draw_battery():
    canvas = img(35, 24)
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle(coords((1, 2, 29, 22)), radius=4*SCALE, outline=WHITE, width=2*SCALE)
    d.rectangle(coords((30, 8, 33, 16)), fill=WHITE)
    save(canvas, ASSETS / 'battery-outline.png')

def draw_heart():
    canvas = img(24, 23)
    d = ImageDraw.Draw(canvas)
    pts = [(12,21), (3.1,13.2),(0.9,9.7),(1.1,5.6),(3.8,2.0),(7.5,1.0),
           (10.5,2.2),(12,4.1),(13.5,2.2),(16.5,1.0),(20.3,2.0),
           (22.9,5.8),(23.1,9.7),(20.9,13.2)]
    d.polygon([(round(x*SCALE),round(y*SCALE)) for x,y in pts], fill=GRAY)
    save(canvas, ASSETS / 'heart.png')

def draw_steps():
    canvas = img(19, 28)
    d = ImageDraw.Draw(canvas)
    d.ellipse(coords((2, 3, 10, 16)), fill=GRAY)
    d.ellipse(coords((10, 15, 16, 23)), fill=GRAY)
    d.ellipse(coords((2, 19, 6, 23)), fill=GRAY)
    d.ellipse(coords((6, 22, 11, 26)), fill=GRAY)
    save(canvas, ASSETS / 'steps.png')

def overlay(base: Image.Image, name, pos):
    el = Image.open(ASSETS/name).convert('RGBA')
    base.alpha_composite(el, pos)

if __name__ == '__main__':
    draw_background()
    draw_digit_images()
    draw_battery()
    draw_heart()
    draw_steps()
    print('Created watch-face assets and previews.')
