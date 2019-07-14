import * as THREE from 'three'

import Feather from './Feather.js'
import Petal from './Petal.js'
import Dandelion from './Dandelion.js'
import Ribbon from './Ribbon.js'

export default class Particles
{
    constructor(_options)
    {
        // Options
        this.time = _options.time

        // Set up
        this.active = false
        this.container = new THREE.Object3D()
        this.oldContainerPosition = this.container.position.clone()

        this.setModels()
        this.setGenerator()
    }

    setModels()
    {
        this.models = {}

        // Each model
        this.models.items = {}
        this.models.items.petal = new Petal({ containerPosition: this.container.position })
        this.models.items.feather = new Feather({ containerPosition: this.container.position })
        this.models.items.dandelion = new Dandelion({ containerPosition: this.container.position })
        this.models.items.ribbon = new Ribbon({ containerPosition: this.container.position })

        this.models.index = 3
        this.models.names = Object.keys(this.models.items)
        this.models.currentName = this.models.names[this.models.index]

        this.models.next = () =>
        {
            this.models.index++

            if(this.models.index > this.models.names.length - 1)
            {
                this.models.index = 0
            }

            this.models.currentName = this.models.names[this.models.index]
        }

        // // Test mesh
        // this.models.testMesh = this.models.feather.getMesh()
        // this.container.add(this.models.testMesh)
    }

    activate()
    {
        // Already
        if(this.active)
        {
            return
        }

        // Create one
        this.generator.create()

        // Save
        this.active = true
    }

    deactivate()
    {
        // Already
        if(!this.active)
        {
            return
        }

        // Prevent next creation
        window.clearTimeout(this.generator.timeout)

        // Save
        this.active = false
    }

    setGenerator()
    {
        this.generator = {}

        this.generator.frequency = {}
        this.generator.frequency.value = 1000
        this.generator.frequency.min = 20
        this.generator.frequency.max = 1500

        this.generator.bounding = {}
        this.generator.bounding.start = - 4
        this.generator.bounding.distance = 6
        this.generator.bounding.radius = 2

        this.windSpeed = 0

        this.generator.pool = []

        this.generator.container = new THREE.Object3D()
        this.container.add(this.generator.container)

        this.generator.create = () =>
        {
            // Try to find one in pool
            let item = this.generator.pool.find((_item) => _item.available && _item.name === this.models.currentName)

            // Not found
            if(!item)
            {
                // Create one
                item = {}

                item.name = this.models.currentName

                item.mesh = this.models.items[this.models.currentName].getMesh()
                this.generator.container.add(item.mesh)

                this.generator.pool.push(item)
            }

            // Reset
            item.available = false
            item.mesh.visible = true

            const radius = Math.random() * this.generator.bounding.radius
            const angle = Math.random() * Math.PI * 2

            item.mesh.position.x = this.generator.bounding.start
            item.mesh.position.y = Math.sin(angle) * radius
            item.mesh.position.z = Math.cos(angle) * radius

            item.mesh.rotation.x = Math.random() * Math.PI * 2
            item.mesh.rotation.y = Math.random() * Math.PI * 2

            // Speed
            item.positionSpeed = 0.0035 + Math.random() * 0.0035
            item.rotationSpeedX = (Math.random() - 0.5) * 5
            item.rotationSpeedZ = (Math.random() - 0.5) * 5

            // Create new
            this.generator.timeout = window.setTimeout(this.generator.create, this.generator.frequency.value)
        }

        // Timer tick event
        this.time.on('tick', () =>
        {
            const distance = this.oldContainerPosition.distanceTo(this.container.position)
            this.oldContainerPosition = this.container.position.clone()

            this.windSpeed = distance

            for(const _item of this.generator.pool)
            {
                _item.mesh.position.x += _item.positionSpeed + this.windSpeed

                _item.mesh.rotation.x = _item.mesh.position.x * _item.rotationSpeedX
                _item.mesh.rotation.z = _item.mesh.position.x * _item.rotationSpeedZ

                if(_item.mesh.position.x > this.generator.bounding.start + this.generator.bounding.distance)
                {
                    _item.available = true
                    _item.mesh.visible = false
                }
            }
        })

        // Create one if active
        if(this.active)
        {
            this.generator.create()
        }
    }
}
