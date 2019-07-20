import CANNON from 'cannon'

export default class Physics
{
    constructor(_options)
    {
        this.debug = _options.debug
        this.time = _options.time

        this.world = new CANNON.World()
        this.world.gravity.set(0, 0, - 9.82)

        this.setMaterials()
        this.setFloor()
        this.setDummy()

        this.time.on('tick', () =>
        {
            this.world.step(1 / 60, this.time.delta, 3)
        })
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

        this.time.on('tick', () =>
        {

        })
    }
}
