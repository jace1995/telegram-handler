

import { Locker, MemoryLocker } from './locker'
import { connectMicroserviceSocket, MicroserviceSocketClient } from './microservice/client/socket'
import { startSocketMicroservice } from './microservice/server-socket'

const defaultPort = 3296

enum ServiceLockerAction {
  lock,
  unlock,
}

interface ServiceLockerEvent<ID> {
  id: ID
  action: ServiceLockerAction
}

enum LockResponse {
  free,
  locked,
}

class ServiceLocker<ID> implements Locker<ID> {
  private locker: MicroserviceSocketClient

  constructor(locker: MicroserviceSocketClient) {
    this.locker = locker
  }

  async lock(id: ID) {
    const event: ServiceLockerEvent<ID> = { id, action: ServiceLockerAction.lock }
  
    const response: LockResponse = JSON.parse(
      await this.locker.socket(
        JSON.stringify(event)
      )
    )

    return response === LockResponse.locked
  }

  async unlock(id: ID) {
    const event: ServiceLockerEvent<ID> = { id, action: ServiceLockerAction.unlock }
    await this.locker.socket(
      JSON.stringify(event)
    )
  }
}

export const startServiceLocker = async <ID>(port: number = defaultPort) => {
  const locker = new MemoryLocker<ID>()

  await startSocketMicroservice(port, data => {
    const event: ServiceLockerEvent<ID> = JSON.parse(data)

    switch (event.action) {
      case ServiceLockerAction.lock:
        return (
          locker.lock(event.id) ?
            JSON.stringify(LockResponse.locked) :
            JSON.stringify(LockResponse.free)
        )

      case ServiceLockerAction.unlock:
        return (() => {
          locker.unlock(event.id)
          return ''
        })()
    }
  })

  console.log(`microservice "service locker" started on port ${port}`)
}

export const connectServiceLocker = async <ID>(port: number = defaultPort) => (
  new ServiceLocker<ID>(
    await connectMicroserviceSocket(port)
  )
)
