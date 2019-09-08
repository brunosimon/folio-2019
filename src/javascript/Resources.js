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

// Intro
import introStaticFloorShadowSource from '../models/intro/static/floor-shadow.png'
import introStaticBaseSource from '../models/intro/static/base.glb'
import introStaticCollisionSource from '../models/intro/static/collision.glb'

import introArrowKeyBaseSource from '../models/intro/arrowKey/base.glb'
import introArrowKeyCollisionSource from '../models/intro/arrowKey/collision.glb'

import introBBaseSource from '../models/intro/b/base.glb'
import introBCollisionSource from '../models/intro/b/collision.glb'

import introRBaseSource from '../models/intro/r/base.glb'
import introRCollisionSource from '../models/intro/r/collision.glb'

import introUBaseSource from '../models/intro/u/base.glb'
import introUCollisionSource from '../models/intro/u/collision.glb'

import introNBaseSource from '../models/intro/n/base.glb'
import introNCollisionSource from '../models/intro/n/collision.glb'

import introOBaseSource from '../models/intro/o/base.glb'
import introOCollisionSource from '../models/intro/o/collision.glb'

import introSBaseSource from '../models/intro/s/base.glb'
import introSCollisionSource from '../models/intro/s/collision.glb'

import introIBaseSource from '../models/intro/i/base.glb'
import introICollisionSource from '../models/intro/i/collision.glb'

import introMBaseSource from '../models/intro/m/base.glb'
import introMCollisionSource from '../models/intro/m/collision.glb'

// Intro
import crossroadsStaticFloorShadowSource from '../models/crossroads/static/floor-shadow.png'
import crossroadsStaticBaseSource from '../models/crossroads/static/base.glb'
import crossroadsStaticCollisionSource from '../models/crossroads/static/collision.glb'

// Car
import carChassisSource from '../models/car/chassis.glb'
import carWheelSource from '../models/car/wheel.glb'
import carBackLightsBrakeSource from '../models/car/backLightsBrake.glb'
import carBackLightsReverseSource from '../models/car/backLightsReverse.glb'
import carAntenaSource from '../models/car/antena.glb'

// Projects
import projectsBillboardStructureSource from '../models/projects/billboard/structure.glb'
import projectsBillboardSheetSource from '../models/projects/billboard/sheet.glb'
import projectsBillboardGearSource from '../models/projects/billboard/gear.glb'
import projectsBillboardFloorSource from '../models/projects/billboard/floor.glb'
import projectsBillboardCitrixRedbullSlidesSource from '../models/projects/citrixRedbull/slidesTexture.jpg'
import projectsBillboardCitrixRedbullFloorSource from '../models/projects/citrixRedbull/floorTexture.jpg'

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

            // Intro
            { name: 'introStaticBase', source: introStaticBaseSource },
            { name: 'introStaticCollision', source: introStaticCollisionSource },
            { name: 'introStaticFloorShadow', source: introStaticFloorShadowSource },

            { name: 'introArrowKeyBase', source: introArrowKeyBaseSource },
            { name: 'introArrowKeyCollision', source: introArrowKeyCollisionSource },

            { name: 'introBBase', source: introBBaseSource },
            { name: 'introBCollision', source: introBCollisionSource },

            { name: 'introRBase', source: introRBaseSource },
            { name: 'introRCollision', source: introRCollisionSource },

            { name: 'introUBase', source: introUBaseSource },
            { name: 'introUCollision', source: introUCollisionSource },

            { name: 'introNBase', source: introNBaseSource },
            { name: 'introNCollision', source: introNCollisionSource },

            { name: 'introOBase', source: introOBaseSource },
            { name: 'introOCollision', source: introOCollisionSource },

            { name: 'introSBase', source: introSBaseSource },
            { name: 'introSCollision', source: introSCollisionSource },

            { name: 'introIBase', source: introIBaseSource },
            { name: 'introICollision', source: introICollisionSource },

            { name: 'introMBase', source: introMBaseSource },
            { name: 'introMCollision', source: introMCollisionSource },

            // Intro
            { name: 'crossroadsStaticBase', source: crossroadsStaticBaseSource },
            { name: 'crossroadsStaticCollision', source: crossroadsStaticCollisionSource },
            { name: 'crossroadsStaticFloorShadow', source: crossroadsStaticFloorShadowSource },

            // Car
            { name: 'carChassis', source: carChassisSource },
            { name: 'carWheel', source: carWheelSource },
            { name: 'carBackLightsBrake', source: carBackLightsBrakeSource },
            { name: 'carBackLightsReverse', source: carBackLightsReverseSource },
            { name: 'carAntena', source: carAntenaSource },

            // Projects
            { name: 'projectsBillboardStructure', source: projectsBillboardStructureSource },
            { name: 'projectsBillboardSheet', source: projectsBillboardSheetSource },
            { name: 'projectsBillboardGear', source: projectsBillboardGearSource },
            { name: 'projectsBillboardFloor', source: projectsBillboardFloorSource },
            { name: 'projectsBillboardCitrixRedbullSlides', source: projectsBillboardCitrixRedbullSlidesSource },
            { name: 'projectsBillboardCitrixRedbullFloor', source: projectsBillboardCitrixRedbullFloorSource }
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

            this.items.introStaticFloorShadowTexture = new THREE.Texture(this.items.introStaticFloorShadow)
            this.items.introStaticFloorShadowTexture.needsUpdate = true

            this.items.crossroadsStaticFloorShadowTexture = new THREE.Texture(this.items.crossroadsStaticFloorShadow)
            this.items.crossroadsStaticFloorShadowTexture.needsUpdate = true

            this.items.projectsBillboardCitrixRedbullSlidesTexture = new THREE.Texture(this.items.projectsBillboardCitrixRedbullSlides)
            this.items.projectsBillboardCitrixRedbullSlidesTexture.needsUpdate = true

            this.items.projectsBillboardCitrixRedbullFloorTexture = new THREE.Texture(this.items.projectsBillboardCitrixRedbullFloor)
            this.items.projectsBillboardCitrixRedbullFloorTexture.needsUpdate = true

            // Trigger ready
            this.trigger('ready')
        })
    }
}
