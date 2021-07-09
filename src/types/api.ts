export interface UserInterface {
  action?: string,
  payload: unknown,
}

export interface ApiInterface<User extends UserInterface = UserInterface, ID = number> {
  auth(id: ID, user?: User): Promise<User>
}
