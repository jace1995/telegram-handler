export interface Locker<ID = unknown> {
  lock(id: ID): boolean | Promise<boolean>
  unlock(id: ID): void | Promise<void>
}

export class LockerHandler<ID> {
  private locker: Locker<ID>

  constructor(locker: Locker<ID>) {
    this.locker = locker
  }

  async handle(id: ID, handler: () => unknown) {
    try {
      const passed = await this.locker.lock(id)
  
      if (!passed) {
        return
      }

      await handler()

      try {
        await this.locker.unlock(id)
      } catch (e) {
        console.error(e)
      }
    }
    catch (e) {
      throw e
    }
  }
}

export class MemoryLocker<ID> implements Locker<ID> {
  private locker: Set<ID>

  constructor() {
    this.locker = new Set()
  }

  lock(id: ID): boolean {
    if (this.locker.has(id)) {
      return false
    }

    this.locker.add(id)

    return true
  }

  unlock(id: ID): void {
    this.locker.delete(id)
  }
}
