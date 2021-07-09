import { ApiInterface, UserInterface } from '../types/api'

export class ApiProviderMock<ID extends number = number> implements ApiInterface {
  private users: Record<ID, unknown>

  static connect<T extends object>(mock: T = {} as T) {
    return new Proxy(new ApiProviderMock() as T, {
      get(target, key) {
        if (key in target) {
          return target[key]
        }
        if (key in mock) {
          return mock[key]
        }
        throw new Error(`ApiProviderMock not implement property ${String(key)}`)
      }
    })
  }

  private constructor() {
    this.users = {} as Record<ID, unknown>
  }

  async auth<User extends UserInterface>(id: ID, user?: User) {
    if (user) {
      this.users[id] = user
    }
    return this.users[id] as User
  }
}
