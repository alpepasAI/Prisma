import sys
from PIL import Image
import os

def fix_hero(input_path, output_path):
    img = Image.open(input_path)
    width, height = img.size
    
    # Target 3000x1285 (approx 21:9)
    target_ratio = 3000 / 1285
    current_ratio = width / height
    
    if current_ratio > target_ratio:
        # Image is wider than needed - crop width
        new_width = int(height * target_ratio)
        left = (width - new_width) / 2
        img = img.crop((left, 0, left + new_width, height))
    else:
        # Image is taller than needed - crop height (center-top)
        new_height = int(width / target_ratio)
        top = (height - new_height) * 0.4  # Slightly above center
        img = img.crop((0, top, width, top + new_height))
        
    img = img.resize((3000, 1285), Image.Resampling.LANCZOS)
    img.save(output_path, "PNG", quality=95)
    print(f"Hero image saved to {output_path} (3000x1285)")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 fix_hero_crop_v2.py <input> <output>")
    else:
        fix_hero(sys.argv[1], sys.argv[2])
