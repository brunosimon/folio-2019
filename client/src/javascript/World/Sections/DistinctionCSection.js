import * as THREE from 'three'

export default class DistinctionCSection
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

        this.setTrophy()
    }

    setTrophy()
    {
        this.objects.add({
            base: this.resources.items.awwwardsTrophyBase.scene,
            collision: this.resources.items.awwwardsTrophyCollision.scene,
            offset: new THREE.Vector3(0, - 5, 0),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            shadow: { sizeX: 2, sizeY: 2, offsetZ: - 0.5, alpha: 0.5 },
            mass: 50,
            soundName: 'woodHit'
        })
    }
}
