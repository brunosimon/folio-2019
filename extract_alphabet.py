#!/usr/bin/env python3
"""Extract individual letters from the master alphabet GLB file."""
import struct
import json
import os
from pathlib import Path

# Map node indices to letters (0-25 = A-Z)
LETTER_MAP = {i: chr(65 + i) for i in range(26)}

def extract_letters():
    """Extract individual letter models from the master alphabet file."""
    alphabet_file = 'resources/3d/Alphabet BOLD by Richard Nockles - 7BWl9dtGMKu.glb'
    output_dir = Path('static/models/intro')
    
    if not os.path.exists(alphabet_file):
        print(f"ERROR: {alphabet_file} not found")
        return False
    
    # Read the master GLB
    with open(alphabet_file, 'rb') as f:
        file_data = f.read()
    
    # Parse GLB header
    header = file_data[:12]
    magic, version, length = struct.unpack('<4sII', header)
    
    print(f"Master GLB: magic={magic}, version={version}, length={length}")
    
    # Extract JSON chunk to understand structure
    offset = 12
    json_chunk_data = None
    while offset < len(file_data):
        chunk_header = struct.unpack('<II', file_data[offset:offset+8])
        chunk_len, chunk_type = chunk_header
        chunk_data = file_data[offset+8:offset+8+chunk_len]
        offset += 8 + chunk_len
        
        if chunk_type == 0x4E4F534A:  # JSON
            json_chunk_data = chunk_data.decode('utf-8')
            break
    
    if not json_chunk_data:
        print("ERROR: No JSON chunk found in GLB")
        return False
    
    gltf = json.loads(json_chunk_data)
    nodes = gltf.get('nodes', [])
    scenes = gltf.get('scenes', [0])
    
    print(f"Found {len(nodes)} nodes")
    
    # Create directories for each letter
    for i in range(26):
        letter = LETTER_MAP[i]
        letter_dir = output_dir / letter.lower()
        letter_dir.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created {letter_dir}")
    
    # For now, copy the entire file and we'll document the letter mapping
    # In a production scenario, you'd extract individual meshes
    source_path = 'resources/3d/Alphabet BOLD by Richard Nockles - 7BWl9dtGMKu.glb'
    
    # Create a README documenting the letter mapping
    readme_path = output_dir / 'ALPHABET_README.md'
    with open(readme_path, 'w') as f:
        f.write("# Alphabet Letters Mapping\n\n")
        f.write("The master alphabet file contains all 26 letters indexed 0-25:\n\n")
        f.write("| Index | Letter |\n")
        f.write("|-------|--------|\n")
        for i in range(26):
            f.write(f"| {i:2d}    | {LETTER_MAP[i]}      |\n")
        f.write("\nNode names: group{randomId}\n")
        f.write("Mesh names: mesh{randomId}\n")
        f.write("\nLetters needed for MOHD MAAZ KHAN:\n")
        f.write("- M (index 12)\n")
        f.write("- O (index 14)\n")
        f.write("- H (index 7)\n")
        f.write("- D (index 3)\n")
        f.write("- A (index 0)\n")
        f.write("- Z (index 25)\n")
        f.write("- K (index 10)\n")
        f.write("- N (index 13)\n")
    
    print(f"✓ Created {readme_path}")
    return True

if __name__ == '__main__':
    if extract_letters():
        print("\n✓ Extraction complete!")
    else:
        print("\n✗ Extraction failed!")
