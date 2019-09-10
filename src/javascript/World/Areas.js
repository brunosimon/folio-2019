import * as THREE from 'three'

import Area from './Area.js'

export default class Areas
{
    constructor(_options)
    {
        // Options
        this.resources = _options.resources
        this.car = _options.car
        this.time = _options.time
        this.debug = _options.debug

        // Set up
        this.container = new THREE.Object3D()
    }

    add(_options)
    {
        const area = new Area({
            resources: this.resources,
            car: this.car,
            time: this.time,
            ..._options
        })

        this.container.add(area.container)

        return area
    }
}
