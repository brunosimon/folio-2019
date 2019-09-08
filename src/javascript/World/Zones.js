import * as THREE from 'three'

import Zone from './Zone.js'

export default class Zones
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.debug = _options.debug


        // Set up
        this.container = new THREE.Object3D()
    }

    add(_options)
    {
        const zone = new Zone({})
    }
}
