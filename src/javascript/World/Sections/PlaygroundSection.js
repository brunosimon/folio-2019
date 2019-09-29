import * as THREE from 'three'

export default class PlaygroundSection
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.walls = _options.walls
        this.tiles = _options.tiles
        this.debug = _options.debug

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.x = 0
        this.y = 0

        // this.setStatic()
        this.setBricksWalls()
    }

    setStatic()
    {
        this.objects.add({
            base: this.resources.items.playgroundStaticBase.scene,
            collision: this.resources.items.playgroundStaticBase.scene,
            floorShadowTexture: this.resources.items.playgroundStaticFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0
        })
    }

    setBricksWalls()
    {
        this.brickWalls = {}
        this.brickWalls.x = - 5
        this.brickWalls.y = 0
        this.brickWalls.objectOptions = {
            base: this.resources.items.informationBrickBase.scene,
            collision: this.resources.items.informationBrickCollision.scene,
            offset: new THREE.Vector3(0, 0, 0.1),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },
            mass: 0.5,
            // sleep: false
        }

        this.walls.add({
            object: this.brickWalls.objectOptions,
            shape:
            {
                type: 'rectangle',
                widthCount: 5,
                heightCount: 6,
                position: new THREE.Vector3(this.brickWalls.x + 0, this.brickWalls.y, 0),
                offsetWidth: new THREE.Vector3(0, 1.05, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        this.walls.add({
            object: this.brickWalls.objectOptions,
            shape:
            {
                type: 'brick',
                widthCount: 5,
                heightCount: 6,
                position: new THREE.Vector3(this.brickWalls.x - 5, this.brickWalls.y, 0),
                offsetWidth: new THREE.Vector3(0, 1.05, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        this.walls.add({
            object: this.brickWalls.objectOptions,
            shape:
            {
                type: 'triangle',
                widthCount: 6,
                position: new THREE.Vector3(this.brickWalls.x - 10, this.brickWalls.y, 0),
                offsetWidth: new THREE.Vector3(0, 1.05, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })
    }
}
