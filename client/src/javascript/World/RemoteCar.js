import * as THREE from 'three'
import CANNON from 'cannon'
import { NETWORK, PHYSICS } from '../../../../shared/constants.js'
import MatcapMaterial from '../Materials/Matcap.js'

// Maps carColor index → matcap texture name used for the car body (shadeRed meshes)
const BODY_MATCAP = [
    'matcapRedTexture',           // 0  red
    'matcapBlueTexture',          // 1  blue
    'matcapEmeraldGreenTexture',  // 2  green
    'matcapOrangeTexture',        // 3  orange
    'matcapPurpleTexture',        // 4  purple
    'matcapEmeraldGreenTexture',  // 5  teal  (closest available)
    'matcapRedTexture',           // 6  pink  (closest available)
    'matcapWhiteTexture',         // 7  white
]

// Default shade uniforms (same values as Materials.js)
const SHADE_UNIFORMS = {
    uRevealProgress:             1,      // fully revealed — no fade-in for remote cars
    uIndirectDistanceAmplitude:  1.75,
    uIndirectDistanceStrength:   0.5,
    uIndirectDistancePower:      2.0,
    uIndirectAngleStrength:      1.5,
    uIndirectAngleOffset:        0.6,
    uIndirectAnglePower:         1.0,
    uIndirectColor:              new THREE.Color('#d04500'),
}

export default class RemoteCar
{
    constructor(_options)
    {
        this.scene              = _options.scene
        this.resources          = _options.resources
        this.chassisTemplate    = _options.chassisTemplate
        this.wheelTemplate      = _options.wheelTemplate
        this.id                 = _options.id
        this.name               = _options.name
        this.carColor           = _options.carColor ?? 0
        this.carType            = _options.carType  || 'default'
        this.getPhysicsWorld    = _options.getPhysicsWorld  // () => CANNON.World | null

        // Snapshot interpolation buffer
        this.snapshots           = []
        this.interpolationDelay  = NETWORK.interpolationDelay

        // Collision body (created lazily once physics world is available)
        this._physicsBody  = null
        this._physicsWorld = null

        this.container = new THREE.Object3D()
        this.scene.add(this.container)

        this._buildMesh()
        this._buildNameLabel()
    }

    // ── material helpers ────────────────────────────────────────────────────

    _makeMatcap(textureName)
    {
        const mat = MatcapMaterial()
        mat.uniforms.matcap.value = this.resources.items[textureName]
            || this.resources.items.matcapWhiteTexture

        for(const [key, val] of Object.entries(SHADE_UNIFORMS))
        {
            mat.uniforms[key].value = val
        }
        return mat
    }

    _makePure(hex)
    {
        return new THREE.MeshBasicMaterial({ color: hex })
    }

    _materialForMesh(meshName)
    {
        // pure[Color] → flat MeshBasicMaterial
        const pureMatch = meshName.match(/^pure([a-z]+)/i)
        if(pureMatch)
        {
            const c = pureMatch[1].toLowerCase()
            const colorMap = { red: 0xff0000, white: 0xffffff, yellow: 0xffe889 }
            return this._makePure(colorMap[c] ?? 0xffffff)
        }

        // shade[Name] → matcap material
        const shadeMatch = meshName.match(/^shade([a-z]+)/i)
        const shadeName  = shadeMatch ? shadeMatch[1].toLowerCase() : 'white'

        // Car body: default car uses shadeRed, cybertruck uses shadeMetal
        const isBody = (shadeName === 'red') || (shadeName === 'metal' && this.carType === 'cybertruck')
        if(isBody)
        {
            return this._makeMatcap(BODY_MATCAP[this.carColor % BODY_MATCAP.length])
        }

        // All other shades: find the matching texture, fall back to white
        const texName = `matcap${shadeName.charAt(0).toUpperCase() + shadeName.slice(1)}Texture`
        return this._makeMatcap(texName)
    }

    // ── mesh construction ───────────────────────────────────────────────────

    _buildMesh()
    {
        // Clone from the pre-built template (saved before Car.js consumes the
        // original GLTF children via getConvertedMesh).
        this.chassis = {}
        this.chassis.object = this.chassisTemplate.clone(true)

        // Apply proper matcap materials per mesh name (same logic as Objects.js
        // parsers, but using fresh material instances with uRevealProgress = 1).
        this.chassis.object.traverse((child) =>
        {
            if(child.isMesh)
            {
                child.material = this._materialForMesh(child.name)
            }
        })

        this.container.add(this.chassis.object)

        // Wheels — apply matcap per mesh name as well
        this.wheels = [0, 1, 2, 3].map((i) =>
        {
            const wheel = {}
            wheel.object = this.wheelTemplate.clone(true)

            wheel.object.traverse((child) =>
            {
                if(child.isMesh)
                {
                    child.material = this._materialForMesh(child.name)
                }
            })

            // Mirror left-side wheels (indices 1 and 3)
            if(i % 2 === 1)
            {
                wheel.object.scale.x = -1
            }

            this.scene.add(wheel.object)
            return wheel
        })
    }

    _buildNameLabel()
    {
        this.label = {}
        this.label.$element = document.createElement('div')
        this.label.$element.className    = 'remote-player-label'
        this.label.$element.textContent  = this.name
        this.label.$element.style.cssText = `
            position: fixed;
            background: rgba(0,0,0,0.55);
            color: #fff;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            pointer-events: none;
            user-select: none;
            white-space: nowrap;
            transform: translate(-50%, -100%);
            display: none;
        `
        document.body.appendChild(this.label.$element)
        this.label.visible = false
    }

    // ── snapshot handling ───────────────────────────────────────────────────

