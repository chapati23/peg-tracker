import debug from "./utils/debug.js"
import escapeMarkdown from "./utils/escapeMarkdown.js"
import request from "./utils/request.js"
import type { TelegramApiResponse } from "shared-types"

type Response = { messageId: number; date: number }

export default async function sendChatMsg(
  message: string,
  chatId: string,
  options: { parseMode: "HTML" | "MarkdownV2" } = { parseMode: "MarkdownV2" }
): Promise<Response> {
  debug(`\n🌀 Sending update to Telegram chat: ${chatId}`)

  let response

  try {
    response = await request<TelegramApiResponse<Response>>(
      `https://api.telegram.org/bot${process.env["TELEGRAM_BOT_TOKEN"]}/sendMessage`,
      {
        chat_id: chatId,
        text:
          options.parseMode === "MarkdownV2"
            ? escapeMarkdown(message)
            : message,
        parse_mode: options.parseMode,
      }
    )

    debug(`✅ Successfully sent message to Telegram chat '${chatId}'`)
  } catch (error) {
    debug(`❌ Unexpected Error sending message to': '${chatId}'`, error)
    throw error
  }

  if (response.ok) {
    return response.result
  } else {
    throw new Error(`Bad API response while sending message: ${response}`)
  }
}
