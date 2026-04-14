"""Generate extension icons at 16, 48, 128 + store 128 and a promo tile.

Icon design: rounded red square (YouTube accent) with a white document mark
whose "lines" evoke transcript text, and a small play glyph overlaid.

Copyright (c) 2026 DigitalGods. All rights reserved.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

HERE = Path(__file__).parent
ICON_DIR = HERE / "icons"
STORE_DIR = HERE / "store"
ICON_DIR.mkdir(exist_ok=True)
STORE_DIR.mkdir(exist_ok=True)

RED = (204, 0, 0, 255)
RED_DARK = (143, 0, 0, 255)
WHITE = (255, 255, 255, 255)
INK = (30, 30, 30, 255)


def rounded_rect(size, radius, fill):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=fill)
    return img


def build_icon(size: int) -> Image.Image:
    # Oversample for crisp anti-aliasing.
    scale = 4
    S = size * scale
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))

    # Background: rounded red square with subtle inner gradient hint.
    bg = rounded_rect(S, int(S * 0.22), RED)
    img.alpha_composite(bg)

    # Subtle inner highlight at top (fake gradient).
    hl = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(hl).rounded_rectangle(
        (0, 0, S - 1, int(S * 0.55)),
        radius=int(S * 0.22),
        fill=(255, 255, 255, 24),
    )
    img.alpha_composite(hl)

    d = ImageDraw.Draw(img)

    # Document card: off-center so the play glyph can sit top-right.
    pad = int(S * 0.18)
    card_w = int(S * 0.58)
    card_h = int(S * 0.64)
    card_x = pad
    card_y = int(S * 0.22)
    d.rounded_rectangle(
        (card_x, card_y, card_x + card_w, card_y + card_h),
        radius=int(S * 0.05),
        fill=WHITE,
    )
    # Folded corner.
    fold = int(S * 0.12)
    d.polygon(
        [
            (card_x + card_w - fold, card_y),
            (card_x + card_w, card_y + fold),
            (card_x + card_w - fold, card_y + fold),
        ],
        fill=(220, 220, 220, 255),
    )

    # Transcript lines.
    line_left = card_x + int(S * 0.06)
    line_right_full = card_x + card_w - int(S * 0.06)
    line_thickness = max(2, int(S * 0.035))
    top = card_y + int(S * 0.14)
    gap = int(S * 0.10)
    lengths = [1.0, 0.78, 0.92, 0.65]  # fraction of usable width
    usable = line_right_full - line_left
    for i, frac in enumerate(lengths):
        y = top + i * gap
        d.rounded_rectangle(
            (line_left, y, line_left + int(usable * frac), y + line_thickness),
            radius=line_thickness // 2,
            fill=INK,
        )

    # Play circle, bottom-right overlap.
    pr = int(S * 0.30)
    pcx = int(S * 0.76)
    pcy = int(S * 0.74)
    d.ellipse(
        (pcx - pr, pcy - pr, pcx + pr, pcy + pr),
        fill=RED_DARK,
        outline=WHITE,
        width=max(2, int(S * 0.035)),
    )
    # Triangle inside circle.
    tri_r = int(pr * 0.55)
    d.polygon(
        [
            (pcx - tri_r // 2, pcy - tri_r),
            (pcx - tri_r // 2, pcy + tri_r),
            (pcx + tri_r, pcy),
        ],
        fill=WHITE,
    )

    return img.resize((size, size), Image.LANCZOS)


def build_promo_tile() -> Image.Image:
    # 440x280 small promo tile (Chrome Web Store optional but nice).
    W, H = 440, 280
    img = Image.new("RGBA", (W, H), (18, 18, 20, 255))
    # Soft red halo on the left.
    halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(halo).ellipse((-120, -80, 320, 360), fill=(204, 0, 0, 70))
    halo = halo.filter(ImageFilter.GaussianBlur(40))
    img.alpha_composite(halo)

    icon = build_icon(160)
    img.alpha_composite(icon, (28, (H - 160) // 2))

    d = ImageDraw.Draw(img)
    try:
        from PIL import ImageFont

        font_title = ImageFont.truetype("segoeuib.ttf", 30)
        font_sub = ImageFont.truetype("segoeui.ttf", 16)
    except Exception:
        font_title = None
        font_sub = None

    d.text(
        (210, 96),
        "YT Transcript\nGrabber",
        font=font_title,
        fill=WHITE,
        spacing=4,
    )
    d.text(
        (212, 180),
        "One click: copy & download the\nYouTube transcript on any video.",
        font=font_sub,
        fill=(210, 210, 210, 255),
        spacing=4,
    )
    return img


def main():
    for size in (16, 32, 48, 128):
        build_icon(size).save(ICON_DIR / f"icon{size}.png")
    # Store-required 128 icon (identical to icons/icon128 but stored for clarity).
    build_icon(128).save(STORE_DIR / "store-icon-128.png")
    build_promo_tile().save(STORE_DIR / "promo-tile-440x280.png")
    print("Icons written:", sorted(p.name for p in ICON_DIR.iterdir()))
    print("Store assets:", sorted(p.name for p in STORE_DIR.iterdir()))


if __name__ == "__main__":
    main()
