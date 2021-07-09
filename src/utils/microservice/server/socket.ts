import * as SocketServer from 'socket.io'
import { MicroserviceServerHandler, MicroserviceSocketHandler } from './start'

const event = (handler: MicroserviceServerHandler) => async (
  data: string, response: (data: string) => void
) => {
  try {
    const resultData = await handler(data)
    response(resultData)
  } catch (e) {
    console.error(e)
  }
}

export const socketHandler: MicroserviceSocketHandler = handler => server => {
  const io = new SocketServer.Server(server)

  io.on('connect', (socket: SocketServer.Socket) => {
    socket.on('data', event(handler))
  })
}
