import * as THREE from 'three'

import Loader from './Utils/Loader.js'
import EventEmitter from './Utils/EventEmitter.js'

import matcapBuildingSource from '../models/matcaps/building.png'
import matcapRockSource from '../models/matcaps/rock.png'

import demoFloorShadowSource from '../models/demo/floor-shadow.png'
import demoBaseSource from '../models/demo/base.glb'
import demoCollisionSource from '../models/demo/collision.glb'

export default class Resources extends EventEmitter
{
    constructor()
    {
        super()

        this.loader = new Loader()
        this.items = {}

        this.loader.load([
            { name: 'demoBase', source: demoBaseSource },
            { name: 'demoCollision', source: demoCollisionSource },
            { name: 'demoFloorShadow', source: demoFloorShadowSource },

            { name: 'matcapBuilding', source: matcapBuildingSource },
            { name: 'matcapRock', source: matcapRockSource }
        ])

        this.loader.on('fileEnd', (_resource, _data) =>
        {
            this.items[_resource.name] = _data
        })

        this.loader.on('end', () =>
        {
            this.items.matcapBuildingTexture = new THREE.Texture(this.items.matcapBuilding)
            this.items.matcapBuildingTexture.needsUpdate = true

            this.items.matcapRockTexture = new THREE.Texture(this.items.matcapRock)
            this.items.matcapRockTexture.needsUpdate = true

            this.items.demoFloorShadowTexture = new THREE.Texture(this.items.demoFloorShadow)
            this.items.demoFloorShadowTexture.needsUpdate = true

            this.trigger('ready')
        })
    }
}
