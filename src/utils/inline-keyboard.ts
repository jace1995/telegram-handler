import { ExtraReplyMessage, InlineKeyboardButton } from 'telegraf/typings/telegram-types'

export type InlineKeyboard = InlineKeyboardButton | InlineKeyboardButton[] | InlineKeyboardButton[][]

export const inlineKeyboard = (buttons: InlineKeyboard): ExtraReplyMessage => ({
  reply_markup: {
    inline_keyboard: Array.isArray(buttons) ?
      (
        Array.isArray(buttons[0]) ?
          (buttons as InlineKeyboardButton[][]) :
          ([buttons] as InlineKeyboardButton[][])
      ) :
      [[buttons]]
  }
})
