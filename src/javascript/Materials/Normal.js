import * as THREE from 'three'

import shaderFragment from '../shaders/normal/fragment.glsl'
import shaderVertex from '../shaders/normal/vertex.glsl'

export default function(_parameters = {})
{
    const uniforms = {
        tTerrain: { value: null },
        uTerrainSize: { value: null },
    }

    uniforms.tTerrain.value = _parameters.terrain
    uniforms.uTerrainSize.value = _parameters.terrainSize

    const material = new THREE.ShaderMaterial({
        wireframe: false,
        transparent: false,
        uniforms,
        vertexShader: shaderVertex,
        fragmentShader: shaderFragment
    })

    return material
}
