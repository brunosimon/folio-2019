import * as THREE from 'three'

// AreaFenceBufferGeometry
class AreaFenceBufferGeometry
{
    constructor(_width, _height, _depth,)
    {
        // Parameters
        this.parameters = {
            width: _width,
            height: _height,
            depth: _depth
        }

        // Set up
        this.type = 'AreaFloorBufferGeometry'

        // buffers
        const length = 8

        const vertices = new Float32Array(length * 3)
        const uvs = new Uint32Array(length * 2)
        const indices = new Uint32Array(length * 6)

        // Vertices
        vertices[0 * 3 + 0] = _width * 0.5
        vertices[0 * 3 + 1] = _height * 0.5
        vertices[0 * 3 + 2] = 0

        vertices[1 * 3 + 0] = _width * 0.5
        vertices[1 * 3 + 1] = - _height * 0.5
        vertices[1 * 3 + 2] = 0

        vertices[2 * 3 + 0] = - _width * 0.5
        vertices[2 * 3 + 1] = - _height * 0.5
        vertices[2 * 3 + 2] = 0

        vertices[3 * 3 + 0] = - _width * 0.5
        vertices[3 * 3 + 1] = _height * 0.5
        vertices[3 * 3 + 2] = 0

        vertices[4 * 3 + 0] = _width * 0.5
        vertices[4 * 3 + 1] = _height * 0.5
        vertices[4 * 3 + 2] = _depth

        vertices[5 * 3 + 0] = _width * 0.5
        vertices[5 * 3 + 1] = - _height * 0.5
        vertices[5 * 3 + 2] = _depth

        vertices[6 * 3 + 0] = - _width * 0.5
        vertices[6 * 3 + 1] = - _height * 0.5
        vertices[6 * 3 + 2] = _depth

        vertices[7 * 3 + 0] = - _width * 0.5
        vertices[7 * 3 + 1] = _height * 0.5
        vertices[7 * 3 + 2] = _depth

        // Uvs
        uvs[0 * 2 + 0] = 0
        uvs[0 * 2 + 1] = 0

        uvs[1 * 2 + 0] = 1 / 3
        uvs[1 * 2 + 1] = 0

        uvs[2 * 2 + 0] = 1 / 3 * 2
        uvs[2 * 2 + 1] = 0

        uvs[3 * 2 + 0] = 1
        uvs[3 * 2 + 1] = 0

        uvs[4 * 2 + 0] = 0
        uvs[4 * 2 + 1] = 1

        uvs[5 * 2 + 0] = 1 / 3
        uvs[5 * 2 + 1] = 1

        uvs[6 * 2 + 0] = 1 / 3 * 2
        uvs[6 * 2 + 1] = 1

        uvs[7 * 2 + 0] = 1
        uvs[7 * 2 + 1] = 1

        // Index
        indices[0 * 3 + 0] = 0
        indices[0 * 3 + 1] = 4
        indices[0 * 3 + 2] = 1

        indices[1 * 3 + 0] = 5
        indices[1 * 3 + 1] = 1
        indices[1 * 3 + 2] = 4

        indices[2 * 3 + 0] = 1
        indices[2 * 3 + 1] = 5
        indices[2 * 3 + 2] = 2

        indices[3 * 3 + 0] = 6
        indices[3 * 3 + 1] = 2
        indices[3 * 3 + 2] = 5

        indices[4 * 3 + 0] = 2
        indices[4 * 3 + 1] = 6
        indices[4 * 3 + 2] = 3

        indices[5 * 3 + 0] = 7
        indices[5 * 3 + 1] = 3
        indices[5 * 3 + 2] = 6

        indices[6 * 3 + 0] = 3
        indices[6 * 3 + 1] = 7
        indices[6 * 3 + 2] = 0

        indices[7 * 3 + 0] = 4
        indices[7 * 3 + 1] = 0
        indices[7 * 3 + 2] = 7

        const geometry = new THREE.BufferGeometry()

        // Set indices
        geometry.setIndex(new THREE.BufferAttribute(indices, 1, false))

        // Set attributes
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

        return geometry
    }
}

export default AreaFenceBufferGeometry
