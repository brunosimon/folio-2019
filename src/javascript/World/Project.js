import * as THREE from 'three'
import { TweenLite } from 'gsap/TweenLite'
import { Back } from 'gsap/EasePack'

export default class Project
{
    constructor(_options)
    {
        // Options
        this.name = _options.name
        this.meshes = _options.meshes
        this.materials = _options.materials
        this.slidesCount = _options.slidesCount
        this.slidesTexture = _options.slidesTexture
        this.floorTexture = _options.floorTexture
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.debug = _options.debug

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder(this.name)
            this.debugFolder.open()
        }

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.index = 0

        this.setStructure()
        this.setSheet()
        this.setGears()
        this.setFloor()

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this, 'previous').name('previous')
            this.debugFolder.add(this, 'next').name('next')
        }
    }

    setStructure()
    {
        this.container.add(this.meshes.structure)
    }

    setSheet()
    {
        this.sheet = {}

        this.sheet.progress = 0

        // Texture
        this.slidesTexture.wrapS = THREE.RepeatWrapping

        // this.slidesTexture.magFilter = THREE.NearestFilter
        // this.slidesTexture.magFilter = THREE.LinearFilter // Default

        // this.slidesTexture.minFilter = THREE.NearestFilter
        // this.slidesTexture.minFilter = THREE.NearestMipmapNearestFilter
        // this.slidesTexture.minFilter = THREE.NearestMipmapLinearFilter
        this.slidesTexture.minFilter = THREE.LinearFilter
        // this.slidesTexture.minFilter = THREE.LinearMipmapNearestFilter
        // this.slidesTexture.minFilter = THREE.LinearMipmapLinearFilter // Default

        // Material
        this.sheet.material = this.materials.sheet.clone()
        this.sheet.material.uniforms.uTexture.value = this.slidesTexture

        this.sheet.material.uniforms.uCount.value = this.slidesCount
        this.sheet.material.uniforms.uProgress.value = 0

        // Mesh
        this.sheet.mesh = this.meshes.sheet
        this.sheet.mesh.material = this.sheet.material

        this.container.add(this.sheet.mesh)

        // Time tick
        this.time.on('tick', () =>
        {
            this.sheet.material.uniforms.uProgress.value = this.sheet.progress
        })
    }

    setGears()
    {
        this.gears = {}
        this.gears.rotationSpeed = - 8

        this.gears.a = this.meshes.gear.clone()
        this.container.add(this.gears.a)

        this.gears.b = this.meshes.gear.clone()
        this.gears.b.position.x -= 5.9
        this.container.add(this.gears.b)
    }

    setFloor()
    {
        this.floor = {}

        // Texture
        this.floor.texture = this.floorTexture
        this.floor.texture.magFilter = THREE.NearestFilter
        this.floor.texture.minFilter = THREE.LinearFilter

        // Material
        this.floor.material = this.materials.floor.clone()
        this.floor.material.alphaMap = this.floor.texture

        // Mesh
        this.floor.mesh = this.meshes.floor.clone()
        this.floor.mesh.material = this.floor.material
        this.container.add(this.floor.mesh)

        // Areas
        this.floor.areaPrevious = this.areas.add({ position: new THREE.Vector2(- 2.9, - 3.4), halfExtents: new THREE.Vector2(1, 1) })
        this.floor.areaPrevious.on('interact', () =>
        {
            this.previous()
        })

        this.floor.areaNext = this.areas.add({ position: new THREE.Vector2(- 0.4, - 3.4), halfExtents: new THREE.Vector2(1, 1) })
        this.floor.areaNext.on('interact', () =>
        {
            this.next()
        })

        this.floor.areaOpen = this.areas.add({ position: new THREE.Vector2(0, - 13), halfExtents: new THREE.Vector2(4, 2) })
        this.floor.areaOpen.on('interact', () =>
        {
            window.open('https://google.fr', '_blank')
        })
    }

    previous()
    {
        this.goTo(this.index - 1)
    }

    next()
    {
        this.goTo(this.index + 1)
    }

    goTo(_index)
    {
        this.index = _index

        // Ease
        const ease = Back.easeInOut.config(1)

        // Sheet
        const division = 1 / this.slidesCount
        const sheetProgress = this.index * division - division * 0.03
        // sheetProgress+=

        TweenLite.killTweensOf(this.sheet)
        TweenLite.to(this.sheet, 1.4, { progress: sheetProgress, ease: ease })

        // Gears
        const gearsRotation = this.gears.rotationSpeed * this.index

        TweenLite.killTweensOf(this.gears.a.rotation)
        TweenLite.to(this.gears.a.rotation, 1.4, { z: gearsRotation, ease: ease })

        TweenLite.killTweensOf(this.gears.b.rotation)
        TweenLite.to(this.gears.b.rotation, 1.4, { z: gearsRotation, ease: ease })
    }
}
