import * as THREE from 'three'

import shaderFragment from '../shaders/floor/fragment.glsl'
import shaderVertex from '../shaders/floor/vertex.glsl'

export default function()
{
    const uniforms = {
        tBackground: { value: null },
        tShadow: { value: null },
        uShadowColor: { value: null }
    }

    const material = new THREE.ShaderMaterial({
        wireframe: false,
        transparent: true,
        uniforms,
        vertexShader: shaderVertex,
        fragmentShader: shaderFragment
    })

    return material
}
