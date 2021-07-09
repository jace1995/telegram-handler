import { Handler } from '@jace1995/handler'
import { TelegramHandler, AppContext, TelegramHandlers, TelegramHandlerMap } from '../types/handlers'
import { DialogPrevented, HandlerNotFoundError } from './error-handler'

export const acceptCustomHandler = async <Context extends AppContext>(
  ctx: Context,
  handlers?: TelegramHandlerMap<Context>,
  action?: string,
  condition?: (handler: Handler<[Context]>) => boolean
) => {
  if (!action || !handlers || !(action in handlers) || typeof handlers[action] !== 'function') {
    throw new HandlerNotFoundError(action)
  }

  const handler = handlers[action]

  if (condition?.(handler) === false) {
    throw new DialogPrevented()
  }
  
  return handler(ctx)
}
