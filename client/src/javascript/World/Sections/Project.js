import * as THREE from 'three'

import ProjectBoardMaterial from '../../Materials/ProjectBoard.js'
import gsap from 'gsap'

export default class Project
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.name = _options.name
        this.geometries = _options.geometries
        this.meshes = _options.meshes
        this.debug = _options.debug
        this.name = _options.name
        this.x = _options.x
        this.y = _options.y
        this.imageSources = _options.imageSources
        this.floorTexture = _options.floorTexture
        this.link = _options.link
        this.distinctions = _options.distinctions

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        // this.container.updateMatrix()

        this.setBoards()
        this.setFloor()
    }

    setBoards()
    {
        // Set up
        this.boards = {}
        this.boards.items = []
        this.boards.xStart = - 5
        this.boards.xInter = 5
        this.boards.y = 5
        this.boards.color = '#8e7161'
        this.boards.threeColor = new THREE.Color(this.boards.color)

        if(this.debug)
        {
            this.debug.addColor(this.boards, 'color').name('boardColor').onChange(() =>
            {
                this.boards.threeColor.set(this.boards.color)
            })
        }

        // Create each board
        let i = 0

        for(const _imageSource of this.imageSources)
        {
            // Set up
            const board = {}
            board.x = this.x + this.boards.xStart + i * this.boards.xInter
            board.y = this.y + this.boards.y

            // Create structure with collision
            this.objects.add({
                base: this.resources.items.projectsBoardStructure.scene,
                collision: this.resources.items.projectsBoardCollision.scene,
                floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture,
                offset: new THREE.Vector3(board.x, board.y, 0),
                rotation: new THREE.Euler(0, 0, 0),
                duplicated: true,
                mass: 0
            })

            // Image load
            const image = new Image()
            image.addEventListener('load', () =>
            {
                board.texture = new THREE.Texture(image)
                // board.texture.magFilter = THREE.NearestFilter
                // board.texture.minFilter = THREE.LinearFilter
                board.texture.anisotropy = 4
                // board.texture.colorSpace = THREE.SRGBColorSpace
                board.texture.needsUpdate = true

                board.planeMesh.material.uniforms.uTexture.value = board.texture

                gsap.to(board.planeMesh.material.uniforms.uTextureAlpha, { value: 1, duration: 1, ease: 'power4.inOut' })
            })

            image.src = _imageSource

            // Plane
            board.planeMesh = this.meshes.boardPlane.clone()
            board.planeMesh.position.x = board.x
            board.planeMesh.position.y = board.y
            board.planeMesh.matrixAutoUpdate = false
            board.planeMesh.updateMatrix()
            board.planeMesh.material = new ProjectBoardMaterial()
            board.planeMesh.material.uniforms.uColor.value = this.boards.threeColor
            board.planeMesh.material.uniforms.uTextureAlpha.value = 0
            this.container.add(board.planeMesh)

            // Save
            this.boards.items.push(board)

            i++
        }
    }

    setFloor()
    {
        this.floor = {}

        this.floor.x = 0
        this.floor.y = - 2

        // Container
        this.floor.container = new THREE.Object3D()
        this.floor.container.position.x = this.x + this.floor.x
        this.floor.container.position.y = this.y + this.floor.y
        this.floor.container.matrixAutoUpdate = false
        this.floor.container.updateMatrix()
        this.container.add(this.floor.container)

        // Texture
        this.floor.texture = this.floorTexture
        this.floor.texture.magFilter = THREE.NearestFilter
        this.floor.texture.minFilter = THREE.LinearFilter

        // Geometry
        this.floor.geometry = this.geometries.floor

        // Material
        this.floor.material =  new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, alphaMap: this.floor.texture })

        // Mesh
        this.floor.mesh = new THREE.Mesh(this.floor.geometry, this.floor.material)
        this.floor.mesh.matrixAutoUpdate = false
        this.floor.container.add(this.floor.mesh)

        // Distinctions
        if(this.distinctions)
        {
            for(const _distinction of this.distinctions)
            {
                let base = null
                let collision = null
                let shadowSizeX = null
                let shadowSizeY = null

                switch(_distinction.type)
                {
                    case 'awwwards':
                        base = this.resources.items.projectsDistinctionsAwwwardsBase.scene
                        collision = this.resources.items.projectsDistinctionsAwwwardsCollision.scene
                        shadowSizeX = 1.5
                        shadowSizeY = 1.5
                        break

                    case 'fwa':
                        base = this.resources.items.projectsDistinctionsFWABase.scene
                        collision = this.resources.items.projectsDistinctionsFWACollision.scene
                        shadowSizeX = 2
                        shadowSizeY = 1
                        break

                    case 'cssda':
                        base = this.resources.items.projectsDistinctionsCSSDABase.scene
                        collision = this.resources.items.projectsDistinctionsCSSDACollision.scene
                        shadowSizeX = 1.2
                        shadowSizeY = 1.2
                        break
                }

                this.objects.add({
                    base: base,
                    collision: collision,
                    offset: new THREE.Vector3(this.x + this.floor.x + _distinction.x, this.y + this.floor.y + _distinction.y, 0),
                    rotation: new THREE.Euler(0, 0, 0),
                    duplicated: true,
                    shadow: { sizeX: shadowSizeX, sizeY: shadowSizeY, offsetZ: - 0.1, alpha: 0.5 },
                    mass: 1.5,
                    soundName: 'woodHit'
                })
            }
        }

        // Area
        this.floor.area = this.areas.add({
            position: new THREE.Vector2(this.x + this.link.x, this.y + this.floor.y + this.link.y),
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
        this.floor.container.add(this.floor.areaLabel)
    }
}