    addSnapshot(snapshot)
    {
        this.snapshots.push({
            t:      snapshot.t,
            pos:    snapshot.pos,
            quat:   snapshot.quat,
            wheels: snapshot.wheels,
        })

        // Keep only last 3 seconds
        const cutoff = Date.now() - NETWORK.snapshotBufferTime
        while(this.snapshots.length > 2 && this.snapshots[0].t < cutoff)
        {
            this.snapshots.shift()
        }

        if(this.snapshots.length === 1)
        {
            console.log(`[RemoteCar] first snapshot for "${this.name}" pos:`, snapshot.pos)
        }
    }

    // ── update loop ─────────────────────────────────────────────────────────

    update(camera, sizes)
    {
        if(this.snapshots.length === 0) return

        const renderTime = Date.now() - this.interpolationDelay

        let older = null
        let newer = null

        for(let i = 0; i < this.snapshots.length - 1; i++)
        {
            if(this.snapshots[i].t <= renderTime && this.snapshots[i + 1].t >= renderTime)
            {
                older = this.snapshots[i]
                newer = this.snapshots[i + 1]
                break
            }
        }

        if(!older || !newer)
        {
            const latest = this.snapshots[this.snapshots.length - 1]
            this._applySnapshot(latest, 0, latest)
        }
        else
        {
            const total = newer.t - older.t
            const alpha = total > 0 ? (renderTime - older.t) / total : 0
            this._applySnapshot(older, alpha, newer)
        }

        this._updateWheelPositions()
        this._updateLabel(camera, sizes)
    }

    // ── collision body ──────────────────────────────────────────────────────

    _ensurePhysicsBody()
    {
        if(this._physicsBody) return
        const physWorld = this.getPhysicsWorld?.()
        if(!physWorld) return

        this._physicsWorld = physWorld

        const C = PHYSICS.car
        this._physicsBody = new CANNON.Body({ mass: 0 })  // mass=0 → static obstacle
        this._physicsBody.addShape(
            new CANNON.Box(new CANNON.Vec3(C.chassisHalfSize.x, C.chassisHalfSize.y, C.chassisHalfSize.z)),
            new CANNON.Vec3(C.chassisOffset.x, C.chassisOffset.y, C.chassisOffset.z)
        )
        // Tag so Physics.js collision handler can identify this as a bumper car
        this._physicsBody.isBumperCar = true
        this._physicsBody.remoteCarId = this.id
        physWorld.addBody(this._physicsBody)
    }

    // ── snapshot application ─────────────────────────────────────────────────

    _applySnapshot(older, alpha, newer)
    {
        // Chassis position + rotation
        const px = older.pos[0] + (newer.pos[0] - older.pos[0]) * alpha
        const py = older.pos[1] + (newer.pos[1] - older.pos[1]) * alpha
        const pz = older.pos[2] + (newer.pos[2] - older.pos[2]) * alpha
        this.container.position.set(px, py, pz)
        this.chassis.object.position.set(0, 0, -0.28) // same offset as local Car.js

        const q1 = new THREE.Quaternion(older.quat[0], older.quat[1], older.quat[2], older.quat[3])
        const q2 = new THREE.Quaternion(newer.quat[0], newer.quat[1], newer.quat[2], newer.quat[3])
        q1.slerp(q2, alpha)
        this.container.quaternion.copy(q1)

        // Sync collision body with interpolated position — lazy-create if needed
        this._ensurePhysicsBody()
        if(this._physicsBody)
        {
            this._physicsBody.position.set(px, py, pz)
            this._physicsBody.quaternion.set(q1.x, q1.y, q1.z, q1.w)
        }

        // Wheel transforms (server-provided world positions & quaternions)
        if(older.wheels && newer.wheels)
        {
            this.wheels.forEach((wheel, i) =>
            {
                const ow = older.wheels[i]
                const nw = newer.wheels[i]

                wheel.worldPos = [
                    ow.pos[0] + (nw.pos[0] - ow.pos[0]) * alpha,
                    ow.pos[1] + (nw.pos[1] - ow.pos[1]) * alpha,
                    ow.pos[2] + (nw.pos[2] - ow.pos[2]) * alpha,
                ]

                const wq1 = new THREE.Quaternion(ow.quat[0], ow.quat[1], ow.quat[2], ow.quat[3])
                const wq2 = new THREE.Quaternion(nw.quat[0], nw.quat[1], nw.quat[2], nw.quat[3])
                wq1.slerp(wq2, alpha)
                wheel.worldQuat = wq1
            })
        }
    }

    _updateWheelPositions()
    {
        this.wheels.forEach((wheel) =>
        {
            if(!wheel.worldPos) return
            wheel.object.position.set(wheel.worldPos[0], wheel.worldPos[1], wheel.worldPos[2])
            wheel.object.quaternion.copy(wheel.worldQuat)
        })
    }

    _updateLabel(camera, sizes)
    {
        if(!camera || !sizes) return

        const worldPos = this.container.position.clone()
        worldPos.z += 1.5

        const projected = worldPos.project(camera.instance)

        if(projected.z > 1)
        {
            this.label.$element.style.display = 'none'
            return
        }

        const x = (projected.x *  0.5 + 0.5) * sizes.viewport.width
        const y = (projected.y * -0.5 + 0.5) * sizes.viewport.height

        this.label.$element.style.display = 'block'
        this.label.$element.style.left    = `${x}px`
        this.label.$element.style.top     = `${y}px`
    }

    destroy()
    {
        this.scene.remove(this.container)
        this.wheels.forEach(w => this.scene.remove(w.object))

        if(this._physicsWorld && this._physicsBody)
        {
            this._physicsWorld.remove(this._physicsBody)
            this._physicsBody  = null
            this._physicsWorld = null
        }

        if(this.label.$element.parentNode)
        {
            this.label.$element.parentNode.removeChild(this.label.$element)
        }
    }
}
