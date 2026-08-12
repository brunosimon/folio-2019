import os, struct, json
path = 'resources\\3d\\Alphabet BOLD by Richard Nockles - 7BWl9dtGMKu.glb'
if not os.path.exists(path):
    raise SystemExit('MISSING')
with open(path,'rb') as f:
    header = f.read(12)
    magic, version, length = struct.unpack('<4sII', header)
    print('magic', magic, 'version', version, 'length', length)
    while f.tell() < length:
        chunk_header = f.read(8)
        if not chunk_header:
            break
        chunk_len, chunk_type = struct.unpack('<II', chunk_header)
        chunk_data = f.read(chunk_len)
        if chunk_type == 0x4E4F534A:
            data = json.loads(chunk_data.decode('utf-8'))
            nodes = data.get('nodes', [])
            meshes = data.get('meshes', [])
            print('nodes', len(nodes), 'meshes', len(meshes))
            for i, node in enumerate(nodes):
                print(i, node.get('name'), node.get('mesh'), node.get('children'))
            print('---')
            for i, mesh in enumerate(meshes):
                print(i, repr(mesh.get('name', '')), len(mesh.get('primitives', [])))
            break
