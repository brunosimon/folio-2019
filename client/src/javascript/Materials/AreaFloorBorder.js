import * as THREE from 'three'

import shaderFragment from '../../shaders/areaFloorBorder/fragment.glsl'
import shaderVertex from '../../shaders/areaFloorBorder/vertex.glsl'

export default function()
{
    const uniforms = {
        uColor: { value: null },
        uAlpha: { value: null },
        uLoadProgress: { value: null },
        uProgress: { value: null }
    }

    const material = new THREE.ShaderMaterial({
        wireframe: false,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        uniforms,
        vertexShader: shaderVertex,
        fragmentShader: shaderFragment
    })

    return material
}
