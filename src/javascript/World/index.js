import * as THREE from 'three'
import Materials from './Materials.js'
import Floor from './Floor.js'
import Shadows from './Shadows.js'
import Physics from '../Physics.js'
import Objects from './Objects.js'
import Car from './Car.js'

export default class
{
    constructor(_options)
    {
        // Options
        this.debug = _options.debug
        this.resources = _options.resources
        this.time = _options.time
        this.camera = _options.camera
        this.renderer = _options.renderer
        this.orbitControls = _options.orbitControls

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('world')
            // this.debugFolder.open()
        }

        // Set up
        this.container = new THREE.Object3D()

        // this.setAxes()
        this.setMaterials()
        this.setFloor()
        this.setShadows()
        this.setPhysics()
        this.setObjects()
        this.setCar()
    }

    setAxes()
    {
        this.axis = new THREE.AxesHelper()
        this.container.add(this.axis)
    }

    setMaterials()
    {
        this.materials = new Materials({
            resources: this.resources,
            debug: this.debugFolder
        })
    }

    setFloor()
    {
        this.floor = new Floor({
            debug: this.debugFolder
        })

        this.container.add(this.floor.container)
    }

    setShadows()
    {
        this.shadows = new Shadows({
            time: this.time,
            debug: this.debugFolder,
            renderer: this.renderer,
            camera: this.camera,
            orbitControls: this.orbitControls
        })
        this.container.add(this.shadows.container)
    }

    setPhysics()
    {
        this.physics = new Physics({
            debug: this.debug,
            time: this.time
        })

        this.container.add(this.physics.models.container)
    }

    setCar()
    {
        this.car = new Car({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            shadows: this.shadows,
            materials: this.materials,
            renderer: this.renderer,
            camera: this.camera,
            orbitControls: this.orbitControls,
            debug: this.debugFolder
        })
        this.container.add(this.car.container)
    }

    setObjects()
    {
        this.objects = new Objects({
            time: this.time,
            resources: this.resources,
            materials: this.materials,
            physics: this.physics,
            debug: this.debugFolder
        })
        this.container.add(this.objects.container)
    }
}
