import * as THREE from 'three'
import * as dat from 'dat.gui'

import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import World from './World/index.js'
import Resources from './Resources.js'
import Camera from './Camera.js'
import Network from './Network.js'
import LobbyUI from './LobbyUI.js'
import Chat from './Chat.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import BlurPass from './Passes/Blur.js'
import GlowsPass from './Passes/Glows.js'

export default class Application
{
    constructor(_options)
    {
        this.$canvas = _options.$canvas

        this.time = new Time()
        this.sizes = new Sizes()
        this.resources = new Resources()

        this.setConfig()
        this.setDebug()
        this.setRenderer()
        this.setCamera()
        this.setPasses()
        this.setNetwork()
        this.setWorld()
        this.setTitle()
    }

    setConfig()
    {
        this.config = {}
        this.config.debug = window.location.hash === '#debug'
        this.config.cyberTruck = window.location.hash === '#cybertruck'
        this.config.touch = false

        window.addEventListener('touchstart', () =>
        {
            this.config.touch = true
            this.world.controls.setTouch()

            this.passes.horizontalBlurPass.strength = 1
            this.passes.horizontalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(this.passes.horizontalBlurPass.strength, 0)
            this.passes.verticalBlurPass.strength = 1
            this.passes.verticalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(0, this.passes.verticalBlurPass.strength)
        }, { once: true })
    }

    setDebug()
    {
        if(this.config.debug)
        {
            this.debug = new dat.GUI({ width: 420 })
        }
    }

    setRenderer()
    {
        this.scene = new THREE.Scene()

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.$canvas,
            alpha: true,
            powerPreference: 'high-performance'
        })
        this.renderer.setClearColor(0x000000, 1)
        this.renderer.setPixelRatio(2)
        this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
        this.renderer.autoClear = false

        this.sizes.on('resize', () =>
        {
            this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
        })
    }

    setCamera()
    {
        this.camera = new Camera({
            time: this.time,
            sizes: this.sizes,
            renderer: this.renderer,
            debug: this.debug,
            config: this.config
        })

        this.scene.add(this.camera.container)

        this.time.on('tick', () =>
        {
            if(this.world && this.world.car)
            {
                this.camera.target.x = this.world.car.chassis.object.position.x
                this.camera.target.y = this.world.car.chassis.object.position.y
            }
        })
    }

    setPasses()
    {
        this.passes = {}

        if(this.debug)
        {
            this.passes.debugFolder = this.debug.addFolder('postprocess')
        }

        this.passes.composer = new EffectComposer(this.renderer)
        this.passes.renderPass = new RenderPass(this.scene, this.camera.instance)

        this.passes.horizontalBlurPass = new ShaderPass(BlurPass)
        this.passes.horizontalBlurPass.strength = this.config.touch ? 0 : 1
        this.passes.horizontalBlurPass.material.uniforms.uResolution.value = new THREE.Vector2(this.sizes.viewport.width, this.sizes.viewport.height)
        this.passes.horizontalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(this.passes.horizontalBlurPass.strength, 0)

        this.passes.verticalBlurPass = new ShaderPass(BlurPass)
        this.passes.verticalBlurPass.strength = this.config.touch ? 0 : 1
        this.passes.verticalBlurPass.material.uniforms.uResolution.value = new THREE.Vector2(this.sizes.viewport.width, this.sizes.viewport.height)
        this.passes.verticalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(0, this.passes.verticalBlurPass.strength)

        this.passes.glowsPass = new ShaderPass(GlowsPass)
        this.passes.glowsPass.color = '#ffcfe0'
        this.passes.glowsPass.material.uniforms.uPosition.value = new THREE.Vector2(0, 0.25)
        this.passes.glowsPass.material.uniforms.uRadius.value = 0.7
        this.passes.glowsPass.material.uniforms.uColor.value = new THREE.Color(this.passes.glowsPass.color)
        this.passes.glowsPass.material.uniforms.uColor.value.convertLinearToSRGB()
        this.passes.glowsPass.material.uniforms.uAlpha.value = 0.55

        this.passes.composer.addPass(this.passes.renderPass)
        this.passes.composer.addPass(this.passes.horizontalBlurPass)
        this.passes.composer.addPass(this.passes.verticalBlurPass)
        this.passes.composer.addPass(this.passes.glowsPass)

        this.time.on('tick', () =>
        {
            this.passes.horizontalBlurPass.enabled = this.passes.horizontalBlurPass.material.uniforms.uStrength.value.x > 0
            this.passes.verticalBlurPass.enabled = this.passes.verticalBlurPass.material.uniforms.uStrength.value.y > 0
            this.passes.composer.render()
        })

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

    setNetwork()
    {
        this.network = new Network()
        this.network.connect()
        this.lobbyUI = new LobbyUI({ network: this.network, config: this.config })
        this.chat = new Chat({ network: this.network })
    }

    setWorld()
    {
        this.world = new World({
            config: this.config,
            debug: this.debug,
            resources: this.resources,
            time: this.time,
            sizes: this.sizes,
            camera: this.camera,
            scene: this.scene,
            renderer: this.renderer,
            passes: this.passes,
            network: this.network
        })
        this.scene.add(this.world.container)
    }

    setTitle()
    {
        this.title = {}
        this.title.frequency = 300
        this.title.width = 20
        this.title.position = 0
        this.title.$element = document.querySelector('title')
        this.title.absolutePosition = Math.round(this.title.width * 0.25)

        this.time.on('tick', () =>
        {
            if(this.world.physics)
            {
                this.title.absolutePosition += this.world.physics.car.forwardSpeed
                if(this.title.absolutePosition < 0) this.title.absolutePosition = 0
            }
        })

        window.setInterval(() =>
        {
            this.title.position = Math.round(this.title.absolutePosition % this.title.width)
            document.title = `${'_'.repeat(this.title.width - this.title.position)}🏎${'_'.repeat(this.title.position)}`
        }, this.title.frequency)
    }
}
