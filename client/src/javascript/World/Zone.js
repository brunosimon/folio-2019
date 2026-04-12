import * as THREE from 'three'

import EventEmitter from '../Utils/EventEmitter.js'

export default class Zone extends EventEmitter
{
    constructor(_options)
    {
        super()

        // Options
        this.position = _options.position
        this.halfExtents = _options.halfExtents
        this.data = _options.data

        // Set up
        this.isIn = false

        // Mesh
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(_options.halfExtents.x * 2, _options.halfExtents.y * 2, 3, 1, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
        )
        this.mesh.position.x = _options.position.x
        this.mesh.position.y = _options.position.y
        this.mesh.position.z = 1.5
    }
}
