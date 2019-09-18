import * as THREE from 'three'

export default class IntroSection
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
        this.x = _options.x
        this.y = _options.y

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.setStatic()
        this.setArrowKeys()
        this.setTitles()
        this.setTiles()
    }

    setStatic()
    {
        this.objects.add({
            base: this.resources.items.introStaticBase.scene,
            collision: this.resources.items.introStaticCollision.scene,
            floorShadowTexture: this.resources.items.introStaticFloorShadowTexture,
            offset: new THREE.Vector3(0, 0, 0),
            mass: 0
        })
    }

    setArrowKeys()
    {
        this.objects.add({
            base: this.resources.items.introArrowKeyBase.scene,
            collision: this.resources.items.introArrowKeyCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
            mass: 1.5
        })
        this.objects.add({
            base: this.resources.items.introArrowKeyBase.scene,
            collision: this.resources.items.introArrowKeyCollision.scene,
            offset: new THREE.Vector3(0, - 0.8, 0),
            rotation: new THREE.Euler(0, 0, Math.PI),
            duplicated: true,
            shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
            mass: 1.5
        })
        this.objects.add({
            base: this.resources.items.introArrowKeyBase.scene,
            collision: this.resources.items.introArrowKeyCollision.scene,
            offset: new THREE.Vector3(- 0.8, - 0.8, 0),
            rotation: new THREE.Euler(0, 0, Math.PI * 0.5),
            duplicated: true,
            shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
            mass: 1.5
        })
        this.objects.add({
            base: this.resources.items.introArrowKeyBase.scene,
            collision: this.resources.items.introArrowKeyCollision.scene,
            offset: new THREE.Vector3(0.8, - 0.8, 0),
            rotation: new THREE.Euler(0, 0, - Math.PI * 0.5),
            duplicated: true,
            shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
            mass: 1.5
        })
    }

    setTitles()
    {
        // Title
        this.objects.add({
            base: this.resources.items.introBBase.scene,
            collision: this.resources.items.introBCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            mass: 1.5
        })
        this.objects.add({
            base: this.resources.items.introRBase.scene,
            collision: this.resources.items.introRCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            mass: 1.5
        })
        this.objects.add({
            base: this.resources.items.introUBase.scene,
            collision: this.resources.items.introUCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            mass: 1.5
        })
        this.objects.add({
            base: this.resources.items.introNBase.scene,
            collision: this.resources.items.introNCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            mass: 1.5
        })
        this.objects.add({
            base: this.resources.items.introOBase.scene,
            collision: this.resources.items.introOCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            mass: 1.5
        })
        this.objects.add({
            base: this.resources.items.introSBase.scene,
            collision: this.resources.items.introSCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            mass: 1.5
        })
        this.objects.add({
            base: this.resources.items.introIBase.scene,
            collision: this.resources.items.introICollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            mass: 1.5
        })
        this.objects.add({
            base: this.resources.items.introMBase.scene,
            collision: this.resources.items.introMCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            mass: 1.5
        })
        this.objects.add({
            base: this.resources.items.introOBase.scene,
            collision: this.resources.items.introOCollision.scene,
            offset: new THREE.Vector3(3.95, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            mass: 1.5
        })
        this.objects.add({
            base: this.resources.items.introNBase.scene,
            collision: this.resources.items.introNCollision.scene,
            offset: new THREE.Vector3(5.85, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            mass: 1.5
        })
        this.objects.add({
            base: this.resources.items.introCreativeBase.scene,
            collision: this.resources.items.introCreativeCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0.25),
            shadow: { sizeX: 5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.3 },
            mass: 1.5,
            sleep: false
        })
        this.objects.add({
            base: this.resources.items.introDevBase.scene,
            collision: this.resources.items.introDevCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            shadow: { sizeX: 2.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.3 },
            mass: 1.5
        })
    }

    setTiles()
    {
        this.tiles.add({
            start: new THREE.Vector2(0, - 4.5),
            delta: new THREE.Vector2(0, - 4.5)
        })
    }
}
