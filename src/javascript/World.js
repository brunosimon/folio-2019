import * as THREE from 'three'
import FloorMaterial from './Materials/Floor.js'
import MatcapMaterial from './Materials/Matcap.js'

export default class
{
    constructor(_options)
    {
        // Options
        this.debug = _options.debug
        this.resources = _options.resources
        this.time = _options.time

        // Set up
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('world')
            this.debugFolder.open()
        }

        this.container = new THREE.Object3D()

        this.setMaterials()
        this.setModel()
        this.setFloor()
        this.setDummy()
    }

    setMaterials()
    {
        this.materials = {}

        if(this.debug)
        {
            this.materials.debugFolder = this.debugFolder.addFolder('materials')
            this.materials.debugFolder.open()
        }

        // Matcaps
        this.materials.matcaps = {}
        this.materials.matcaps.indirectColor = '#d04500'
        this.materials.matcaps.uniforms = {
            uIndirectDistanceAmplitude: 0.1,
            uIndirectDistanceStrength: 0.7,
            uIndirectDistancePower: 2.0,
            uIndirectAngleStrength: 1.5,
            uIndirectAngleOffset: 0.6,
            uIndirectAnglePower: 1.0,
            uIndirectColor: null
        }

        this.materials.matcaps.rockMatcap = new MatcapMaterial()
        this.materials.matcaps.rockMatcap.uniforms.matcap.value = this.resources.items.matcapRockTexture

        this.materials.matcaps.buildingMatcap = new MatcapMaterial()
        this.materials.matcaps.buildingMatcap.uniforms.matcap.value = this.resources.items.matcapBuildingTexture

        this.materials.matcaps.updateUniforms = () =>
        {
            this.materials.matcaps.uniforms.uIndirectColor = new THREE.Color(this.materials.matcaps.indirectColor)
            for(const _uniformName in this.materials.matcaps.uniforms)
            {
                const _uniformValue = this.materials.matcaps.uniforms[_uniformName]
                this.materials.matcaps.rockMatcap.uniforms[_uniformName].value = _uniformValue
                this.materials.matcaps.buildingMatcap.uniforms[_uniformName].value = _uniformValue
            }
        }

        this.materials.matcaps.updateUniforms()

        if(this.debug)
        {
            this.materials.debugFolder.add(this.materials.matcaps.uniforms, 'uIndirectDistanceAmplitude').step(0.001).min(0).max(0.5).onChange(this.materials.matcaps.updateUniforms)
            this.materials.debugFolder.add(this.materials.matcaps.uniforms, 'uIndirectDistanceStrength').step(0.001).min(0).max(2).onChange(this.materials.matcaps.updateUniforms)
            this.materials.debugFolder.add(this.materials.matcaps.uniforms, 'uIndirectDistancePower').step(0.001).min(0).max(5).onChange(this.materials.matcaps.updateUniforms)
            this.materials.debugFolder.add(this.materials.matcaps.uniforms, 'uIndirectAngleStrength').step(0.001).min(0).max(2).onChange(this.materials.matcaps.updateUniforms)
            this.materials.debugFolder.add(this.materials.matcaps.uniforms, 'uIndirectAngleOffset').step(0.001).min(- 2).max(2).onChange(this.materials.matcaps.updateUniforms)
            this.materials.debugFolder.add(this.materials.matcaps.uniforms, 'uIndirectAnglePower').step(0.001).min(0).max(5).onChange(this.materials.matcaps.updateUniforms)
            this.materials.debugFolder.addColor(this.materials.matcaps, 'indirectColor').onChange(this.materials.matcaps.updateUniforms)
        }

        // Floor
        this.materials.floor = new FloorMaterial({
            background: this.resources.items.backgroundTexture,
            shadow: this.resources.items.floorShadowTexture,
            color: new THREE.Color(0xd04500)
        })

        // Auto assign
        this.materials.items = [
            {
                regex: /^rock[0-9]{0,3}?$/,
                material: this.materials.matcaps.rockMatcap
            },
            {
                regex: /^slabe[0-9]{0,3}?|cube[0-9]{0,3}?$/,
                material: this.materials.matcaps.buildingMatcap
            }
        ]
    }

    setModel()
    {
        this.model = {}

        this.model.items = {}

        this.model.container = new THREE.Object3D()
        this.model.container.scale.x = 0.05
        this.model.container.scale.y = 0.05
        this.model.container.scale.z = 0.05
        this.container.add(this.model.container)

        const parent = this.resources.items.model.scene ? this.resources.items.model.scene : this.resources.items.model

        while(parent.children.length)
        {
            const child = parent.children[0]
            const object = {}
            object.geometry = child.geometry
            object.mesh = child

            const material = this.materials.items.find((_material) =>
            {
                return _material.regex.test(object.mesh.name)
            })

            object.mesh.material = material.material

            this.model.container.add(object.mesh)

            this.model.items[child.name] = object
        }
    }

    setFloor()
    {
        this.floor = {}
        this.floor.geometry = new THREE.PlaneBufferGeometry(1.084, 1.084, 10, 10)
        this.floor.mesh = new THREE.Mesh(this.floor.geometry, this.materials.floor)
        this.floor.mesh.rotation.x = - Math.PI * 0.5
        this.container.add(this.floor.mesh)
    }

    setDummy()
    {
        this.dummy = {}
        this.dummy.container = new THREE.Object3D()
        this.dummy.container.scale.x = 0.5
        this.dummy.container.scale.y = 0.5
        this.dummy.container.scale.z = 0.5
        this.container.add(this.dummy.container)

        this.dummy.box = {}
        this.dummy.box.geometry = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2)
        this.dummy.box.mesh = new THREE.Mesh(this.dummy.box.geometry, this.materials.items[0].material)
        this.dummy.box.mesh.castShadow = true
        this.dummy.box.mesh.receiveShadow = true
        this.dummy.container.add(this.dummy.box.mesh)

        this.dummy.torusKnot = {}
        this.dummy.torusKnot.geometry = new THREE.TorusKnotBufferGeometry(0.08, 0.03, 100, 20)
        this.dummy.torusKnot.mesh = new THREE.Mesh(this.dummy.torusKnot.geometry, this.materials.items[0].material)
        this.dummy.torusKnot.mesh.position.x = 0.3
        this.dummy.torusKnot.mesh.castShadow = true
        this.dummy.container.add(this.dummy.torusKnot.mesh)

        this.dummy.sphere = {}
        this.dummy.sphere.geometry = new THREE.SphereBufferGeometry(0.12, 32, 32)
        this.dummy.sphere.mesh = new THREE.Mesh(this.dummy.sphere.geometry, this.materials.items[0].material)
        this.dummy.sphere.mesh.position.x = - 0.3
        this.dummy.sphere.mesh.castShadow = true
        this.dummy.container.add(this.dummy.sphere.mesh)

        this.time.on('tick', () =>
        {
            this.dummy.container.position.y = Math.sin(this.time.elapsed * 0.0002) * 0.1

            this.dummy.box.mesh.rotation.y += 0.02
            this.dummy.box.mesh.rotation.x += 0.0123

            this.dummy.torusKnot.mesh.rotation.y += 0.02
            this.dummy.torusKnot.mesh.rotation.x += 0.0123
        })
    }
}
