import * as THREE from 'three'

import shaderFragment from '../shaders/background/fragment.glsl'
import shaderVertex from '../shaders/background/vertex.glsl'

export default function(_parameters = {})
{
    const uniforms = {
        tBackground: { value: null }
    }

    uniforms.tBackground.value = _parameters.background

    const material = new THREE.ShaderMaterial({
        wireframe: false,
        transparent: false,
        uniforms,
        vertexShader: shaderVertex,
        fragmentShader: shaderFragment
    })

    return material
}
