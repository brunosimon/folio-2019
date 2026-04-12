import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import CANNON from 'cannon'
import MatcapMaterial from '../Materials/Matcap.js'

// ── Layout constants ────────────────────────────────────────────────────────
const TRACK_WIDTH    = 14      // meters between inner & outer walls
const WALL_HEIGHT    = 1.2
const WALL_THICK     = 0.6
const SURFACE_Z      = 0.015   // just above floor

const SHADE_UNIFORMS = {
    uRevealProgress:            1,
    uIndirectDistanceAmplitude: 1.75,
    uIndirectDistanceStrength:  0.5,
    uIndirectDistancePower:     2.0,
    uIndirectAngleStrength:     1.5,
    uIndirectAngleOffset:       0.6,
    uIndirectAnglePower:        1.0,
    uIndirectColor:             new THREE.Color('#d04500'),
}

export default class Track
{
    constructor(_options)
    {
        this.world     = _options.world
        this.floorMat  = _options.floorMaterial
        this.resources = _options.resources

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // Materials for barriers
        this._matRed   = this._makeMatcap('matcapRedTexture')
        this._matWhite = this._makeMatcap('matcapWhiteTexture')

        this._build()
    }

    // ── matcap helper ───────────────────────────────────────────────────────

    _makeMatcap(texName)
    {
        const mat = MatcapMaterial()
        mat.uniforms.matcap.value = this.resources.items[texName]
            || this.resources.items.matcapWhiteTexture
        for(const [k, v] of Object.entries(SHADE_UNIFORMS))
            mat.uniforms[k].value = v
        return mat
    }

    // ── build pipeline ──────────────────────────────────────────────────────

    _build()
    {
        const center = this._centerline()
        const { outer, inner } = this._offsetPaths(center)

        // Store for minimap
        this.outerPath = outer
        this.innerPath = inner

        this._createWallLoop(outer)
        this._createWallLoop(inner)
        this._createSurface(outer, inner)
        this._createStartFinish(outer[0], inner[0])
        this._createCenterDashes(center)
    }

    // ── centerline from CatmullRom ──────────────────────────────────────────

    _centerline()
    {
        const cp = [
            new THREE.Vector3( 5,   -35, 0),
            new THREE.Vector3( 40,  -35, 0),
            new THREE.Vector3( 58,  -22, 0),
            new THREE.Vector3( 58,   5,  0),
            new THREE.Vector3( 50,   25, 0),
            new THREE.Vector3( 30,   40, 0),
            new THREE.Vector3( 0,    42, 0),
            new THREE.Vector3(-25,   35, 0),
            new THREE.Vector3(-38,   18, 0),
            new THREE.Vector3(-42,  -5,  0),
            new THREE.Vector3(-38,  -25, 0),
            new THREE.Vector3(-20,  -38, 0),
        ]

        const curve = new THREE.CatmullRomCurve3(cp, true, 'catmullrom', 0.3)
        return curve.getPoints(200).map(p => ({ x: p.x, y: p.y }))
    }

    // ── compute inner / outer edge paths ────────────────────────────────────

    _offsetPaths(center)
    {
        const N = center.length
        const outer = []
        const inner = []

        for(let i = 0; i < N; i++)
        {
            const prev = center[(i - 1 + N) % N]
            const curr = center[i]
            const next = center[(i + 1) % N]

            const dx = next.x - prev.x
            const dy = next.y - prev.y
            const len = Math.sqrt(dx * dx + dy * dy) || 1
            const nx = -dy / len   // perpendicular
            const ny =  dx / len

            outer.push({ x: curr.x + nx * TRACK_WIDTH / 2, y: curr.y + ny * TRACK_WIDTH / 2 })
            inner.push({ x: curr.x - nx * TRACK_WIDTH / 2, y: curr.y - ny * TRACK_WIDTH / 2 })
        }

        return { outer, inner }
    }

    // ── wall segments (merged geometry, single CANNON body) ─────────────────

    _createWallLoop(pts)
    {
        const redGeoms   = []
        const whiteGeoms = []

        // Single CANNON body with one shape per segment — much lighter than N bodies
        const wallBody = new CANNON.Body({ mass: 0, material: this.floorMat })
        wallBody.allowSleep = true
        wallBody.sleep()

        for(let i = 0; i < pts.length; i++)
        {
            const p1 = pts[i]
            const p2 = pts[(i + 1) % pts.length]

            const dx = p2.x - p1.x
            const dy = p2.y - p1.y
            const len = Math.sqrt(dx * dx + dy * dy)
            if(len < 0.01) continue

            const mx = (p1.x + p2.x) / 2
            const my = (p1.y + p2.y) / 2
            const angle = Math.atan2(dy, dx)

            // Physics shape
            const shape = new CANNON.Box(new CANNON.Vec3(len / 2 + 0.05, WALL_THICK / 2, WALL_HEIGHT / 2))
            const shapePos  = new CANNON.Vec3(mx, my, WALL_HEIGHT / 2)
            const shapeQuat = new CANNON.Quaternion()
            shapeQuat.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), angle)
            wallBody.addShape(shape, shapePos, shapeQuat)

