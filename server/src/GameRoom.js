import CANNON from 'cannon'
import { PhysicsWorld } from './PhysicsWorld.js'
import { NETWORK, SPAWN_GRID } from '../../shared/constants.js'

const { tickRate, physicsRate, maxPlayers } = NETWORK

export class GameRoom {
  constructor(io) {
    this.io      = io
    this.physics = new PhysicsWorld()
    this.players = new Map() // socketId → { id, name, carColor, actions }

    this._startLoop()
    this._setupSocketEvents()
  }

  _setupSocketEvents() {
    this.io.on('connection', (socket) => {
      if (this.players.size >= maxPlayers) {
        socket.emit('room:full')
        socket.disconnect()
        return
      }

      console.log(`[+] ${socket.id}`)

      socket.on('ping', (cb) => { if(typeof cb === 'function') cb() })

      socket.on('player:join', ({ name, carColor, carType }) => {
        const spawnPos = this._getSpawnPosition()
        this.physics.addCar(socket.id, spawnPos)

        this.players.set(socket.id, {
          id:       socket.id,
          name:     name || 'Anonymous',
          carColor: carColor ?? 0,
          carType:  carType || 'default',
          actions:  { up: false, down: false, left: false, right: false, brake: false, boost: false },
          spawnXY:  { x: spawnPos.x, y: spawnPos.y },
        })

        // Send existing players to new joiner
        const existingPlayers = [...this.players.values()]
          .filter(p => p.id !== socket.id)
          .map(({ id, name, carColor, carType }) => ({ id, name, carColor, carType }))

        // Include spawn position so client can initialise the local car at the same spot
        socket.emit('room:joined', { id: socket.id, existingPlayers, spawnPos: { x: spawnPos.x, y: spawnPos.y } })

        // Notify everyone else
        socket.broadcast.emit('player:joined', {
          id: socket.id,
          name: name || 'Anonymous',
          carColor: carColor ?? 0,
          carType:  carType || 'default',
        })

        console.log(`[join] ${name} (${socket.id}) — ${this.players.size} online`)
      })

      socket.on('player:ready', () => {
        // Client reveal animation just started — reset server car to spawn z=12 so both fall together
        const car    = this.physics.cars.get(socket.id)
        const player = this.players.get(socket.id)
        if (car && player) {
          const { x, y } = player.spawnXY
          car.chassis.position.set(x, y, 12)
          car.chassis.velocity.set(0, 0, 0)
          car.chassis.angularVelocity.set(0, 0, 0)
          car.chassis.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), 0)
          console.log(`[ready] ${player.name} — car reset to (${x.toFixed(2)}, ${y.toFixed(2)}, 12)`)
        }
      })

      socket.on('player:input', (actions) => {
        const player = this.players.get(socket.id)
        if (player) player.actions = actions
      })

      socket.on('player:bump', ({ targetId, fromPos }) => {
        // Relay bump to the target player so their car reacts too
        const targetSocket = this.io.sockets.sockets.get(targetId)
        if (targetSocket) {
          targetSocket.emit('player:bumped', { fromId: socket.id, fromPos })
        }
      })

      socket.on('chat:message', ({ text }) => {
        const player = this.players.get(socket.id)
        if (!player || !text || typeof text !== 'string') return
        const clean = text.slice(0, 120).trim()
        if (!clean) return
        // Broadcast to everyone else
        socket.broadcast.emit('chat:message', {
          name: player.name,
          text: clean,
          color: player.carColor ?? 0,
        })
      })

      socket.on('player:snapshot', (state) => {
        // Client sends its own authoritative physics state.
        // We cache it and use it in world:snapshot broadcasts so that remote
        // players see exactly the same thing as the local player.
        const player = this.players.get(socket.id)
        if (player) player.clientSnapshot = state
      })

      socket.on('disconnect', () => {
        this.physics.removeCar(socket.id)
        const player = this.players.get(socket.id)
        this.players.delete(socket.id)
        this.io.emit('player:left', { id: socket.id })
        console.log(`[-] ${player?.name ?? socket.id} — ${this.players.size} online`)
      })
    })
  }

  _startLoop() {
    const physicsInterval  = 1000 / physicsRate
    const broadcastInterval = 1000 / tickRate
    let last             = Date.now()
    let broadcastAccum   = 0

    setInterval(() => {
      const now   = Date.now()
      const delta = (now - last) / 1000
      last = now

      // Apply inputs
      for (const [id, player] of this.players) {
        this.physics.applyInputs(id, player.actions)
      }

      // Step physics
      this.physics.step(delta)

      // Broadcast at tickRate — use client-reported snapshots so remote players
      // see exactly what the local player sees (same physics, no server divergence).
      broadcastAccum += delta * 1000
      if (broadcastAccum >= broadcastInterval) {
        broadcastAccum -= broadcastInterval
        const cars = []
        for (const [id, player] of this.players) {
          if (player.clientSnapshot) {
            cars.push({ id, ...player.clientSnapshot })
          }
        }
        if (cars.length > 0) {
          this.io.emit('world:snapshot', { t: now, cars })
        }
      }
    }, physicsInterval)
  }

  _getSpawnPosition() {
    // Assign grid slot based on current player count (wraps if full)
    const slot = this.players.size % SPAWN_GRID.length
    const { x, y } = SPAWN_GRID[slot]
    return { x, y, z: 12 }
  }
}
