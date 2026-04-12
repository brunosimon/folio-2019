import * as THREE from 'three'
import Materials from './Materials.js'
import Floor from './Floor.js'
import Shadows from './Shadows.js'
import Physics from './Physics.js'
import Objects from './Objects.js'
import Car from './Car.js'
import Areas from './Areas.js'
import Controls from './Controls.js'
import Sounds from './Sounds.js'
import RemoteCarManager from './RemoteCarManager.js'
import Minimap from './Minimap.js'
import Track from './Track.js'
import gsap from 'gsap'

export default class World
{
    constructor(_options)
    {
        this.config    = _options.config
        this.debug     = _options.debug
        this.resources = _options.resources
        this.time      = _options.time
        this.sizes     = _options.sizes
        this.camera    = _options.camera
        this.scene     = _options.scene
        this.renderer  = _options.renderer
        this.passes    = _options.passes
        this.network   = _options.network || null

        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('world')
            this.debugFolder.open()
        }

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setSounds()
        this.setControls()
        this.setFloor()
        this.setAreas()
        this.setRemoteCars()
        this.setStartingScreen()
    }

    start()
    {
        window.setTimeout(() => { this.camera.pan.enable() }, 2000)

        this.setReveal()
        this.setMaterials()
        this.setShadows()
        this.setPhysics()
        this.setTrack()
        if(this.network) this._setupSnapshotSender()
        if(this.network) this._setupBumpHandling()
        this.setObjects()
        this.setCar()
        this.areas.car = this.car
        this._setupYouLabel()
        this.setMinimap()
    }

    setReveal()
    {
        this.reveal = {}
        this.reveal.matcapsProgress = 0
        this.reveal.floorShadowsProgress = 0
        this.reveal.previousMatcapsProgress = null
        this.reveal.previousFloorShadowsProgress = null

        this.reveal.go = () =>
        {
            gsap.fromTo(this.reveal, { matcapsProgress: 0 }, { matcapsProgress: 1, duration: 3 })
            gsap.fromTo(this.reveal, { floorShadowsProgress: 0 }, { floorShadowsProgress: 1, duration: 3, delay: 0.5 })
            gsap.fromTo(this.shadows, { alpha: 0 }, { alpha: 0.5, duration: 3, delay: 0.5 })

            const spawn = this._serverSpawnPos || { x: 5, y: -35 }
            this.physics.car.chassis.body.sleep()
            this.physics.car.chassis.body.position.set(spawn.x, spawn.y, 12)
            this.physics.car.chassis.body.quaternion.set(0, 0, 0, 1) // face +X (along start straight)

            window.setTimeout(() =>
            {
                this.physics.car.chassis.body.wakeUp()
                if(this.network) this.network.playerReady()
            }, 300)

            gsap.fromTo(this.sounds.engine.volume, { master: 0 }, { master: 0.7, duration: 0.5, delay: 0.3, ease: 'power2.in' })
            window.setTimeout(() => { this.sounds.play('reveal') }, 400)

            if(this.controls.touch)
            {
                window.setTimeout(() => { this.controls.touch.reveal() }, 400)
            }
        }

        this.time.on('tick', () =>
        {
            if(this.reveal.matcapsProgress !== this.reveal.previousMatcapsProgress)
            {
                for(const _materialKey in this.materials.shades.items)
                {
                    this.materials.shades.items[_materialKey].uniforms.uRevealProgress.value = this.reveal.matcapsProgress
                }
                this.reveal.previousMatcapsProgress = this.reveal.matcapsProgress
            }

            if(this.reveal.floorShadowsProgress !== this.reveal.previousFloorShadowsProgress)
            {
                for(const _mesh of this.objects.floorShadows)
                {
                    _mesh.material.uniforms.uAlpha.value = this.reveal.floorShadowsProgress
                }
                this.reveal.previousFloorShadowsProgress = this.reveal.floorShadowsProgress
            }
        })
    }

    setStartingScreen()
    {
        this._resourcesReady = false
        this._playerJoined   = false

        this._tryStart = () =>
        {
            if(!this._resourcesReady || !this._playerJoined) return
            this._tryStart = () => {}  // prevent double-start
            this.start()
            window.setTimeout(() => { this.reveal.go() }, 600)
        }

        this.resources.on('ready', () =>
        {
            this._resourcesReady = true
            this._tryStart()
        })
    }

    setSounds()
    {
        this.sounds = new Sounds({ debug: this.debugFolder, time: this.time })
    }

    setControls()
    {
        this.controls = new Controls({
            config: this.config,
            sizes: this.sizes,
            time: this.time,
            camera: this.camera,
            sounds: this.sounds
        })
    }

    setMaterials()
    {
        this.materials = new Materials({ resources: this.resources, debug: this.debugFolder })
    }

    setFloor()
    {
        this.floor = new Floor({ debug: this.debugFolder })
        this.container.add(this.floor.container)
    }

    setShadows()
    {
        this.shadows = new Shadows({
            time: this.time,
            debug: this.debugFolder,
            renderer: this.renderer,
            camera: this.camera
        })
        this.container.add(this.shadows.container)
    }

    setPhysics()
    {
        this.physics = new Physics({
            config: this.config,
            debug: this.debug,
            scene: this.scene,
            time: this.time,
            sizes: this.sizes,
            controls: this.controls,
            sounds: this.sounds
        })
        this.container.add(this.physics.models.container)
    }

    setObjects()
    {
        this.objects = new Objects({
            time: this.time,
            resources: this.resources,
            materials: this.materials,
            physics: this.physics,
            shadows: this.shadows,
            sounds: this.sounds,
            debug: this.debugFolder
        })
        this.container.add(this.objects.container)
    }

    setCar()
    {
        this.car = new Car({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            shadows: this.shadows,
            materials: this.materials,
            controls: this.controls,
            sounds: this.sounds,
            renderer: this.renderer,
            camera: this.camera,
            debug: this.debugFolder,
            config: this.config,
            carColor: this.config.carColor ?? 0
        })
        this.container.add(this.car.container)
    }

    setAreas()
    {
        this.areas = new Areas({
            config: this.config,
            resources: this.resources,
            debug: this.debug,
            renderer: this.renderer,
            camera: this.camera,
            car: this.car,
            sounds: this.sounds,
            time: this.time
        })
        this.container.add(this.areas.container)
    }

    _setupSnapshotSender()
    {
        let _lastSend = 0
        this.time.on('tick', () =>
        {
            if(!this.network || !this.physics) return
            const now = Date.now()
            if(now - _lastSend < 50) return
            _lastSend = now

            const body  = this.physics.car.chassis.body
            const infos = this.physics.car.vehicle.wheelInfos

            const wheels = infos.map(w => ({
                pos:  [w.worldTransform.position.x,   w.worldTransform.position.y,   w.worldTransform.position.z],
                quat: [w.worldTransform.quaternion.x, w.worldTransform.quaternion.y, w.worldTransform.quaternion.z, w.worldTransform.quaternion.w],
            }))

            this.network.sendSnapshot({
                pos:    [body.position.x,        body.position.y,        body.position.z],
                quat:   [body.quaternion.x,      body.quaternion.y,      body.quaternion.z,      body.quaternion.w],
                vel:    [body.velocity.x,        body.velocity.y,        body.velocity.z],
                angVel: [body.angularVelocity.x, body.angularVelocity.y, body.angularVelocity.z],
                wheels,
            })
        })
    }

    _setupBumpHandling()
    {
        // When local car hits a remote car, relay the bump so their car reacts
        this.physics.car.onBump = (targetId, fromPos) =>
        {
            this.network.sendBump(targetId, fromPos)
            this._shakeCamera()
        }

        // When a remote car hits us, apply the incoming impulse to our car
        this.network.on('player:bumped', ({ fromPos }) =>
        {
            this.physics.car.receiveBump(fromPos)
            this.sounds.play('carHit', 10)
            this._shakeCamera()
        })
    }

    _shakeCamera()
    {
        const canvas = document.querySelector('canvas')
        if(!canvas) return
        // Snap to random offset, then ease back — pure CSS, no camera math needed
        canvas.style.transition = 'none'
        canvas.style.transform = `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px) rotate(${(Math.random() - 0.5) * 0.6}deg)`
        requestAnimationFrame(() =>
        {
            canvas.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            canvas.style.transform  = 'translate(0, 0) rotate(0deg)'
        })
    }

    _setupYouLabel()
    {
        const $you = document.getElementById('mp-you')
        if(!$you) return

        // Show player name above local car
        $you.textContent = this.network?.localPlayerName || 'YOU'
        $you.style.display = 'block'

        this.time.on('tick', () =>
        {
            if(!this.car?.chassis?.object) return

            const worldPos = this.car.chassis.object.position.clone()
            worldPos.z += 1.5
            const projected = worldPos.project(this.camera.instance)

            if(projected.z > 1) { $you.style.display = 'none'; return }

            const x = (projected.x *  0.5 + 0.5) * this.sizes.viewport.width
            const y = (projected.y * -0.5 + 0.5) * this.sizes.viewport.height
            $you.style.display = 'block'
            $you.style.left = `${x}px`
            $you.style.top  = `${y}px`
        })
    }

    setTrack()
    {
        this.track = new Track({
            world:         this.physics.world,
            floorMaterial: this.physics.materials.items.floor,
            resources:     this.resources,
        })
        this.container.add(this.track.container)
    }

    setMinimap()
    {
        const $map = document.getElementById('mp-minimap')
        if($map) $map.style.display = 'block'

        this.minimap = new Minimap({
            physics:          this.physics,
            remoteCarManager: this.remoteCarManager || null,
            network:          this.network,
            localCarColor:    this.config.carColor ?? 0,
            trackOuter:       this.track?.outerPath || null,
            trackInner:       this.track?.innerPath || null,
        })

        this.time.on('tick', () => { this.minimap.update() })
    }

    setRemoteCars()
    {
        if(!this.network) return

        this.controls.network = this.network

        this._serverSpawnPos = null
        this.network.on('room:joined', ({ spawnPos }) =>
        {
            this._serverSpawnPos = spawnPos
            this._playerJoined = true
            this._tryStart?.()
        })

        this.remoteCarManager = new RemoteCarManager({
            scene:           this.scene,
            resources:       this.resources,
            network:         this.network,
            camera:          this.camera,
            sizes:           this.sizes,
            getPhysicsWorld: () => this.physics?.world,
        })

        this.time.on('tick', () => { this.remoteCarManager.update() })
    }
}
