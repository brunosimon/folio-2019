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
        this.materials = _options.materials
        this.areas = _options.areas
        this.config = _options.config
        this.physics = _options.physics

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setKonamiCode()
        this.setWigs()
        // this.setEggs()
    }

    setKonamiCode()
    {
        this.konamiCode = {}
        this.konamiCode.x = - 60
        this.konamiCode.y = - 100
        this.konamiCode.sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight']

        if(!this.config.touch)
        {
            this.konamiCode.sequence.push('b', 'a')
        }

        this.konamiCode.keyIndex = 0
        this.konamiCode.latestKeys = []
        this.konamiCode.count = 0

        // Label
        if(this.config.touch)
        {
            this.konamiCode.labelTexture = this.resources.items.konamiLabelTouchTexture
        }
        else
        {
            this.konamiCode.labelTexture = this.resources.items.konamiLabelTexture
        }

        this.konamiCode.labelTexture.magFilter = THREE.NearestFilter
        this.konamiCode.labelTexture.minFilter = THREE.LinearFilter
        this.konamiCode.label = new THREE.Mesh(new THREE.PlaneGeometry(8, 8 / 16), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.konamiCode.labelTexture }))
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

        this.konamiCode.testInput = (_input) =>
        {
            this.konamiCode.latestKeys.push(_input)

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
                        // this.eggs.add({
                        //     offset: new THREE.Vector3(x, y, 10),
                        //     rotation: new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2),
                        //     material: this.materials.shades.items.yellow,
                        //     code: 'MjAyMWVnZ2N2b3V6ZXI=',
                        //     sleep: false
                        // })
                    }, i * 50)
                }
            }
        }

        /**
         * Keyboard handling
         */
        window.addEventListener('keydown', (_event) =>
        {
            this.konamiCode.testInput(_event.key)
        })

        /**
         * Touch handling
         */
        this.konamiCode.touch = {}
        this.konamiCode.touch.x = 0
        this.konamiCode.touch.y = 0

        this.konamiCode.touch.touchstart = (_event) =>
        {
            window.addEventListener('touchend', this.konamiCode.touch.touchend)

            this.konamiCode.touch.x = _event.changedTouches[0].clientX
            this.konamiCode.touch.y = _event.changedTouches[0].clientY
        }
        this.konamiCode.touch.touchend = (_event) =>
        {
            window.removeEventListener('touchend', this.konamiCode.touch.touchend)

            const endX = _event.changedTouches[0].clientX
            const endY = _event.changedTouches[0].clientY
            const deltaX = endX - this.konamiCode.touch.x
            const deltaY = endY - this.konamiCode.touch.y
            const distance = Math.hypot(deltaX, deltaY)

            if(distance > 30)
            {
                const angle = Math.atan2(deltaY, deltaX)
                let direction = null

                if(angle < - Math.PI * 0.75)
                {
                    direction = 'ArrowLeft'
                }
                else if(angle < - Math.PI * 0.25)
                {
                    direction = 'ArrowUp'
                }
                else if(angle < Math.PI * 0.25)
                {
                    direction = 'ArrowRight'
                }
                else if(angle < Math.PI * 0.75)
                {
                    direction = 'ArrowDown'
                }
                else
                {
                    direction = 'ArrowLeft'
                }

                this.konamiCode.testInput(direction)
            }
        }
        window.addEventListener('touchstart', this.konamiCode.touch.touchstart)
    }

    setWigs()
    {
        this.wigs = {}
        this.wigs.currentWig = null

        // Container
        this.wigs.container = new THREE.Object3D()
        this.wigs.container.position.x = - 0.1
        this.wigs.container.position.y = - 30
        this.wigs.container.matrixAutoUpdate = false
        this.wigs.container.updateMatrix()
        this.container.add(this.wigs.container)

        // Materials
        this.wigs.materials = [
            this.materials.shades.items.green,
            this.materials.shades.items.red,
            this.materials.shades.items.emeraldGreen,
            this.materials.shades.items.purple,
            this.materials.shades.items.yellow,
            this.materials.shades.items.white
        ]

        // List
        this.wigs.list = [
            this.resources.items.wig1,
            this.resources.items.wig2,
            this.resources.items.wig3,
            this.resources.items.wig4
        ]

        // Items
        this.wigs.items = []

        for(const _wig of this.wigs.list)
        {
            const container = new THREE.Object3D()
            container.visible = false
            container.matrixAutoUpdate = false
            this.wigs.container.add(container)

            const children = [..._wig.scene.children]
            for(const _mesh of children)
            {
                _mesh.material = this.wigs.materials[0]
                container.add(_mesh)
            }

            this.wigs.items.push(container)
        }

        // Change
        this.wigs.change = () =>
        {
            // Hide previous wig
            if(this.wigs.currentWig)
            {
                this.wigs.currentWig.visible = false
            }

            // Set random wig
            let randomWig = null
            do
            {
                randomWig = this.wigs.items[Math.floor(Math.random() * this.wigs.items.length)]
            } while(this.wigs.currentWig === randomWig)

            this.wigs.currentWig = randomWig
            this.wigs.currentWig.visible = true

            // Set random material
            const randomMaterial = this.wigs.materials[Math.floor(Math.random() * this.wigs.materials.length)]

            for(const _mesh of this.wigs.currentWig.children)
            {
                _mesh.material = randomMaterial
            }

            // this.eggs.add({
            //     offset: new THREE.Vector3(0, 80, 10),
            //     material: this.materials.shades.items.metal,
            //     code: 'MjAyMWVnZ2F6ZW9jYmI=',
            //     sleep: false
            // })
        }

        // Area
        this.wigs.area = this.areas.add({
            position: new THREE.Vector2(0, 80),
            halfExtents: new THREE.Vector2(2, 2)
        })
        this.wigs.area.on('interact', this.wigs.change)

        // Label
        this.resources.items.areaQuestionMarkTexture.magFilter = THREE.NearestFilter
        this.resources.items.areaQuestionMarkTexture.minFilter = THREE.LinearFilter
        this.wigs.areaLabel = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.resources.items.areaQuestionMarkTexture }))
        this.wigs.areaLabel.position.x = 0
        this.wigs.areaLabel.position.y = 80
        this.wigs.areaLabel.matrixAutoUpdate = false
        this.wigs.areaLabel.updateMatrix()
        this.container.add(this.wigs.areaLabel)
    }

    setEggs()
    {
        this.eggs = {}
        this.eggs.items = []

        // Console
        console.log('🥚 2021eggbvpoabe')

        // Base eggs options
        const eggOptions = [
            {
                offset: new THREE.Vector3(- 29.80, - 18.94, 0.5),
                material: this.materials.shades.items.emeraldGreen,
                code: 'MjAyMWVnZ2Fvem5kZXo='
            },
            {
                offset: new THREE.Vector3(103.91, 128.56, 0.5),
                material: this.materials.shades.items.red,
                code: 'MjAyMWVnZ3Fxc3ZwcG8='
            },
            {
                offset: new THREE.Vector3(39.68, -23.67, 0.5),
                material: this.materials.shades.items.purple,
                code: 'MjAyMWVnZ212b2Focnc='
            },
            {
                offset: new THREE.Vector3(107.62, -155.75, 0.5),
                material: this.materials.shades.items.blue,
                code: 'MjAyMWVnZ2N1ZHBhaW4='
            },
        ]

        this.eggs.add = (_options) =>
        {
            const egg = {}
            egg.found = false
            egg.code = _options.code

            // Create object
            egg.object = this.objects.add({
                base: this.resources.items.eggBase.scene,
                collision: this.resources.items.eggCollision.scene,
                duplicated: true,
                shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },
                mass: 0.5,
                sleep: typeof _options.sleep !== 'undefined' ? _options.sleep : true,
                soundName: 'woodHit',
                offset: _options.offset,
                rotation: typeof _options.sleep !== 'undefined' ? _options.rotation : new THREE.Euler(0, 0, 0)
            })

            // Change material
            egg.object.container.children[0].material = _options.material

            // Collision callback
            egg.collisionCallback = (_event) =>
            {
                // Collision with car
                if(_event.body === this.physics.car.chassis.body && !egg.found)
                {
                    egg.found = true

                    // egg.object.collision.body.removeEventListener('collide', egg.collisionCallback)

                    const code = atob(egg.code)

                    window.setTimeout(() =>
                    {
                        if(window.confirm(`
You find an egg!
Here is your code for a 30% discount on https://threejs-journey.xyz
${code}

Would you like to go on the subscription page?
                        `))
                        {
                            window.open(`https://threejs-journey.xyz/subscribe/${code}`, '_blank')
                        }

                        window.setTimeout(() =>
                        {
                            egg.found = false
                        }, 1000)
                    }, 600)
                }
            }

            // Listen to collide event
            egg.object.collision.body.addEventListener('collide', egg.collisionCallback)

            // Save
            this.eggs.items.push(egg)
        }

        // Create base eggs
        for(const _eggOption of eggOptions)
        {
            this.eggs.add(_eggOption)
        }
    }
}
