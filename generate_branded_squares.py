import sys
from PIL import Image, ImageDraw, ImageFont
import os

def add_branding(base_path, output_dir, article_id):
    base_img = Image.open(base_path).convert("RGBA")
    # Force 3000x3000px
    base_img = base_img.resize((3000, 3000), Image.Resampling.LANCZOS)
    
    # Paths to logos
    al_logo_path = "assets/sources/logo-alpepas-labs.png"
    prisma_logo_path = "assets/sources/master-logo.png"
    
    if not os.path.exists(al_logo_path) or not os.path.exists(prisma_logo_path):
        print("Error: Logos not found in assets/sources/")
        return

    al_logo = Image.open(al_logo_path).convert("RGBA")
    prisma_logo = Image.open(prisma_logo_path).convert("RGBA")
    
    # Configurations
    bar_height = int(3000 * 0.15) # 15% of height
    bar_color = (10, 12, 16, 255) # Deep PRISMA dark
    
    def process_version(lang, is_short):
        canvas = Image.new("RGBA", (3000, 3000), (0,0,0,0))
        canvas.paste(base_img, (0, 0))
        
        # Draw bottom bar
        draw = ImageDraw.Draw(canvas)
        draw.rectangle([0, 3000 - bar_height, 3000, 3000], fill=bar_color)
        
        # Paste logos
        logo_h = int(bar_height * 0.7)
        
        # Alpepas Labs (Left)
        al_w = int(al_logo.width * (logo_h / al_logo.height))
        al_resized = al_logo.resize((al_w, logo_h), Image.Resampling.LANCZOS)
        canvas.paste(al_resized, (100, 3000 - bar_height + (bar_height - logo_h)//2), al_resized)
        
        # PRISMA (Right)
        p_w = int(prisma_logo.width * (logo_h / prisma_logo.height))
        p_resized = prisma_logo.resize((p_w, logo_h), Image.Resampling.LANCZOS)
        canvas.paste(p_resized, (3000 - p_w - 100, 3000 - bar_height + (bar_height - logo_h)//2), p_resized)
        
        # Add Tags (Top corners)
        badge_h = 120
        badge_font_size = 80
        # Try to load a font, fallback to default
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", badge_font_size)
        except:
            font = ImageFont.load_default()
            
        def draw_badge(text, x, y, align="left"):
            text_w = draw.textlength(text, font=font)
            padding = 40
            rect_w = text_w + padding * 2
            if align == "right":
                x -= rect_w
            
            draw.rounded_rectangle([x, y, x + rect_w, y + badge_h], radius=20, fill=(43, 203, 246, 200)) # Blue badge
            draw.text((x + padding, y + (badge_h - badge_font_size)//2), text, font=font, fill=(255,255,255,255))

        # Language Tag (Top Right)
        draw_badge(lang.upper(), 3000 - 100, 100, align="right")
        
        # Version Tag (Top Left)
        if is_short:
            tag_text = "BREVE" if lang == "es" else "SHORT"
            draw_badge(tag_text, 100, 100)
            
        # Save
        suffix = "-short" if is_short else ""
        filename = f"{article_id}-{lang}{suffix}.png"
        if lang == "es" and is_short: filename = f"{article_id}-es-breve.png" # Fix for ES-BREVE convention
            
        save_path = os.path.join(output_dir, filename)
        canvas.convert("RGB").save(save_path, "JPEG", quality=90)
        print(f"Saved: {save_path}")

    # Generate the 4 versions
    os.makedirs(output_dir, exist_ok=True)
    process_version("es", False)
    process_version("es", True)
    process_version("en", False)
    process_version("en", True)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 generate_branded_squares.py <base_image> <output_dir> <article_id>")
    else:
        add_branding(sys.argv[1], sys.argv[2], sys.argv[3])
