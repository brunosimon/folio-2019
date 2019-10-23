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
        this.x = _options.x
        this.y = _options.y

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setStatic()
        this.setBaguettes()
        this.setLinks()
        this.setActivities()
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

        this.baguettes.x = - 4
        this.baguettes.y = 6

        this.baguettes.a = this.objects.add({
            base: this.resources.items.informationBaguetteBase.scene,
            collision: this.resources.items.informationBaguetteCollision.scene,
            offset: new THREE.Vector3(this.x + this.baguettes.x - 0.56, this.y + this.baguettes.y - 0.666, 0.2),
            rotation: new THREE.Euler(0, 0, - Math.PI * 37 / 180),
            duplicated: true,
            shadow: { sizeX: 0.6, sizeY: 3.5, offsetZ: - 0.15, alpha: 0.35 },
            mass: 1.5,
            // soundName: 'woodHit'
        })

        this.baguettes.b = this.objects.add({
            base: this.resources.items.informationBaguetteBase.scene,
            collision: this.resources.items.informationBaguetteCollision.scene,
            offset: new THREE.Vector3(this.x + this.baguettes.x - 0.8, this.y + this.baguettes.y - 2, 0.5),
            rotation: new THREE.Euler(0, - 0.5, Math.PI * 60 / 180),
            duplicated: true,
            shadow: { sizeX: 0.6, sizeY: 3.5, offsetZ: - 0.15, alpha: 0.35 },
            mass: 1.5,
            sleep: false,
            // soundName: 'woodHit'
        })
    }

    setLinks()
    {
        // Set up
        this.links = {}
        this.links.x = 1.95
        this.links.y = - 1.5
        this.links.halfExtents = {}
        this.links.halfExtents.x = 1
        this.links.halfExtents.y = 1
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneBufferGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = - 1.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                href: 'https://twitter.com/bruno_simon/',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture
            },
            {
                href: 'https://github.com/brunosimon/',
                labelTexture: this.resources.items.informationContactGithubLabelTexture
            },
            {
                href: 'https://www.linkedin.com/in/simonbruno77/',
                labelTexture: this.resources.items.informationContactLinkedinLabelTexture
            },
            {
                href: 'mailto:simon.bruno.77@gmail.com',
                labelTexture: this.resources.items.informationContactMailLabelTexture
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.href = _option.href

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () =>
            {
                window.open(_option.href, '_blank')
            })

            // Texture
            item.texture = _option.labelTexture
            item.texture.magFilter = THREE.NearestFilter
            item.texture.minFilter = THREE.LinearFilter

            // Create label
            item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xffffff, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
            item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
            item.labelMesh.position.y = item.y + this.links.labelOffset
            item.labelMesh.matrixAutoUpdate = false
            item.labelMesh.updateMatrix()
            this.links.container.add(item.labelMesh)

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setActivities()
    {
        // Set up
        this.activities = {}
        this.activities.x = this.x + 0
        this.activities.y = this.y - 10
        this.activities.multiplier = 5.5

        // Geometry
        this.activities.geometry = new THREE.PlaneBufferGeometry(2 * this.activities.multiplier, 1 * this.activities.multiplier, 1, 1)

        // Texture
        this.activities.texture = this.resources.items.informationActivitiesTexture
        this.activities.texture.magFilter = THREE.NearestFilter
        this.activities.texture.minFilter = THREE.LinearFilter

        // Material
        this.activities.material = new THREE.MeshBasicMaterial({ wireframe: false, color: 0xffffff, alphaMap: this.activities.texture, transparent: true })

        // Mesh
        this.activities.mesh = new THREE.Mesh(this.activities.geometry, this.activities.material)
        this.activities.mesh.position.x = this.activities.x
        this.activities.mesh.position.y = this.activities.y
        this.activities.mesh.matrixAutoUpdate = false
        this.activities.mesh.updateMatrix()
        this.container.add(this.activities.mesh)
    }

    setTiles()
    {
        this.tiles.add({
            start: new THREE.Vector2(this.x - 1.2, this.y + 13),
            delta: new THREE.Vector2(0, - 20)
        })
    }
}
