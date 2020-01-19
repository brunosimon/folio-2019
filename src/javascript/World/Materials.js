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
            this.debugFolder.open()
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
        this.pures.items.red.name = 'pureRed'
        this.pures.items.white = new THREE.MeshBasicMaterial({ color: 0xffffff })
        this.pures.items.white.name = 'pureWhite'
        this.pures.items.yellow = new THREE.MeshBasicMaterial({ color: 0xffe889 })
        this.pures.items.yellow.name = 'pureYellow'
    }

    setShades()
    {
        // Setup
        this.shades = {}
        this.shades.items = {}
        this.shades.indirectColor = '#d04500'

        this.shades.uniforms = {
            uRevealProgress: 0,
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
        this.shades.items.white.name = 'shadeWhite'
        this.shades.items.white.uniforms.matcap.value = this.resources.items.matcapWhiteTexture
        this.items.white = this.shades.items.white

        // Orange
        this.shades.items.orange = new MatcapMaterial()
        this.shades.items.orange.name = 'shadeOrange'
        this.shades.items.orange.uniforms.matcap.value = this.resources.items.matcapOrangeTexture
        this.items.orange = this.shades.items.orange

        // Green
        this.shades.items.green = new MatcapMaterial()
        this.shades.items.green.name = 'shadeGreen'
        this.shades.items.green.uniforms.matcap.value = this.resources.items.matcapGreenTexture
        this.items.green = this.shades.items.green

        // Brown
        this.shades.items.brown = new MatcapMaterial()
        this.shades.items.brown.name = 'shadeBrown'
        this.shades.items.brown.uniforms.matcap.value = this.resources.items.matcapBrownTexture
        this.items.brown = this.shades.items.brown

        // Gray
        this.shades.items.gray = new MatcapMaterial()
        this.shades.items.gray.name = 'shadeGray'
        this.shades.items.gray.uniforms.matcap.value = this.resources.items.matcapGrayTexture
        this.items.gray = this.shades.items.gray

        // Beige
        this.shades.items.beige = new MatcapMaterial()
        this.shades.items.beige.name = 'shadeBeige'
        this.shades.items.beige.uniforms.matcap.value = this.resources.items.matcapBeigeTexture
        this.items.beige = this.shades.items.beige

        // Red
        this.shades.items.red = new MatcapMaterial()
        this.shades.items.red.name = 'shadeRed'
        this.shades.items.red.uniforms.matcap.value = this.resources.items.matcapRedTexture
        this.items.red = this.shades.items.red

        // Black
        this.shades.items.black = new MatcapMaterial()
        this.shades.items.black.name = 'shadeBlack'
        this.shades.items.black.uniforms.matcap.value = this.resources.items.matcapBlackTexture
        this.items.black = this.shades.items.black

        // Green emerald
        this.shades.items.emeraldGreen = new MatcapMaterial()
        this.shades.items.emeraldGreen.name = 'shadeEmeraldGreen'
        this.shades.items.emeraldGreen.uniforms.matcap.value = this.resources.items.matcapEmeraldGreenTexture
        this.items.emeraldGreen = this.shades.items.emeraldGreen

        // Purple
        this.shades.items.purple = new MatcapMaterial()
        this.shades.items.purple.name = 'shadePurple'
        this.shades.items.purple.uniforms.matcap.value = this.resources.items.matcapPurpleTexture
        this.items.purple = this.shades.items.purple

        // Blue
        this.shades.items.blue = new MatcapMaterial()
        this.shades.items.blue.name = 'shadeBlue'
        this.shades.items.blue.uniforms.matcap.value = this.resources.items.matcapBlueTexture
        this.items.blue = this.shades.items.blue

        // Yellow
        this.shades.items.yellow = new MatcapMaterial()
        this.shades.items.yellow.name = 'shadeYellow'
        this.shades.items.yellow.uniforms.matcap.value = this.resources.items.matcapYellowTexture
        this.items.yellow = this.shades.items.yellow

        // Metal
        this.shades.items.metal = new MatcapMaterial()
        this.shades.items.metal.name = 'shadeMetal'
        this.shades.items.metal.uniforms.matcap.value = this.resources.items.matcapMetalTexture
        this.items.metal = this.shades.items.metal

        // // Gold
        // this.shades.items.gold = new MatcapMaterial()
        // this.shades.items.gold.name = 'shadeGold'
        // this.shades.items.gold.uniforms.matcap.value = this.resources.items.matcapGoldTexture
        // this.items.gold = this.shades.items.gold

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
        this.items.floorShadow.uniforms.uAlpha.value = 0

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