            // Visual geometry — bake transform into geometry for merging
            const geo = new THREE.BoxGeometry(len + 0.1, WALL_THICK, WALL_HEIGHT)
            const mat4 = new THREE.Matrix4()
            mat4.compose(
                new THREE.Vector3(mx, my, WALL_HEIGHT / 2),
                new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle),
                new THREE.Vector3(1, 1, 1)
            )
            geo.applyMatrix4(mat4)

            // Alternate red / white in groups of 3
            if(i % 6 < 3) redGeoms.push(geo)
            else           whiteGeoms.push(geo)
        }

        this.world.addBody(wallBody)

        // Merge and add meshes
        if(redGeoms.length > 0)
        {
            const merged = BufferGeometryUtils.mergeGeometries(redGeoms)
            const mesh = new THREE.Mesh(merged, this._matRed)
            mesh.matrixAutoUpdate = false
            mesh.updateMatrix()
            this.container.add(mesh)
        }
        if(whiteGeoms.length > 0)
        {
            const merged = BufferGeometryUtils.mergeGeometries(whiteGeoms)
            const mesh = new THREE.Mesh(merged, this._matWhite)
            mesh.matrixAutoUpdate = false
            mesh.updateMatrix()
            this.container.add(mesh)
        }
    }

    // ── asphalt surface ribbon ──────────────────────────────────────────────

    _createSurface(outer, inner)
    {
        const N = outer.length
        const positions = []

        for(let i = 0; i < N; i++)
        {
            const j = (i + 1) % N
            positions.push(
                outer[i].x, outer[i].y, SURFACE_Z,
                inner[i].x, inner[i].y, SURFACE_Z,
                outer[j].x, outer[j].y, SURFACE_Z,

                inner[i].x, inner[i].y, SURFACE_Z,
                inner[j].x, inner[j].y, SURFACE_Z,
                outer[j].x, outer[j].y, SURFACE_Z,
            )
        }

        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        geo.computeVertexNormals()

        const mat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.matrixAutoUpdate = false
        mesh.updateMatrix()
        this.container.add(mesh)
    }

    // ── checkered start / finish line ────────────────────────────────────────

    _createStartFinish(o0, i0)
    {
        const dx = o0.x - i0.x
        const dy = o0.y - i0.y
        const len = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx)
        const mx = (o0.x + i0.x) / 2
        const my = (o0.y + i0.y) / 2

        const numSquares = 10
        const sqSize = len / numSquares
        const lineW  = 2
        const rows   = 2
        const geos   = []

        for(let col = 0; col < numSquares; col++)
        {
            for(let row = 0; row < rows; row++)
            {
                const isWhite = (col + row) % 2 === 0
                if(!isWhite) continue  // only need one color, black is the surface

                const geo = new THREE.PlaneGeometry(sqSize * 0.95, lineW / rows * 0.95)
                const along  = -len / 2 + sqSize / 2 + col * sqSize
                const across = -lineW / 2 + (lineW / rows) / 2 + row * (lineW / rows)

                const mat4 = new THREE.Matrix4()
                mat4.compose(
                    new THREE.Vector3(
                        mx + Math.cos(angle) * along - Math.sin(angle) * across,
                        my + Math.sin(angle) * along + Math.cos(angle) * across,
                        SURFACE_Z + 0.005
                    ),
                    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle),
                    new THREE.Vector3(1, 1, 1)
                )
                geo.applyMatrix4(mat4)
                geos.push(geo)
            }
        }

        if(geos.length > 0)
        {
            const merged = BufferGeometryUtils.mergeGeometries(geos)
            const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
            const mesh = new THREE.Mesh(merged, mat)
            mesh.matrixAutoUpdate = false
            mesh.updateMatrix()
            this.container.add(mesh)
        }
    }

    // ── dashed center line ──────────────────────────────────────────────────

    _createCenterDashes(center)
    {
        const dashLen   = 2.5
        const gapLen    = 4
        const dashWidth = 0.25
        const cycle     = dashLen + gapLen
        const geos      = []
        let accDist     = 0

        for(let i = 0; i < center.length; i++)
        {
            const p1 = center[i]
            const p2 = center[(i + 1) % center.length]
            const dx = p2.x - p1.x
            const dy = p2.y - p1.y
            const segLen = Math.sqrt(dx * dx + dy * dy)
            if(segLen < 0.01) continue

            const angle = Math.atan2(dy, dx)
            let t = 0

            while(t < segLen)
            {
                const posInCycle = accDist % cycle

                if(posInCycle < dashLen)
                {
                    const remaining = Math.min(dashLen - posInCycle, segLen - t)
                    const midT = (t + remaining / 2) / segLen
                    const cx = p1.x + dx * midT
                    const cy = p1.y + dy * midT

                    const geo = new THREE.PlaneGeometry(remaining, dashWidth)
                    const mat4 = new THREE.Matrix4()
                    mat4.compose(
                        new THREE.Vector3(cx, cy, SURFACE_Z + 0.003),
                        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle),
                        new THREE.Vector3(1, 1, 1)
                    )
                    geo.applyMatrix4(mat4)
                    geos.push(geo)

                    t += remaining
                    accDist += remaining
                }
                else
                {
                    const remaining = Math.min(cycle - posInCycle, segLen - t)
                    t += remaining
                    accDist += remaining
                }
            }
        }

        if(geos.length > 0)
        {
            const merged = BufferGeometryUtils.mergeGeometries(geos)
            const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, opacity: 0.5, transparent: true })
            const mesh = new THREE.Mesh(merged, mat)
            mesh.matrixAutoUpdate = false
            mesh.updateMatrix()
            this.container.add(mesh)
        }
    }
}
