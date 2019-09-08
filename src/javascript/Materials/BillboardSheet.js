import * as THREE from 'three'

import shaderFragment from '../shaders/billboardSheet/fragment.glsl'
import shaderVertex from '../shaders/billboardSheet/vertex.glsl'

export default function()
{
    const uniforms = {
        uTexture: { value: null },
        uCount: { value: null },
        uProgress: { value: null }
    }

    const material = new THREE.ShaderMaterial({
        wireframe: false,
        transparent: false,
        side: THREE.DoubleSide,
        uniforms,
        vertexShader: shaderVertex,
        fragmentShader: shaderFragment
    })

    return material
}
