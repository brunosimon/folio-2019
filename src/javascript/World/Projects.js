import * as THREE from 'three'
import Project from './Project'
import BillboardSheetMaterial from '../Materials/BillboardSheet.js'

export default class Projects
{
    constructor(_options)
    {
        this.time = _options.time,
        this.resources = _options.resources,
        this.objects = _options.objects,
        this.areas = _options.areas,
        this.debug = _options.debug

        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('projects')
            this.debugFolder.open()
        }

        this.container = new THREE.Object3D()

        this.setMeshes()
        this.setMaterials()
        this.setTestProject()
    }

    setMeshes()
    {
        this.meshes = {}

        this.meshes.structure = this.objects.getConvertedMesh(this.resources.items.projectsBillboardStructure.scene.children)
        this.meshes.sheet = this.resources.items.projectsBillboardSheet.scene.children[0]
        this.meshes.gear = this.objects.getConvertedMesh(this.resources.items.projectsBillboardGear.scene.children)
        this.meshes.floor = this.resources.items.projectsBillboardFloor.scene.children[0]
    }

    setMaterials()
    {
        this.materials = {}
        // this.materials.sheet = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
        this.materials.sheet = new BillboardSheetMaterial()
        this.materials.floor = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false })
    }

    setTestProject()
    {
        this.testProject = new Project({
            name: 'citrixRedbull',
            meshes: this.meshes,
            materials: this.materials,
            slidesCount: 5,
            slidesTexture: this.resources.items.projectsBillboardCitrixRedbullSlidesTexture,
            floorTexture: this.resources.items.projectsBillboardCitrixRedbullFloorTexture,
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            areas: this.areas,
            debug: this.debugFolder
        })
        this.container.add(this.testProject.container)
    }
}
