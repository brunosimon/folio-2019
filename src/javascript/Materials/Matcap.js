import * as THREE from 'three'

import shaderFragment from '../shaders/matcap/fragment.glsl'
import shaderVertex from '../shaders/matcap/vertex.glsl'

export default function(_parameters = {})
{
    const uniforms = {
        ...THREE.UniformsLib.common,
        ...THREE.UniformsLib.bumpmap,
        ...THREE.UniformsLib.normalmap,
        ...THREE.UniformsLib.displacementmap,
        ...THREE.UniformsLib.fog,
        matcap: { value: null }
    }

    uniforms.matcap.value = _parameters.matcap

    const extensions = {
        derivatives: false,
        fragDepth: false,
        drawBuffers: false,
        shaderTextureLOD: false
    }

    const defines = {
        MATCAP: ''
    }

    const material = new THREE.ShaderMaterial({
        wireframe: false,
        transparent: false,
        uniforms,
        extensions,
        defines,
        lights: false,
        vertexShader: shaderVertex,
        fragmentShader: shaderFragment
    })

    return material
}
