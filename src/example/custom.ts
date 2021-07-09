import { ContextButton, ContextChat, ContextCommand, ContextText } from '../types/context';
import { ApiInterface, UserInterface } from '../types/api'

// type ActionsHandlers<T> = {
//   [P in keyof T]: (ctx: T[P]) => void | Promise<void>
// }

type ChatContext = ContextChat

enum Action {
  start = 'start',
  info = 'info',
  admin = 'admin',
}

interface Payload {
  name: string
}

interface User<P = unknown> extends UserInterface {
  name: string
  payload: P
}

interface Api extends ApiInterface {
  step(): void
}

interface PayloadProvider<Payload> {
  payload: Payload
}

interface UserProvider<User> {
  user: User
}

interface ApiProvider<Api> {
  api: Api
}

interface ActionPayload {
  [Action.start]: number
  [Action.info]: string
  [Action.admin]: Payload
}

export type ActionsHandlers<
  Context extends ChatContext,
  Api extends ApiInterface,
  User extends UserInterface,
  ActionPayload extends Record<string, any>,
> = {
  [K in keyof ActionPayload]: (
    ctx: Context & ApiProvider<Api> & UserProvider<User & PayloadProvider<ActionPayload[K]>>
  ) => void | Promise<void>
}

type Handlers<Context extends ChatContext = ChatContext> = (
  ActionsHandlers<Context, Api, User, ActionPayload>
)

type H = Handlers['start']
