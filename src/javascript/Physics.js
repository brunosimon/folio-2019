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
        this.models.container.visible = true
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

    addObjectFromThree(_options)
    {
        // Set up
        const collision = {}

        collision.type = _options.type

        collision.container = new THREE.Object3D()
        this.models.container.add(collision.container)

        collision.children = []

        // Mass
        let bodyMass = null

        if(collision.type === 'static')
        {
            bodyMass = 0
        }
        else
        {
            bodyMass = 2
        }

        // Material
        const bodyMaterial = this.materials.items.dummy

        // Body
        collision.body = new CANNON.Body({
            mass: bodyMass,
            material: bodyMaterial
        })
        this.world.addBody(collision.body)

        // Each mesh
        for(let i = 0; i < _options.meshes.length; i++)
        {
            const object = {}
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

            // Shape found
            if(shape)
            {
                // Position
                const bodyPosition = new CANNON.Vec3(mesh.position.x, mesh.position.z, mesh.position.y)

                // Quaternion
                const bodyQuaternion = new CANNON.Quaternion(mesh.quaternion.x, mesh.quaternion.z, mesh.quaternion.y, mesh.quaternion.w)

                // Body shape
                let bodyShape = null

                if(shape === 'cylinder')
                {
                    bodyShape = new CANNON.Cylinder(mesh.scale.x, mesh.scale.x, mesh.scale.y, 8)
                }
                else if(shape === 'box')
                {
                    const halfExtents = new CANNON.Vec3(mesh.scale.x * 0.5, mesh.scale.z * 0.5, mesh.scale.y * 0.5)
                    bodyShape = new CANNON.Box(halfExtents)
                }
                else if(shape === 'sphere')
                {
                    bodyShape = new CANNON.Sphere(mesh.scale.x)
                }

                // Create physic object
                collision.body.addShape(bodyShape, bodyPosition, bodyQuaternion)
                // object.body = new CANNON.Body({
                //     mass: bodyMass,
                //     position: bodyPosition,
                //     rotation: bodyRotation,
                //     shape: bodyShape,
                //     material: bodyMaterial
                // })
                // this.world.addBody(object.body)

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

                object.modelMesh = new THREE.Mesh(modelGeometry, this.models.material)
                object.modelMesh.position.copy(mesh.position)
                object.modelMesh.scale.copy(mesh.scale)
                object.modelMesh.quaternion.copy(mesh.quaternion)

                collision.container.add(object.modelMesh)
            }
        }

        return collision
    }
}
