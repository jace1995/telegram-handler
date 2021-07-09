import { startMicroserviceServer, MicroserviceServerHandler } from './server/start'
import { httpHandler } from './server/http'

export const startHttpMicroservice = (port: number, handler: MicroserviceServerHandler) => (
  startMicroserviceServer({
    port,
    handler,
    http: httpHandler,
  })
)
