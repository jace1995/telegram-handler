import Telegraf from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import { TelegramAction } from '../types/actions'
import { ApiInterface } from '../types/api'
import { AppContext } from '../types/handlers'
import { ContextErrorHandlerProvider } from './error-handler'
import { TelegramBotSettings } from './start'

export type Event = (action: TelegramAction, ctx?: AppContext) => void

type TelegramEvents = Parameters<Telegraf<TelegrafContext>['on']>[0]

export const attachBotEventsHandlers = (
  bot: Telegraf<TelegrafContext>,
  api: ApiInterface,
  handlers: Partial<Record<TelegramAction, unknown>>,
  errorHandler: ContextErrorHandlerProvider,
  onEvent: TelegramBotSettings['onEvent'],
  onAuth: TelegramBotSettings['onAuth'],
  emit: Event,
) => {
  const createContext = async (telegram: TelegrafContext) => {
    const id = telegram.chat?.id

    if (!id) {
      throw new Error(`chat id not found`)
    }

    if (telegram.callbackQuery) {
      telegram.answerCbQuery().catch(console.error)
    }

    const ctx = telegram as AppContext
    ctx.api = api

    if (onEvent) {
      const passed = await onEvent(ctx, errorHandler(ctx))

      if (!passed) {
        return
      }
    }

    ctx.user = await api.auth(id)

    if (onAuth) {
      const passed = await onAuth(ctx, errorHandler)

      if (!passed) {
        return
      }
    }

    return ctx
  }

  const attach = (action: TelegramAction, event: TelegramEvents) => {
    if (action in handlers) {
      bot.on(event, async telegram => (
        emit(action, await createContext(telegram))
      ))
    }
  }

  if (TelegramAction.text in handlers || TelegramAction.command in handlers) {
    bot.on('text', async telegram => {
      if (TelegramAction.command in handlers && telegram.message?.text?.startsWith('/')) {
        return emit(TelegramAction.command, await createContext(telegram))
      }
      else if (TelegramAction.text in handlers) {
        return emit(TelegramAction.text, await createContext(telegram))
      }
    })
  }

  attach(TelegramAction.button, 'callback_query')
  attach(TelegramAction.photo, 'photo')
  attach(TelegramAction.document, 'document')
}

// TODO: add types

// 'new_chat_members' (join)
// 'left_chat_member' (leave)
// 'contact'
// 'location'

// x
// 'game'

// type _actions_ =

// // UpdateType
//   'channel_post' |
//   'chosen_inline_result' |
//   'edited_channel_post' |
//   'edited_message' |
//   'inline_query' |
//   'message' |
//   'pre_checkout_query' |
//   'shipping_query' |
//   'poll' |
//   'poll_answer' |

// // MessageSubTypes
//   'voice' |
//   'video_note' |
//   'video' |
//   'venue' |
//   'supergroup_chat_created' |
//   'successful_payment' |
//   'sticker' |
//   'pinned_message' |
//   'new_chat_title' |
//   'new_chat_photo' |
//   'migrate_to_chat_id' |
//   'migrate_from_chat_id' |
//   'invoice' |
//   'group_chat_created' |
//   'delete_chat_photo' |
//   'contact' |
//   'channel_chat_created' |
//   'audio' |
//   'passport_data' |
//   'connected_website' |
//   'animation'
