import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TweenLite } from 'gsap/TweenLite'
import { Power1 } from 'gsap/EasePack'

export default class Camera
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.sizes = _options.sizes
        this.renderer = _options.renderer
        this.debug = _options.debug
        this.config = _options.config

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.target = new THREE.Vector3(0, 0, 0)
        this.targetEased = new THREE.Vector3(0, 0, 0)
        this.easing = 0.15

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('camera')
            // this.debugFolder.open()
        }

        this.setAngle()
        this.setInstance()
        this.setZoom()
        this.setPan()
        this.setOrbitControls()
    }

    setAngle()
    {
        // Set up
        this.angle = {}

        // Items
        this.angle.items = {
            default: new THREE.Vector3(1.135, - 1.45, 1.15),
            projects: new THREE.Vector3(0.38, - 1.4, 1.63)
        }

        // Value
        this.angle.value = new THREE.Vector3()
        this.angle.value.copy(this.angle.items.default)

        // Set method
        this.angle.set = (_name) =>
        {
            const angle = this.angle.items[_name]
            if(typeof angle !== 'undefined')
            {
                TweenLite.to(this.angle.value, 2, { ...angle, ease: Power1.easeInOut })
            }
        }

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this, 'easing').step(0.0001).min(0).max(1).name('easing')
            this.debugFolder.add(this.angle.value, 'x').step(0.001).min(- 2).max(2).name('invertDirectionX').listen()
            this.debugFolder.add(this.angle.value, 'y').step(0.001).min(- 2).max(2).name('invertDirectionY').listen()
            this.debugFolder.add(this.angle.value, 'z').step(0.001).min(- 2).max(2).name('invertDirectionZ').listen()
        }
    }

    setInstance()
    {
        // Set up
        this.instance = new THREE.PerspectiveCamera(40, this.sizes.viewport.width / this.sizes.viewport.height, 1, 80)
        this.instance.up.set(0, 0, 1)
        this.instance.position.copy(this.angle.value)
        this.instance.lookAt(new THREE.Vector3())
        this.container.add(this.instance)

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

                // Apply zoom
                this.instance.position.copy(this.targetEased).add(this.angle.value.clone().normalize().multiplyScalar(this.zoom.distance))

                // Look at target
                this.instance.lookAt(this.targetEased)

                // Apply pan
                this.instance.position.x += this.pan.value.x
                this.instance.position.y += this.pan.value.y
            }
        })
    }

    setZoom()
    {
        // Set up
        this.zoom = {}
        this.zoom.easing = 0.1
        this.zoom.minDistance = 14
        this.zoom.amplitude = 15
        this.zoom.value = this.config.cyberTruck ? 0.3 : 0.5
        this.zoom.targetValue = this.zoom.value
        this.zoom.distance = this.zoom.minDistance + this.zoom.amplitude * this.zoom.value

        // Listen to mousewheel event
        document.addEventListener('mousewheel', (_event) =>
        {
            this.zoom.targetValue += _event.deltaY * 0.001
            this.zoom.targetValue = Math.min(Math.max(this.zoom.targetValue, 0), 1)
        }, { passive: true })

        // Time tick event
        this.time.on('tick', () =>
        {
            this.zoom.value += (this.zoom.targetValue - this.zoom.value) * this.zoom.easing
            this.zoom.distance = this.zoom.minDistance + this.zoom.amplitude * this.zoom.value
        })
    }

    setPan()
    {
        // Set up
        this.pan = {}
        this.pan.enabled = true
        this.pan.active = false
        this.pan.easing = 0.1
        this.pan.start = {}
        this.pan.start.x = 0
        this.pan.start.y = 0
        this.pan.value = {}
        this.pan.value.x = 0
        this.pan.value.y = 0
        this.pan.targetValue = {}
        this.pan.targetValue.x = this.pan.value.x
        this.pan.targetValue.y = this.pan.value.y
        this.pan.raycaster = new THREE.Raycaster()
        this.pan.mouse = new THREE.Vector2()
        this.pan.needsUpdate = false
        this.pan.hitMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(60, 60, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
        )
        this.pan.hitMesh.rotation.z = - Math.PI * 0.25
        this.container.add(this.pan.hitMesh)

        window.addEventListener('mousemove', (_event) =>
        {
            if(this.pan.active)
            {
                this.pan.mouse.x = (_event.clientX / this.sizes.viewport.width) * 2 - 1
                this.pan.mouse.y = - (_event.clientY / this.sizes.viewport.height) * 2 + 1

                this.pan.needsUpdate = true
            }
        })

        window.addEventListener('mousedown', (_event) =>
        {
            // Activate
            this.pan.active = true

            // Update mouse position
            this.pan.mouse.x = (_event.clientX / this.sizes.viewport.width) * 2 - 1
            this.pan.mouse.y = - (_event.clientY / this.sizes.viewport.height) * 2 + 1

            // Get start position
            this.pan.raycaster.setFromCamera(this.pan.mouse, this.instance)

            const intersects = this.pan.raycaster.intersectObjects([this.pan.hitMesh])

            if(intersects.length)
            {
                this.pan.start.x = intersects[0].point.x
                this.pan.start.y = intersects[0].point.y
            }
        })

        window.addEventListener('mouseup', (_event) =>
        {
            // Deactivate
            this.pan.active = false
        })

        this.time.on('tick', () =>
        {
            // Move hit mesh
            // this.pan.hitMesh.position.x = this.instance.position.x
            // this.pan.hitMesh.position.y = this.instance.position.y
            // this.pan.hitMesh.position.x = this.instance.position.x - 20
            // this.pan.hitMesh.position.y = this.instance.position.y + 30

            // const lookDirection = this.instance.rotation.toVector3()
            // const test = lookDirection.projectOnPlane(new THREE.Vector3(0, 0, 1))
            // const test2 = test.multiplyScalar(this.zoom.distance)
            // // console.log(test.multiplyScalar(this.zoom.distance))
            // this.pan.hitMesh.position.x = this.instance.position.x - test2.x
            // this.pan.hitMesh.position.y = this.instance.position.y - test2.y

            // If active
            if(this.pan.active)
            {
                // Update target value
                this.pan.raycaster.setFromCamera(this.pan.mouse, this.instance)

                const intersects = this.pan.raycaster.intersectObjects([this.pan.hitMesh])

                if(intersects.length)
                {
                    this.pan.targetValue.x = - (intersects[0].point.x - this.pan.start.x)
                    this.pan.targetValue.y = - (intersects[0].point.y - this.pan.start.y)
                }
            }

            // Update value and apply easing
            this.pan.value.x += (this.pan.targetValue.x - this.pan.value.x) * this.pan.easing
            this.pan.value.y += (this.pan.targetValue.y - this.pan.value.y) * this.pan.easing
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
