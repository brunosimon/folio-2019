import * as THREE from 'three'

import Loader from './Utils/Loader.js'
import EventEmitter from './Utils/EventEmitter.js'

import matcapBuildingSource from '../models/matcaps/building.png'
import matcapRockSource from '../models/matcaps/rock.png'

import staticDemoFloorShadowSource from '../models/staticDemo/floor-shadow.png'
import staticDemoBaseSource from '../models/staticDemo/base.glb'
import staticDemoCollisionSource from '../models/staticDemo/collision.glb'

import dynamicSphereBaseSource from '../models/dynamicSphere/base.glb'
import dynamicSphereCollisionSource from '../models/dynamicSphere/collision.glb'

import dynamicBoxBaseSource from '../models/dynamicBox/base.glb'
import dynamicBoxCollisionSource from '../models/dynamicBox/collision.glb'

export default class Resources extends EventEmitter
{
    constructor()
    {
        super()

        this.loader = new Loader()
        this.items = {}

        this.loader.load([
            { name: 'matcapBuilding', source: matcapBuildingSource },
            { name: 'matcapRock', source: matcapRockSource },

            { name: 'staticDemoBase', source: staticDemoBaseSource },
            { name: 'staticDemoCollision', source: staticDemoCollisionSource },
            { name: 'staticDemoFloorShadow', source: staticDemoFloorShadowSource },

            { name: 'dynamicSphereBase', source: dynamicSphereBaseSource },
            { name: 'dynamicSphereCollision', source: dynamicSphereCollisionSource },

            { name: 'dynamicBoxBase', source: dynamicBoxBaseSource },
            { name: 'dynamicBoxCollision', source: dynamicBoxCollisionSource }
        ])

        this.loader.on('fileEnd', (_resource, _data) =>
        {
            this.items[_resource.name] = _data
        })

        this.loader.on('end', () =>
        {
            // Create textures
            this.items.matcapBuildingTexture = new THREE.Texture(this.items.matcapBuilding)
            this.items.matcapBuildingTexture.needsUpdate = true

            this.items.matcapRockTexture = new THREE.Texture(this.items.matcapRock)
            this.items.matcapRockTexture.needsUpdate = true

            this.items.staticDemoFloorShadowTexture = new THREE.Texture(this.items.staticDemoFloorShadow)
            this.items.staticDemoFloorShadowTexture.needsUpdate = true

            // Objects
            this.items.objects = [
                {
                    base: this.items.staticDemoBase.scene,
                    collision: this.items.staticDemoCollision.scene,
                    floorShadowTexture: this.items.staticDemoFloorShadowTexture,
                    offset: new THREE.Vector3(0, 0, 0),
                    mass: 0
                },
                {
                    base: this.items.dynamicSphereBase.scene,
                    collision: this.items.dynamicSphereCollision.scene,
                    offset: new THREE.Vector3(0, 0, 0),
                    mass: 2
                },
                {
                    base: this.items.dynamicBoxBase.scene,
                    collision: this.items.dynamicBoxCollision.scene,
                    offset: new THREE.Vector3(0, 2, 0),
                    mass: 2
                },
                {
                    base: this.items.dynamicBoxBase.scene,
                    collision: this.items.dynamicBoxCollision.scene,
                    offset: new THREE.Vector3(0, 4, 0),
                    mass: 2
                },
                {
                    base: this.items.dynamicBoxBase.scene,
                    collision: this.items.dynamicBoxCollision.scene,
                    offset: new THREE.Vector3(0, 6, 0),
                    mass: 2
                },
                {
                    base: this.items.dynamicBoxBase.scene,
                    collision: this.items.dynamicBoxCollision.scene,
                    offset: new THREE.Vector3(0, 8, 0),
                    mass: 2
                }
            ]

            this.trigger('ready')
        })
    }
}
