import * as THREE from 'three'
import Project from './Project'
import TweenLite from 'gsap/TweenLite'

// projet 1 : noffta
import projectsThreejsJourneySlideASources from '../../../models/projects/threejsJourney/slideA.jpg'
import projectsThreejsJourneySlideBSources from '../../../models/projects/threejsJourney/slideB.jpg'
import projectsThreejsJourneySlideCSources from '../../../models/projects/threejsJourney/slideC.jpg'
import projectsThreejsJourneySlideDSources from '../../../models/projects/threejsJourney/slideD.jpg'

// projet 2 : chiron
import projectschironSlideASources from '../../../models/projects/chiron/slideA.jpg'
import projectschironSlideBSources from '../../../models/projects/chiron/slideB.jpg'
import projectschironSlideCSources from '../../../models/projects/chiron/slideC.jpg'

// projet 3 : robrun
import projectsrobrunSlideASources from '../../../models/projects/robrun/slideA.jpg'
import projectsrobrunSlideBSources from '../../../models/projects/robrun/slideB.jpg'
import projectsrobrunSlideCSources from '../../../models/projects/robrun/slideC.jpg'

// projet 4 : updayme
import projectsupdaymeSlideASources from '../../../models/projects/updayme/slideA.jpg'
import projectsupdaymeSlideBSources from '../../../models/projects/updayme/slideB.jpg'
import projectsupdaymeSlideCSources from '../../../models/projects/updayme/slideC.jpg'

// projet 5 : karma
import projectskarmaSlideASources from '../../../models/projects/karma/slideA.jpg'
import projectskarmaSlideBSources from '../../../models/projects/karma/slideB.jpg'
import projectskarmaSlideCSources from '../../../models/projects/karma/slideC.jpg'

// projet 6 : osaka
import projectsosakaSlideASources from '../../../models/projects/osaka/slideA.jpg'
import projectsosakaSlideBSources from '../../../models/projects/osaka/slideB.jpg'
import projectsosakaSlideCSources from '../../../models/projects/osaka/slideC.jpg'

// import projectsPriorHoldingsSlideASources from '../../../models/projects/priorHoldings/slideA.jpg'
// import projectsPriorHoldingsSlideBSources from '../../../models/projects/priorHoldings/slideB.jpg'
// import projectsPriorHoldingsSlideCSources from '../../../models/projects/priorHoldings/slideC.jpg'

// import projectsOranoSlideASources from '../../../models/projects/orano/slideA.jpg'
// import projectsOranoSlideBSources from '../../../models/projects/orano/slideB.jpg'
// import projectsOranoSlideCSources from '../../../models/projects/orano/slideC.jpg'

// import projectsGleecChatSlideASources from '../../../models/projects/gleecChat/slideA.jpg'
// import projectsGleecChatSlideBSources from '../../../models/projects/gleecChat/slideB.jpg'
// import projectsGleecChatSlideCSources from '../../../models/projects/gleecChat/slideC.jpg'
// import projectsGleecChatSlideDSources from '../../../models/projects/gleecChat/slideD.jpg'

// import projectsKepplerSlideASources from '../../../models/projects/keppler/slideA.jpg'
// import projectsKepplerSlideBSources from '../../../models/projects/keppler/slideB.jpg'
// import projectsKepplerSlideCSources from '../../../models/projects/keppler/slideC.jpg'

export default class ProjectsSection {
    constructor(_options) {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.camera = _options.camera
        this.passes = _options.passes
        this.objects = _options.objects
        this.areas = _options.areas
        this.zones = _options.zones
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Debug
        if (this.debug) {
            this.debugFolder = this.debug.addFolder('projects')
            this.debugFolder.open()
        }

        // Set up
        this.items = []

        this.interDistance = 24
        this.positionRandomess = 5
        this.projectHalfWidth = 9

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.setGeometries()
        this.setMeshes()
        this.setList()
        this.setZone()

        // Add all project from the list
        for (const _options of this.list) {
            this.add(_options)
        }
    }

