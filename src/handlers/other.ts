import { Handler } from '@jace1995/handler'
import { acceptCustomHandler } from '../start/accept-custom-handler'
import { ContextChat } from '../types/context'

import { AppContext, TelegramHandler, TelegramHandlerMap } from '../types/handlers'

export const other = <Context extends ContextChat>(
  handlers?: TelegramHandlerMap<AppContext<Context>>
): Handler<[AppContext]> => async (ctx: AppContext) => {
  await acceptCustomHandler(ctx, handlers as TelegramHandlerMap<AppContext>, ctx.user.action)
}
