import * as THREE from 'three'

import shaderFragment from '../shaders/strokes/fragment.glsl'
import shaderVertex from '../shaders/strokes/vertex.glsl'

export default {

    uniforms:
    {
        tDiffuse: { value: null },
        tPerlin: { value: null },
        resolution: { value: new THREE.Vector2() },
        uLineWidth: { value: 1 },
        uPerlinFrequency: { value: 1 },
        uPerlinStrength: { value: 0.0035 }
    },
    vertexShader: shaderVertex,
    fragmentShader: shaderFragment
}
