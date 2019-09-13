import * as THREE from 'three'
import Project from './Project'
import BillboardSheetMaterial from '../Materials/BillboardSheet.js'

export default class Projects
{
    constructor(_options)
    {
        // Options
        this.time = _options.time,
        this.resources = _options.resources,
        this.objects = _options.objects,
        this.areas = _options.areas,
        this.debug = _options.debug

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('projects')
            this.debugFolder.open()
        }

        // Set up
        this.items = []
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.setGeometries()
        this.setMeshes()
        this.setMaterials()
        this.setList()

        // Add all project from the list
        for(const _options of this.list)
        {
            const project = new Project({
                time: this.time,
                resources: this.resources,
                objects: this.objects,
                areas: this.areas,
                debug: this.debugFolder,
                geometries: this.geometries,
                meshes: this.meshes,
                materials: this.materials,
                ..._options
            })

            this.items.push(project)
            this.container.add(project.container)
        }
    }

    setGeometries()
    {
        this.geometries = {}
        this.geometries.floor = new THREE.PlaneBufferGeometry(16, 8)
    }

    setMeshes()
    {
        this.meshes = {}

        // this.meshes.boardStructure = this.objects.getConvertedMesh(this.resources.items.projectsBoardStructure.scene.children, { floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture })
        this.meshes.boardPlane = this.resources.items.projectsBoardPlane.scene.children[0]
        this.meshes.areaLabel = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 0.5), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.resources.items.projectsFloorAreaOpenTexture }))
    }

    setMaterials()
    {
        this.materials = {}
        this.materials.sheet = new BillboardSheetMaterial()
        this.materials.floor = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false })
    }

    setList()
    {
        this.list = [
            {
                name: 'citrixRedbull',
                x: 0,
                y: 0,
                images:
                [
                    this.resources.items.projectsCitrixRedbullSlideATexture,
                    this.resources.items.projectsCitrixRedbullSlideBTexture,
                    this.resources.items.projectsCitrixRedbullSlideCTexture
                ],
                floorTexture: this.resources.items.projectsCitrixRedbullFloorTexture,
                link:
                {
                    href: 'https://google.fr',
                    x: - 4.8,
                    y: - 7,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                }
            }
        ]
    }
}
