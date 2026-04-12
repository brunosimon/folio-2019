import * as THREE from 'three'

import shaderFragment from '../../shaders/projectBoard/fragment.glsl'
import shaderVertex from '../../shaders/projectBoard/vertex.glsl'

export default function()
{
    const uniforms = {
        uTexture: { value: null },
        uTextureAlpha: { value: null },
        uColor: { value: null }
    }

    const material = new THREE.ShaderMaterial({
        wireframe: false,
        transparent: false,
        uniforms,
        vertexShader: shaderVertex,
        fragmentShader: shaderFragment
    })

    return material
}
