import * as THREE from 'three'
import * as dat from 'dat.gui'

import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import World from './World.js'
import Resources from './Resources.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import BlurPass from './Passes/Blur.js'

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
        this.debug = new dat.GUI({ width: 420 })
        this.resources = new Resources()

        this.resources.on('ready', () =>
        {
            this.setRenderer()
            this.setCamera()
            this.setPasses()
            this.setOrbitControls()
            this.setWorld()
        })
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
        // this.renderer.setClearColor(0x414141, 1)
        this.renderer.setClearColor(0x000000, 1)
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
        this.camera = new THREE.PerspectiveCamera(40, this.sizes.viewport.width / this.sizes.viewport.height, 0.1, 100)
        this.camera.up.z = 1
        this.camera.up.y = 0
        // this.camera.position.set(5 * 2, 7 * 2, 5 * 2)
        this.camera.position.set(8, - 8, 12)
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

        // Debug
        if(this.debug)
        {
            this.passes.debugFolder = this.debug.addFolder('postprocess')
            // this.passes.debugFolder.open()
        }

        this.passes.composer = new EffectComposer(this.renderer)

        // Create passes
        this.passes.renderPass = new RenderPass(this.scene, this.camera)

        this.passes.unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(this.sizes.viewport.width, this.sizes.viewport.height), 0.5, 0.4, 0.85)
        this.passes.unrealBloomPass.threshold = 0
        this.passes.unrealBloomPass.strength = 0.1
        this.passes.unrealBloomPass.radius = 2

        this.passes.smaa = new SMAAPass(this.sizes.viewport.width * this.renderer.getPixelRatio(), this.sizes.viewport.height * this.renderer.getPixelRatio())
        this.passes.smaa.enabled = this.renderer.getPixelRatio() <= 1

        // Debug
        if(this.debug)
        {
            const folder = this.passes.debugFolder.addFolder('unreal bloom')
            folder.open()

            folder.add(this.passes.unrealBloomPass, 'threshold').step(0.001).min(0).max(1)
            folder.add(this.passes.unrealBloomPass, 'strength').step(0.001).min(0).max(1)
            folder.add(this.passes.unrealBloomPass, 'radius').step(0.001).min(0).max(10)
        }

        this.passes.horizontalBlurPass = new ShaderPass(BlurPass)
        this.passes.horizontalBlurPass.material.uniforms.uResolution.value = new THREE.Vector2(this.sizes.viewport.width, this.sizes.viewport.height)
        this.passes.horizontalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(1.25, 0.0)

        this.passes.verticalBlurPass = new ShaderPass(BlurPass)
        this.passes.verticalBlurPass.material.uniforms.uResolution.value = new THREE.Vector2(this.sizes.viewport.width, this.sizes.viewport.height)
        this.passes.verticalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(0.0, 1.25)

        // Debug
        if(this.debug)
        {
            const folder = this.passes.debugFolder.addFolder('blur')
            folder.open()

            folder.add(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, 'x').step(0.001).min(0).max(10)
            folder.add(this.passes.verticalBlurPass.material.uniforms.uStrength.value, 'y').step(0.001).min(0).max(10)
        }

        // Add passes
        this.passes.composer.addPass(this.passes.renderPass)
        this.passes.composer.addPass(this.passes.unrealBloomPass)
        this.passes.composer.addPass(this.passes.horizontalBlurPass)
        this.passes.composer.addPass(this.passes.verticalBlurPass)
        this.passes.composer.addPass(this.passes.smaa)

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
            this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
            this.passes.composer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
            this.passes.horizontalBlurPass.material.uniforms.uResolution.value.x = this.sizes.viewport.width
            this.passes.horizontalBlurPass.material.uniforms.uResolution.value.y = this.sizes.viewport.height
            this.passes.verticalBlurPass.material.uniforms.uResolution.value.x = this.sizes.viewport.width
            this.passes.verticalBlurPass.material.uniforms.uResolution.value.y = this.sizes.viewport.height
        })
    }

    /**
     * Set orbit controls
     */
    setOrbitControls()
    {
        this.orbitControls = new OrbitControls(this.camera, this.$canvas)
        this.orbitControls.enableKeys = false
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
