import CANNON from 'cannon'
import { PHYSICS } from '../../shared/constants.js'

const { car: C } = PHYSICS

export class PlayerCar {
  constructor(world, spawnPos = { x: 0, y: 0, z: 12 }) {
    // ── Chassis ─────────────────────────────────────────────────────────────
    // Mirrors client Physics.js exactly:
    //   - Body-local axes: X=depth(forward), Y=width(right), Z=up
    //   - Shape offset (0,0,0.41) raises the box so wheel raycasts reach the floor
    //   - Initial rotation: -90° around Z (same as client)
    this.chassis = new CANNON.Body({ mass: C.mass })
    this.chassis.allowSleep = false
    this.chassis.addShape(
      new CANNON.Box(new CANNON.Vec3(
        C.chassisHalfSize.x,
        C.chassisHalfSize.y,
        C.chassisHalfSize.z
      )),
      new CANNON.Vec3(C.chassisOffset.x, C.chassisOffset.y, C.chassisOffset.z)
    )
    this.chassis.position.set(spawnPos.x, spawnPos.y, spawnPos.z)
    // Same initial rotation as client — makes forward = -Y in world, right = +X
    this.chassis.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    world.addBody(this.chassis)

    // ── RaycastVehicle ───────────────────────────────────────────────────────
    // No explicit axis indices → uses cannon.js defaults:
    //   indexRightAxis=1(Y), indexForwardAxis=0(X), indexUpAxis=2(Z)
    // This matches what client Physics.js uses (also no explicit axes).
    this.vehicle = new CANNON.RaycastVehicle({
      chassisBody: this.chassis,
    })

    this._addWheels()
    this.vehicle.addToWorld(world)
  }

  _addWheels() {
    const w = C.wheel
    // axleLocal=(0,1,0) matches client Physics.js
    const base = {
      radius:                          w.radius,
      directionLocal:                  new CANNON.Vec3(0, 0, -1),
      suspensionStiffness:             w.suspensionStiffness,
      suspensionRestLength:            w.suspensionRestLength,
      frictionSlip:                    w.frictionSlip,
      dampingRelaxation:               w.dampingRelaxation,
      dampingCompression:              w.dampingCompression,
      maxSuspensionForce:              w.maxSuspensionForce,
      rollInfluence:                   w.rollInfluence,
      axleLocal:                       new CANNON.Vec3(0, 1, 0),
      chassisConnectionPointLocal:     new CANNON.Vec3(),
      maxSuspensionTravel:             w.maxSuspensionTravel,
      customSlidingRotationalSpeed:    w.customSlidingRotationalSpeed,
      useCustomSlidingRotationalSpeed: true,
    }

    for (const pos of C.wheelPositions) {
      base.chassisConnectionPointLocal.set(pos.x, pos.y, pos.z)
      this.vehicle.addWheel({ ...base })
    }
  }

  applyActions(actions) {
    const { maxForce, boostForce, maxBrake, maxSteer } = C.controls

    // Mirror client Physics.js exactly:
    //   accelerating is positive for forward, applied as NEGATIVE to engine
    const force        = actions.boost ? boostForce : maxForce
    const accelerating = actions.up ? force : actions.down ? -force * 0.5 : 0
    const engine       = -accelerating   // same sign convention as client

    const brake = actions.brake ? maxBrake : 0

    // Steering: positive when left, applied as NEGATIVE (same as client)
    const steering = actions.left ? maxSteer : actions.right ? -maxSteer : 0
    const steer    = -steering

    // Drive rear wheels (2=backLeft, 3=backRight — same indices as client)
    this.vehicle.applyEngineForce(engine, 2)
    this.vehicle.applyEngineForce(engine, 3)

    // Brake all wheels
    for (let i = 0; i < 4; i++) this.vehicle.setBrake(brake, i)

    // Steer front wheels (0=frontLeft, 1=frontRight — same indices as client)
    this.vehicle.setSteeringValue(steer, 0)
    this.vehicle.setSteeringValue(steer, 1)
  }

  getState() {
    const p  = this.chassis.position
    const q  = this.chassis.quaternion
    const v  = this.chassis.velocity
    const av = this.chassis.angularVelocity

    return {
      pos:    [p.x,  p.y,  p.z],
      quat:   [q.x,  q.y,  q.z,  q.w],
      vel:    [v.x,  v.y,  v.z],
      angVel: [av.x, av.y, av.z],
      wheels: this.vehicle.wheelInfos.map(w => {
        const wp = w.worldTransform.position
        const wq = w.worldTransform.quaternion
        return {
          pos:  [wp.x, wp.y, wp.z],
          quat: [wq.x, wq.y, wq.z, wq.w],
        }
      }),
    }
  }

  removeFromWorld(world) {
    this.vehicle.removeFromWorld(world)
    world.remove(this.chassis)
  }
}
