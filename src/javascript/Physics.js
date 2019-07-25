import CANNON from 'cannon'
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

        this.world = new CANNON.World()
        this.world.gravity.set(0, 0, - 1) // 9.82

        this.setModels()
        this.setMaterials()
        this.setFloor()
        this.setDummy()

        this.time.on('tick', () =>
        {
            this.world.step(1 / 60, this.time.delta, 3)
        })
    }

    setModels()
    {
        this.models = {}
        this.models.container = new THREE.Object3D()
        this.models.container.visible = false
        this.models.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })

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

        // Contact between materials
        this.materials.contacts = {}
        this.materials.contacts.floorDummy = new CANNON.ContactMaterial(this.materials.items.floor, this.materials.items.dummy, { friction: 0.5, restitution: 0.3 })
        this.world.addContactMaterial(this.materials.contacts.floorDummy)
    }

    setFloor()
    {
        this.floor = {}
        this.floor.body = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            material: this.materials.items.floor
        })
        this.world.addBody(this.floor.body)
    }

    setDummy()
    {
        this.dummy = {}

        // Sphere
        this.dummy.sphere = new CANNON.Body({
            mass: 2,
            position: new CANNON.Vec3(0, 0, 4),
            shape: new CANNON.Sphere(1),
            material: this.materials.items.dummy
        })
        this.world.addBody(this.dummy.sphere)
    }

    addObjectFromThree(_objectOptions)
    {
        const object = {}
        object.type = _objectOptions.type

        // Position
        const position = new CANNON.Vec3(_objectOptions.position.x, _objectOptions.position.z, _objectOptions.position.y)

        // Rotation
        const rotation = new CANNON.Quaternion(_objectOptions.quaternion.x, _objectOptions.quaternion.y, _objectOptions.quaternion.z, _objectOptions.quaternion.w)

        // Material
        const material = this.materials.items.dummy

        // Shape
        let shape = null

        if(_objectOptions.shape === 'cylinder')
        {
            shape = new CANNON.Cylinder(_objectOptions.scale.x, _objectOptions.scale.x, _objectOptions.scale.y, 8)
        }
        else if(_objectOptions.shape === 'box')
        {
            const halfExtents = new CANNON.Vec3(_objectOptions.scale.x * 0.5, _objectOptions.scale.z * 0.5, _objectOptions.scale.y * 0.5)
            shape = new CANNON.Box(halfExtents)
        }
        else if(_objectOptions.shape === 'sphere')
        {
            shape = new CANNON.Sphere(_objectOptions.scale.x)
        }

        // Mass
        let mass = null

        if(object.type === 'static')
        {
            mass = 0
        }
        else
        {
            mass = 2
        }

        // Create physic object
        object.physic = new CANNON.Body({ mass, position, rotation, shape, material })
        this.world.addBody(object.physic)

        // Create model object
        let geometry = null
        if(_objectOptions.shape === 'cylinder')
        {
            geometry = new THREE.CylinderBufferGeometry(1, 1, 1, 8, 1)
        }
        else if(_objectOptions.shape === 'box')
        {
            geometry = new THREE.BoxBufferGeometry(1, 1, 1)
        }
        else if(_objectOptions.shape === 'sphere')
        {
            geometry = new THREE.SphereBufferGeometry(1, 8, 8)
        }

        object.model = new THREE.Mesh(geometry, this.models.material)
        object.model.position.copy(_objectOptions.position)
        object.model.scale.copy(_objectOptions.scale)
        object.model.quaternion.copy(_objectOptions.quaternion)

        this.models.container.add(object.model)

        return object
    }
}
