import * as THREE from 'three'
import FloorShadowMaterial from '../Materials/FloorShadow.js'
import MatcapMaterial from '../Materials/Matcap.js'

export default class Materials
{
    constructor(_options)
    {
        // Options
        this.resources = _options.resources
        this.debug = _options.debug

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('materials')
            // this.debugFolder.open()
        }

        // Set up
        this.items = {}

        this.setPures()
        this.setShades()
        this.setFloorShadow()
    }

    setPures()
    {
        // Setup
        this.pures = {}
        this.pures.items = {}
        this.pures.items.red = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        this.pures.items.white = new THREE.MeshBasicMaterial({ color: 0xffffff })
        this.pures.items.yellow = new THREE.MeshBasicMaterial({ color: 0xffe889 })
    }

    setShades()
    {
        // Setup
        this.shades = {}
        this.shades.items = {}
        this.shades.indirectColor = '#d04500'

        this.shades.uniforms = {
            uIndirectDistanceAmplitude: 1.75,
            uIndirectDistanceStrength: 0.5,
            uIndirectDistancePower: 2.0,
            uIndirectAngleStrength: 1.5,
            uIndirectAngleOffset: 0.6,
            uIndirectAnglePower: 1.0,
            uIndirectColor: null
        }

        // White
        this.shades.items.white = new MatcapMaterial()
        this.shades.items.white.uniforms.matcap.value = this.resources.items.matcapWhiteTexture
        this.items.white = this.shades.items.white

        // Green
        this.shades.items.green = new MatcapMaterial()
        this.shades.items.green.uniforms.matcap.value = this.resources.items.matcapGreenTexture
        this.items.green = this.shades.items.green

        // Brown
        this.shades.items.brown = new MatcapMaterial()
        this.shades.items.brown.uniforms.matcap.value = this.resources.items.matcapBrownTexture
        this.items.brown = this.shades.items.brown

        // Gray
        this.shades.items.gray = new MatcapMaterial()
        this.shades.items.gray.uniforms.matcap.value = this.resources.items.matcapGrayTexture
        this.items.gray = this.shades.items.gray

        // Beige
        this.shades.items.beige = new MatcapMaterial()
        this.shades.items.beige.uniforms.matcap.value = this.resources.items.matcapBeigeTexture
        this.items.beige = this.shades.items.beige

        // Red
        this.shades.items.red = new MatcapMaterial()
        this.shades.items.red.uniforms.matcap.value = this.resources.items.matcapRedTexture
        this.items.red = this.shades.items.red

        // Black
        this.shades.items.black = new MatcapMaterial()
        this.shades.items.black.uniforms.matcap.value = this.resources.items.matcapBlackTexture
        this.items.black = this.shades.items.black

        // Update materials uniforms
        this.shades.updateMaterials = () =>
        {
            this.shades.uniforms.uIndirectColor = new THREE.Color(this.shades.indirectColor)

            // Each uniform
            for(const _uniformName in this.shades.uniforms)
            {
                const _uniformValue = this.shades.uniforms[_uniformName]

                // Each material
                for(const _materialKey in this.shades.items)
                {
                    const material = this.shades.items[_materialKey]
                    material.uniforms[_uniformName].value = _uniformValue
                }
            }
        }

        this.shades.updateMaterials()

        // Debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('shades')
            folder.open()

            folder.add(this.shades.uniforms, 'uIndirectDistanceAmplitude').step(0.001).min(0).max(3).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectDistanceStrength').step(0.001).min(0).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectDistancePower').step(0.001).min(0).max(5).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAngleStrength').step(0.001).min(0).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAngleOffset').step(0.001).min(- 2).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAnglePower').step(0.001).min(0).max(5).onChange(this.shades.updateMaterials)
            folder.addColor(this.shades, 'indirectColor').onChange(this.shades.updateMaterials)
        }
    }

    setFloorShadow()
    {
        this.items.floorShadow = new FloorShadowMaterial()
        this.items.floorShadow.depthWrite = false
        this.items.floorShadow.shadowColor = '#d04500'
        this.items.floorShadow.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)

        this.items.floorShadow.updateMaterials = () =>
        {
            this.items.floorShadow.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)

            for(const _item of this.objects.items)
            {
                for(const _child of _item.container.children)
                {
                    if(_child.material instanceof THREE.ShaderMaterial)
                    {
                        if(_child.material.uniforms.uShadowColor)
                        {
                            _child.material.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)
                        }
                    }
                }
            }
        }

        // Debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('floorShadow')
            folder.open()

            folder.addColor(this.items.floorShadow, 'shadowColor').onChange(this.items.floorShadow.updateMaterials)
        }
    }
}
