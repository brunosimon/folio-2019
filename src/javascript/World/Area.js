import * as THREE from 'three'
import { TweenLite } from 'gsap/TweenLite'
import { Back } from 'gsap/EasePack'

import EventEmitter from '../Utils/EventEmitter.js'
import AreaFloorBorderBufferGeometry from '../Geometries/AreaFloorBorderBufferGeometry.js'
import AreaFenceBufferGeometry from '../Geometries/AreaFenceBufferGeometry.js'
import AreaFenceMaterial from '../Materials/AreaFence.js'

export default class Area extends EventEmitter
{
    constructor(_options)
    {
        super()

        // Options
        this.car = _options.car
        this.time = _options.time
        this.position = _options.position
        this.halfExtents = _options.halfExtents

        // Set up
        this.container = new THREE.Object3D()
        this.container.position.x = this.position.x
        this.container.position.y = this.position.y
        this.isIn = false

        this.setFloorBorder()
        this.setFence()
        this.setInteractions()
    }

    setFloorBorder()
    {
        this.floorBorder = {}

        this.floorBorder.geometry = new AreaFloorBorderBufferGeometry(this.halfExtents.x * 2, this.halfExtents.y * 2, 0.25)
        this.floorBorder.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false, transparent: true, opacity: 0.5 })
        this.floorBorder.mesh = new THREE.Mesh(this.floorBorder.geometry, this.floorBorder.material)

        this.container.add(this.floorBorder.mesh)
    }

    setFence()
    {
        // Set up
        this.fence = {}
        this.fence.depth = 0.5
        this.fence.offset = 0.5

        // Geometry
        this.fence.geometry = new AreaFenceBufferGeometry(this.halfExtents.x * 2, this.halfExtents.y * 2, this.fence.depth)

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

    activate()
    {
        TweenLite.killTweensOf(this.fence.mesh.position)
        TweenLite.killTweensOf(this.fence.mesh.material)

        TweenLite.to(this.fence.mesh.position, 0.25, { z: 0, ease: Back.easeIn.config(1.5), onComplete: () =>
        {
            TweenLite.to(this.fence.mesh.position, 0.25, { z: 0.5 })
            TweenLite.fromTo(this.floorBorder.material, 1, { opacity: 1 }, { opacity: 0.5 })
            TweenLite.fromTo(this.fence.material.uniforms.uBorderAlpha, 1, { value: 1 }, { value: 0.5 })
        } })
    }

    in()
    {
        TweenLite.to(this.fence.mesh.position, 0.35, { z: this.fence.offset, ease: Back.easeOut.config(2) })
    }

    out()
    {
        TweenLite.to(this.fence.mesh.position, 0.35, { z: - this.fence.depth, ease: Back.easeIn.config(2) })
    }

    setInteractions()
    {
        this.time.on('tick', () =>
        {
            const isIn = Math.abs(this.car.position.x - this.position.x) < Math.abs(this.halfExtents.x) && Math.abs(this.car.position.y - this.position.y) < Math.abs(this.halfExtents.y)

            if(isIn !== this.isIn)
            {
                this.isIn = isIn

                if(this.isIn)
                {
                    this.in()
                }
                else
                {
                    this.out()
                }
            }
        })

        window.addEventListener('keydown', (_event) =>
        {
            if((_event.key === 'f' || _event.key === 'Enter') && this.isIn)
            {
                this.activate()
            }
        })
    }
}
