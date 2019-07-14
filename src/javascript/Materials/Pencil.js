import * as THREE from 'three'

import shaderFragment from '../shaders/pencil/fragment.glsl'
import shaderVertex from '../shaders/pencil/vertex.glsl'

export default function(_parameters = {})
{
    const uniforms = {
        ...THREE.UniformsLib.common,
        ...THREE.UniformsLib.specularmap,
        ...THREE.UniformsLib.envmap,
        ...THREE.UniformsLib.aomap,
        ...THREE.UniformsLib.lightmap,
        ...THREE.UniformsLib.emissivemap,
        ...THREE.UniformsLib.bumpmap,
        ...THREE.UniformsLib.normalmap,
        ...THREE.UniformsLib.displacementmap,
        ...THREE.UniformsLib.gradientmap,
        ...THREE.UniformsLib.fog,
        ...THREE.UniformsLib.lights,
        emissive: { value: null },
        specular: { value: null },
        shininess: { value: 0 },
        tPerlin: { value: null },
        tTerrain: { value: null },
        uTerrainSize: { value: null },
        uPencilColor: { value: null },
        uPaperColor: { value: null },
        uSubdivision: { value: null },
        uStrokeUvDim: { value: null },
        uStrokeSmoothDepthAmplitude: { value: null },
        uStrokeSmoothDepthOffset: { value: null },
        uStrokeSmoothDepthMin: { value: null },
        uStrokeSmoothDepthMax: { value: null },
        uStrokeLightOffset: { value: null },
        uStrokeLightMultiplier: { value: null },
        ..._parameters.uniforms
    }

    uniforms.diffuse.value = new THREE.Color(_parameters.color)
    uniforms.emissive.value = new THREE.Color(_parameters.emissive)
    uniforms.specular.value = new THREE.Color(0x000000)
    uniforms.tPerlin.value = _parameters.perlin
    uniforms.tTerrain.value = _parameters.terrain
    uniforms.uTerrainSize.value = _parameters.terrainSize
    uniforms.uPencilColor.value = _parameters.pencilColor
    uniforms.uPaperColor.value = _parameters.paperColor
    uniforms.uSubdivision.value = _parameters.subdivision
    uniforms.uStrokeUvDim.value = _parameters.strokeUvDim
    uniforms.uStrokeSmoothDepthAmplitude.value = _parameters.strokeSmoothDepthAmplitude
    uniforms.uStrokeSmoothDepthOffset.value = _parameters.strokeSmoothDepthOffset
    uniforms.uStrokeSmoothDepthMin.value = _parameters.strokeSmoothDepthMin
    uniforms.uStrokeSmoothDepthMax.value = _parameters.strokeSmoothDepthMax
    uniforms.uStrokeLightOffset.value = _parameters.strokeLightOffset
    uniforms.uStrokeLightMultiplier.value = _parameters.strokeLightMultiplier

    const extensions = {
        derivatives: true,
        fragDepth: false,
        drawBuffers: false,
        shaderTextureLOD: false
    }

    const defines = {
        PHONG: '',
        // USE_TANGENT: ''
        // USE_NORMALMAP: '',
        // USE_MAP: '',
        // USE_BUMPMAP: '',
        // USE_SPECULARMAP: '',
        // USE_EMISSIVEMAP: '',
        // USE_ROUGHNESSMAP: '',
        // USE_METALNESSMAP: '',
        // USE_AOMAP: ''
    }

    const material = new THREE.ShaderMaterial({
        wireframe: false,
        transparent: false,
        uniforms,
        extensions,
        defines,
        lights: true,
        vertexShader: shaderVertex,
        fragmentShader: shaderFragment
    })

    return material
}
