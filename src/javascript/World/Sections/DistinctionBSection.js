import * as THREE from 'three'

export default class DistinctionBSection
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.walls = _options.walls
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setStatic()
        this.setCones()
        this.setWall()
    }

    setStatic()
    {
        this.objects.add({
            base: this.resources.items.distinctionBStaticBase.scene,
            collision: this.resources.items.distinctionBStaticCollision.scene,
            floorShadowTexture: this.resources.items.distinctionBStaticFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0
        })
    }

    setCones()
    {
        const positions = [
            [3, 8],
            [3, 4],
            [3, 0],
            [3, - 4],

            [- 3, 8],
            [- 3, 4],
            [- 3, 0],
            [- 3, - 4]
        ]

        for(const _position of positions)
        {
            this.objects.add({
                base: this.resources.items.coneBase.scene,
                collision: this.resources.items.coneCollision.scene,
                offset: new THREE.Vector3(this.x + _position[0], this.y + _position[1], 0),
                rotation: new THREE.Euler(0, 0, 0),
                duplicated: true,
                shadow: { sizeX: 2, sizeY: 2, offsetZ: - 0.5, alpha: 0.5 },
                mass: 0.6,
                soundName: 'woodHit'
            })
        }
    }

    setWall()
    {
        // Set up
        this.wall = {}
        this.wall.x = this.x + 0
        this.wall.y = this.y - 18
        this.wall.items = []

        this.walls.add({
            object:
            {
                base: this.resources.items.projectsDistinctionsFWABase.scene,
                collision: this.resources.items.projectsDistinctionsFWACollision.scene,
                offset: new THREE.Vector3(0, 0, 0.1),
                rotation: new THREE.Euler(0, 0, 0),
                duplicated: true,
                shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },
                mass: 0.5,
                soundName: 'brick'
            },
            shape:
            {
                type: 'brick',
                widthCount: 4,
                heightCount: 7,
                position: new THREE.Vector3(this.wall.x, this.wall.y, 0),
                offsetWidth: new THREE.Vector3(1.7, 0, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.4)
            }
        })
    }
}
