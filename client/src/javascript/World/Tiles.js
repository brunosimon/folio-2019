import * as THREE from 'three'

export default class Tiles
{
    constructor(_options)
    {
        // Options
        this.resources = _options.resources
        this.objects = _options.objects
        this.debug = _options.debug

        // Set up
        this.items = []
        this.interDistance = 1.5
        this.tangentDistance = 0.3
        this.positionRandomess = 0.3
        this.rotationRandomess = 0.1

        this.setModels()
    }

    setModels()
    {
        this.models = {}

        this.models.items = [
            {
                base: this.resources.items.tilesABase.scene,
                collision: this.resources.items.tilesACollision.scene,
                chances: 8
            },
            {
                base: this.resources.items.tilesBBase.scene,
                collision: this.resources.items.tilesBCollision.scene,
                chances: 1
            },
            {
                base: this.resources.items.tilesCBase.scene,
                collision: this.resources.items.tilesCCollision.scene,
                chances: 2
            },
            {
                base: this.resources.items.tilesDBase.scene,
                collision: this.resources.items.tilesDCollision.scene,
                chances: 4
            },
            {
                base: this.resources.items.tilesEBase.scene,
                collision: this.resources.items.tilesECollision.scene,
                chances: 2
            }
        ]

        const totalChances = this.models.items.reduce((_totalChances, _item) => _totalChances + _item.chances, 0)
        let chances = 0
        this.models.items = this.models.items.map((_item) =>
        {
            // Update chances
            _item.minChances = chances

            chances += _item.chances / totalChances
            _item.maxChances = chances

            // Update rotation
            _item.rotationIndex = 0

            return _item
        })

        this.models.pick = () =>
        {
            const random = Math.random()
            const model =  this.models.items.find((_item) => random >= _item.minChances && random <= _item.maxChances)
            model.rotationIndex++

            if(model.rotationIndex > 3)
            {
                model.rotationIndex = 0
            }

            return model
        }
    }

    add(_options)
    {
        const tilePath = {}
        tilePath.start = _options.start
        tilePath.delta = _options.delta

        tilePath.distance = tilePath.delta.length()
        tilePath.count = Math.floor(tilePath.distance / this.interDistance)
        tilePath.directionVector = tilePath.delta.clone().normalize()
        tilePath.interVector = tilePath.directionVector.clone().multiplyScalar(this.interDistance)
        tilePath.centeringVector = tilePath.delta.clone().sub(tilePath.interVector.clone().multiplyScalar(tilePath.count))
        tilePath.tangentVector = tilePath.directionVector.clone().rotateAround(new THREE.Vector2(0, 0), Math.PI * 0.5).multiplyScalar(this.tangentDistance)
        tilePath.angle = tilePath.directionVector.angle()

        // Create tiles
        for(let i = 0; i < tilePath.count; i++)
        {
            // Model
            const model = this.models.pick()

            // Position
            const position = tilePath.start.clone().add(tilePath.interVector.clone().multiplyScalar(i)).add(tilePath.centeringVector)
            position.x += (Math.random() - 0.5) * this.positionRandomess
            position.y += (Math.random() - 0.5) * this.positionRandomess

            const tangent = tilePath.tangentVector

            if(i % 1 === 0)
            {
                tangent.negate()
            }

            position.add(tangent)

            // Rotation
            let rotation = tilePath.angle
            rotation += (Math.random() - 0.5) * this.rotationRandomess
            rotation += model.rotationIndex / 4 * Math.PI * 2

            // Tile
            this.objects.add({
                base: model.base,
                collision: model.collision,
                offset: new THREE.Vector3(position.x, position.y, 0),
                rotation: new THREE.Euler(0, 0, rotation),
                duplicated: true,
                mass: 0
            })
        }
    }
}
