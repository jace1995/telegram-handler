import { appendFile } from 'fs'
import { TelegrafContext } from 'telegraf/typings/context'

export class PreventAction extends Error {}
export class DialogPrevented extends Error {}
export class HandlerNotFoundError extends Error {
  constructor(action?: string) {
    super(
      'handler not found' + 
      (action ? ` for action "${action}"` : '')
    )
  }
}

export type TelegramBotErrorHandler = (e: any, ctx: TelegrafContext) => void
export type ContextErrorHandler = (e: any) => void
export type ContextErrorHandlerProvider = (ctx: TelegrafContext) => (e: any) => void

const defaultErrorFilePath = './errors.txt'

export const initOnError = (
  errorMessage = 'error', errorFile?: string | boolean
) => async (
  e: any, ctx: TelegrafContext
) => {
  if (typeof e === 'object' && e instanceof PreventAction) {
    return
  }

  ctx.reply(errorMessage).catch(e => console.error(e))

  if (typeof e === 'object' && e instanceof DialogPrevented) {
    return
  }

  const message = (
    typeof e === 'object' && e instanceof HandlerNotFoundError ?
      e.message :
      String(e)
  )

  console.error(message)

  if (errorFile) {
    appendFile(
      typeof errorFile === 'string' ?
        errorFile :
        defaultErrorFilePath,
        String(new Date()) + '\n' + String(e) + '\n\n',
      e => e && console.error(e),
    )
  }
}
