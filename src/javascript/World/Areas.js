import * as THREE from 'three'

import Area from './Area.js'

export default class Areas
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
        const area = new Area({})
    }
}
