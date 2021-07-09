import { ContextChat, ContextCommand } from '../types/context'
import { acceptCustomHandler } from '../start/accept-custom-handler'
import { HandlerNotFoundError } from '../start/error-handler'
import { TelegramHandler, AppContext, TelegramHandlerMap } from '../types/handlers'
import { Handler } from '@jace1995/handler'

export interface CommandData {
  command: string
  payload?: string
}

export const command = (
  handlers?: TelegramHandlerMap<AppContext<ContextCommand>>
): Handler<[AppContext]> => async (
  telegram: AppContext
) => {
  const request = telegram.message?.text?.match(
    /^\/(?<command>[\w]+)( (?<payload>.*))?$/
  )?.groups as CommandData | undefined

  if (!request) {
    throw new HandlerNotFoundError()
  }

  const ctx = telegram as AppContext<ContextCommand>
  ctx.data = request.payload
  return acceptCustomHandler(ctx, handlers, request.command)
}
