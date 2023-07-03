import { safeEnvVar } from "utils"
import debug from "./utils/debug.js"
import request from "./utils/request.js"
import type { TelegramApiResponse, Chat } from "shared-types"

export default async function getChat(chatId: number): Promise<Chat> {
  debug(`\n🌀 Fetching Telegram chat details for '${chatId}'`)
  const botToken = safeEnvVar("TELEGRAM_BOT_TOKEN")

  let response
  try {
    response = await request<TelegramApiResponse<Chat>>(
      `https://api.telegram.org/bot${botToken}/getChat`,
      {
        chat_id: chatId,
      }
    )

    debug(`✅ Successfully fetched chat details for '${chatId}'`)
  } catch (error) {
    debug(`❌ Unexpected Error getting chat details for '${chatId}'`, error)
    throw error
  }

  if (response.ok) {
    return response.result
  } else {
    throw new Error(
      `Error response while fetching chat details from Telegram: ${response}`
    )
  }
}
