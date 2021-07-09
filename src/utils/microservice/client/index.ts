import { connectMicroserviceHttp } from './http'
import { MicroserviceSocketClient, connectMicroserviceSocket } from './socket'

export interface Microservice extends MicroserviceSocketClient {
  http(data: string): Promise<string>
}

export const connectMicroservice = async (port: number): Promise<Microservice> => {
  return {
    http: connectMicroserviceHttp(port),
    ...(await connectMicroserviceSocket(port)),
  }
}
