import * as THREE from 'three'

class AreaFloorBorderGeometry
{
    constructor(_width, _height, _thickness)
    {
        // Parameters
        this.parameters = {
            width: _width,
            height: _height,
            thickness: _thickness
        }

        // Set up
        this.type = 'AreaFloorGeometry'

        // buffers
        const length = 8

        const vertices = new Float32Array(length * 3)
        const indices = new Uint32Array(length * 6)

        const outerWidth = _width
        const outerHeight = _height

        const innerWidth = outerWidth - _thickness
        const innerHeight = outerHeight - _thickness

        // Vertices
        vertices[0 * 3 + 0] = innerWidth * 0.5
        vertices[0 * 3 + 1] = innerHeight * 0.5
        vertices[0 * 3 + 2] = 0

        vertices[1 * 3 + 0] = innerWidth * 0.5
        vertices[1 * 3 + 1] = - innerHeight * 0.5
        vertices[1 * 3 + 2] = 0

        vertices[2 * 3 + 0] = - innerWidth * 0.5
        vertices[2 * 3 + 1] = - innerHeight * 0.5
        vertices[2 * 3 + 2] = 0

        vertices[3 * 3 + 0] = - innerWidth * 0.5
        vertices[3 * 3 + 1] = innerHeight * 0.5
        vertices[3 * 3 + 2] = 0

        vertices[4 * 3 + 0] = outerWidth * 0.5
        vertices[4 * 3 + 1] = outerHeight * 0.5
        vertices[4 * 3 + 2] = 0

        vertices[5 * 3 + 0] = outerWidth * 0.5
        vertices[5 * 3 + 1] = - outerHeight * 0.5
        vertices[5 * 3 + 2] = 0

        vertices[6 * 3 + 0] = - outerWidth * 0.5
        vertices[6 * 3 + 1] = - outerHeight * 0.5
        vertices[6 * 3 + 2] = 0

        vertices[7 * 3 + 0] = - outerWidth * 0.5
        vertices[7 * 3 + 1] = outerHeight * 0.5
        vertices[7 * 3 + 2] = 0

        // Index
        indices[0 * 3 + 0] = 4
        indices[0 * 3 + 1] = 0
        indices[0 * 3 + 2] = 1

        indices[1 * 3 + 0] = 1
        indices[1 * 3 + 1] = 5
        indices[1 * 3 + 2] = 4

        indices[2 * 3 + 0] = 5
        indices[2 * 3 + 1] = 1
        indices[2 * 3 + 2] = 2

        indices[3 * 3 + 0] = 2
        indices[3 * 3 + 1] = 6
        indices[3 * 3 + 2] = 5

        indices[4 * 3 + 0] = 6
        indices[4 * 3 + 1] = 2
        indices[4 * 3 + 2] = 3

        indices[5 * 3 + 0] = 3
        indices[5 * 3 + 1] = 7
        indices[5 * 3 + 2] = 6

        indices[6 * 3 + 0] = 7
        indices[6 * 3 + 1] = 3
        indices[6 * 3 + 2] = 0

        indices[7 * 3 + 0] = 0
        indices[7 * 3 + 1] = 4
        indices[7 * 3 + 2] = 7

        const geometry = new THREE.BufferGeometry()

        // Set indices
        geometry.setIndex(new THREE.BufferAttribute(indices, 1, false))

        // Set attributes
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

        return geometry
    }
}

export default AreaFloorBorderGeometry
