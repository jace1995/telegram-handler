import * as tt from 'telegraf/typings/telegram-types'
import { TelegrafContext } from 'telegraf/typings/context'
import { PhotoSize } from 'telegraf/typings/telegram-types'

export interface ContextChat extends TelegrafContext {
  chat: tt.Chat
}

export interface ContextText extends ContextChat {
  message: tt.Message & { text: string }
}

export interface ContextCommand extends ContextText {
  data?: string
}

export interface ContextButton<Data = undefined> extends ContextChat {
  data: Data
  callbackQuery: tt.CallbackQuery
}

export interface ContextPhoto extends ContextChat {
  message: tt.Message & { photo: PhotoSize[] }
}

export interface ContextDocument extends ContextChat {
  message: tt.Message & { document: Document }
}
