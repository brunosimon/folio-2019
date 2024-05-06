import * as THREE from 'three'
import gsap from 'gsap'

import EventEmitter from '../Utils/EventEmitter.js'
import AreaFloorBorderGeometry from '../Geometries/AreaFloorBorderGeometry.js'
import AreaFenceGeometry from '../Geometries/AreaFenceGeometry.js'
import AreaFenceMaterial from '../Materials/AreaFence.js'
import AreaFloorBordereMaterial from '../Materials/AreaFloorBorder.js'

export default class Area extends EventEmitter
{
    constructor(_options)
    {
        super()

        // Options
        this.config = _options.config
        this.renderer = _options.renderer
        this.resources = _options.resources
        this.car = _options.car
        this.sounds = _options.sounds
        this.time = _options.time
        this.position = _options.position
        this.halfExtents = _options.halfExtents
        this.hasKey = _options.hasKey
        this.testCar = _options.testCar
        this.active = _options.active

        // Set up
        this.container = new THREE.Object3D()
        this.container.position.x = this.position.x
        this.container.position.y = this.position.y
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.initialTestCar = this.testCar
        this.isIn = false

        this.setFloorBorder()
        this.setFence()
        this.setInteractions()

        if(this.hasKey)
        {
            this.setKey()
        }
    }

    activate()
    {
        this.active = true

        if(this.isIn)
        {
            this.in()
        }
    }

    deactivate()
    {
        this.active = false

        if(this.isIn)
        {
            this.out()
        }
    }

    setFloorBorder()
    {
        this.floorBorder = {}

        this.floorBorder.geometry = new AreaFloorBorderGeometry(this.halfExtents.x * 2, this.halfExtents.y * 2, 0.25)
        this.floorBorder.material = new AreaFloorBordereMaterial()
        this.floorBorder.material.uniforms.uColor.value = new THREE.Color(0xffffff)
        this.floorBorder.material.uniforms.uAlpha.value = 0.5
        this.floorBorder.material.uniforms.uLoadProgress.value = 1
        this.floorBorder.material.uniforms.uProgress.value = 1
        this.floorBorder.mesh = new THREE.Mesh(this.floorBorder.geometry, this.floorBorder.material)
        this.floorBorder.mesh.matrixAutoUpdate = false

        this.container.add(this.floorBorder.mesh)
    }

    setFence()
    {
        // Set up
        this.fence = {}
        this.fence.depth = 0.5
        this.fence.offset = 0.5

        // Geometry
        this.fence.geometry = new AreaFenceGeometry(this.halfExtents.x * 2, this.halfExtents.y * 2, this.fence.depth)

        // Material
        // this.fence.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.5 })
        this.fence.material = new AreaFenceMaterial()
        this.fence.material.uniforms.uBorderAlpha.value = 0.5
        this.fence.material.uniforms.uStrikeAlpha.value = 0.25

        // Mesh
        this.fence.mesh = new THREE.Mesh(this.fence.geometry, this.fence.material)
        this.fence.mesh.position.z = - this.fence.depth
        this.container.add(this.fence.mesh)

        // Time tick
        this.time.on('tick', () =>
        {
            this.fence.material.uniforms.uTime.value = this.time.elapsed
        })
    }

    setKey()
    {
        this.key = {}
        this.key.hiddenZ = 1.5
        this.key.shownZ = 2.5

        // Container
        this.key.container = new THREE.Object3D()
        this.key.container.position.z = this.key.hiddenZ
        this.container.add(this.key.container)

        // Enter
        this.key.enter = {}
        this.key.enter.size = 1.4
        this.key.enter.geometry = new THREE.PlaneGeometry(this.key.enter.size, this.key.enter.size / 4, 1, 1)

        this.key.enter.texture = this.resources.items.areaEnterTexture
        this.key.enter.texture.magFilter = THREE.NearestFilter
        this.key.enter.texture.minFilter = THREE.LinearFilter

        this.key.enter.material = new THREE.MeshBasicMaterial({ color: 0xffffff, alphaMap: this.key.enter.texture, transparent: true, opacity: 0, depthWrite: false })

        this.key.enter.mesh = new THREE.Mesh(this.key.enter.geometry, this.key.enter.material)
        this.key.enter.mesh.rotation.x = Math.PI * 0.5
        this.key.enter.mesh.position.x = this.key.enter.size * 0.75
        this.key.enter.mesh.matrixAutoUpdate = false
        this.key.enter.mesh.updateMatrix()
        this.key.container.add(this.key.enter.mesh)

        // Icon
        this.key.icon = {}
        this.key.icon.size = 0.75
        this.key.icon.geometry = new THREE.PlaneGeometry(this.key.icon.size, this.key.icon.size, 1, 1)

        this.key.icon.texture = this.resources.items.areaKeyEnterTexture
        this.key.icon.texture.magFilter = THREE.NearestFilter
        this.key.icon.texture.minFilter = THREE.LinearFilter

        this.key.icon.material = new THREE.MeshBasicMaterial({ color: 0xffffff, alphaMap: this.key.icon.texture, transparent: true, opacity: 0, depthWrite: false })

        this.key.icon.mesh = new THREE.Mesh(this.key.icon.geometry, this.key.icon.material)
        this.key.icon.mesh.rotation.x = Math.PI * 0.5
        this.key.icon.mesh.position.x = - this.key.enter.size * 0.15
        this.key.icon.mesh.matrixAutoUpdate = false
        this.key.icon.mesh.updateMatrix()
        this.key.container.add(this.key.icon.mesh)
    }

