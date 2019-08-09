import * as THREE from 'three'
import FloorMaterial from './Materials/Floor.js'
import MatcapMaterial from './Materials/Matcap.js'
import Physics from './Physics.js'

export default class
{
    constructor(_options)
    {
        // Options
        this.debug = _options.debug
        this.resources = _options.resources
        this.time = _options.time

        // Set up
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('world')
            // this.debugFolder.open()
        }

        this.container = new THREE.Object3D()
        this.objects = []

        // this.setCenterAxis()
        this.setMaterials()
        this.setMeshParser()
        this.setPhysics()
    }

    setCenterAxis()
    {
        this.centerAxis = new THREE.AxesHelper(1)
        this.container.add(this.centerAxis)
    }

    setMaterials()
    {
        this.materials = {}
        this.materials.items = {}

        // Debug
        if(this.debug)
        {
            this.materials.debugFolder = this.debugFolder.addFolder('materials')
            this.materials.debugFolder.open()
        }

        /**
         * Shades
         */

        // Setup
        this.materials.shades = {}

        this.materials.shades.items = {}
        this.materials.shades.indirectColor = '#d04500'

        this.materials.shades.uniforms = {
            uIndirectDistanceAmplitude: 1,
            uIndirectDistanceStrength: 0.7,
            uIndirectDistancePower: 2.0,
            uIndirectAngleStrength: 1.5,
            uIndirectAngleOffset: 0.6,
            uIndirectAnglePower: 1.0,
            uIndirectColor: null
        }

        // White
        this.materials.shades.items.white = new MatcapMaterial()
        this.materials.shades.items.white.uniforms.matcap.value = this.resources.items.matcapWhiteTexture
        this.materials.items.white = this.materials.shades.items.white

        // Beige
        this.materials.shades.items.beige = new MatcapMaterial()
        this.materials.shades.items.beige.uniforms.matcap.value = this.resources.items.matcapBeigeTexture
        this.materials.items.beige = this.materials.shades.items.beige

        // Update materials uniforms
        this.materials.shades.updateUniforms = () =>
        {
            this.materials.shades.uniforms.uIndirectColor = new THREE.Color(this.materials.shades.indirectColor)

            // Each uniform
            for(const _uniformName in this.materials.shades.uniforms)
            {
                const _uniformValue = this.materials.shades.uniforms[_uniformName]

                // Each material
                for(const _materialKey in this.materials.shades.items)
                {
                    const material = this.materials.shades.items[_materialKey]
                    material.uniforms[_uniformName].value = _uniformValue
                }
            }
        }

        this.materials.shades.updateUniforms()

        // Debug
        if(this.debug)
        {
            const folder = this.materials.debugFolder.addFolder('shades')
            folder.open()

            folder.add(this.materials.shades.uniforms, 'uIndirectDistanceAmplitude').step(0.001).min(0).max(0.5).onChange(this.materials.shades.updateUniforms)
            folder.add(this.materials.shades.uniforms, 'uIndirectDistanceStrength').step(0.001).min(0).max(2).onChange(this.materials.shades.updateUniforms)
            folder.add(this.materials.shades.uniforms, 'uIndirectDistancePower').step(0.001).min(0).max(5).onChange(this.materials.shades.updateUniforms)
            folder.add(this.materials.shades.uniforms, 'uIndirectAngleStrength').step(0.001).min(0).max(2).onChange(this.materials.shades.updateUniforms)
            folder.add(this.materials.shades.uniforms, 'uIndirectAngleOffset').step(0.001).min(- 2).max(2).onChange(this.materials.shades.updateUniforms)
            folder.add(this.materials.shades.uniforms, 'uIndirectAnglePower').step(0.001).min(0).max(5).onChange(this.materials.shades.updateUniforms)
            folder.addColor(this.materials.shades, 'indirectColor').onChange(this.materials.shades.updateUniforms)
        }

        /**
         * Floor
         */
        this.materials.items.floor = new FloorMaterial()

        this.materials.items.floor.shadowColor = '#d04500'

        this.materials.items.floor.colors = {}
        this.materials.items.floor.colors.topLeft = '#d98441'
        this.materials.items.floor.colors.topRight = '#eba962'
        this.materials.items.floor.colors.bottomRight = '#f3c17d'
        this.materials.items.floor.colors.bottomLeft = '#eaa860'

        this.materials.items.floor.updateUniforms = () =>
        {
            const topLeft = new THREE.Color(this.materials.items.floor.colors.topLeft)
            const topRight = new THREE.Color(this.materials.items.floor.colors.topRight)
            const bottomRight = new THREE.Color(this.materials.items.floor.colors.bottomRight)
            const bottomLeft = new THREE.Color(this.materials.items.floor.colors.bottomLeft)

            const data = new Uint8Array([
                Math.round(bottomLeft.r * 255), Math.round(bottomLeft.g * 255), Math.round(bottomLeft.b * 255),
                Math.round(bottomRight.r * 255), Math.round(bottomRight.g * 255), Math.round(bottomRight.b * 255),
                Math.round(topLeft.r * 255), Math.round(topLeft.g * 255), Math.round(topLeft.b * 255),
                Math.round(topRight.r * 255), Math.round(topRight.g * 255), Math.round(topRight.b * 255)
            ])

            this.materials.items.floor.backgroundTexture = new THREE.DataTexture(data, 2, 2, THREE.RGBFormat)
            this.materials.items.floor.backgroundTexture.magFilter = THREE.LinearFilter
            this.materials.items.floor.backgroundTexture.needsUpdate = true

            this.materials.items.floor.uniforms.tBackground.value = this.materials.items.floor.backgroundTexture

            this.materials.items.floor.uniforms.tShadow.value = this.resources.items.floorShadowTexture
            this.materials.items.floor.uniforms.uShadowColor.value = new THREE.Color(this.materials.items.floor.shadowColor)
        }

        this.materials.items.floor.updateUniforms()

        // Debug
        if(this.debug)
        {
            const folder = this.materials.debugFolder.addFolder('floor')
            folder.open()

            folder.addColor(this.materials.items.floor, 'shadowColor').onChange(this.materials.items.floor.updateUniforms)
            folder.addColor(this.materials.items.floor.colors, 'topLeft').onChange(this.materials.items.floor.updateUniforms)
            folder.addColor(this.materials.items.floor.colors, 'topRight').onChange(this.materials.items.floor.updateUniforms)
            folder.addColor(this.materials.items.floor.colors, 'bottomRight').onChange(this.materials.items.floor.updateUniforms)
            folder.addColor(this.materials.items.floor.colors, 'bottomLeft').onChange(this.materials.items.floor.updateUniforms)
        }
    }

    setPhysics()
    {
        this.physics = new Physics({
            debug: this.debug,
            time: this.time
        })

        this.container.add(this.physics.models.container)
    }

    setMeshParser()
    {
        this.meshParser = {}
        this.meshParser.items = [
            {
                regex: /^shade([a-z]+)_?[0-9]{0,3}?$/i,
                apply: (_mesh) =>
                {
                    // Find material
                    const match = _mesh.name.match(/^shade([a-z]+)_?[0-9]{0,3}?$/i)
                    const materialName = match[1].toLowerCase()
                    const material = this.materials.shades.items[materialName]

                    // Create clone mesh with new material
                    const mesh = _mesh.clone()
                    mesh.material = material

                    return mesh
                }
            },
            {
                regex: /^floor_?[0-9]{0,3}?$/i,
                apply: (_mesh, _options) =>
                {
                    // Create floor manually because of missing UV
                    const geometry = new THREE.PlaneBufferGeometry(_mesh.scale.x, _mesh.scale.z, 10, 10)
                    const material = this.materials.items.floor.clone()

                    material.uniforms.tBackground.value = this.materials.items.floor.backgroundTexture
                    material.uniforms.tShadow.value = _options.floorShadowTexture
                    material.uniforms.uShadowColor.value = new THREE.Color(this.materials.items.floor.shadowColor)

                    const mesh = new THREE.Mesh(geometry, material)

                    return mesh
                }
            }
        ]

        // Default normal material
        this.meshParser.default = {}
        this.meshParser.default.apply = (_mesh) =>
        {
            _mesh.material = new THREE.MeshNormalMaterial()

            return _mesh
        }
    }

    addObject(_objectOptions)
    {
        const object = {}

        // Container
        object.container = new THREE.Object3D()
        object.container.position.copy(_objectOptions.offset)
        this.container.add(object.container)

        // Go through each base child
        const baseChildren = [..._objectOptions.base.children]
        for(let i = 0; i < baseChildren.length; i++)
        {
            // Find parser
            let mesh = baseChildren[i]

            // Find parser and use default if not found
            let parser = this.meshParser.items.find((_item) => mesh.name.match(_item.regex))
            if(typeof parser === 'undefined')
            {
                parser = this.meshParser.default
            }

            // Apply parser
            mesh = parser.apply(mesh, _objectOptions)

            // Add to container
            object.container.add(mesh)
        }

        // Create physics object
        object.collision = this.physics.addObjectFromThree({
            meshes: [..._objectOptions.collision.children],
            offset: _objectOptions.offset,
            mass: _objectOptions.mass
        })

        for(const _child of object.container.children)
        {
            _child.position.sub(object.collision.center)
        }

        // Time tick event
        this.time.on('tick', () =>
        {
            object.container.position.copy(object.collision.body.position)
            object.container.quaternion.copy(object.collision.body.quaternion)
        })

        // Save
        this.objects.push(object)
    }
}
