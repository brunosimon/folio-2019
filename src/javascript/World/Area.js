import * as THREE from 'three'

import EventEmitter from '../Utils/EventEmitter.js'
import AreaFloorBorderBufferGeometry from '../Geometries/AreaFloorBorderBufferGeometry.js'

export default class Area extends EventEmitter
{
    constructor(_options)
    {
        super()

        // Options
        this.position = _options.position
        this.halfExtents = _options.halfExtents

        // Set up
        this.container = new THREE.Object3D()

        this.setFloorBorder()
    }

    setFloorBorder()
    {
        this.floorBorder = {}

        this.floorBorder.geometry = new AreaFloorBorderBufferGeometry(3, 3, 0.5)
        this.floorBorder.geometry.rotateX(Math.PI)
        this.floorBorder.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false, transparent: true, opacity: 0.5 })
        this.floorBorder.mesh = new THREE.Mesh(this.floorBorder.geometry, this.floorBorder.material)

        this.container.add(this.floorBorder.mesh)
    }
}
