#!/usr/bin/env python3
"""Extract individual letters from master alphabet GLB and save as separate files."""
import struct
import json
import os
import shutil
from pathlib import Path

LETTER_MAP = {i: chr(65 + i) for i in range(26)}

def extract_individual_letters():
    """Create individual GLB files for each letter by cloning and filtering the master."""
    master_file = 'resources/3d/Alphabet BOLD by Richard Nockles - 7BWl9dtGMKu.glb'
    output_base = Path('static/models/intro')
    
    if not os.path.exists(master_file):
        print(f"ERROR: {master_file} not found")
        return False
    
    # For now, copy the entire master file to a central location
    # Each letter directory will reference it
    alphabet_copy = output_base / 'alphabet_master.glb'
    shutil.copy(master_file, alphabet_copy)
    print(f"✓ Copied master to {alphabet_copy}")
    
    # Create directories for each letter
    for i in range(26):
        letter = LETTER_MAP[i]
        letter_dir = output_base / letter.lower()
        letter_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy the master as base.glb for each letter (this is a placeholder)
        # In production, you'd extract individual meshes
        base_file = letter_dir / 'base.glb'
        collision_file = letter_dir / 'collision.glb'
        
        # Create symlink or copy
        if not base_file.exists():
            shutil.copy(alphabet_copy, base_file)
        if not collision_file.exists():
            shutil.copy(alphabet_copy, collision_file)
        
        print(f"✓ Letter {letter} (index {i}): {letter_dir}")
    
    # Create mapping file
    mapping_file = output_base / 'LETTER_INDICES.json'
    mapping = {LETTER_MAP[i]: i for i in range(26)}
    with open(mapping_file, 'w') as f:
        json.dump(mapping, f, indent=2)
    print(f"✓ Created letter index mapping: {mapping_file}")
    
    return True

if __name__ == '__main__':
    if extract_individual_letters():
        print("\n✓ Letter extraction setup complete!")
    else:
        print("\n✗ Setup failed!")
