import { ContextButton, ContextChat, ContextCommand, ContextDocument, ContextPhoto, ContextText } from '../types/context'
import { command } from './command'
import { button } from './button'
import { other } from './other'
import { AppContext, TelegramHandlers } from '../types/handlers'
import { TelegramAction } from '../types/actions'
import { Handler } from '@jace1995/handler'
// const t: ActionsHandlers<ContextCommand> | undefined = handlers[TelegramAction.command];

export const telegramEventHandlers = (
  handlers: Partial<TelegramHandlers>
): Record<TelegramAction, Handler<[AppContext]>> => ({
  [TelegramAction.text]: other(handlers[TelegramAction.text]),
  [TelegramAction.command]: command(handlers[TelegramAction.command]),
  [TelegramAction.button]: button(handlers[TelegramAction.button]),

  [TelegramAction.photo]: other<ContextPhoto>(handlers[TelegramAction.photo]),
  [TelegramAction.document]: other<ContextDocument>(handlers[TelegramAction.document]),
})
