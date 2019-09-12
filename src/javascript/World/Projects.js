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
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.setGeometries()
        this.setMeshes()
        this.setMaterials()
        this.setTestProject()
    }

    setGeometries()
    {
        this.geometries = {}
        this.geometries.floor = new THREE.PlaneBufferGeometry(16, 8)
    }

    setMeshes()
    {
        this.meshes = {}

        // this.meshes.structure = this.objects.getConvertedMesh(this.resources.items.projectsBillboardStructure.scene.children)
        // this.meshes.sheet = this.resources.items.projectsBillboardSheet.scene.children[0]
        // this.meshes.gear = this.objects.getConvertedMesh(this.resources.items.projectsBillboardGear.scene.children)
        // this.meshes.floor = this.resources.items.projectsBillboardFloor.scene.children[0]

        this.meshes.boardStructure = this.objects.getConvertedMesh(this.resources.items.projectsBoardStructure.scene.children, { floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture })
        this.meshes.boardPlane = this.resources.items.projectsBoardPlane.scene.children[0]
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
            geometries: this.geometries,
            meshes: this.meshes,
            materials: this.materials,
            // slidesCount: 5,
            // slidesTexture: this.resources.items.projectsBillboardCitrixRedbullSlidesTexture,
            images:
            [
                this.resources.items.projectsCitrixRedbullSlideATexture,
                this.resources.items.projectsCitrixRedbullSlideBTexture,
                this.resources.items.projectsCitrixRedbullSlideCTexture
            ],
            floorTexture: this.resources.items.projectsCitrixRedbullFloorTexture,
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            areas: this.areas,
            debug: this.debugFolder,
            x: 0,
            y: 0
        })
        this.container.add(this.testProject.container)
    }
}
