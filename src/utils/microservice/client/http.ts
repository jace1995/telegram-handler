import fetch from 'node-fetch'

export type MicroserviceHttp = (data: string) => Promise<string>

export const connectMicroserviceHttp = (port: number): MicroserviceHttp => (
  (data: string) => fetch(`http://localhost:${port}?data=${data}`).then(res => res.text())
)