    setGeometries() {
        this.geometries = {}
        this.geometries.floor = new THREE.PlaneBufferGeometry(16, 8)
    }

    setMeshes() {
        this.meshes = {}

        // this.meshes.boardStructure = this.objects.getConvertedMesh(this.resources.items.projectsBoardStructure.scene.children, { floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture })
        this.resources.items.areaOpenTexture.magFilter = THREE.NearestFilter
        this.resources.items.areaOpenTexture.minFilter = THREE.LinearFilter
        this.meshes.boardPlane = this.resources.items.projectsBoardPlane.scene.children[0]
        this.meshes.areaLabel = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 0.5), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.resources.items.areaOpenTexture }))
        this.meshes.areaLabel.matrixAutoUpdate = false
    }

    setList() {
        this.list = [
            {
                name: 'Three.js Journey',
                imageSources:
                    [
                        projectsThreejsJourneySlideASources,
                        projectsThreejsJourneySlideBSources,
                        projectsThreejsJourneySlideCSources,
                        projectsThreejsJourneySlideDSources
                    ],
                floorTexture: this.resources.items.projectsThreejsJourneyFloorTexture,
                link:
                {
                    href: 'https://threejs-journey.com?c=p3',
                    x: - 4.8,
                    y: - 3,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                }
            },
            {
                name: 'chiron',
                imageSources:
                    [
                        projectschironSlideASources,
                        projectschironSlideBSources,
                        projectschironSlideCSources
                    ],
                floorTexture: this.resources.items.projectschironFloorTexture,
                link:
                {
                    href: 'https://chiron.io',
                    x: - 4.8,
                    y: - 4,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                }
            },
            {
                name: 'robrun',
                imageSources:
                    [
                        projectsrobrunSlideASources,
                        projectsrobrunSlideBSources,
                        projectsrobrunSlideCSources
                    ],
                floorTexture: this.resources.items.projectsrobrunFloorTexture,
                link:
                {
                    href: 'https://fromrobrun.com',
                    x: - 4.8,
                    y: - 2,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                    [
                    ]
            },
            {
                name: 'updayme',
                imageSources:
                    [
                        projectsupdaymeSlideASources,
                        projectsupdaymeSlideBSources,
                        projectsupdaymeSlideCSources
                    ],
                floorTexture: this.resources.items.projectsupdaymeFloorTexture,
                link:
                {
                    href: 'https://updayme.iversenc.fr',
                    x: - 4.8,
                    y: - 3.3,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                }
            },
            {
                name: 'karma',
                imageSources:
                    [
                        projectskarmaSlideASources,
                        projectskarmaSlideBSources,
                        projectskarmaSlideCSources
                    ],
                floorTexture: this.resources.items.projectskarmaFloorTexture,
                link:
                {
                    href: 'https://zen.ly',
                    x: - 4.8,
                    y: - 4.2,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                }
            },
            // {
            //     name: 'priorHoldings',
            //     imageSources:
            //         [
            //             projectsPriorHoldingsSlideASources,
            //             projectsPriorHoldingsSlideBSources,
            //             projectsPriorHoldingsSlideCSources
            //         ],
            //     floorTexture: this.resources.items.projectsPriorHoldingsFloorTexture,
            //     link:
            //     {
            //         href: 'https://prior.co.jp/discover/',
            //         x: - 4.8,
            //         y: - 3,
            //         halfExtents:
            //         {
            //             x: 3.2,
            //             y: 1.5
            //         }
            //     },
            //     distinctions:
            //         [
            //             { type: 'awwwards', x: 3.95, y: 4.15 },
            //             { type: 'fwa', x: 5.6, y: 4.15 },
            //             { type: 'cssda', x: 7.2, y: 4.15 }
            //         ]
            // },
            // {
            //     name: 'orano',
            //     imageSources:
            //         [
            //             projectsOranoSlideASources,
            //             projectsOranoSlideBSources,
            //             projectsOranoSlideCSources
            //         ],
            //     floorTexture: this.resources.items.projectsOranoFloorTexture,
            //     link:
            //     {
            //         href: 'https://orano.imm-g-prod.com/experience/innovation/en',
            //         x: - 4.8,
            //         y: - 3.4,
            //         halfExtents:
            //         {
            //             x: 3.2,
            //             y: 1.5
            //         }
            //     },
            //     distinctions:
            //         [
            //             { type: 'awwwards', x: 3.95, y: 4.15 },
            //             { type: 'fwa', x: 5.6, y: 4.15 },
            //             { type: 'cssda', x: 7.2, y: 4.15 }
            //         ]
            // },
            {
                name: 'osaka',
                imageSources:
                    [
                        projectsosakaSlideASources,
                        projectsosakaSlideBSources,
                        projectsosakaSlideCSources
                    ],
                floorTexture: this.resources.items.projectsosakaFloorTexture,
                link:
                {
                    href: 'https:thenewmobileworkforce.imm-g-prod.com/',
                    x: - 4.8,
                    y: - 4.4,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                    [
                        { type: 'awwwards', x: 3.95, y: 4.15 },
                        { type: 'fwa', x: 5.6, y: 4.15 },
                        { type: 'cssda', x: 7.2, y: 4.15 }
                    ]
            }
            // {
            //     name: 'gleecChat',
            //     imageSources:
            //     [
            //         projectsGleecChatSlideASources,
            //         projectsGleecChatSlideBSources,
            //         projectsGleecChatSlideCSources,
            //         projectsGleecChatSlideDSources
            //     ],
            //     floorTexture: this.resources.items.projectsGleecChatFloorTexture,
            //     link:
            //     {
            //         href: 'http://gleec.imm-g-prod.com',
            //         x: - 4.8,
            //         y: - 3.4,
            //         halfExtents:
            //         {
            //             x: 3.2,
            //             y: 1.5
            //         }
            //     },
            //     distinctions:
            //     [
            //         { type: 'awwwards', x: 3.95, y: 4.15 },
            //         { type: 'fwa', x: 5.6, y: 4.15 },
            //         { type: 'cssda', x: 7.2, y: 4.15 }
            //     ]
            // },
            // {
            //     name: 'keppler',
            //     imageSources:
            //         [
            //             projectsKepplerSlideASources,
            //             projectsKepplerSlideBSources,
            //             projectsKepplerSlideCSources
            //         ],
            //     floorTexture: this.resources.items.projectsKepplerFloorTexture,
            //     link:
            //     {
            //         href: 'https://brunosimon.github.io/keppler/',
            //         x: 2.75,
            //         y: - 1.1,
            //         halfExtents:
            //         {
            //             x: 3.2,
            //             y: 1.5
            //         }
            //     },
            //     distinctions: []
            // }
        ]
    }

    setZone() {
        const totalWidth = this.list.length * (this.interDistance / 2)

        const zone = this.zones.add({
            position: { x: this.x + totalWidth - this.projectHalfWidth - 6, y: this.y },
            halfExtents: { x: totalWidth, y: 12 },
            data: { cameraAngle: 'projects' }
        })

        zone.on('in', (_data) => {
            this.camera.angle.set(_data.cameraAngle)
            TweenLite.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, 2, { x: 0 })
            TweenLite.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, 2, { y: 0 })
        })

        zone.on('out', () => {
            this.camera.angle.set('default')
            TweenLite.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, 2, { x: this.passes.horizontalBlurPass.strength })
            TweenLite.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, 2, { y: this.passes.verticalBlurPass.strength })
        })
    }

    add(_options) {
        const x = this.x + this.items.length * this.interDistance
        let y = this.y
        if (this.items.length > 0) {
            y += (Math.random() - 0.5) * this.positionRandomess
        }

        // Create project
        const project = new Project({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            areas: this.areas,
            geometries: this.geometries,
            meshes: this.meshes,
            debug: this.debugFolder,
            x: x,
            y: y,
            ..._options
        })

        this.container.add(project.container)

        // Add tiles
        if (this.items.length >= 1) {
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
