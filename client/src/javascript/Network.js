import { io } from 'socket.io-client'
import EventEmitter from './Utils/EventEmitter.js'

export default class Network extends EventEmitter
{
    constructor()
    {
        super()

        this.socket   = null
        this.localId  = null
        this.latency  = 0
        this._pingInterval = null
    }

    connect(serverUrl = '/')
    {
        this.socket = io(serverUrl, { autoConnect: true })

        this.socket.on('connect', () =>
        {
            console.log('[network] connected id=', this.socket.id)
            this.trigger('connected')
        })

        this.socket.on('disconnect', () =>
        {
            console.warn('[network] disconnected')
            this.trigger('disconnected')
        })

        this.socket.on('room:joined', ({ id, existingPlayers, spawnPos }) =>
        {
            console.log('[network] room:joined — my id=', id, 'existing=', existingPlayers, 'spawnPos=', spawnPos)
            this.localId  = id
            this.spawnPos = spawnPos   // { x, y } — used by World to position local car
            this.trigger('room:joined', [{ id, existingPlayers, spawnPos }])
        })

        this.socket.on('room:full', () =>
        {
            this.trigger('room:full')
        })

        this.socket.on('player:joined', (data) =>
        {
            console.log('[network] player:joined —', data)
            this.trigger('player:joined', [data])
        })

        this.socket.on('player:left', (data) =>
        {
            this.trigger('player:left', [data])
        })

        this.socket.on('world:snapshot', (snapshot) =>
        {
            // Log first snapshot only
            if(!this._snapshotLogged)
            {
                this._snapshotLogged = true
                console.log('[network] first world:snapshot — cars:', snapshot.cars?.length, snapshot.cars?.map(c => c.id))
            }
            this.trigger('world:snapshot', [snapshot])
        })

        this.socket.on('player:bumped', (data) =>
        {
            this.trigger('player:bumped', [data])
        })

        this.socket.on('chat:message', (data) =>
        {
            this.trigger('chat:message', [data])
        })

        // Latency measurement
        this._pingInterval = setInterval(() =>
        {
            const start = Date.now()
            this.socket.emit('ping', () =>
            {
                this.latency = Date.now() - start
            })
        }, 2000)
    }

    join(name, carColor, carType = 'default')
    {
        this.localPlayerName = name
        this.socket.emit('player:join', { name, carColor, carType })
    }

    sendInput(actions)
    {
        // Only emit — no return value needed
        this.socket.emit('player:input', actions)
    }

    sendSnapshot(state)
    {
        // Send our own physics state so server can relay it to remote players
        this.socket.emit('player:snapshot', state)
    }

    sendBump(targetId, fromPos)
    {
        this.socket.emit('player:bump', { targetId, fromPos })
    }

    sendChat(text)
    {
        this.socket.emit('chat:message', { text })
    }

    playerReady()
    {
        // Called when the local car wakes up (reveal.go setTimeout fires)
        // Server resets its car to the same spawn position so both fall simultaneously
        this.socket.emit('player:ready')
    }

    disconnect()
    {
        clearInterval(this._pingInterval)
        this.socket?.disconnect()
    }
}
