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

        this.setStatic()
        this.setTrophy()
    }

    setStatic()
    {
        this.objects.add({
            base: this.resources.items.distinctionCStaticBase.scene,
            collision: this.resources.items.distinctionCStaticCollision.scene,
            floorShadowTexture: this.resources.items.distinctionCStaticFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0
        })
    }

    setTrophy()
    {
        this.objects.add({
            base: this.resources.items.webbyTrophyBase.scene,
            collision: this.resources.items.webbyTrophyCollision.scene,
            offset: new THREE.Vector3(0, - 2.5, 5),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            shadow: { sizeX: 4, sizeY: 4, offsetZ: - 0.5, alpha: 0.65 },
            mass: 15,
            soundName: 'woodHit',
            sleep: false
        })
    }
}
