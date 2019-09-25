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
        // this.y = - 55
        this.y = - 10

        this.setStatic()
        this.setBaguettes()
        this.setLinks()
        this.setTiles()
    }

    setStatic()
    {
        this.objects.add({
            base: this.resources.items.informationStaticBase.scene,
            collision: this.resources.items.informationStaticCollision.scene,
            floorShadowTexture: this.resources.items.informationStaticFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0
        })
    }

    setBaguettes()
    {
        this.baguettes = {}

        this.baguettes.x = - 3
        this.baguettes.y = 6

        this.baguettes.a = this.objects.add({
            base: this.resources.items.informationBaguetteBase.scene,
            collision: this.resources.items.informationBaguetteCollision.scene,
            offset: new THREE.Vector3(this.x + this.baguettes.x - 0.56, this.y + this.baguettes.y - 0.666, 0.2),
            rotation: new THREE.Euler(0, 0, - Math.PI * 37 / 180),
            duplicated: true,
            shadow: { sizeX: 0.6, sizeY: 3.5, offsetZ: - 0.15, alpha: 0.35 },
            mass: 1.5
        })

        this.baguettes.b = this.objects.add({
            base: this.resources.items.informationBaguetteBase.scene,
            collision: this.resources.items.informationBaguetteCollision.scene,
            offset: new THREE.Vector3(this.x + this.baguettes.x - 0.8, this.y + this.baguettes.y - 2, 0.5),
            rotation: new THREE.Euler(0, - 0.5, Math.PI * 60 / 180),
            duplicated: true,
            shadow: { sizeX: 0.6, sizeY: 3.5, offsetZ: - 0.15, alpha: 0.35 },
            mass: 1.5,
            sleep: false
        })
    }

    setLinks()
    {
        // Set up
        this.links = {}
        this.links.x = 1.45
        this.links.y = - 1.5
        this.links.halfExtents = {}
        this.links.halfExtents.x = 1
        this.links.halfExtents.y = 1
        this.links.distanceBetween = 2.4

        // Twitter
        this.links.twitter = {}
        this.links.twitter.x = this.x + this.links.x + this.links.distanceBetween * 0
        this.links.twitter.y = this.y + this.links.y
        this.links.twitter.href = 'https://twitter.com/bruno_simon/'

        this.links.twitter.area = this.areas.add({
            position: new THREE.Vector2(this.links.twitter.x, this.links.twitter.y),
            halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
        })
        this.links.twitter.area.on('interact', () =>
        {
            window.open(this.links.twitter.href, '_blank')
        })

        // Github
        this.links.github = {}
        this.links.github.x = this.x + this.links.x + this.links.distanceBetween * 1
        this.links.github.y = this.y + this.links.y
        this.links.github.href = 'https://github.com/brunosimon/'

        this.links.github.area = this.areas.add({
            position: new THREE.Vector2(this.links.github.x, this.links.github.y),
            halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
        })
        this.links.github.area.on('interact', () =>
        {
            window.open(this.links.github.href, '_blank')
        })

        // Linkedin
        this.links.linkedin = {}
        this.links.linkedin.x = this.x + this.links.x + this.links.distanceBetween * 2
        this.links.linkedin.y = this.y + this.links.y
        this.links.linkedin.href = 'https://www.linkedin.com/in/simonbruno77/'

        this.links.linkedin.area = this.areas.add({
            position: new THREE.Vector2(this.links.linkedin.x, this.links.linkedin.y),
            halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
        })
        this.links.linkedin.area.on('interact', () =>
        {
            window.open(this.links.linkedin.href, '_blank')
        })

        // Mail
        this.links.mail = {}
        this.links.mail.x = this.x + this.links.x + this.links.distanceBetween * 3
        this.links.mail.y = this.y + this.links.y
        this.links.mail.href = 'mailto:simon.bruno.77@gmail.com'

        this.links.mail.area = this.areas.add({
            position: new THREE.Vector2(this.links.mail.x, this.links.mail.y),
            halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
        })
        this.links.mail.area.on('interact', () =>
        {
            window.open(this.links.mail.href, '_blank')
        })
    }

    setTiles()
    {
    }
}