    interact(_showKey = true)
    {
        // Not active
        if(!this.active)
        {
            return
        }

        // Kill tweens
        gsap.killTweensOf(this.fence.mesh.position)
        gsap.killTweensOf(this.floorBorder.material.uniforms.uAlpha)
        gsap.killTweensOf(this.fence.material.uniforms.uBorderAlpha)

        if(this.hasKey)
        {
            gsap.killTweensOf(this.key.container.position)
            gsap.killTweensOf(this.key.icon.material)
            gsap.killTweensOf(this.key.enter.material)
        }

        // Animate
        gsap.to(this.fence.mesh.position, { z: 0, duration: 0.05, onComplete: () =>
        {
            gsap.to(this.fence.mesh.position, { z: 0.5, duration: 0.25, ease: 'back.out(2)' })
            gsap.fromTo(this.floorBorder.material.uniforms.uAlpha, { value: 1 }, { value: 0.5, duration: 1.5 })
            gsap.fromTo(this.fence.material.uniforms.uBorderAlpha, { value: 1 }, { value: 0.5, duration: 1.5 })
        } })

        if(this.hasKey && _showKey)
        {
            this.key.container.position.z = this.key.shownZ
            gsap.fromTo(this.key.icon.material, { opacity: 1 }, { opacity: 0.5, duration: 1.5 })
            gsap.fromTo(this.key.enter.material, { opacity: 1 }, { opacity: 0.5, duration: 1.5 })
        }

        // Play sound
        this.sounds.play('uiArea')

        this.trigger('interact')
    }

    in(_showKey = true)
    {
        this.isIn = true

        // Not active
        if(!this.active)
        {
            return
        }

        // Fence
        gsap.killTweensOf(this.fence.mesh.position)
        gsap.to(this.fence.mesh.position, { z: this.fence.offset, duration: 0.35, ease: 'back.out(3)' })

        // Key
        if(this.hasKey)
        {
            gsap.killTweensOf(this.key.container.position)
            gsap.killTweensOf(this.key.icon.material)
            gsap.killTweensOf(this.key.enter.material)

            // Animate
            if(_showKey)
            {
                gsap.to(this.key.container.position, { z: this.key.shownZ, duration: 0.35, ease: 'back.out(3)', delay: 0.1 })
                gsap.to(this.key.icon.material, { opacity: 0.5, duration: 0.35, ease: 'back.out(3)', delay: 0.1 })
                gsap.to(this.key.enter.material, { opacity: 0.5, duration: 0.35, ease: 'back.out(3)', delay: 0.1 })
            }
        }

        // Change cursor
        if(!this.config.touch)
        {
            this.renderer.domElement.classList.add('has-cursor-pointer')
        }

        this.trigger('in')
    }

    out()
    {
        this.isIn = false

        // Fence
        gsap.killTweensOf(this.fence.mesh.position)
        gsap.to(this.fence.mesh.position, { z: - this.fence.depth, duration: 0.35, ease: 'back.in(4)' })

        // Key
        if(this.hasKey)
        {
            gsap.killTweensOf(this.key.container.position)
            gsap.killTweensOf(this.key.icon.material)
            gsap.killTweensOf(this.key.enter.material)
            gsap.to(this.key.container.position, { z: this.key.hiddenZ, duration: 0.35, ease: 'back.in(4)', delay: 0.1 })
            gsap.to(this.key.icon.material, { opacity: 0, duration: 0.35, ease: 'back.in(4)', delay: 0.1 })
            gsap.to(this.key.enter.material, { opacity: 0, duration: 0.35, ease: 'back.in(4)', delay: 0.1 })
        }

        // Change cursor
        if(!this.config.touch)
        {
            this.renderer.domElement.classList.remove('has-cursor-pointer')
        }

        this.trigger('out')
    }

    setInteractions()
    {
        this.mouseMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(this.halfExtents.x * 2, this.halfExtents.y * 2, 1, 1),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        this.mouseMesh.position.z = - 0.01
        this.mouseMesh.matrixAutoUpdate = false
        this.mouseMesh.updateMatrix()
        this.container.add(this.mouseMesh)

        this.time.on('tick', () =>
        {
            if(this.testCar)
            {
                const isIn = Math.abs(this.car.position.x - this.position.x) < Math.abs(this.halfExtents.x) && Math.abs(this.car.position.y - this.position.y) < Math.abs(this.halfExtents.y)

                if(isIn !== this.isIn)
                {
                    if(isIn)
                    {
                        this.in(!this.config.touch)
                    }
                    else
                    {
                        this.out()
                    }
                }
            }
        })

        window.addEventListener('keydown', (_event) =>
        {
            if((_event.key === 'f' || _event.key === 'e' || _event.key === 'Enter') && this.isIn)
            {
                this.interact()
            }
        })
    }
}
