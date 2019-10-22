import * as THREE from 'three'
import Materials from './Materials.js'
import Floor from './Floor.js'
import Shadows from './Shadows.js'
import Physics from './Physics.js'
import Zones from './Zones.js'
import Objects from './Objects.js'
import Car from './Car.js'
import Areas from './Areas.js'
import Tiles from './Tiles.js'
import Walls from './Walls.js'
import IntroSection from './Sections/IntroSection.js'
import ProjectsSection from './Sections/ProjectsSection.js'
import CrossroadsSection from './Sections/CrossroadsSection.js'
import InformationSection from './Sections/InformationSection.js'
import PlaygroundSection from './Sections/PlaygroundSection.js'
import Controls from './Controls.js'
import Sounds from './Sounds.js'
import { TweenLite } from 'gsap'

export default class
{
    constructor(_options)
    {
        // Options
        this.config = _options.config
        this.debug = _options.debug
        this.resources = _options.resources
        this.time = _options.time
        this.sizes = _options.sizes
        this.camera = _options.camera
        this.renderer = _options.renderer
        this.passes = _options.passes

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('world')
            this.debugFolder.open()
        }

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // this.setAxes()
        this.setSounds()
        this.setControls()
        this.setFloor()
        this.setStartingScreen()
    }

    start()
    {
        this.setReveal()
        this.setMaterials()
        this.setShadows()
        this.setPhysics()
        this.setZones()
        this.setObjects()
        this.setCar()
        this.setAreas()
        this.setTiles()
        this.setWalls()
        this.setSections()

        window.setTimeout(() =>
        {
            this.reveal.go()
        }, 200)
    }

    setReveal()
    {
        this.reveal = {}
        this.reveal.matcapsProgress = 0
        this.reveal.floorShadowsProgress = 0
        this.reveal.previousMatcapsProgress = null
        this.reveal.previousFloorShadowsProgress = null

        // Go method
        this.reveal.go = () =>
        {
            TweenLite.fromTo(this.reveal, 3, { matcapsProgress: 0 }, { matcapsProgress: 1 })
            TweenLite.fromTo(this.reveal, 3, { floorShadowsProgress: 0 }, { floorShadowsProgress: 1, delay: 0.5 })
            TweenLite.fromTo(this.shadows, 3, { alpha: 0 }, { alpha: 0.5, delay: 0.5 })
            TweenLite.fromTo(this.sections.intro.instructions.arrows.label.material, 0.3, { opacity: 0 }, { opacity: 1, delay: 0.5 })

            // Car
            this.physics.car.chassis.body.sleep()
            this.physics.car.chassis.body.position.set(0, 0, 12)

            window.setTimeout(() =>
            {
                this.physics.car.chassis.body.wakeUp()
            }, 300)
        }

        // Time tick
        this.time.on('tick',() =>
        {
            // Matcap progress changed
            if(this.reveal.matcapsProgress !== this.reveal.previousMatcapsProgress)
            {
                // Update each material
                for(const _materialKey in this.materials.shades.items)
                {
                    const material = this.materials.shades.items[_materialKey]
                    material.uniforms.uRevealProgress.value = this.reveal.matcapsProgress
                }

                // Save
                this.reveal.previousMatcapsProgress = this.reveal.matcapsProgress
            }

            // Matcap progress changed
            if(this.reveal.floorShadowsProgress !== this.reveal.previousFloorShadowsProgress)
            {
                // Update each floor shadow
                for(const _mesh of this.objects.floorShadows)
                {
                    _mesh.material.uniforms.uAlpha.value = this.reveal.floorShadowsProgress
                }

                // Save
                this.reveal.previousFloorShadowsProgress = this.reveal.floorShadowsProgress
            }
        })

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this.reveal, 'matcapsProgress').step(0.0001).min(0).max(1).name('matcapsProgress')
            this.debugFolder.add(this.reveal, 'floorShadowsProgress').step(0.0001).min(0).max(1).name('floorShadowsProgress')
            this.debugFolder.add(this.reveal, 'go').name('reveal')
        }
    }

    setStartingScreen()
    {
        this.startingScreen = {}
    }

    setSounds()
    {
        this.sounds = new Sounds({
            debug: this.debugFolder,
            time: this.time
        })
    }

    setAxes()
    {
        this.axis = new THREE.AxesHelper()
        this.container.add(this.axis)
    }

    setControls()
    {
        this.controls = new Controls({
            config: this.config,
            sizes: this.sizes,
            time: this.time
        })
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
            camera: this.camera
        })
        this.container.add(this.shadows.container)
    }

    setPhysics()
    {
        this.physics = new Physics({
            config: this.config,
            debug: this.debug,
            time: this.time,
            sizes: this.sizes,
            controls: this.controls,
            sounds: this.sounds
        })

        this.container.add(this.physics.models.container)
    }

    setZones()
    {
        this.zones = new Zones({
            time: this.time,
            physics: this.physics,
            debug: this.debugFolder
        })
        this.container.add(this.zones.container)
    }

    setAreas()
    {
        this.areas = new Areas({
            config: this.config,
            resources: this.resources,
            debug: this.debug,
            renderer: this.renderer,
            camera: this.camera,
            car: this.car,
            sounds: this.sounds,
            time: this.time
        })

        this.container.add(this.areas.container)
    }

    setTiles()
    {
        this.tiles = new Tiles({
            resources: this.resources,
            objects: this.objects,
            debug: this.debug
        })
    }

    setWalls()
    {
        this.walls = new Walls({
            resources: this.resources,
            objects: this.objects
        })
    }

    setObjects()
    {
        this.objects = new Objects({
            time: this.time,
            resources: this.resources,
            materials: this.materials,
            physics: this.physics,
            shadows: this.shadows,
            sounds: this.sounds,
            debug: this.debugFolder
        })
        this.container.add(this.objects.container)

        // window.requestAnimationFrame(() =>
        // {
        //     this.objects.merge.update()
        // })
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
            controls: this.controls,
            sounds: this.sounds,
            renderer: this.renderer,
            camera: this.camera,
            debug: this.debugFolder
        })
        this.container.add(this.car.container)
    }

    setSections()
    {
        this.sections = {}

        // Generic options
        const options = {
            config: this.config,
            time: this.time,
            resources: this.resources,
            camera: this.camera,
            passes: this.passes,
            objects: this.objects,
            areas: this.areas,
            zones: this.zones,
            walls: this.walls,
            tiles: this.tiles,
            debug: this.debugFolder
        }

        // Intro
        this.sections.intro = new IntroSection({
            ...options,
            x: 0,
            y: 0
        })
        this.container.add(this.sections.intro.container)

        // Crossroads
        this.sections.crossroads = new CrossroadsSection({
            ...options,
            x: 0,
            y: - 30
        })
        this.container.add(this.sections.crossroads.container)

        // Projects
        this.sections.projects = new ProjectsSection({
            ...options,
            x: 30,
            y: - 30
            // x: 0,
            // y: 0
        })
        this.container.add(this.sections.projects.container)

        // Information
        this.sections.information = new InformationSection({
            ...options,
            x: 1.2,
            y: - 55
            // x: 0,
            // y: - 10
        })
        this.container.add(this.sections.information.container)

        // Playground
        this.sections.playground = new PlaygroundSection({
            ...options,
            x: - 38,
            y: - 34
            // x: - 15,
            // y: - 4
        })
        this.container.add(this.sections.playground.container)
    }
}
