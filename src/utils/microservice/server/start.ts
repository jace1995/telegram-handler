import * as NodeHttp from 'http'

export type MicroserviceServerHandler = (data: string) => string | Promise<string>

export type MicroserviceHttpHandler = (
  handler: MicroserviceServerHandler
) => (
  request: NodeHttp.IncomingMessage,
  response: NodeHttp.ServerResponse,
) => void

export type MicroserviceSocketHandler = (
  handler: MicroserviceServerHandler
) => (
  server: NodeHttp.Server
) => void

export interface StartMicroserviceProps {
  port: number
  http?: MicroserviceHttpHandler
  socket?: MicroserviceSocketHandler
  handler: MicroserviceServerHandler
}

export const startMicroserviceServer = ({
  port,
  http,
  socket,
  handler,
}: StartMicroserviceProps) => (
  new Promise<NodeHttp.Server>(async resolve => {
    const server = NodeHttp.createServer(http?.(handler))
    socket?.(handler)(server)
    server.listen(port, () => resolve(server))
  })
)
