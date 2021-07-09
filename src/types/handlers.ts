import { UserInterface, ApiInterface } from './api'
import { TelegramAction } from './actions'
import {
  ContextChat,
  ContextText,
  ContextCommand,
  ContextButton,
  ContextPhoto,
  ContextDocument,
} from './context'

// ?? file data

export interface PayloadProvider<Payload = unknown> {
  payload: Payload
}

export interface UserProvider<User extends UserInterface = UserInterface> {
  user: User
}

export interface ApiProvider<Api extends ApiInterface = ApiInterface> {
  api: Api
}

// ?? file context

export type AppContext<Context extends ContextChat = ContextChat> = (
  Context & ApiProvider & UserProvider
)

export interface TelegramContext {
  [TelegramAction.text]: ContextText
  [TelegramAction.command]: ContextCommand
  [TelegramAction.button]: ContextButton<any>
  [TelegramAction.photo]: ContextPhoto
  [TelegramAction.document]: ContextDocument
}

export type TelegramAppContext<
  Context extends ContextChat,
  Payload = unknown,
  Api extends ApiInterface = ApiInterface,
  User extends UserInterface = UserInterface,
> = (
  Context &
  ApiProvider<Api> &
  UserProvider<User & PayloadProvider<Payload>>
)

// handlers

export type TelegramHandler<
  Context extends ContextChat,
  Api extends ApiInterface = ApiInterface,
  User extends UserInterface = UserInterface,
  Payload = unknown,
> = (
  ctx: (
    Context &
    ApiProvider<Api> &
    UserProvider<
      User &
      PayloadProvider<Payload>
    >
  )
) => void | Promise<void>

export type TelegramHandlerMap<
  Context extends ContextChat = ContextChat,
  Api extends ApiInterface = ApiInterface,
  User extends UserInterface = UserInterface,
> = Record<string, TelegramHandler<Context, Api, User>>

export type TelegramHandlers<
  Api extends ApiInterface = ApiInterface,
  User extends UserInterface = UserInterface,
  Payload = any,
> = {
  [K in keyof TelegramContext]: Record<
    string,
    TelegramHandler<TelegramContext[K], Api, User, Payload>
  >
}

export type TelegramActionsHandlers<
  Action extends string,
  Context extends ContextChat,
  Api extends ApiInterface = ApiInterface,
  User extends UserInterface = UserInterface,
  ActionPayloadMap extends Record<string, any> = Record<Action, any>
> = TelegramHandler<
  Context,
  Api,
  User,
  Action extends keyof ActionPayloadMap ? ActionPayloadMap[Action] : unknown
>
