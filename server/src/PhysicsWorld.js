import CANNON from 'cannon'
import { PHYSICS } from '../../shared/constants.js'
import { PlayerCar } from './PlayerCar.js'

export class PhysicsWorld {
  constructor() {
    this.world = new CANNON.World()
    this.world.gravity.set(
      PHYSICS.gravity.x,
      PHYSICS.gravity.y,
      PHYSICS.gravity.z
    )
    this.world.broadphase = new CANNON.SAPBroadphase(this.world)
    this.world.allowSleep = true
    this.world.defaultContactMaterial.restitution = PHYSICS.defaultRestitution

    this.cars = new Map() // playerId → PlayerCar

    this._setupFloor()
  }

  _setupFloor() {
    const floorBody = new CANNON.Body({ mass: 0 })
    floorBody.addShape(new CANNON.Plane())
    this.world.addBody(floorBody)
  }

  addCar(playerId, spawnPosition) {
    const car = new PlayerCar(this.world, spawnPosition)
    this.cars.set(playerId, car)
    return car
  }

  removeCar(playerId) {
    const car = this.cars.get(playerId)
    if (car) {
      car.removeFromWorld(this.world)
      this.cars.delete(playerId)
    }
  }

  applyInputs(playerId, actions) {
    const car = this.cars.get(playerId)
    if (car) car.applyActions(actions)
  }

  step(delta) {
    this.world.step(1 / 60, delta, 3)
  }

  getSnapshot() {
    const snapshot = []
    for (const [id, car] of this.cars) {
      snapshot.push({ id, ...car.getState() })
    }
    return snapshot
  }
}
