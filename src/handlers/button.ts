import { ContextButton } from '../types/context'
import { acceptCustomHandler } from '../start/accept-custom-handler'
import { HandlerNotFoundError } from '../start/error-handler'
import { AppContext, TelegramHandler, TelegramHandlerMap } from '../types/handlers'
import { Handler } from '@jace1995/handler'

interface ButtonData {
  action: string
  payload: string
}

export const formatButtonData = <Data = unknown>(
  action: string,
  payload?: Data
): string => (
  action + ' ' + JSON.stringify(payload)
)

const parse = (json?: string) => {
  if (!json) {
    return json
  }
  try {
    return JSON.parse(json)
  } catch {
    return undefined
  }
}

const isInitialHandler = Symbol('is_initial_handler')

export const initialHandler = <T>(handler: T): T => {
  handler[isInitialHandler] = true
  return handler
}

export const button = (
  handlers?: TelegramHandlerMap<AppContext<ContextButton>>
): Handler<[AppContext]> => async (
  telegram: AppContext
) => {
  const request = telegram.callbackQuery?.data?.match(
    /^(?<action>\w+)( (?<payload>.*))?$/
  )?.groups as ButtonData | undefined

  if (!request) {
    throw new HandlerNotFoundError()
  }

  const ctx = telegram as AppContext<ContextButton>
  ctx.data = parse(request.payload)
  return acceptCustomHandler(ctx, handlers, request.action, (handler) => (
    handler[isInitialHandler] || ctx.user.action === request.action
  ))
}
