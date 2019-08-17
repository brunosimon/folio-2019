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
        this.basePosition = new THREE.Vector3(8, - 8, 12)
        this.position = new THREE.Vector3(0, 0, 0)
        this.target = new THREE.Vector3(0, 0, 0)
        this.easing = 0.25

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('camera')
            this.debugFolder.open()
        }

        this.setInstance()
        this.setOrbitControls()

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this, 'easing').step(0.0001).min(0).max(0.1).name('easing')
        }
    }

    setInstance()
    {
        // Set up
        this.instance = new THREE.PerspectiveCamera(40, this.sizes.viewport.width / this.sizes.viewport.height, 2, 50)
        this.instance.up.set(0, 0, 1)
        this.instance.position.copy(this.basePosition)
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
                this.position.x += (this.target.x - this.position.x) * this.easing
                this.position.y += (this.target.y - this.position.y) * this.easing
                this.position.z += (this.target.z - this.position.z) * this.easing

                this.instance.position.copy(this.position).add(this.basePosition)

                this.instance.lookAt(this.position)
            }
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
