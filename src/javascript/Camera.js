import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.sizes = _options.sizes
        this.renderer = _options.renderer
        this.debug = _options.debug

        // Set up
        this.invertDirection = new THREE.Vector3(1.135, - 1.45, 1.15)
        this.target = new THREE.Vector3(0, 0, 0)
        this.targetEased = new THREE.Vector3(0, 0, 0)
        this.easing = 0.15

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('camera')
            // this.debugFolder.open()
        }

        this.setInstance()
        this.setZoom()
        this.setOrbitControls()

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this, 'easing').step(0.0001).min(0).max(1).name('easing')
            this.debugFolder.add(this.invertDirection, 'x').step(0.001).min(- 2).max(2).name('invertDirectionX')
            this.debugFolder.add(this.invertDirection, 'y').step(0.001).min(- 2).max(2).name('invertDirectionY')
            this.debugFolder.add(this.invertDirection, 'z').step(0.001).min(- 2).max(2).name('invertDirectionZ')
        }
    }

    setInstance()
    {
        // Set up
        this.instance = new THREE.PerspectiveCamera(40, this.sizes.viewport.width / this.sizes.viewport.height, 1, 50)
        this.instance.up.set(0, 0, 1)
        this.instance.position.copy(this.invertDirection)
        this.instance.lookAt(new THREE.Vector3())

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.instance.aspect = this.sizes.viewport.width / this.sizes.viewport.height
            this.instance.updateProjectionMatrix()
        })

        // Time tick
        this.time.on('tick', () =>
        {
            if(!this.orbitControls.enabled)
            {
                this.targetEased.x += (this.target.x - this.targetEased.x) * this.easing
                this.targetEased.y += (this.target.y - this.targetEased.y) * this.easing
                this.targetEased.z += (this.target.z - this.targetEased.z) * this.easing

                this.instance.position.copy(this.targetEased).add(this.invertDirection.clone().normalize().multiplyScalar(this.zoom.distance))

                this.instance.lookAt(this.targetEased)
            }
        })
    }

    setZoom()
    {
        // Set up
        this.zoom = {}
        this.zoom.easing = 0.1
        this.zoom.baseDistance = 20
        this.zoom.distance = this.zoom.baseDistance
        this.zoom.amplitude = 10
        this.zoom.value = 0
        this.zoom.targetValue = 0

        // Listen to mousewheel event
        document.addEventListener('mousewheel', (_event) =>
        {
            this.zoom.targetValue += _event.deltaY * 0.001
            this.zoom.targetValue = Math.min(Math.max(this.zoom.targetValue, - 1), 1)
        }, { passive: true })

        // Time tick event
        this.time.on('tick', () =>
        {
            this.zoom.value += (this.zoom.targetValue - this.zoom.value) * this.zoom.easing
            this.zoom.distance = this.zoom.baseDistance + this.zoom.value * this.zoom.amplitude
        })
    }

    setOrbitControls()
    {
        // Set up
        this.orbitControls = new OrbitControls(this.instance, this.renderer.domElement)
        this.orbitControls.enabled = false
        this.orbitControls.enableKeys = false
        this.orbitControls.zoomSpeed = 0.5

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this.orbitControls, 'enabled').name('orbitControlsEnabled')
        }
    }
}
