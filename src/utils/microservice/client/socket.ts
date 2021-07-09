import * as socketClient from 'socket.io-client'

export interface MicroserviceSocketClient {
  socket(data: string): Promise<string>
  close(): SocketIOClient.Socket
}

export const connectMicroserviceSocket = (port: number) => (
  new Promise<MicroserviceSocketClient>(
    async resolve => {
      const url = `http://localhost:${port}`
      const io = socketClient(url)

      const client: MicroserviceSocketClient = {
        socket: (data: string) => new Promise(resolve => {
          io.emit('data', data, resolve)
        }),
        close: () => io.disconnect(),
      }

      io.on('connect', () => {
        resolve(client)
      })
    }
  )
)
