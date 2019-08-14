import * as THREE from 'three'
import FloorMaterial from './Materials/Floor.js'
import ShadowMaterial from './Materials/Shadow.js'
import MatcapMaterial from './Materials/Matcap.js'
import Physics from './Physics.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

export default class
{
    constructor(_options)
    {
        // Options
        this.debug = _options.debug
        this.resources = _options.resources
        this.time = _options.time
        this.camera = _options.camera
        this.renderer = _options.renderer
        this.orbitControls = _options.orbitControls

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('world')
            this.debugFolder.open()
        }

        // Set up
        this.container = new THREE.Object3D()

        // this.setAxes()
        this.setMaterials()
        this.setShadows()
        this.setPhysics()
        this.setObjects()
        this.setCar()
    }

    setShadows()
    {
        this.shadows = {}
        this.shadows.maxDistance = 3
        this.shadows.zFightingDistance = 0.001
        this.shadows.color = '#d04500'

        this.shadows.container = new THREE.Object3D()
        this.container.add(this.shadows.container)

        // Sun
        this.shadows.sun = {}
        this.shadows.sun.position = new THREE.Vector3(3, 0, 3)
        this.shadows.sun.vector = this.shadows.sun.position.clone().multiplyScalar(1 / this.shadows.sun.position.z).negate()
        this.shadows.sun.dummy = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }))
        this.shadows.sun.dummy.position.copy(this.shadows.sun.position)
        this.shadows.sun.dummy.visible = false
        this.shadows.container.add(this.shadows.sun.dummy)

        // Material
        this.shadows.material = new ShadowMaterial()
        this.shadows.material.depthWrite = false
        this.shadows.material.uniforms.uColor.value = new THREE.Color(this.shadows.color)
        this.shadows.material.uniforms.uAlpha.value = 0.5
        this.shadows.material.uniforms.uRadius.value = 0.35

        // Geometry
        this.shadows.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1)

        // Items
        this.shadows.items = []

        // Dummy
        this.shadows.dummy = {}

        this.shadows.dummy.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1, 1), new THREE.MeshNormalMaterial())
        this.shadows.dummy.mesh.position.z = 1.5
        this.shadows.dummy.mesh.position.y = - 3
        this.shadows.container.add(this.shadows.dummy.mesh)
        this.addShadow(this.shadows.dummy.mesh, { sizeX: 2, sizeY: 2, offsetZ: - 0.35 })

        this.shadows.dummy.transformControls = new TransformControls(this.camera, this.renderer.domElement)
        this.shadows.dummy.transformControls.size = 0.5
        this.shadows.dummy.transformControls.attach(this.shadows.dummy.mesh)

        document.addEventListener('keydown', (_event) =>
        {
            if(_event.key === 'r')
            {
                this.shadows.dummy.transformControls.setMode('rotate')
            }
            else if(_event.key === 'g')
            {
                this.shadows.dummy.transformControls.setMode('translate')
            }
        })

        this.shadows.dummy.transformControls.addEventListener('dragging-changed', (_event) =>
        {
            this.orbitControls.enabled = !_event.value
        })

        this.shadows.container.add(this.shadows.dummy.transformControls)

        // Time tick
        this.time.on('tick', () =>
        {
            for(const _shadow of this.shadows.items)
            {
                // Position
                const z = Math.max(_shadow.reference.position.z + _shadow.offsetZ, 0)
                const sunOffset = this.shadows.sun.vector.clone().multiplyScalar(z)

                _shadow.mesh.position.x = _shadow.reference.position.x + sunOffset.x
                _shadow.mesh.position.y = _shadow.reference.position.y + sunOffset.y

                _shadow.mesh.rotation.z = _shadow.reference.rotation.z

                // Alpha
                let alpha = (this.shadows.maxDistance - z) / this.shadows.maxDistance
                alpha = Math.min(Math.max(alpha, 0), 1)
                alpha = Math.pow(alpha, 2)

                _shadow.alpha = _shadow.baseAlpha * alpha
                _shadow.material.uniforms.uAlpha.value = _shadow.alpha
            }
        })

        // Debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('shadows')
            folder.open()

            folder.add(this.shadows, 'maxDistance').step(0.01).min(0).max(10)
            folder.addColor(this.shadows, 'color').onChange(() =>
            {
                this.shadows.material.uniforms.uColor.value = new THREE.Color(this.shadows.color)

                for(const _shadow of this.shadows.items)
                {
                    _shadow.material.uniforms.uColor.value = new THREE.Color(this.shadows.color)
                }
            })
        }
    }

    addShadow(_reference, _options = {})
    {
        const shadow = {}

        shadow.alpha = 0

        // Options
        shadow.offsetZ = typeof _options.offsetZ === 'undefined' ? 0 : _options.offsetZ
        shadow.baseAlpha = typeof _options.alpha === 'undefined' ? 0.5 : _options.alpha

        // Reference
        shadow.reference = _reference

        // Material
        shadow.material = this.shadows.material.clone()

        // Mesh
        shadow.mesh = new THREE.Mesh(this.shadows.geometry, shadow.material)
        shadow.mesh.position.z = this.shadows.zFightingDistance
        // shadow.mesh.position.y = - 3
        shadow.mesh.scale.set(_options.sizeX, _options.sizeY, 2.4)

        // Save
        this.shadows.container.add(shadow.mesh)
        this.shadows.items.push(shadow)
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

        this.car.mode = 'auto' // 'transformControls' | 'auto'
        this.car.container = new THREE.Object3D()
        this.container.add(this.car.container)

        this.car.movement = {}
        this.car.movement.speed = new THREE.Vector3()
        this.car.movement.localSpeed = new THREE.Vector3()
        this.car.movement.acceleration = new THREE.Vector3()
        this.car.movement.localAcceleration = new THREE.Vector3()

        // Chassis
        this.car.chassis = {}
        this.car.chassis.offset = new THREE.Vector3(0, 0, - 0.48)
        this.car.chassis.object = this.getConvertedMesh(this.resources.items.carChassis.scene.children)
        this.car.container.add(this.car.chassis.object)

        this.addShadow(this.car.chassis.object, { sizeX: 3, sizeY: 2, offsetZ: 0.2 })

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

        // Back lights brake
        this.car.backLightsBrake = {}

        this.car.backLightsBrake.material = this.materials.pures.items.red.clone()
        this.car.backLightsBrake.material.transparent = true
        this.car.backLightsBrake.material.opacity = 0.5

        this.car.backLightsBrake.object = this.getConvertedMesh(this.resources.items.carBackLightsBrake.scene.children)
        for(const _child of this.car.backLightsBrake.object.children)
        {
            _child.material = this.car.backLightsBrake.material
        }

        this.car.chassis.object.add(this.car.backLightsBrake.object)

        // Back lights brake
        this.car.backLightsReverse = {}

        this.car.backLightsReverse.material = this.materials.pures.items.yellow.clone()
        this.car.backLightsReverse.material.transparent = true
        this.car.backLightsReverse.material.opacity = 0.5

        this.car.backLightsReverse.object = this.getConvertedMesh(this.resources.items.carBackLightsReverse.scene.children)
        for(const _child of this.car.backLightsReverse.object.children)
        {
            _child.material = this.car.backLightsReverse.material
        }

        this.car.chassis.object.add(this.car.backLightsReverse.object)

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

        // Controls
        this.car.transformControls = new TransformControls(this.camera, this.renderer.domElement)
        this.car.transformControls.size = 0.5
        this.car.transformControls.visible = this.car.mode === 'transformControls'
        this.car.transformControls.enabled = this.car.mode === 'transformControls'
        this.car.transformControls.attach(this.car.chassis.object)

        document.addEventListener('keydown', (_event) =>
        {
            if(this.car.mode === 'transformControls')
            {
                if(_event.key === 'r')
                {
                    this.car.transformControls.setMode('rotate')
                }
                else if(_event.key === 'g')
                {
                    this.car.transformControls.setMode('translate')
                }
            }
        })

        this.car.transformControls.addEventListener('dragging-changed', (_event) =>
        {
            this.orbitControls.enabled = !_event.value
        })

        this.container.add(this.car.transformControls)

        // Time tick
        this.time.on('tick', () =>
        {
            const chassisOldPosition = this.car.chassis.object.position.clone()

            if(this.car.mode === 'auto')
            {
                // Update chassis
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
            }

            // Movement
            const movementSpeed = new THREE.Vector3()
            movementSpeed.copy(this.car.chassis.object.position).sub(chassisOldPosition)
            this.car.movement.acceleration = movementSpeed.clone().sub(this.car.movement.speed)
            this.car.movement.speed.copy(movementSpeed)

            this.car.movement.localSpeed = this.car.movement.speed.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), - this.car.chassis.object.rotation.z)
            this.car.movement.localAcceleration = this.car.movement.acceleration.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), - this.car.chassis.object.rotation.z)

            // Antena
            this.car.antena.speed.x -= this.car.movement.acceleration.x * this.car.antena.speedStrength
            this.car.antena.speed.y -= this.car.movement.acceleration.y * this.car.antena.speedStrength

            const position = this.car.antena.absolutePosition.clone()
            const pullBack = position.negate().multiplyScalar(position.length() * this.car.antena.pullBackStrength)
            this.car.antena.speed.add(pullBack)

            this.car.antena.speed.x *= 1 - this.car.antena.damping
            this.car.antena.speed.y *= 1 - this.car.antena.damping

            this.car.antena.absolutePosition.add(this.car.antena.speed)

            this.car.antena.localPosition.copy(this.car.antena.absolutePosition)
            this.car.antena.localPosition.rotateAround(new THREE.Vector2(), - this.car.chassis.object.rotation.z)

            this.car.antena.object.rotation.y = this.car.antena.localPosition.x * 0.1
            this.car.antena.object.rotation.x = this.car.antena.localPosition.y * 0.1

            // Lights
            if(this.physics.car.controls.actions.space)
            {
                this.car.backLightsBrake.material.opacity = 1
                this.car.backLightsReverse.material.opacity = 0.5
            }
            else
            {
                // Forward
                if(this.car.movement.localSpeed.x > 0)
                {
                    this.car.backLightsBrake.material.opacity = this.car.movement.localAcceleration.x < - 0.001 ? 1 : 0.5
                    this.car.backLightsReverse.material.opacity = 0.5
                }
                // Backward
                else
                {
                    this.car.backLightsBrake.material.opacity = this.car.movement.localAcceleration.x > 0.001 ? 1 : 0.5
                    this.car.backLightsReverse.material.opacity = this.car.movement.localAcceleration.x < - 0.001 ? 1 : 0.5
                }
            }
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
                apply: (_mesh, _options) =>
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
                    const mesh = _options.cloneMesh ? _mesh.clone() : _mesh
                    mesh.material = material

                    return mesh
                }
            },

            // Shade
            {
                regex: /^pure([a-z]+)_?[0-9]{0,3}?/i,
                apply: (_mesh, _options) =>
                {
                    // Find material
                    const match = _mesh.name.match(/^pure([a-z]+)_?[0-9]{0,3}?/i)
                    const materialName = match[1].toLowerCase()
                    let material = this.materials.pures.items[materialName]

                    // Default
                    if(typeof material === 'undefined')
                    {
                        material = new THREE.MeshNormalMaterial()
                    }

                    // Create clone mesh with new material
                    const mesh = _options.cloneMesh ? _mesh.clone() : _mesh
                    mesh.material = material

                    return mesh
                }
            },

            // Floor
            {
                regex: /^floor_?[0-9]{0,3}?/i,
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
            {
                base: this.resources.items.staticDemoBase.scene,
                collision: this.resources.items.staticDemoCollision.scene,
                floorShadowTexture: this.resources.items.staticDemoFloorShadowTexture,
                offset: new THREE.Vector3(0, 0, 0),
                mass: 0
            },
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

    getConvertedMesh(_children, _options = {})
    {
        const container = new THREE.Object3D()
        const center = new THREE.Vector3()

        // Go through each base child
        const baseChildren = [..._children]

        for(const _child of baseChildren)
        {
            // Find center
            if(_child.name.match(/^center_?[0-9]{0,3}?/i))
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
                const mesh = parser.apply(_child, _options)

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
        object.container = this.getConvertedMesh(_objectOptions.base.children, _objectOptions)
        object.container.position.copy(_objectOptions.offset)
        this.container.add(object.container)

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
