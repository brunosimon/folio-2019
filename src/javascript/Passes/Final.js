import * as THREE from 'three'

import shaderFragment from '../shaders/final/fragment.glsl'
import shaderVertex from '../shaders/final/vertex.glsl'

export default {
    uniforms:
    {
        tDiffuse: { type: 't', value: null },
        uResolution: { type: 'v2', value: null }
    },
    vertexShader: shaderVertex,
    fragmentShader: shaderFragment
}
