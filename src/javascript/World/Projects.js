import * as THREE from 'three'
import Project from './Project'
import BillboardSheetMaterial from '../Materials/BillboardSheet.js'

export default class Projects
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.tiles = _options.tiles
        this.debug = _options.debug

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('projects')
            this.debugFolder.open()
        }

        // Set up
        this.items = []

        this.x = 30
        this.y = - 30
        // this.x = 15
        // this.y = 0
        this.interDistance = 26
        this.positionRandomess = 5
        this.projectHalfWidth = 9

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
            this.add(_options)
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
                    y: - 3,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                [
                    { type: 'cssda', x: 4.05, y: 5.2 },
                    { type: 'awwwards', x: 5.4, y: 5.2 },
                    { type: 'awwwards', x: 6.85, y: 5.2 },
                    { type: 'fwa', x: 4.05, y: 2.8 }
                ]
            },
            {
                name: 'citrixRedbull2',
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
                    y: - 3,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                [
                    { type: 'cssda', x: 4.05, y: 5.2 },
                    { type: 'awwwards', x: 5.4, y: 5.2 },
                    { type: 'awwwards', x: 6.85, y: 5.2 },
                    { type: 'fwa', x: 4.05, y: 2.8 }
                ]
            },
            {
                name: 'citrixRedbull3',
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
                    y: - 3,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                [
                    { type: 'cssda', x: 4.05, y: 5.2 },
                    { type: 'awwwards', x: 5.4, y: 5.2 },
                    { type: 'awwwards', x: 6.85, y: 5.2 },
                    { type: 'fwa', x: 4.05, y: 2.8 }
                ]
            }
        ]
    }

    add(_options)
    {
        const x = this.x + this.items.length * this.interDistance
        let y = this.y
        if(this.items.length > 0)
        {
            y += (Math.random() - 0.5) * this.positionRandomess
        }

        // Create project
        const project = new Project({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            areas: this.areas,
            debug: this.debugFolder,
            geometries: this.geometries,
            meshes: this.meshes,
            materials: this.materials,
            x: x,
            y: y,
            ..._options
        })

        this.container.add(project.container)

        // Add tiles
        if(this.items.length >= 1)
        {
            const previousProject = this.items[this.items.length - 1]
            const start = new THREE.Vector2(previousProject.x + this.projectHalfWidth, previousProject.y)
            const end = new THREE.Vector2(project.x - this.projectHalfWidth, project.y)
            const delta = end.clone().sub(start)
            this.tiles.add({
                start: start,
                delta: delta
            })
        }

        // Save
        this.items.push(project)
    }
}
