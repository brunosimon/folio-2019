import * as THREE from 'three'
import FloorMaterial from '../Materials/Floor.js'

export default class Floor
{
    constructor(_options)
    {
        // Options
        this.debug = _options.debug

        // Container
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // Large plane covering the driveable area — world-space so the grid scrolls with movement
        this.geometry = new THREE.PlaneGeometry(2000, 2000, 1, 1)

        // Material
        this.material = new FloorMaterial()

        // Mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.frustumCulled = false
        this.container.add(this.mesh)

    }
}
