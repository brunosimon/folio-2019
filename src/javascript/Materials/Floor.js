import * as THREE from 'three'

import shaderFragment from '../shaders/floor/fragment.glsl'
import shaderVertex from '../shaders/floor/vertex.glsl'

export default function(_parameters = {})
{
    const uniforms = {
        tBackground: { value: null },
        tShadow: { value: null },
        uColor: { value: null }
    }

    uniforms.tBackground.value = _parameters.background
    uniforms.tShadow.value = _parameters.shadow
    uniforms.uColor.value = _parameters.color

    const material = new THREE.ShaderMaterial({
        wireframe: false,
        transparent: true,
        uniforms,
        vertexShader: shaderVertex,
        fragmentShader: shaderFragment
    })

    return material
}
