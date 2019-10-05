import * as THREE from 'three'

export default class Walls
{
    constructor(_options)
    {
        // Options
        this.resources = _options.resources
        this.objects = _options.objects
    }

    add(_options)
    {
        const wall = {}
        wall.coordinates = []
        wall.items = []

        const shape = _options.shape
        let widthCount = shape.widthCount
        let heightCount = shape.heightCount

        switch(_options.shape.type)
        {
            case 'rectangle':
            case 'brick':
                for(let i = 0; i < heightCount; i++)
                {
                    const lastLine = i === heightCount - 1
                    let j = 0
                    let widthCountTemp = widthCount

                    if(_options.shape.type === 'brick' && lastLine && _options.shape.equilibrateLastLine)
                    {
                        if(i % 2 === 0)
                        {
                            widthCountTemp--
                        }
                        else
                        {
                            j++
                        }
                    }

                    for(; j < widthCountTemp; j++)
                    {
                        const offset = new THREE.Vector3()
                        offset.add(shape.offsetWidth.clone().multiplyScalar(j - (shape.widthCount - 1) * 0.5))
                        offset.add(shape.offsetHeight.clone().multiplyScalar(i))
                        offset.x += (Math.random() - 0.5) * shape.randomOffset.x
                        offset.y += (Math.random() - 0.5) * shape.randomOffset.y
                        offset.z += (Math.random() - 0.5) * shape.randomOffset.z

                        if(_options.shape.type === 'brick' && i % 2 === 0)
                        {
                            offset.add(shape.offsetWidth.clone().multiplyScalar(0.5))
                        }

                        const rotation = new THREE.Euler()
                        rotation.x += (Math.random() - 0.5) * shape.randomRotation.x
                        rotation.y += (Math.random() - 0.5) * shape.randomRotation.y
                        rotation.z += (Math.random() - 0.5) * shape.randomRotation.z

                        wall.coordinates.push({
                            offset,
                            rotation
                        })
                    }
                }

                break

            case 'triangle':
                heightCount = shape.widthCount
                for(let i = 0; i < heightCount; i++)
                {
                    for(let j = 0; j < widthCount; j++)
                    {
                        const offset = new THREE.Vector3()
                        offset.add(shape.offsetWidth.clone().multiplyScalar(j - (shape.widthCount - 1) * 0.5))
                        offset.add(shape.offsetWidth.clone().multiplyScalar(i * 0.5))
                        offset.add(shape.offsetHeight.clone().multiplyScalar(i))
                        offset.x += (Math.random() - 0.5) * shape.randomOffset.x
                        offset.y += (Math.random() - 0.5) * shape.randomOffset.y
                        offset.z += (Math.random() - 0.5) * shape.randomOffset.z

                        if(_options.shape.type === 'brick' && i % 2 === 0)
                        {
                            offset.add(shape.offsetWidth.clone().multiplyScalar(0.5))
                        }

                        const rotation = new THREE.Euler()
                        rotation.x += (Math.random() - 0.5) * shape.randomRotation.x
                        rotation.y += (Math.random() - 0.5) * shape.randomRotation.y
                        rotation.z += (Math.random() - 0.5) * shape.randomRotation.z


                        wall.coordinates.push({
                            offset,
                            rotation
                        })
                    }

                    widthCount--
                }

                break
        }

        for(const _coordinates of wall.coordinates)
        {
            const objectOptions = { ..._options.object }
            objectOptions.offset = _options.object.offset.clone().add(_coordinates.offset).add(shape.position)
            objectOptions.rotation = _options.object.rotation.clone()
            objectOptions.rotation.x += _coordinates.rotation.x
            objectOptions.rotation.y += _coordinates.rotation.y
            objectOptions.rotation.z += _coordinates.rotation.z
            wall.items.push(this.objects.add(objectOptions))
        }

        return wall
    }
}
