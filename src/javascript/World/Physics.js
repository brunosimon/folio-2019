import CANNON from 'cannon'
import * as THREE from 'three'

export default class Physics
{
    constructor(_options)
    {
        this.config = _options.config
        this.debug = _options.debug
        this.time = _options.time
        this.sizes = _options.sizes
        this.controls = _options.controls
        this.sounds = _options.sounds

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
            this.world.step(this.time.delta / 1000)
        })
    }

    setWorld()
    {
        this.world = new CANNON.World()
        this.world.gravity.set(0, 0, - 3.25 * 4)
        this.world.allowSleep = true
        // this.world.broadphase = new CANNON.SAPBroadphase(this.world)
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
        this.models.materials.dynamicSleeping = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true })

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this.models.container, 'visible').name('modelsVisible')
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

        this.materials.contacts.floorDummy = new CANNON.ContactMaterial(this.materials.items.floor, this.materials.items.dummy, { friction: 0.05, restitution: 0.3, contactEquationStiffness: 1000 })
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

        this.car.steering = 0
        this.car.accelerating = 0
        this.car.speed = 0
        this.car.worldForward = new CANNON.Vec3()
        this.car.angle = 0
        this.car.forwardSpeed = 0
        this.car.oldPosition = new CANNON.Vec3()
        this.car.goingForward = true

        /**
         * Options
         */
        this.car.options = {}
        this.car.options.chassisWidth = 1.02
        this.car.options.chassisHeight = 1.16
        this.car.options.chassisDepth = 2.03
        this.car.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car.options.chassisMass = 40
        this.car.options.wheelFrontOffsetDepth = 0.635
        this.car.options.wheelBackOffsetDepth = - 0.475
        this.car.options.wheelOffsetWidth = 0.39
        this.car.options.wheelRadius = 0.25
        this.car.options.wheelHeight = 0.24
        this.car.options.wheelSuspensionStiffness = 50
        this.car.options.wheelSuspensionRestLength = 0.1
        this.car.options.wheelFrictionSlip = 10
        this.car.options.wheelDampingRelaxation = 1.8
        this.car.options.wheelDampingCompression = 1.5
        this.car.options.wheelMaxSuspensionForce = 100000
        this.car.options.wheelRollInfluence =  0.01
        this.car.options.wheelMaxSuspensionTravel = 0.3
        this.car.options.wheelCustomSlidingRotationalSpeed = - 30
        this.car.options.wheelMass = 5
        this.car.options.controlsSteeringSpeed = 0.005 * 3
        this.car.options.controlsSteeringMax = Math.PI * 0.17
        this.car.options.controlsSteeringQuad = false
        this.car.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car.options.controlsAcceleratingQuad = true
        this.car.options.controlsBrakeStrength = 0.45 * 3

        /**
         * Upsize down
         */
        this.car.upsideDown = {}
        this.car.upsideDown.state = 'watching' // 'wathing' | 'pending' | 'turning'
        this.car.upsideDown.pendingTimeout = null
        this.car.upsideDown.turningTimeout = null

        /**
         * Jump
         */
        this.car.jump = (_toReturn = true, _strength = 150) =>
        {
            let worldPosition = this.car.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }

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
            this.car.chassis.body.allowSleep = false
            this.car.chassis.body.position.set(0, 0, 12)
            this.car.chassis.body.sleep()
            this.car.chassis.body.addShape(this.car.chassis.shape, this.car.options.chassisOffset)
            this.car.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), - Math.PI * 0.5)

            /**
             * Sound
             */
            this.car.chassis.body.addEventListener('collide', (_event) =>
            {
                if(_event.body.mass === 0)
                {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })

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

            this.car.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car.options.chassisDepth, this.car.options.chassisWidth, this.car.options.chassisHeight), this.car.model.material)
            this.car.model.container.add(this.car.model.chassis)

            this.car.model.wheels = []

            const wheelGeometry = new THREE.CylinderGeometry(this.car.options.wheelRadius, this.car.options.wheelRadius, this.car.options.wheelHeight, 8, 1)

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
            this.car.chassis.body.wakeUp()
        }

        /**
         * Brake
         */
        this.car.brake = () =>
        {
            this.car.vehicle.setBrake(1, 0)
            this.car.vehicle.setBrake(1, 1)
            this.car.vehicle.setBrake(1, 2)
            this.car.vehicle.setBrake(1, 3)
        }

        /**
         * Unbrake
         */
        this.car.unbrake = () =>
        {
            this.car.vehicle.setBrake(0, 0)
            this.car.vehicle.setBrake(0, 1)
            this.car.vehicle.setBrake(0, 2)
            this.car.vehicle.setBrake(0, 3)
        }

        /**
         * Actions
         */
        this.controls.on('action', (_name) =>
        {
            switch(_name)
            {
                case 'reset':
                    this.car.recreate()
                    break
            }
        })

        /**
         * Cannon tick
         */
        this.world.addEventListener('postStep', () =>
        {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car.oldPosition)

            this.car.oldPosition.copy(this.car.chassis.body.position)
            this.car.speed = positionDelta.length() / this.time.delta

            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car.chassis.body.vectorToWorldFrame(localForward, this.car.worldForward)
            this.car.angle = Math.atan2(this.car.worldForward.y, this.car.worldForward.x)

            this.car.forwardSpeed = this.car.worldForward.dot(positionDelta)
            this.car.goingForward = this.car.forwardSpeed > 0

            // Updise down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car.chassis.body.vectorToWorldFrame(localUp, worldUp)

            if(worldUp.dot(localUp) < 0.5)
            {
                if(this.car.upsideDown.state === 'watching')
                {
                    this.car.upsideDown.state = 'pending'
                    this.car.upsideDown.pendingTimeout = window.setTimeout(() =>
                    {
                        this.car.upsideDown.state = 'turning'
                        this.car.jump(true)

                        this.car.upsideDown.turningTimeout = window.setTimeout(() =>
                        {
                            this.car.upsideDown.state = 'watching'
                        }, 1000)
                    }, 1000)
                }
            }
            else
            {
                if(this.car.upsideDown.state === 'pending')
                {
                    this.car.upsideDown.state = 'watching'
                    window.clearTimeout(this.car.upsideDown.pendingTimeout)
                }
            }

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

            // Slow down back
            if(!this.controls.actions.up && !this.controls.actions.down)
            {
                let slowDownForce = this.car.worldForward.clone()

                if(this.car.goingForward)
                {
                    slowDownForce = slowDownForce.negate()
                }

                slowDownForce = slowDownForce.scale(this.car.chassis.body.velocity.length() * 0.1)

                this.car.chassis.body.applyImpulse(slowDownForce, this.car.chassis.body.position)
            }
        })

        /**
         * Time tick
         */
        this.time.on('tick', () =>
        {
            /**
             * Body
             */
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

            /**
             * Steering
             */
            if(this.controls.touch)
            {
                let deltaAngle = 0

                if(this.controls.touch.joystick.active)
                {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < - Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }

                // Update steering directly
                const goingForward = Math.abs(this.car.forwardSpeed) < 0.01 ? true : this.car.goingForward
                this.car.steering = deltaAngle * (goingForward ? - 1 : 1)

                // Clamp steer
                if(Math.abs(this.car.steering) > this.car.options.controlsSteeringMax)
                {
                    this.car.steering = Math.sign(this.car.steering) * this.car.options.controlsSteeringMax
                }
            }

            if(!this.controls.touch || !this.controls.touch.joystick.active)
            {
                const steerStrength = this.time.delta * this.car.options.controlsSteeringSpeed

                // Steer right
                if(this.controls.actions.right)
                {
                    this.car.steering += steerStrength
                }
                // Steer left
                else if(this.controls.actions.left)
                {
                    this.car.steering -= steerStrength
                }
                // Steer center
                else
                {
                    if(Math.abs(this.car.steering) > steerStrength)
                    {
                        this.car.steering -= steerStrength * Math.sign(this.car.steering)
                    }
                    else
                    {
                        this.car.steering = 0
                    }
                }

                // Clamp steer
                if(Math.abs(this.car.steering) > this.car.options.controlsSteeringMax)
                {
                    this.car.steering = Math.sign(this.car.steering) * this.car.options.controlsSteeringMax
                }
            }

            // Update wheels
            this.car.vehicle.setSteeringValue(- this.car.steering, this.car.wheels.indexes.frontLeft)
            this.car.vehicle.setSteeringValue(- this.car.steering, this.car.wheels.indexes.frontRight)

            if(this.car.options.controlsSteeringQuad)
            {
                this.car.vehicle.setSteeringValue(this.car.steering, this.car.wheels.indexes.backLeft)
                this.car.vehicle.setSteeringValue(this.car.steering, this.car.wheels.indexes.backRight)
            }

            /**
             * Accelerate
             */
            const accelerationSpeed = this.controls.actions.boost ? this.car.options.controlsAcceleratingSpeedBoost : this.car.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car.options.controlsAcceleratinMaxSpeedBoost : this.car.options.controlsAcceleratinMaxSpeed

            // Accelerate up
            if(this.controls.actions.up)
            {
                if(this.car.speed < controlsAcceleratinMaxSpeed || !this.car.goingForward)
                {
                    this.car.accelerating = accelerateStrength
                }
                else
                {
                    this.car.accelerating = 0
                }
            }

            // Accelerate Down
            else if(this.controls.actions.down)
            {
                if(this.car.speed < controlsAcceleratinMaxSpeed || this.car.goingForward)
                {
                    this.car.accelerating = - accelerateStrength
                }
                else
                {
                    this.car.accelerating = 0
                }
            }
            else
            {
                this.car.accelerating = 0
            }

            this.car.vehicle.applyEngineForce(- this.car.accelerating, this.car.wheels.indexes.backLeft)
            this.car.vehicle.applyEngineForce(- this.car.accelerating, this.car.wheels.indexes.backRight)

            if(this.car.options.controlsSteeringQuad)
            {
                this.car.vehicle.applyEngineForce(- this.car.accelerating, this.car.wheels.indexes.frontLeft)
                this.car.vehicle.applyEngineForce(- this.car.accelerating, this.car.wheels.indexes.frontRight)
            }

            /**
             * Brake
             */
            if(this.controls.actions.brake)
            {
                this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 0)
                this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 1)
                this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 2)
                this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 3)
            }
            else
            {
                this.car.vehicle.setBrake(0, 0)
                this.car.vehicle.setBrake(0, 1)
                this.car.vehicle.setBrake(0, 2)
                this.car.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car.create()

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
            this.car.debugFolder.add(this.car.options, 'wheelBackOffsetDepth').step(0.001).min(- 5).max(0).name('wheelBackOffsetDepth').onFinishChange(this.car.recreate)
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
            this.car.debugFolder.add(this.car.options, 'wheelCustomSlidingRotationalSpeed').step(0.001).min(- 45).max(45).name('wheelCustomSlidingRotationalSpeed').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelMass').step(0.001).min(0).max(1000).name('wheelMass').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'controlsSteeringSpeed').step(0.001).min(0).max(0.1).name('controlsSteeringSpeed')
            this.car.debugFolder.add(this.car.options, 'controlsSteeringMax').step(0.001).min(0).max(Math.PI * 0.5).name('controlsSteeringMax')
            this.car.debugFolder.add(this.car.options, 'controlsSteeringQuad').name('controlsSteeringQuad')
            this.car.debugFolder.add(this.car.options, 'controlsAcceleratingSpeed').step(0.001).min(0).max(30).name('controlsAcceleratingSpeed')
            this.car.debugFolder.add(this.car.options, 'controlsAcceleratingSpeedBoost').step(0.001).min(0).max(30).name('controlsAcceleratingSpeedBoost')
            this.car.debugFolder.add(this.car.options, 'controlsAcceleratingQuad').name('controlsAcceleratingQuad')
            this.car.debugFolder.add(this.car.options, 'controlsBrakeStrength').step(0.001).min(0).max(5).name('controlsBrakeStrength')
            this.car.debugFolder.add(this.car, 'recreate')
            this.car.debugFolder.add(this.car, 'jump')
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
            position: new CANNON.Vec3(_options.offset.x, _options.offset.y, _options.offset.z),
            mass: _options.mass,
            material: bodyMaterial
        })
        collision.body.allowSleep = true
        collision.body.sleepSpeedLimit = 0.01
        if(_options.sleep)
        {
            collision.body.sleep()
        }

        this.world.addBody(collision.body)

        // Rotation
        if(_options.rotation)
        {
            const rotationQuaternion = new CANNON.Quaternion()
            rotationQuaternion.setFromEuler(_options.rotation.x, _options.rotation.y, _options.rotation.z, _options.rotation.order)
            collision.body.quaternion = collision.body.quaternion.mult(rotationQuaternion)
        }

        // Center
        collision.center = new CANNON.Vec3(0, 0, 0)

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
                    shapeGeometry = new CANNON.Cylinder(mesh.scale.x, mesh.scale.x, mesh.scale.z, 8)
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
                    modelGeometry = new THREE.CylinderGeometry(1, 1, 1, 8, 1)
                    modelGeometry.rotateX(Math.PI * 0.5)
                }
                else if(shape === 'box')
                {
                    modelGeometry = new THREE.BoxGeometry(1, 1, 1)
                }
                else if(shape === 'sphere')
                {
                    modelGeometry = new THREE.SphereGeometry(1, 8, 8)
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

        // Save origin
        collision.origin = {}
        collision.origin.position = collision.body.position.clone()
        collision.origin.quaternion = collision.body.quaternion.clone()
        collision.origin.sleep = _options.sleep

        // Time tick update
        this.time.on('tick', () =>
        {
            collision.model.container.position.set(collision.body.position.x, collision.body.position.y, collision.body.position.z)
            collision.model.container.quaternion.set(collision.body.quaternion.x, collision.body.quaternion.y, collision.body.quaternion.z, collision.body.quaternion.w)

            if(this.models.container.visible && _options.mass > 0)
            {
                for(const _mesh of collision.model.container.children)
                {
                    _mesh.material = collision.body.sleepState === 2 ? this.models.materials.dynamicSleeping : this.models.materials.dynamic
                }
            }
        })

        // Reset
        collision.reset = () =>
        {
            collision.body.position.copy(collision.origin.position)
            collision.body.quaternion.copy(collision.origin.quaternion)

            if(collision.origin.sleep)
            {
                collision.body.sleep()
            }
        }

        return collision
    }
}
