import * as THREE from 'three'

export default class EasterEggs
{
    constructor(_options)
    {
        // Options
        this.resources = _options.resources
        this.car = _options.car
        this.walls = _options.walls
        this.objects = _options.objects

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setKonamiCode()
    }

    setKonamiCode()
    {
        this.konamiCode = {}
        this.konamiCode.x = - 60
        this.konamiCode.y = - 100
        this.konamiCode.sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
        this.konamiCode.keyIndex = 0
        this.konamiCode.latestKeys = []
        this.konamiCode.count = 0

        // Label
        this.resources.items.konamiLabelTexture.magFilter = THREE.NearestFilter
        this.resources.items.konamiLabelTexture.minFilter = THREE.LinearFilter
        this.konamiCode.label = new THREE.Mesh(new THREE.PlaneBufferGeometry(8, 8 / 16), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.resources.items.konamiLabelTexture }))
        this.konamiCode.label.position.x = this.konamiCode.x + 5
        this.konamiCode.label.position.y = this.konamiCode.y
        this.konamiCode.label.matrixAutoUpdate = false
        this.konamiCode.label.updateMatrix()
        this.container.add(this.konamiCode.label)

        // Lemon option
        this.konamiCode.lemonOption = {
            base: this.resources.items.lemonBase.scene,
            collision: this.resources.items.lemonCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(Math.PI * 0.5, - Math.PI * 0.3, 0),
            duplicated: true,
            shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },
            mass: 0.5,
            sleep: true,
            soundName: 'woodHit'
        }

        // First lemon
        this.objects.add({
            ...this.konamiCode.lemonOption,
            offset: new THREE.Vector3(this.konamiCode.x, this.konamiCode.y, 0.4)
        })

        window.addEventListener('keydown', (_event) =>
        {
            this.konamiCode.latestKeys.push(_event.key)

            if(this.konamiCode.latestKeys.length > this.konamiCode.sequence.length)
            {
                this.konamiCode.latestKeys.shift()
            }

            if(this.konamiCode.sequence.toString() === this.konamiCode.latestKeys.toString())
            {
                this.konamiCode.count++

                for(let i = 0; i < Math.pow(3, this.konamiCode.count); i++)
                {
                    window.setTimeout(() =>
                    {
                        const x = this.car.chassis.object.position.x + (Math.random() - 0.5) * 10
                        const y = this.car.chassis.object.position.y + (Math.random() - 0.5) * 10

                        this.objects.add({
                            ...this.konamiCode.lemonOption,
                            offset: new THREE.Vector3(x, y, 10),
                            rotation: new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2),
                            sleep: false
                        })
                    }, i * 50)
                }
            }
        })
    }
}
