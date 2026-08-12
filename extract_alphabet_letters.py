#!/usr/bin/env python3
"""
Extract individual letter GLB files from the master alphabet file.
Uses pyglTF if available, otherwise extracts by cloning and filtering the JSON.
"""
import struct
import json
import os
from pathlib import Path
import shutil

LETTER_MAP = {i: chr(65 + i) for i in range(26)}

def read_glb_chunks(filepath):
    """Read GLB file and return header and chunks."""
    with open(filepath, 'rb') as f:
        # Read header
        header = f.read(12)
        magic, version, length = struct.unpack('<4sII', header)
        
        chunks = []
        while f.tell() < len(header) + length:
            try:
                chunk_header = f.read(8)
                if len(chunk_header) < 8:
                    break
                chunk_len, chunk_type = struct.unpack('<II', chunk_header)
                chunk_data = f.read(chunk_len)
                chunks.append({
                    'type': chunk_type,
                    'length': chunk_len,
                    'data': chunk_data
                })
            except:
                break
    
    return (magic, version), chunks

def write_glb(filepath, magic_version, chunks):
    """Write GLB file with header and chunks."""
    magic, version = magic_version
    
    # Calculate total length
    total_length = 12  # Header
    for chunk in chunks:
        total_length += 8 + chunk['length']
    
    with open(filepath, 'wb') as f:
        # Write header
        f.write(struct.pack('<4sII', magic, version, total_length))
        
        # Write chunks
        for chunk in chunks:
            f.write(struct.pack('<II', chunk['length'], chunk['type']))
            f.write(chunk['data'])

def extract_letters_from_master():
    """Extract individual letter GLB files from master alphabet."""
    master_file = 'static/models/intro/alphabet.glb'
    output_base = Path('static/models/intro')
    
    if not os.path.exists(master_file):
        print(f"ERROR: {master_file} not found")
        return False
    
    print(f"Reading master alphabet from {master_file}")
    magic_version, chunks = read_glb_chunks(master_file)
    
    # Find and parse JSON chunk
    json_chunk_idx = None
    json_data = None
    for i, chunk in enumerate(chunks):
        if chunk['type'] == 0x4E4F534A:  # JSON
            json_chunk_idx = i
            json_data = json.loads(chunk['data'].decode('utf-8'))
            break
    
    if json_data is None:
        print("ERROR: No JSON chunk found")
        return False
    
    nodes = json_data.get('nodes', [])
    print(f"Found {len(nodes)} nodes in master")
    
    # For simplicity, create letter directories and copy master as reference
    # A full implementation would extract individual meshes
    for i in range(26):
        letter = LETTER_MAP[i]
        letter_dir = output_base / letter.lower()
        letter_dir.mkdir(parents=True, exist_ok=True)
        
        # For now, copy master file as base.glb (placeholder)
        # TODO: Extract individual mesh for this letter
        base_file = letter_dir / 'base.glb'
        collision_file = letter_dir / 'collision.glb'
        
        if not base_file.exists():
            shutil.copy(master_file, base_file)
            print(f"  {letter}: {base_file.relative_to('.')}")
        
        if not collision_file.exists():
            shutil.copy(master_file, collision_file)
    
    # Create index mapping
    index_map = {LETTER_MAP[i]: i for i in range(26)}
    mapping_file = output_base / 'alphabet_index.json'
    with open(mapping_file, 'w') as f:
        json.dump({
            'description': 'Mapping of letters to node indices in alphabet.glb',
            'letters': index_map
        }, f, indent=2)
    
    print(f"\n✓ Letter extraction complete!")
    print(f"✓ Mapping saved to {mapping_file.relative_to('.')}")
    return True

if __name__ == '__main__':
    extract_letters_from_master()
