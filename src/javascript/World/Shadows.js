import * as THREE from 'three'
import ShadowMaterial from '../Materials/Shadow.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

export default class Shadows
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.debug = _options.debug
        this.renderer = _options.renderer
        this.camera = _options.camera
        this.orbitControls = _options.orbitControls

        // Set up
        this.alpha = 0.5
        this.maxDistance = 3
        this.distancePower = 2
        this.zFightingDistance = 0.001
        this.color = '#d04500'
        this.wireframeVisible = false
        this.container = new THREE.Object3D()
        this.items = []

        this.setSun()
        this.setMaterials()
        this.setGeometry()
        this.setDummy()

        // Debug
        if(this.debug)
        {
            const folder = this.debug.addFolder('shadows')
            folder.open()

            folder.add(this, 'alpha').step(0.01).min(0).max(1)
            folder.add(this, 'maxDistance').step(0.01).min(0).max(10)
            folder.add(this, 'distancePower').step(0.01).min(1).max(5)
            folder.add(this.sun.position, 'x').step(0.01).min(- 10).max(10).name('sunX').onChange(this.sun.update)
            folder.add(this.sun.position, 'y').step(0.01).min(- 10).max(10).name('sunY').onChange(this.sun.update)
            folder.add(this.sun.position, 'z').step(0.01).min(0).max(10).name('sunZ').onChange(this.sun.update)
            folder.add(this.sun.helper, 'visible').name('sunHelperVisible')
            folder.add(this, 'wireframeVisible').name('wireframeVisible').onChange(() =>
            {
                for(const _shadow of this.items)
                {
                    _shadow.mesh.material = this.wireframeVisible ? this.materials.wireframe : _shadow.material
                }
            })

            folder.addColor(this, 'color').onChange(() =>
            {
                this.materials.base.uniforms.uColor.value = new THREE.Color(this.color)

                for(const _shadow of this.items)
                {
                    _shadow.material.uniforms.uColor.value = new THREE.Color(this.color)
                }
            })
        }
    }

    setSun()
    {
        this.sun = {}
        this.sun.position = new THREE.Vector3(3, 0, 3)
        this.sun.vector = new THREE.Vector3()
        this.sun.helper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, 0xffffff, 0.1, 0.4)
        this.sun.helper.visible = false
        this.container.add(this.sun.helper)

        this.sun.update = () =>
        {
            this.sun.vector.copy(this.sun.position).multiplyScalar(1 / this.sun.position.z).negate()
            this.sun.helper.position.copy(this.sun.position)

            const direction = this.sun.position.clone().negate().normalize()

            this.sun.helper.setDirection(direction)
            this.sun.helper.setLength(this.sun.helper.position.length())
        }

        this.sun.update()
    }

    setMaterials()
    {
        // Wireframe
        this.materials = {}
        this.materials.wireframe = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })

        // Base
        this.materials.base = new ShadowMaterial()
        this.materials.base.depthWrite = false
        this.materials.base.uniforms.uColor.value = new THREE.Color(this.color)
        this.materials.base.uniforms.uAlpha.value = 0.5
        this.materials.base.uniforms.uFadeRadius.value = 0.35
    }

    setGeometry()
    {
        this.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1)
    }

    setDummy()
    {
        this.dummy = {}

        this.dummy.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1, 1), new THREE.MeshNormalMaterial())
        this.dummy.mesh.position.z = 1.5
        this.dummy.mesh.position.y = - 3
        this.container.add(this.dummy.mesh)
        this.add(this.dummy.mesh, { sizeX: 2, sizeY: 2, offsetZ: - 0.35 })

        this.dummy.transformControls = new TransformControls(this.camera, this.renderer.domElement)
        this.dummy.transformControls.size = 0.5
        this.dummy.transformControls.attach(this.dummy.mesh)

        document.addEventListener('keydown', (_event) =>
        {
            if(_event.key === 'r')
            {
                this.dummy.transformControls.setMode('rotate')
            }
            else if(_event.key === 'g')
            {
                this.dummy.transformControls.setMode('translate')
            }
        })

        this.dummy.transformControls.addEventListener('dragging-changed', (_event) =>
        {
            this.orbitControls.enabled = !_event.value
        })

        this.container.add(this.dummy.transformControls)

        // Time tick
        this.time.on('tick', () =>
        {
            for(const _shadow of this.items)
            {
                // Position
                const z = Math.max(_shadow.reference.position.z + _shadow.offsetZ, 0)
                const sunOffset = this.sun.vector.clone().multiplyScalar(z)

                _shadow.mesh.position.x = _shadow.reference.position.x + sunOffset.x
                _shadow.mesh.position.y = _shadow.reference.position.y + sunOffset.y

                _shadow.mesh.rotation.z = _shadow.reference.rotation.z

                // Alpha
                let alpha = (this.maxDistance - z) / this.maxDistance
                alpha = Math.min(Math.max(alpha, 0), 1)
                alpha = Math.pow(alpha, this.distancePower)

                _shadow.material.uniforms.uAlpha.value = this.alpha * _shadow.alpha * alpha
            }
        })
    }

    add(_reference, _options = {})
    {
        const shadow = {}

        // Options
        shadow.offsetZ = typeof _options.offsetZ === 'undefined' ? 0 : _options.offsetZ
        shadow.alpha = typeof _options.alpha === 'undefined' ? 1 : _options.alpha

        // Reference
        shadow.reference = _reference

        // Material
        shadow.material = this.materials.base.clone()

        // Mesh
        shadow.mesh = new THREE.Mesh(this.geometry, this.wireframeVisible ? this.materials.wireframe : shadow.material)
        shadow.mesh.position.z = this.zFightingDistance
        shadow.mesh.scale.set(_options.sizeX, _options.sizeY, 2.4)

        // Save
        this.container.add(shadow.mesh)
        this.items.push(shadow)
    }
}
