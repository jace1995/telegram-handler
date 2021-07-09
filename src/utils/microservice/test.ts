import { startSocketMicroservice } from './server-socket'
import { connectMicroserviceSocket } from './client/socket'

(async () => {
  const server = await startSocketMicroservice(3000, data => data.toUpperCase())
  const client = await connectMicroserviceSocket(3000)

  console.log(await client.socket('hello socket'))

  server.close()
  client.close()
})()
