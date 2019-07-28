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
        this.world.gravity.set(0, - 1, 0)

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this.world.gravity, 'y').step(0.001).min(- 5).max(5).name('gravity')
        }
    }

    setModels()
    {
        this.models = {}
        this.models.container = new THREE.Object3D()
        this.models.container.visible = true
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
        this.materials.items.floor = new CANNON.Material()
        this.materials.items.dummy = new CANNON.Material()
        this.materials.items.wheel = new CANNON.Material()

        // Contact between materials
        this.materials.contacts = {}

        this.materials.contacts.floorDummy = new CANNON.ContactMaterial(this.materials.items.floor, this.materials.items.dummy, { friction: 0.5, restitution: 0.3 })
        this.world.addContactMaterial(this.materials.contacts.floorDummy)

        this.materials.contacts.dummyDummy = new CANNON.ContactMaterial(this.materials.items.dummy, this.materials.items.dummy, { friction: 0.5, restitution: 0.3 })
        this.world.addContactMaterial(this.materials.contacts.dummyDummy)

        this.materials.contacts.floorWheel = new CANNON.ContactMaterial(this.materials.items.floor, this.materials.items.wheel, { friction: 0.5, restitution: 0 })
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

        this.floor.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI * 0.5)

        this.world.addBody(this.floor.body)
    }

    setCar()
    {
        this.car = {}

        /**
         * Chassis
         */
        this.car.chassis = {}
        this.car.chassis.body = new CANNON.Body({ mass: 150 })
        this.car.chassis.body.position.x = 3
        this.car.chassis.body.position.y = 2
        this.car.chassis.body.position.z = 3

        this.car.chassis.shape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1))
        this.car.chassis.body.addShape(this.car.chassis.shape)
        // this.car.chassis.body.angularVelocity.set(0, 0, 0.5)

        /**
         * Vehicle
         */
        this.car.vehicle = new CANNON.RaycastVehicle({
            chassisBody: this.car.chassis.body,
            indexRightAxis: 2
        })

        this.car.vehicle.addToWorld(this.world)

        /**
         * Wheel
         */
        this.car.wheels = {}
        this.car.wheels.options = {
            radius: 0.5,
            directionLocal: new CANNON.Vec3(0, - 1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 5,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence:  0.01,
            axleLocal: new CANNON.Vec3(0, 0, 1),
            chassisConnectionPointLocal: new CANNON.Vec3(1, 0, 1),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: - 30,
            useCustomSlidingRotationalSpeed: true
        }

        this.car.wheels.options.chassisConnectionPointLocal.set(1, 0, 1)
        this.car.vehicle.addWheel(this.car.wheels.options)

        this.car.wheels.options.chassisConnectionPointLocal.set(1, 0, - 1)
        this.car.vehicle.addWheel(this.car.wheels.options)

        this.car.wheels.options.chassisConnectionPointLocal.set(- 1, 0, 1)
        this.car.vehicle.addWheel(this.car.wheels.options)

        this.car.wheels.options.chassisConnectionPointLocal.set(- 1, 0, - 1)
        this.car.vehicle.addWheel(this.car.wheels.options)

        this.car.wheels.bodies = []

        for(const _wheelInfos of this.car.vehicle.wheelInfos)
        {
            const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, _wheelInfos.radius / 2, 20)
            const body = new CANNON.Body({ mass: 1 })
            const quaternion = new CANNON.Quaternion()
            // quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)

            body.addShape(shape, new CANNON.Vec3(), quaternion)
            this.car.wheels.bodies.push(body)
        }

        this.world.addEventListener('postStep', () =>
        {
            for(let i = 0; i < this.car.vehicle.wheelInfos.length; i++)
            {
                this.car.vehicle.updateWheelTransform(i)
            }
        })

        // Model
        this.car.model = {}
        this.car.model.container = new THREE.Object3D()
        this.models.container.add(this.car.model.container)

        this.car.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })

        this.car.model.chassis = new THREE.Mesh(new THREE.BoxBufferGeometry(2 * 2, 0.5 * 2, 1 * 2), this.car.model.material)
        this.car.model.container.add(this.car.model.chassis)

        this.car.model.wheels = []

        const wheelGeometry = new THREE.CylinderBufferGeometry(1, 1, 1, 8, 1)

        for(let i = 0; i < this.car.wheels.bodies.length; i++)
        {
            const wheel = new THREE.Mesh(wheelGeometry, this.car.model.material)
            this.car.model.container.add(wheel)
            this.car.model.wheels.push(wheel)
        }

        this.time.on('tick', () =>
        {
            this.car.model.chassis.position.x = this.car.chassis.body.position.x
            this.car.model.chassis.position.y = this.car.chassis.body.position.y
            this.car.model.chassis.position.z = this.car.chassis.body.position.z

            this.car.model.chassis.quaternion.x = this.car.chassis.body.quaternion.x
            this.car.model.chassis.quaternion.y = this.car.chassis.body.quaternion.y
            this.car.model.chassis.quaternion.z = this.car.chassis.body.quaternion.z
            this.car.model.chassis.quaternion.w = this.car.chassis.body.quaternion.w

            for(const _wheelKey in this.car.vehicle.wheelInfos)
            {
                const transform = this.car.vehicle.wheelInfos[_wheelKey].worldTransform
                const wheelMesh = this.car.model.wheels[_wheelKey]

                wheelMesh.position.x = transform.position.x
                wheelMesh.position.y = transform.position.y
                wheelMesh.position.z = transform.position.z

                wheelMesh.quaternion.x = transform.quaternion.x
                wheelMesh.quaternion.y = transform.quaternion.y
                wheelMesh.quaternion.z = transform.quaternion.z
                wheelMesh.quaternion.w = transform.quaternion.w
            }
        })

        // Keyboard
        this.car.controls = {}

        this.car.controls.maxSteerVal = 0.5
        this.car.controls.maxForce = 1000
        this.car.controls.brakeForce = 1000000

        this.car.controls.up = false
        this.car.controls.right = false
        this.car.controls.down = false
        this.car.controls.left = false

        this.car.controls.events = {}
        this.car.controls.events.down = (_event) =>
        {
            if(_event.key === 'ArrowUp')
            {
                this.car.vehicle.applyEngineForce(- this.car.controls.maxForce, 0)
                this.car.vehicle.applyEngineForce(- this.car.controls.maxForce, 1)
                this.car.vehicle.applyEngineForce(- this.car.controls.maxForce, 2)
                this.car.vehicle.applyEngineForce(- this.car.controls.maxForce, 3)
                this.car.controls.up = true
            }
            else if(_event.key === 'ArrowRight')
            {
                this.car.controls.right = true
            }
            else if(_event.key === 'ArrowDown')
            {
                this.car.controls.down = true
            }
            else if(_event.key === 'ArrowLeft')
            {
                this.car.controls.left = true
            }
        }

        this.car.controls.events.up = (_event) =>
        {
            if(_event.key === 'ArrowUp')
            {
                this.car.controls.up = false
            }
            else if(_event.key === 'ArrowRight')
            {
                this.car.controls.right = false
            }
            else if(_event.key === 'ArrowDown')
            {
                this.car.controls.down = false
            }
            else if(_event.key === 'ArrowLeft')
            {
                this.car.controls.left = false
            }
        }

        document.addEventListener('keydown', this.car.controls.events.down)
        document.addEventListener('keyup', this.car.controls.events.up)
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

            if(mesh.name.match(/^cube[0-9]{0,3}?|box[0-9]{0,3}?$/i))
            {
                shape = 'box'
            }
            else if(mesh.name.match(/^cylinder[0-9]{0,3}?$/i))
            {
                shape = 'cylinder'
            }
            else if(mesh.name.match(/^sphere[0-9]{0,3}?$/i))
            {
                shape = 'sphere'
            }
            else if(mesh.name.match(/^center[0-9]{0,3}?$/i))
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
                    shapeQuaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI * 0.5)
                }

                // Save
                shapes.push({ shapeGeometry, shapePosition, shapeQuaternion })

                // Create model object
                let modelGeometry = null
                if(shape === 'cylinder')
                {
                    modelGeometry = new THREE.CylinderBufferGeometry(1, 1, 1, 8, 1)
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
