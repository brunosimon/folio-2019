import * as THREE from 'three'

import shaderFragment from '../shaders/final/fragment.glsl'
import shaderVertex from '../shaders/final/vertex.glsl'

export default {
    uniforms:
    {
        tDiffuse: { type: 't', value: null },
        tStroke: { type: 't', value: null },
        uPencilColor: { type: 'v3', value: new THREE.Color('#414141') },
        uVignetteStrength: { type: 'f', value: 2 },
        uVignetteOffset: { type: 'f', value: - 0.5 },
        uNoiseStrength: { type: 'f', value: 0.1 }
    },
    vertexShader:shaderVertex,
    fragmentShader: shaderFragment
}
