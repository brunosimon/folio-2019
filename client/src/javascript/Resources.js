import * as THREE from 'three'

import Loader from './Utils/Loader.js'
import EventEmitter from './Utils/EventEmitter.js'

export default class Resources extends EventEmitter
{
    constructor()
    {
        super()

        this.loader = new Loader()
        this.items = {}

        this.loader.load([
            // Matcaps
            { name: 'matcapBeige', source: './models/matcaps/beige.png', type: 'texture' },
            { name: 'matcapBlack', source: './models/matcaps/black.png', type: 'texture' },
            { name: 'matcapOrange', source: './models/matcaps/orange.png', type: 'texture' },
            { name: 'matcapRed', source: './models/matcaps/red.png', type: 'texture' },
            { name: 'matcapWhite', source: './models/matcaps/white.png', type: 'texture' },
            { name: 'matcapGreen', source: './models/matcaps/green.png', type: 'texture' },
            { name: 'matcapBrown', source: './models/matcaps/brown.png', type: 'texture' },
            { name: 'matcapGray', source: './models/matcaps/gray.png', type: 'texture' },
            { name: 'matcapEmeraldGreen', source: './models/matcaps/emeraldGreen.png', type: 'texture' },
            { name: 'matcapPurple', source: './models/matcaps/purple.png', type: 'texture' },
            { name: 'matcapBlue', source: './models/matcaps/blue.png', type: 'texture' },
            { name: 'matcapYellow', source: './models/matcaps/yellow.png', type: 'texture' },
            { name: 'matcapMetal', source: './models/matcaps/metal.png', type: 'texture' },

            // Car default
            { name: 'carDefaultChassis', source: './models/car/default/chassis.glb' },
            { name: 'carDefaultWheel', source: './models/car/default/wheel.glb' },
            { name: 'carDefaultBackLightsBrake', source: './models/car/default/backLightsBrake.glb' },
            { name: 'carDefaultBackLightsReverse', source: './models/car/default/backLightsReverse.glb' },
            { name: 'carDefaultAntena', source: './models/car/default/antena.glb' },

            // Car CyberTruck
            { name: 'carCyberTruckChassis', source: './models/car/cyberTruck/chassis.glb' },
            { name: 'carCyberTruckWheel', source: './models/car/cyberTruck/wheel.glb' },
            { name: 'carCyberTruckBackLightsBrake', source: './models/car/cyberTruck/backLightsBrake.glb' },
            { name: 'carCyberTruckBackLightsReverse', source: './models/car/cyberTruck/backLightsReverse.glb' },
            { name: 'carCyberTruckAntena', source: './models/car/cyberTruck/antena.glb' },

            // Tiles
            { name: 'tilesABase', source: './models/tiles/a/base.glb' },
            { name: 'tilesACollision', source: './models/tiles/a/collision.glb' },

            { name: 'tilesBBase', source: './models/tiles/b/base.glb' },
            { name: 'tilesBCollision', source: './models/tiles/b/collision.glb' },

            { name: 'tilesCBase', source: './models/tiles/c/base.glb' },
            { name: 'tilesCCollision', source: './models/tiles/c/collision.glb' },

            { name: 'tilesDBase', source: './models/tiles/d/base.glb' },
            { name: 'tilesDCollision', source: './models/tiles/d/collision.glb' },

            { name: 'tilesEBase', source: './models/tiles/e/base.glb' },
            { name: 'tilesECollision', source: './models/tiles/e/collision.glb' },

            // Brick
            { name: 'brickBase', source: './models/brick/base.glb' },
            { name: 'brickCollision', source: './models/brick/collision.glb' },
        ])

        this.loader.on('fileEnd', (_resource, _data) =>
        {
            this.items[_resource.name] = _data

            // Texture
            if(_resource.type === 'texture')
            {
                const texture = new THREE.Texture(_data)
                texture.needsUpdate = true

                this.items[`${_resource.name}Texture`] = texture
            }

            // Trigger progress
            this.trigger('progress', [this.loader.loaded / this.loader.toLoad])
        })

        this.loader.on('end', () =>
        {
            // Trigger ready
            this.trigger('ready')
        })
    }
}
