import * as THREE from 'three'

export default class Objects
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.materials = _options.materials
        this.physics = _options.physics
        this.shadows = _options.shadows
        this.debug = _options.debug

        // Set up
        this.container = new THREE.Object3D()
        this.items = []

        this.setList()
        this.setParsers()

        // Add all objects from the list
        for(const _options of this.list)
        {
            const object = this.add(_options)
            this.container.add(object.container)
        }
    }

    setList()
    {
        // Objects options list
        this.list = [
            /**
             * Intro
             */
            // // Static
            // {
            //     base: this.resources.items.introStaticBase.scene,
            //     collision: this.resources.items.introStaticCollision.scene,
            //     floorShadowTexture: this.resources.items.introStaticFloorShadowTexture,
            //     offset: new THREE.Vector3(0, 0, 0),
            //     mass: 0
            // },

            // // Arrow keys
            // {
            //     base: this.resources.items.introArrowKeyBase.scene,
            //     collision: this.resources.items.introArrowKeyCollision.scene,
            //     offset: new THREE.Vector3(0, 0, 0),
            //     rotation: new THREE.Euler(0, 0, 0),
            //     duplicated: true,
            //     shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
            //     mass: 1.5
            // },
            // {
            //     base: this.resources.items.introArrowKeyBase.scene,
            //     collision: this.resources.items.introArrowKeyCollision.scene,
            //     offset: new THREE.Vector3(0, - 0.8, 0),
            //     rotation: new THREE.Euler(0, 0, Math.PI),
            //     duplicated: true,
            //     shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
            //     mass: 1.5
            // },
            // {
            //     base: this.resources.items.introArrowKeyBase.scene,
            //     collision: this.resources.items.introArrowKeyCollision.scene,
            //     offset: new THREE.Vector3(- 0.8, - 0.8, 0),
            //     rotation: new THREE.Euler(0, 0, Math.PI * 0.5),
            //     duplicated: true,
            //     shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
            //     mass: 1.5
            // },
            // {
            //     base: this.resources.items.introArrowKeyBase.scene,
            //     collision: this.resources.items.introArrowKeyCollision.scene,
            //     offset: new THREE.Vector3(0.8, - 0.8, 0),
            //     rotation: new THREE.Euler(0, 0, - Math.PI * 0.5),
            //     duplicated: true,
            //     shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
            //     mass: 1.5
            // },

            // // Title
            // {
            //     base: this.resources.items.introBBase.scene,
            //     collision: this.resources.items.introBCollision.scene,
            //     offset: new THREE.Vector3(0, 0, 0),
            //     rotation: new THREE.Euler(0, 0, 0),
            //     shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            //     mass: 1.5
            // },
            // {
            //     base: this.resources.items.introRBase.scene,
            //     collision: this.resources.items.introRCollision.scene,
            //     offset: new THREE.Vector3(0, 0, 0),
            //     rotation: new THREE.Euler(0, 0, 0),
            //     shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            //     mass: 1.5
            // },
            // {
            //     base: this.resources.items.introUBase.scene,
            //     collision: this.resources.items.introUCollision.scene,
            //     offset: new THREE.Vector3(0, 0, 0),
            //     rotation: new THREE.Euler(0, 0, 0),
            //     shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            //     mass: 1.5
            // },
            // {
            //     base: this.resources.items.introNBase.scene,
            //     collision: this.resources.items.introNCollision.scene,
            //     offset: new THREE.Vector3(0, 0, 0),
            //     rotation: new THREE.Euler(0, 0, 0),
            //     duplicated: true,
            //     shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            //     mass: 1.5
            // },
            // {
            //     base: this.resources.items.introOBase.scene,
            //     collision: this.resources.items.introOCollision.scene,
            //     offset: new THREE.Vector3(0, 0, 0),
            //     rotation: new THREE.Euler(0, 0, 0),
            //     duplicated: true,
            //     shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            //     mass: 1.5
            // },
            // {
            //     base: this.resources.items.introSBase.scene,
            //     collision: this.resources.items.introSCollision.scene,
            //     offset: new THREE.Vector3(0, 0, 0),
            //     rotation: new THREE.Euler(0, 0, 0),
            //     shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            //     mass: 1.5
            // },
            // {
            //     base: this.resources.items.introIBase.scene,
            //     collision: this.resources.items.introICollision.scene,
            //     offset: new THREE.Vector3(0, 0, 0),
            //     rotation: new THREE.Euler(0, 0, 0),
            //     shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            //     mass: 1.5
            // },
            // {
            //     base: this.resources.items.introMBase.scene,
            //     collision: this.resources.items.introMCollision.scene,
            //     offset: new THREE.Vector3(0, 0, 0),
            //     rotation: new THREE.Euler(0, 0, 0),
            //     shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            //     mass: 1.5
            // },
            // {
            //     base: this.resources.items.introOBase.scene,
            //     collision: this.resources.items.introOCollision.scene,
            //     offset: new THREE.Vector3(3.95, 0, 0),
            //     rotation: new THREE.Euler(0, 0, 0),
            //     duplicated: true,
            //     shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            //     mass: 1.5
            // },
            // {
            //     base: this.resources.items.introNBase.scene,
            //     collision: this.resources.items.introNCollision.scene,
            //     offset: new THREE.Vector3(5.85, 0, 0),
            //     rotation: new THREE.Euler(0, 0, 0),
            //     duplicated: true,
            //     shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },
            //     mass: 1.5
            // },

            // /**
            //  * Intro
            //  */
            // // Static
            // {
            //     base: this.resources.items.crossroadsStaticBase.scene,
            //     collision: this.resources.items.crossroadsStaticCollision.scene,
            //     floorShadowTexture: this.resources.items.crossroadsStaticFloorShadowTexture,
            //     offset: new THREE.Vector3(0, - 30, 0),
            //     mass: 0
            // }
        ]
    }

    setParsers()
    {
        this.parsers = {}

        this.parsers.items = [
            // Shade
            {
                regex: /^shade([a-z]+)_?[0-9]{0,3}?/i,
                apply: (_mesh, _options) =>
                {
                    // Find material
                    const match = _mesh.name.match(/^shade([a-z]+)_?[0-9]{0,3}?/i)
                    const materialName = match[1].toLowerCase()
                    let material = this.materials.shades.items[materialName]

                    // Default
                    if(typeof material === 'undefined')
                    {
                        material = new THREE.MeshNormalMaterial()
                    }

                    // Create clone mesh with new material
                    const mesh = _options.duplicated ? _mesh.clone() : _mesh
                    mesh.material = material

                    if(mesh.children.length)
                    {
                        for(const _child of mesh.children)
                        {
                            if(_child instanceof THREE.Mesh)
                            {
                                _child.material = material
                            }
                        }
                    }

                    return mesh
                }
            },

            // Shade
            {
                regex: /^pure([a-z]+)_?[0-9]{0,3}?/i,
                apply: (_mesh, _options) =>
                {
                    // Find material
                    const match = _mesh.name.match(/^pure([a-z]+)_?[0-9]{0,3}?/i)
                    const materialName = match[1].toLowerCase()
                    let material = this.materials.pures.items[materialName]

                    // Default
                    if(typeof material === 'undefined')
                    {
                        material = new THREE.MeshNormalMaterial()
                    }

                    // Create clone mesh with new material
                    const mesh = _options.duplicated ? _mesh.clone() : _mesh
                    mesh.material = material

                    return mesh
                }
            },

            // Floor
            {
                regex: /^floor_?[0-9]{0,3}?/i,
                apply: (_mesh, _options) =>
                {
                    // Create floor manually because of missing UV
                    const geometry = new THREE.PlaneBufferGeometry(_mesh.scale.x, _mesh.scale.y, 10, 10)
                    const material = this.materials.items.floorShadow.clone()

                    material.uniforms.tShadow.value = _options.floorShadowTexture
                    material.uniforms.uShadowColor.value = new THREE.Color(this.materials.items.floorShadow.shadowColor)

                    const mesh = new THREE.Mesh(geometry, material)

                    return mesh
                }
            }
        ]

        // Default
        this.parsers.default = {}
        this.parsers.default.apply = (_mesh) =>
        {
            // Create clone mesh with normal material
            const mesh = _mesh.clone()
            mesh.material = new THREE.MeshNormalMaterial()

            return mesh
        }
    }

    getConvertedMesh(_children, _options = {})
    {
        const container = new THREE.Object3D()
        const center = new THREE.Vector3()

        // Go through each base child
        const baseChildren = [..._children]

        for(const _child of baseChildren)
        {
            // Find center
            if(_child.name.match(/^center_?[0-9]{0,3}?/i))
            {
                center.set(_child.position.x, _child.position.y, _child.position.z)
            }

            if(_child instanceof THREE.Mesh)
            {
                // Find parser and use default if not found
                let parser = this.parsers.items.find((_item) => _child.name.match(_item.regex))
                if(typeof parser === 'undefined')
                {
                    parser = this.parsers.default
                }

                // Create mesh by applying parser
                const mesh = parser.apply(_child, _options)

                // Add to container
                container.add(mesh)
            }
        }

        // Recenter
        if(center.length() > 0)
        {
            for(const _child of container.children)
            {
                _child.position.sub(center)
            }

            container.position.add(center)
        }

        return container
    }

    add(_options)
    {
        const object = {}

        // Offset
        const offset = new THREE.Vector3()
        if(_options.offset)
        {
            offset.copy(_options.offset)
        }

        // Rotation
        const rotation = new THREE.Euler()
        if(_options.rotation)
        {
            rotation.copy(_options.rotation)
        }

        // Container
        object.container = this.getConvertedMesh(_options.base.children, _options)
        object.container.position.copy(offset)

        // Create physics object
        object.collision = this.physics.addObjectFromThree({
            meshes: [..._options.collision.children],
            offset,
            rotation,
            mass: _options.mass
        })

        for(const _child of object.container.children)
        {
            _child.position.sub(object.collision.center)
        }

        // Shadow
        // Add shadow
        if(_options.shadow)
        {
            this.shadows.add(object.container, _options.shadow)
        }

        // Time tick event
        this.time.on('tick', () =>
        {
            object.container.position.copy(object.collision.body.position)
            object.container.quaternion.copy(object.collision.body.quaternion)
        })

        // Save
        this.items.push(object)

        return object
    }
}
