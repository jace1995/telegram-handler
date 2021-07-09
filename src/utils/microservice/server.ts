import { startMicroserviceServer } from './server/start'
import { httpHandler } from './server/http'
import { socketHandler } from './server/socket'

export const startMicroservice = (port: number, handler: (data: string) => string) => (
  startMicroserviceServer({
    port,
    handler,
    http: httpHandler,
    socket: socketHandler,
  })
)
