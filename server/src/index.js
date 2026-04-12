import { createServer } from 'http'
import { Server } from 'socket.io'
import { GameRoom } from './GameRoom.js'

const PORT = process.env.PORT || 3001

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: { origin: '*' }
})

const room = new GameRoom(io)

httpServer.listen(PORT, () => {
  console.log(`[server] running on :${PORT}`)
})
