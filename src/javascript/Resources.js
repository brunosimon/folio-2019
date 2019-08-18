import * as THREE from 'three'

import Loader from './Utils/Loader.js'
import EventEmitter from './Utils/EventEmitter.js'

import matcapBeigeSource from '../models/matcaps/beige.png'
import matcapBlackSource from '../models/matcaps/black.png'
import matcapOrangeSource from '../models/matcaps/orange.png'
import matcapRedSource from '../models/matcaps/red.png'
import matcapWhiteSource from '../models/matcaps/white.png'
import matcapGreenSource from '../models/matcaps/green.png'
import matcapBrownSource from '../models/matcaps/brown.png'
import matcapGraySource from '../models/matcaps/gray.png'

import landingFloorShadowSource from '../models/landing/floor-shadow.png'
import landingBaseSource from '../models/landing/base.glb'
import landingCollisionSource from '../models/landing/collision.glb'

import ArrowKeyBaseSource from '../models/arrowKey/base.glb'
import ArrowKeyCollisionSource from '../models/arrowKey/collision.glb'

import carChassisSource from '../models/car/chassis.glb'
import carWheelSource from '../models/car/wheel.glb'
import carBackLightsBrakeSource from '../models/car/backLightsBrake.glb'
import carBackLightsReverseSource from '../models/car/backLightsReverse.glb'
import carAntenaSource from '../models/car/antena.glb'

export default class Resources extends EventEmitter
{
    constructor()
    {
        super()

        this.loader = new Loader()
        this.items = {}

        this.loader.load([
            { name: 'matcapBeige', source: matcapBeigeSource },
            { name: 'matcapBlack', source: matcapBlackSource },
            { name: 'matcapOrange', source: matcapOrangeSource },
            { name: 'matcapRed', source: matcapRedSource },
            { name: 'matcapWhite', source: matcapWhiteSource },
            { name: 'matcapGreen', source: matcapGreenSource },
            { name: 'matcapBrown', source: matcapBrownSource },
            { name: 'matcapGray', source: matcapGraySource },

            { name: 'landingBase', source: landingBaseSource },
            { name: 'landingCollision', source: landingCollisionSource },
            { name: 'landingFloorShadow', source: landingFloorShadowSource },

            { name: 'arrowKeyBase', source: ArrowKeyBaseSource },
            { name: 'arrowKeyCollision', source: ArrowKeyCollisionSource },

            { name: 'carChassis', source: carChassisSource },
            { name: 'carWheel', source: carWheelSource },
            { name: 'carBackLightsBrake', source: carBackLightsBrakeSource },
            { name: 'carBackLightsReverse', source: carBackLightsReverseSource },
            { name: 'carAntena', source: carAntenaSource }
        ])

        this.loader.on('fileEnd', (_resource, _data) =>
        {
            this.items[_resource.name] = _data
        })

        this.loader.on('end', () =>
        {
            // Create textures
            this.items.matcapBeigeTexture = new THREE.Texture(this.items.matcapBeige)
            this.items.matcapBeigeTexture.needsUpdate = true

            this.items.matcapBlackTexture = new THREE.Texture(this.items.matcapBlack)
            this.items.matcapBlackTexture.needsUpdate = true

            this.items.matcapOrangeTexture = new THREE.Texture(this.items.matcapOrange)
            this.items.matcapOrangeTexture.needsUpdate = true

            this.items.matcapRedTexture = new THREE.Texture(this.items.matcapRed)
            this.items.matcapRedTexture.needsUpdate = true

            this.items.matcapWhiteTexture = new THREE.Texture(this.items.matcapWhite)
            this.items.matcapWhiteTexture.needsUpdate = true

            this.items.matcapGreenTexture = new THREE.Texture(this.items.matcapGreen)
            this.items.matcapGreenTexture.needsUpdate = true

            this.items.matcapBrownTexture = new THREE.Texture(this.items.matcapBrown)
            this.items.matcapBrownTexture.needsUpdate = true

            this.items.matcapGrayTexture = new THREE.Texture(this.items.matcapGray)
            this.items.matcapGrayTexture.needsUpdate = true

            this.items.landingFloorShadowTexture = new THREE.Texture(this.items.landingFloorShadow)
            this.items.landingFloorShadowTexture.needsUpdate = true

            // Trigger ready
            this.trigger('ready')
        })
    }
}
