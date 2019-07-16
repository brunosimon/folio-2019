import shaderFragment from '../shaders/horizontalBlur/fragment.glsl'
import shaderVertex from '../shaders/horizontalBlur/vertex.glsl'

export default {
    uniforms:
    {
        tDiffuse: { type: 't', value: null },
        uResolution: { type: 'v2', value: null },
        uStrength: { type: 'v2', value: null }
    },
    vertexShader: shaderVertex,
    fragmentShader: shaderFragment
}
