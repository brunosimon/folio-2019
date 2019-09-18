import * as THREE from 'three'

export default class InformationSection
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.tiles = _options.tiles
        this.debug = _options.debug

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.x = 0
        this.y = - 50

        this.setPlace()
        this.setTiles()
    }

    setPlace()
    {
        this.objects.add({
            base: this.resources.items.informationPlaceBase.scene,
            collision: this.resources.items.crossroadsStaticCollision.scene,
            // floorShadowTexture: this.resources.items.crossroadsStaticFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0
        })
    }

    setTiles()
    {
    }
}
