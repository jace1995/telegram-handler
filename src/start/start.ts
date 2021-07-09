import Telegraf from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import * as cluster from 'cluster'

import { loadPropertyRequired } from '@jace1995/load-config'
import { startHandler } from '@jace1995/handler'

import { attachBotEventsHandlers } from './bot-events-handler'
import { Locker, MemoryLocker } from '../utils/locker'
import { telegramEventHandlers } from '../handlers'
import { initOnError, TelegramBotErrorHandler, ContextErrorHandler, ContextErrorHandlerProvider } from './error-handler'
import { ApiProviderMock } from './data-provider-mock'
import { ApiInterface, UserInterface } from '../types/api'
import { ApiProvider, AppContext, TelegramHandlers, UserProvider } from '../types/handlers'
import { TelegramAction } from '../types/actions'
import { startMasterWebhookService, startWebhookHandler } from './webhook'
import { connectServiceLocker } from '../utils/locker-service'
import { ContextChat } from '../types/context'

export interface TelegramBotAdvancedSettings {
  name?: string
  tokenPropertyName?: string
  
  errorFile?: string | boolean

  sslFolder?: string
  lockerPort?: number
  webhookPort?: number
  webhookIP?: string
  workersCount?: number

  locker?: Locker<number>
  bot?: Telegraf<TelegrafContext>
}

export interface TelegramBotSettings<
  Api extends ApiInterface = ApiInterface,
  User extends UserInterface = UserInterface,
> {
  handlers: Partial<TelegramHandlers<Api, User>>
  api?: ApiInterface
  errorMessage?: string
  webhook?: string

  onEvent?: (
    ctx: ContextChat & ApiProvider<Api>,
    errorHandler: ContextErrorHandler
  ) => boolean | Promise<boolean>
  onAuth?: (
    ctx: ContextChat & ApiProvider<Api> & UserProvider<User>,
    errorHandler: ContextErrorHandler
  ) => boolean | Promise<boolean>
  onHandle?: (
    ctx: ContextChat & ApiProvider<Api> & UserProvider<User>,
    errorHandler: ContextErrorHandler
  ) => void | Promise<void>

  mock?: object
  token?: string
  advanced?: TelegramBotAdvancedSettings
}

export const startTelegramBot = async <
  Api extends ApiInterface,
  User extends UserInterface,
>(
  settings: TelegramBotSettings<Api, User>
): Promise<Telegraf<any>> => {
  const token = settings.token ?? loadPropertyRequired(
    settings.advanced?.tokenPropertyName ?? 'TELEGRAM_BOT_TOKEN'
  )

  const bot = settings.advanced?.bot ?? new Telegraf(token)

  if (settings.webhook && cluster.isMaster) {
    await startMasterWebhookService(bot, token, settings.webhook, settings)
    return bot
  }

  const customActionsHandlers = settings.handlers as Partial<TelegramHandlers>

  const api = (
    settings.mock ?
      ApiProviderMock.connect(settings.mock as ApiInterface) :
      settings.api ?? ApiProviderMock.connect<ApiInterface>()
  )

  const locker = settings.advanced?.locker ?? (
    settings.webhook ?
      await connectServiceLocker(settings.advanced?.lockerPort) :
      new MemoryLocker<number>()
  )

  const errorHandler = initOnError(
    settings.errorMessage ?? 'error',
    !!settings.webhook || settings.advanced?.errorFile
  )

  const errorContextHandler: ContextErrorHandlerProvider = ctx => e => errorHandler(e, ctx)

  startHandler<TelegramAction, [AppContext]>({
    create: handle => attachBotEventsHandlers(
      bot, api, customActionsHandlers, errorContextHandler,
      settings.onEvent as TelegramBotSettings['onEvent'],
      settings.onAuth as TelegramBotSettings['onAuth'],
      (event, ctx) => {
        if (ctx) {
          handle(event, ctx)
        }
      }
    ),
    handlers: telegramEventHandlers(customActionsHandlers),
    before: ctx => (
      locker.lock(ctx.chat.id)
    ),
    after: async ctx => {
      if (settings.onHandle) {
        await settings.onHandle(
          ctx as ContextChat & ApiProvider<Api> & UserProvider<User>,
          errorContextHandler(ctx)
        )
      }
      await locker.unlock(ctx.chat.id)
    },
    onError: errorHandler,
  })

  const botName = settings.advanced?.name
  const botStartedMessage = `Bot ${botName ? `"${botName}" ` : ''}started 🚀`

  if (!settings.advanced?.bot) {
    if (settings.webhook) {
      const isMaster = await startWebhookHandler(bot, token, settings)

      if (isMaster) {
        console.log(botStartedMessage)
      }
    }
    else {
      await bot.telegram.deleteWebhook()
      bot.startPolling()
      console.log(botStartedMessage)
    }
  }

  return bot
}
