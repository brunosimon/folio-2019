import * as THREE from 'three'
import * as dat from 'dat.gui'

import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Resources from './Utils/Resources.js'
import World from './World.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'

import matcapBuildingSource from '../models/matcap-building.png'
import matcapRockSource from '../models/matcap-rock.png'
import floorShadowSource from '../models/floor-shadow.png'
import modelSource from '../models/model-1.glb'

export default class Application
{
    /**
     * Constructor
     */
    constructor(_options)
    {
        // Options
        this.$canvas = _options.$canvas

        // Set up
        this.time = new Time()
        this.sizes = new Sizes()
        this.resources = new Resources()
        this.debug = new dat.GUI({ width: 420 })

        this.resources.load([
            { name: 'model', source: modelSource },
            { name: 'matcapBuilding', source: matcapBuildingSource },
            { name: 'matcapRock', source: matcapRockSource },
            { name: 'floorShadow', source: floorShadowSource }
        ])

        this.resources.on('end', () =>
        {
            this.resources.items.matcapBuildingTexture = new THREE.Texture(this.resources.items.matcapBuilding)
            this.resources.items.matcapBuildingTexture.needsUpdate = true

            this.resources.items.matcapRockTexture = new THREE.Texture(this.resources.items.matcapRock)
            this.resources.items.matcapRockTexture.needsUpdate = true

            this.resources.items.floorShadowTexture = new THREE.Texture(this.resources.items.floorShadow)
            this.resources.items.floorShadowTexture.needsUpdate = true

            const data = new Uint8Array([
                234, 168, 96, // Bottom left: #eaa860
                243, 193, 125, // Bottom right: #f3c17d
                217, 132, 65, // Top left: #d98441
                235, 169, 98 // Top right: #eba962
            ])

            this.resources.items.backgroundTexture = new THREE.DataTexture(data, 2, 2, THREE.RGBFormat)
            this.resources.items.backgroundTexture.magFilter = THREE.LinearFilter
            this.resources.items.backgroundTexture.needsUpdate = true

            this.setColors()
            this.setRenderer()
            this.setCamera()
            this.setPasses()
            this.setOrbitControls()
            this.setWorld()
        })
    }

    /**
     * Set colors
     */
    setColors()
    {
        this.colors = {}

        this.colors.pencil = {}
        this.colors.pencil.string = '#414141'
        this.colors.pencil.three = new THREE.Color(this.colors.pencil.string)

        this.colors.paper = {}
        this.colors.paper.string = '#ffffff'
        this.colors.paper.three = new THREE.Color(this.colors.paper.string)

        this.colors.change = () =>
        {
            this.colors.pencil.three.set(this.colors.pencil.string)
            this.colors.paper.three.set(this.colors.paper.string)

            this.renderer.setClearColor(this.colors.pencil.three.getHex(), 1)
        }

        if(this.debug)
        {
            const folder = this.debug.addFolder('colors')
            folder.open()
        }
    }

    /**
     * Set renderer
     */
    setRenderer()
    {
        // Scene
        this.scene = new THREE.Scene()

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.$canvas,
            alpha: true
        })
        this.renderer.setClearColor(0x414141, 1)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
        this.renderer.physicallyCorrectLights = true
        this.renderer.gammaFactor = 2.2
        this.renderer.gammaOutPut = true
        this.renderer.autoClear = false

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
        })
    }

    /**
     * Set camera
     */
    setCamera()
    {
        this.camera = new THREE.PerspectiveCamera(40, this.sizes.viewport.width / this.sizes.viewport.height, 0.01, 30)
        this.camera.position.set(0.25, 0.35, 0.25)
        this.camera.lookAt(new THREE.Vector3())
        this.scene.add(this.camera)

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.camera.aspect = this.sizes.viewport.width / this.sizes.viewport.height
            this.camera.updateProjectionMatrix()
        })
    }

    setPasses()
    {
        this.passes = {}

        this.passes.composer = new EffectComposer(this.renderer)

        // Create passes
        this.passes.renderPass = new RenderPass(this.scene, this.camera)

        this.passes.composer.addPass(this.passes.renderPass)

        // Time tick
        this.time.on('tick', () =>
        {
            // Renderer
            this.passes.composer.render()
            // this.renderer.render(this.scene, this.camera)
        })

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.passes.composer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
        })

        // Debug
        if(this.debug)
        {
            const folder = this.debug.addFolder('postprocess')
            folder.open()
        }
    }

    /**
     * Set orbit controls
     */
    setOrbitControls()
    {
        this.orbitControls = new OrbitControls(this.camera, this.$canvas)
        this.orbitControls.zoomSpeed = 0.5
    }

    /**
     * Set world
     */
    setWorld()
    {
        this.world = new World({
            debug: this.debug,
            resources: this.resources,
            time: this.time
        })
        this.scene.add(this.world.container)
    }

    /**
     * Destructor
     */
    destructor()
    {
        this.time.off('tick')
        this.sizes.off('resize')

        this.orbitControls.dispose()
        this.renderer.dispose()
        this.debug.destroy()
    }
}
