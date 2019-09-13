import * as THREE from 'three'
import { TweenLite } from 'gsap/TweenLite'
import { Back } from 'gsap/EasePack'

export default class Project
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.debug = _options.debug
        this.name = _options.name
        this.geometries = _options.geometries
        this.meshes = _options.meshes
        this.materials = _options.materials
        // this.slidesCount = _options.slidesCount
        // this.slidesTexture = _options.slidesTexture
        this.name = _options.name
        this.x = _options.x
        this.y = _options.y
        this.images = _options.images
        this.floorTexture = _options.floorTexture
        this.link = _options.link

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder(this.name)
            this.debugFolder.open()
        }

        // Set up
        this.container = new THREE.Object3D()
        this.container.position.x = this.x
        this.container.position.y = this.y
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.setBoards()
        this.setFloor()
    }

    setBoards()
    {
        this.boards = {}
        this.boards.items = []
        this.boards.xStart = - 5
        this.boards.xInter = 5
        this.boards.y = 3

        let i = 0

        for(const _image of this.images)
        {
            const board = {}

            board.texture = _image
            // board.texture.magFilter = THREE.NearestFilter
            // board.texture.minFilter = THREE.LinearFilter

            board.container = new THREE.Object3D()
            board.container.position.x = this.boards.xStart + i * this.boards.xInter
            board.container.position.y = this.boards.y
            board.container.rotation.z = (Math.random() - 0.5) * 0.1 * Math.PI
            board.container.matrixAutoUpdate = false
            board.container.updateMatrix()
            this.container.add(board.container)

            board.structureMesh = this.meshes.boardStructure.clone()
            board.structureMesh.matrixAutoUpdate = false
            board.structureMesh.updateMatrix()
            board.container.add(board.structureMesh)

            board.planeMesh = this.meshes.boardPlane.clone()
            board.planeMesh.matrixAutoUpdate = false
            board.planeMesh.updateMatrix()
            board.planeMesh.material = new THREE.MeshBasicMaterial({ map: board.texture })
            board.container.add(board.planeMesh)

            this.boards.items.push(board)

            i++
        }
    }

    setFloor()
    {
        this.floor = {}

        // Texture
        this.floor.texture = this.floorTexture
        this.floor.texture.magFilter = THREE.NearestFilter
        this.floor.texture.minFilter = THREE.LinearFilter

        // Geometry
        this.floor.geometry = this.geometries.floor

        // Material
        this.floor.material = this.materials.floor.clone()
        this.floor.material.alphaMap = this.floor.texture

        // Mesh
        this.floor.mesh = new THREE.Mesh(this.floor.geometry, this.floor.material)
        this.floor.mesh.position.y = - 4
        this.floor.mesh.matrixAutoUpdate = false
        this.floor.mesh.updateMatrix()
        this.container.add(this.floor.mesh)

        // Area
        this.floor.area = this.areas.add({
            position: new THREE.Vector2(this.x + this.link.x, this.y + this.link.y),
            halfExtents: new THREE.Vector2(this.link.halfExtents.x, this.link.halfExtents.y)
        })
        this.floor.area.on('interact', () =>
        {
            window.open(this.link.href, '_blank')
        })

        // Area label
        this.floor.areaLabel = this.meshes.areaLabel.clone()
        this.floor.areaLabel.position.x = this.link.x
        this.floor.areaLabel.position.y = this.link.y
        this.floor.areaLabel.position.z = 0.001
        this.floor.areaLabel.matrixAutoUpdate = false
        this.floor.areaLabel.updateMatrix()
        this.container.add(this.floor.areaLabel)
    }
}
