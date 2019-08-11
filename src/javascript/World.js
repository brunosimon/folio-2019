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

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('world')
            this.debugFolder.open()
        }

        // Set up
        this.container = new THREE.Object3D()

        this.setAxes()
        this.setMaterials()
        this.setPhysics()
        this.setObjects()
        this.setCar()
    }

    setAxes()
    {
        this.axis = new THREE.AxesHelper()
        this.container.add(this.axis)
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
         * Pures
         */

        // Setup
        this.materials.pures = {}
        this.materials.pures.items = {}
        this.materials.pures.items.red = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        this.materials.pures.items.white = new THREE.MeshBasicMaterial({ color: 0xffffff })
        this.materials.pures.items.yellow = new THREE.MeshBasicMaterial({ color: 0xffe889 })

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

        // Red
        this.materials.shades.items.red = new MatcapMaterial()
        this.materials.shades.items.red.uniforms.matcap.value = this.resources.items.matcapRedTexture
        this.materials.items.red = this.materials.shades.items.red

        // Black
        this.materials.shades.items.black = new MatcapMaterial()
        this.materials.shades.items.black.uniforms.matcap.value = this.resources.items.matcapBlackTexture
        this.materials.items.black = this.materials.shades.items.black

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

    setCar()
    {
        this.car = {}

        this.car.container = new THREE.Object3D()
        this.container.add(this.car.container)

        this.car.movement = {}
        this.car.movement.speed = new THREE.Vector3()
        this.car.movement.acceleration = new THREE.Vector3()

        // Chassis
        this.car.chassis = {}
        this.car.chassis.offset = new THREE.Vector3(0, 0, - 0.48)
        this.car.chassis.object = this.getConvertedMesh(this.resources.items.carChassis.scene.children)
        this.car.container.add(this.car.chassis.object)

        // Antena
        this.car.antena = {}

        this.car.antena.speedStrength = 10
        this.car.antena.damping = 0.035
        this.car.antena.pullBackStrength = 0.02

        this.car.antena.object = this.getConvertedMesh(this.resources.items.carAntena.scene.children)
        this.car.chassis.object.add(this.car.antena.object)

        this.car.antena.speed = new THREE.Vector2()
        this.car.antena.absolutePosition = new THREE.Vector2()
        this.car.antena.localPosition = new THREE.Vector2()

        // this.car.antena.dummy = new THREE.Mesh(new THREE.SphereBufferGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }))
        // this.car.antena.dummy.position.z = 3
        // this.car.chassis.object.add(this.car.antena.dummy)

        // Back lights
        this.car.backLights = {}
        this.car.backLights.object = this.getConvertedMesh(this.resources.items.carBackLights.scene.children)
        this.car.chassis.object.add(this.car.backLights.object)

        // Wheels
        this.car.wheels = {}
        this.car.wheels.object = this.getConvertedMesh(this.resources.items.carWheel.scene.children)
        this.car.wheels.items = []

        for(let i = 0; i < 4; i++)
        {
            const object = this.car.wheels.object.clone()

            this.car.wheels.items.push(object)
            this.car.container.add(object)
        }

        // Time tick
        this.time.on('tick', () =>
        {
            // Update chassis
            const chassisOldPosition = this.car.chassis.object.position.clone()
            this.car.chassis.object.position.copy(this.physics.car.chassis.body.position).add(this.car.chassis.offset)
            this.car.chassis.object.quaternion.copy(this.physics.car.chassis.body.quaternion)

            // Update wheels
            for(const _wheelKey in this.physics.car.wheels.bodies)
            {
                const wheelBody = this.physics.car.wheels.bodies[_wheelKey]
                const wheelObject = this.car.wheels.items[_wheelKey]

                wheelObject.position.copy(wheelBody.position)
                wheelObject.quaternion.copy(wheelBody.quaternion)
            }

            // Movement
            const movementSpeed = new THREE.Vector3()
            movementSpeed.copy(this.car.chassis.object.position).sub(chassisOldPosition)
            this.car.movement.acceleration = movementSpeed.clone().sub(this.car.movement.speed)
            this.car.movement.speed.copy(movementSpeed)

            // Antena
            this.car.antena.speed.x -= this.car.movement.acceleration.x * this.car.antena.speedStrength
            this.car.antena.speed.y += this.car.movement.acceleration.y * this.car.antena.speedStrength

            const position = this.car.antena.absolutePosition.clone()
            const pullBack = position.negate().multiplyScalar(position.length() * this.car.antena.pullBackStrength)
            this.car.antena.speed.add(pullBack)

            this.car.antena.speed.x *= 1 - this.car.antena.damping
            this.car.antena.speed.y *= 1 - this.car.antena.damping

            this.car.antena.absolutePosition.add(this.car.antena.speed)

            this.car.antena.localPosition.copy(this.car.antena.absolutePosition)
            this.car.antena.localPosition.rotateAround(new THREE.Vector2(), this.car.chassis.object.rotation.z)

            this.car.antena.object.rotation.y = this.car.antena.localPosition.x * 0.1
            this.car.antena.object.rotation.x = this.car.antena.localPosition.y * 0.1
        })

        // Debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('car')
            folder.open()

            folder.add(this.car.antena, 'speedStrength').step(0.001).min(0).max(50)
            folder.add(this.car.antena, 'damping').step(0.0001).min(0).max(0.1)
            folder.add(this.car.antena, 'pullBackStrength').step(0.0001).min(0).max(0.1)
        }
    }

    setObjects()
    {
        this.objects = {}

        this.objects.items = []

        // Parsers
        this.objects.parsers = {}
        this.objects.parsers.items = [
            // Shade
            {
                regex: /^shade([a-z]+)_?[0-9]{0,3}?/i,
                apply: (_mesh) =>
                {
                    // Find material
                    const match = _mesh.name.match(/^shade([a-z]+)_?[0-9]{0,3}?/i)
                    const materialName = match[1].toLowerCase()
                    let material = this.materials.shades.items[materialName]

                    // Default
                    if(typeof material === 'undefined')
                    {
                        material = new THREE.MeshNormalMaterial()
                    }

                    // Create clone mesh with new material
                    const mesh = _mesh.clone()
                    mesh.material = material

                    return mesh
                }
            },

            // Shade
            {
                regex: /^pure([a-z]+)_?[0-9]{0,3}?$/i,
                apply: (_mesh) =>
                {
                    // Find material
                    const match = _mesh.name.match(/^pure([a-z]+)_?[0-9]{0,3}?$/i)
                    const materialName = match[1].toLowerCase()
                    let material = this.materials.pures.items[materialName]

                    // Default
                    if(typeof material === 'undefined')
                    {
                        material = new THREE.MeshNormalMaterial()
                    }

                    // Create clone mesh with new material
                    const mesh = _mesh.clone()
                    mesh.material = material

                    return mesh
                }
            },

            // Floor
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

        // Default
        this.objects.parsers.default = {}
        this.objects.parsers.default.apply = (_mesh) =>
        {
            // Create clone mesh with normal material
            const mesh = _mesh.clone()
            mesh.material = new THREE.MeshNormalMaterial()

            return mesh
        }

        // Object options
        this.objects.options = [
            // {
            //     base: this.resources.items.staticDemoBase.scene,
            //     collision: this.resources.items.staticDemoCollision.scene,
            //     floorShadowTexture: this.resources.items.staticDemoFloorShadowTexture,
            //     offset: new THREE.Vector3(0, 0, 0),
            //     mass: 0
            // },
            // {
            //     base: this.resources.items.dynamicSphereBase.scene,
            //     collision: this.resources.items.dynamicSphereCollision.scene,
            //     offset: new THREE.Vector3(0, 0, 0),
            //     mass: 2
            // },
            // {
            //     base: this.resources.items.dynamicBoxBase.scene,
            //     collision: this.resources.items.dynamicBoxCollision.scene,
            //     offset: new THREE.Vector3(0, 0, 2),
            //     mass: 2
            // },
            // {
            //     base: this.resources.items.dynamicBoxBase.scene,
            //     collision: this.resources.items.dynamicBoxCollision.scene,
            //     offset: new THREE.Vector3(0, 0, 4),
            //     mass: 2
            // },
            // {
            //     base: this.resources.items.dynamicComplexBase.scene,
            //     collision: this.resources.items.dynamicComplexCollision.scene,
            //     offset: new THREE.Vector3(0, 0, 4),
            //     mass: 2
            // },
            // {
            //     base: this.resources.items.dynamicComplexBase.scene,
            //     collision: this.resources.items.dynamicComplexCollision.scene,
            //     offset: new THREE.Vector3(0, 0, 7),
            //     mass: 2
            // },
            // {
            //     base: this.resources.items.dynamicComplexBase.scene,
            //     collision: this.resources.items.dynamicComplexCollision.scene,
            //     offset: new THREE.Vector3(3, 3, 3),
            //     mass: 2
            // }
        ]

        for(const _objectOptions of this.objects.options)
        {
            this.addObject(_objectOptions)
        }
    }

    getConvertedMesh(_children)
    {
        const container = new THREE.Object3D()
        const center = new THREE.Vector3()

        // Go through each base child
        const baseChildren = [..._children]

        for(const _child of baseChildren)
        {
            // Find center
            if(_child.name.match(/^center_?[0-9]{0,3}?$/i))
            {
                center.set(_child.position.x, _child.position.y, _child.position.z)
            }

            if(_child instanceof THREE.Mesh)
            {
                // Find parser and use default if not found
                let parser = this.objects.parsers.items.find((_item) => _child.name.match(_item.regex))
                if(typeof parser === 'undefined')
                {
                    parser = this.objects.parsers.default
                }

                // Create mesh by applying parser
                const mesh = parser.apply(_child)

                // Add to container
                container.add(mesh)
            }
        }


        // Recenter
        if(center.length() > 0)
        {
            for(const _child of container.children)
            {
                _child.position.sub(center)
            }

            container.position.add(center)
        }

        return container
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
        for(const _child of baseChildren)
        {
            // Find parser and use default if not found
            let parser = this.objects.parsers.items.find((_item) => _child.name.match(_item.regex))
            if(typeof parser === 'undefined')
            {
                parser = this.objects.parsers.default
            }

            // Create mesh by applying parser
            const mesh = parser.apply(_child, _objectOptions)

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
        this.objects.items.push(object)
    }
}
