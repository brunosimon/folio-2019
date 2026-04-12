import * as THREE from 'three'

import Area from './Area.js'

export default class Areas
{
    constructor(_options)
    {
        // Options
        this.config = _options.config
        this.resources = _options.resources
        this.car = _options.car
        this.sounds = _options.sounds
        this.renderer = _options.renderer
        this.camera = _options.camera
        this.time = _options.time
        this.debug = _options.debug

        // Set up
        this.items = []
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setMouse()
    }

    setMouse()
    {
        // Set up
        this.mouse = {}
        this.mouse.raycaster = new THREE.Raycaster()
        this.mouse.coordinates = new THREE.Vector2()
        this.mouse.currentArea = null
        this.mouse.needsUpdate = false

        // Mouse move event
        window.addEventListener('mousemove', (_event) =>
        {
            this.mouse.coordinates.x = (_event.clientX / window.innerWidth) * 2 - 1
            this.mouse.coordinates.y = - (_event.clientY / window.innerHeight) * 2 + 1

            this.mouse.needsUpdate = true
        })

        // Mouse click event
        window.addEventListener('mousedown', () =>
        {
            if(this.mouse.currentArea)
            {
                this.mouse.currentArea.interact(false)
            }
        })

        // Touch
        this.renderer.domElement.addEventListener('touchstart', (_event) =>
        {
            this.mouse.coordinates.x = (_event.changedTouches[0].clientX / window.innerWidth) * 2 - 1
            this.mouse.coordinates.y = - (_event.changedTouches[0].clientY / window.innerHeight) * 2 + 1

            this.mouse.needsUpdate = true
        })

        // Time tick event
        this.time.on('tick', () =>
        {
            // Only update if needed
            if(this.mouse.needsUpdate)
            {
                this.mouse.needsUpdate = false

                // Set up
                this.mouse.raycaster.setFromCamera(this.mouse.coordinates, this.camera.instance)
                const objects = this.items.map((_area) => _area.mouseMesh)
                const intersects = this.mouse.raycaster.intersectObjects(objects)

                // Intersections found
                if(intersects.length)
                {
                    // Find the area
                    const area = this.items.find((_area) => _area.mouseMesh === intersects[0].object)

                    // Area did change
                    if(area !== this.mouse.currentArea)
                    {
                        // Was previously over an area
                        if(this.mouse.currentArea !== null)
                        {
                            // Play out
                            this.mouse.currentArea.out()
                            this.mouse.currentArea.testCar = this.mouse.currentArea.initialTestCar
                        }

                        // Play in
                        this.mouse.currentArea = area
                        this.mouse.currentArea.in(false)
                        this.mouse.currentArea.testCar = false
                    }
                }
                // No intersections found but was previously over an area
                else if(this.mouse.currentArea !== null)
                {
                    // Play out
                    this.mouse.currentArea.out()
                    this.mouse.currentArea.testCar = this.mouse.currentArea.initialTestCar
                    this.mouse.currentArea = null
                }
            }
        })
    }

    add(_options)
    {
        const area = new Area({
            config: this.config,
            renderer: this.renderer,
            resources: this.resources,
            car: this.car,
            sounds: this.sounds,
            time: this.time,
            hasKey: true,
            testCar: true,
            active: true,
            ..._options
        })

        this.container.add(area.container)

        this.items.push(area)

        return area
    }
}
