import CANNON, { Vec3 } from 'cannon'
import * as THREE from 'three'

export default class Physics
{
    constructor(_options)
    {
        this.debug = _options.debug
        this.time = _options.time

        // Set up
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('physics')
            // this.debugFolder.open()
        }

        this.setWorld()
        this.setModels()
        this.setMaterials()
        this.setFloor()
        this.setCar()

        this.time.on('tick', () =>
        {
            this.world.step(1 / 60, this.time.delta, 3)
        })
    }

    setWorld()
    {
        this.world = new CANNON.World()
        this.world.gravity.set(0, 0, - 9)
        this.world.broadphase = new CANNON.SAPBroadphase(this.world)
        this.world.defaultContactMaterial.friction = 0
        this.world.defaultContactMaterial.restitution = 0.2

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this.world.gravity, 'z').step(0.001).min(- 20).max(20).name('gravity')
        }
    }

    setModels()
    {
        this.models = {}
        this.models.container = new THREE.Object3D()
        this.models.container.visible = false
        this.models.materials = {}
        this.models.materials.static = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
        this.models.materials.dynamic = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this.models.container, 'visible')
        }
    }

    setMaterials()
    {
        this.materials = {}

        // All materials
        this.materials.items = {}
        this.materials.items.floor = new CANNON.Material('floorMaterial')
        this.materials.items.dummy = new CANNON.Material('dummyMaterial')
        this.materials.items.wheel = new CANNON.Material('wheelMaterial')

        // Contact between materials
        this.materials.contacts = {}

        this.materials.contacts.floorDummy = new CANNON.ContactMaterial(this.materials.items.floor, this.materials.items.dummy, { friction: 0.5, restitution: 0.3, contactEquationStiffness: 1000 })
        this.world.addContactMaterial(this.materials.contacts.floorDummy)

        this.materials.contacts.dummyDummy = new CANNON.ContactMaterial(this.materials.items.dummy, this.materials.items.dummy, { friction: 0.5, restitution: 0.3, contactEquationStiffness: 1000 })
        this.world.addContactMaterial(this.materials.contacts.dummyDummy)

        this.materials.contacts.floorWheel = new CANNON.ContactMaterial(this.materials.items.floor, this.materials.items.wheel, { friction: 0.3, restitution: 0, contactEquationStiffness: 1000 })
        this.world.addContactMaterial(this.materials.contacts.floorWheel)
    }

    setFloor()
    {
        this.floor = {}
        this.floor.body = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            material: this.materials.items.floor
        })

        // this.floor.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI * 0.5)

        this.world.addBody(this.floor.body)
    }

    setCar()
    {
        this.car = {}

        /**
         * Options
         */
        this.car.options = {}
        this.car.options.chassisWidth = 1.02
        this.car.options.chassisHeight = 0.85
        this.car.options.chassisDepth = 2.03
        this.car.options.chassisOffset = new CANNON.Vec3(0, 0, 0.38)
        this.car.options.chassisMass = 80
        this.car.options.wheelFrontOffsetDepth = 0.635
        this.car.options.wheelBackOffsetDepth = - 0.475
        this.car.options.wheelOffsetWidth = 0.39
        this.car.options.wheelRadius = 0.25
        this.car.options.wheelHeight = 0.24
        this.car.options.wheelSuspensionStiffness = 25
        this.car.options.wheelSuspensionRestLength = 0.3
        this.car.options.wheelFrictionSlip = 5
        this.car.options.wheelDampingRelaxation = 2.3
        this.car.options.wheelDampingCompression = 4.4
        this.car.options.wheelMaxSuspensionForce = 100000
        this.car.options.wheelRollInfluence =  0.01
        this.car.options.wheelMaxSuspensionTravel = 0.3
        this.car.options.wheelCustomSlidingRotationalSpeed = - 30
        this.car.options.wheelMass = 20
        this.car.options.controlsSteeringSpeed = 0.005
        this.car.options.controlsSteeringMax = Math.PI * 0.17
        this.car.options.controlsSteeringQuad = false
        this.car.options.controlsAcceleratingSpeed = 5
        this.car.options.controlsAcceleratingMax = 80
        this.car.options.controlsAcceleratingQuad = true

        /**
         * Create method
         */
        this.car.create = () =>
        {
            /**
             * Chassis
             */
            this.car.chassis = {}

            this.car.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car.options.chassisDepth * 0.5, this.car.options.chassisWidth * 0.5, this.car.options.chassisHeight * 0.5))

            this.car.chassis.body = new CANNON.Body({ mass: this.car.options.chassisMass })
            this.car.chassis.body.position.set(0, 0, 3)
            this.car.chassis.body.addShape(this.car.chassis.shape, this.car.options.chassisOffset)
            this.car.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), - Math.PI * 0.5)

            /**
             * Vehicle
             */
            this.car.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car.chassis.body
            })

            /**
             * Wheel
             */
            this.car.wheels = {}
            this.car.wheels.options = {
                radius: this.car.options.wheelRadius,
                height: this.car.options.wheelHeight,
                suspensionStiffness: this.car.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car.options.wheelSuspensionRestLength,
                frictionSlip: this.car.options.wheelFrictionSlip,
                dampingRelaxation: this.car.options.wheelDampingRelaxation,
                dampingCompression: this.car.options.wheelDampingCompression,
                maxSuspensionForce: this.car.options.wheelMaxSuspensionForce,
                rollInfluence: this.car.options.wheelRollInfluence,
                maxSuspensionTravel: this.car.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, - 1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }

            // Front left
            this.car.wheels.options.chassisConnectionPointLocal.set(this.car.options.wheelFrontOffsetDepth, this.car.options.wheelOffsetWidth, 0)
            this.car.vehicle.addWheel(this.car.wheels.options)

            // Front right
            this.car.wheels.options.chassisConnectionPointLocal.set(this.car.options.wheelFrontOffsetDepth, - this.car.options.wheelOffsetWidth, 0)
            this.car.vehicle.addWheel(this.car.wheels.options)

            // Back left
            this.car.wheels.options.chassisConnectionPointLocal.set(this.car.options.wheelBackOffsetDepth, this.car.options.wheelOffsetWidth, 0)
            this.car.vehicle.addWheel(this.car.wheels.options)

            // Back right
            this.car.wheels.options.chassisConnectionPointLocal.set(this.car.options.wheelBackOffsetDepth, - this.car.options.wheelOffsetWidth, 0)
            this.car.vehicle.addWheel(this.car.wheels.options)

            this.car.vehicle.addToWorld(this.world)

            this.car.wheels.indexes = {}

            this.car.wheels.indexes.frontLeft = 0
            this.car.wheels.indexes.frontRight = 1
            this.car.wheels.indexes.backLeft = 2
            this.car.wheels.indexes.backRight = 3
            this.car.wheels.bodies = []

            for(const _wheelInfos of this.car.vehicle.wheelInfos)
            {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)

                body.type = CANNON.Body.KINEMATIC

                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car.wheels.bodies.push(body)
            }

            /**
             * Model
             */
            this.car.model = {}
            this.car.model.container = new THREE.Object3D()
            this.models.container.add(this.car.model.container)

            this.car.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })

            this.car.model.chassis = new THREE.Mesh(new THREE.BoxBufferGeometry(this.car.options.chassisDepth, this.car.options.chassisWidth, this.car.options.chassisHeight), this.car.model.material)
            this.car.model.container.add(this.car.model.chassis)

            this.car.model.wheels = []

            const wheelGeometry = new THREE.CylinderBufferGeometry(this.car.options.wheelRadius, this.car.options.wheelRadius, this.car.options.wheelHeight, 8, 1)

            for(let i = 0; i < 4; i++)
            {
                const wheel = new THREE.Mesh(wheelGeometry, this.car.model.material)
                this.car.model.container.add(wheel)
                this.car.model.wheels.push(wheel)
            }
        }

        /**
         * Destroy method
         */
        this.car.destroy = () =>
        {
            this.car.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car.model.container)
        }

        /**
         * Recreate method
         */
        this.car.recreate = () =>
        {
            this.car.destroy()
            this.car.create()
        }

        // Create the initial car
        this.car.create()

        this.world.addEventListener('postStep', () =>
        {
            // Update wheel bodies
            for(let i = 0; i < this.car.vehicle.wheelInfos.length; i++)
            {
                this.car.vehicle.updateWheelTransform(i)

                const transform = this.car.vehicle.wheelInfos[i].worldTransform
                this.car.wheels.bodies[i].position.copy(transform.position)
                this.car.wheels.bodies[i].quaternion.copy(transform.quaternion)

                // Rotate the wheels on the right
                if(i === 1 || i === 3)
                {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car.wheels.bodies[i].quaternion = this.car.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
        })

        this.time.on('tick', () =>
        {
            // Update chassis model
            this.car.model.chassis.position.copy(this.car.chassis.body.position).add(this.car.options.chassisOffset)
            this.car.model.chassis.quaternion.copy(this.car.chassis.body.quaternion)

            // Update wheel models
            for(const _wheelKey in this.car.wheels.bodies)
            {
                const wheelBody = this.car.wheels.bodies[_wheelKey]
                const wheelMesh = this.car.model.wheels[_wheelKey]

                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
        })

        // Keyboard
        this.car.controls = {}

        this.car.controls.steering = 0
        this.car.controls.accelerating = 0

        this.car.controls.keys = {}
        this.car.controls.keys.ArrowUp = false
        this.car.controls.keys.ArrowRight = false
        this.car.controls.keys.ArrowDown = false
        this.car.controls.keys.ArrowLeft = false

        this.car.controls.events = {}
        this.car.controls.events.down = (_event) =>
        {
            if(typeof this.car.controls.keys[_event.key] !== 'undefined')
            {
                this.car.controls.keys[_event.key] = true
            }
        }

        this.car.controls.events.up = (_event) =>
        {
            if(typeof this.car.controls.keys[_event.key] !== 'undefined')
            {
                this.car.controls.keys[_event.key] = false
            }
        }

        document.addEventListener('keydown', this.car.controls.events.down)
        document.addEventListener('keyup', this.car.controls.events.up)

        this.time.on('tick', () =>
        {
            /**
             * Steering
             */
            const steerStrength = this.time.delta * this.car.options.controlsSteeringSpeed

            // Steer right
            if(this.car.controls.keys.ArrowRight)
            {
                this.car.controls.steering += steerStrength
            }
            // Steer left
            else if(this.car.controls.keys.ArrowLeft)
            {
                this.car.controls.steering -= steerStrength
            }
            // Steer center
            else
            {
                if(Math.abs(this.car.controls.steering) > steerStrength)
                {
                    this.car.controls.steering -= steerStrength * Math.sign(this.car.controls.steering)
                }
                else
                {
                    this.car.controls.steering = 0
                }
            }

            // Clamp steer
            if(Math.abs(this.car.controls.steering) > this.car.options.controlsSteeringMax)
            {
                this.car.controls.steering = Math.sign(this.car.controls.steering) * this.car.options.controlsSteeringMax
            }

            // Update wheels
            this.car.vehicle.setSteeringValue(- this.car.controls.steering, this.car.wheels.indexes.frontLeft)
            this.car.vehicle.setSteeringValue(- this.car.controls.steering, this.car.wheels.indexes.frontRight)

            if(this.car.options.controlsSteeringQuad)
            {
                this.car.vehicle.setSteeringValue(this.car.controls.steering, this.car.wheels.indexes.backLeft)
                this.car.vehicle.setSteeringValue(this.car.controls.steering, this.car.wheels.indexes.backRight)
            }

            /**
             * Moving
             */
            const accelerateStrength = this.time.delta * this.car.options.controlsAcceleratingSpeed

            // Accelerate up
            if(this.car.controls.keys.ArrowUp)
            {
                if(this.car.controls.accelerating < 0)
                {
                    this.car.controls.accelerating = 0
                }

                this.car.controls.accelerating += accelerateStrength
            }
            // Accelerate down
            else if(this.car.controls.keys.ArrowDown)
            {
                if(this.car.controls.accelerating > 0)
                {
                    this.car.controls.accelerating = 0
                }

                this.car.controls.accelerating -= accelerateStrength
            }
            // Steer center
            else
            {
                this.car.controls.accelerating = 0
            }

            // Clamp steer
            if(Math.abs(this.car.controls.accelerating) > this.car.options.controlsAcceleratingMax)
            {
                this.car.controls.accelerating = Math.sign(this.car.controls.accelerating) * this.car.options.controlsAcceleratingMax
            }

            this.car.vehicle.applyEngineForce(- this.car.controls.accelerating, this.car.wheels.indexes.frontLeft)
            this.car.vehicle.applyEngineForce(- this.car.controls.accelerating, this.car.wheels.indexes.frontRight)

            if(this.car.options.controlsSteeringQuad)
            {
                this.car.vehicle.applyEngineForce(- this.car.controls.accelerating, this.car.wheels.indexes.backLeft)
                this.car.vehicle.applyEngineForce(- this.car.controls.accelerating, this.car.wheels.indexes.backRight)
            }
        })

        this.car.brake = () =>
        {
            this.car.vehicle.setBrake(100, 0)
            this.car.vehicle.setBrake(100, 1)
            this.car.vehicle.setBrake(100, 2)
            this.car.vehicle.setBrake(100, 3)
        }

        this.car.unbrake = () =>
        {
            this.car.vehicle.setBrake(0, 0)
            this.car.vehicle.setBrake(0, 1)
            this.car.vehicle.setBrake(0, 2)
            this.car.vehicle.setBrake(0, 3)
        }

        // Debug
        if(this.debug)
        {
            this.car.debugFolder = this.debugFolder.addFolder('car')
            this.car.debugFolder.open()

            this.car.debugFolder.add(this.car.options, 'chassisWidth').step(0.001).min(0).max(5).name('chassisWidth').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'chassisHeight').step(0.001).min(0).max(5).name('chassisHeight').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'chassisDepth').step(0.001).min(0).max(5).name('chassisDepth').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options.chassisOffset, 'z').step(0.001).min(0).max(5).name('chassisOffset').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'chassisMass').step(0.001).min(0).max(1000).name('chassisMass').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelFrontOffsetDepth').step(0.001).min(0).max(5).name('wheelFrontOffsetDepth').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelBackOffsetDepth').step(0.001).min(0).max(5).name('wheelBackOffsetDepth').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelOffsetWidth').step(0.001).min(0).max(5).name('wheelOffsetWidth').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelRadius').step(0.001).min(0).max(2).name('wheelRadius').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelHeight').step(0.001).min(0).max(2).name('wheelHeight').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelSuspensionStiffness').step(0.001).min(0).max(300).name('wheelSuspensionStiffness').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelSuspensionRestLength').step(0.001).min(0).max(5).name('wheelSuspensionRestLength').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelFrictionSlip').step(0.001).min(0).max(30).name('wheelFrictionSlip').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelDampingRelaxation').step(0.001).min(0).max(30).name('wheelDampingRelaxation').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelDampingCompression').step(0.001).min(0).max(30).name('wheelDampingCompression').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelMaxSuspensionForce').step(0.001).min(0).max(1000000).name('wheelMaxSuspensionForce').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelRollInfluence').step(0.001).min(0).max(1).name('wheelRollInfluence').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelMaxSuspensionTravel').step(0.001).min(0).max(5).name('wheelMaxSuspensionTravel').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelCustomSlidingRotationalSpeed').step(0.001).min(0).max(45).name('wheelCustomSlidingRotationalSpeed').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelMass').step(0.001).min(0).max(1000).name('wheelMass').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'controlsSteeringSpeed').step(0.001).min(0).max(0.1).name('controlsSteeringSpeed')
            this.car.debugFolder.add(this.car.options, 'controlsSteeringMax').step(0.001).min(0).max(Math.PI * 0.5).name('controlsSteeringMax')
            this.car.debugFolder.add(this.car.options, 'controlsSteeringQuad').name('controlsSteeringQuad')
            this.car.debugFolder.add(this.car.options, 'controlsAcceleratingSpeed').step(0.001).min(0).max(30).name('controlsAcceleratingSpeed')
            this.car.debugFolder.add(this.car.options, 'controlsAcceleratingMax').step(0.001).min(0).max(1000).name('controlsAcceleratingMax')
            this.car.debugFolder.add(this.car.options, 'controlsAcceleratingQuad').name('controlsAcceleratingQuad')
            this.car.debugFolder.add(this.car, 'recreate')
            this.car.debugFolder.add(this.car, 'brake')
            this.car.debugFolder.add(this.car, 'unbrake')
        }
    }

    addObjectFromThree(_options)
    {
        // Set up
        const collision = {}

        collision.model = {}
        collision.model.meshes = []
        collision.model.container = new THREE.Object3D()
        this.models.container.add(collision.model.container)

        collision.children = []

        // Material
        const bodyMaterial = this.materials.items.dummy

        // Body
        collision.body = new CANNON.Body({
            position: new Vec3(_options.offset.x, _options.offset.y, _options.offset.z),
            mass: _options.mass,
            material: bodyMaterial
        })
        this.world.addBody(collision.body)

        // Center
        collision.center = new Vec3(0, 0, 0)

        // Shapes
        const shapes = []

        // Each mesh
        for(let i = 0; i < _options.meshes.length; i++)
        {
            const mesh = _options.meshes[i]

            // Define shape
            let shape = null

            if(mesh.name.match(/^cube_?[0-9]{0,3}?|box[0-9]{0,3}?$/i))
            {
                shape = 'box'
            }
            else if(mesh.name.match(/^cylinder_?[0-9]{0,3}?$/i))
            {
                shape = 'cylinder'
            }
            else if(mesh.name.match(/^sphere_?[0-9]{0,3}?$/i))
            {
                shape = 'sphere'
            }
            else if(mesh.name.match(/^center_?[0-9]{0,3}?$/i))
            {
                shape = 'center'
            }

            // Shape is the center
            if(shape === 'center')
            {
                collision.center.set(mesh.position.x, mesh.position.y, mesh.position.z)
            }

            // Other shape
            else if(shape)
            {
                // Geometry
                let shapeGeometry = null

                if(shape === 'cylinder')
                {
                    shapeGeometry = new CANNON.Cylinder(mesh.scale.x, mesh.scale.x, mesh.scale.y, 8)
                }
                else if(shape === 'box')
                {
                    const halfExtents = new CANNON.Vec3(mesh.scale.x * 0.5, mesh.scale.y * 0.5, mesh.scale.z * 0.5)
                    shapeGeometry = new CANNON.Box(halfExtents)
                }
                else if(shape === 'sphere')
                {
                    shapeGeometry = new CANNON.Sphere(mesh.scale.x)
                }

                // Position
                const shapePosition = new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z)

                // Quaternion
                const shapeQuaternion = new CANNON.Quaternion(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w)
                if(shape === 'cylinder')
                {
                    // Rotate cylinder
                    // shapeQuaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI * 0.5)
                }

                // Save
                shapes.push({ shapeGeometry, shapePosition, shapeQuaternion })

                // Create model object
                let modelGeometry = null
                if(shape === 'cylinder')
                {
                    modelGeometry = new THREE.CylinderBufferGeometry(1, 1, 1, 8, 1)
                    modelGeometry.rotateX(Math.PI * 0.5)
                }
                else if(shape === 'box')
                {
                    modelGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
                }
                else if(shape === 'sphere')
                {
                    modelGeometry = new THREE.SphereBufferGeometry(1, 8, 8)
                }

                const modelMesh = new THREE.Mesh(modelGeometry, this.models.materials[_options.mass === 0 ? 'static' : 'dynamic'])
                modelMesh.position.copy(mesh.position)
                modelMesh.scale.copy(mesh.scale)
                modelMesh.quaternion.copy(mesh.quaternion)

                collision.model.meshes.push(modelMesh)
            }
        }

        // Update meshes to match center
        for(const _mesh of collision.model.meshes)
        {
            _mesh.position.x -= collision.center.x
            _mesh.position.y -= collision.center.y
            _mesh.position.z -= collision.center.z

            collision.model.container.add(_mesh)
        }

        // Update shapes to match center
        for(const _shape of shapes)
        {
            // Create physic object
            _shape.shapePosition.x -= collision.center.x
            _shape.shapePosition.y -= collision.center.y
            _shape.shapePosition.z -= collision.center.z

            collision.body.addShape(_shape.shapeGeometry, _shape.shapePosition, _shape.shapeQuaternion)
        }

        // Update body to match center
        collision.body.position.x += collision.center.x
        collision.body.position.y += collision.center.y
        collision.body.position.z += collision.center.z

        // Time tick update
        this.time.on('tick', () =>
        {
            collision.model.container.position.set(collision.body.position.x, collision.body.position.y, collision.body.position.z)
            collision.model.container.quaternion.set(collision.body.quaternion.x, collision.body.quaternion.y, collision.body.quaternion.z, collision.body.quaternion.w)
        })

        return collision
    }
}
