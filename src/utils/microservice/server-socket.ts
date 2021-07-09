import { startMicroserviceServer, MicroserviceServerHandler } from './server/start'
import { socketHandler } from './server/socket'

export const startSocketMicroservice = (port: number, handler: MicroserviceServerHandler) => (
  startMicroserviceServer({
    port,
    handler,
    socket: socketHandler,
  })
)
