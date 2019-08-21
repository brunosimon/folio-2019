import * as THREE from 'three'

import Loader from './Utils/Loader.js'
import EventEmitter from './Utils/EventEmitter.js'

// Matcaps
import matcapBeigeSource from '../models/matcaps/beige.png'
import matcapBlackSource from '../models/matcaps/black.png'
import matcapOrangeSource from '../models/matcaps/orange.png'
import matcapRedSource from '../models/matcaps/red.png'
import matcapWhiteSource from '../models/matcaps/white.png'
import matcapGreenSource from '../models/matcaps/green.png'
import matcapBrownSource from '../models/matcaps/brown.png'
import matcapGraySource from '../models/matcaps/gray.png'

// Landing
import landingStaticFloorShadowSource from '../models/landing/static/floor-shadow.png'
import landingStaticBaseSource from '../models/landing/static/base.glb'
import landingStaticCollisionSource from '../models/landing/static/collision.glb'

import landingArrowKeyBaseSource from '../models/landing/arrowKey/base.glb'
import landingArrowKeyCollisionSource from '../models/landing/arrowKey/collision.glb'

// Intro
import introStaticFloorShadowSource from '../models/intro/static/floor-shadow.png'
import introStaticBaseSource from '../models/intro/static/base.glb'
import introStaticCollisionSource from '../models/intro/static/collision.glb'

// Car
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
            // Matcaps
            { name: 'matcapBeige', source: matcapBeigeSource },
            { name: 'matcapBlack', source: matcapBlackSource },
            { name: 'matcapOrange', source: matcapOrangeSource },
            { name: 'matcapRed', source: matcapRedSource },
            { name: 'matcapWhite', source: matcapWhiteSource },
            { name: 'matcapGreen', source: matcapGreenSource },
            { name: 'matcapBrown', source: matcapBrownSource },
            { name: 'matcapGray', source: matcapGraySource },

            // Landing
            { name: 'landingStaticBase', source: landingStaticBaseSource },
            { name: 'landingStaticCollision', source: landingStaticCollisionSource },
            { name: 'landingStaticFloorShadow', source: landingStaticFloorShadowSource },

            { name: 'landingArrowKeyBase', source: landingArrowKeyBaseSource },
            { name: 'landingArrowKeyCollision', source: landingArrowKeyCollisionSource },

            // Intro
            { name: 'introStaticBase', source: introStaticBaseSource },
            { name: 'introStaticCollision', source: introStaticCollisionSource },
            { name: 'introStaticFloorShadow', source: introStaticFloorShadowSource },


            // Car
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

            this.items.landingStaticFloorShadowTexture = new THREE.Texture(this.items.landingStaticFloorShadow)
            this.items.landingStaticFloorShadowTexture.needsUpdate = true

            this.items.introStaticFloorShadowTexture = new THREE.Texture(this.items.introStaticFloorShadow)
            this.items.introStaticFloorShadowTexture.needsUpdate = true

            // Trigger ready
            this.trigger('ready')
        })
    }
}
